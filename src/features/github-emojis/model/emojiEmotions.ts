import type { UNLanguage } from './emojiSearchRoutes'

/** A single emoji's semantic search data, editable by humans. */
export type EmojiEmotion = {
  shortcode: `:${string}:`
  name: string
  section: string
  /** Keywords per language that describe this emoji for semantic search. */
  descriptions: Record<UNLanguage, string[]>
  /** Override the global default match threshold for this emoji (0-1). */
  matchThreshold?: number
}

/** Top-level shape of public/emoji_emotions.json */
export type EmojiEmotionsData = {
  version: number
  description: string
  languages: UNLanguage[]
  defaultMatchThreshold: number
  emojis: EmojiEmotion[]
}

export type EmotionSearchResult = {
  name: string
  shortcode: string
  section: string
  matchedLanguages: UNLanguage[]
  matchRatio: number
}

/** Normalize text into search tokens (same tokenizer as emojiSearch.ts). */
export function tokenize(value: string): string[] {
  return value
    .normalize('NFKD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .split(/[^\p{L}\p{N}]+/u)
    .filter(Boolean)
}

/** All description tokens for one emoji across all languages, deduplicated. */
function emotionTokens(emoji: EmojiEmotion): Map<string, UNLanguage[]> {
  const tokenToLangs = new Map<string, UNLanguage[]>()
  for (const lang of Object.keys(emoji.descriptions) as UNLanguage[]) {
    for (const desc of emoji.descriptions[lang] ?? []) {
      for (const token of tokenize(desc)) {
        const langs = tokenToLangs.get(token) ?? []
        if (!langs.includes(lang)) {
          tokenToLangs.set(token, [...langs, lang])
        }
      }
    }
  }
  return tokenToLangs
}

/** Build an in-memory index from the emotions data. Call once at startup. */
export function buildEmotionIndex(data: EmojiEmotionsData) {
  const defaultThreshold = data.defaultMatchThreshold ?? 0.5
  const tokenToEmotions = new Map<string, string[]>() // token -> emoji names
  const emotionByName = new Map<string, EmojiEmotion>()
  const thresholdByName = new Map<string, number>()

  for (const emoji of data.emojis) {
    emotionByName.set(emoji.name, emoji)
    thresholdByName.set(emoji.name, emoji.matchThreshold ?? defaultThreshold)
    const tokens = emotionTokens(emoji)
    for (const token of tokens.keys()) {
      const names = tokenToEmotions.get(token) ?? []
      if (!names.includes(emoji.name)) {
        tokenToEmotions.set(token, [...names, emoji.name])
      }
    }
  }

  return { tokenToEmotions, emotionByName, thresholdByName, defaultThreshold }
}

/**
 * Semantic search across all six languages at once. No language switching needed.
 *
 * Returns emojis whose descriptions match at least matchThreshold of the query
 * tokens. Matching is done per-emoji against any language's descriptions.
 */
export function searchEmotions(
  index: ReturnType<typeof buildEmotionIndex>,
  query: string,
): EmotionSearchResult[] {
  const queryTokens = tokenize(query)
  if (queryTokens.length === 0) {
    return []
  }

  // Collect candidate emoji names that match at least one query token.
  const candidateNames = new Set<string>()
  for (const queryToken of queryTokens) {
    // Exact token match (any language).
    const exact = index.tokenToEmotions.get(queryToken)
    if (exact) {
      for (const name of exact) candidateNames.add(name)
    }
    // Prefix match for tokens >= 3 chars (e.g. "квад" matches "квадрат").
    if (queryToken.length >= 3) {
      for (const [token, names] of index.tokenToEmotions) {
        if (token.startsWith(queryToken)) {
          for (const name of names) candidateNames.add(name)
        }
      }
    }
  }

  const results: EmotionSearchResult[] = []

  for (const name of candidateNames) {
    const emoji = index.emotionByName.get(name)
    if (!emoji) continue

    const threshold = index.thresholdByName.get(name) ?? index.defaultThreshold
    const required = Math.ceil(queryTokens.length * threshold)

    let matchCount = 0
    const matchedLanguages = new Set<UNLanguage>()

    for (const queryToken of queryTokens) {
      let tokenMatched = false
      const tokenToLangs = emotionTokens(emoji)
      for (const [token, langs] of tokenToLangs) {
        if (token === queryToken || (queryToken.length >= 3 && token.startsWith(queryToken))) {
          tokenMatched = true
          for (const lang of langs) matchedLanguages.add(lang)
          break
        }
      }
      if (tokenMatched) matchCount++
    }

    if (matchCount >= required) {
      results.push({
        name,
        shortcode: emoji.shortcode,
        section: emoji.section,
        matchedLanguages: [...matchedLanguages],
        matchRatio: matchCount / queryTokens.length,
      })
    }
  }

  // Sort: higher match ratio first, then by name.
  results.sort((a, b) => b.matchRatio - a.matchRatio || a.name.localeCompare(b.name))
  return results
}
