import { type FC, useEffect, useState } from 'react'
import { Spinner } from 'react-bootstrap'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { CometPhoto, CometVideo } from '../components/CometMedia'
import { HeartIcon, NextIcon } from '../components/Icons'
import { MockNotice } from '../components/MockNotice'
import { ROUTES } from '../Routes'
import { formatNum, yearsWord } from '../modules/format'
import { feedKeyOf, fetchFeedComet, likeComet } from '../store/cometsSlice'
import { useAppDispatch, useAppSelector } from '../store/hooks'

// Лента: /feed — первая комета, /feed/:id — по id, /feed/:id?next=true — следующая после id
export const FeedPage: FC = () => {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const next = searchParams.get('next') === 'true'
  const navigate = useNavigate()
  const dispatch = useAppDispatch()

  const { feed, feedKey: loadedKey, isMock, pendingIds } = useAppSelector((state) => state.comets)
  const isAuthenticated = useAppSelector((state) => state.user.isAuthenticated)

  const cometId = id === undefined ? undefined : Number(id)
  const feedKey = feedKeyOf(cometId, next)
  // Описание раскрыто только у той кометы, у которой нажали «Ещё»
  const [expandedKey, setExpandedKey] = useState<string | null>(null)

  // Загрузка кометы при смене адреса и после входа или выхода (меняется is_liked)
  useEffect(() => {
    if (cometId !== undefined && !Number.isInteger(cometId)) {
      navigate(ROUTES.FEED, { replace: true })
      return
    }
    const request = dispatch(fetchFeedComet({ id: cometId, next }))
    request.then((action) => {
      if (!fetchFeedComet.fulfilled.match(action) || action.payload.comet) return
      // Удалённая, неопубликованная или несуществующая комета — на ленту без id; комет нет совсем — на плитку
      navigate(cometId !== undefined ? ROUTES.FEED : ROUTES.COMETS, { replace: true })
    })
    return () => request.abort()
  }, [cometId, next, isAuthenticated, dispatch, navigate])

  const comet = loadedKey === feedKey ? feed : null
  const expanded = expandedKey === feedKey

  if (!comet) {
    return (
      <main className="feed feed--loading">
        <Spinner animation="border" variant="light" />
      </main>
    )
  }

  // Лайк ставит только вошедший пользователь и только с работающим веб-сервисом
  const canLike = isAuthenticated && !isMock
  const likePending = pendingIds.includes(comet.id)
  const liked = comet.is_liked === 1

  return (
    <main className="feed">
      <CometVideo className="feed__video" url={comet.comet_video_url} posterUrl={comet.comet_photo_url} />
      <div className="feed__shade" />
      {isMock && <MockNotice className="feed__notice" />}

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
        <button
          type="button"
          className={`feed__like ${liked ? 'feed__like--active' : ''}`}
          disabled={!canLike || likePending}
          title={canLike ? (liked ? 'Убрать лайк' : 'Поставить лайк') : 'Лайки ставят после входа'}
          onClick={() => dispatch(likeComet({ id: comet.id, like: !liked }))}
        >
          {likePending ? <Spinner animation="border" size="sm" /> : <HeartIcon />}
          <span>{comet.likes_count}</span>
        </button>
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
