import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import vercel from '@astrojs/vercel';

export default defineConfig({
  output: 'server',
  adapter: vercel(),
  integrations: [react()],
  site: 'https://lifeos.example.com',
  prefetch: true,
  security: {
    // Default is already `true` in Astro 6; set explicitly to document intent and guard
    // against a future default change. Rejects form/action POSTs whose Origin doesn't
    // match the host — CSRF defense alongside the SameSite=lax session cookie.
    checkOrigin: true,
  },
});
