import {
  chooseProjectPublicDirectory,
  getSavedProjectPublicDirectory,
  readProjectJsonFile,
  writeProjectJsonFile,
  type ProjectDirectoryHandle,
} from './projectFileAccess'
import type { CatalogFetchResult } from './getGhEmojiData'

export type ProjectEmojiCache = {
  schemaVersion: 1
  generatedAt: string
  catalog: Record<string, string>
  imagePaths: Record<string, string>
  /** GitHub's ETag for the catalog. Sent as If-None-Match on the next launch. */
  etag?: string
  lastCheckedAt?: string
}

type CacheProgress = {
  completed: number
  total: number
}

const cacheDirectoryName = 'emoji-cache'
const imageDirectoryName = 'images'

function getCacheBaseUrl() {
  const baseUrl = import.meta.env.BASE_URL
  return `${baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`}${cacheDirectoryName}/`
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function validateProjectEmojiCache(value: unknown): ProjectEmojiCache {
  if (!isRecord(value)) {
    throw new Error('The project emoji cache manifest is invalid.')
  }

  const { schemaVersion, generatedAt, catalog, imagePaths, etag, lastCheckedAt } = value
  if (
    schemaVersion !== 1 ||
    typeof generatedAt !== 'string' ||
    !isRecord(catalog) ||
    !isRecord(imagePaths) ||
    (etag !== undefined && typeof etag !== 'string') ||
    (lastCheckedAt !== undefined && typeof lastCheckedAt !== 'string')
  ) {
    throw new Error('The project emoji cache manifest is invalid.')
  }

  if (
    !Object.entries(catalog).every(
      ([name, url]) => name.length > 0 && typeof url === 'string',
    ) ||
    !Object.entries(imagePaths).every(
      ([name, path]) =>
        name.length > 0 &&
        typeof path === 'string' &&
        path.startsWith(`${imageDirectoryName}/`) &&
        !path.includes('..'),
    ) ||
    !Object.keys(catalog).every((name) => typeof imagePaths[name] === 'string')
  ) {
    throw new Error('The project emoji cache manifest is invalid.')
  }

  return {
    schemaVersion,
    generatedAt,
    catalog: catalog as Record<string, string>,
    imagePaths: imagePaths as Record<string, string>,
    etag: etag as string | undefined,
    lastCheckedAt: lastCheckedAt as string | undefined,
  }
}

export async function loadProjectEmojiCache(): Promise<ProjectEmojiCache | undefined> {
  let response: Response
  try {
    response = await fetch(`${getCacheBaseUrl()}manifest.json`, {
      cache: 'no-store',
      headers: { Accept: 'application/json' },
    })
  } catch (error) {
    if (error instanceof TypeError) {
      return undefined
    }
    throw error
  }
  if (response.status === 404) {
    return undefined
  }
  if (!response.ok) {
    throw new Error(`Could not read the project emoji cache: ${response.status}`)
  }
  if (!response.headers.get('content-type')?.includes('application/json')) {
    return undefined
  }

  const value: unknown = await response.json()
  return validateProjectEmojiCache(value)
}

export function getProjectEmojiImageUrls(
  cache: ProjectEmojiCache,
): Record<string, string> {
  const cacheBaseUrl = getCacheBaseUrl()
  return Object.fromEntries(
    Object.entries(cache.imagePaths).map(([name, path]) => [name, `${cacheBaseUrl}${path}`]),
  )
}

async function writeFile(
  directory: ProjectDirectoryHandle,
  name: string,
  data: Blob,
): Promise<void> {
  const file = await directory.getFileHandle(name, { create: true })
  const writable = await file.createWritable()
  await writable.write(data)
  await writable.close()
}

async function hasFile(directory: ProjectDirectoryHandle, name: string): Promise<boolean> {
  try {
    await directory.getFileHandle(name)
    return true
  } catch (error) {
    if (error instanceof DOMException && error.name === 'NotFoundError') {
      return false
    }
    throw error
  }
}

async function getImageHash(url: string): Promise<string> {
  const digest = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(url),
  )
  return [...new Uint8Array(digest)]
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
}

function getImageExtension(contentType: string): string {
  const extensions: Record<string, string> = {
    'image/gif': 'gif',
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/svg+xml': 'svg',
    'image/webp': 'webp',
  }
  const extension = extensions[contentType.split(';', 1)[0].trim().toLowerCase()]
  if (!extension) {
    throw new Error(`Unsupported emoji image type: ${contentType || 'unknown'}`)
  }
  return extension
}

async function fetchImage(url: string): Promise<{ blob: Blob; extension: string }> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 15_000)
  try {
    const response = await fetch(url, { signal: controller.signal })
    if (!response.ok) {
      throw new Error(`Could not download an emoji image: ${response.status} (${url})`)
    }

    const blob = await response.blob()
    if (blob.size === 0) {
      throw new Error(`GitHub returned an empty emoji image (${url}).`)
    }

    return {
      blob,
      extension: getImageExtension(response.headers.get('content-type') ?? blob.type),
    }
  } catch (error) {
    if (controller.signal.aborted) {
      throw new Error(`Timed out while downloading an emoji image (${url}).`)
    }
    throw error
  } finally {
    clearTimeout(timeout)
  }
}

export async function rebuildProjectEmojiCache(
  fetchCatalog: () => Promise<Record<string, string>>,
  onProgress: (progress: CacheProgress) => void,
): Promise<ProjectEmojiCache> {
  const publicDirectory = await chooseProjectPublicDirectory()
  const previousCache = await loadProjectEmojiCache()
  const catalog = await fetchCatalog()
  return writeProjectEmojiCache(publicDirectory, previousCache, catalog, onProgress)
}

async function writeProjectEmojiCache(
  publicDirectory: ProjectDirectoryHandle,
  previousCache: ProjectEmojiCache | undefined,
  catalog: Record<string, string>,
  onProgress: (progress: CacheProgress) => void,
  etag?: string,
): Promise<ProjectEmojiCache> {
  const cacheDirectory = await publicDirectory.getDirectoryHandle(cacheDirectoryName, {
    create: true,
  })
  const imageDirectory = await cacheDirectory.getDirectoryHandle(imageDirectoryName, {
    create: true,
  })
  const imagePaths: Record<string, string> = {}
  const downloadTasks = new Map<string, { url: string; names: string[] }>()

  for (const [name, url] of Object.entries(catalog)) {
    const previousPath = previousCache?.catalog[name] === url
      ? previousCache.imagePaths[name]
      : undefined
    if (previousPath && await hasFile(imageDirectory, previousPath.slice(`${imageDirectoryName}/`.length))) {
      imagePaths[name] = previousPath
      continue
    }

    const task = downloadTasks.get(url)
    if (task) {
      task.names.push(name)
    } else {
      downloadTasks.set(url, { url, names: [name] })
    }
  }

  const tasks = [...downloadTasks.values()]
  let nextTask = 0
  let completed = 0
  let failure: unknown
  onProgress({ completed, total: tasks.length })

  const worker = async () => {
    while (failure === undefined) {
      const taskIndex = nextTask
      nextTask += 1
      const task = tasks[taskIndex]
      if (!task) {
        return
      }

      try {
        const { blob, extension } = await fetchImage(task.url)
        const hash = await getImageHash(task.url)
        const fileName = `${hash}.${extension}`
        const imagePath = `${imageDirectoryName}/${fileName}`
        await writeFile(imageDirectory, fileName, blob)
        for (const name of task.names) {
          imagePaths[name] = imagePath
        }
        completed += 1
        onProgress({ completed, total: tasks.length })
      } catch (error) {
        failure = error
      }
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(8, tasks.length) }, () => worker()),
  )
  if (failure !== undefined) {
    throw failure
  }

  const cache: ProjectEmojiCache = {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    catalog,
    imagePaths,
    etag,
    lastCheckedAt: new Date().toISOString(),
  }
  await writeProjectJsonFile(cacheDirectory, 'manifest.json', cache)

  const activeImageFiles = new Set(
    Object.values(imagePaths).map((path) => path.slice(`${imageDirectoryName}/`.length)),
  )
  const previousImageFiles = new Set(
    Object.values(previousCache?.imagePaths ?? {}).map((path) =>
      path.slice(`${imageDirectoryName}/`.length),
    ),
  )
  for (const fileName of previousImageFiles) {
    if (!activeImageFiles.has(fileName)) {
      try {
        await imageDirectory.removeEntry(fileName)
      } catch (error) {
        if (!(error instanceof DOMException && error.name === 'NotFoundError')) {
          throw error
        }
      }
    }
  }

  return cache
}

export type ProjectEmojiRefresh = {
  cache: ProjectEmojiCache
  added: number
  updated: number
  removed: number
  repaired: number
}

/**
 * Launch-time check for an already connected project cache.
 *
 * - Local image files are checked first (no network). A manually deleted image
 *   is downloaded again without touching the other images.
 * - The catalog request sends If-None-Match with the saved ETag. GitHub answers
 *   304 when nothing changed, so a full 1900-entry catalog is not transferred.
 * - Only genuinely changed image URLs are downloaded; unchanged URLs reuse
 *   their existing local file.
 */
export async function refreshConnectedProjectEmojiCache(
  fetchCatalog: (etag?: string) => Promise<CatalogFetchResult>,
  onProgress: (progress: CacheProgress) => void,
): Promise<ProjectEmojiRefresh | undefined> {
  const publicDirectory = await getSavedProjectPublicDirectory()
  if (!publicDirectory) {
    return undefined
  }

  const cacheDirectory = await publicDirectory.getDirectoryHandle(cacheDirectoryName)
  const previousRecord = await readProjectJsonFile<unknown>(cacheDirectory, 'manifest.json')
  if (previousRecord === undefined) {
    return undefined
  }
  const previousCache = validateProjectEmojiCache(previousRecord)
  const imageDirectory = await cacheDirectory.getDirectoryHandle(imageDirectoryName)

  const imageFiles = new Set(
    Object.values(previousCache.imagePaths).map((path) =>
      path.slice(`${imageDirectoryName}/`.length),
    ),
  )
  let repaired = 0
  for (const fileName of imageFiles) {
    if (!(await hasFile(imageDirectory, fileName))) {
      repaired += 1
    }
  }

  const fetched = await fetchCatalog(previousCache.etag)
  const catalog = fetched.notModified ? previousCache.catalog : fetched.catalog
  const added = Object.keys(catalog).filter((name) => !(name in previousCache.catalog)).length
  const removed = Object.keys(previousCache.catalog).filter((name) => !(name in catalog)).length
  const updated = Object.keys(catalog).filter(
    (name) =>
      name in previousCache.catalog &&
      catalog[name] !== previousCache.catalog[name],
  ).length
  const etag = fetched.etag ?? previousCache.etag

  if (added + updated + removed === 0 && repaired === 0) {
    // A 304 (or an identical catalog) must not rewrite the manifest on every
    // launch. Only record a newly received validator for the next check.
    if (!fetched.notModified && etag && etag !== previousCache.etag) {
      const cache: ProjectEmojiCache = {
        ...previousCache,
        etag,
        lastCheckedAt: new Date().toISOString(),
      }
      await writeProjectJsonFile(cacheDirectory, 'manifest.json', cache)
      return { cache, added, updated, removed, repaired }
    }
    return { cache: previousCache, added, updated, removed, repaired }
  }

  const cache = await writeProjectEmojiCache(
    publicDirectory,
    previousCache,
    catalog,
    onProgress,
    etag,
  )
  return { cache, added, updated, removed, repaired }
}
