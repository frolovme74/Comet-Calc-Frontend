import type { FC } from 'react'
import { Button, Card, Spinner } from 'react-bootstrap'
import type { Comet } from '../modules/cometsApi'
import { formatNum, yearsWord } from '../modules/format'
import { CometPhoto } from './CometMedia'
import { HeartIcon } from './Icons'

interface Props {
  comet: Comet
  onClick: () => void
  // кнопка «Удалить» — только у своей кометы вошедшего пользователя
  canDelete?: boolean
  deleting?: boolean
  onDelete?: () => void
}

// Карточка плитки: фото, название, период обращения, число лайков и удаление своей кометы
export const CometTile: FC<Props> = ({ comet, onClick, canDelete, deleting, onDelete }) => (
  <Card className={`tile ${deleting ? 'tile--busy' : ''}`} onClick={deleting ? undefined : onClick} role="link">
    <CometPhoto className="tile__image" url={comet.comet_photo_url} alt={comet.comet_name} />
    <Card.Body className="tile__body">
      <Card.Title className="tile__title">{comet.comet_name}</Card.Title>
      <div className="tile__meta">
        <span className="tile__value">
          {formatNum(comet.orbital_period)} {yearsWord(comet.orbital_period)}
        </span>
        <span className="tile__likes">
          <HeartIcon />
          {comet.likes_count}
        </span>
      </div>
      {canDelete && (
        <Button
          className="button tile__delete"
          variant="danger"
          size="sm"
          disabled={deleting}
          onClick={(event) => {
            event.stopPropagation()
            onDelete?.()
          }}
        >
          {deleting ? <Spinner animation="border" size="sm" /> : 'Удалить'}
        </Button>
      )}
    </Card.Body>
  </Card>
)
