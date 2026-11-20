import { useMemo, useState } from 'react'
import { getGhEmojiData } from '../api/getGhEmojiData'
import {
  emojiSections,
  getEmojiCopyValue,
  type EmojiSection,
} from '../model/emoji'
import {
  buildEmojiSearchIndex,
  searchEmojiIndex,
  type EmojiSearchEntry,
} from '../model/emojiSearch'

type SectionPreferences = {
  show: boolean
  dim: boolean
}

function createDefaultSectionPreferences(): Record<EmojiSection, SectionPreferences> {
  return Object.fromEntries(
    emojiSections.map((section) => [
      section,
      { show: true, dim: section === 'Countries' },
    ]),
  ) as Record<EmojiSection, SectionPreferences>
}

function updatePreference(
  current: Record<EmojiSection, SectionPreferences>,
  section: EmojiSection,
  key: keyof SectionPreferences,
  value: boolean,
): Record<EmojiSection, SectionPreferences> {
  return {
    ...current,
    [section]: {
      ...current[section],
      [key]: value,
    },
  }
}

export type EmojiGridProps = {
  emojis: EmojiSearchEntry[]
  dimmed: boolean
  onCopyMessage: (message: string) => void
}

export function EmojiGrid({ emojis, dimmed, onCopyMessage }: EmojiGridProps) {
  async function copyEmoji(name: string, url: string) {
    const copyValue = getEmojiCopyValue(name, url)
    if (!navigator.clipboard?.writeText) {
      onCopyMessage('Clipboard access is unavailable in this browser.')
      return
    }

    try {
      await navigator.clipboard.writeText(copyValue)
      onCopyMessage(`Copied: ${copyValue}`)
    } catch {
      onCopyMessage('Copy failed. Check clipboard permissions and try again.')
    }
  }

  return (
    <div className={`emoji-grid${dimmed ? ' is-dimmed' : ''}`}>
      {emojis.map(({ name, url }) => (
        <button
          key={name}
          className="emoji-copy-button"
          type="button"
          aria-label={`Copy ${name.replaceAll('_', ' ')}`}
          title={`:${name}:`}
          onClick={() => void copyEmoji(name, url)}
        >
          <img src={url} alt="" loading="lazy" decoding="async" />
        </button>
      ))}
    </div>
  )
}

let emojiDataPromise: Promise<Record<string, string>> | undefined
let emojiDataStatus: 'pending' | 'resolved' | 'rejected' = 'pending'
let emojiDataResult: Record<string, string> = {}
let emojiDataError: unknown

function readEmojiData(): Record<string, string> {
  if (!emojiDataPromise) {
    emojiDataPromise = getGhEmojiData()
      .then((data) => {
        emojiDataResult = data || {}
        emojiDataStatus = 'resolved'
        return emojiDataResult
      })
      .catch((error: unknown) => {
        emojiDataError = error
        emojiDataStatus = 'rejected'
        throw error
      })
  }

  if (emojiDataStatus === 'resolved') {
    return emojiDataResult
  }

  if (emojiDataStatus === 'rejected') {
    throw emojiDataError
  }

  throw emojiDataPromise
}

export function EmojiGhView() {
  const emojiData = readEmojiData()
  const [query, setQuery] = useState('')
  const [copyMessage, setCopyMessage] = useState('Copied:')
  const [preferences, setPreferences] = useState(createDefaultSectionPreferences)
  const emojiIndex = useMemo(() => buildEmojiSearchIndex(emojiData), [emojiData])
  const searchResults = useMemo(
    () => searchEmojiIndex(emojiIndex, query),
    [emojiIndex, query],
  )
  const groupedEmojis = new Map<EmojiSection, EmojiSearchEntry[]>(
    emojiSections.map((section) => [section, []] as const),
  )

  for (const emoji of searchResults) {
    if (preferences[emoji.section].show) {
      groupedEmojis.get(emoji.section)?.push(emoji)
    }
  }

  const visibleResultCount = emojiSections.reduce(
    (total, section) => total + (groupedEmojis.get(section)?.length ?? 0),
    0,
  )

  return (
    <main className="emoji-view">
      <div className="app-layout">
        <section className="search-panel" aria-label="Emoji search">
          <header className="app-header">
            <h1>GitHub emoji</h1>
            <p className="copy-status" role="status" aria-live="polite">
              {copyMessage}
            </p>
            <span
              className="total-count desktop-total-count"
              aria-label={`${visibleResultCount.toLocaleString()} visible emojis`}
            >
              {visibleResultCount.toLocaleString()}
            </span>
          </header>

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
                placeholder="Search emoji…"
                aria-label="Search emojis by name or meaning"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  aria-label="Clear search"
                  title="Clear search"
                >
                  <svg aria-hidden="true" viewBox="0 0 24 24">
                    <path d="m6 6 12 12M18 6 6 18" />
                  </svg>
                </button>
              )}
            </div>

            <details className="category-menu">
              <summary aria-label="Category settings" title="Category settings">
                <svg aria-hidden="true" viewBox="0 0 24 24">
                  <path d="M10 2.8h4l.7 2.4 2 .8 2.2-1.1 2 3.5-1.8 1.8v2l1.8 1.8-2 3.5-2.2-1.1-2 .8-.7 2.4h-4l-.7-2.4-2-.8-2.2 1.1-2-3.5L5 12.2v-2L3.1 8.4l2-3.5 2.2 1.1 2-.8.7-2.4Z" />
                  <circle cx="12" cy="11.2" r="2.6" />
                </svg>
              </summary>
              <fieldset className="category-panel">
                <legend>Categories</legend>
                <div className="category-controls">
                  {emojiSections.map((section) => (
                    <div className="category-control" key={section}>
                      <span className="category-name">{section}</span>
                      <label className="category-checkbox" title={`Show ${section}`}>
                        <input
                          type="checkbox"
                          checked={preferences[section].show}
                          onChange={(event) =>
                            setPreferences((current) =>
                              updatePreference(current, section, 'show', event.target.checked),
                            )
                          }
                          aria-label={`Show ${section} in results`}
                        />
                        <svg aria-hidden="true" viewBox="0 0 24 24">
                          <path d="M2.5 12s3.2-6 9.5-6 9.5 6 9.5 6-3.2 6-9.5 6-9.5-6-9.5-6Z" />
                          <circle cx="12" cy="12" r="2.8" />
                        </svg>
                      </label>
                      <label className="category-checkbox" title={`Dim ${section}`}>
                        <input
                          type="checkbox"
                          checked={preferences[section].dim}
                          onChange={(event) =>
                            setPreferences((current) =>
                              updatePreference(current, section, 'dim', event.target.checked),
                            )
                          }
                          aria-label={`Dim ${section} section`}
                        />
                        <svg aria-hidden="true" viewBox="0 0 24 24">
                          <path d="M20.3 15.2A8.5 8.5 0 0 1 8.8 3.7 8.6 8.6 0 1 0 20.3 15.2Z" />
                        </svg>
                      </label>
                    </div>
                  ))}
                </div>
                <fieldset className="language-panel">
                  <legend>Language</legend>
                  <div className="language-options">
                    {[
                      ['ar', 'العربية'],
                      ['zh', '中文'],
                      ['en', 'English'],
                      ['fr', 'Français'],
                      ['ru', 'Русский'],
                      ['es', 'Español'],
                    ].map(([code, name]) => (
                      <label className="language-option" key={code}>
                        <input
                          type="radio"
                          name="display-language"
                          value={code}
                          defaultChecked={code === 'en'}
                        />
                        <span className="language-code">{code}</span>
                        <span className="language-name">{name}</span>
                      </label>
                    ))}
                  </div>
                </fieldset>
              </fieldset>
            </details>
          </div>

          <span
            className="total-count mobile-total-count"
            aria-label={`${visibleResultCount.toLocaleString()} visible emojis`}
          >
            {visibleResultCount.toLocaleString()}
          </span>
        </section>

        <section className="emoji-results" aria-label="Emoji results">
          {visibleResultCount === 0 ? (
            <div className="empty-state" role="status">
              <p>{query.trim() ? 'No matches' : 'No visible emojis'}</p>
            </div>
          ) : (
            emojiSections.map((section) => {
              const emojis = groupedEmojis.get(section) ?? []
              if (emojis.length === 0) {
                return null
              }

              if (section === 'Other') {
                return (
                  <EmojiGrid
                    key={section}
                    emojis={emojis}
                    dimmed={preferences[section].dim}
                    onCopyMessage={setCopyMessage}
                  />
                )
              }

              return (
                <details
                  className={`emoji-section${preferences[section].dim ? ' is-dimmed' : ''}`}
                  key={section}
                  open={Boolean(query.trim())}
                >
                  <summary>
                    <span>{section}</span>
                    <span className="section-count">{emojis.length}</span>
                  </summary>
                  <EmojiGrid
                    emojis={emojis}
                    dimmed={preferences[section].dim}
                    onCopyMessage={setCopyMessage}
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
