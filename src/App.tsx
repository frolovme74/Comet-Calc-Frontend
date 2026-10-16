import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from './AppLayout'
import { ROUTES } from './Routes'
import { CometsPage } from './pages/CometsPage'
import { FeedPage } from './pages/FeedPage'
import { HomePage } from './pages/HomePage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path={ROUTES.HOME} element={<HomePage />} />
          <Route path={ROUTES.FEED} element={<FeedPage />} />
          <Route path={`${ROUTES.FEED}/:id`} element={<FeedPage />} />
          <Route path={ROUTES.COMETS} element={<CometsPage />} />
          {/* Несуществующий адрес — на ленту, как в SSR-страницах бэкенда */}
          <Route path="*" element={<Navigate to={ROUTES.FEED} replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
