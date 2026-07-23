// src/lib/csv.ts — parseo y generación de CSV según RFC 4180, sin dependencias.

/**
 * Parser por autómata: respeta comillas dobles, comas dentro de campos
 * entrecomillados, comillas escapadas ("") y saltos de línea dentro del campo.
 */
export function parseCsv(text: string, delim: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let inQuotes = false;
  let i = 0;

  while (i < text.length) {
    const c = text[i];

    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"'; // comilla escapada
          i += 2;
          continue;
        }
        inQuotes = false;
        i++;
        continue;
      }
      field += c;
      i++;
      continue;
    }

    if (c === '"') {
      inQuotes = true;
      i++;
      continue;
    }
    if (c === delim) {
      row.push(field);
      field = '';
      i++;
      continue;
    }
    if (c === '\r') {
      i++; // normaliza CRLF
      continue;
    }
    if (c === '\n') {
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
      i++;
      continue;
    }
    field += c;
    i++;
  }

  // Última fila: no añade una vacía si el texto acaba en salto de línea.
  if (field !== '' || row.length) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

/** Entrecomilla solo si hace falta (contiene el separador, comillas o saltos). */
export function escapeCsv(value: string, delim: string): string {
  if (value.includes('"') || value.includes(delim) || /[\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

/** Valor de celda → texto. Objetos y arrays se serializan como JSON. */
export function cell(v: unknown): string {
  if (v === null || v === undefined) return '';
  if (typeof v === 'object') return JSON.stringify(v);
  return String(v);
}

/**
 * Texto → número/booleano/null cuando procede. Solo convierte números "normales"
 * (enteros o decimales, sin ceros a la izquierda, sin signo + ni notación
 * científica), así "007", "1e5", "+34600..." o los IDs siguen siendo texto.
 */
export function coerce(value: string, enabled: boolean): unknown {
  if (!enabled) return value;
  const t = value.trim();
  if (t === '') return '';
  if (t === 'true') return true;
  if (t === 'false') return false;
  if (t === 'null') return null;
  if (/^-?(0|[1-9]\d*)(\.\d+)?$/.test(t)) return Number(t);
  return value;
}
