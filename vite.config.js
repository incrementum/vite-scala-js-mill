import { defineConfig } from 'vite';
import vitePluginMill from './vite-plugin-mill.ts';

export default defineConfig({
  resolve: {
    alias: {
      'main.css': '/client/resources/client/css/main.css',
    },
  },
  plugins: [
    vitePluginMill({ millModule: 'client' }) // specify the mill module to use
  ]
});