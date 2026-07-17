import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { readFileSync } from 'fs'

// Leemos el package.json para extraer la versión actual
const packageJson = JSON.parse(
  readFileSync(new URL('../package.json', import.meta.url))
)

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    host: '127.0.0.1',
    port: 5174,
    strictPort: true,
  },
  define: {
    // Inyectamos la versión en las variables de entorno de Vite
    'import.meta.env.VITE_APP_VERSION': JSON.stringify(packageJson.version),
  },
})