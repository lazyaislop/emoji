import { getEmojiSection, type EmojiSection } from './emoji'
import {
  communityEmojiSearchRoutes,
  emojiSearchRoutes,
  type EmojiSearchRoute,
} from './emojiSearchRoutes'

export type EmojiSearchEntry = {
  name: string
  url: string
  section: EmojiSection
  nameTokens: string[]
  searchTokens: string[]
}

function tokenize(value: string): string[] {
  return value
    .normalize('NFKD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .split(/[^\p{L}\p{N}]+/u)
    .filter(Boolean)
}

export function buildEmojiSearchIndex(data: Record<string, string>): EmojiSearchEntry[] {
  return Object.entries(data).map(([name, url]) => {
    const section = getEmojiSection(name, url)
    const nameTokens = tokenize(name)
    const searchTokens = new Set([
      ...nameTokens,
      ...tokenize(section),
    ])

    return {
      name,
      url,
      section,
      nameTokens,
      searchTokens: [...searchTokens],
    }
  })
}

function matchesRoute(queryTokens: string[], routeTerms: string[]): boolean {
  return routeTerms.some((term) => {
    const termTokens = tokenize(term)

    return queryTokens.some((_, startIndex) =>
      termTokens.every((termToken, offset) => {
        const queryToken = queryTokens[startIndex + offset]
        return (
          queryToken !== undefined &&
          (queryToken === termToken ||
            (queryToken.length >= 3 && termToken.startsWith(queryToken)))
        )
      }),
    )
  })
}

function getRouteSuggestions(
  index: EmojiSearchEntry[],
  queryTokens: string[],
  routes: EmojiSearchRoute[],
): EmojiSearchEntry[] {
  const entriesByName = new Map(index.map((entry) => [entry.name, entry]))
  const seenNames = new Set<string>()
  const suggestions: EmojiSearchEntry[] = []

  for (const route of routes) {
    const terms = [route.ar, route.zh, route.en, route.fr, route.ru, route.es]
    if (!matchesRoute(queryTokens, terms)) {
      continue
    }

    for (const shortcode of route.suggestions) {
      const name = shortcode.slice(1, -1)
      const entry = entriesByName.get(name)
      if (entry && !seenNames.has(name)) {
        suggestions.push(entry)
        seenNames.add(name)
      }
    }
  }

  return suggestions
}

function getTokenScore(queryToken: string, entry: EmojiSearchEntry): number {
  if (entry.nameTokens.includes(queryToken)) {
    return 12
  }

  if (entry.searchTokens.includes(queryToken)) {
    return 6
  }

  if (queryToken.length < 3) {
    return 0
  }

  if (entry.nameTokens.some((token) => token.startsWith(queryToken))) {
    return 8
  }

  if (entry.searchTokens.some((token) => token.startsWith(queryToken))) {
    return 4
  }

  return 0
}

export function searchEmojiIndex(
  index: EmojiSearchEntry[],
  query: string,
  routes: EmojiSearchRoute[] = [...emojiSearchRoutes, ...communityEmojiSearchRoutes],
): EmojiSearchEntry[] {
  const queryTokens = tokenize(query)
  if (queryTokens.length === 0) {
    return index
  }

  const suggestions = getRouteSuggestions(index, queryTokens, routes)
  const suggestedNames = new Set(suggestions.map((entry) => entry.name))
  const directMatches = index
    .map((entry) => ({
      entry,
      tokenScores: queryTokens.map((token) => getTokenScore(token, entry)),
    }))
    .filter(({ tokenScores }) => tokenScores.every((score) => score > 0))
    .sort((left, right) => {
      const leftScore = left.tokenScores.reduce((total, score) => total + score, 0)
      const rightScore = right.tokenScores.reduce((total, score) => total + score, 0)
      return rightScore - leftScore
    })
    .map(({ entry }) => entry)

  return [...suggestions, ...directMatches.filter((entry) => !suggestedNames.has(entry.name))]
}
