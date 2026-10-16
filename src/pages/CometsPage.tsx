import { type FC, useEffect, useState } from 'react'
import { Spinner } from 'react-bootstrap'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { CometTile } from '../components/CometTile'
import { PeriodFilter } from '../components/PeriodFilter'
import { ROUTES } from '../Routes'
import {
  type Comet,
  type CometsFilter,
  ORBITAL_PERIOD_MAX,
  ORBITAL_PERIOD_MIN,
  getComets,
} from '../modules/cometsApi'

// Фильтр берётся из адреса (?min_orbital_period=&max_orbital_period=), поэтому сохраняется после запроса и по F5.
// Значения на границах слайдеров фильтром не считаются; «от» больше «до» — меняются местами (как на бэкенде).
const readFilter = (params: URLSearchParams): CometsFilter => {
  const read = (name: string) => {
    const raw = params.get(name)
    const value = raw === null || raw === '' ? NaN : Number(raw)
    return Number.isFinite(value) ? value : undefined
  }
  let from = read('min_orbital_period')
  let to = read('max_orbital_period')
  if (from !== undefined && from <= ORBITAL_PERIOD_MIN) from = undefined
  if (to !== undefined && to >= ORBITAL_PERIOD_MAX) to = undefined
  if (from !== undefined && to !== undefined && from > to) [from, to] = [to, from]
  return { min_orbital_period: from, max_orbital_period: to }
}

export const CometsPage: FC = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const filter = readFilter(searchParams)
  const { min_orbital_period: appliedFrom, max_orbital_period: appliedTo } = filter

  const filterKey = `${appliedFrom}-${appliedTo}`

  const [periodFrom, setPeriodFrom] = useState(appliedFrom ?? ORBITAL_PERIOD_MIN)
  const [periodTo, setPeriodTo] = useState(appliedTo ?? ORBITAL_PERIOD_MAX)
  const [sliderKey, setSliderKey] = useState(filterKey)
  const [loaded, setLoaded] = useState<{ key: string; comets: Comet[] } | null>(null)
  const navigate = useNavigate()

  // Фильтр в адресе изменился (Показать, Сбросить, «назад» в браузере) — слайдеры встают на его значения
  if (sliderKey !== filterKey) {
    setSliderKey(filterKey)
    setPeriodFrom(appliedFrom ?? ORBITAL_PERIOD_MIN)
    setPeriodTo(appliedTo ?? ORBITAL_PERIOD_MAX)
  }

  // Загрузка списка при каждом изменении фильтра в адресе
  useEffect(() => {
    let cancelled = false
    getComets({ min_orbital_period: appliedFrom, max_orbital_period: appliedTo }).then((comets) => {
      if (!cancelled) setLoaded({ key: `${appliedFrom}-${appliedTo}`, comets })
    })
    return () => {
      cancelled = true
    }
  }, [appliedFrom, appliedTo])

  // Пока не пришёл ответ на текущий фильтр — показываем загрузку
  const loading = loaded?.key !== filterKey
  const comets = loaded?.comets ?? []

  const handleSubmit = () => {
    const params = new URLSearchParams()
    if (periodFrom > ORBITAL_PERIOD_MIN) params.set('min_orbital_period', String(periodFrom))
    if (periodTo < ORBITAL_PERIOD_MAX) params.set('max_orbital_period', String(periodTo))
    setSearchParams(params)
  }

  const handleReset = () => setSearchParams({})

  return (
    <main className="page">
      <header className="page__header">
        <h1 className="page__title">Кометы</h1>
      </header>

      <PeriodFilter
        from={periodFrom}
        to={periodTo}
        min={ORBITAL_PERIOD_MIN}
        max={ORBITAL_PERIOD_MAX}
        appliedFrom={appliedFrom}
        appliedTo={appliedTo}
        loading={loading}
        onFromChange={setPeriodFrom}
        onToChange={setPeriodTo}
        onSubmit={handleSubmit}
        onReset={handleReset}
      />

      {loading ? (
        <div className="loader">
          <Spinner animation="border" />
        </div>
      ) : comets.length ? (
        <div className="tiles">
          {comets.map((comet) => (
            <CometTile key={comet.id} comet={comet} onClick={() => navigate(`${ROUTES.FEED}/${comet.id}`)} />
          ))}
        </div>
      ) : (
        <p className="empty">Нет комет с таким периодом</p>
      )}
    </main>
  )
}
