import axios from 'axios'

// Авторизация — только через axios, без сгенерированного клиента и без thunk:
// компонент сам вызывает запрос и передаёт результат в Redux (setUser / clearUser).
// JWT и логин хранятся в localStorage, поэтому вход сохраняется после обновления страницы (F5).
const TOKEN_KEY = 'comets.token'
const LOGIN_KEY = 'comets.login'

const read = (key: string): string | null => {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

export const authStorage = {
  getToken: () => read(TOKEN_KEY),
  getLogin: () => read(LOGIN_KEY),
  save(token: string, login: string) {
    try {
      localStorage.setItem(TOKEN_KEY, token)
      localStorage.setItem(LOGIN_KEY, login)
    } catch {
      // хранилище недоступно (приватный режим) — вход будет только до перезагрузки
    }
  },
  clear() {
    try {
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(LOGIN_KEY)
    } catch {
      // нечего очищать
    }
  },
}

interface LoginResponse {
  access_token: string
  token_type: string
  expires_in: number
}

// POST /api/users/login — возвращает JWT
export const loginRequest = async (login: string, password: string): Promise<string> => {
  const { data } = await axios.post<LoginResponse>('/api/users/login', { login, password })
  return data.access_token
}

// POST /api/users/logout — токен заносится в чёрный список на бэкенде
export const logoutRequest = async (token: string): Promise<void> => {
  await axios.post('/api/users/logout', null, { headers: { Authorization: `Bearer ${token}` } })
}

// Текст ошибки из ответа веб-сервиса ({ status, message }) или общий текст
export const errorMessage = (error: unknown, fallback: string): string => {
  if (axios.isAxiosError<{ message?: string }>(error)) {
    if (!error.response || error.response.status >= 500) return 'Веб-сервис недоступен, попробуйте позже'
    return error.response.data?.message || fallback
  }
  return fallback
}

// Бэкенд не ответил: нет соединения или прокси Vite вернул 5xx (сервис не запущен)
export const isBackendDown = (error: unknown): boolean =>
  axios.isAxiosError(error) && (!error.response || error.response.status >= 500)

export const httpStatus = (error: unknown): number | undefined =>
  axios.isAxiosError(error) ? error.response?.status : undefined
