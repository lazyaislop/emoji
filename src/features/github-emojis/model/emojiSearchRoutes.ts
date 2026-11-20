export type UNLanguage = 'ar' | 'zh' | 'en' | 'fr' | 'ru' | 'es'
export type EmojiShortcode = `:${string}:`

export type EmojiSearchRoute = Record<UNLanguage, string> & {
  suggestions: EmojiShortcode[]
}

export type CommunityEmojiSearchRoute = EmojiSearchRoute & {
  id: string
}

export type EmojiSearchDescription = {
  title: EmojiShortcode
} & Partial<Record<UNLanguage, string[]>>

export const emojiSearchDescriptions: EmojiSearchDescription[] = []

export const communityEmojiSearchRoutes: CommunityEmojiSearchRoute[] = []

export const emojiSearchRoutes: EmojiSearchRoute[] = [
  {
    en: 'design',
    ar: 'تصميم',
    zh: '设计',
    fr: 'design',
    ru: 'дизайн',
    es: 'diseño',
    suggestions: [':art:', ':fish_cake:', ':framed_picture:'],
  },
  {
    en: 'ai',
    ar: 'الذكاء الاصطناعي',
    zh: '人工智能',
    fr: 'ia',
    ru: 'ии',
    es: 'ia',
    suggestions: [':robot:', ':rocket:'],
  },
  {
    en: 'robo',
    ar: 'روبوت',
    zh: '机器人',
    fr: 'robot',
    ru: 'робот',
    es: 'robot',
    suggestions: [':robot:'],
  },
]
