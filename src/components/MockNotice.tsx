import type { FC } from 'react'

interface Props {
  className?: string
}

// Плашка «веб-сервис недоступен»: данные взяты из mock, изменить их нельзя
export const MockNotice: FC<Props> = ({ className = '' }) => (
  <p className={`mock-notice ${className}`}>Веб-сервис недоступен — показаны демо-данные (mock)</p>
)
