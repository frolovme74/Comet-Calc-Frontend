import { type FC, useEffect } from 'react'
import { Spinner } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import { CometTile } from '../components/CometTile'
import { MockNotice } from '../components/MockNotice'
import { PeriodFilter } from '../components/PeriodFilter'
import { ROUTES } from '../Routes'
import { ORBITAL_PERIOD_MAX, ORBITAL_PERIOD_MIN } from '../modules/cometsApi'
import { deleteComet, fetchComets } from '../store/cometsSlice'
import { applyFilter, resetFilter, setSliderFrom, setSliderTo } from '../store/filterSlice'
import { useAppDispatch, useAppSelector } from '../store/hooks'

export const CometsPage: FC = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { from: appliedFrom, to: appliedTo, sliderFrom, sliderTo } = useAppSelector((state) => state.filter)
  const { list: comets, listLoading: loading, isMock, pendingIds } = useAppSelector((state) => state.comets)
  const isAuthenticated = useAppSelector((state) => state.user.isAuthenticated)

  // Загрузка списка при открытии, смене фильтра и после входа или выхода (меняется is_mine)
  useEffect(() => {
    const request = dispatch(fetchComets())
    return () => request.abort()
  }, [appliedFrom, appliedTo, isAuthenticated, dispatch])

  return (
    <main className="page">
      <header className="page__header">
        <h1 className="page__title">Кометы</h1>
      </header>

      {isMock && <MockNotice />}

      <PeriodFilter
        from={sliderFrom}
        to={sliderTo}
        min={ORBITAL_PERIOD_MIN}
        max={ORBITAL_PERIOD_MAX}
        appliedFrom={appliedFrom}
        appliedTo={appliedTo}
        loading={loading}
        onFromChange={(value) => dispatch(setSliderFrom(value))}
        onToChange={(value) => dispatch(setSliderTo(value))}
        onSubmit={() => dispatch(applyFilter())}
        onReset={() => dispatch(resetFilter())}
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
