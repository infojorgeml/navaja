// src/lib/pixel.ts — imagen → pixel art con la Canvas API (portado de Pixelacer).
// Reduce la imagen a una rejilla de bloques, opcionalmente la ajusta a una paleta
// y la vuelve a ampliar con vecino más cercano para que los píxeles salgan nítidos.

export const palettes: Record<string, string[]> = {
  'Pico-8': ['#000000', '#1d2b53', '#7e2553', '#008751', '#ab5236', '#5f574f', '#c2c3c7', '#fff1e8', '#ff004d', '#ffa300', '#ffec27', '#00e436', '#29adff', '#83769c', '#ff77a8', '#ffccaa'],
  'Lost Century': ['#d1b187', '#c77b58', '#ae5d40', '#79444a', '#4b3e48', '#b38c5d', '#96764a', '#5a4d41', '#77733c', '#b2a65e', '#d5ca9d', '#8eb2a9', '#4d7b78', '#4b4158', '#8d7f7b', '#a99c92'],
  'Sunset 8': ['#fff275', '#ffd34e', '#ffba49', '#ff9f3d', '#ff856d', '#e06f8b', '#9b6598', '#4d4e7e'],
};

export interface PixelOptions {
  /** Lado del bloque, en píxeles de la imagen normalizada. */
  pixelSize: number;
  /** −100…100 */
  brightness: number;
  contrast: number;
  saturation: number;
  /** Nombre de la paleta, o null para conservar los colores. */
  palette: string | null;
  /** Color de la rejilla, o null para no dibujarla. */
  grid: string | null;
}

/** preview: tamaño normalizado · small: un píxel por bloque · large: 8× por bloque. */
export type PixelResolution = 'preview' | 'small' | 'large';

export interface Artwork {
  canvas: HTMLCanvasElement;
  pixelWidth: number;
  pixelHeight: number;
  width: number;
  height: number;
}

// 2048 mantiene incluso la exportación 8× más detallada en un tamaño de canvas práctico.
const MAX_SIDE = 2048;

export function normalizeSize(width: number, height: number) {
  const scale = Math.min(1, MAX_SIDE / Math.max(width, height));
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  };
}

const rgb = (hex: string): [number, number, number] => [
  parseInt(hex.slice(1, 3), 16),
  parseInt(hex.slice(3, 5), 16),
  parseInt(hex.slice(5, 7), 16),
];

function closestPaletteColor(r: number, g: number, b: number, palette: [number, number, number][]) {
  let selected = palette[0];
  let best = Infinity;
  for (const c of palette) {
    const d = (r - c[0]) ** 2 + (g - c[1]) ** 2 + (b - c[2]) ** 2;
    if (d < best) {
      best = d;
      selected = c;
    }
  }
  return selected;
}

function quantizePalette(canvas: HTMLCanvasElement, palette: string[]) {
  const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  const colors = palette.map(rgb);
  const cache = new Map<number, [number, number, number]>();
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] === 0) continue;
    const key = (data[i] << 16) | (data[i + 1] << 8) | data[i + 2];
    let c = cache.get(key);
    if (!c) {
      c = closestPaletteColor(data[i], data[i + 1], data[i + 2], colors);
      cache.set(key, c);
    }
    data[i] = c[0];
    data[i + 1] = c[1];
    data[i + 2] = c[2];
  }
  ctx.putImageData(imageData, 0, 0);
}

function paintGrid(ctx: CanvasRenderingContext2D, width: number, height: number, cellW: number, cellH: number, color: string) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.globalAlpha = 0.72;
  ctx.lineWidth = Math.max(1, Math.min(cellW, cellH) * 0.035);
  ctx.beginPath();
  for (let x = 0; x <= width; x += cellW) {
    ctx.moveTo(Math.round(x) + 0.5, 0);
    ctx.lineTo(Math.round(x) + 0.5, height);
  }
  for (let y = 0; y <= height; y += cellH) {
    ctx.moveTo(0, Math.round(y) + 0.5);
    ctx.lineTo(width, Math.round(y) + 0.5);
  }
  ctx.stroke();
  ctx.restore();
}

let sourceCanvas: HTMLCanvasElement | null = null;
let reducedCanvas: HTMLCanvasElement | null = null;

export function createArtwork(
  image: HTMLImageElement,
  opt: PixelOptions,
  resolution: PixelResolution = 'preview'
): Artwork {
  const { width, height } = normalizeSize(image.naturalWidth, image.naturalHeight);
  const pixelWidth = Math.max(1, Math.round(width / opt.pixelSize));
  const pixelHeight = Math.max(1, Math.round(height / opt.pixelSize));

  sourceCanvas ??= document.createElement('canvas');
  reducedCanvas ??= document.createElement('canvas');

  sourceCanvas.width = width;
  sourceCanvas.height = height;
  const src = sourceCanvas.getContext('2d')!;
  src.clearRect(0, 0, width, height);
  src.filter = `brightness(${100 + opt.brightness}%) contrast(${100 + opt.contrast}%) saturate(${100 + opt.saturation}%)`;
  src.drawImage(image, 0, 0, width, height);
  src.filter = 'none';

  reducedCanvas.width = pixelWidth;
  reducedCanvas.height = pixelHeight;
  const red = reducedCanvas.getContext('2d', { willReadFrequently: true })!;
  red.imageSmoothingEnabled = true;
  red.clearRect(0, 0, pixelWidth, pixelHeight);
  red.drawImage(sourceCanvas, 0, 0, pixelWidth, pixelHeight);
  if (opt.palette && palettes[opt.palette]) quantizePalette(reducedCanvas, palettes[opt.palette]);

  const artwork = document.createElement('canvas');
  if (resolution === 'small') {
    artwork.width = pixelWidth;
    artwork.height = pixelHeight;
  } else if (resolution === 'large') {
    artwork.width = pixelWidth * 8;
    artwork.height = pixelHeight * 8;
  } else {
    artwork.width = width;
    artwork.height = height;
  }
  const ctx = artwork.getContext('2d')!;
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(reducedCanvas, 0, 0, pixelWidth, pixelHeight, 0, 0, artwork.width, artwork.height);
  const cellW = artwork.width / pixelWidth;
  const cellH = artwork.height / pixelHeight;
  // Una rejilla de 1 px taparía la exportación a tamaño nativo: solo se dibuja
  // cuando hay sitio para que se siga viendo el dibujo.
  if (opt.grid && Math.min(cellW, cellH) >= 4) paintGrid(ctx, artwork.width, artwork.height, cellW, cellH, opt.grid);
  return { canvas: artwork, pixelWidth, pixelHeight, width, height };
}
