/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    // Configuración global de vitest
    globals: true, // Permite usar describe, it, expect sin importar
    environment: 'jsdom', // Simula el DOM del navegador
    setupFiles: ['./src/setupTests.ts'], // Archivo de configuración de tests
    css: true, // Permite procesar CSS en tests
    
    // Configuración de coverage
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/setupTests.ts',
        '**/*.d.ts',
        '**/*.config.*',
        'dist/',
        'build/',
        '.next/',
        'coverage/',
      ],
    },
    
    // Mock de archivos estáticos
    alias: {
      '@/': new URL('./src/', import.meta.url).pathname,
    }
  },
  
  // Configuración para resolver paths como en desarrollo
  resolve: {
    alias: {
      '@': new URL('./src', import.meta.url).pathname,
    },
  },
})