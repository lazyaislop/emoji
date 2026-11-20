# English prompt

## Build the GitHub Emoji Browser from scratch

Create a polished, responsive, installable, client-side GitHub emoji browser.
It must work fully offline from a portable cache, be translated into six
languages, be accessible by keyboard and screen reader, and be easy to extend.
Keep all logic in framework-agnostic model/API modules so the React UI can be
swapped for Svelte, Vue, or Angular with minimal changes.

### Stack and constraints

- Use React 19, TypeScript, and Vite (with the React Compiler Babel preset).
- Use GitHub's public emoji map at `https://api.github.com/emojis` as the
  catalog and image source.
- Do not add a backend, router, state-management library, or an i18n library.
  All translations are hand-written TypeScript data.
- No marketing copy or long instructions in the interface.

### Product and visual design

- Calm neutral background, restrained purple accent, clear compact controls,
  programmer-oriented feel.
- On desktop, put the title, a persistent copy-status line, and the current
  visible-result count in one header row. Put search and a gear button below;
  show emoji results immediately after.
- On mobile, keep title and copy status above search, move the result count
  below the search row, and prevent horizontal overflow.
- Keep the search/status area sticky while scrolling. Reserve space for the
  status so copying never shifts results. The count reflects only matching,
  enabled emojis, not the whole catalog.
- Put category settings, the language radios, profile buttons, and cache
  controls inside a compact, accessible gear popover.

### Emoji categories and controls

- Classify emojis into Other, Animals, Emotes, Sports & activities, Celestial,
  Weather, Unicode, Arrows, Clocks, Colors, People, Countries, and GitHub.
- Each category has independent show and dim controls. Hiding removes emojis
  from results and updates the count but keeps the control in the gear menu;
  dimming changes appearance only. `Other` is configurable but renders without
  a section heading. Omit the heading entirely when only one category has
  visible results.
- The hidden first-launch `default` profile shows all categories except
  Countries, Unicode, and People, and dims those three plus Clocks and Arrows.
  Changing any category or the language automatically activates and saves to
  `user_settings`. Never list or display `default` in the UI.
- `user_settings` uses the built-in sections. Team profiles use only their
  configured emojis, may define custom categories or a flat list, and keep
  show/dim preferences isolated per profile.
- Show profile buttons only at the bottom of the gear panel: `user_settings`
  first, then discovered team profiles sorted by id, with the active visible
  profile highlighted. When `default` is active, no row is highlighted, and no
  profile name appears on the main view.

### Copy behavior and accessibility

- Every emoji is a keyboard-accessible button with an accessible name. The
  hover tooltip is always the GitHub shortcode (for example `:art:`).
- When the image URL contains a Unicode code-point path such as
  `/unicode/1f3a8.png`, copy the native Unicode character; otherwise copy the
  GitHub shortcode such as `:suspect:`.
- Show the copied value in the persistent status and surface clipboard failures
  clearly using `role="status"`, `role="alert"`, and `aria-live` regions.
  Keep visible keyboard focus on all controls.

### Localization (six languages, no library)

- Fully translate every visible string and accessible name into Arabic (`ar`),
  Chinese (`zh`), English (`en`), French (`fr`), Russian (`ru`), and Spanish
  (`es`) using a hand-written catalog such as
  `src/features/github-emojis/model/localization.ts`.
- The language always comes from `user_settings.language`, even while the
  hidden `default` profile or a team profile is active. Switching team profiles
  changes only emojis and categories, never the language.
- The gear-menu language radios are live: selecting one translates the whole
  UI, updates all labels, and sets `lang`/`dir` on `<html>` (Arabic is RTL).
  The loading skeleton and error boundary use a synchronous language hint so
  they also appear translated.

### Search: direct matching plus exactly three semantic routes

- Keep direct search by emoji name and section name. Normalize queries so
  localized text, case, and diacritics work.
- Implement semantic suggestions only through a small explicit route table
  `emojiSearchRoutes.ts` with these three routes:
  - `design` / `تصميم` / `设计` / `design` / `дизайн` / `diseño` →
    `:art: :fish_cake: :framed_picture:`
  - `ai` / `الذكاء الاصطناعي` / `人工智能` / `ia` / `ии` / `ia` →
    `:robot: :rocket:`
  - `robo` / `روبوت` / `机器人` / `robot` / `робот` / `robot` → `:robot:`
- Every suggestion must resolve to a real GitHub catalog entry. Add suggestions
  to direct matches, deduplicated and prioritized; do not add broad synonym
  lists or per-emoji descriptions yet.
- Define a typed, entirely empty structure for future manual descriptions:
  a shortcode title plus optional term arrays for each of the six languages.
  Do not add any entries. Community routes have their own typed structure and
  IndexedDB slot, but synchronization/download is intentionally not implemented.

### Local-first data and editable project files

- Store settings and team preferences in separate IndexedDB records in a
  database such as `gh-emoji-local`. Keep a per-emoji `localStorage` mirror as
  a catalog backup, updating only changed records except when initializing or
  repairing it.
- Provide a portable default user profile at `public/user_settings.json`
  (`id`, `language`, and a `categories` map of built-in sections with `show`
  and `dim` booleans). A changed file wins over the saved browser copy on next
  launch; otherwise gear-menu changes win. Offer a "Connect project folder"
  action (File System Access API, Chrome/Edge) so gear-menu edits write back
  to the JSON file.
- Provide editable team profile files under `public/team-profiles/*.json`
  (`designers_team`, `grocery_team`, `vegan_team`), each overriding a compiled
  `src/features/github-emojis/model/profiles/*_team.ts` default. A profile has
  either categorized entries (`id`, `name`, `emojiNames`, `show`, `dim`) or a
  flat `emojiNames` array. Discover profiles from every `*_team.ts` file.
  Editing a JSON file takes effect after a reload with no rebuild. Make the
  vegan profile a helpful example with Vegetables, Fruits, and Plants
  categories.
- Provide a portable offline cache under `public/emoji-cache/`:
  `manifest.json` (catalog, shortcode-to-file `imagePaths`, and GitHub `etag`
  plus check timestamp) and `images/` (one file per unique image URL, named
  by the SHA-256 hash of the URL). Load this cache first; once it exists, never
  contact GitHub to display emojis.
- On launch, when a project folder is connected, check GitHub with
  `If-None-Match` using the saved ETag so an unchanged catalog returns `304`
  with no data transfer. When the catalog changed, download only added or
  updated image URLs, reuse unchanged hashed files, remove stale ones, and
  re-download any manually deleted images. Let a gear-menu action build or
  force-rebuild the cache by selecting the project `public` folder.
- Add PWA install metadata (`public/manifest.webmanifest`) and a service worker
  (`public/sw.js`) that caches the app shell, manifest, and images for offline
  use. Register the service worker only in production builds.

### Tests and quality

- Add CodeceptJS browser tests using the already-installed `codeceptjs` and
  `playwright` dev dependencies, with `npm test` (headless) and
  `npm run test:headful` scripts. A config should start its own Vite server and
  use locally installed Chrome. Cover: language switching and translated
  accessible labels, Arabic RTL metadata, team-profile language persistence,
  the three search routes, editing `user_settings.json`, editing a team profile
  JSON, and detecting the project cache.
- Keep API errors explicit; preserve loading, empty, and error states.
- Keep classification, routes, indexing, localization, and UI in their
  respective model/API/UI layers.
- Run `npm run lint`, `npm run build`, and `npm test`, and verify route
  behavior and responsive layouts in a browser.
