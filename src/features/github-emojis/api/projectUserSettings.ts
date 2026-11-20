import { emojiSections, type EmojiSection } from '../model/emoji'
import type { UserSettings, UserSettingsPatch } from '../model/settings'
import type { UNLanguage } from '../model/emojiSearchRoutes'
import {
  loadLocalConfig,
  loadSavedUserSettings,
  mergeUserSettings,
  saveLocalConfig,
  saveUserSettings,
} from './localData'
import {
  chooseProjectPublicDirectory,
  getSavedProjectPublicDirectory,
  hasProjectFileAccess,
  readProjectJsonFile,
  writeProjectJsonFile,
  type ProjectDirectoryHandle,
} from './projectFileAccess'

const userSettingsFileName = 'user_settings.json'
const languages: UNLanguage[] = ['ar', 'zh', 'en', 'fr', 'ru', 'es']

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function validateUserSettings(value: unknown): UserSettingsPatch {
  if (!isRecord(value)) {
    throw new Error('The project user settings file must contain a JSON object.')
  }
  if (value.id !== undefined && value.id !== 'user_settings') {
    throw new Error('The project settings file must use the "user_settings" profile id.')
  }
  if (value.language !== undefined && !languages.includes(value.language as UNLanguage)) {
    throw new Error('The project user settings file contains an unsupported language.')
  }
  if (value.categories !== undefined && !isRecord(value.categories)) {
    throw new Error('The categories field in project user settings must be an object.')
  }

  const categories: Partial<UserSettings['categories']> = {}
  const sourceCategories = isRecord(value.categories) ? value.categories : {}
  for (const section of emojiSections) {
    const preference = sourceCategories[section]
    if (preference === undefined) {
      continue
    }
    if (
      !isRecord(preference) ||
      typeof preference.show !== 'boolean' ||
      typeof preference.dim !== 'boolean'
    ) {
      throw new Error(`The "${section}" preference must contain boolean "show" and "dim" values.`)
    }
    categories[section as EmojiSection] = {
      show: preference.show,
      dim: preference.dim,
    }
  }

  return {
    id: 'user_settings',
    language: value.language as UNLanguage | undefined,
    categories,
  }
}

type UserSettingsFileMeta = {
  /** JSON of the project file at the moment it was last applied or saved. */
  fileSignature: string
}

const userSettingsMetaKey = 'userSettingsFileMeta'

async function readUserSettingsFile(
  directory: ProjectDirectoryHandle | undefined,
): Promise<{ value: unknown; signature: string } | undefined> {
  if (directory) {
    const value = await readProjectJsonFile<unknown>(directory, userSettingsFileName)
    return value === undefined ? undefined : { value, signature: JSON.stringify(value) }
  }

  const response = await fetch(`${import.meta.env.BASE_URL}${userSettingsFileName}`, {
    cache: 'no-store',
    headers: { Accept: 'application/json' },
  })
  if (response.status === 404) {
    return undefined
  }
  if (!response.ok) {
    throw new Error(`Could not read the project user settings: ${response.status}`)
  }
  if (!response.headers.get('content-type')?.includes('application/json')) {
    return undefined
  }

  const value: unknown = await response.json()
  return { value, signature: JSON.stringify(value) }
}

export async function loadProjectUserSettings(
  fallback: UserSettings,
): Promise<UserSettings> {
  const directory = await getSavedProjectPublicDirectory()
  const file = await readUserSettingsFile(directory)
  const savedBrowserSettings = await loadSavedUserSettings()
  const meta = await loadLocalConfig<UserSettingsFileMeta | undefined>(
    userSettingsMetaKey,
    undefined,
  )

  // A changed file means the user edited it by hand, so it wins over a saved
  // browser copy. Otherwise the browser copy keeps changes made in the gear menu.
  if (file && (!savedBrowserSettings || !meta || meta.fileSignature !== file.signature)) {
    const settings = mergeUserSettings(fallback, validateUserSettings(file.value))
    await saveUserSettings(settings)
    await saveLocalConfig(userSettingsMetaKey, {
      fileSignature: file.signature,
    } satisfies UserSettingsFileMeta)
    return settings
  }

  return savedBrowserSettings
    ? mergeUserSettings(fallback, savedBrowserSettings)
    : fallback
}

export async function connectProjectSettings(
  currentSettings: UserSettings,
  fallback: UserSettings,
): Promise<UserSettings> {
  const directory = await chooseProjectPublicDirectory()
  const file = await readUserSettingsFile(directory)
  const settings = file
    ? mergeUserSettings(fallback, validateUserSettings(file.value))
    : currentSettings
  await saveUserSettings(settings)
  await writeProjectJsonFile(directory, userSettingsFileName, settings)
  await saveLocalConfig(userSettingsMetaKey, {
    fileSignature: JSON.stringify(settings),
  } satisfies UserSettingsFileMeta)
  return settings
}

export async function saveProjectUserSettings(
  settings: UserSettings,
): Promise<boolean> {
  await saveUserSettings(settings)
  const directory = await getSavedProjectPublicDirectory()
  if (directory) {
    await writeProjectJsonFile(directory, userSettingsFileName, settings)
    await saveLocalConfig(userSettingsMetaKey, {
      fileSignature: JSON.stringify(settings),
    } satisfies UserSettingsFileMeta)
    return true
  }

  // No folder handle: keep the signature of the served file. A later manual
  // file edit changes that signature and is picked up on the next launch.
  const file = await readUserSettingsFile(undefined)
  if (file) {
    await saveLocalConfig(userSettingsMetaKey, {
      fileSignature: file.signature,
    } satisfies UserSettingsFileMeta)
  }
  return false
}

export { hasProjectFileAccess }
