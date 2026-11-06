import { type PayloadAction, createSlice } from '@reduxjs/toolkit'
import { ORBITAL_PERIOD_MAX, ORBITAL_PERIOD_MIN } from '../modules/cometsApi'
import { clearUser } from './userSlice'

// Применённый фильтр плитки по периоду обращения. Его читает thunk fetchComets
// и передаёт в запрос GET /api/comets?min_orbital_period=&max_orbital_period=.
interface FilterState {
  from?: number
  to?: number
}

const initialState: FilterState = {}

const filterSlice = createSlice({
  name: 'filter',
  initialState,
  reducers: {
    // Значения на краях слайдеров фильтром не считаются; «от» больше «до» — меняются местами (как на бэкенде)
    setFilter(state, action: PayloadAction<{ from: number; to: number }>) {
      let from: number | undefined = action.payload.from
      let to: number | undefined = action.payload.to
      if (from <= ORBITAL_PERIOD_MIN) from = undefined
      if (to >= ORBITAL_PERIOD_MAX) to = undefined
      if (from !== undefined && to !== undefined && from > to) [from, to] = [to, from]
      state.from = from
      state.to = to
    },
    resetFilter: () => initialState,
  },
  // Фильтр сбрасывается при выходе пользователя
  extraReducers: (builder) => {
    builder.addCase(clearUser, () => initialState)
  },
})

export const { setFilter, resetFilter } = filterSlice.actions
export default filterSlice.reducer
