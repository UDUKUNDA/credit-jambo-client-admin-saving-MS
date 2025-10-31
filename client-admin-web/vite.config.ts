/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // All frontend calls to /api/* will be forwarded to the backend
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  // test: {
  //   environment: 'jsdom', // simulate browser for React component tests
  //   setupFiles: ['./src/test/setup.ts'], // global test setup
  //   globals: true, // enables describe/it/expect globals
  //   coverage: {
  //     reporter: ['text', 'html'],
  //   },
  // },
});