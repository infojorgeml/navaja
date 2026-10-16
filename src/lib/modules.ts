// src/lib/modules.ts — registro único de módulos (lo consumen Home, CommandPalette,
// Header, BaseHead y el sitemap). Solo metadatos neutros de idioma:
// - `id`: identificador interno estable (el slug español original). Es la base de las
//   claves i18n `tool.<id>.*` de src/i18n/ui.ts y no cambia aunque cambie la URL.
// - `slugs`: el segmento de URL de cada idioma (/counter en inglés, /es/contador en español).
// - `keywords`: para ⌘K (ES + EN mezclados para buscar en ambos).
export type ModuleLocale = 'en' | 'es';

export interface ModuleEntry {
  id: string;
  slugs: Record<ModuleLocale, string>;
  keywords: string[];
}

export const modules: ModuleEntry[] = [
  { id: 'contador', slugs: { en: 'counter', es: 'contador' }, keywords: ['contador', 'caracteres', 'palabras', 'contar', 'longitud', 'counter', 'characters', 'words', 'count', 'length'] },
  { id: 'conversor', slugs: { en: 'case-converter', es: 'conversor' }, keywords: ['conversor', 'mayusculas', 'minusculas', 'capitalizar', 'texto', 'transformar', 'converter', 'uppercase', 'lowercase', 'capitalize', 'case'] },
  { id: 'lorem', slugs: { en: 'lorem', es: 'lorem' }, keywords: ['lorem', 'ipsum', 'relleno', 'placeholder', 'dummy', 'generar', 'filler', 'generate'] },
  { id: 'binario', slugs: { en: 'binary', es: 'binario' }, keywords: ['binario', 'binary', 'bits', 'ascii', 'utf-8', 'codificar', 'decodificar', 'encode', 'decode'] },
  { id: 'password', slugs: { en: 'password', es: 'password' }, keywords: ['contraseña', 'password', 'clave', 'segura', 'aleatoria', 'generar', 'secure', 'random', 'generate'] },
  { id: 'base64', slugs: { en: 'base64', es: 'base64' }, keywords: ['base64', 'codificar', 'descodificar', 'encode', 'decode'] },
  { id: 'slug', slugs: { en: 'slug', es: 'slug' }, keywords: ['slug', 'url', 'seo', 'permalink', 'amigable', 'friendly'] },
  { id: 'naming', slugs: { en: 'naming', es: 'naming' }, keywords: ['naming', 'nombres', 'nombre', 'negocio', 'empresa', 'marca', 'startup', 'generador', 'ideas', 'names', 'business', 'brand'] },
  { id: 'diff', slugs: { en: 'diff', es: 'diff' }, keywords: ['diff', 'comparar', 'comparador', 'diferencias', 'cambios', 'texto', 'lineas', 'compare', 'differences', 'changes', 'lines'] },
  { id: 'json', slugs: { en: 'json', es: 'json' }, keywords: ['json', 'formatear', 'minificar', 'validar', 'pretty', 'prettify', 'parse', 'format', 'minify', 'validate'] },
  { id: 'url', slugs: { en: 'url', es: 'url' }, keywords: ['url', 'encode', 'decode', 'codificar', 'descodificar', 'uri', 'percent', 'porcentaje'] },
  { id: 'limpiador', slugs: { en: 'cleaner', es: 'limpiador' }, keywords: ['limpiador', 'limpiar', 'espacios', 'saltos', 'invisibles', 'zero-width', 'pdf', 'clean', 'cleaner', 'spaces', 'whitespace'] },
  { id: 'ordenar', slugs: { en: 'sort-lines', es: 'ordenar' }, keywords: ['ordenar', 'lineas', 'alfabetico', 'aleatorio', 'duplicados', 'sort', 'lista', 'barajar', 'lines', 'alphabetical', 'random', 'duplicates', 'shuffle'] },
  { id: 'extractor', slugs: { en: 'extractor', es: 'extractor' }, keywords: ['extractor', 'extraer', 'emails', 'correos', 'urls', 'enlaces', 'numeros', 'regex', 'extract', 'links', 'numbers'] },
  { id: 'placeholder', slugs: { en: 'placeholder', es: 'placeholder' }, keywords: ['placeholder', 'muestra', 'ejemplo', 'lorem', 'relleno', 'idiomas', 'alfabetos', 'arabe', 'chino', 'japones', 'coreano', 'unicode', 'rtl', 'sample', 'languages', 'scripts'] },
  { id: 'color', slugs: { en: 'color', es: 'color' }, keywords: ['color', 'hex', 'rgb', 'hsl', 'oklch', 'contraste', 'contrast', 'wcag', 'accesibilidad', 'accessibility', 'paleta', 'palette', 'tintes', 'tints', 'shades', 'a11y'] },
  { id: 'gradiente', slugs: { en: 'gradient', es: 'gradiente' }, keywords: ['gradiente', 'gradient', 'degradado', 'css', 'lineal', 'linear', 'radial', 'conico', 'conic', 'fondo', 'background', 'generador', 'generator'] },
  { id: 'sombra', slugs: { en: 'shadow', es: 'sombra' }, keywords: ['sombra', 'shadow', 'box-shadow', 'css', 'desenfoque', 'blur', 'inset', 'interior', 'capas', 'layers', 'elevacion', 'elevation'] },
  { id: 'regex', slugs: { en: 'regex', es: 'regex' }, keywords: ['regex', 'regexp', 'expresion', 'expresiones', 'regular', 'patron', 'pattern', 'coincidencias', 'matches', 'grupos', 'groups', 'probador', 'tester', 'buscar'] },
  { id: 'timestamp', slugs: { en: 'timestamp', es: 'timestamp' }, keywords: ['timestamp', 'unix', 'epoch', 'fecha', 'date', 'hora', 'time', 'iso', 'zona', 'horaria', 'timezone', 'utc', 'convertir', 'convert'] },
  { id: 'csv', slugs: { en: 'csv', es: 'csv' }, keywords: ['csv', 'json', 'convertir', 'convert', 'tabla', 'table', 'excel', 'hoja', 'spreadsheet', 'delimitador', 'delimiter', 'datos', 'data'] },
  { id: 'bases', slugs: { en: 'bases', es: 'bases' }, keywords: ['bases', 'base', 'binario', 'binary', 'octal', 'decimal', 'hexadecimal', 'hex', 'radix', 'numero', 'number', 'convertir', 'convert', 'bigint'] },
  { id: 'crypto', slugs: { en: 'crypto', es: 'crypto' }, keywords: ['cripto', 'crypto', 'hash', 'sha', 'sha256', 'sha512', 'uuid', 'guid', 'checksum', 'huella', 'digest', 'identificador', 'random', 'generar', 'generate'] },
  { id: 'percent', slugs: { en: 'percent', es: 'percent' }, keywords: ['porcentaje', 'porcentajes', 'percent', 'percentage', 'descuento', 'discount', 'iva', 'tax', 'impuesto', 'propina', 'tip', 'variacion', 'change', 'calculadora', 'calculator'] },
  { id: 'units', slugs: { en: 'units', es: 'units' }, keywords: ['unidades', 'units', 'convertir', 'convert', 'longitud', 'length', 'peso', 'weight', 'masa', 'mass', 'temperatura', 'temperature', 'almacenamiento', 'storage', 'km', 'kg', 'celsius', 'fahrenheit'] },
  { id: 'calco', slugs: { en: 'image-trace', es: 'calco' }, keywords: ['calco', 'calcar', 'vectorizar', 'vector', 'svg', 'imagen', 'logo', 'potrace', 'illustrator', 'png', 'jpg', 'bitmap', 'trace', 'tracing', 'vectorize', 'image', 'colores', 'colors'] },
  { id: 'eps', slugs: { en: 'eps', es: 'eps' }, keywords: ['eps', 'svg', 'convertir', 'convert', 'postscript', 'ps', 'epsf', 'vector', 'vectorial', 'illustrator', 'cmyk', 'logo', 'archivo', 'file', 'exportar', 'export'] },
  { id: 'pixel', slugs: { en: 'pixel', es: 'pixel' }, keywords: ['pixel', 'pixel art', 'pixelar', 'pixelate', 'pixelacer', 'retro', '8 bits', '8-bit', 'imagen', 'image', 'paleta', 'palette', 'pico-8', 'rejilla', 'grid', 'png', 'mosaico', 'mosaic'] },
];

// Traduce el slug de una ruta (sin prefijo de idioma, como el que devuelve basePath)
// al otro idioma: 'counter' (en) → 'contador' (es). Las rutas que no son de un módulo
// (la home, '') se devuelven tal cual.
export function localizeSlug(slug: string, from: ModuleLocale, to: ModuleLocale): string {
  const m = modules.find((mod) => mod.slugs[from] === slug);
  return m ? m.slugs[to] : slug;
}
