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
      includeAssets: ['logo.svg'],
      manifest: {
        name: 'QuickNote PWA',
        short_name: 'QuickNote',
        start_url: '/',       
        display: 'standalone',
        background_color: '#ffffff',    
        theme_color: '#000000',

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
