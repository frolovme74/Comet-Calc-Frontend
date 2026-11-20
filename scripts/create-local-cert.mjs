import { spawnSync } from 'node:child_process'
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { isIP } from 'node:net'
import { fileURLToPath } from 'node:url'

const addresses = process.argv.slice(2)
if (!addresses.length || addresses.some((address) => !isIP(address))) {
  throw new Error('Укажите IP ноутбука. Пример: npm run cert:https -- 192.168.1.20')
}

const certDir = new URL('../certs/', import.meta.url)
mkdirSync(certDir, { recursive: true })
const cwd = fileURLToPath(certDir)
const gitOpenSsl = 'C:/Program Files/Git/mingw64/bin/openssl.exe'
const openssl = process.env.OPENSSL ?? (process.platform === 'win32' && existsSync(gitOpenSsl)
  ? gitOpenSsl
  : 'openssl')

function run(...args) {
  const { error, status } = spawnSync(openssl, args, { cwd, stdio: 'inherit' })
  if (error) throw error
  if (status !== 0) throw new Error(`OpenSSL завершился с кодом ${status}`)
}

if (!['comets-ca.crt', 'comets-ca-key.pem'].every((file) => existsSync(new URL(file, certDir)))) {
  run('req', '-x509', '-newkey', 'rsa:2048', '-nodes', '-sha256', '-days', '1825',
    '-subj', '/CN=Comets Lab 7 Local CA', '-addext', 'basicConstraints=critical,CA:TRUE',
    '-addext', 'keyUsage=critical,keyCertSign,cRLSign',
    '-keyout', 'comets-ca-key.pem', '-out', 'comets-ca.crt')
}

const names = [...new Set(['127.0.0.1', ...addresses])].map((address) => `IP:${address}`)
writeFileSync(new URL('comets.ext', certDir), [
  'basicConstraints=critical,CA:FALSE',
  'keyUsage=critical,digitalSignature,keyEncipherment',
  'extendedKeyUsage=serverAuth',
  `subjectAltName=DNS:localhost,${names.join(',')}`,
  '',
].join('\n'))
run('req', '-new', '-newkey', 'rsa:2048', '-nodes', '-subj', '/CN=Comets Lab 7',
  '-keyout', 'comets-key.pem', '-out', 'comets.csr')
run('x509', '-req', '-sha256', '-days', '365', '-in', 'comets.csr',
  '-CA', 'comets-ca.crt', '-CAkey', 'comets-ca-key.pem', '-CAcreateserial',
  '-extfile', 'comets.ext', '-out', 'comets.pem')
console.log('Для доверия на устройстве импортируйте только certs/comets-ca.crt.')
