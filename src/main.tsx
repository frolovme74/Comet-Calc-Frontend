import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import 'bootstrap/dist/css/bootstrap.min.css'
import './index.css'
import App from './App.tsx'
import { isPages, publicAsset } from './modules/deployment'
import { store } from './store'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </StrictMode>,
)

if (isPages && 'serviceWorker' in navigator) {
  navigator.serviceWorker.register(publicAsset('sw.js')).catch((error: unknown) => {
    console.error('Не удалось зарегистрировать service worker', error)
  })
}
