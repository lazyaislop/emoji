import { loadEmojiSnapshot, saveEmojiSnapshot, type EmojiDataChanges } from './localData'
import {
  getProjectEmojiImageUrls,
  loadProjectEmojiCache,
} from './projectEmojiCache'
import { hasProjectFileAccess } from './projectFileAccess'

const emojiFetchTimeoutMs = 8_000

export type RefreshedEmojiData = {
  data: Record<string, string>
  changes: EmojiDataChanges
}

export type LoadedEmojiData = {
  data: Record<string, string>
  imageUrls: Record<string, string>
  hasProjectCache: boolean
  refreshInBackground: boolean
}

export type CatalogFetchResult = {
  catalog: Record<string, string>
  etag?: string
  notModified: boolean
}

async function fetchGhEmojiCatalog(etag?: string): Promise<CatalogFetchResult> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), emojiFetchTimeoutMs)

  try {
    const response = await fetch('https://api.github.com/emojis', {
      signal: controller.signal,
      headers: etag ? { 'If-None-Match': etag } : undefined,
    })
    if (response.status === 304) {
      return { catalog: {}, etag, notModified: true }
    }
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`)
    }

    const data: unknown = await response.json()
    if (
      typeof data !== 'object' ||
      data === null ||
      Array.isArray(data) ||
      !Object.entries(data).every(([name, url]) => name.length > 0 && typeof url === 'string')
    ) {
      throw new Error('GitHub returned an invalid emoji catalog.')
    }

    return {
      catalog: data as Record<string, string>,
      etag: response.headers.get('etag') ?? undefined,
      notModified: false,
    }
  } catch (error) {
    if (controller.signal.aborted) {
      throw new Error('Timed out while fetching GitHub emoji data.')
    }
    throw error
  } finally {
    clearTimeout(timeout)
  }
}

export async function getGhEmojiData(): Promise<LoadedEmojiData> {
  const projectCache = await loadProjectEmojiCache()
  if (projectCache) {
    return {
      data: projectCache.catalog,
      imageUrls: getProjectEmojiImageUrls(projectCache),
      hasProjectCache: true,
      refreshInBackground: await hasProjectFileAccess(),
    }
  }

  const savedData = await loadEmojiSnapshot()
  if (Object.keys(savedData).length > 0) {
    return {
      data: savedData,
      imageUrls: {},
      hasProjectCache: false,
      refreshInBackground: true,
    }
  }

  const data = await fetchGhEmojiData()
  await saveEmojiSnapshot(data)
  return { data, imageUrls: {}, hasProjectCache: false, refreshInBackground: false }
}

export { fetchGhEmojiCatalog, fetchGhEmojiData }

async function fetchGhEmojiData(): Promise<Record<string, string>> {
  return (await fetchGhEmojiCatalog()).catalog
}

async function fetchAndPersistEmojiData(): Promise<RefreshedEmojiData> {
  const data = await fetchGhEmojiData()
  const changes = await saveEmojiSnapshot(data)
  return { data, changes }
}

let refreshPromise: Promise<RefreshedEmojiData> | undefined

export function refreshGhEmojiData(): Promise<RefreshedEmojiData> {
  if (!refreshPromise) {
    refreshPromise = fetchAndPersistEmojiData().finally(() => {
      refreshPromise = undefined
    })
  }

  return refreshPromise
}
