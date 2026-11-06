import { type FC, type FormEvent, useState } from 'react'
import { Alert, Button, Form, Spinner } from 'react-bootstrap'
import { Navigate, useNavigate } from 'react-router-dom'
import { ROUTES } from '../Routes'
import { createComet } from '../store/cometsSlice'
import { useAppDispatch, useAppSelector } from '../store/hooks'

// Ограничения — как у веб-сервиса (POST /api/comets, PUT /api/comets/{id}/publish)
const PHOTO_TYPES = 'image/jpeg,image/png,image/webp,image/gif'
const VIDEO_TYPES = 'video/mp4,video/webm'

// Добавление кометы — только для вошедшего пользователя; гость перенаправляется на вход
export const AddPage: FC = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const isAuthenticated = useAppSelector((state) => state.user.isAuthenticated)
  const creating = useAppSelector((state) => state.comets.creating)

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [period, setPeriod] = useState('')
  const [eccentricity, setEccentricity] = useState('')
  const [photo, setPhoto] = useState<File | null>(null)
  const [video, setVideo] = useState<File | null>(null)
  const [error, setError] = useState('')

  if (!isAuthenticated) return <Navigate to={ROUTES.LOGIN} replace />

  // Число с запятой или точкой
  const toNumber = (value: string) => Number(value.replace(',', '.'))
  const periodValue = toNumber(period)
  const eccentricityValue = toNumber(eccentricity)
  const periodInvalid = period !== '' && !(periodValue > 0)
  const eccentricityInvalid = eccentricity !== '' && !(eccentricityValue >= 0 && eccentricityValue < 1)

  const canSubmit =
    name.trim() && description.trim() && period && eccentricity && !periodInvalid && !eccentricityInvalid && photo && video

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (!canSubmit || !photo || !video) return
    setError('')
    const result = await dispatch(
      createComet({
        name: name.trim(),
        description: description.trim(),
        orbitalPeriod: periodValue,
        orbitEccentricity: eccentricityValue,
        photo,
        video,
      }),
    )
    if (createComet.fulfilled.match(result)) navigate(`${ROUTES.FEED}/${result.payload.id}`)
    else setError(result.payload ?? 'Не удалось добавить комету')
  }

  return (
    <main className="page">
      <header className="page__header">
        <h1 className="page__title">Новая комета</h1>
      </header>

      <Form className="form" onSubmit={handleSubmit}>
        <fieldset disabled={creating}>
          <Form.Group className="form__field" controlId="comet_name">
            <Form.Label>Название</Form.Label>
            <Form.Control
              className="form__input"
              value={name}
              maxLength={100}
              placeholder="например, 2P/Энке"
              onChange={(event) => setName(event.target.value)}
              required
            />
          </Form.Group>

          <Form.Group className="form__field" controlId="comet_description">
            <Form.Label>Описание</Form.Label>
            <Form.Control
              className="form__input"
              as="textarea"
              rows={4}
              maxLength={500}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              required
            />
          </Form.Group>

          <div className="form__row">
            <Form.Group className="form__field" controlId="orbital_period">
              <Form.Label>Период, лет</Form.Label>
              <Form.Control
                className="form__input"
                inputMode="decimal"
                value={period}
                placeholder="3,31"
                isInvalid={periodInvalid}
                onChange={(event) => setPeriod(event.target.value)}
                required
              />
              <Form.Control.Feedback type="invalid">больше 0</Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="form__field" controlId="orbit_eccentricity">
              <Form.Label>Эксцентриситет</Form.Label>
              <Form.Control
                className="form__input"
                inputMode="decimal"
                value={eccentricity}
                placeholder="0,848"
                isInvalid={eccentricityInvalid}
                onChange={(event) => setEccentricity(event.target.value)}
                required
              />
              <Form.Control.Feedback type="invalid">от 0 до 1</Form.Control.Feedback>
            </Form.Group>
          </div>

          <Form.Group className="form__field" controlId="comet_photo">
            <Form.Label>Фото (jpeg, png, webp, gif до 10 МБ)</Form.Label>
            <Form.Control
              className="form__input"
              type="file"
              accept={PHOTO_TYPES}
              onChange={(event) => setPhoto((event.target as HTMLInputElement).files?.[0] ?? null)}
              required
            />
          </Form.Group>

          <Form.Group className="form__field" controlId="comet_video">
            <Form.Label>Видео (mp4, webm до 50 МБ)</Form.Label>
            <Form.Control
              className="form__input"
              type="file"
              accept={VIDEO_TYPES}
              onChange={(event) => setVideo((event.target as HTMLInputElement).files?.[0] ?? null)}
              required
            />
          </Form.Group>

          {error && <Alert variant="danger" className="form__error">{error}</Alert>}

          <Button className="button button--wide" type="submit" disabled={!canSubmit}>
            {creating ? <Spinner animation="border" size="sm" /> : 'Опубликовать'}
          </Button>
        </fieldset>
      </Form>
    </main>
  )
}
