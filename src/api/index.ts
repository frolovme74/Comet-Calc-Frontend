import { Api } from './Api'
import { authStorage } from '../modules/auth'

// Экземпляр клиента, сгенерированного из Swagger (npm run generate-api).
// Запросы идут на /api того же адреса, Vite проксирует их на веб-сервис — так нет проблемы CORS.
// Токен из localStorage подставляется в заголовок Authorization всех запросов: GET /comets и ленте
// он нужен для is_mine и is_liked, методам создателя — для авторизации.
export const api = new Api({
  baseURL: '/api',
  secure: true,
  securityWorker: () => {
    const token = authStorage.getToken()
    return token ? { headers: { Authorization: `Bearer ${token}` } } : {}
  },
})
