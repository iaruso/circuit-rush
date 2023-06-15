import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import viteCompression from 'vite-plugin-compression';

const isCodeSandbox = 'SANDBOX_URL' in process.env || 'CODESANDBOX_HOST' in process.env

export default defineConfig({
  base: './',
  plugins: [
    react(),
    viteCompression(),
  ],
	server: {
		host: true,
		open: !isCodeSandbox
  },
  root: 'src/',
  publicDir: '../public/',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    sourcemap: true
  }
});