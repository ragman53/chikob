// @ts-check
import { defineConfig } from 'astro/config';

import mdx from '@astrojs/mdx';

// https://astro.build/config
export default defineConfig({
  vite: {
      server: {
          host: '0.0.0.0',
          port: 8080,
          hmr: {
              protocol: 'ws',
              host: 'localhost',
          },
          watch: {
              usePolling: true,
              interval: 1000,
          }
      }
  },

  integrations: [mdx()]
});