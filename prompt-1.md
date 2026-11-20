# English prompt

## Recreate the GitHub Emoji Browser

Build a polished, responsive, client-side GitHub emoji browser in the existing
React 19, TypeScript, and Vite project. Use GitHub's public emoji map at
`https://api.github.com/emojis` as the catalog and image source. Keep the
implementation simple, accessible, and easy to extend. Do not add a backend,
router, state-management library, or unnecessary dependencies.

### Product and visual design

- Make a compact, programmer-oriented interface: calm neutral background,
  restrained purple accent, clear controls, and no marketing copy or
  instructional paragraphs.
- On desktop, place the “GitHub emoji” title, a persistent `Copied:` status,
  and the current visible-result count in one header row. Put search and the
  gear button below it, followed immediately by emoji results.
- On mobile, keep the same title-and-copy-status header above search. Put the
  compact result count below the search row and before the emojis. Prevent
  horizontal overflow.
- Keep the search and copy-status area sticky while scrolling. The status is
  visible from the first render as `Copied:` and updates to `Copied: <value>`
  after a successful copy. Reserve its space so copying never shifts results.
- The count always reflects the currently matching, enabled results, not the
  total unfiltered catalog.
- Put category settings and six language placeholders inside a compact gear
  popover. It should open on demand, stay usable on mobile, and be accessible
  by keyboard and screen reader.

### Emoji categories and controls

- Classify emojis into useful sections such as People, Countries, GitHub,
  Animals, Emotes, Sports & activities, Celestial, Weather, Unicode, Arrows,
  Clocks, Colors, and Other.
- Each category has independent show/hide and dim controls. Hiding a category
  removes its emojis from results and updates the count, but never removes its
  controls from the gear menu. Dimming changes the section and emoji
  appearance without hiding it.
- Countries are dimmed by default. `Other` remains configurable but its
  results render directly without an “Other” heading or section count.
- Group the other sections clearly; expand matching sections while searching.

### Copy behavior

- Make every emoji a keyboard-accessible button.
- When its GitHub image URL contains a Unicode code-point path such as
  `/unicode/1f3a8.png`, copy the corresponding native Unicode character.
- For GitHub-only entries without a Unicode code-point path, copy the GitHub
  shortcode, such as `:suspect:`.
- Keep the hover tooltip as the GitHub shortcode (for example `:art:`), even
  when the clipboard receives a native character.
- Show the copied value in the persistent header status. Surface clipboard
  errors clearly; do not silently fail.

### Search architecture: exactly three semantic routes

Keep ordinary search by emoji name and section. Implement semantic suggestions
only through a small, explicit route table. Normalize queries so localized
text, case, and diacritics work. Route suggestions should be prioritized and
deduplicated with direct matches. Do not add broad synonym lists or
emoji-specific descriptions yet.

Use the six UN official languages: Arabic (`ar`), Chinese (`zh`), English
(`en`), French (`fr`), Russian (`ru`), and Spanish (`es`). Configure these
routes:

```ts
{
  en: 'design',
  ar: 'تصميم',
  zh: '设计',
  fr: 'design',
  ru: 'дизайн',
  es: 'diseño',
  suggestions: [':art:', ':fish_cake:', ':framed_picture:'],
}
{
  en: 'ai',
  ar: 'الذكاء الاصطناعي',
  zh: '人工智能',
  fr: 'ia',
  ru: 'ии',
  es: 'ia',
  suggestions: [':robot:', ':rocket:'],
}
{
  en: 'robo',
  ar: 'روبوت',
  zh: '机器人',
  fr: 'robot',
  ru: 'робот',
  es: 'robot',
  suggestions: [':robot:'],
}
```

Suggestions must resolve to entries in GitHub's catalog. Route results should
be added to normal results, not replace them.

### Future manual descriptions: structure only

Create a clearly named, typed data structure for future manually curated
descriptions, with a shortcode title and optional arrays of terms per UN
language. Leave the data completely empty; do not add sample entries or
populate any translations. For example, the future shape should allow an entry
like `{ title: ':art:', ru: ['...'] }`, but that entry must not be added now.

### Language placeholders

Inside the gear popover, show radio choices for Arabic, Chinese, English,
French, Russian, and Spanish. English is visually selected by default.
Selecting a language only changes the selected appearance; it must not
translate the UI or alter search behavior.

### Quality requirements

- Keep API errors explicit and preserve the app's loading/error behavior.
- Keep classification, routes, indexing, and UI responsibilities in their
  existing model/API/UI layers.
- Use semantic controls, visible keyboard focus, and appropriate accessible
  labels.
- Run `npm run lint` and `npm run build`. Verify route behavior and responsive
  layouts in a browser if available.

# Русский перевод

## Воссоздание браузера GitHub-эмодзи

Создай аккуратное адаптивное клиентское приложение для просмотра эмодзи
GitHub в существующем проекте на React 19, TypeScript и Vite. Используй
публичную карту эмодзи GitHub по адресу
`https://api.github.com/emojis` как каталог и источник изображений.
Реализация должна быть простой, доступной и удобной для расширения. Не
добавляй backend, маршрутизатор, библиотеку управления состоянием или
ненужные зависимости.

### Продукт и визуальный стиль

- Сделай компактный интерфейс для разработчиков: спокойный нейтральный фон,
  сдержанный фиолетовый акцент, понятные элементы управления, без рекламных
  текстов и длинных инструкций.
- На компьютере размести заголовок «GitHub emoji», постоянно видимый статус
  `Copied:` и счётчик текущих результатов в одной строке. Ниже размести
  поиск и кнопку-шестерёнку, а сразу за ними — результаты с эмодзи.
- На мобильном сохрани тот же порядок заголовка и статуса копирования над
  поиском. Компактный счётчик размести под строкой поиска и перед эмодзи.
  Не допускай горизонтальной прокрутки.
- Закрепи область поиска и статуса копирования при прокрутке. Статус должен
  быть виден сразу после загрузки как `Copied:` и обновляться до
  `Copied: <значение>` после успешного копирования. Зарезервируй для него
  место, чтобы копирование не сдвигало результаты.
- Счётчик всегда показывает количество результатов с учётом текущего
  запроса и включённых категорий, а не количество эмодзи во всём каталоге.
- Помести настройки категорий и шесть языковых заглушек в компактное меню
  шестерёнки. Оно открывается по запросу, удобно на мобильном и доступно с
  клавиатуры и скринридера.

### Категории эмодзи и настройки

- Распредели эмодзи по полезным разделам: People, Countries, GitHub, Animals,
  Emotes, Sports & activities, Celestial, Weather, Unicode, Arrows, Clocks,
  Colors и Other.
- Для каждой категории должны быть независимые настройки показа и
  приглушения. Скрытие категории убирает её эмодзи из результатов и
  обновляет счётчик, но сами настройки остаются в меню шестерёнки.
  Приглушение меняет вид раздела и эмодзи, не скрывая их.
- По умолчанию приглушай Countries. Категорию Other оставь настраиваемой, но
  отображай её эмодзи напрямую — без заголовка «Other» и счётчика раздела.
- Остальные категории отображай группами; при поиске раскрывай разделы с
  совпадениями.

### Копирование эмодзи

- Каждое эмодзи должно быть доступной с клавиатуры кнопкой.
- Если URL изображения GitHub содержит путь с кодовой точкой Unicode,
  например `/unicode/1f3a8.png`, копируй соответствующий нативный символ
  Unicode.
- Для GitHub-эмодзи без Unicode-кода копируй shortcode GitHub, например
  `:suspect:`.
- В подсказке при наведении всегда показывай shortcode GitHub, например
  `:art:`, даже если в буфер обмена копируется нативный символ.
- Показывай скопированное значение в постоянном статусе в заголовке. Явно
  сообщай об ошибке копирования; не скрывай её.

### Архитектура поиска: ровно три семантических маршрута

Сохрани обычный поиск по имени эмодзи и названию категории. Семантические
подсказки реализуй только через небольшую явную таблицу маршрутов.
Нормализуй запросы так, чтобы работали локализованные строки, регистр и
диакритические знаки. Сначала показывай подсказки маршрутов, удаляй
дубликаты с обычными результатами. Пока не добавляй общие списки синонимов
или описания отдельных эмодзи.

Используй шесть официальных языков ООН: арабский (`ar`), китайский (`zh`),
английский (`en`), французский (`fr`), русский (`ru`) и испанский (`es`).
Настрой маршруты:

```ts
{
  en: 'design',
  ar: 'تصميم',
  zh: '设计',
  fr: 'design',
  ru: 'дизайн',
  es: 'diseño',
  suggestions: [':art:', ':fish_cake:', ':framed_picture:'],
}
{
  en: 'ai',
  ar: 'الذكاء الاصطناعي',
  zh: '人工智能',
  fr: 'ia',
  ru: 'ии',
  es: 'ia',
  suggestions: [':robot:', ':rocket:'],
}
{
  en: 'robo',
  ar: 'روبوت',
  zh: '机器人',
  fr: 'robot',
  ru: 'робот',
  es: 'robot',
  suggestions: [':robot:'],
}
```

Каждая подсказка должна соответствовать эмодзи из каталога GitHub.
Результаты маршрутов добавляй к обычным совпадениям, а не вместо них.

### Будущие описания вручную: только структура

Создай понятную типизированную структуру для будущих описаний, добавляемых
вручную: shortcode в поле названия и необязательные массивы терминов для
каждого официального языка ООН. Оставь данные полностью пустыми: не добавляй
примеров и не заполняй переводы. Будущая структура должна допускать запись
вида `{ title: ':art:', ru: ['...'] }`, но сейчас такую запись добавлять
нельзя.

### Заглушки выбора языка

В меню шестерёнки покажи radio-кнопки для арабского, китайского, английского,
французского, русского и испанского языков. По умолчанию визуально выбран
английский. Выбор языка меняет только визуальное выделение; он не переводит
интерфейс и не меняет поиск.

### Требования к качеству

- Явно обрабатывай ошибки API и сохраняй поведение загрузки и ошибок
  приложения.
- Сохраняй разделение обязанностей между существующими слоями model, API и
  UI: классификация, маршруты, индексация и интерфейс должны находиться в
  соответствующих слоях.
- Используй семантические элементы управления, заметный фокус клавиатуры и
  подходящие доступные подписи.
- Запусти `npm run lint` и `npm run build`. Если доступен браузер, проверь
  маршруты и адаптивные макеты.
