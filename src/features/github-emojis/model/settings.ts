import { emojiSections, type EmojiSection } from './emoji'
import type { UNLanguage } from './emojiSearchRoutes'

export type SectionPreference = {
  show: boolean
  dim: boolean
}

export type UserSettings = {
  id: 'user_settings'
  language: UNLanguage
  categories: Record<EmojiSection, SectionPreference>
}

export type UserSettingsPatch = Partial<Omit<UserSettings, 'categories'>> & {
  categories?: Partial<UserSettings['categories']>
}

export type DefaultSettings = {
  id: 'default'
  language: UNLanguage
  categories: Record<EmojiSection, SectionPreference>
}

export type TeamEmojiCategory = {
  id: string
  name: string
  emojiNames: string[]
  show: boolean
  dim: boolean
}

export type TeamSettings = {
  id: string
  categories: TeamEmojiCategory[]
  emojiNames?: string[]
}

export type SettingsProfileId = string

export function createDefaultSettings(): DefaultSettings {
  return {
    id: 'default',
    language: 'en',
    categories: Object.fromEntries(
      emojiSections.map((section) => [
        section,
        {
          show: !['Countries', 'Unicode', 'People'].includes(section),
          dim: ['Countries', 'Unicode', 'People', 'Clocks', 'Arrows'].includes(section),
        },
      ]),
    ) as Record<EmojiSection, SectionPreference>,
  }
}

export function createDefaultUserSettings(): UserSettings {
  const { language, categories } = createDefaultSettings()
  return {
    id: 'user_settings',
    language,
    categories,
  }
}
