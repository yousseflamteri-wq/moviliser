import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// VITE_LOCKER_URL / VITE_LOCKER_SUB_PARAM come from .env (see .env.example).
// They're build-time public values — safe to ship (the locker link is public anyway).
export default defineConfig({
  plugins: [react()],
  build: { outDir: 'dist', assetsInlineLimit: 4096 },
  server: {
    port: 5173,
    proxy: { '/api': { target: 'http://127.0.0.1:8788', changeOrigin: true } },
  },
});
