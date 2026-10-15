// Tipos del motor de Calco (src/lib/calco.js).
export type CalcoMode = 'ink' | 'color';

export interface CalcoParams {
  imgId: number;
  mode: CalcoMode;
  /** Umbral 1–254 (modo 1 tinta). */
  thr: number;
  invert: boolean;
  /** Número de colores (modo color). */
  n: number;
  /** Área mínima de mancha, en píxeles de la imagen reescalada. */
  turd: number;
  /** 0 = todo vértices, 1.334 = todo curvas. */
  alphamax: number;
  /** Tolerancia de optimización de curvas (0 = sin optimizar). */
  opt: number;
  /** Escala aplicada antes de calcar; las coordenadas se dividen entre ella. */
  sx: number;
  sy: number;
}

export interface CalcoLayer {
  d: string;
  paths: number;
  nodes: number;
  /** RGB en modo color; null en 1 tinta. */
  color: [number, number, number] | null;
}

export interface CalcoResult {
  imgId: number;
  mode: CalcoMode;
  layers: CalcoLayer[];
}

export interface CalcoCore {
  setImage(w: number, h: number, data: Uint8ClampedArray): void;
  trace(params: CalcoParams): CalcoResult;
}

export function coreFactory(): CalcoCore;
