import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) {
            return;
          }

          if (
            id.includes('/react/') ||
            id.includes('/react-dom/')
          ) {
            return 'react';
          }

          if (
            id.includes('/three/') ||
            id.includes('/@react-three/')
          ) {
            return 'three';
          }

          return 'vendor';
        },
      },
    },
  },
});
