import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { tweakWritePlugin } from 'dev-tweak-tool/vite';

export default defineConfig({
  base: '/qq-avatar-demo-createsimple/',
  plugins: [react(), tweakWritePlugin()],
  server: {
    port: 3000,
    open: true,
  },
});
