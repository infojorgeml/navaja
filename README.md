# Deftkit

Herramientas online **rápidas y privadas** para texto, desarrollo, diseño e imagen:
sin distracciones, bilingües (ES/EN), con modo claro/oscuro y sin subir nada a ningún
servidor. Todo se procesa en el navegador. Hecha con **Astro + Tailwind CSS v4**.

## Herramientas

**Texto**

- **Contador** — caracteres, sin espacios y palabras, en vivo.
- **Conversor** — mayúsculas, minúsculas, capitalizar y mayúscula tras punto.
- **Lorem Ipsum** — genera párrafos, frases o palabras.
- **Placeholder** — texto de muestra con palabras reales en 11 alfabetos.
- **Limpiador** — quita espacios dobles, saltos de más y caracteres invisibles.
- **Ordenar líneas** — alfabético, inverso o al azar, y quita duplicados.
- **Extractor** — saca emails, URLs o números de cualquier texto.
- **Diff** — compara dos textos línea a línea.
- **Slug** — convierte texto en slugs limpios para URLs.
- **Naming** — genera nombres de negocio con prefijos y sufijos.

**Desarrollo**

- **JSON** — formatea, minifica y valida.
- **CSV ↔ JSON** — en ambos sentidos, con comillas y campos multilínea.
- **Regex** — prueba expresiones regulares con coincidencias y grupos en vivo.
- **Base64**, **URL encode** y **Binario** — codifican y descodifican en ambos sentidos (UTF-8).
- **Bases** — binario, octal, decimal, hexadecimal y cualquier base.
- **Timestamp** — Unix, ISO y fecha legible, con zonas horarias.
- **Cripto** — hashes SHA y UUID.
- **Contraseñas** — generador seguro con Web Crypto.

**Diseño e imagen**

- **Color** — HEX, RGB, HSL y OKLCH, tintes y sombras, y contraste WCAG.
- **Gradientes** y **Sombras** — editores visuales que copian el CSS.
- **Calco** — vectoriza una imagen a SVG, a una tinta o a varios colores (port de Potrace, en un Web Worker).
- **EPS a SVG** — convierte archivos EPS en SVG con un intérprete PostScript propio (CMYK, recortes, texto simple).
- **Pixel art** — convierte una imagen en pixel art con paletas y rejilla, y la exporta en PNG (basado en Pixelacer).

**Cálculo**

- **Porcentajes** — porcentajes, descuentos, impuestos y variaciones.
- **Unidades** — longitud, peso, temperatura y almacenamiento.

Busca cualquier herramienta al instante con **⌘K / Ctrl+K**.

## Stack

- [Astro](https://astro.build) (SSG) con View Transitions
- [Tailwind CSS v4](https://tailwindcss.com) — tokens en `@theme` (tema de shadcn)
- Tipografía **Inter** self-hosted (Fonts API nativa de Astro)
- Animaciones con [Motion](https://motion.dev)

## Desarrollo

Requiere Node 22+.

| Comando           | Acción                                       |
| ----------------- | -------------------------------------------- |
| `npm install`     | Instala las dependencias                     |
| `npm run dev`     | Servidor de desarrollo en `localhost:5690`   |
| `npm run build`   | Build de producción en `dist/`               |
| `npm run preview` | Sirve la build de producción localmente      |

## Estructura

```
src/
├─ components/   # Header, Footer, Page, CommandPalette y la isla de cada módulo
├─ layouts/      # BaseLayout
├─ lib/          # modules.ts — registro único de módulos
├─ pages/        # índice + una ruta por herramienta
└─ styles/       # global.css — tokens, utilidades y componentes
```

## Licencia

Proyecto open source. Creado por [JorgeML](https://jorgeml.com/).
