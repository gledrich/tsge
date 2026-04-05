import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'resolve-dino-ge',
      resolveId(id) {
        if (id === 'dino-ge') {
          // This tells Vite that 'dino-ge' should be treated as a native browser import.
          // The browser will then use the importmap to resolve it to /built/index.js.
          return { id: 'dino-ge', external: true };
        }
      }
    }
  ],
  server: {
    proxy: {
      '/api': 'http://localhost:3000',
      '/files': 'http://localhost:3000',
      '/scripts': 'http://localhost:3000',
      '/built': 'http://localhost:3000'
    }
  },
  build: {
    rollupOptions: {
      external: ['dino-ge'],
      output: {
        globals: {
          'dino-ge': 'Dino'
        }
      }
    }
  }
});
