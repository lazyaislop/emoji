import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  loadCommunityRoutes,
  loadTeamSettings,
  loadSettingsProfile,
  saveLocalConfig,
  saveTeamSettings,
} from '../api/localData'
import {
  fetchGhEmojiCatalog,
  fetchGhEmojiData,
  getGhEmojiData,
  refreshGhEmojiData,
} from '../api/getGhEmojiData'
import {
  getProjectEmojiImageUrls,
  loadProjectEmojiCache,
  rebuildProjectEmojiCache,
  refreshConnectedProjectEmojiCache,
} from '../api/projectEmojiCache'
import {
  connectProjectSettings,
  hasProjectFileAccess,
  loadProjectUserSettings,
  saveProjectUserSettings,
} from '../api/projectUserSettings'
import { loadTeamProfileDefaults } from '../api/projectTeamProfiles'
import {
  emojiSections,
  getEmojiCopyValue,
  type EmojiSection,
} from '../model/emoji'
import {
  communityEmojiSearchRoutes,
  emojiSearchRoutes,
  type UNLanguage,
} from '../model/emojiSearchRoutes'
import {
  buildEmojiSearchIndex,
  searchEmojiIndex,
  type EmojiSearchEntry,
} from '../model/emojiSearch'
import {
  type DefaultSettings,
  type SectionPreference,
  type SettingsProfileId,
  type TeamSettings,
  type UserSettings,
} from '../model/settings'
import {
  formatCount,
  languageNames,
  translate,
  translateSection,
  writeUiLanguage,
} from '../model/localization'
import { defaultSettings } from '../model/profiles/default'
import { userSettings as defaultUserSettings } from '../model/profiles/user_settings'

const teamProfileModules = import.meta.glob<{ teamSettings: TeamSettings }>(
  '../model/profiles/*_team.ts',
  { eager: true },
)
const defaultTeamSettings = Object.values(teamProfileModules)
  .map(({ teamSettings }) => teamSettings)
  .sort((left, right) => left.id.localeCompare(right.id))

function updatePreference(
  current: Record<EmojiSection, SectionPreference>,
  section: EmojiSection,
  key: keyof SectionPreference,
  value: boolean,
): Record<EmojiSection, SectionPreference> {
  return {
    ...current,
    [section]: {
      ...current[section],
      [key]: value,
    },
  }
}

function mergeEmojiData(
  current: Record<string, string>,
  next: Record<string, string>,
): Record<string, string> {
  const merged = { ...current }
  let changed = false

  for (const [name, url] of Object.entries(next)) {
    if (current[name] !== url) {
      merged[name] = url
      changed = true
    }
  }

  for (const name of Object.keys(current)) {
    if (!Object.hasOwn(next, name)) {
      delete merged[name]
      changed = true
    }
  }

  return changed ? merged : current
}

type InitialData = {
  emojiData: Record<string, string>
  imageUrls: Record<string, string>
  hasProjectCache: boolean
  refreshInBackground: boolean
  userSettings: UserSettings
  teamSettings: TeamSettings[]
  settingsProfile: SettingsProfileId
  communityRoutes: typeof communityEmojiSearchRoutes
  projectFilesConnected: boolean
}

let initialDataPromise: Promise<InitialData> | undefined
let initialDataResult: InitialData | undefined

function readInitialData(): InitialData {
  if (!initialDataPromise) {
    initialDataPromise = Promise.all([
      getGhEmojiData(),
      loadProjectUserSettings(defaultUserSettings),
      loadTeamProfileDefaults(defaultTeamSettings).then((profiles) =>
        Promise.all(profiles.map(loadTeamSettings)),
      ),
      loadSettingsProfile([
        defaultSettings.id,
        defaultUserSettings.id,
        ...defaultTeamSettings.map(({ id }) => id),
      ]),
      loadCommunityRoutes(communityEmojiSearchRoutes),
      hasProjectFileAccess(),
    ])
      .then(
        ([
          emojiCatalog,
          userSettings,
          teamSettings,
          settingsProfile,
          communityRoutes,
          projectFilesConnected,
        ]) => {
        initialDataResult = {
          emojiData: emojiCatalog.data,
          imageUrls: emojiCatalog.imageUrls,
          hasProjectCache: emojiCatalog.hasProjectCache,
          refreshInBackground: emojiCatalog.refreshInBackground,
          userSettings,
          teamSettings,
          settingsProfile,
          communityRoutes,
          projectFilesConnected,
        }
        return initialDataResult
        },
      )
      .catch((error: unknown) => {
        initialDataPromise = undefined
        throw error
      })
  }

  if (initialDataResult) {
    return initialDataResult
  }

  throw initialDataPromise
}

const languages = Object.entries(languageNames) as [UNLanguage, string][]

type DisplayCategory = {
  id: string
  name: string
  show: boolean
  dim: boolean
  hasHeading: boolean
  emojis: EmojiSearchEntry[]
}

export type EmojiGridProps = {
  emojis: EmojiSearchEntry[]
  imageUrls: Record<string, string>
  language: UNLanguage
  dimmed: boolean
  onCopyMessage: (message: string) => void
}

export function EmojiGrid({
  emojis,
  imageUrls,
  language,
  dimmed,
  onCopyMessage,
}: EmojiGridProps) {
  async function copyEmoji(name: string, url: string) {
    const copyValue = getEmojiCopyValue(name, url)
    if (!navigator.clipboard?.writeText) {
      onCopyMessage(translate(language, 'clipboardUnavailable'))
      return
    }

    try {
      await navigator.clipboard.writeText(copyValue)
      onCopyMessage(translate(language, 'copied', { value: copyValue }))
    } catch {
      onCopyMessage(translate(language, 'copyFailed'))
    }
  }

  return (
    <div className={`emoji-grid${dimmed ? ' is-dimmed' : ''}`}>
      {emojis.map(({ name, url }) => (
        <button
          key={name}
          className="emoji-copy-button"
          type="button"
          aria-label={translate(language, 'copyLabel', {
            name: name.replaceAll('_', ' '),
          })}
          title={`:${name}:`}
          onClick={() => void copyEmoji(name, url)}
        >
          <img src={imageUrls[name] ?? url} alt="" loading="lazy" decoding="async" />
        </button>
      ))}
    </div>
  )
}

export function EmojiGhView() {
  const initialData = readInitialData()
  const [emojiData, setEmojiData] = useState(initialData.emojiData)
  const [imageUrls, setImageUrls] = useState(initialData.imageUrls)
  const [hasProjectCache, setHasProjectCache] = useState(initialData.hasProjectCache)
  const [query, setQuery] = useState('')
  const [copyStatus, setCopyStatus] = useState<{
    language: UNLanguage
    message: string
  }>()
  const [catalogError, setCatalogError] = useState('')
  const [userSettings, setUserSettings] = useState(initialData.userSettings)
  const [teamSettings, setTeamSettings] = useState(initialData.teamSettings)
  const [settingsProfile, setSettingsProfile] = useState(initialData.settingsProfile)
  const [projectFilesConnected, setProjectFilesConnected] = useState(
    initialData.projectFilesConnected,
  )
  const [cacheStatus, setCacheStatus] = useState('')
  const [projectFilesStatus, setProjectFilesStatus] = useState('')
  const [isRebuildingCache, setIsRebuildingCache] = useState(false)
  const [isConnectingProjectFiles, setIsConnectingProjectFiles] = useState(false)
  const [communityRoutes] = useState(initialData.communityRoutes)
  const activeTeam = teamSettings.find(({ id }) => id === settingsProfile)
  const activeUserSettings: UserSettings | DefaultSettings =
    settingsProfile === defaultSettings.id ? defaultSettings : userSettings
  // Language always comes from the user settings profile, even while the
  // hidden default profile or a team profile is active. Only emojis and
  // category preferences come from the active profile.
  const activeLanguage = userSettings.language
  const languageRef = useRef(activeLanguage)
  const t = (key: Parameters<typeof translate>[1], parameters?: Parameters<typeof translate>[2]) =>
    translate(activeLanguage, key, parameters)
  const sectionName = (section: EmojiSection) => translateSection(activeLanguage, section)
  const copyMessage = copyStatus?.language === activeLanguage ? copyStatus.message : t('copyIdle')
  const handleCopyMessage = useCallback(
    (message: string) => setCopyStatus({ language: activeLanguage, message }),
    [activeLanguage],
  )
  const emojiIndex = useMemo(() => buildEmojiSearchIndex(emojiData), [emojiData])
  const searchResults = useMemo(
    () =>
      searchEmojiIndex(emojiIndex, query, [
        ...emojiSearchRoutes,
        ...communityRoutes,
      ]),
    [communityRoutes, emojiIndex, query],
  )

  useEffect(() => {
    languageRef.current = activeLanguage
    document.documentElement.lang = activeLanguage
    document.documentElement.dir = activeLanguage === 'ar' ? 'rtl' : 'ltr'
    writeUiLanguage(activeLanguage)
  }, [activeLanguage])

  useEffect(() => {
    if (!initialData.refreshInBackground) {
      return
    }

    let active = true
    const refresh = initialData.hasProjectCache
      ? refreshConnectedProjectEmojiCache(fetchGhEmojiCatalog, () => {}).then((result) => {
          if (!active || !result) {
            return
          }
          setEmojiData((current) => mergeEmojiData(current, result.cache.catalog))
          setImageUrls(getProjectEmojiImageUrls(result.cache))
        })
      : refreshGhEmojiData().then(({ data, changes }) => {
          if (!active) {
            return
          }
          const changedCount = changes.added + changes.updated + changes.removed
          if (changedCount > 0) {
            setEmojiData((current) => mergeEmojiData(current, data))
          }
        })

    void refresh.catch((error: unknown) => {
      if (active) {
        const reason = error instanceof Error ? error.message : translate(languageRef.current, 'unknownError')
        setCatalogError(
          translate(languageRef.current, 'catalogRefreshFailed', { error: reason }),
        )
      }
    })

    return () => {
      active = false
    }
  }, [initialData.hasProjectCache, initialData.refreshInBackground])

  useEffect(() => {
    if (settingsProfile !== defaultUserSettings.id) {
      return
    }

    void saveProjectUserSettings(userSettings).catch((error: unknown) => {
      const reason = error instanceof Error ? error.message : translate(languageRef.current, 'unknownError')
      setCatalogError(
        translate(languageRef.current, 'userSettingsSaveFailed', { error: reason }),
      )
    })
  }, [settingsProfile, userSettings])

  useEffect(() => {
    if (!activeTeam) {
      return
    }

    void saveTeamSettings(activeTeam).catch((error: unknown) => {
      const reason = error instanceof Error ? error.message : translate(languageRef.current, 'unknownError')
      setCatalogError(
        translate(languageRef.current, 'teamSettingsSaveFailed', {
          profile: activeTeam.id,
          error: reason,
        }),
      )
    })
  }, [activeTeam])

  useEffect(() => {
    void saveLocalConfig('activeSettingsProfile', settingsProfile).catch((error: unknown) => {
      const reason = error instanceof Error ? error.message : translate(languageRef.current, 'unknownError')
      setCatalogError(
        translate(languageRef.current, 'activeProfileSaveFailed', { error: reason }),
      )
    })
  }, [settingsProfile])

  async function refreshProjectCacheStatus() {
    try {
      const cache = await loadProjectEmojiCache()
      setProjectFilesConnected(await hasProjectFileAccess())
      setHasProjectCache(Boolean(cache))
      setCacheStatus('')
      if (cache) {
        setEmojiData(cache.catalog)
        setImageUrls(getProjectEmojiImageUrls(cache))
      } else {
        setImageUrls({})
      }
    } catch (error) {
      const reason = error instanceof Error ? error.message : translate(languageRef.current, 'unknownError')
      setCacheStatus(translate(activeLanguage, 'cacheReadFailed', { error: reason }))
    }
  }

  async function rebuildCache() {
    setCacheStatus(t('cacheSelectFolder'))
    setIsRebuildingCache(true)
    try {
      await rebuildProjectEmojiCache(fetchGhEmojiData, ({ completed, total }) => {
        setCacheStatus(
          total === 0
            ? t('cacheUpdating')
            : t('cacheBuildingProgress', {
                completed: formatCount(activeLanguage, completed),
                total: formatCount(activeLanguage, total),
              }),
        )
      })
      const cache = await loadProjectEmojiCache()
      if (!cache) {
        throw new Error(t('cacheWrongFolder'))
      }
      setEmojiData(cache.catalog)
      setImageUrls(getProjectEmojiImageUrls(cache))
      setHasProjectCache(true)
      setProjectFilesConnected(await hasProjectFileAccess())
      setCacheStatus(t('cacheReady'))
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        setCacheStatus('')
      } else {
        const reason = error instanceof Error ? error.message : translate(languageRef.current, 'unknownError')
        setCacheStatus(t('cacheBuildFailed', { error: reason }))
      }
    } finally {
      setIsRebuildingCache(false)
    }
  }

  async function connectProjectFiles() {
    setProjectFilesStatus(t('projectFilesChoose'))
    setIsConnectingProjectFiles(true)
    try {
      const settings = await connectProjectSettings(userSettings, defaultUserSettings)
      setUserSettings(settings)
      setProjectFilesConnected(true)
      setProjectFilesStatus(t('projectFilesConnected'))
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        setProjectFilesStatus('')
      } else {
        const reason = error instanceof Error ? error.message : translate(languageRef.current, 'unknownError')
        setProjectFilesStatus(t('projectFilesConnectFailed', { error: reason }))
      }
    } finally {
      setIsConnectingProjectFiles(false)
    }
  }

  function updateCategoryPreference(
    categoryId: string,
    key: keyof SectionPreference,
    value: boolean,
  ) {
    if (activeTeam) {
      setTeamSettings((current) =>
        current.map((team) =>
          team.id === activeTeam.id
            ? {
                ...team,
                categories: team.categories.map((category) =>
                  category.id === categoryId
                    ? { ...category, [key]: value }
                    : category,
                ),
              }
            : team,
        ),
      )
      return
    }

    const section = emojiSections.find((value) => value === categoryId)
    if (section) {
      setSettingsProfile(defaultUserSettings.id)
      setUserSettings({
        ...activeUserSettings,
        id: defaultUserSettings.id,
        language: userSettings.language,
        categories: updatePreference(activeUserSettings.categories, section, key, value),
      })
    }
  }

  function updateActiveLanguage(language: UNLanguage) {
    setSettingsProfile(defaultUserSettings.id)
    setUserSettings({
      ...activeUserSettings,
      id: defaultUserSettings.id,
      language,
    })
  }

  const searchResultsByName = new Map(searchResults.map((emoji) => [emoji.name, emoji]))
  const configuredCategories: DisplayCategory[] = activeTeam
    ? activeTeam.categories.length > 0
      ? activeTeam.categories.map((category) => ({
          id: category.id,
          name: category.name,
          show: category.show,
          dim: category.dim,
          hasHeading: true,
          emojis: category.emojiNames.flatMap((name) => {
            const emoji = searchResultsByName.get(name)
            return emoji ? [emoji] : []
          }),
        }))
      : [
          {
            id: activeTeam.id,
            name: activeTeam.id,
            show: true,
            dim: false,
            hasHeading: false,
            emojis: (activeTeam.emojiNames ?? []).flatMap((name) => {
              const emoji = searchResultsByName.get(name)
              return emoji ? [emoji] : []
            }),
          },
        ]
    : emojiSections.map((section) => ({
        id: section,
        name: sectionName(section),
        show: activeUserSettings.categories[section].show,
        dim: activeUserSettings.categories[section].dim,
        hasHeading: section !== 'Other',
        emojis: searchResults.filter((emoji) => emoji.section === section),
      }))
  const visibleCategoryCount = configuredCategories.filter(
    (category) => category.show && category.emojis.length > 0,
  ).length
  const displayCategories = configuredCategories.map((category) => ({
    ...category,
    hasHeading: visibleCategoryCount === 1 ? false : category.hasHeading,
  }))
  const visibleResultCount = displayCategories.reduce(
    (total, category) => total + (category.show ? category.emojis.length : 0),
    0,
  )
  const categoryControls = activeTeam
    ? activeTeam.categories.map(({ id, name, show, dim }) => ({
        id,
        name,
        show,
        dim,
      }))
    : emojiSections.map((section) => ({
        id: section,
        name: sectionName(section),
        show: activeUserSettings.categories[section].show,
        dim: activeUserSettings.categories[section].dim,
      }))
  const settingsProfiles = [
    defaultUserSettings.id,
    ...teamSettings.map(({ id }) => id),
  ]

  return (
    <main
      className="emoji-view"
      lang={activeLanguage}
      dir={activeLanguage === 'ar' ? 'rtl' : 'ltr'}
    >
        <div className="app-layout">
          <section className="search-panel" aria-label={t('searchRegionLabel')}>
            <header className="app-header">
              <h1>{t('appTitle')}</h1>
              <p className="copy-status" role="status" aria-live="polite">
                {copyMessage}
              </p>
              <span
                className="total-count desktop-total-count"
                aria-label={t('visibleEmojiCount', {
                  count: formatCount(activeLanguage, visibleResultCount),
                })}
              >
                {formatCount(activeLanguage, visibleResultCount)}
              </span>
            </header>
            {catalogError && (
              <p className="catalog-status" role="status" aria-live="polite">
                {catalogError}
              </p>
            )}

            <div className="search-controls">
              <div className="search-field" role="search">
                <svg aria-hidden="true" viewBox="0 0 24 24">
                  <circle cx="10.8" cy="10.8" r="6.8" />
                  <path d="m16 16 4.5 4.5" />
                </svg>
                <input
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder={t('searchPlaceholder')}
                  aria-label={t('searchAriaLabel')}
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery('')}
                    aria-label={t('clearSearch')}
                    title={t('clearSearch')}
                  >
                    <svg aria-hidden="true" viewBox="0 0 24 24">
                      <path d="m6 6 12 12M18 6 6 18" />
                    </svg>
                  </button>
                )}
              </div>

              <details
                className="category-menu"
                onToggle={(event) => {
                  if (event.currentTarget.open) {
                    void refreshProjectCacheStatus()
                  }
                }}
              >
                <summary aria-label={t('settingsMenu')} title={t('settingsMenu')}>
                  <svg aria-hidden="true" viewBox="0 0 24 24">
                    <path d="M10 2.8h4l.7 2.4 2 .8 2.2-1.1 2 3.5-1.8 1.8v2l1.8 1.8-2 3.5-2.2-1.1-2 .8-.7 2.4h-4l-.7-2.4-2-.8-2.2 1.1-2-3.5L5 12.2v-2L3.1 8.4l2-3.5 2.2 1.1 2-.8.7-2.4Z" />
                    <circle cx="12" cy="11.2" r="2.6" />
                  </svg>
                </summary>
                <fieldset className="category-panel">
                  <legend>{t('settingsTitle')}</legend>
                  <div className="category-controls">
                    {categoryControls.map((category) => (
                      <div className="category-control" key={category.id}>
                        <span className="category-name">{category.name}</span>
                        <label
                          className="category-checkbox"
                          title={t('showCategory', { category: category.name })}
                        >
                          <input
                            type="checkbox"
                            checked={category.show}
                            onChange={(event) =>
                              updateCategoryPreference(
                                category.id,
                                'show',
                                event.target.checked,
                              )
                            }
                            aria-label={t('showInResults', { category: category.name })}
                          />
                          <svg aria-hidden="true" viewBox="0 0 24 24">
                            <path d="M2.5 12s3.2-6 9.5-6 9.5 6 9.5 6-3.2 6-9.5 6-9.5-6-9.5-6Z" />
                            <circle cx="12" cy="12" r="2.8" />
                          </svg>
                        </label>
                        <label
                          className="category-checkbox"
                          title={t('dimCategory', { category: category.name })}
                        >
                          <input
                            type="checkbox"
                            checked={category.dim}
                            onChange={(event) =>
                              updateCategoryPreference(
                                category.id,
                                'dim',
                                event.target.checked,
                              )
                            }
                            aria-label={t('dimSection', { category: category.name })}
                          />
                          <svg aria-hidden="true" viewBox="0 0 24 24">
                            <path d="M20.3 15.2A8.5 8.5 0 0 1 8.8 3.7 8.6 8.6 0 1 0 20.3 15.2Z" />
                          </svg>
                        </label>
                      </div>
                    ))}
                    {categoryControls.length === 0 && (
                      <p className="empty-categories">{t('noCategories')}</p>
                    )}
                  </div>
                  <fieldset className="language-panel">
                    <legend>{t('language')}</legend>
                    <div className="language-options">
                      {languages.map(([code, name]) => (
                        <label className="language-option" key={code}>
                          <input
                            type="radio"
                            name="display-language"
                            value={code}
                            checked={activeLanguage === code}
                            onChange={() => updateActiveLanguage(code)}
                          />
                          <span className="language-code">{code}</span>
                          <span className="language-name">{name}</span>
                        </label>
                      ))}
                    </div>
                  </fieldset>
                  <fieldset className="project-files-panel">
                    <legend>{t('projectFiles')}</legend>
                    {projectFilesConnected && (
                      <p className="project-files-ready">{t('projectFilesConnected')}</p>
                    )}
                    <button
                      type="button"
                      className="project-files-button"
                      onClick={() => void connectProjectFiles()}
                      disabled={isConnectingProjectFiles}
                    >
                      {isConnectingProjectFiles
                        ? t('projectFilesChoose')
                        : t('projectFilesConnect')}
                    </button>
                    <p className="project-files-help">{t('projectFilesHelp')}</p>
                    {projectFilesStatus && (
                      <p className="project-files-status" role="status" aria-live="polite">
                        {projectFilesStatus}
                      </p>
                    )}
                  </fieldset>
                  <fieldset className="offline-cache-panel">
                    <legend>{t('offlineCache')}</legend>
                    {hasProjectCache && (
                      <p className="offline-cache-ready">{t('cacheAvailable')}</p>
                    )}
                    <button
                      type="button"
                      className="offline-cache-button"
                      onClick={() => void rebuildCache()}
                      disabled={isRebuildingCache}
                    >
                      {isRebuildingCache
                        ? t('cacheBuilding')
                        : hasProjectCache
                          ? t('cacheRebuild')
                          : t('cacheBuild')}
                    </button>
                    <p className="offline-cache-help">
                      {t('cacheHelp')}
                    </p>
                    {cacheStatus && (
                      <p className="offline-cache-status" role="status" aria-live="polite">
                        {cacheStatus}
                      </p>
                    )}
                  </fieldset>
                  <fieldset className="settings-profile">
                    <legend>{t('profiles')}</legend>
                    <div className="settings-profile-options">
                      {settingsProfiles.map((profile) => (
                        <button
                          type="button"
                          className={profile === settingsProfile ? 'is-active' : ''}
                          key={profile}
                          aria-pressed={profile === settingsProfile}
                          onClick={() => setSettingsProfile(profile)}
                        >
                          <span>{profile}</span>
                          {profile === settingsProfile && (
                            <span className="profile-active-label">{t('current')}</span>
                          )}
                        </button>
                      ))}
                    </div>
                  </fieldset>
                </fieldset>
                </details>
              </div>

              <span
                className="total-count mobile-total-count"
                aria-label={t('visibleEmojiCount', {
                  count: formatCount(activeLanguage, visibleResultCount),
                })}
              >
                {formatCount(activeLanguage, visibleResultCount)}
              </span>
            </section>

            <section className="emoji-results" aria-label={t('resultsLabel')}>
              {visibleResultCount === 0 ? (
                <div className="empty-state" role="status">
                  <p>{query.trim() ? t('noMatches') : t('noVisibleEmojis')}</p>
                </div>
              ) : (
                displayCategories.map((category) => {
                  if (!category.show || category.emojis.length === 0) {
                    return null
                  }

                  if (!category.hasHeading) {
                    return (
                      <EmojiGrid
                        key={category.id}
                        emojis={category.emojis}
                        imageUrls={imageUrls}
                        language={activeLanguage}
                        dimmed={category.dim}
                        onCopyMessage={handleCopyMessage}
                      />
                    )
                  }

                  return (
                    <details
                      className={`emoji-section${category.dim ? ' is-dimmed' : ''}`}
                      key={category.id}
                      open={Boolean(query.trim())}
                    >
                      <summary>
                        <span>{category.name}</span>
                        <span className="section-count">{category.emojis.length}</span>
                      </summary>
                      <EmojiGrid
                        emojis={category.emojis}
                        imageUrls={imageUrls}
                        language={activeLanguage}
                        dimmed={category.dim}
                        onCopyMessage={handleCopyMessage}
                      />
                    </details>
                  )
                })
              )}
            </section>
          </div>
        </main>
  )
}
