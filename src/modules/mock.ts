import type { Comet } from './cometsApi'

// Mock-коллекция комет: те же данные, что в db/seed.sql бэкенда, в формате ответа API.
// Ссылки на фото и видео ведут в Minio. У 103P/Хартли поля фото и видео пустые,
// у 55P/Темпеля — Туттля пустое видео: для них показываются фото и видео по умолчанию.
const MINIO_URL = 'http://localhost:9000/comets'

const media = (name: string) => (name ? `${MINIO_URL}/${name}` : '')

const comet = (data: Omit<Comet, 'comet_photo_url' | 'comet_video_url' | 'is_mine' | 'is_liked'>): Comet => ({
  ...data,
  comet_photo_url: media(data.comet_photo),
  comet_video_url: media(data.comet_video),
  is_mine: 0,
  is_liked: 0,
})

export const COMETS_MOCK: Comet[] = [
  comet({
    id: 1,
    comet_name: '1P/Галлея',
    comet_description:
      'Самая известная короткопериодическая комета: возвращается к Солнцу примерно раз в 76 лет. Последний перигелий — 9 февраля 1986 года, тогда её вблизи впервые сфотографировал аппарат «Джотто». Следующее возвращение — 2061 год.',
    comet_status: 'published',
    comet_photo: 'halley.jpg',
    comet_video: 'halley.mp4',
    orbital_period: 75.92,
    orbit_eccentricity: 0.968,
    created_at: '2026-09-01T12:00:00Z',
    formed_at: '2026-09-01T18:00:00Z',
    likes_count: 6,
  }),
  comet({
    id: 2,
    comet_name: '2P/Энке',
    comet_description:
      'Комета с самым коротким периодом среди ярких комет — около 3,3 года. Впервые замечена Пьером Мешеном в 1786 году, орбиту рассчитал Иоганн Энке. С её пылевым шлейфом связан метеорный поток Тауриды.',
    comet_status: 'published',
    comet_photo: 'encke.jpg',
    comet_video: 'encke.mp4',
    orbital_period: 3.31,
    orbit_eccentricity: 0.847,
    created_at: '2026-09-02T12:00:00Z',
    formed_at: '2026-09-02T18:00:00Z',
    likes_count: 2,
  }),
  comet({
    id: 3,
    comet_name: '67P/Чурюмова — Герасименко',
    comet_description:
      'Комета, открытая советскими астрономами в 1969 году. Цель миссии ESA «Розетта»: в 2014 году на её ядро впервые в истории сел спускаемый аппарат «Филы».',
    comet_status: 'published',
    comet_photo: 'churyumov.jpg',
    comet_video: 'churyumov.mp4',
    orbital_period: 6.44,
    orbit_eccentricity: 0.641,
    created_at: '2026-09-03T12:00:00Z',
    formed_at: '2026-09-03T18:00:00Z',
    likes_count: 3,
  }),
  comet({
    id: 4,
    comet_name: '12P/Понса — Брукса',
    comet_description:
      'Комета с периодом около 71 года, известная вспышками яркости: из-за формы комы в 2023 году её прозвали «рогатой». Прошла перигелий 21 апреля 2024 года.',
    comet_status: 'published',
    comet_photo: 'pons_brooks.jpg',
    comet_video: 'pons_brooks.mp4',
    orbital_period: 71.24,
    orbit_eccentricity: 0.955,
    created_at: '2026-09-04T12:00:00Z',
    formed_at: '2026-09-04T18:00:00Z',
    likes_count: 2,
  }),
  comet({
    id: 5,
    comet_name: '109P/Свифта — Туттля',
    comet_description:
      'Родительская комета метеорного потока Персеиды. Ядро диаметром около 26 км — крупнейший объект, регулярно сближающийся с Землёй. Последний перигелий — 1992 год, следующий — 2126 год.',
    comet_status: 'published',
    comet_photo: 'swift_tuttle.jpg',
    comet_video: 'swift_tuttle.mp4',
    orbital_period: 133.28,
    orbit_eccentricity: 0.963,
    created_at: '2026-09-05T12:00:00Z',
    formed_at: '2026-09-05T18:00:00Z',
    likes_count: 7,
  }),
  comet({
    id: 6,
    comet_name: '9P/Темпеля',
    comet_description:
      'В 2005 году аппарат NASA «Дип Импакт» сбросил на ядро кометы медный ударник массой около 370 кг, чтобы изучить вещество под поверхностью. В 2011 году комету повторно посетил «Стардаст».',
    comet_status: 'published',
    comet_photo: 'tempel1.jpg',
    comet_video: 'tempel1.mp4',
    orbital_period: 5.58,
    orbit_eccentricity: 0.51,
    created_at: '2026-09-06T12:00:00Z',
    formed_at: '2026-09-06T18:00:00Z',
    likes_count: 5,
  }),
  comet({
    id: 7,
    comet_name: '55P/Темпеля — Туттля',
    comet_description:
      'Родительская комета метеорного потока Леониды. Открыта независимо Эрнстом Темпелем и Хорасом Туттлем в 1865–1866 годах. Последний перигелий — 1998 год, следующий — 2031 год.',
    comet_status: 'published',
    comet_photo: 'tempel_tuttle.jpg',
    comet_video: '',
    orbital_period: 33.24,
    orbit_eccentricity: 0.906,
    created_at: '2026-09-07T12:00:00Z',
    formed_at: '2026-09-07T18:00:00Z',
    likes_count: 4,
  }),
  comet({
    id: 8,
    comet_name: '103P/Хартли',
    comet_description:
      'Небольшая комета с ядром в форме арахиса длиной около 2 км. В ноябре 2010 года её снял с расстояния около 700 км аппарат NASA EPOXI (бывший «Дип Импакт»).',
    comet_status: 'published',
    comet_photo: '',
    comet_video: '',
    orbital_period: 6.48,
    orbit_eccentricity: 0.694,
    created_at: '2026-09-08T12:00:00Z',
    formed_at: '2026-09-08T18:00:00Z',
    likes_count: 1,
  }),
  comet({
    id: 9,
    comet_name: '81P/Вильда',
    comet_description:
      'В 2004 году аппарат NASA «Стардаст» пролетел сквозь кому кометы и собрал частицы пыли, которые в 2006 году доставил на Землю.',
    comet_status: 'draft',
    comet_photo: 'wild2.jpg',
    comet_video: 'wild2.mp4',
    orbital_period: 6.41,
    orbit_eccentricity: 0.537,
    created_at: '2026-09-09T12:00:00Z',
    formed_at: null,
    likes_count: 0,
  }),
  comet({
    id: 10,
    comet_name: '46P/Виртанена',
    comet_description:
      'В декабре 2018 года прошла в 0,08 а.е. от Земли — одно из самых тесных сближений кометы с Землёй за последние десятилетия.',
    comet_status: 'deleted',
    comet_photo: 'wirtanen.jpg',
    comet_video: 'wirtanen.mp4',
    orbital_period: 5.44,
    orbit_eccentricity: 0.659,
    created_at: '2026-09-10T12:00:00Z',
    formed_at: '2026-09-10T18:00:00Z',
    likes_count: 1,
  }),
]
