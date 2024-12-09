const react = require('@vitejs/plugin-react').default;
const { defineConfig } = require('vite');
const path = require('path');

module.exports = defineConfig({
  plugins: [react()],
  root: '.',
  base: './',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true
  }
});