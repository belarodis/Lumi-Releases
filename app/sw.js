// Lumi no celular's service worker: keeps the app's own files on the phone, so it opens without the
// internet. The notes themselves are kept by the page (IndexedDB) and the account server is never
// cached here. mobile/vite.config.ts fills in the version and the list of files at build time.

const VERSION = '3100bcc330ff'
const FILES = ["./","assets/index-DS2Uz5FF.js","assets/index-DkTklyDq.css","assets/lumi-mark-Dc0YjRQ3.png","fonts/OFL.txt","fonts/outfit-latin.woff2","icons/apple-touch-icon.png","icons/bubble.png","icons/favicon-32.png","icons/icon-192.png","icons/icon-512.png","icons/icon-maskable-512.png","manifest.webmanifest"]
const CACHE = `lumi-app-${VERSION}`

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(FILES))
      .then(() => self.skipWaiting())
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key.startsWith('lumi-app-') && key !== CACHE).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', (event) => {
  const request = event.request
  if (request.method !== 'GET') return
  const url = new URL(request.url)
  if (url.origin !== self.location.origin) return

  // The page itself: the newest when there's internet (a new version arrives), the kept one without.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() =>
        caches.match(new URL('./', self.registration.scope).href).then((page) => page || Response.error())
      )
    )
    return
  }

  event.respondWith(caches.match(request).then((kept) => kept || fetch(request)))
})
