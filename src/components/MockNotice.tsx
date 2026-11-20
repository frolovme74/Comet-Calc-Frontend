import type { FC } from 'react'
import { isPages } from '../modules/deployment'

interface Props {
  className?: string
}

// Плашка «веб-сервис недоступен»: данные взяты из mock, изменить их нельзя
export const MockNotice: FC<Props> = ({ className = '' }) => (
  <p className={`mock-notice ${className}`}>
    {isPages ? 'Демо-версия · данные из локальной коллекции (mock)' : 'Веб-сервис недоступен — показаны демо-данные (mock)'}
  </p>
)
