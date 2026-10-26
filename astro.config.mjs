import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://flyoverhead.github.io',
  integrations: [sitemap({ filter: (page) => !page.endsWith('/og/') })],
});
