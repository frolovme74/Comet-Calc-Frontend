import { useState } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from './AppLayout'
import { ROUTES } from './Routes'
import { AddPage, type CometFiles } from './pages/AddPage'
import { CometsPage } from './pages/CometsPage'
import { FeedPage } from './pages/FeedPage'
import { LoginPage } from './pages/LoginPage'
import { useAppSelector } from './store/hooks'

function App() {
  const login = useAppSelector((state) => state.user.login)
  // File хранится в React до отправки формы. Текстовые поля хранятся в Redux.
  const [selection, setSelection] = useState<{ login: string; files: CometFiles } | null>(null)
  if (selection && selection.login !== login) setSelection(null)

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<Navigate to={ROUTES.FEED} replace />} />
          <Route path={ROUTES.FEED} element={<FeedPage />} />
          <Route path={`${ROUTES.FEED}/:id`} element={<FeedPage />} />
          <Route path={ROUTES.COMETS} element={<CometsPage />} />
          <Route
            path={ROUTES.ADD}
            element={
              <AddPage
                files={selection?.login === login ? selection?.files ?? {} : {}}
                onFilesChange={(files) => setSelection(login ? { login, files } : null)}
              />
            }
          />
          <Route path={ROUTES.LOGIN} element={<LoginPage />} />
          {/* Несуществующий адрес — на ленту, как в SSR-страницах бэкенда */}
          <Route path="*" element={<Navigate to={ROUTES.FEED} replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
