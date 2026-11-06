import { type FC, useEffect, useState } from 'react'
import { Spinner } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import { CometTile } from '../components/CometTile'
import { MockNotice } from '../components/MockNotice'
import { PeriodFilter } from '../components/PeriodFilter'
import { ROUTES } from '../Routes'
import { ORBITAL_PERIOD_MAX, ORBITAL_PERIOD_MIN } from '../modules/cometsApi'
import { deleteComet, fetchComets } from '../store/cometsSlice'
import { resetFilter, setFilter } from '../store/filterSlice'
import { useAppDispatch, useAppSelector } from '../store/hooks'

// Плитка с фильтром по периоду обращения.
// Применённый фильтр хранится в Redux (filterSlice) и передаётся в запрос к веб-сервису,
// значения слайдеров до нажатия «Показать» — в состоянии страницы.
export const CometsPage: FC = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { from: appliedFrom, to: appliedTo } = useAppSelector((state) => state.filter)
  const { list: comets, listLoading: loading, isMock, pendingIds } = useAppSelector((state) => state.comets)
  const isAuthenticated = useAppSelector((state) => state.user.isAuthenticated)

  const filterKey = `${appliedFrom}-${appliedTo}`
  const [periodFrom, setPeriodFrom] = useState(appliedFrom ?? ORBITAL_PERIOD_MIN)
  const [periodTo, setPeriodTo] = useState(appliedTo ?? ORBITAL_PERIOD_MAX)
  const [sliderKey, setSliderKey] = useState(filterKey)

  // Фильтр в store изменился (Показать, Сбросить, выход пользователя) — слайдеры встают на его значения
  if (sliderKey !== filterKey) {
    setSliderKey(filterKey)
    setPeriodFrom(appliedFrom ?? ORBITAL_PERIOD_MIN)
    setPeriodTo(appliedTo ?? ORBITAL_PERIOD_MAX)
  }

  // Загрузка списка при открытии, смене фильтра и после входа или выхода (меняется is_mine)
  useEffect(() => {
    const request = dispatch(fetchComets())
    return () => request.abort()
  }, [appliedFrom, appliedTo, isAuthenticated, dispatch])

  const handleSubmit = () => dispatch(setFilter({ from: periodFrom, to: periodTo }))
  const handleReset = () => dispatch(resetFilter())

  return (
    <main className="page">
      <header className="page__header">
        <h1 className="page__title">Кометы</h1>
      </header>

      {isMock && <MockNotice />}

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
            <CometTile
              key={comet.id}
              comet={comet}
              onClick={() => navigate(`${ROUTES.FEED}/${comet.id}`)}
              canDelete={isAuthenticated && !isMock && comet.is_mine === 1}
              deleting={pendingIds.includes(comet.id)}
              onDelete={() => dispatch(deleteComet(comet.id))}
            />
          ))}
        </div>
      ) : (
        <p className="empty">Нет комет с таким периодом</p>
      )}
    </main>
  )
}
