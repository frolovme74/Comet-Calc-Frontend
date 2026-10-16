import type { FC } from 'react'
import { DEFAULT_PHOTO, DEFAULT_VIDEO, useMediaSrc } from '../modules/media'

interface PhotoProps {
  url: string
  alt: string
  className?: string
}

// Фото кометы; при пустом поле или ошибке загрузки — фото по умолчанию
export const CometPhoto: FC<PhotoProps> = ({ url, alt, className }) => {
  const { src, onError } = useMediaSrc(url, DEFAULT_PHOTO)
  return <img className={className} src={src} alt={alt} loading="lazy" onError={onError} />
}

interface VideoProps {
  url: string
  posterUrl: string
  className?: string
}

// Видео кометы (автовоспроизведение без звука); при пустом поле или ошибке — видео по умолчанию
export const CometVideo: FC<VideoProps> = ({ url, posterUrl, className }) => {
  const video = useMediaSrc(url, DEFAULT_VIDEO)
  const poster = useMediaSrc(posterUrl, DEFAULT_PHOTO)
  return (
    <video
      key={video.src}
      className={className}
      src={video.src}
      poster={poster.src}
      onError={video.onError}
      autoPlay
      muted
      loop
      playsInline
    />
  )
}
