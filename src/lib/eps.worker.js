// src/lib/eps.worker.js — convierte EPS fuera del hilo principal (un EPS pesado
// o con bucles puede tardar hasta el límite de pasos del intérprete).
import { convertEPS } from './eps.js';

self.onmessage = (e) => {
  const { id, buf, opt } = e.data;
  try {
    self.postMessage({ id, result: convertEPS(buf, opt) });
  } catch (err) {
    self.postMessage({ id, error: (err && err.code) || 'unknown' });
  }
};
