import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
    },
  },
  resolve: {
    alias: {
      '@workflow-automation/common': '../common/src',
      '@': path.resolve(__dirname, './src'),
    },
  },
  optimizeDeps: {
    include: ['tailwindcss', 'postcss'],
  },
  build: {
    commonjsOptions: {
      include: [/\.cjs/],
    },
  },
});
