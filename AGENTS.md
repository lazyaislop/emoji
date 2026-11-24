# Agent guide

## Project

Client-only GitHub emoji browser built with React 19, TypeScript, and Vite.
It fetches the catalog from `https://api.github.com/emojis`; there is no
backend, router, or state-management package.

## Data flow

1. `src/main.tsx` mounts `src/App.tsx`; the app wraps the emoji view in
   `Suspense`.
2. `src/features/github-emojis/api/getGhEmojiData.ts` prefers the project
   `public/emoji-cache/manifest.json` and local image files, then falls back to
   the IndexedDB catalog (with a per-emoji localStorage backup) and GitHub.
   `projectEmojiCache.ts` rebuilds the project cache incrementally.
3. `src/features/github-emojis/model/emoji.ts` classifies emoji sections and
   derives clipboard text from each API URL. Unicode image URLs copy as native
   Unicode; GitHub-only entries copy as `:shortcodes:`.
4. `src/features/github-emojis/model/emojiSearch.ts` indexes names and section
   names. `emojiSearchRoutes.ts` defines curated route structures and the empty
   future-description schema; community routes are loaded from their separate
   local IndexedDB record.
5. `src/features/github-emojis/model/settings.ts` defines user and team
   profile shapes. Team profiles are discovered from `*_team.ts` files under
   `src/features/github-emojis/model/profiles/` and persisted independently.
   `api/projectTeamProfiles.ts` lets editable files under
   `public/team-profiles/*.json` override those compiled defaults at runtime.
6. `src/features/github-emojis/model/localization.ts` holds the hand-written
   six-language message catalog. The UI language always comes from
   `user_settings.language`, even when the hidden `default` or a team profile
   is active.
7. `src/features/github-emojis/ui/EmojiGhView.tsx` switches profiles, applies
   each profile's categories and emoji list, and renders the search/settings
   controls.
8. `public/manifest.webmanifest` and `public/sw.js` provide install metadata,
   app-shell offline support, and runtime caching for project cache assets.
   `api/projectEmojiCache.ts` checks GitHub with `If-None-Match` on launch and
   only downloads changed or missing images.
9. `public/emoji_emotions.json` is the human-editable semantic search data.
   It is fetched once at startup and kept in memory for offline use.
   `src/features/github-emojis/model/emojiEmotions.ts` builds an in-memory
   index and matches query tokens against per-emoji descriptions in all six
   languages at once (no language switch needed). An emoji appears when at
   least `defaultMatchThreshold` (default 0.5 / 50%) of query tokens match.
   Search is prefix-tolerant for tokens of 3+ characters.

## Product invariants

- Keep semantic search limited to the explicit routes in
  `emojiSearchRoutes.ts` and the typed community-route data. Add no ad-hoc
  aliases elsewhere. Community route synchronization is not implemented.
- Keep `emojiSearchDescriptions` empty until descriptions are requested.
  It is typed for a shortcode title and optional arrays in the six UN
  languages (`ar`, `zh`, `en`, `fr`, `ru`, `es`).
- Route suggestions must refer to shortcodes present in GitHub's API. Preserve
  direct matching against emoji names and section names.
- Categories have independent show and dim preferences. Hidden sections stay
  available in the gear menu. The hidden first-launch `default` profile shows
  all categories except Countries, Unicode, and People; it dims those three as
  well as Clocks and Arrows. `Other` remains controllable there but renders
  without a section heading.
- Changes made while `default` is active automatically activate `user_settings`
  and save the modified settings there. Never list or display the `default`
  profile in the UI.
- The `user_settings` profile uses the built-in emoji sections. Each team
  profile uses only its configured emoji and may define custom categories or a
  flat list; category toggles are isolated per profile.
- Language is part of `user_settings`, always visible in the gear menu, and is
  not part of team settings. The language radios are live: they translate all
  visible strings and accessible names and set `<html lang>`/`dir` (Arabic is
  RTL). Switching to a team profile never changes the language.
- Keep profile buttons at the bottom of the gear panel only. Show
  `user_settings` first, then discovered team profiles, and highlight the
  active visible profile. When the hidden `default` profile is active, no
  profile row is highlighted. Do not display a profile name on the main view.
  Omit a category heading when only one category has visible results.
- Localization lives in `model/localization.ts`; add new strings to all six
  language tables. Do not introduce an i18n library. The gear-menu language
  radios must stay connected to real translation.
- Project emoji data and images live in `public/emoji-cache/`; the gear menu
  reports cache presence and provides the build/rebuild action there only.
  Settings continue to use separate browser-local IndexedDB records. The project
  cache must load without GitHub access once it exists.
- Keep each settings profile and community routes in separate IndexedDB
  records. Browser-local emoji catalog records and their localStorage mirror
  are fallback data; the portable offline catalog and images live separately
  as project files under `public/emoji-cache/`.
- Keep the emoji catalog's localStorage mirror as a backup path, updating only
  changed records except when initializing or repairing the backup.
- Keep the sticky search/status area and responsive order: desktop has title,
  copy status, and count above search; mobile keeps title and copy status
  above search and moves the count below it.
- Preserve accessible names for interactive controls and show clipboard
  failures to the user.
- Semantic search is additive to name/route search: results from
  `emojiSearchRoutes.ts` and direct name matching are unioned with emotion
  matches from `public/emoji_emotions.json`. Do not remove or bypass the
  name-based search path. Emotion matches are looked up in the live emoji
  catalog (`emojiData`) to get image URLs; entries whose `name` is not in the
  catalog are silently skipped.
- The emotions file is optional: if `public/emoji_emotions.json` is missing
  or unparseable, semantic search simply returns no matches and the app
  continues working with name/route search only.

## Where to make changes

- API access: `src/features/github-emojis/api/`
- Classification and clipboard representation: `src/features/github-emojis/model/emoji.ts`
- Search routes and future description schema:
  `src/features/github-emojis/model/emojiSearchRoutes.ts`
- Search indexing and matching: `src/features/github-emojis/model/emojiSearch.ts`
- UI and preferences: `src/features/github-emojis/ui/EmojiGhView.tsx`
- Global and responsive styles: `src/index.css`

## Commands

- `npm run dev` — start Vite
- `npm run lint` — run Oxlint
- `npm run build` — type-check and create a production build
- `npm run preview` — preview the production build
- `npm test` — run the CodeceptJS browser tests (headless Chrome via Playwright)
- `npm run test:headful` — run the same tests with a visible browser

Tests live in `tests/*.test.js`; `codecept.config.js` starts its own Vite
server and uses the locally installed Google Chrome. Editable project files
are `public/user_settings.json`, `public/team-profiles/*.json`, and
`public/emoji-cache/`.
