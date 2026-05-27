import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
    proxy: {
      '/api-maritaca': {
        target: 'https://chat.maritaca.ai',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api-maritaca/, '/api/v1/chat/completions')
      }
    }
  }
});
