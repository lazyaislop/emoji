# Agent guide

## Project

Client-only GitHub emoji browser built with React 19, TypeScript, and Vite.
It fetches the catalog from `https://api.github.com/emojis`; there is no
backend, router, or state-management package.

## Data flow

1. `src/main.tsx` mounts `src/App.tsx`; the app wraps the emoji view in
   `Suspense`.
2. `src/features/github-emojis/api/getGhEmojiData.ts` fetches GitHub's emoji
   map and throws on an unsuccessful response.
3. `src/features/github-emojis/model/emoji.ts` classifies emoji sections and
   derives clipboard text from each API URL. Unicode image URLs copy as native
   Unicode; GitHub-only entries copy as `:shortcodes:`.
4. `src/features/github-emojis/model/emojiSearch.ts` indexes names and section
   names. `emojiSearchRoutes.ts` contains the only semantic routes and the
   intentionally empty schema for future manual descriptions.
5. `src/features/github-emojis/ui/EmojiGhView.tsx` filters and groups results,
   manages category preferences, and renders the search/settings controls.

## Product invariants

- Keep semantic search limited to the explicit routes in
  `emojiSearchRoutes.ts`. Add no ad-hoc aliases elsewhere.
- Keep `emojiSearchDescriptions` empty until descriptions are requested.
  It is typed for a shortcode title and optional arrays in the six UN
  languages (`ar`, `zh`, `en`, `fr`, `ru`, `es`).
- Route suggestions must refer to shortcodes present in GitHub's API. Preserve
  direct matching against emoji names and section names.
- Categories have independent show and dim preferences. Hidden sections stay
  available in the gear menu; Countries are dimmed by default. `Other` remains
  controllable there but renders without a section heading.
- The gear menu has visual-only language radios; do not connect them to
  localization.
- Keep the sticky search/status area and responsive order: desktop has title,
  copy status, and count above search; mobile keeps title and copy status
  above search and moves the count below it.
- Preserve accessible names for interactive controls and show clipboard
  failures to the user.

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

There is no test script configured in `package.json`.
