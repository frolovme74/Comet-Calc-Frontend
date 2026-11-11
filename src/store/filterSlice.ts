import { type PayloadAction, createSlice } from '@reduxjs/toolkit'
import { ORBITAL_PERIOD_MAX, ORBITAL_PERIOD_MIN } from '../modules/cometsApi'
import { clearUser } from './userSlice'

// Положения ползунков сохраняются между страницами. fetchComets читает только применённые границы.
interface FilterState {
  from?: number
  to?: number
  sliderFrom: number
  sliderTo: number
}

const initialState: FilterState = {
  sliderFrom: ORBITAL_PERIOD_MIN,
  sliderTo: ORBITAL_PERIOD_MAX,
}

const filterSlice = createSlice({
  name: 'filter',
  initialState,
  reducers: {
    setSliderFrom(state, action: PayloadAction<number>) {
      state.sliderFrom = action.payload
    },
    setSliderTo(state, action: PayloadAction<number>) {
      state.sliderTo = action.payload
    },
    // Значения на краях слайдеров фильтром не считаются; «от» больше «до» — меняются местами (как на бэкенде)
    applyFilter(state) {
      let from: number | undefined = state.sliderFrom
      let to: number | undefined = state.sliderTo
      if (from <= ORBITAL_PERIOD_MIN) from = undefined
      if (to >= ORBITAL_PERIOD_MAX) to = undefined
      if (from !== undefined && to !== undefined && from > to) [from, to] = [to, from]
      state.from = from
      state.to = to
      state.sliderFrom = from ?? ORBITAL_PERIOD_MIN
      state.sliderTo = to ?? ORBITAL_PERIOD_MAX
    },
    resetFilter: () => initialState,
  },
  // Фильтр сбрасывается при выходе пользователя
  extraReducers: (builder) => {
    builder.addCase(clearUser, () => initialState)
  },
})

export const { setSliderFrom, setSliderTo, applyFilter, resetFilter } = filterSlice.actions
export default filterSlice.reducer
