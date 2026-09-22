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
        target: 'http://127.0.0.1:5095',
        changeOrigin: true,
      },
      '/ws': {
        target: 'ws://127.0.0.1:5095',
        ws: true,
      }
    }
  },
  build: {
    outDir: 'dist',
    chunkSizeWarningLimit: 2000,
  },
});
