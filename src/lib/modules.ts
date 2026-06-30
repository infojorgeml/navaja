// src/lib/modules.ts — registro único de módulos (lo consumen Header y CommandPalette)
export interface ModuleEntry {
  href: string;
  label: string;
  description: string;
  keywords: string[];
}

export const modules: ModuleEntry[] = [
  {
    href: '/contador',
    label: 'Contador',
    description: 'Cuenta caracteres y palabras',
    keywords: ['contador', 'caracteres', 'palabras', 'contar', 'longitud'],
  },
  {
    href: '/conversor',
    label: 'Conversor',
    description: 'Mayúsculas, minúsculas, capitalizar',
    keywords: ['conversor', 'mayusculas', 'minusculas', 'capitalizar', 'texto', 'transformar'],
  },
  {
    href: '/lorem',
    label: 'Lorem Ipsum',
    description: 'Genera texto de relleno',
    keywords: ['lorem', 'ipsum', 'relleno', 'placeholder', 'dummy', 'generar'],
  },
  {
    href: '/binario',
    label: 'Binario',
    description: 'Convierte texto ↔ binario',
    keywords: ['binario', 'binary', 'bits', 'ascii', 'utf-8', 'codificar', 'decodificar'],
  },
  {
    href: '/password',
    label: 'Contraseñas',
    description: 'Genera contraseñas seguras',
    keywords: ['contraseña', 'password', 'clave', 'segura', 'aleatoria', 'generar'],
  },
  {
    href: '/base64',
    label: 'Base64',
    description: 'Codifica y descodifica Base64',
    keywords: ['base64', 'codificar', 'descodificar', 'encode', 'decode'],
  },
  {
    href: '/slug',
    label: 'Slug',
    description: 'Convierte texto en slug de URL',
    keywords: ['slug', 'url', 'seo', 'permalink', 'amigable'],
  },
];
