import { useState } from 'react'

// Фото и видео по умолчанию лежат в самом проекте (public/)
export const DEFAULT_PHOTO = '/DefaultComet.jpg'
export const DEFAULT_VIDEO = '/DefaultComet.mp4'

// Пользовательский хук: возвращает адрес файла или адрес по умолчанию,
// если поле в комете пустое или файл по ссылке не загрузился (событие onError).
export const useMediaSrc = (url: string, fallback: string) => {
  const [failedUrl, setFailedUrl] = useState('')

  const src = !url || url === failedUrl ? fallback : url
  const onError = () => {
    if (src !== fallback) setFailedUrl(url)
  }

  return { src, onError }
}
