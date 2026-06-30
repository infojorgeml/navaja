// astro.config.mjs
import { defineConfig, fontProviders } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// Base esencial (ver base-astro.md). Cuando el proyecto lo necesite, aquí se
// añaden: `site` + adapter de Vercel + sitemap (§3, §8) y PWA (§7).
export default defineConfig({
  output: 'static', // SSG. SSR solo por ruta con `export const prerender = false`

  // Puerto fijo propio de este proyecto (poco común, para no chocar con otros Astro en 4321).
  // Respeta PORT del entorno si se define; en local `npm run dev` usa 5690.
  server: { port: process.env.PORT ? Number(process.env.PORT) : 5690 },

  // Inlinea el CSS en el HTML: -1 request de render-blocking (base-astro.md §3).
  build: { inlineStylesheets: 'always' },

  // Prefetch inteligente de enlaces
  prefetch: { prefetchAll: true, defaultStrategy: 'viewport' },

  // Tailwind v4 como plugin de Vite (config en CSS con @theme, sin tailwind.config.js)
  vite: { plugins: [tailwindcss()] },

  // Tipografía self-hosted con la Fonts API nativa (base-astro.md §5):
  // Merriweather (serif), autoalojada + fallback con métricas + preload.
  fonts: [
    {
      provider: fontProviders.fontsource(),
      name: 'Inter',
      cssVariable: '--font-body',
      weights: [400, 500, 600, 700],
      styles: ['normal'],
      subsets: ['latin', 'latin-ext'],
      fallbacks: ['system-ui', 'sans-serif'],
    },
  ],
});
