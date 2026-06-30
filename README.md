# Navaja

Una navaja suiza de **utilidades de texto**: rápida, sin distracciones y con modo claro/oscuro.
Hecha con **Astro + Tailwind CSS v4**.

## Herramientas

- **Contador** — caracteres, sin espacios y palabras, en vivo.
- **Conversor** — mayúsculas, minúsculas, capitalizar y mayúscula tras punto.
- **Lorem Ipsum** — genera párrafos, frases o palabras.
- **Binario** — texto ↔ binario (UTF-8), bidireccional.
- **Contraseñas** — generador seguro con Web Crypto.
- **Base64** — codifica y descodifica (UTF-8), bidireccional.
- **Slug** — convierte texto en slugs limpios para URLs.

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
