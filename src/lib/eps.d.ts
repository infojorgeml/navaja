// Tipos del conversor EPS → SVG (src/lib/eps.js).
export type EpsNoteCode =
  | 'tooComplex' | 'infiniteLoop' | 'empty' | 'noBBox' | 'raster'
  | 'shading' | 'text' | 'compressedAI' | 'unknownOps' | 'errors';

export interface EpsNote {
  code: EpsNoteCode;
  n?: number;
  ops?: string;
}

export interface EpsOptions {
  cmyk?: 'standard' | 'adobe';
  decimals?: number;
}

export interface EpsResult {
  svg: string;
  width: number;
  height: number;
  bbox: number[];
  paths: number;
  notes: EpsNote[];
  creator: string;
  title: string;
  usedBBox: boolean;
}

/** Lanza un Error con `code` 'pdf' | 'notEps' si el archivo no es un EPS. */
export function convertEPS(buf: ArrayBuffer | Uint8Array, options?: EpsOptions): EpsResult;
export function cmykStandard(c: number, m: number, y: number, k: number): number[];
export function cmykAdobe(c: number, m: number, y: number, k: number): number[];
