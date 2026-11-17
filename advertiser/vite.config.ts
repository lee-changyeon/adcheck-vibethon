import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: { host: true }, // 같은 와이파이의 휴대폰에서 접속 가능
  build: { chunkSizeWarningLimit: 1000 }, // 차트 라이브러리 포함 시 크기 경고 방지
})
