import { type FC, useEffect, useState } from 'react'
import { Button, Card, Spinner } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from '../Routes'
import { type Comet, getComets } from '../modules/cometsApi'
import { formatNum, yearsWord } from '../modules/format'

// Главная: о приложении, краткая сводка по каталогу и переходы на ленту и плитку
export const HomePage: FC = () => {
  const [comets, setComets] = useState<Comet[] | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    let cancelled = false
    getComets().then((result) => {
      if (!cancelled) setComets(result)
    })
    return () => {
      cancelled = true
    }
  }, [])

  const periods = (comets ?? []).map((comet) => comet.orbital_period ?? 0)
  const shortest = periods.length ? Math.min(...periods) : null
  const longest = periods.length ? Math.max(...periods) : null

  return (
    <main className="page">
      <section className="hero">
        <div className="hero__badge">☄</div>
        <h1 className="page__title">Кометы</h1>
        <p className="hero__text">
          Каталог периодических комет: видео, период обращения и эксцентриситет орбиты. По координатам кометы на
          небесной сфере рассчитывается её расстояние от Солнца.
        </p>
      </section>

      <Card className="panel">
        <Card.Body>
          {comets === null ? (
            <div className="loader loader--small">
              <Spinner animation="border" size="sm" />
            </div>
          ) : (
            <div className="stats">
              <div className="stats__item">
                <span className="stats__value">{comets.length}</span>
                <span className="stats__label">комет в каталоге</span>
              </div>
              <div className="stats__item">
                <span className="stats__value">{formatNum(shortest)}</span>
                <span className="stats__label">{yearsWord(shortest)} — самый короткий период</span>
              </div>
              <div className="stats__item">
                <span className="stats__value">{formatNum(longest)}</span>
                <span className="stats__label">{yearsWord(longest)} — самый длинный</span>
              </div>
            </div>
          )}
        </Card.Body>
      </Card>

      <div className="hero__actions">
        <Button className="button button--wide" onClick={() => navigate(ROUTES.FEED)}>
          Смотреть ленту
        </Button>
        <Button className="button button--wide button--secondary" variant="light" onClick={() => navigate(ROUTES.COMETS)}>
          Открыть плитку
        </Button>
      </div>
    </main>
  )
}
