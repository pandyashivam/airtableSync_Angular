import { defineConfig } from 'vite';
import angular from '@analogjs/vite-plugin-angular';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    angular({
      tsconfig: './tsconfig.app.json',
    }),
  ],
  resolve: {
    preserveSymlinks: true,
    dedupe: ['@angular/core', '@angular/common', '@angular/animations', '@angular/platform-browser']
  },
  build: {
    target: 'es2020',
  },
  optimizeDeps: {
    include: ['@angular/animations/browser']
  }
}); 