const scope = self.registration.scope
const cachePrefix = `comets:${scope}:`
const cacheName = cachePrefix + VERSION
const cachedUrls = new Set(FILES.map((file) => new URL(file, scope).href))
const indexUrl = new URL('index.html', scope).href

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(cacheName)
    await cache.addAll([...cachedUrls].map((url) => new Request(url, { cache: 'reload' })))
  })())
})

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys()
    await Promise.all(keys.filter((key) => key.startsWith(cachePrefix) && key !== cacheName)
      .map((key) => caches.delete(key)))
    await self.clients.claim()
  })())
})

// Safari и Chromium могут запрашивать диапазон байтов видео даже при локальном воспроизведении.
async function mediaRange(response, range) {
  const bytes = await response.blob()
  const match = /^bytes=(\d*)-(\d*)$/.exec(range)
  const start = match?.[1] ? Number(match[1]) : Math.max(0, bytes.size - Number(match?.[2]))
  const end = match?.[1] && match[2] ? Math.min(Number(match[2]), bytes.size - 1) : bytes.size - 1
  if (!match || (!match[1] && !match[2]) || start > end) {
    return new Response(null, { status: 416, headers: { 'Content-Range': `bytes */${bytes.size}` } })
  }
  return new Response(bytes.slice(start, end + 1, bytes.type), {
    status: 206,
    headers: {
      'Content-Type': bytes.type || 'video/mp4',
      'Content-Range': `bytes ${start}-${end}/${bytes.size}`,
      'Content-Length': String(end - start + 1),
      'Accept-Ranges': 'bytes',
    },
  })
}

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return
  const url = new URL(request.url)
  url.search = ''
  url.hash = ''
  const navigation = request.mode === 'navigate' && (url.href === scope || url.href === indexUrl)
  if (!navigation && !cachedUrls.has(url.href)) return

  event.respondWith((async () => {
    const cache = await caches.open(cacheName)
    const response = await cache.match(navigation ? indexUrl : url.href)
    if (!response) return fetch(request)
    const range = request.headers.get('Range')
    return range ? mediaRange(response, range) : response
  })())
})
