const peopleEmojiTerms = new Set([
  'adult',
  'angel',
  'artist',
  'astronaut',
  'baby',
  'bald',
  'ballet',
  'beard',
  'biking',
  'blind',
  'boy',
  'bride',
  'bust',
  'child',
  'children',
  'climbing',
  'cook',
  'couple',
  'curly',
  'deaf',
  'elf',
  'factory',
  'fairy',
  'family',
  'feeding',
  'girl',
  'genie',
  'golfing',
  'guardsman',
  'guardswoman',
  'hair',
  'handball',
  'health',
  'juggling',
  'judge',
  'king',
  'kneeling',
  'lotus',
  'mage',
  'man',
  'massage',
  'mechanic',
  'men',
  'merman',
  'merperson',
  'people',
  'person',
  'pilot',
  'policeman',
  'policewoman',
  'pregnant',
  'prince',
  'princess',
  'runner',
  'rowing',
  'sauna',
  'scientist',
  'singer',
  'standing',
  'student',
  'superhero',
  'supervillain',
  'surfing',
  'swimming',
  'teacher',
  'technologist',
  'tuxedo',
  'vampire',
  'veil',
  'walking',
  'weight',
  'wheelchair',
  'woman',
  'women',
  'worker',
  'zombie',
])

const nonPeopleEmojiNames = new Set([
  'baby_chick',
  'ballet_shoes',
  'bust_in_silhouette',
  'curly_loop',
])

const animalEmojiNames = new Set([
  'ant', 'badger', 'bat', 'bear', 'beaver', 'beetle', 'bird', 'bison',
  'blowfish', 'boar', 'bug', 'butterfly', 'camel', 'cat', 'cat2', 'chicken',
  'chipmunk', 'cow', 'cow2', 'crab', 'crocodile', 'deer', 'dog', 'dog2',
  'dodo', 'dolphin', 'donkey', 'dragon', 'dragon_face', 'duck', 'eagle',
  'elephant', 'fish', 'flamingo', 'fly', 'fox', 'frog', 'giraffe', 'goat',
  'gorilla', 'hamster', 'hatching_chick', 'hatched_chick', 'hedgehog',
  'hippopotamus', 'horse', 'kangaroo', 'koala', 'leopard', 'lion', 'lizard',
  'lobster', 'llama', 'mammoth', 'monkey', 'monkey_face', 'mouse', 'mouse2',
  'octopus', 'orangutan', 'otter', 'owl', 'ox', 'panda_face', 'paw_prints',
  'peacock', 'penguin', 'pig', 'pig2', 'pig_nose', 'poodle', 'rabbit',
  'rabbit2', 'raccoon', 'ram', 'rat', 'rhinoceros', 'rooster', 'scorpion',
  'seal', 'shark', 'sheep', 'shrimp', 'skunk', 'sloth', 'snail', 'snake',
  'spider', 'squid', 'swan', 't-rex', 'tiger', 'tiger2', 'tropical_fish',
  'turkey', 'turtle', 'two_hump_camel', 'unicorn', 'water_buffalo', 'whale',
  'whale2', 'wolf', 'worm', 'zebra', 'baby_chick', 'front_facing_baby_chick',
  'honeybee', 'jellyfish', 'lady_beetle', 'microbe', 'mosquito', 'polar_bear',
  'service_dog', 'guide_dog', 'black_cat', 'white_bird',
])

const emoteEmojiNames = new Set([
  '+1', '-1', 'clap', 'fist', 'fist_left', 'fist_right', 'handshake',
  'heart_hands', 'middle_finger', 'muscle', 'ok_hand', 'open_hands',
  'point_down', 'point_left', 'point_right', 'point_up', 'pray', 'raising_hand',
  'raised_fist', 'raised_hand', 'shrug', 'thumbsdown', 'thumbsup', 'thinking',
  'v', 'wave', 'wink', 'writing_hand', 'crossed_fingers', 'call_me_hand',
  'pinching_hand', 'pinched_fingers', 'metal', 'star_struck',
  'angry', 'astonished', 'blush', 'bow', 'facepalm', 'hugging', 'kiss',
  'kissing_heart', 'laughing', 'rage', 'smile', 'smiley', 'sob', 'sweat_smile',
  'yum', 'confused', 'cry', 'disappointed', 'expressionless', 'frowning',
  'grin', 'grinning', 'grimacing', 'heart_eyes', 'innocent', 'joy',
  'kissing', 'kissing_closed_eyes', 'kissing_smiling_eyes', 'neutral_face',
  'relieved', 'rofl', 'scream', 'sleeping', 'slightly_smiling_face', 'smirk',
  'stuck_out_tongue', 'stuck_out_tongue_closed_eyes',
  'stuck_out_tongue_winking_eye', 'sunglasses', 'sweat', 'unamused',
  'upside_down_face', 'weary', 'worried', 'pouting_cat', 'smile_cat',
  'smiley_cat', 'heart_eyes_cat', 'kissing_cat', 'scream_cat', 'joy_cat',
  'smirk_cat', 'cold_sweat', 'facepunch', 'fearful', 'flushed', 'pout',
  'sleeping_bed', 'sleepy', 'smiling_imp', 'tongue', 'trollface',
])

const weatherEmojiNames = new Set([
  'cloud', 'cloud_with_lightning', 'cloud_with_lightning_and_rain',
  'cloud_with_rain', 'cloud_with_snow', 'cyclone', 'droplet', 'fog', 'foggy',
  'lightning', 'mostly_sunny', 'partly_sunny', 'partly_sunny_rain', 'rainbow',
  'snowflake', 'snowman', 'snowman_without_snow', 'sun_behind_cloud',
  'sun_behind_large_cloud', 'sun_behind_rain_cloud',
  'sun_behind_small_cloud', 'sunny', 'thermometer', 'tornado', 'umbrella',
  'umbrella_with_rain_drops', 'water_wave', 'wind_face', 'zap', 'sweat_drops',
])

const celestialEmojiNames = new Set([
  'comet', 'crescent_moon', 'earth_africa', 'earth_americas', 'earth_asia',
  'first_quarter_moon', 'full_moon', 'last_quarter_moon', 'milky_way', 'moon',
  'new_moon', 'new_moon_with_face', 'ringed_planet', 'shooting_star', 'star',
  'star2', 'stars', 'sun', 'waning_crescent_moon', 'waning_gibbous_moon',
  'waxing_crescent_moon', 'waxing_gibbous_moon',
])

const clockEmojiNames = new Set([
  'alarm_clock', 'clock', 'mantelpiece_clock', 'stopwatch', 'timer_clock',
])

const otherEmojiNameOverrides = new Set([
  'red_envelope',
  'white_flower',
  'red_car',
  'orange_book',
  'green_apple',
  'green_book',
  'green_salad',
  'blue_car',
  'blue_book',
  'black_bird',
  'black_joker',
  'black_nib',
  'black_square_button',
  'white_square_button',
  'bow_and_arrow',
  'wind_face',
  'snowman',
])

const sportsAndActivitiesEmojiNames = new Set([
  'athletics',
  'badminton',
  'baseball',
  'basketball',
  'biking',
  'bowling',
  'boxing_glove',
  'cartwheeling',
  'climbing',
  'cricket_game',
  'curling_stone',
  'dancer',
  'field_hockey',
  'football',
  'golf',
  'golfing',
  'hiking',
  'ice_hockey',
  'martial_arts_uniform',
  'ping_pong',
  'running',
  'skateboard',
  'ski',
  'skier',
  'snowboarder',
  'soccer',
  'surfing',
  'surfer',
  'swimming',
  'tennis',
  'volleyball',
  'water_polo',
  'wrestling',
  'cop',
  'detective',
  'spy',
])

const colorPrefixes = [
  'black', 'blue', 'brown', 'green', 'orange', 'purple', 'red', 'white', 'yellow',
] as const

export type OtherEmojiCategory =
  | 'Animals'
  | 'Emotes'
  | 'Sports & activities'
  | 'Celestial'
  | 'Weather'
  | 'Unicode'
  | 'Arrows'
  | 'Clocks'
  | 'Colors'
  | 'Other'

export type EmojiSection = OtherEmojiCategory | 'People' | 'Countries' | 'GitHub'

export const otherEmojiCategories: OtherEmojiCategory[] = [
  'Other',
  'Animals',
  'Emotes',
  'Sports & activities',
  'Celestial',
  'Weather',
  'Unicode',
  'Arrows',
  'Clocks',
  'Colors',
]

export const emojiSections: EmojiSection[] = [
  ...otherEmojiCategories,
  'People',
  'Countries',
  'GitHub',
]

export function isPeopleEmoji(name: string) {
  if (nonPeopleEmojiNames.has(name)) {
    return false
  }

  return name.split('_').some((term) => peopleEmojiTerms.has(term))
}

export function isCoupleEmoji(name: string) {
  return (
    name.startsWith('couplekiss') ||
    name.startsWith('couple_kiss') ||
    name.startsWith('couple_with_heart')
  )
}

export function getOtherEmojiCategory(name: string): OtherEmojiCategory {
  if (otherEmojiNameOverrides.has(name)) {
    return 'Other'
  }

  if (animalEmojiNames.has(name)) {
    return 'Animals'
  }

  if (weatherEmojiNames.has(name)) {
    return 'Weather'
  }

  if (
    name.startsWith('face_') ||
    name.startsWith('frowning_') ||
    name.startsWith('pouting_') ||
    name.startsWith('raising_hand') ||
    name.startsWith('smiling_face_with_') ||
    name.endsWith('_face') ||
    name.endsWith('_shrugging') ||
    name.endsWith('_facepalming') ||
    name.startsWith('facepalm') ||
    emoteEmojiNames.has(name)
  ) {
    return 'Emotes'
  }

  if (sportsAndActivitiesEmojiNames.has(name) || name === 'sled' || name === 'ice_skate') {
    return 'Sports & activities'
  }

  if (celestialEmojiNames.has(name)) {
    return 'Celestial'
  }

  if (/^u[0-9a-f]{4,}$/i.test(name)) {
    return 'Unicode'
  }

  if (name.includes('arrow')) {
    return 'Arrows'
  }

  if (clockEmojiNames.has(name) || /^clock\d+$/.test(name)) {
    return 'Clocks'
  }

  const isColorEmoji = colorPrefixes.some((colorPrefix) =>
    name.startsWith(`${colorPrefix}_`),
  )

  return isColorEmoji ? 'Colors' : 'Other'
}

export function isCountryEmoji(name: string, url: string) {
  return (
    /\/unicode\/1f1[0-9a-f]{2}-1f1[0-9a-f]{2}\.png/i.test(url) ||
    ['england', 'scotland', 'wales'].includes(name)
  )
}

export function isGitHubEmoji(url: string) {
  return !url.includes('/unicode/')
}

export function getEmojiCopyValue(name: string, url: string) {
  const unicodeMatch = url.match(/\/unicode\/([0-9a-f]+(?:-[0-9a-f]+)*)\.png(?:[?#]|$)/i)
  if (!unicodeMatch) {
    return `:${name}:`
  }

  const codePoints = unicodeMatch[1].split('-').map((codePoint) => Number.parseInt(codePoint, 16))
  if (codePoints.some((codePoint) => codePoint > 0x10ffff)) {
    return `:${name}:`
  }

  return String.fromCodePoint(...codePoints)
}

export function getEmojiSection(name: string, url: string): EmojiSection {
  if (isGitHubEmoji(url)) {
    return 'GitHub'
  }

  if (isCountryEmoji(name, url)) {
    return 'Countries'
  }

  if (isCoupleEmoji(name)) {
    return 'People'
  }

  const category = getOtherEmojiCategory(name)
  if (category === 'Emotes' || category === 'Sports & activities') {
    return category
  }

  return isPeopleEmoji(name) ? 'People' : category
}
