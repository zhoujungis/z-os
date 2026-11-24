import { defineConfig } from 'astro/config';
import vue from '@astrojs/vue';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://zhoujun.dev',
  output: 'static',
  prefetch: { defaultStrategy: 'hover' },
  integrations: [
    vue(),
    sitemap({
      filter: (page) => !page.includes('/search') && !page.includes('/404'),
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
