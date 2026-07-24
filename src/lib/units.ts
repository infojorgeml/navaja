// src/lib/units.ts — conversión de unidades por factor a una unidad base.
// La temperatura no es lineal (tiene desfase), así que se trata aparte.

interface Linear {
  order: string[];
  factor: Record<string, number>; // valor de 1 unidad en la base
}

// Longitud (base: metro)
const length: Linear = {
  order: ['km', 'm', 'dm', 'cm', 'mm', 'mi', 'yd', 'ft', 'in', 'nmi'],
  factor: {
    km: 1000,
    m: 1,
    dm: 0.1,
    cm: 0.01,
    mm: 0.001,
    mi: 1609.344,
    yd: 0.9144,
    ft: 0.3048,
    in: 0.0254,
    nmi: 1852,
  },
};

// Peso / masa (base: kilogramo)
const mass: Linear = {
  order: ['t', 'kg', 'g', 'mg', 'lb', 'oz', 'st'],
  factor: {
    t: 1000,
    kg: 1,
    g: 0.001,
    mg: 0.000001,
    lb: 0.45359237,
    oz: 0.028349523125,
    st: 6.35029318,
  },
};

// Almacenamiento (base: byte). Distingue decimales (KB) y binarios (KiB).
const data: Linear = {
  order: ['bit', 'B', 'KB', 'KiB', 'MB', 'MiB', 'GB', 'GiB', 'TB', 'TiB'],
  factor: {
    bit: 0.125,
    B: 1,
    KB: 1e3,
    KiB: 1024,
    MB: 1e6,
    MiB: 1024 ** 2,
    GB: 1e9,
    GiB: 1024 ** 3,
    TB: 1e12,
    TiB: 1024 ** 4,
  },
};

const LINEAR: Record<string, Linear> = { length, mass, data };

// Temperatura (base intermedia: grados Celsius)
const TEMP = {
  order: ['C', 'F', 'K'],
  toC: {
    C: (v: number) => v,
    F: (v: number) => ((v - 32) * 5) / 9,
    K: (v: number) => v - 273.15,
  } as Record<string, (v: number) => number>,
  fromC: {
    C: (v: number) => v,
    F: (v: number) => (v * 9) / 5 + 32,
    K: (v: number) => v + 273.15,
  } as Record<string, (v: number) => number>,
};

export const categoryIds = ['length', 'mass', 'temperature', 'data'] as const;

/** Símbolos que se muestran en la UI (universales, no se traducen). */
export const unitSymbol: Record<string, string> = {
  C: '°C',
  F: '°F',
  K: 'K',
};

export function unitList(cat: string): string[] {
  if (cat === 'temperature') return TEMP.order;
  return LINEAR[cat]?.order ?? [];
}

/** Convierte `value` (en `from`) a todas las unidades de la categoría. */
export function convertAll(cat: string, from: string, value: number): Record<string, number> {
  const out: Record<string, number> = {};
  if (cat === 'temperature') {
    const c = TEMP.toC[from]?.(value);
    if (c === undefined) return out;
    for (const u of TEMP.order) out[u] = TEMP.fromC[u](c);
    return out;
  }
  const L = LINEAR[cat];
  if (!L || !(from in L.factor)) return out;
  const base = value * L.factor[from];
  for (const u of L.order) out[u] = base / L.factor[u];
  return out;
}
