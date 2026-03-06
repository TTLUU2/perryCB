import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Build config for embeddable widget bundle (single JS file)
export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: 'src/main.tsx',
      name: 'PointsGenie',
      fileName: 'points-genie-widget',
      formats: ['iife'],
    },
    rollupOptions: {
      output: {
        assetFileNames: 'points-genie-widget.[ext]',
      },
    },
    outDir: 'dist/widget',
    cssCodeSplit: false,
  },
  define: {
    'process.env.NODE_ENV': '"production"',
  },
})
