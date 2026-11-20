# GitHub emoji

A client-only, installable GitHub emoji browser built with React 19, TypeScript,
and Vite. It uses GitHub's public emoji map at `https://api.github.com/emojis`
as the catalog, plus a portable on-disk cache, so it can run fully offline.
There is no backend, router, or state-management library.

## Quick start

```bash
npm install
npm run dev        # http://localhost:5173
```

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the Vite development server |
| `npm run lint` | Run Oxlint |
| `npm run build` | Type-check and create a production build in `dist/` |
| `npm run preview` | Preview `dist/` with the PWA service worker enabled |
| `npm test` | Run the CodeceptJS browser tests (headless Chrome) |
| `npm run test:headful` | Same tests with a visible browser window |

`npm test` starts its own Vite server on `127.0.0.1:4173` and uses the locally
installed Google Chrome, so no separate terminal and no `playwright install`
step are needed. To run against an already-running server, set
`TEST_BASE_URL=http://127.0.0.1:5173`.

## Language, accessibility, and profiles

- The UI is fully translated into six languages — Arabic (`ar`), Chinese
  (`zh`), English (`en`), French (`fr`), Russian (`ru`), and Spanish (`es`) —
  using the hand-written catalog in
  `src/features/github-emojis/model/localization.ts`. No i18n library is used.
  The language radios in the gear menu are **live**: they change every visible
  string, all accessible labels, the `lang` and `dir` attributes on `<html>`,
  and Arabic switches the layout to right-to-left.
- The active language always comes from the `user_settings` profile. Switching
  to a team profile changes only the emojis and categories, never the language.
- The hidden first-launch `default` profile shows every category except
  Countries, Unicode, and People, and dims those three plus Clocks and Arrows.
  Changing any category or the language automatically switches to
  `user_settings` and saves there. The `default` profile is never listed in the
  gear menu and no profile name appears on the main view.
- `user_settings` uses the built-in emoji sections. Team profiles use only
  their configured emojis and may define custom categories or a flat list.
  Each profile's show/dim preferences are stored independently.
- Copy status, search, counts, and clipboard errors are announced through
  `role="status"`, `role="alert"`, and `aria-live` regions; every control has
  an accessible name. Search stays sticky while scrolling, with the count
  above the search box on desktop and below it on mobile.

## How data is stored

There are three independent layers. Each is editable as a local file or lives
in browser-local storage, and none of them require a server.

| Layer | Location | Purpose |
| --- | --- | --- |
| User settings file | `public/user_settings.json` | Portable default personal profile |
| Team profile files | `public/team-profiles/<id>.json` (with compiled defaults in `src/features/github-emojis/model/profiles/*_team.ts`) | Editable team emoji lists and categories |
| Emoji cache | `public/emoji-cache/manifest.json` and `public/emoji-cache/images/` | Portable offline catalog and images |
| Browser-local data | IndexedDB database `gh-emoji-local` plus a `localStorage` mirror | Per-profile preferences, active profile, community routes, catalog fallback |

Settings and team preferences are saved in separate IndexedDB records. The
browser catalog and its localStorage mirror are only a fallback; once the
project cache exists, the app never needs GitHub to display emojis.

## Editing settings as files

### User settings — `public/user_settings.json`

This is the human-editable personal profile. It is plain JSON with three
top-level fields:

```json
{
  "id": "user_settings",
  "language": "fr",
  "categories": {
    "Animals": { "show": true, "dim": false },
    "Countries": { "show": false, "dim": true }
  }
}
```

- `id` must be `user_settings`.
- `language` must be one of `ar`, `zh`, `en`, `fr`, `ru`, `es`.
- `categories` is a map of the built-in section names (`Other`, `Animals`,
  `Emotes`, `Sports & activities`, `Celestial`, `Weather`, `Unicode`, `Arrows`,
  `Clocks`, `Colors`, `People`, `Countries`, `GitHub`). Each value needs
  boolean `show` and `dim` fields. Omitted sections keep their defaults.

**Precedence:** on launch the app compares this file (or the copy inside a
connected project folder) with the last signature it recorded. If the file
changed, the file wins and is copied into browser storage. If it did not
change, preferences saved from the gear menu win. In practice: edit the JSON
file, then reload the page to apply it; after that, changes made in the gear
menu are saved back to the JSON file only if a project folder is connected.

To make edits write directly to the file, open the gear menu and choose
**Connect project folder**, then select this project's `public` directory in
Chrome or Edge. Folder access is required only for writing; editing the file
by hand always works because the app fetches `public/user_settings.json`.

### Team profiles — `public/team-profiles/*.json`

Every team has two files. The compiled TypeScript default provides the
profile on a fresh checkout; the JSON file overrides it at runtime so you can
edit emoji lists without rebuilding the app:

- `src/features/github-emojis/model/profiles/grocery_team.ts` → `public/team-profiles/grocery_team.json` (one category, 20 emojis)
- `src/features/github-emojis/model/profiles/designers_team.ts` → `public/team-profiles/designers_team.json` (flat list, 40 emojis)
- `src/features/github-emojis/model/profiles/vegan_team.ts` → `public/team-profiles/vegan_team.json` (Vegetables, Fruits, and Plants categories, 40 emojis)

Profiles are discovered from every `*_team.ts` file under
`src/features/github-emojis/model/profiles/`. To add a new team, add a
`*_team.ts` file exporting `teamSettings` and, optionally, a matching
`public/team-profiles/<id>.json`.

A categorized profile looks like this (abridged):

```json
{
  "id": "vegan_team",
  "categories": [
    {
      "id": "vegetables",
      "name": "Vegetables",
      "emojiNames": ["avocado", "broccoli", "carrot"],
      "show": true,
      "dim": false
    }
  ]
}
```

A flat profile uses `"categories": []` and a top-level `"emojiNames"` array.
Only shortcode names from GitHub's catalog render; unknown names are skipped.
Show/dim toggles made in the gear menu are stored per profile in browser
storage and do not rewrite these JSON files.

**Adding an emoji to the vegan profile:** open
`public/team-profiles/vegan_team.json`, add the shortcode to the appropriate
category's `emojiNames` array, and reload the page:

```json
{
  "id": "vegetables",
  "name": "Vegetables",
  "emojiNames": ["avocado", "broccoli", "cactus"],
  "show": true,
  "dim": false
}
```

Keep `src/features/github-emojis/model/profiles/vegan_team.ts` in sync if you
want the change to survive a fresh checkout. No build step is required for the
JSON edit to take effect in development.

## Finding and rebuilding the image cache

The portable cache lives entirely under `public/emoji-cache/`:

- `public/emoji-cache/manifest.json` — the catalog (`catalog`), the mapping of
  shortcode to image file (`imagePaths`), and a GitHub `etag`/check timestamp.
- `public/emoji-cache/images/` — one PNG per unique GitHub image URL, named by
  the SHA-256 hash of that URL with a `.png` extension. Many shortcodes can
  share one image file.

To find it:

```bash
ls public/emoji-cache
ls public/emoji-cache/images | head
```

To force a full rebuild: delete both the manifest and the images, then reload
the app and use the gear menu's **Build offline cache** action. You can also
delete only selected image files: on the next launch the app notices the
missing files and re-downloads just those, leaving every other image untouched.

```bash
rm -rf public/emoji-cache
# then, in the app: Settings -> Build offline cache -> choose the public folder
```

**Cache rebuild behavior:** the launch-time check sends GitHub's saved `etag`
as `If-None-Match`. A `304 Not Modified` response transfers no catalog data.
When the catalog did change, only added, updated, or removed emoji URLs are
downloaded; unchanged URLs reuse their existing hashed files. The same applies
to the service worker's runtime image cache in
`public/sw.js`. Building or rebuilding needs internet access and a browser
with folder access (Chrome or Edge). Build the cache before `npm run build` so
it is copied into `dist/`; when using `npm run preview`, pick `dist` as the
folder to refresh the served copy.

## Search routes

Ordinary search matches emoji names and section names directly. Semantic
suggestions exist only for the three explicit routes defined in
`src/features/github-emojis/model/emojiSearchRoutes.ts` (`design`, `ai`, and
`robo`, each with terms in all six languages). Community routes have their own
typed structure and IndexedDB slot, but synchronization/download is
intentionally not implemented. The future description schema
(`emojiSearchDescriptions`) is intentionally empty until descriptions are
requested.

## PWA and future portability

- `public/manifest.webmanifest` provides install metadata and `public/sw.js`
  caches the app shell, the manifest, and every referenced image for offline
  use on Android and desktop. Service worker registration happens only in
  production builds.
- All data access goes through the framework-agnostic modules in
  `src/features/github-emojis/api/` and `model/`. The React component
  `src/features/github-emojis/ui/EmojiGhView.tsx` only orchestrates state and
  rendering, so it can be replaced by Svelte, Vue, or Angular with minimal
  changes to the core logic.
- Because settings, team profiles, and the emoji cache are ordinary files
  under `public/`, the same data can be shipped with a future VS Code extension
  or copied between machines without relying on browser storage.
