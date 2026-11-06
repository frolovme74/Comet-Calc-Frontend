import { useDispatch, useSelector } from 'react-redux'
import type { AppDispatch, RootState } from '.'

// Типизированные хуки Redux для компонентов
export const useAppDispatch = useDispatch.withTypes<AppDispatch>()
export const useAppSelector = useSelector.withTypes<RootState>()
