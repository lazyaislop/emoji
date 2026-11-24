# Emoji Semantic Search Data — Human Guide

## What this file is

`public/emoji_emotions.json` is the human-editable source of truth for **semantic emoji search**.

When you type in the search box, the app matches your query against the descriptions in this file — across **all six languages at once** (Arabic, Chinese, English, French, Russian, Spanish). You never need to switch the UI language to search in another language.

## How search works

1. The app loads this file once at startup and keeps it in memory.
2. When you type a query, it is split into tokens (words).
3. For each emoji in the file, the app checks how many of your tokens appear in any of its descriptions (any language).
4. If at least **50%** (default) of your tokens match, the emoji appears in results.
5. Matches also work on word prefixes (3+ characters), so typing `квад` finds `квадрат` (square in Russian).

Example queries:
- `color` → all color emojis (red circle, blue square, etc.)
- `monkey` → all monkey emojis
- `квадрат` → square emojis (Russian description matched)
- `heart love` → heart emoji (both tokens match ≥50%)

## File location

```
public/emoji_emotions.json
```

It lives in the `public/` folder, so it is shipped with the app and works **fully offline** after the first load.

## File structure (top-level)

| Field | Type | Description |
|---|---|---|
| `version` | number | File format version (currently `1`). |
| `description` | string | Human-readable note about the file. |
| `languages` | string[] | The six language codes: `["ar","zh","en","fr","ru","es"]`. |
| `defaultMatchThreshold` | number | Minimum fraction of query tokens that must match (0–1). Default `0.5` = 50%. |
| `emojis` | array | One object per emoji (see below). |

## Each emoji entry

| Field | Type | Required | Description |
|---|---|---|---|
| `shortcode` | string | Yes | GitHub shortcode, e.g. `:monkey:`. |
| `name` | string | Yes | Emoji name without colons, e.g. `monkey`. Must match a key in the GitHub emoji catalog. |
| `section` | string | Yes | Emoji section (e.g. `Animals`, `Emotes`, `Colors`, `People`, `Celestial`, `Weather`, `Sports & activities`, `Arrows`, `Clocks`, `GitHub`, `Countries`, `Unicode`, `Other`). |
| `descriptions` | object | Yes | Keys are language codes (`ar`, `zh`, `en`, `fr`, `ru`, `es`); values are arrays of keyword strings describing the emoji in that language. |
| `matchThreshold` | number | No | Override the global threshold for this emoji only (0–1). |

### Example entry

```json
{
  "shortcode": ":monkey:",
  "name": "monkey",
  "section": "Animals",
  "descriptions": {
    "en": ["monkey", "primate", "animal", "jungle", "banana"],
    "ar": ["قرد", "primate", "حيوان", "غابة", "موز"],
    "zh": ["猴子", "灵长类", "动物", "丛林", "香蕉"],
    "fr": ["singe", "primate", "animal", "jungle", "banane"],
    "ru": ["обезьяна", "примат", "животное", "джунгли", "банан"],
    "es": ["mono", "primate", "animal", "selva", "plátano"]
  },
  "matchThreshold": 0.5
}
```

## How to add or update an emoji

1. Open `public/emoji_emotions.json` in any text editor.
2. Find the emoji by `name` in the `emojis` array, or add a new object at the end of the array.
3. Edit the `descriptions` for the languages you care about. Each entry is an array of keywords — add synonyms, related words, or translations.
4. Save the file. The app picks up changes on the next reload (no build step needed for the JSON file).
5. Keep valid JSON: comma-separated array items, quoted strings, no trailing commas.

### Adding a brand-new emoji

```json
{
  "shortcode": ":elephant:",
  "name": "elephant",
  "section": "Animals",
  "descriptions": {
    "en": ["elephant", "big animal", "trunk", "gray", "wildlife"],
    "ar": ["fil", "big animal", "trunk", "gray", "wildlife"],
    "zh": ["大象", "big animal", "trunk", "gray", "wildlife"],
    "fr": ["éléphant", "gros animal", "trompe", "gris", "faune"],
    "ru": ["слон", "big animal", "trunk", "gray", "wildlife"],
    "es": ["elefante", "gran animal", "trompa", "gris", "vida silvestre"]
  }
}
```

The `name` must match an emoji present in GitHub's catalog (`https://api.github.com/emojis`) or the project's offline cache, otherwise the app can't find its image URL.

## How to test offline

1. Build the app once: `npm run build`
2. Preview it: `npm run preview`
3. Turn off your network (or block `api.github.com`).
4. Search — results come entirely from `public/emoji_emotions.json` and the cached emoji data.

## Tips

- Write descriptions as simple keywords, not sentences: `["monkey", "primate", "animal"]` not `["a monkey is a primate animal"]`.
- Include synonyms and related concepts so more queries match.
- You can add descriptions in only some languages; unmatched languages are simply skipped.
- The file is UTF-8. Arabic, Chinese, Cyrillic, etc. all work natively.

## Regenerating from the live catalog

If you want to regenerate seed data from GitHub's emoji catalog, a generator script can be added at `scripts/generate-emoji-emotions.js`. It would fetch `https://api.github.com/emojis` and create stub `emoji_emotions.json` entries with empty descriptions for you to fill in manually.
