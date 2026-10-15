// src/lib/calco.worker.js — corre el motor de Calco fuera del hilo principal.
import { coreFactory } from './calco.js';

const core = coreFactory();
self.onmessage = (e) => {
  const m = e.data;
  if (m.t === 'img') core.setImage(m.w, m.h, new Uint8ClampedArray(m.buf));
  else self.postMessage(core.trace(m.p));
};
