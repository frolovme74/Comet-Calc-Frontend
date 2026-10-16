import { type FC, useEffect, useState } from 'react'
import { Spinner } from 'react-bootstrap'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { CometPhoto, CometVideo } from '../components/CometMedia'
import { HeartIcon, NextIcon } from '../components/Icons'
import { ROUTES } from '../Routes'
import { type Comet, getCometFeed } from '../modules/cometsApi'
import { formatNum, yearsWord } from '../modules/format'

// Лента: /feed — первая комета, /feed/:id — по id, /feed/:id?next=true — следующая после id
export const FeedPage: FC = () => {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const next = searchParams.get('next') === 'true'
  const navigate = useNavigate()

  const feedKey = `${id}-${next}`
  const [loaded, setLoaded] = useState<{ key: string; comet: Comet } | null>(null)
  // Описание раскрыто только у той кометы, у которой нажали «Ещё»
  const [expandedKey, setExpandedKey] = useState<string | null>(null)

  useEffect(() => {
    const cometId = id === undefined ? undefined : Number(id)
    if (cometId !== undefined && !Number.isInteger(cometId)) {
      navigate(ROUTES.FEED, { replace: true })
      return
    }

    let cancelled = false
    getCometFeed(cometId, next).then((comet) => {
      if (cancelled) return
      if (comet) {
        setLoaded({ key: `${id}-${next}`, comet })
      } else if (cometId !== undefined) {
        // Удалённая, неопубликованная или несуществующая комета — на ленту без id
        navigate(ROUTES.FEED, { replace: true })
      } else {
        // Опубликованных комет нет совсем — на плитку
        navigate(ROUTES.COMETS, { replace: true })
      }
    })
    return () => {
      cancelled = true
    }
  }, [id, next, navigate])

  const comet = loaded?.key === feedKey ? loaded.comet : null
  const expanded = expandedKey === feedKey

  if (!comet) {
    return (
      <main className="feed feed--loading">
        <Spinner animation="border" variant="light" />
      </main>
    )
  }

  return (
    <main className="feed">
      <CometVideo className="feed__video" url={comet.comet_video_url} posterUrl={comet.comet_photo_url} />
      <div className="feed__shade" />

      <aside className="feed__side">
        <div className="feed__stat">
          <span className="feed__stat-label">Период</span>
          <span className="feed__stat-value">{formatNum(comet.orbital_period)}</span>
          <span className="feed__stat-unit">{yearsWord(comet.orbital_period)}</span>
        </div>
        <div className="feed__stat">
          <span className="feed__stat-label">Эксцентриситет</span>
          <span className="feed__stat-value">{formatNum(comet.orbit_eccentricity)}</span>
        </div>
        <div className="feed__like" title="Лайки ставят после входа">
          <HeartIcon />
          <span>{comet.likes_count}</span>
        </div>
        <Link className="feed__next" to={`${ROUTES.FEED}/${comet.id}?next=true`} title="Следующая комета">
          <NextIcon />
        </Link>
      </aside>

      <section className="feed__info">
        <div className="feed__head">
          <CometPhoto className="feed__thumb" url={comet.comet_photo_url} alt="" />
          <h1 className="feed__title">{comet.comet_name}</h1>
        </div>
        <p className={`feed__desc ${expanded ? 'feed__desc--expanded' : ''}`}>{comet.comet_description}</p>
        <button type="button" className="feed__more" onClick={() => setExpandedKey(expanded ? null : feedKey)}>
          {expanded ? 'Свернуть' : 'Ещё'}
        </button>
      </section>
    </main>
  )
}
