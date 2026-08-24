// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import cloudflare from '@astrojs/cloudflare';

// https://astro.build/config
export default defineConfig({
  site: 'https://example.com', // PENDING — domain not yet registered

  integrations: [react()],

  vite: {
    plugins: [tailwindcss()],
  },

  adapter: cloudflare({
    // Gives `locals.runtime.env` (D1, R2, vars) during `astro dev`,
    // so the lead form can be tested locally exactly as it runs in prod.
    platformProxy: { enabled: true },
    imageService: 'compile',
  }),

  // Marketing pages are static; only API routes and admin run on-demand.
  // WhatsApp's in-app browser and its link-preview crawler both need
  // real server-rendered HTML — never a client-only SPA.
  output: 'static',

  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'hover',
  },
});
