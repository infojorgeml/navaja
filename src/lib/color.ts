// src/lib/color.ts — conversiones de color y contraste WCAG, sin dependencias.
// sRGB → OKLab/OKLCH con las matrices de Björn Ottosson.

export type RGB = [number, number, number]; // 0–255

/** Acepta `#abc`, `abc`, `#aabbcc`, `aabbcc`. Devuelve null si no es válido. */
export function parseHex(input: string): RGB | null {
  let s = input.trim().replace(/^#/, '');
  if (/^[0-9a-fA-F]{3}$/.test(s)) s = s.split('').map((c) => c + c).join('');
  if (!/^[0-9a-fA-F]{6}$/.test(s)) return null;
  const n = parseInt(s, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export function toHex([r, g, b]: RGB): string {
  return (
    '#' +
    [r, g, b]
      .map((v) => Math.round(clamp(v, 0, 255)).toString(16).padStart(2, '0'))
      .join('')
      .toUpperCase()
  );
}

function clamp(v: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, v));
}

/** HSL en grados / porcentaje / porcentaje. */
export function rgbToHsl([r, g, b]: RGB): [number, number, number] {
  const R = r / 255,
    G = g / 255,
    B = b / 255;
  const max = Math.max(R, G, B);
  const min = Math.min(R, G, B);
  const l = (max + min) / 2;
  const d = max - min;
  let h = 0;
  let s = 0;
  if (d !== 0) {
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === R) h = (G - B) / d + (G < B ? 6 : 0);
    else if (max === G) h = (B - R) / d + 2;
    else h = (R - G) / d + 4;
    h *= 60;
  }
  return [h, s * 100, l * 100];
}

/** HSL (grados / % / %) → RGB. Inverso de `rgbToHsl`; útil para generar color. */
export function hslToRgb(h: number, s: number, l: number): RGB {
  const S = s / 100;
  const L = l / 100;
  const a = S * Math.min(L, 1 - L);
  const k = (n: number) => (n + h / 30) % 12;
  const f = (n: number) => L - a * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1));
  return [Math.round(f(0) * 255), Math.round(f(8) * 255), Math.round(f(4) * 255)];
}

/** Canal sRGB (0–255) → lineal (0–1). Base de OKLab y de la luminancia WCAG. */
function toLinear(c: number): number {
  const v = c / 255;
  return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
}

/** OKLCH: L (0–1), C (croma), H (grados 0–360). */
export function rgbToOklch([r, g, b]: RGB): [number, number, number] {
  const R = toLinear(r);
  const G = toLinear(g);
  const B = toLinear(b);

  const l = 0.4122214708 * R + 0.5363325363 * G + 0.0514459929 * B;
  const m = 0.2119034982 * R + 0.6806995451 * G + 0.1073969566 * B;
  const s = 0.0883024619 * R + 0.2817188376 * G + 0.6299787005 * B;

  const l_ = Math.cbrt(l);
  const m_ = Math.cbrt(m);
  const s_ = Math.cbrt(s);

  const L = 0.2104542553 * l_ + 0.793617785 * m_ - 0.0040720468 * s_;
  const A = 1.9779984951 * l_ - 2.428592205 * m_ + 0.4505937099 * s_;
  const Bb = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.808675766 * s_;

  const C = Math.sqrt(A * A + Bb * Bb);
  let H = (Math.atan2(Bb, A) * 180) / Math.PI;
  if (H < 0) H += 360;
  // Un gris puro no tiene tono definido: lo normalizamos a 0.
  return [L, C, C < 1e-6 ? 0 : H];
}

/** Luminancia relativa WCAG 2.x. */
export function luminance([r, g, b]: RGB): number {
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

/** Ratio de contraste WCAG: de 1 (idénticos) a 21 (negro sobre blanco). */
export function contrastRatio(a: RGB, b: RGB): number {
  const la = luminance(a);
  const lb = luminance(b);
  const hi = Math.max(la, lb);
  const lo = Math.min(la, lb);
  return (hi + 0.05) / (lo + 0.05);
}

/** Mezcla lineal en sRGB hacia `target` (0 = sin cambio, 1 = target). */
export function mixToward(c: RGB, target: RGB, amount: number): RGB {
  return c.map((v, i) => v + (target[i] - v) * amount) as RGB;
}

const WHITE: RGB = [255, 255, 255];
const BLACK: RGB = [0, 0, 0];

/** Escala de 11 pasos: 5 tintes (hacia blanco), base y 5 sombras (hacia negro). */
export function scale(base: RGB): { hex: string; isBase: boolean }[] {
  const steps = [0.8, 0.65, 0.5, 0.35, 0.2];
  return [
    ...steps.map((a) => ({ hex: toHex(mixToward(base, WHITE, a)), isBase: false })),
    { hex: toHex(base), isBase: true },
    ...[...steps].reverse().map((a) => ({ hex: toHex(mixToward(base, BLACK, a)), isBase: false })),
  ];
}

// ---- Formatos de texto listos para copiar ----

export function formatRgb([r, g, b]: RGB): string {
  return `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;
}

export function formatHsl(rgb: RGB): string {
  const [h, s, l] = rgbToHsl(rgb);
  return `hsl(${Math.round(h)}, ${Math.round(s)}%, ${Math.round(l)}%)`;
}

export function formatOklch(rgb: RGB): string {
  const [L, C, H] = rgbToOklch(rgb);
  // Mismo formato decimal que usa el design system en global.css.
  return `oklch(${L.toFixed(3)} ${C.toFixed(3)} ${H.toFixed(1)})`;
}

/** Umbrales WCAG 2.x por tamaño de texto. */
export const WCAG = {
  aaNormal: 4.5,
  aaaNormal: 7,
  aaLarge: 3,
  aaaLarge: 4.5,
} as const;
