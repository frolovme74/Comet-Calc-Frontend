import type { ApiCometFeedResponse, ApiCometListResponse, ApiCometResponse } from '../api/Api'
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

// Файлы Minio запрашиваются через прокси Vite: /s3/comets/… → http://localhost:9000/comets/…
// Веб-сервис отдаёт полные адреса Minio, во фронтенде остаётся только путь.
export const S3_PREFIX = '/s3'

export const toS3Url = (url?: string): string => {
  if (!url) return ''
  try {
    const parsed = new URL(url, window.location.origin)
    return parsed.origin === window.location.origin ? url : `${S3_PREFIX}${parsed.pathname}`
  } catch {
    return url
  }
}

// Ответ API → Comet: пустые поля заполняются, адреса фото и видео переводятся на прокси
export const fromApi = (
  data: ApiCometListResponse | ApiCometFeedResponse | ApiCometResponse,
): Comet => ({
  id: data.id ?? 0,
  comet_name: data.comet_name ?? '',
  comet_description: data.comet_description ?? '',
  comet_status: (data.comet_status as Comet['comet_status']) ?? 'published',
  comet_photo: data.comet_photo ?? '',
  comet_photo_url: toS3Url(data.comet_photo_url),
  comet_video: data.comet_video ?? '',
  comet_video_url: toS3Url(data.comet_video_url),
  orbital_period: data.orbital_period ?? null,
  orbit_eccentricity: data.orbit_eccentricity ?? null,
  created_at: data.created_at ?? '',
  formed_at: data.formed_at ?? null,
  likes_count: 'likes_count' in data ? (data.likes_count ?? 0) : 0,
  is_mine: 'is_mine' in data ? (data.is_mine ?? 0) : 0,
  is_liked: 'is_liked' in data ? (data.is_liked ?? 0) : 0,
})

// Mock-данные — если веб-сервис недоступен (гость видит ленту и плитку без бэкенда).
// Функции повторяют логику методов API.
const publishedComets = (): Comet[] =>
  COMETS_MOCK.filter((comet) => comet.comet_status === 'published')

// Аналог GET /api/comets?min_orbital_period=&max_orbital_period=
export const getMockComets = (filter: CometsFilter = {}): Comet[] => {
  const { min_orbital_period: from, max_orbital_period: to } = filter
  return publishedComets().filter((comet) => {
    const period = comet.orbital_period ?? 0
    if (from !== undefined && period < from) return false
    if (to !== undefined && period > to) return false
    return true
  })
}

// Аналог GET /api/comets/feed/{id}?next=true:
// без id — первая комета, с id — по id, с next — следующая после id (после последней — первая).
// null — комета не найдена, удалена или не опубликована (у API это 404).
export const getMockCometFeed = (id?: number, next = false): Comet | null => {
  const comets = publishedComets()
  if (!comets.length) return null
  if (id === undefined) return comets[0]

  const index = comets.findIndex((comet) => comet.id === id)
  if (index === -1) return null
  if (!next) return comets[index]
  return comets[(index + 1) % comets.length]
}
