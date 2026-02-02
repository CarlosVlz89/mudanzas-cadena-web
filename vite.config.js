import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      
      // --- AGREGA ESTO PARA QUE SE ACTUALICE SÍ O SÍ ---
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'], // Qué archivos guardar
        cleanupOutdatedCaches: true, // Borra versiones viejas de inmediato
        clientsClaim: true,          // Toma el control de la página abierta
        skipWaiting: true            // No espera a que cierres la app
      },
      // --------------------------------------------------

      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'Mudanzas Cadena',
        short_name: 'Mudanzas C.',
        description: 'Logística y Transporte Seguro en México',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '.', // Asegúrate que esto sea '.' o la ruta base correcta
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
  base: "/mudanzas-cadena-web/", 
})
