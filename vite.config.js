import { defineConfig } from 'vite';
import { resolve } from 'node:path';

export default defineConfig({
  root: 'src',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'src/index.html'),
        policy: resolve(__dirname, 'src/policy.html'),
        services: resolve(__dirname, 'src/services.html'),
        team: resolve(__dirname, 'src/team.html'),
        locations: resolve(__dirname, 'src/locations.html')
      }
    }
  }
});
