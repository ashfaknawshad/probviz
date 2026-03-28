const CACHE_VERSION = 'probviz-v1'
const APP_SHELL_CACHE = `${CACHE_VERSION}-shell`
const RUNTIME_CACHE = `${CACHE_VERSION}-runtime`
const BASE_PATH = new URL(self.registration.scope).pathname

const APP_SHELL_ASSETS = [
  `${BASE_PATH}`,
  `${BASE_PATH}index.html`,
  `${BASE_PATH}manifest.webmanifest`,
  `${BASE_PATH}favicon.svg`,
  `${BASE_PATH}icons/icon-192.svg`,
  `${BASE_PATH}icons/icon-512.svg`,
  `${BASE_PATH}icons/apple-touch-icon.svg`,
]

const EXTERNAL_CACHEABLE_ORIGINS = ['https://fonts.bunny.net']

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(APP_SHELL_CACHE)
      .then((cache) => cache.addAll(APP_SHELL_ASSETS))
      .then(() => self.skipWaiting())
      .catch(() => self.skipWaiting()),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => !key.startsWith(CACHE_VERSION)).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', (event) => {
  const { request } = event

  if (request.method !== 'GET') {
    return
  }

  const url = new URL(request.url)
  const isExternalCacheable = EXTERNAL_CACHEABLE_ORIGINS.includes(url.origin)
  const isSameOriginStatic = url.origin === self.location.origin

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone()
          caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, copy))
          return response
        })
        .catch(async () => {
          const cached = await caches.match(request)
          if (cached) {
            return cached
          }
          return caches.match(`${BASE_PATH}index.html`)
        }),
    )
    return
  }

  if (isExternalCacheable || isSameOriginStatic) {
    event.respondWith(
      caches.match(request).then((cached) => {
        const networkFetch = fetch(request)
          .then((response) => {
            if (response.ok) {
              const copy = response.clone()
              caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, copy))
            }
            return response
          })
          .catch(() => cached)

        return cached || networkFetch
      }),
    )
  }
})
