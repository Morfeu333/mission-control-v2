import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 7777,
    proxy: {
      '/openclaw': {
        target: 'http://localhost:18790',
        rewrite: (path) => path.replace(/^\/openclaw/, ''),
        headers: { 'Authorization': 'Bearer 6a6389b5ce0253816a845de7f4b2f2e2081f7209bc003f17' }
      },
      '/convex-http': {
        target: 'https://compassionate-shrimp-199.convex.site',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/convex-http/, '')
      },
      '/local': {
        target: 'http://localhost:7778',
        rewrite: (path) => path
      }
    }
  }
})
