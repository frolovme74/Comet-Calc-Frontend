import { type PayloadAction, createSlice } from '@reduxjs/toolkit'
import { authStorage } from '../modules/auth'

// Пользователь. Запросы входа и выхода делаются через axios в компонентах,
// результат передаётся сюда вручную (setUser / clearUser) — без thunk.
interface UserState {
  login: string | null
  isAuthenticated: boolean
}

// После F5 пользователь восстанавливается из localStorage
const savedLogin = authStorage.getToken() ? authStorage.getLogin() : null

const initialState: UserState = {
  login: savedLogin,
  isAuthenticated: savedLogin !== null,
}

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<string>) {
      state.login = action.payload
      state.isAuthenticated = true
    },
    clearUser(state) {
      state.login = null
      state.isAuthenticated = false
    },
  },
})

export const { setUser, clearUser } = userSlice.actions
export default userSlice.reducer
