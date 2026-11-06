import { configureStore } from '@reduxjs/toolkit'
import cometsReducer from './cometsSlice'
import filterReducer from './filterSlice'
import userReducer from './userSlice'

// Store приложения: фильтр плитки, кометы (список, лента, состояния запросов) и пользователь
export const store = configureStore({
  reducer: {
    filter: filterReducer,
    comets: cometsReducer,
    user: userReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
