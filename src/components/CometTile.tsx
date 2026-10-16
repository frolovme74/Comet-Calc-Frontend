import type { FC } from 'react'
import { Card } from 'react-bootstrap'
import type { Comet } from '../modules/cometsApi'
import { formatNum, yearsWord } from '../modules/format'
import { CometPhoto } from './CometMedia'
import { HeartIcon } from './Icons'

interface Props {
  comet: Comet
  onClick: () => void
}

// Карточка плитки: фото, название, период обращения и число лайков
export const CometTile: FC<Props> = ({ comet, onClick }) => (
  <Card className="tile" onClick={onClick} role="link">
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
    </Card.Body>
  </Card>
)
