import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
      '@shared': path.resolve(import.meta.dirname, './src'),
    },
  },
  server: {
    port: 8010,
    host: '0.0.0.0',
    proxy: {
      '/api': {
        target: process.env.VITE_PROXY_TARGET || 'https://api.plexivia.com',
        changeOrigin: true,
        ws: true,
      },
      '/ws': {
        target: (process.env.VITE_PROXY_TARGET || 'https://api.plexivia.com').replace(/^http/, 'ws'),
        ws: true,
        changeOrigin: true,
      }
    }
  },
  build: {
    outDir: 'dist',
    chunkSizeWarningLimit: 2000,
  },
});
