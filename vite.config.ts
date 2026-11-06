import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Адреса веб-сервиса и Minio можно переопределить переменными окружения (например, API_TARGET=http://localhost:8081)
const API_TARGET = process.env.API_TARGET ?? 'http://localhost:8080'
const S3_TARGET = process.env.S3_TARGET ?? 'http://localhost:9000'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    // Прокси решает проблему CORS: браузер обращается только к адресу фронтенда.
    // /api/… — веб-сервис на Go, /s3/… — файлы Minio (/s3/comets/x.jpg → http://localhost:9000/comets/x.jpg)
    proxy: {
      '/api': {
        target: API_TARGET,
        changeOrigin: true,
      },
      '/s3': {
        target: S3_TARGET,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/s3/, ''),
      },
    },
  },
})
