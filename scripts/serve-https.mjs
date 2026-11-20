import { createReadStream } from 'node:fs'
import { readFile, stat } from 'node:fs/promises'
import * as http from 'node:http'
import * as https from 'node:https'
import { extname, relative, resolve } from 'node:path'
import { pipeline } from 'node:stream'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('../dist/', import.meta.url))
const api = new URL(process.env.API_TARGET ?? 'http://127.0.0.1:8080')
const media = new URL(process.env.S3_TARGET ?? 'http://127.0.0.1:9000')
const certPath = process.env.TLS_CERT ?? new URL('../certs/comets.pem', import.meta.url)
const keyPath = process.env.TLS_KEY ?? new URL('../certs/comets-key.pem', import.meta.url)
const host = process.env.HTTPS_HOST ?? '0.0.0.0'
const port = Number(process.env.HTTPS_PORT ?? 3443)
const mime = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.js': 'text/javascript; charset=utf-8',
  '.mp4': 'video/mp4',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webmanifest': 'application/manifest+json',
}

function proxy(request, response, upstream, path) {
  const headers = { ...request.headers, host: upstream.host }
  delete headers.connection
  const transport = upstream.protocol === 'https:' ? https : http
  const remote = transport.request(upstream, {
    method: request.method,
    path,
    headers,
    timeout: 30_000,
  }, (incoming) => {
    response.writeHead(incoming.statusCode, incoming.headers)
    pipeline(incoming, response, () => {})
  })

  remote.on('timeout', () => remote.destroy(new Error('Истекло время ожидания сервиса')))
  remote.on('error', (error) => {
    if (response.destroyed) return
    console.error(error.message)
    if (response.headersSent) {
      response.destroy()
      return
    }
    response.writeHead(502, { 'Content-Type': 'application/json; charset=utf-8' })
    response.end(JSON.stringify({ message: 'Сервис временно недоступен' }))
  })
  response.on('close', () => {
    if (!response.writableEnded) remote.destroy()
  })
  request.pipe(remote)
}

async function serveFile(request, response, pathname) {
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    response.writeHead(405, { Allow: 'GET, HEAD' }).end()
    return
  }
  const route = /^\/(?:feed(?:\/[^/]+)?|comets|add|login)?\/?$/.test(pathname)
  const decoded = decodeURIComponent(pathname)
  const file = resolve(root, route ? 'index.html' : `.${decoded}`)
  const pathFromRoot = relative(root, file)
  if (!pathFromRoot || pathFromRoot.startsWith('..') || /[\\:\0]/.test(decoded)) {
    response.writeHead(404).end()
    return
  }
  const info = await stat(file).catch(() => null)
  if (!info?.isFile()) {
    response.writeHead(404).end()
    return
  }

  const headers = {
    'Content-Type': mime[extname(file)] ?? 'application/octet-stream',
    'Accept-Ranges': 'bytes',
    'Content-Length': info.size,
  }
  const range = /^bytes=(\d*)-(\d*)$/.exec(request.headers.range ?? '')
  const start = range?.[1] ? Number(range[1]) : Math.max(0, info.size - Number(range?.[2]))
  const end = range?.[1] && range[2] ? Math.min(Number(range[2]), info.size - 1) : info.size - 1
  if (range && (start > end || (!range[1] && !range[2]))) {
    response.writeHead(416, { 'Content-Range': `bytes */${info.size}` }).end()
    return
  }
  if (range) {
    headers['Content-Range'] = `bytes ${start}-${end}/${info.size}`
    headers['Content-Length'] = end - start + 1
  }
  response.writeHead(range ? 206 : 200, headers)
  if (request.method === 'HEAD') response.end()
  else pipeline(createReadStream(file, range ? { start, end } : {}), response, () => {})
}

const [cert, key, index] = await Promise.all([
  readFile(certPath).catch(() => { throw new Error('Нет сертификата. Выполните npm run cert:https -- <LAN-IP>') }),
  readFile(keyPath).catch(() => { throw new Error('Нет ключа. Выполните npm run cert:https -- <LAN-IP>') }),
  readFile(new URL('../dist/index.html', import.meta.url))
    .catch(() => { throw new Error('Нет сборки. Выполните npm run build') }),
])
if (index.includes('manifest.webmanifest')) {
  throw new Error('В dist находится сборка GitHub Pages. Выполните npm run build')
}

https.createServer({ cert, key }, async (request, response) => {
  try {
    const { pathname, search } = new URL(request.url, 'https://comets.local')
    if (pathname === '/api' || pathname.startsWith('/api/')) {
      proxy(request, response, api, pathname + search)
    } else if (pathname.startsWith('/s3/comets/') && ['GET', 'HEAD'].includes(request.method)) {
      proxy(request, response, media, pathname.slice('/s3'.length) + search)
    } else {
      await serveFile(request, response, pathname)
    }
  } catch (error) {
    console.error(error.message)
    if (response.headersSent) response.destroy()
    else response.writeHead(400).end()
  }
}).listen(port, host, () => console.log(`Кометы HTTPS · ${host}:${port}\n/api → ${api.origin}\n/s3 → ${media.origin}`))
