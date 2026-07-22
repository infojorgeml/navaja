// src/lib/modules.ts — registro único de módulos (lo consumen Home y CommandPalette).
// Solo metadatos neutros de idioma: el `slug` (para la ruta, localizada con
// getRelativeLocaleUrl) y `keywords` para ⌘K (ES + EN mezclados para buscar en ambos).
// Las etiquetas y descripciones visibles viven en src/i18n/ui.ts (clave `tool.<slug>.*`).
export interface ModuleEntry {
  slug: string;
  keywords: string[];
}

export const modules: ModuleEntry[] = [
  { slug: 'contador', keywords: ['contador', 'caracteres', 'palabras', 'contar', 'longitud', 'counter', 'characters', 'words', 'count', 'length'] },
  { slug: 'conversor', keywords: ['conversor', 'mayusculas', 'minusculas', 'capitalizar', 'texto', 'transformar', 'converter', 'uppercase', 'lowercase', 'capitalize', 'case'] },
  { slug: 'lorem', keywords: ['lorem', 'ipsum', 'relleno', 'placeholder', 'dummy', 'generar', 'filler', 'generate'] },
  { slug: 'binario', keywords: ['binario', 'binary', 'bits', 'ascii', 'utf-8', 'codificar', 'decodificar', 'encode', 'decode'] },
  { slug: 'password', keywords: ['contraseña', 'password', 'clave', 'segura', 'aleatoria', 'generar', 'secure', 'random', 'generate'] },
  { slug: 'base64', keywords: ['base64', 'codificar', 'descodificar', 'encode', 'decode'] },
  { slug: 'slug', keywords: ['slug', 'url', 'seo', 'permalink', 'amigable', 'friendly'] },
  { slug: 'naming', keywords: ['naming', 'nombres', 'nombre', 'negocio', 'empresa', 'marca', 'startup', 'generador', 'ideas', 'names', 'business', 'brand'] },
  { slug: 'diff', keywords: ['diff', 'comparar', 'comparador', 'diferencias', 'cambios', 'texto', 'lineas', 'compare', 'differences', 'changes', 'lines'] },
  { slug: 'json', keywords: ['json', 'formatear', 'minificar', 'validar', 'pretty', 'prettify', 'parse', 'format', 'minify', 'validate'] },
  { slug: 'url', keywords: ['url', 'encode', 'decode', 'codificar', 'descodificar', 'uri', 'percent', 'porcentaje'] },
  { slug: 'limpiador', keywords: ['limpiador', 'limpiar', 'espacios', 'saltos', 'invisibles', 'zero-width', 'pdf', 'clean', 'cleaner', 'spaces', 'whitespace'] },
  { slug: 'ordenar', keywords: ['ordenar', 'lineas', 'alfabetico', 'aleatorio', 'duplicados', 'sort', 'lista', 'barajar', 'lines', 'alphabetical', 'random', 'duplicates', 'shuffle'] },
  { slug: 'extractor', keywords: ['extractor', 'extraer', 'emails', 'correos', 'urls', 'enlaces', 'numeros', 'regex', 'extract', 'links', 'numbers'] },
  { slug: 'placeholder', keywords: ['placeholder', 'muestra', 'ejemplo', 'lorem', 'relleno', 'idiomas', 'alfabetos', 'arabe', 'chino', 'japones', 'coreano', 'unicode', 'rtl', 'sample', 'languages', 'scripts'] },
  { slug: 'color', keywords: ['color', 'hex', 'rgb', 'hsl', 'oklch', 'contraste', 'contrast', 'wcag', 'accesibilidad', 'accessibility', 'paleta', 'palette', 'tintes', 'tints', 'shades', 'a11y'] },
  { slug: 'gradiente', keywords: ['gradiente', 'gradient', 'degradado', 'css', 'lineal', 'linear', 'radial', 'conico', 'conic', 'fondo', 'background', 'generador', 'generator'] },
  { slug: 'sombra', keywords: ['sombra', 'shadow', 'box-shadow', 'css', 'desenfoque', 'blur', 'inset', 'interior', 'capas', 'layers', 'elevacion', 'elevation'] },
];
