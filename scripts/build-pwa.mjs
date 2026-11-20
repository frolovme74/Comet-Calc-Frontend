import { createHash } from 'node:crypto'
import { cp, readFile, readdir, writeFile } from 'node:fs/promises'
import { join, relative, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

const dist = new URL('../dist/', import.meta.url)
await cp(new URL('../demo/media/', import.meta.url), new URL('mock-media/', dist), { recursive: true })
const index = new URL('index.html', dist)
const html = await readFile(index, 'utf8')
await writeFile(index, html.replace('</head>', [
  '  <link rel="manifest" href="./manifest.webmanifest" />',
  '    <link rel="apple-touch-icon" href="./icon-192.png" />',
  '  </head>',
].join('\n')))

const entries = await readdir(dist, { recursive: true, withFileTypes: true })
const files = entries.filter((entry) => entry.isFile() && entry.name !== 'sw.js')
  .map((entry) => relative(fileURLToPath(dist), join(entry.parentPath, entry.name)))
  .map((file) => file.split(sep).map(encodeURIComponent).join('/'))
  .sort()

const worker = await readFile(new URL('service-worker.js', import.meta.url), 'utf8')
const hash = createHash('sha256').update(worker)
for (const file of files) hash.update(file).update(await readFile(new URL(file, dist)))
const config = [
  `const VERSION = ${JSON.stringify(hash.digest('hex').slice(0, 16))}`,
  `const FILES = ${JSON.stringify(files)}`,
].join('\n')
await writeFile(new URL('sw.js', dist), `${config}\n\n${worker}`)
