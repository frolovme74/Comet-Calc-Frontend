import { COMETS_MOCK } from './mock'

// Комета — так её отдаёт веб-сервис (GET /api/comets, GET /api/comets/feed/{id})
export interface Comet {
  id: number
  comet_name: string
  comet_description: string
  comet_status: 'draft' | 'published' | 'deleted'
  comet_photo: string
  comet_photo_url: string
  comet_video: string
  comet_video_url: string
  orbital_period: number | null
  orbit_eccentricity: number | null
  created_at: string
  formed_at: string | null
  likes_count: number
  is_mine: number
  is_liked: number
}

// Фильтр плитки — те же параметры, что у GET /api/comets
export interface CometsFilter {
  min_orbital_period?: number
  max_orbital_period?: number
}

// Границы слайдеров фильтра (как на странице плитки из ЛР1)
export const ORBITAL_PERIOD_MIN = 0
export const ORBITAL_PERIOD_MAX = 140

// В ЛР5 данные берутся только из mock-коллекции, без бэкенда.
// Функции асинхронные, как будущие запросы к API: задержка имитирует сеть.
const MOCK_DELAY_MS = 300

const delay = <T>(value: T): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(value), MOCK_DELAY_MS))

const publishedComets = (): Comet[] =>
  COMETS_MOCK.filter((comet) => comet.comet_status === 'published')

// Аналог GET /api/comets?min_orbital_period=&max_orbital_period=
export const getComets = async (filter: CometsFilter = {}): Promise<Comet[]> => {
  const { min_orbital_period: from, max_orbital_period: to } = filter
  const comets = publishedComets().filter((comet) => {
    const period = comet.orbital_period ?? 0
    if (from !== undefined && period < from) return false
    if (to !== undefined && period > to) return false
    return true
  })
  return delay(comets)
}

// Аналог GET /api/comets/feed/{id}?next=true:
// без id — первая комета, с id — по id, с next — следующая после id (после последней — первая).
// null — комета не найдена, удалена или не опубликована (у API это 404).
export const getCometFeed = async (id?: number, next = false): Promise<Comet | null> => {
  const comets = publishedComets()
  if (!comets.length) return delay(null)
  if (id === undefined) return delay(comets[0])

  const index = comets.findIndex((comet) => comet.id === id)
  if (index === -1) return delay(null)
  if (!next) return delay(comets[index])
  return delay(comets[(index + 1) % comets.length])
}
