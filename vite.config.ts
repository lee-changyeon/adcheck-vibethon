import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    // 설치형 앱(PWA): 매니페스트 + 서비스 워커(앱 파일을 휴대폰에 저장해 오프라인에서도 동작)
    VitePWA({
      registerType: 'autoUpdate', // 새 버전을 배포하면 다음 실행 때 자동으로 바뀐다
      includeAssets: ['icon.svg', 'icons/apple-touch-icon.png'],
      manifest: {
        id: '/',
        name: '애드체크 - 뒷광고 점검',
        short_name: '애드체크',
        description: '올리기 전에 협찬 글의 광고 표시를 점검하고 고친 글까지 만들어 주는 뒷광고 예방 체크기',
        lang: 'ko',
        dir: 'ltr',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#ffffff',
        theme_color: '#ffffff',
        categories: ['business', 'productivity', 'utilities'],
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: '/icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // 앱 화면 파일은 설치할 때 미리 저장 (글꼴 조각 92개 12MB는 제외하고 아래에서 쓸 때만 저장)
        globPatterns: ['**/*.{js,css,html,svg,png}'],
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/\.well-known\//],
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.pathname.endsWith('.woff2'),
            handler: 'CacheFirst',
            options: { cacheName: 'fonts', expiration: { maxEntries: 120, maxAgeSeconds: 60 * 60 * 24 * 365 } },
          },
        ],
      },
    }),
  ],
  server: { host: true }, // 같은 와이파이의 휴대폰에서 접속 가능
  build: { chunkSizeWarningLimit: 1000 }, // 차트 라이브러리 포함 시 크기 경고 방지
})
