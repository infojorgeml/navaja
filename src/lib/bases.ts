// src/lib/bases.ts — conversión de enteros entre bases (2–36) con BigInt.
// BigInt = sin límite de tamaño; JS no tiene BigInt(string, base), así que
// el parseo y el formateo se hacen a mano.

const DIGITS = '0123456789abcdefghijklmnopqrstuvwxyz';

/**
 * Interpreta `input` como entero en `base`. Devuelve null si algún carácter no
 * pertenece a esa base. Acepta signo, y `_`/espacios como separadores visuales.
 */
export function parseInBase(input: string, base: number): bigint | null {
  let s = input.trim().toLowerCase();
  if (s === '') return null;

  let neg = false;
  if (s[0] === '-') {
    neg = true;
    s = s.slice(1);
  } else if (s[0] === '+') {
    s = s.slice(1);
  }
  if (s === '') return null;

  const b = BigInt(base);
  let v = 0n;
  for (const ch of s) {
    if (ch === '_' || ch === ' ') continue;
    const d = DIGITS.indexOf(ch);
    if (d < 0 || d >= base) return null;
    v = v * b + BigInt(d);
  }
  return neg ? -v : v;
}

/** Entero → texto en `base` (dígitos en minúscula). */
export function toBase(value: bigint, base: number): string {
  if (value === 0n) return '0';
  const neg = value < 0n;
  let v = neg ? -value : value;
  const b = BigInt(base);
  let out = '';
  while (v > 0n) {
    out = DIGITS[Number(v % b)] + out;
    v = v / b;
  }
  return neg ? '-' + out : out;
}
