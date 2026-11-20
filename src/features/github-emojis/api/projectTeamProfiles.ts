import type { TeamEmojiCategory, TeamSettings } from '../model/settings'

const teamProfilesDirectory = 'team-profiles'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function readEmojiNames(value: unknown, field: string): string[] {
  if (!Array.isArray(value) || !value.every((name) => typeof name === 'string')) {
    throw new Error(`${field} must be an array of emoji shortcode names.`)
  }
  return value as string[]
}

function normalizeTeamProfile(value: unknown, fallback: TeamSettings): TeamSettings {
  if (!isRecord(value)) {
    throw new Error(`The team profile file for "${fallback.id}" must contain a JSON object.`)
  }
  if (value.id !== undefined && value.id !== fallback.id) {
    throw new Error(`The team profile file for "${fallback.id}" has a different id.`)
  }

  const fallbackCategory = (id: string): TeamEmojiCategory | undefined =>
    fallback.categories.find((category) => category.id === id)

  if (value.categories !== undefined) {
    if (!Array.isArray(value.categories)) {
      throw new Error(`categories in "${fallback.id}" must be an array.`)
    }

    return {
      ...fallback,
      categories: value.categories.map((entry, index) => {
        if (!isRecord(entry) || typeof entry.id !== 'string' || typeof entry.name !== 'string') {
          throw new Error(
            `Category ${index + 1} in "${fallback.id}" needs string "id" and "name" fields.`,
          )
        }
        if (entry.show !== undefined && typeof entry.show !== 'boolean') {
          throw new Error(`Category "${entry.id}" needs a boolean "show" value.`)
        }
        if (entry.dim !== undefined && typeof entry.dim !== 'boolean') {
          throw new Error(`Category "${entry.id}" needs a boolean "dim" value.`)
        }

        const previous = fallbackCategory(entry.id)
        return {
          id: entry.id,
          name: entry.name,
          emojiNames: readEmojiNames(entry.emojiNames, `Category "${entry.id}" emojiNames`),
          show: entry.show ?? previous?.show ?? true,
          dim: entry.dim ?? previous?.dim ?? false,
        }
      }),
      emojiNames: undefined,
    }
  }

  if (value.emojiNames !== undefined) {
    return {
      ...fallback,
      categories: [],
      emojiNames: readEmojiNames(value.emojiNames, 'emojiNames'),
    }
  }

  return fallback
}

async function loadTeamProfile(
  fallback: TeamSettings,
): Promise<TeamSettings> {
  let response: Response
  try {
    response = await fetch(
      `${import.meta.env.BASE_URL}${teamProfilesDirectory}/${fallback.id}.json`,
      { cache: 'no-store', headers: { Accept: 'application/json' } },
    )
  } catch (error) {
    if (error instanceof TypeError) {
      return fallback
    }
    throw error
  }

  if (response.status === 404) {
    return fallback
  }
  if (!response.ok) {
    throw new Error(`Could not read the team profile "${fallback.id}": ${response.status}`)
  }
  if (!response.headers.get('content-type')?.includes('application/json')) {
    return fallback
  }

  return normalizeTeamProfile(await response.json(), fallback)
}

/**
 * Team defaults are compiled into `*_team.ts` so a fresh checkout has profiles,
 * but the editable JSON files under `public/team-profiles/` win at runtime.
 * A reload is enough after editing a JSON file; no rebuild is required.
 */
export function loadTeamProfileDefaults(
  fallbacks: TeamSettings[],
): Promise<TeamSettings[]> {
  return Promise.all(fallbacks.map(loadTeamProfile))
}
