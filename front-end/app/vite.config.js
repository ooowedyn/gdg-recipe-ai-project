import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // 개발(A안): 프론트(/api, /media) 요청을 FastAPI(:8000) 로 프록시.
    // 덕분에 프론트는 절대 URL/CORS 신경 없이 fetch('/api/...') 만 쓰면 된다.
    proxy: {
      '/api': 'http://localhost:8000',
      '/media': 'http://localhost:8000',
    },
  },
})
