// Кодогенерация клиента API из Swagger бэкенда: npm run generate-api
// По умолчанию берётся файл из соседнего репозитория бэкенда, адрес можно передать аргументом:
//   npm run generate-api -- http://localhost:8080/swagger/doc.json
import { resolve } from 'node:path'
import { generateApi } from 'swagger-typescript-api'

const source = process.argv[2] ?? '../Backend/docs/swagger.json'
const isUrl = /^https?:\/\//.test(source)

await generateApi({
  fileName: 'Api.ts',
  output: resolve(process.cwd(), './src/api'),
  ...(isUrl ? { url: source } : { input: resolve(process.cwd(), source) }),
  httpClientType: 'axios',
})
