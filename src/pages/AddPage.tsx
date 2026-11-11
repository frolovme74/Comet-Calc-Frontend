import { type FC, type FormEvent, useCallback, useEffect, useState } from 'react'
import { Alert, Button, Form, Spinner } from 'react-bootstrap'
import { Navigate, useNavigate } from 'react-router-dom'
import { CometPhoto } from '../components/CometMedia'
import type { Comet } from '../modules/cometsApi'
import { DEFAULT_VIDEO, useMediaSrc } from '../modules/media'
import { ROUTES } from '../Routes'
import { createCometDraft, getCometDraft, publishComet } from '../store/cometsSlice'
import { useAppDispatch, useAppSelector } from '../store/hooks'

// Ограничения — как у веб-сервиса (POST /api/comets, PUT /api/comets/{id}/publish)
const PHOTO_TYPES = 'image/jpeg,image/png,image/webp,image/gif'
const VIDEO_TYPES = 'video/mp4,video/webm'

interface DraftFields {
  description: string
  period: string
  eccentricity: string
  photo: File | null
  video: File | null
}

export interface DraftEdits {
  id: number
  fields: Partial<DraftFields>
}

interface AddPageProps {
  draftEdits: DraftEdits | null
  onDraftEdit: (id: number, changes: DraftEdits['fields']) => void
  onDraftPublished: (id: number) => void
}

export const AddPage: FC<AddPageProps> = ({ draftEdits, onDraftEdit, onDraftPublished }) => {
  const dispatch = useAppDispatch()
  const isAuthenticated = useAppSelector((state) => state.user.isAuthenticated)
  const saving = useAppSelector((state) => state.comets.savingDraft)
  const [draft, setDraft] = useState<Comet | null>()
  const [loadError, setLoadError] = useState('')
  const [loadAttempt, setLoadAttempt] = useState(0)
  const [name, setName] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isAuthenticated) return
    const request = dispatch(getCometDraft())
    request.then((result) => {
      if (getCometDraft.fulfilled.match(result)) setDraft(result.payload)
      else if (!result.meta.aborted) setLoadError(result.payload ?? 'Не удалось загрузить черновик')
    })
    return () => request.abort()
  }, [dispatch, isAuthenticated, loadAttempt])

  if (!isAuthenticated) return <Navigate to={ROUTES.LOGIN} replace />

  const handleCreate = async (event: FormEvent) => {
    event.preventDefault()
    if (!name.trim() || saving) return
    setError('')
    const result = await dispatch(createCometDraft(name.trim()))
    if (createCometDraft.fulfilled.match(result)) setDraft(result.payload)
    else setError(result.payload ?? 'Не удалось создать черновик')
  }

  return (
    <main className="page">
      <header className="page__header">
        <h1 className="page__title">{draft ? 'Черновик кометы' : 'Новая комета'}</h1>
      </header>
      {loadError ? (
        <Alert variant="danger">
          <p>{loadError}</p>
          <Button onClick={() => {
            setLoadError('')
            setLoadAttempt((attempt) => attempt + 1)
          }}>Повторить</Button>
        </Alert>
      ) : draft === undefined ? (
        <div className="loader">
          <Spinner animation="border" role="status" aria-label="Загрузка черновика" />
        </div>
      ) : draft ? (
        <DraftForm
          key={draft.id}
          draft={draft}
          saving={saving}
          fields={draftEdits?.id === draft.id ? draftEdits.fields : {}}
          onEdit={(changes) => onDraftEdit(draft.id, changes)}
          onPublished={() => onDraftPublished(draft.id)}
        />
      ) : (
        <Form className="form" onSubmit={handleCreate}>
          <fieldset disabled={saving}>
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
            {error && <Alert variant="danger" className="form__error">{error}</Alert>}
            <Button className="button button--wide" type="submit" disabled={!name.trim()}>
              {saving ? <Spinner animation="border" size="sm" /> : 'Создать черновик'}
            </Button>
          </fieldset>
        </Form>
      )}
    </main>
  )
}

const useFilePreview = (file: File | null) => useCallback((element: HTMLImageElement | HTMLVideoElement | null) => {
  if (!element || !file) return
  const url = URL.createObjectURL(file)
  element.src = url
  return () => URL.revokeObjectURL(url)
}, [file])

// Восстанавливаем File в новом input после возврата на страницу.
const restoreSelectedFile = (input: HTMLInputElement | null, file: File | null) => {
  if (!input || !file || input.files?.[0] === file) return
  const transfer = new DataTransfer()
  transfer.items.add(file)
  input.files = transfer.files
}

interface DraftFormProps {
  draft: Comet
  saving: boolean
  fields: DraftEdits['fields']
  onEdit: (changes: DraftEdits['fields']) => void
  onPublished: () => void
}

const DraftForm: FC<DraftFormProps> = ({ draft, saving, fields, onEdit, onPublished }) => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { description = '', period = '', eccentricity = '', photo = null, video = null } = fields
  const [error, setError] = useState('')

  const photoPreview = useFilePreview(photo)
  const videoPreview = useFilePreview(video)
  const storedVideo = useMediaSrc(draft.comet_video_url, DEFAULT_VIDEO)

  // Число с запятой или точкой
  const toNumber = (value: string) => Number(value.replace(',', '.'))
  const periodValue = toNumber(period)
  const eccentricityValue = toNumber(eccentricity)
  const periodInvalid = period !== '' && !(periodValue > 0)
  const eccentricityInvalid = eccentricity !== '' && !(eccentricityValue >= 0 && eccentricityValue < 1)

  const canSubmit = description.trim() && period.trim() && eccentricity.trim() && !periodInvalid && !eccentricityInvalid

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (!canSubmit || saving) return
    setError('')
    const result = await dispatch(
      publishComet({
        id: draft.id,
        description: description.trim(),
        orbitalPeriod: periodValue,
        orbitEccentricity: eccentricityValue,
        photo,
        video,
      }),
    )
    if (publishComet.fulfilled.match(result)) {
      onPublished()
      navigate(`${ROUTES.FEED}/${result.payload.id}`)
    } else {
      setError(result.payload ?? 'Не удалось опубликовать комету')
    }
  }

  return (
    <Form className="form" onSubmit={handleSubmit}>
      <fieldset disabled={saving}>
        <Form.Group className="form__field" controlId="comet_name">
          <Form.Label>Название</Form.Label>
          <Form.Control
            className="form__input"
            value={draft.comet_name}
            readOnly
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
            onChange={(event) => onEdit({ description: event.target.value })}
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
              onChange={(event) => onEdit({ period: event.target.value })}
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
              onChange={(event) => onEdit({ eccentricity: event.target.value })}
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
            ref={(input) => restoreSelectedFile(input as HTMLInputElement | null, photo)}
            onChange={(event) => onEdit({ photo: (event.target as HTMLInputElement).files?.[0] ?? null })}
          />
          {photo ? (
            <img className="form__media-preview" ref={photoPreview} alt="Предпросмотр фото кометы" />
          ) : (
            <CometPhoto className="form__media-preview" url={draft.comet_photo_url} alt="Текущее фото кометы" />
          )}
        </Form.Group>

        <Form.Group className="form__field" controlId="comet_video">
          <Form.Label>Видео (mp4, webm до 50 МБ)</Form.Label>
          <Form.Control
            className="form__input"
            type="file"
            accept={VIDEO_TYPES}
            ref={(input) => restoreSelectedFile(input as HTMLInputElement | null, video)}
            onChange={(event) => onEdit({ video: (event.target as HTMLInputElement).files?.[0] ?? null })}
          />
          <video
            className="form__media-preview"
            ref={videoPreview}
            src={video ? undefined : storedVideo.src}
            onError={video ? undefined : storedVideo.onError}
            controls
            preload="metadata"
            aria-label="Предпросмотр видео кометы"
          />
        </Form.Group>

        {error && <Alert variant="danger" className="form__error">{error}</Alert>}

        <Button className="button button--wide" type="submit" disabled={!canSubmit}>
          {saving ? <Spinner animation="border" size="sm" /> : 'Опубликовать'}
        </Button>
      </fieldset>
    </Form>
  )
}
