import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa';
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
      manifest: {
        name: 'QuickNote',
        short_name: 'Note',
        description: 'Your note-taking PWA',
        theme_color: '#ffffff',
        icons: [
          {
            src: '/icons1.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/icon2.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
})
