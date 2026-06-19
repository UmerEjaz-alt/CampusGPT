import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite'; // Import the correct v4 plugin

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(), // Ensure it's active here
  ],
  server: {
    port: 3000,
    proxy: {
      '^/api/': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
});