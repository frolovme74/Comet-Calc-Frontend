import { type Dispatch, createAsyncThunk, createSlice, isAnyOf } from '@reduxjs/toolkit'
import { api } from '../api'
import type { ApiCometFeedResponse } from '../api/Api'
import { authStorage, errorMessage, httpStatus, isBackendDown } from '../modules/auth'
import { type Comet, fromApi, getMockCometFeed, getMockComets } from '../modules/cometsApi'
import type { RootState } from '.'
import { clearUser } from './userSlice'

// Кометы: запросы через сгенерированный клиент (src/api) в thunk.
// Если веб-сервис недоступен, список и лента берутся из mock (isMock = true), действия с ними недоступны.
interface CometsState {
  list: Comet[]
  listLoading: boolean
  listRequestId: string | null
  feed: Comet | null
  feedKey: string | null
  feedLoading: boolean
  feedRequestId: string | null
  isMock: boolean
  // кометы, у которых идёт запрос лайка или удаления, — их кнопки заблокированы
  pendingIds: number[]
  savingDraft: boolean
}

const initialState: CometsState = {
  list: [],
  listLoading: false,
  listRequestId: null,
  feed: null,
  feedKey: null,
  feedLoading: false,
  feedRequestId: null,
  isMock: false,
  pendingIds: [],
  savingDraft: false,
}

interface ThunkConfig {
  state: RootState
  rejectValue: string
}

// Токен истёк или отозван (401) — пользователь выходит, как по кнопке «Выход»
const handleUnauthorized = (error: unknown, dispatch: Dispatch) => {
  if (httpStatus(error) === 401) {
    authStorage.clear()
    dispatch(clearUser())
  }
}

// Ключ ленты: какой адрес (id и признак next) загружен в state.feed
export const feedKeyOf = (id?: number, next = false) => `${id ?? ''}-${next}`

// GET /api/comets — фильтр берётся из store (filterSlice), для главной — без фильтра
export const fetchComets = createAsyncThunk<
  { comets: Comet[]; isMock: boolean },
  { ignoreFilter?: boolean } | undefined,
  ThunkConfig
>('comets/fetchComets', async (options, { getState, rejectWithValue }) => {
  const { from, to } = options?.ignoreFilter ? {} : getState().filter
  const query = { min_orbital_period: from, max_orbital_period: to }
  try {
    const { data } = await api.comets.cometsList(query)
    return { comets: data.map(fromApi), isMock: false }
  } catch (error) {
    if (isBackendDown(error)) return { comets: getMockComets(query), isMock: true }
    return rejectWithValue(errorMessage(error, 'Не удалось загрузить кометы'))
  }
})

// GET /api/comets/feed/{id}?next=true; comet = null — комета не найдена (404) или id неверный (400)
export const fetchFeedComet = createAsyncThunk<
  { comet: Comet | null; isMock: boolean },
  { id?: number; next?: boolean },
  ThunkConfig
>('comets/fetchFeedComet', async ({ id, next = false }, { rejectWithValue }) => {
  try {
    const { data } =
      id === undefined
        ? await api.request<ApiCometFeedResponse>({ path: '/comets/feed', method: 'GET', format: 'json' })
        : await api.comets.feedDetail(id, next ? { next: true } : undefined)
    return { comet: fromApi(data), isMock: false }
  } catch (error) {
    if (isBackendDown(error)) return { comet: getMockCometFeed(id, next), isMock: true }
    const status = httpStatus(error)
    if (status === 404 || status === 400) return { comet: null, isMock: false }
    return rejectWithValue(errorMessage(error, 'Не удалось загрузить комету'))
  }
})

// POST /api/comets/{id}/like: like = true — поставить, false — отменить
export const likeComet = createAsyncThunk<
  { id: number; like: boolean; likesCount: number },
  { id: number; like: boolean },
  ThunkConfig
>('comets/likeComet', async ({ id, like }, { dispatch, rejectWithValue }) => {
  try {
    const { data } = await api.comets.likeCreate(id, { like: like ? 1 : 0 })
    return { id, like: data.like === 1, likesCount: data.likes_count ?? 0 }
  } catch (error) {
    handleUnauthorized(error, dispatch)
    return rejectWithValue(errorMessage(error, 'Не удалось поставить лайк'))
  }
})

// DELETE /api/comets/{id} — логическое удаление своей кометы
export const deleteComet = createAsyncThunk<number, number, ThunkConfig>(
  'comets/deleteComet',
  async (id, { dispatch, rejectWithValue }) => {
    try {
      await api.comets.cometsDelete(id)
      return id
    } catch (error) {
      handleUnauthorized(error, dispatch)
      return rejectWithValue(errorMessage(error, 'Не удалось удалить комету'))
    }
  },
)

interface CometPublication {
  id: number
  description: string
  orbitalPeriod: number
  orbitEccentricity: number
  photo: File | null
  video: File | null
}

export const getCometDraft = createAsyncThunk<Comet | null, void, ThunkConfig>(
  'comets/getCometDraft',
  async (_, { dispatch, rejectWithValue, signal }) => {
    try {
      const { data } = await api.comets.draftList({ signal })
      return fromApi(data)
    } catch (error) {
      if (httpStatus(error) === 404) return null
      handleUnauthorized(error, dispatch)
      return rejectWithValue(errorMessage(error, 'Не удалось загрузить черновик'))
    }
  },
)

export const createCometDraft = createAsyncThunk<Comet, string, ThunkConfig>(
  'comets/createCometDraft',
  async (name, { dispatch, rejectWithValue }) => {
    try {
      try {
        const { data } = await api.comets.cometsCreate({ comet_name: name })
        return fromApi(data)
      } catch (error) {
        if (httpStatus(error) !== 409) throw error
        const { data } = await api.comets.draftList()
        return fromApi(data)
      }
    } catch (error) {
      handleUnauthorized(error, dispatch)
      return rejectWithValue(errorMessage(error, 'Не удалось создать черновик'))
    }
  },
)

export const publishComet = createAsyncThunk<Comet, CometPublication, ThunkConfig>(
  'comets/publishComet',
  async (form, { dispatch, rejectWithValue }) => {
    try {
      const { data } = await api.comets.publishUpdate(form.id, {
        comet_description: form.description,
        orbital_period: form.orbitalPeriod,
        orbit_eccentricity: form.orbitEccentricity,
        ...(form.photo && { comet_photo: form.photo }),
        ...(form.video && { comet_video: form.video }),
      })
      return fromApi(data)
    } catch (error) {
      handleUnauthorized(error, dispatch)
      return rejectWithValue(errorMessage(error, 'Не удалось опубликовать комету'))
    }
  },
)

const removePending = (state: CometsState, id: number) => {
  state.pendingIds = state.pendingIds.filter((pendingId) => pendingId !== id)
}

const cometsSlice = createSlice({
  name: 'comets',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Ответ применяется, только если это последний запрос (фильтр могли сменить, пока шёл прошлый)
      .addCase(fetchComets.pending, (state, action) => {
        state.listLoading = true
        state.listRequestId = action.meta.requestId
      })
      .addCase(fetchComets.fulfilled, (state, action) => {
        if (state.listRequestId !== action.meta.requestId) return
        state.listLoading = false
        state.list = action.payload.comets
        state.isMock = action.payload.isMock
      })
      .addCase(fetchComets.rejected, (state, action) => {
        if (state.listRequestId !== action.meta.requestId) return
        state.listLoading = false
        state.list = []
      })

      .addCase(fetchFeedComet.pending, (state, action) => {
        state.feedLoading = true
        state.feedRequestId = action.meta.requestId
      })
      .addCase(fetchFeedComet.fulfilled, (state, action) => {
        if (state.feedRequestId !== action.meta.requestId) return
        state.feedLoading = false
        state.feed = action.payload.comet
        state.feedKey = feedKeyOf(action.meta.arg.id, action.meta.arg.next)
        state.isMock = action.payload.isMock
      })
      .addCase(fetchFeedComet.rejected, (state, action) => {
        if (state.feedRequestId !== action.meta.requestId) return
        state.feedLoading = false
      })

      .addCase(likeComet.pending, (state, action) => {
        state.pendingIds.push(action.meta.arg.id)
      })
      .addCase(likeComet.fulfilled, (state, action) => {
        const { id, like, likesCount } = action.payload
        removePending(state, id)
        for (const comet of [state.feed, ...state.list]) {
          if (comet?.id === id) {
            comet.is_liked = like ? 1 : 0
            comet.likes_count = likesCount
          }
        }
      })
      .addCase(likeComet.rejected, (state, action) => {
        removePending(state, action.meta.arg.id)
      })

      .addCase(deleteComet.pending, (state, action) => {
        state.pendingIds.push(action.meta.arg)
      })
      .addCase(deleteComet.fulfilled, (state, action) => {
        removePending(state, action.payload)
        state.list = state.list.filter((comet) => comet.id !== action.payload)
        if (state.feed?.id === action.payload) state.feed = null
      })
      .addCase(deleteComet.rejected, (state, action) => {
        removePending(state, action.meta.arg)
      })

      .addMatcher(isAnyOf(createCometDraft.pending, publishComet.pending), (state) => {
        state.savingDraft = true
      })
      .addMatcher(
        isAnyOf(createCometDraft.fulfilled, createCometDraft.rejected, publishComet.fulfilled, publishComet.rejected),
        (state) => {
          state.savingDraft = false
        },
      )
  },
})

export default cometsSlice.reducer
