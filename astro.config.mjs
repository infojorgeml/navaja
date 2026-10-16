// astro.config.mjs
import { defineConfig, fontProviders } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import { localizeSlug } from './src/lib/modules.ts';

const SITE = 'https://navaja-ochre.vercel.app';
const SITEMAP_LANGS = { en: 'en-US', es: 'es-ES' };

// Alternates del sitemap. El emparejado automático de @astrojs/sitemap solo une rutas
// con el mismo slug, y cada idioma tiene el suyo (/counter ↔ /es/contador), así que
// los enlaces hreflang se calculan con el registro de módulos.
function sitemapAlternates(item) {
  const { pathname } = new URL(item.url);
  const seg = pathname.split('/').filter(Boolean);
  const from = seg[0] === 'es' ? 'es' : 'en';
  if (from === 'es') seg.shift();
  const base = seg.join('/');
  const trail = pathname.endsWith('/') ? '/' : '';
  const urlFor = (to) => {
    const slug = localizeSlug(base, from, to);
    const path = [to === 'es' ? 'es' : '', slug].filter(Boolean).join('/');
    return new URL(path ? `/${path}${trail}` : '/', SITE).href;
  };
  return {
    ...item,
    links: Object.entries(SITEMAP_LANGS).map(([locale, lang]) => ({ url: urlFor(locale), lang })),
  };
}

// Base esencial (ver base-astro.md). Cuando el proyecto lo necesite, aquí se
// añaden: `site` + adapter de Vercel + sitemap (§3, §8) y PWA (§7).
export default defineConfig({
  output: 'static', // SSG. SSR solo por ruta con `export const prerender = false`

  // URL canónica del sitio. Activa <link rel="canonical"> y el sitemap.
  // URL provisional de Vercel; sustituir por el dominio definitivo cuando lo haya.
  site: SITE,

  // Bilingüe: inglés por defecto en la raíz (/counter) y español en /es/ (/es/contador).
  // Cada herramienta tiene un slug por idioma (ver src/lib/modules.ts).
  // `prefixDefaultLocale: false`: el idioma por defecto va sin prefijo.
  i18n: {
    locales: ['en', 'es'],
    defaultLocale: 'en',
    routing: { prefixDefaultLocale: false },
  },

  // Genera sitemap-index.xml + sitemap-0.xml en build (referéncialos en robots.txt).
  // `serialize` añade <xhtml:link rel="alternate" hreflang> por página con el slug de cada idioma.
  integrations: [
    sitemap({
      i18n: { defaultLocale: 'en', locales: SITEMAP_LANGS },
      serialize: sitemapAlternates,
    }),
  ],

  // Puerto fijo propio de este proyecto (poco común, para no chocar con otros Astro en 4321).
  // Respeta PORT del entorno si se define; en local `npm run dev` usa 5690.
  server: { port: process.env.PORT ? Number(process.env.PORT) : 5690 },

  // Inlinea el CSS en el HTML: -1 request de render-blocking (base-astro.md §3).
  build: { inlineStylesheets: 'always' },

  // Prefetch inteligente de enlaces
  prefetch: { prefetchAll: true, defaultStrategy: 'viewport' },

  // Sin la barra flotante de desarrollo de Astro: tapa la parte baja de las herramientas.
  devToolbar: { enabled: false },

  // Tailwind v4 como plugin de Vite (config en CSS con @theme, sin tailwind.config.js)
  vite: { plugins: [tailwindcss()] },

  // Tipografía self-hosted con la Fonts API nativa (base-astro.md §5):
  // Inter (sans) y JetBrains Mono (código), autoalojadas + fallback con métricas.
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
    // Mono de las superficies de código y salida técnica (DESIGN.md de Cursor).
    {
      provider: fontProviders.fontsource(),
      name: 'JetBrains Mono',
      cssVariable: '--font-code',
      weights: [400, 500],
      styles: ['normal'],
      subsets: ['latin', 'latin-ext'],
      fallbacks: ['ui-monospace', 'monospace'],
    },
  ],
});
