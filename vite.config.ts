import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

const tauriDevHost = process.env.TAURI_DEV_HOST;

export default defineConfig({
  plugins: [react()],
  clearScreen: false,
  build: {
    target: 'es2022',
    sourcemap: true,
    cssCodeSplit: true,
    chunkSizeWarningLimit: 500,
  },
  server: {
    host: tauriDevHost || false,
    port: 5173,
    strictPort: true,
    hmr: tauriDevHost ? { protocol: 'ws', host: tauriDevHost, port: 5174 } : undefined,
    watch: { ignored: ['**/src-tauri/**'] },
  },
  preview: { port: 4173, strictPort: true },
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      include: ['src/domain/**/*.ts', 'src/storage/**/*.ts'],
      thresholds: { statements: 70, branches: 60, functions: 70, lines: 70 },
      exclude: ['src/**/*.d.ts'],
    },
  },
});
