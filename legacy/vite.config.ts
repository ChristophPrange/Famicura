import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  // Der Ordner liegt in OneDrive: Dateien erst lesen, wenn das Schreiben/Synchronisieren
  // abgeschlossen ist – sonst liest Vite halbe Dateien und zeigt Syntaxfehler.
  server: {
    watch: { awaitWriteFinish: { stabilityThreshold: 800, pollInterval: 100 } },
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon.svg'],
      manifest: {
        name: 'FamilienPflege',
        short_name: 'FamilienPflege',
        description: 'Pflege gemeinsam organisieren – Prototyp',
        lang: 'de',
        theme_color: '#4f7a5b',
        background_color: '#faf7f2',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: 'icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any maskable' },
        ],
      },
    }),
  ],
})
