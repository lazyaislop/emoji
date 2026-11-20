import type {
  SectionPreference,
  SettingsProfileId,
  TeamSettings,
  UserSettings,
  UserSettingsPatch,
} from '../model/settings'
import type { CommunityEmojiSearchRoute } from '../model/emojiSearchRoutes'

const databaseName = 'gh-emoji-local'
const databaseVersion = 1
const emojiStoreName = 'emojiCatalog'
const configStoreName = 'localConfig'
const emojiBackupNamesKey = 'gh-emoji-catalog-names'
const emojiBackupEntryPrefix = 'gh-emoji-catalog-entry:'

type StoredEmoji = {
  name: string
  url: string
}

type StoredConfig<T> = {
  key: string
  value: T
}

type SavedTeamPreferences = {
  categories: Record<string, SectionPreference>
}

export type EmojiDataChanges = {
  added: number
  updated: number
  removed: number
}

let databasePromise: Promise<IDBDatabase> | undefined

function readEmojiBackup(): Record<string, string> {
  const rawNames = localStorage.getItem(emojiBackupNamesKey)
  if (!rawNames) {
    return {}
  }

  const names: unknown = JSON.parse(rawNames)
  if (!Array.isArray(names) || !names.every((name) => typeof name === 'string')) {
    throw new Error('The saved emoji backup index is invalid.')
  }

  return Object.fromEntries(
    names.map((name: string) => {
      const url = localStorage.getItem(`${emojiBackupEntryPrefix}${encodeURIComponent(name)}`)
      if (!url) {
        throw new Error(`The saved emoji backup is missing "${name}".`)
      }
      return [name, url]
    }),
  )
}

function updateEmojiBackup(
  emojiData: Record<string, string>,
  changedNames: string[],
  removedNames: string[],
) {
  const rawNames = localStorage.getItem(emojiBackupNamesKey)
  if (rawNames === null) {
    for (const [name, url] of Object.entries(emojiData)) {
      localStorage.setItem(
        `${emojiBackupEntryPrefix}${encodeURIComponent(name)}`,
        url,
      )
    }
    localStorage.setItem(emojiBackupNamesKey, JSON.stringify(Object.keys(emojiData)))
    return
  }

  const previousNames: unknown = JSON.parse(rawNames)
  if (!Array.isArray(previousNames) || !previousNames.every((name) => typeof name === 'string')) {
    throw new Error('The saved emoji backup index is invalid.')
  }

  const names = new Set<string>(previousNames)
  for (const name of changedNames) {
    const url = emojiData[name]
    if (url !== undefined) {
      localStorage.setItem(
        `${emojiBackupEntryPrefix}${encodeURIComponent(name)}`,
        url,
      )
      names.add(name)
    }
  }

  for (const name of removedNames) {
    localStorage.removeItem(`${emojiBackupEntryPrefix}${encodeURIComponent(name)}`)
    names.delete(name)
  }

  localStorage.setItem(emojiBackupNamesKey, JSON.stringify([...names]))
}

function openDatabase(): Promise<IDBDatabase> {
  if (!('indexedDB' in globalThis)) {
    return Promise.reject(new Error('IndexedDB is unavailable in this browser.'))
  }

  if (!databasePromise) {
    databasePromise = new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open(databaseName, databaseVersion)
      request.onupgradeneeded = () => {
        const database = request.result
        database.createObjectStore(emojiStoreName, { keyPath: 'name' })
        database.createObjectStore(configStoreName, { keyPath: 'key' })
      }
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error ?? new Error('Could not open local storage.'))
      request.onblocked = () => reject(new Error('Local storage upgrade is blocked by another tab.'))
    }).catch((error: unknown) => {
      databasePromise = undefined
      throw error
    })
  }

  return databasePromise
}

export async function loadEmojiSnapshot(): Promise<Record<string, string>> {
  let savedData: Record<string, string> = {}
  let databaseError: unknown
  try {
    const database = await openDatabase()

    savedData = await new Promise<Record<string, string>>((resolve, reject) => {
      const transaction = database.transaction(emojiStoreName, 'readonly')
      const request = transaction.objectStore(emojiStoreName).getAll() as IDBRequest<StoredEmoji[]>
      request.onsuccess = () => {
        resolve(Object.fromEntries(request.result.map(({ name, url }) => [name, url])))
      }
      request.onerror = () => reject(request.error ?? new Error('Could not read the saved emoji catalog.'))
      transaction.onabort = () => reject(transaction.error ?? new Error('Could not read the saved emoji catalog.'))
    })
  } catch (error) {
    databaseError = error
  }

  if (Object.keys(savedData).length > 0) {
    return savedData
  }

  try {
    return readEmojiBackup()
  } catch (backupError) {
    if (databaseError) {
      throw new AggregateError(
        [databaseError, backupError],
        'Could not read the saved emoji catalog from local storage.',
      )
    }
    console.error('Could not read the emoji backup:', backupError)
    return {}
  }
}

export async function saveEmojiSnapshot(
  emojiData: Record<string, string>,
): Promise<EmojiDataChanges> {
  const database = await openDatabase()

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(emojiStoreName, 'readwrite')
    const store = transaction.objectStore(emojiStoreName)
    const request = store.getAll() as IDBRequest<StoredEmoji[]>
    const changes: EmojiDataChanges = { added: 0, updated: 0, removed: 0 }
    const changedNames: string[] = []
    const removedNames: string[] = []

    request.onsuccess = () => {
      const existing = new Map(request.result.map(({ name, url }) => [name, url]))

      for (const [name, url] of Object.entries(emojiData)) {
        const previousUrl = existing.get(name)
        if (previousUrl === undefined) {
          changes.added += 1
          changedNames.push(name)
          store.put({ name, url } satisfies StoredEmoji)
        } else {
          existing.delete(name)
          if (previousUrl !== url) {
            changes.updated += 1
            changedNames.push(name)
            store.put({ name, url } satisfies StoredEmoji)
          }
        }
      }

      for (const name of existing.keys()) {
        changes.removed += 1
        removedNames.push(name)
        store.delete(name)
      }
    }

    request.onerror = () => reject(request.error ?? new Error('Could not compare the saved emoji catalog.'))
    transaction.oncomplete = () => {
      try {
        updateEmojiBackup(emojiData, changedNames, removedNames)
      } catch (error) {
        console.error('Could not update the emoji backup:', error)
      }
      resolve(changes)
    }
    transaction.onerror = () => reject(transaction.error ?? new Error('Could not save the emoji catalog.'))
    transaction.onabort = () => reject(transaction.error ?? new Error('Could not save the emoji catalog.'))
  })
}

export async function loadLocalConfig<T>(key: string, fallback: T): Promise<T> {
  const database = await openDatabase()

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(configStoreName, 'readonly')
    const request = transaction.objectStore(configStoreName).get(key) as IDBRequest<StoredConfig<T> | undefined>
    request.onsuccess = () => resolve(request.result?.value ?? fallback)
    request.onerror = () => reject(request.error ?? new Error(`Could not read local setting "${key}".`))
    transaction.onabort = () => reject(transaction.error ?? new Error(`Could not read local setting "${key}".`))
  })
}

export async function saveLocalConfig<T>(key: string, value: T): Promise<void> {
  const database = await openDatabase()

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(configStoreName, 'readwrite')
    transaction.objectStore(configStoreName).put({ key, value } satisfies StoredConfig<T>)
    transaction.oncomplete = () => resolve()
    transaction.onerror = () => reject(transaction.error ?? new Error(`Could not save local setting "${key}".`))
    transaction.onabort = () => reject(transaction.error ?? new Error(`Could not save local setting "${key}".`))
  })
}

export async function loadSavedUserSettings(): Promise<UserSettingsPatch | undefined> {
  return loadLocalConfig<UserSettingsPatch | undefined>(
    'userSettings',
    undefined,
  )
}

export function mergeUserSettings(
  fallback: UserSettings,
  saved: UserSettingsPatch | undefined,
): UserSettings {
  return {
    ...fallback,
    ...saved,
    id: 'user_settings',
    language: saved?.language ?? fallback.language,
    categories: { ...fallback.categories, ...saved?.categories },
  }
}

export async function loadUserSettings(fallback: UserSettings): Promise<UserSettings> {
  return mergeUserSettings(fallback, await loadSavedUserSettings())
}

export async function saveUserSettings(settings: UserSettings): Promise<void> {
  return saveLocalConfig('userSettings', settings)
}

export async function loadTeamSettings(fallback: TeamSettings): Promise<TeamSettings> {
  const saved = await loadLocalConfig<SavedTeamPreferences | undefined>(
    `teamSettings:${fallback.id}`,
    undefined,
  )
  if (!saved) {
    return fallback
  }

  return {
    ...fallback,
    categories: fallback.categories.map((category) => ({
      ...category,
      ...saved.categories?.[category.id],
    })),
  }
}

export async function saveTeamSettings(settings: TeamSettings): Promise<void> {
  const categories = Object.fromEntries(
    settings.categories.map(({ id, show, dim }) => [id, { show, dim }]),
  )

  return saveLocalConfig(`teamSettings:${settings.id}`, {
    categories,
  } satisfies SavedTeamPreferences)
}

export async function loadSettingsProfile(
  profileIds: SettingsProfileId[],
): Promise<SettingsProfileId> {
  const savedProfile = await loadLocalConfig<SettingsProfileId | undefined>(
    'activeSettingsProfile',
    undefined,
  )
  if (savedProfile && profileIds.includes(savedProfile)) {
    return savedProfile
  }

  const legacyProfile = await loadLocalConfig<string | undefined>(
    'settingsProfile',
    undefined,
  )
  if (legacyProfile === 'team' && profileIds.length > 1) {
    return profileIds.find((profileId) => profileId !== 'default' && profileId !== 'user_settings')
      ?? 'default'
  }
  if (legacyProfile === 'user' && profileIds.includes('user_settings')) {
    return 'user_settings'
  }

  return profileIds.includes('default') ? 'default' : profileIds[0] ?? 'user_settings'
}

export async function loadCommunityRoutes(
  fallback: CommunityEmojiSearchRoute[],
): Promise<CommunityEmojiSearchRoute[]> {
  return loadLocalConfig('communityEmojiSearchRoutes', fallback)
}

export async function saveCommunityRoutes(routes: CommunityEmojiSearchRoute[]): Promise<void> {
  return saveLocalConfig('communityEmojiSearchRoutes', routes)
}
