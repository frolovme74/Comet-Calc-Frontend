import { type FC, type FormEvent, useCallback, useEffect, useState } from 'react'
import { Alert, Button, Form, Spinner } from 'react-bootstrap'
import { Navigate, useNavigate } from 'react-router-dom'
import { CometPhoto } from '../components/CometMedia'
import type { Comet } from '../modules/cometsApi'
import { DEFAULT_PHOTO, DEFAULT_VIDEO, useMediaSrc } from '../modules/media'
import { ROUTES } from '../Routes'
import { changeDraftDetails, changeDraftName, createCometDraft, getCometDraft, publishComet } from '../store/cometsSlice'
import { useAppDispatch, useAppSelector } from '../store/hooks'

const PHOTO_TYPES = 'image/jpeg,image/png,image/webp,image/gif'
const VIDEO_TYPES = 'video/mp4,video/webm'

export interface CometFiles {
  photo?: File
  video?: File
}

interface AddPageProps {
  files: CometFiles
  onFilesChange: (files: CometFiles) => void
}

export const AddPage: FC<AddPageProps> = ({ files, onFilesChange }) => {
  const dispatch = useAppDispatch()
  const isAuthenticated = useAppSelector((state) => state.user.isAuthenticated)
  const { savingDraft: saving, draftName } = useAppSelector((state) => state.comets)
  const [draft, setDraft] = useState<Comet | null>()
  const [loadError, setLoadError] = useState('')
  const [loadAttempt, setLoadAttempt] = useState(0)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isAuthenticated) return
    const request = dispatch(getCometDraft())
    request.then((result) => {
      if (getCometDraft.fulfilled.match(result)) setDraft(result.payload)
      else if (!result.meta.aborted) setLoadError(result.payload ?? 'Не удалось загрузить карточку')
    })
    return () => request.abort()
  }, [dispatch, isAuthenticated, loadAttempt])

  if (!isAuthenticated) return <Navigate to={ROUTES.LOGIN} replace />

  const handleNext = async (event: FormEvent) => {
    event.preventDefault()
    const { photo, video } = files
    if (!draftName.trim() || !photo || !video || saving) return
    setError('')
    const result = await dispatch(createCometDraft({ name: draftName.trim(), photo, video }))
    if (createCometDraft.fulfilled.match(result)) {
      onFilesChange({})
      setDraft(result.payload)
    } else {
      setError(result.payload ?? 'Не удалось сохранить карточку')
    }
  }

  return (
    <main className="page page--add">
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
          <Spinner animation="border" role="status" aria-label="Загрузка карточки" />
        </div>
      ) : draft ? (
        <DraftForm key={draft.id} draft={draft} saving={saving} />
      ) : (
        <Form className="comet-form" onSubmit={handleNext} aria-label="Добавление кометы">
          <fieldset disabled={saving}>
            {error && <Alert variant="danger" className="form__error">{error}</Alert>}
            <section className="comet-form__card comet-form__media">
              <MediaField kind="video" file={files.video} onSelect={(video) => onFilesChange({ ...files, video })} />
              <MediaField kind="photo" file={files.photo} onSelect={(photo) => onFilesChange({ ...files, photo })} />
            </section>
            <section className="comet-form__card">
              <Form.Group className="comet-field" controlId="comet_name">
                <Form.Label>Название</Form.Label>
                <Form.Control
                  value={draftName}
                  maxLength={100}
                  placeholder="Например, 13P/Ольберса"
                  onChange={(event) => dispatch(changeDraftName(event.target.value))}
                  required
                />
              </Form.Group>
            </section>
            <Button className="button button--wide" type="submit">
              {saving ? <Spinner animation="border" size="sm" aria-label="Сохранение" /> : 'Далее'}
            </Button>
          </fieldset>
        </Form>
      )}
    </main>
  )
}

interface MediaFieldProps {
  kind: 'photo' | 'video'
  file?: File
  url?: string
  poster?: string
  onSelect?: (file?: File) => void
}

const MediaField: FC<MediaFieldProps> = ({ kind, file, url = '', poster = '', onSelect }) => {
  const video = kind === 'video'
  const label = video ? 'Видео' : 'Фото'
  const stored = useMediaSrc(url, video ? DEFAULT_VIDEO : DEFAULT_PHOTO)
  const posterMedia = useMediaSrc(poster, DEFAULT_PHOTO)
  const preview = useCallback((element: HTMLImageElement | HTMLVideoElement | null) => {
    if (!element || !file) return
    const objectUrl = URL.createObjectURL(file)
    element.src = objectUrl
    return () => URL.revokeObjectURL(objectUrl)
  }, [file])
  const restoreFile = useCallback((input: HTMLInputElement | null) => {
    if (!input || !file || input.files?.[0] === file) return
    const transfer = new DataTransfer()
    transfer.items.add(file)
    input.files = transfer.files
  }, [file])

  const content = (
    <>
      {video ? (
        <video
          key={file ? 'local' : stored.src}
          className="comet-media__preview"
          ref={preview}
          src={file ? undefined : stored.src}
          poster={posterMedia.src}
          onError={file ? undefined : stored.onError}
          muted
          loop
          playsInline
          autoPlay
        />
      ) : file ? (
        <img className="comet-media__preview comet-media__preview--photo" ref={preview} alt="Предпросмотр фото кометы" />
      ) : (
        <CometPhoto className="comet-media__preview comet-media__preview--photo" url={url} alt="Фото кометы" />
      )}
      <span className="comet-media__text">
        <span className="comet-field__label">{label}</span>
        {onSelect && <span className="btn button button--secondary">Выбрать файл</span>}
      </span>
    </>
  )
  if (!onSelect) return <div className="comet-media">{content}</div>
  return (
    <label className="comet-media comet-media--select">
      {content}
      <input
        className="visually-hidden"
        id={`comet_${kind}`}
        aria-label={label}
        type="file"
        accept={video ? VIDEO_TYPES : PHOTO_TYPES}
        ref={restoreFile}
        onChange={(event) => onSelect(event.target.files?.[0])}
        required
      />
    </label>
  )
}

const DraftForm: FC<{ draft: Comet; saving: boolean }> = ({ draft, saving }) => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const edits = useAppSelector((state) => state.comets.draftDetails)
  const fields = edits?.id === draft.id ? edits.fields : {}
  const description = fields.description ?? draft.comet_description
  const period = fields.period ?? draft.orbital_period?.toString() ?? ''
  const eccentricity = fields.eccentricity ?? draft.orbit_eccentricity?.toString() ?? ''
  const [error, setError] = useState('')

  const periodValue = Number(period.replace(',', '.'))
  const eccentricityValue = Number(eccentricity.replace(',', '.'))
  const periodInvalid = period !== '' && !(periodValue > 0 && periodValue <= 999999.99)
  const eccentricityInvalid = eccentricity !== '' && !(eccentricityValue >= 0 && eccentricityValue < 1)

  const handlePublish = async (event: FormEvent) => {
    event.preventDefault()
    if (!description.trim() || !period.trim() || !eccentricity.trim() || periodInvalid || eccentricityInvalid || saving) return
    setError('')
    const result = await dispatch(publishComet({
      id: draft.id,
      description: description.trim(),
      orbitalPeriod: periodValue,
      orbitEccentricity: eccentricityValue,
    }))
    if (publishComet.fulfilled.match(result)) navigate(`${ROUTES.FEED}/${result.payload.id}`)
    else setError(result.payload ?? 'Не удалось опубликовать комету')
  }

  return (
    <Form className="comet-form" onSubmit={handlePublish} aria-label="Публикация кометы">
      <fieldset disabled={saving}>
        {error && <Alert variant="danger" className="form__error">{error}</Alert>}
        <section className="comet-form__card comet-form__media">
          <MediaField kind="video" url={draft.comet_video_url} poster={draft.comet_photo_url} />
          <MediaField kind="photo" url={draft.comet_photo_url} />
        </section>
        <section className="comet-form__card">
          <Form.Group className="comet-field" controlId="comet_name">
            <Form.Label>Название</Form.Label>
            <Form.Control value={draft.comet_name} readOnly />
          </Form.Group>
          <Form.Group className="comet-field" controlId="comet_description">
            <Form.Label>Краткое описание</Form.Label>
            <Form.Control
              as="textarea"
              rows={4}
              maxLength={500}
              value={description}
              onChange={(event) => dispatch(changeDraftDetails({ id: draft.id, changes: { description: event.target.value } }))}
              required
            />
          </Form.Group>
        </section>
        <section className="comet-form__card">
          <Form.Group className="comet-field" controlId="orbital_period">
            <Form.Label>Период обращения, лет</Form.Label>
            <Form.Control
              inputMode="decimal"
              value={period}
              isInvalid={periodInvalid}
              onChange={(event) => dispatch(changeDraftDetails({ id: draft.id, changes: { period: event.target.value } }))}
              required
            />
            <Form.Control.Feedback type="invalid">Введите число больше 0, до 999999,99</Form.Control.Feedback>
          </Form.Group>
          <Form.Group className="comet-field" controlId="orbit_eccentricity">
            <Form.Label>Эксцентриситет орбиты</Form.Label>
            <Form.Control
              inputMode="decimal"
              value={eccentricity}
              isInvalid={eccentricityInvalid}
              onChange={(event) => dispatch(changeDraftDetails({ id: draft.id, changes: { eccentricity: event.target.value } }))}
              required
            />
            <Form.Control.Feedback type="invalid">Введите число от 0 до 0,999</Form.Control.Feedback>
          </Form.Group>
        </section>
        <Button className="button button--wide" type="submit" disabled={periodInvalid || eccentricityInvalid}>
          {saving ? <Spinner animation="border" size="sm" aria-label="Публикация" /> : 'Опубликовать'}
        </Button>
      </fieldset>
    </Form>
  )
}
