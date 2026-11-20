const SHELL_CACHE = 'gh-emoji-shell-v3'
const IMAGE_CACHE = 'gh-emoji-images-v1'
const APP_SHELL = [
  './',
  './manifest.webmanifest',
  './favicon.svg',
  './pwa-icon.svg',
  './user_settings.json',
]

async function clearProjectCacheAssets(cache) {
  const requests = await cache.keys()
  await Promise.all(
    requests
      .filter((request) => new URL(request.url).pathname.includes('/emoji-cache/'))
      .map((request) => cache.delete(request)),
  )
}

async function cacheProjectImages(cache, manifestUrl, manifest) {
  const imagePaths = Object.values(manifest.imagePaths ?? {}).filter(
    (path) =>
      typeof path === 'string' &&
      path.startsWith('images/') &&
      !path.includes('..'),
  )
  const imageUrls = [...new Set(imagePaths.map((path) => new URL(path, manifestUrl).href))]
  const activeImageUrls = new Set(imageUrls)
  let nextIndex = 0

  const worker = async () => {
    while (nextIndex < imageUrls.length) {
      const imageUrl = imageUrls[nextIndex]
      nextIndex += 1
      if (await cache.match(imageUrl, { ignoreVary: true })) {
        continue
      }

      const response = await fetch(imageUrl)
      if (response.ok) {
        await cache.put(imageUrl, response)
      }
    }
  }

  await Promise.all(Array.from({ length: Math.min(8, imageUrls.length) }, worker))

  const requests = await cache.keys()
  await Promise.all(
    requests
      .filter((request) => {
        const url = new URL(request.url)
        return (
          url.pathname.includes('/emoji-cache/images/') &&
          !activeImageUrls.has(request.url)
        )
      })
      .map((request) => cache.delete(request)),
  )
}

async function cacheProjectManifest(cache) {
  const manifestUrl = new URL('emoji-cache/manifest.json', self.registration.scope)
  const response = await fetch(manifestUrl, { cache: 'no-store' })
  if (
    !response.ok ||
    !response.headers.get('content-type')?.includes('application/json')
  ) {
    return
  }

  const manifest = await response.clone().json()
  await cache.put(manifestUrl, response)
  await cacheProjectImages(cache, manifestUrl.href, manifest)
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then(async (cache) => {
      await cache.addAll(APP_SHELL)
      const page = await fetch('./')
      if (!page.ok) {
        throw new Error(`Could not cache the app shell: ${page.status}`)
      }

      const html = await page.clone().text()
      const buildAssets = Array.from(
        html.matchAll(/(?:src|href)="([^"]+\.(?:js|css))"/g),
        (match) => match[1],
      )
      await cache.addAll(buildAssets)
      try {
        await cacheProjectManifest(cache)
      } catch (error) {
        console.error('Could not pre-cache project emoji files:', error)
      }
    })
      .then(() => self.skipWaiting()),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((names) =>
        Promise.all(
          names
            .filter(
              (name) =>
                name.startsWith('gh-emoji-') &&
                name !== SHELL_CACHE &&
                name !== IMAGE_CACHE,
            )
            .map((name) => caches.delete(name)),
        ),
      )
      .then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') {
    return
  }

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone()
          void caches.open(SHELL_CACHE).then((cache) => cache.put(request, copy))
          return response
        })
        .catch(async () => {
          const cachedPage = await caches.match(request, { ignoreVary: true })
          return cachedPage ?? (await caches.match('./', { ignoreVary: true }))
        }),
    )
    return
  }

  const requestUrl = new URL(request.url)
  if (
    requestUrl.origin === self.location.origin &&
    requestUrl.pathname.includes('/emoji-cache/')
  ) {
    const cachedResponse = fetch(request, { cache: 'no-store' }).then(async (response) => {
      const cache = await caches.open(SHELL_CACHE)
      const isManifest = requestUrl.pathname.endsWith('/manifest.json')
      const isJson = response.headers.get('content-type')?.includes('application/json')
      if (response.ok && (!isManifest || isJson)) {
        await cache.put(request, response.clone())
      } else if (!response.ok || isManifest) {
        await clearProjectCacheAssets(cache)
      }
      return response
    })
    event.respondWith(
      cachedResponse
        .then((response) => response.clone())
        .catch(async () => {
          const cachedAsset = await caches.match(request, { ignoreVary: true })
          return cachedAsset ?? new Response('', { status: 404 })
        }),
    )
    event.waitUntil(
      cachedResponse
        .then(async (response) => {
          if (
            response.ok &&
            requestUrl.pathname.endsWith('/manifest.json') &&
            response.headers.get('content-type')?.includes('application/json')
          ) {
            const manifest = await response.clone().json()
            const cache = await caches.open(SHELL_CACHE)
            await cacheProjectImages(cache, request.url, manifest)
          }
        })
        .catch((error) => {
          console.error('Could not update the offline emoji cache:', error)
        }),
    )
    return
  }

  if (request.destination === 'image') {
    event.respondWith(
      caches.open(IMAGE_CACHE).then(async (cache) => {
        const cachedImage = await cache.match(request, { ignoreVary: true })
        if (cachedImage) {
          return cachedImage
        }

        const response = await fetch(request)
        if (response.ok || response.type === 'opaque') {
          await cache.put(request, response.clone())
        }
        return response
      }),
    )
    return
  }

  if (requestUrl.origin === self.location.origin) {
    event.respondWith(
      caches.open(SHELL_CACHE).then(async (cache) => {
        const cachedResource = await cache.match(request, { ignoreVary: true })
        if (cachedResource) {
          return cachedResource
        }

        const response = await fetch(request)
        if (response.ok) {
          await cache.put(request, response.clone())
        }
        return response
      }),
    )
  }
})
