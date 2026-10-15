// src/lib/eps.js — conversor EPS → SVG en JS puro, sin dependencias.
// Intérprete PostScript reducido: rutas, curvas, colores RGB/CMYK/gris, recortes,
// trazos con guiones, transformaciones, texto simple y los operadores abreviados
// de Adobe Illustrator. Copiado del prototipo; el único cambio es que los avisos
// y los errores salen como códigos (`{ code, n?, ops? }` / `error.code`) para que
// la UI los traduzca. Corre en un Web Worker (eps.worker.js).
//
// API: convertEPS(buffer, { cmyk: 'standard'|'adobe', decimals: 1–4 })
//   → { svg, width, height, bbox, paths, notes, creator, title, usedBBox }

const codeError = (code) => Object.assign(new Error(code), { code });

const MARK = { mark: 1 };
const EXIT = { c: 'exit' }, STOP = { c: 'stop' }, QUIT = { c: 'quit' };
class Name { constructor(n, lit) { this.n = n; this.lit = lit; } }
class Dict { constructor() { this.m = new Map(); } }

function bytesToStr(u8) {
  let s = '';
  const CH = 0x8000;
  for (let i = 0; i < u8.length; i += CH) s += String.fromCharCode.apply(null, u8.subarray(i, i + CH));
  return s;
}

/* ---------- Tokenizador / parser ---------- */
function parsePS(src) {
  let i = 0;
  const n = src.length;
  const isWS = (c) => c === 32 || c === 10 || c === 13 || c === 9 || c === 12 || c === 0;
  const isDelim = (c) => c === 40 || c === 41 || c === 60 || c === 62 || c === 91 || c === 93 || c === 123 || c === 125 || c === 47 || c === 37;
  const NUM = /^[+-]?(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?$/;
  const RADIX = /^(\d+)#([0-9a-zA-Z]+)$/;

  function next() {
    for (;;) {
      if (i >= n) return null;
      const c = src.charCodeAt(i);
      if (isWS(c)) { i++; continue; }
      if (c === 37) { while (i < n && src.charCodeAt(i) !== 10 && src.charCodeAt(i) !== 13) i++; continue; }
      break;
    }
    const c = src.charCodeAt(i);
    if (c === 40) {
      let depth = 1, s = '';
      i++;
      while (i < n && depth > 0) {
        const ch = src[i++];
        if (ch === '\\') {
          const e = src[i++];
          if (e === 'n') s += '\n';
          else if (e === 'r') s += '\r';
          else if (e === 't') s += '\t';
          else if (e === 'b') s += '\b';
          else if (e === 'f') s += '\f';
          else if (e >= '0' && e <= '7') {
            let o = e;
            while (o.length < 3 && src[i] >= '0' && src[i] <= '7') o += src[i++];
            s += String.fromCharCode(parseInt(o, 8) & 255);
          } else if (e === '\r') { if (src[i] === '\n') i++; }
          else if (e === '\n') { /* continuación de línea */ }
          else s += e;
        } else if (ch === '(') { depth++; s += ch; }
        else if (ch === ')') { depth--; if (depth > 0) s += ch; }
        else s += ch;
      }
      return { v: s };
    }
    if (c === 60) {
      if (src[i + 1] === '<') { i += 2; return { v: new Name('<<', false) }; }
      if (src[i + 1] === '~') { const e = src.indexOf('~>', i + 2); i = e < 0 ? n : e + 2; return { v: '' }; }
      const e = src.indexOf('>', i);
      const hex = src.slice(i + 1, e < 0 ? n : e).replace(/\s+/g, '');
      i = e < 0 ? n : e + 1;
      let s = '';
      for (let k = 0; k < hex.length; k += 2) s += String.fromCharCode(parseInt((hex.substr(k, 2) + '0').slice(0, 2), 16) || 0);
      return { v: s };
    }
    if (c === 62) {
      if (src[i + 1] === '>') { i += 2; return { v: new Name('>>', false) }; }
      i++; return next();
    }
    if (c === 91 || c === 93) { i++; return { v: new Name(c === 91 ? '[' : ']', false) }; }
    if (c === 123) { i++; return { open: true }; }
    if (c === 125) { i++; return { close: true }; }
    if (c === 41) { i++; return next(); }
    if (c === 47) {
      i++;
      if (src[i] === '/') i++;
      let j = i;
      while (j < n && !isWS(src.charCodeAt(j)) && !isDelim(src.charCodeAt(j))) j++;
      const nm = src.slice(i, j);
      i = j;
      return { v: new Name(nm, true) };
    }
    let j = i;
    while (j < n && !isWS(src.charCodeAt(j)) && !isDelim(src.charCodeAt(j))) j++;
    const w = src.slice(i, j);
    i = j;
    if (NUM.test(w)) return { v: parseFloat(w) };
    const r = RADIX.exec(w);
    if (r) {
      const v = parseInt(r[2], parseInt(r[1], 10));
      if (!isNaN(v)) return { v };
    }
    return { v: new Name(w, false) };
  }

  function seq(inProc) {
    const out = [];
    for (;;) {
      const t = next();
      if (t === null) return out;
      if (t.open) { const p = seq(true); p.ex = true; out.push(p); continue; }
      if (t.close) { if (inProc) return out; continue; }
      out.push(t.v);
    }
  }
  return seq(false);
}

/* ---------- Color ---------- */
const clamp = (v, a, b) => Math.min(b === undefined ? 1 : b, Math.max(a === undefined ? 0 : a, v));

export function cmykStandard(c, m, y, k) {
  c = clamp(c); m = clamp(m); y = clamp(y); k = clamp(k);
  return [1 - Math.min(1, c + k), 1 - Math.min(1, m + k), 1 - Math.min(1, y + k)];
}
export function cmykAdobe(c, m, y, k) {
  c = clamp(c); m = clamp(m); y = clamp(y); k = clamp(k);
  const r = 255 + c * (-4.387332384609988 * c + 54.48615194189176 * m + 18.82290502165302 * y + 212.25662451639585 * k - 285.2331026137004) +
    m * (1.7149763477362134 * m - 5.6096736904047315 * y - 17.873870861415444 * k - 5.497006427196366) +
    y * (-2.5217340131683033 * y - 21.248923337353073 * k + 17.5119270841813) +
    k * (-21.86122147463605 * k - 189.48180835922747);
  const g = 255 + c * (8.841041422036149 * c + 60.118027045597366 * m + 6.871425592049007 * y + 31.159100130055922 * k - 79.2970844816548) +
    m * (-15.310361306967817 * m + 17.575251261109482 * y + 131.35250912493976 * k - 190.9453302588951) +
    y * (4.444339102852739 * y + 9.8632861493405 * k - 24.86741582555878) +
    k * (-20.737325471181034 * k - 187.80453709719578);
  const b = 255 + c * (0.8842522430003296 * c + 8.078677503112928 * m + 30.89978309703729 * y - 0.23883238689178934 * k - 14.183576799673286) +
    m * (10.49593273432072 * m + 63.02378494754052 * y + 50.606957656360734 * k - 112.23884253719248) +
    y * (0.03296041114873217 * y + 115.60384449646641 * k - 193.58209356861505) +
    k * (-22.33816807309886 * k - 180.12613974708367);
  return [clamp(r / 255), clamp(g / 255), clamp(b / 255)];
}
function hsb2rgb(h, s, v) {
  h = clamp(h); s = clamp(s); v = clamp(v);
  const i = Math.floor(h * 6), f = h * 6 - i;
  const p = v * (1 - s), q = v * (1 - f * s), t = v * (1 - (1 - f) * s);
  return [[v, t, p], [q, v, p], [p, v, t], [p, q, v], [t, p, v], [v, p, q]][i % 6];
}
function hex(c) {
  return '#' + c.map((v) => Math.round(clamp(v) * 255).toString(16).padStart(2, '0')).join('');
}
function esc(s) {
  return String(s).replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/* ---------- Matrices [a b c d e f]: x' = a x + c y + e ; y' = b x + d y + f ---------- */
function mmul(A, B) {
  return [
    A[0] * B[0] + A[1] * B[2], A[0] * B[1] + A[1] * B[3],
    A[2] * B[0] + A[3] * B[2], A[2] * B[1] + A[3] * B[3],
    A[4] * B[0] + A[5] * B[2] + B[4], A[4] * B[1] + A[5] * B[3] + B[5]
  ];
}
function minv(m) {
  const det = m[0] * m[3] - m[1] * m[2];
  if (!det) throw new Error('undefinedresult');
  return [m[3] / det, -m[1] / det, -m[2] / det, m[0] / det, (m[2] * m[5] - m[3] * m[4]) / det, (m[1] * m[4] - m[0] * m[5]) / det];
}

function newGS() {
  return { ctm: [1, 0, 0, 1, 0, 0], fc: [0, 0, 0], sc: [0, 0, 0], lw: 1, cap: 0, join: 0, miter: 10, dash: [], doff: 0, clip: [], font: null, space: 'DeviceGray' };
}

/* ---------- Conversión ---------- */
export function convertEPS(buf, options) {
  const opt = Object.assign({ cmyk: 'standard', decimals: 3 }, options || {});
  const cmyk = opt.cmyk === 'adobe' ? cmykAdobe : cmykStandard;
  let u8 = buf instanceof Uint8Array ? buf : new Uint8Array(buf);

  if (u8.length > 30 && u8[0] === 0xC5 && u8[1] === 0xD0 && u8[2] === 0xD3 && u8[3] === 0xC6) {
    const dv = new DataView(u8.buffer, u8.byteOffset, u8.byteLength);
    const off = dv.getUint32(4, true), len = dv.getUint32(8, true);
    if (off > 0 && off < u8.length) u8 = u8.subarray(off, len ? Math.min(u8.length, off + len) : u8.length);
  }
  let src = bytesToStr(u8);
  if (/^\s*%PDF/.test(src.slice(0, 16))) throw codeError('pdf');
  const magic = src.indexOf('%!PS');
  if (magic < 0 || magic > 2048) throw codeError('notEps');

  const head = src.slice(0, 8000);
  const creatorM = /%%Creator:[ \t]*([^\r\n]*)/.exec(head);
  const creator = creatorM ? creatorM[1].trim() : '';
  const titleM = /%%Title:[ \t]*([^\r\n]*)/.exec(head);

  function readBB(tag) {
    const m = new RegExp('%%' + tag + ':[ \\t]*([-+\\d.eE]+)[ \\t]+([-+\\d.eE]+)[ \\t]+([-+\\d.eE]+)[ \\t]+([-+\\d.eE]+)').exec(src);
    return m ? m.slice(1, 5).map(Number) : null;
  }
  let bb = readBB('HiResBoundingBox') || readBB('BoundingBox');
  const bbDeclared = bb ? bb.slice() : null;

  src = src.replace(/%%BeginData:[^\r\n]*[\r\n][\s\S]*?%%EndData/g, '').replace(/%%BeginBinary:[^\r\n]*[\r\n][\s\S]*?%%EndBinary/g, '');

  const isAI = /Adobe Illustrator/i.test(creator);
  if (isAI) {
    let k = src.indexOf('%%EndSetup');
    if (k < 0) k = src.indexOf('%%EndProlog');
    if (k >= 0) src = src.slice(k);
  }
  const compressedAI = /%AI\d*_CompressedData/.test(src);

  const tokens = parsePS(src);
  src = null;

  /* estado */
  const os = [];
  const sys = new Dict(), usr = new Dict();
  const ds = [sys, usr];
  const warn = new Map();
  const addW = (k) => warn.set(k, (warn.get(k) || 0) + 1);
  let steps = 0, errors = 0, nPaths = 0;
  const LIMIT = 60e6;
  const body = [], defs = [];
  const openClips = [];
  let cid = 0;
  let gs = newGS();
  const gstack = [];
  let path = [], cur = null, start = null;
  const ext = [Infinity, Infinity, -Infinity, -Infinity];
  let compound = 0;
  const aiMode = isAI;

  const dec = Math.max(0, Math.min(6, opt.decimals | 0));
  const f = (v) => { const s = +(+v).toFixed(dec); return String(Object.is(s, -0) ? 0 : s); };

  const pop = () => { if (!os.length) throw new Error('stackunderflow'); return os.pop(); };
  const popNum = () => { const v = pop(); if (typeof v !== 'number') throw new Error('typecheck'); return v; };
  const same = (a, b) => {
    if (a instanceof Name) a = a.n;
    if (b instanceof Name) b = b.n;
    return a === b;
  };
  const keyOf = (k) => (k instanceof Name ? k.n : k);

  const tr = (x, y) => { const m = gs.ctm; return [m[0] * x + m[2] * y + m[4], m[1] * x + m[3] * y + m[5]]; };
  const itr = (X, Y) => { const m = minv(gs.ctm); return [m[0] * X + m[2] * Y + m[4], m[1] * X + m[3] * Y + m[5]]; };
  const scaleFactor = () => Math.sqrt(Math.abs(gs.ctm[0] * gs.ctm[3] - gs.ctm[1] * gs.ctm[2])) || 1;

  /* caminos */
  function moveto(x, y) { const p = tr(x, y); path.push(['M', p[0], p[1]]); cur = p; start = p; }
  function lineto(x, y) { if (!cur) throw new Error('nocurrentpoint'); const p = tr(x, y); path.push(['L', p[0], p[1]]); cur = p; }
  function curveto(x1, y1, x2, y2, x3, y3) {
    if (!cur) throw new Error('nocurrentpoint');
    const a = tr(x1, y1), b = tr(x2, y2), c = tr(x3, y3);
    path.push(['C', a[0], a[1], b[0], b[1], c[0], c[1]]);
    cur = c;
  }
  function closepath() {
    if (path.length && path[path.length - 1][0] !== 'Z') path.push(['Z']);
    if (start) cur = start;
  }
  function arcPath(x, y, r, a1, a2, cw) {
    let s = a1 * Math.PI / 180, e = a2 * Math.PI / 180;
    if (!cw) { while (e < s) e += 2 * Math.PI; } else { while (e > s) e -= 2 * Math.PI; }
    const total = e - s;
    const nseg = Math.max(1, Math.ceil(Math.abs(total) / (Math.PI / 2) - 1e-9));
    const step = total / nseg;
    const k = 4 / 3 * Math.tan(step / 4);
    const px = x + r * Math.cos(s), py = y + r * Math.sin(s);
    if (cur) lineto(px, py); else moveto(px, py);
    let a = s;
    for (let i = 0; i < nseg; i++) {
      const b = a + step;
      const c0 = Math.cos(a), s0 = Math.sin(a), c1 = Math.cos(b), s1 = Math.sin(b);
      curveto(x + r * (c0 - k * s0), y + r * (s0 + k * c0), x + r * (c1 + k * s1), y + r * (s1 - k * c1), x + r * c1, y + r * s1);
      a = b;
    }
  }
  function pathD(p) {
    let s = '';
    for (const g of p) {
      if (g[0] === 'M') s += 'M' + f(g[1]) + ' ' + f(g[2]);
      else if (g[0] === 'L') s += 'L' + f(g[1]) + ' ' + f(g[2]);
      else if (g[0] === 'C') s += 'C' + f(g[1]) + ' ' + f(g[2]) + ' ' + f(g[3]) + ' ' + f(g[4]) + ' ' + f(g[5]) + ' ' + f(g[6]);
      else s += 'Z';
    }
    return s;
  }
  function growExt() {
    for (const g of path) {
      for (let i = 1; i < g.length; i += 2) {
        if (g[i] < ext[0]) ext[0] = g[i];
        if (g[i] > ext[2]) ext[2] = g[i];
        if (g[i + 1] < ext[1]) ext[1] = g[i + 1];
        if (g[i + 1] > ext[3]) ext[3] = g[i + 1];
      }
    }
  }

  function emit(s) {
    const t = gs.clip;
    let k = 0;
    while (k < openClips.length && k < t.length && openClips[k] === t[k]) k++;
    while (openClips.length > k) { body.push('</g>'); openClips.pop(); }
    for (let j = k; j < t.length; j++) { body.push('<g clip-path="url(#' + t[j] + ')">'); openClips.push(t[j]); }
    body.push(s);
  }

  function strokeAttrs() {
    const sc = scaleFactor();
    let w = gs.lw * sc;
    if (w <= 0) w = 0.5;
    const a = ['stroke="' + hex(gs.sc) + '"', 'stroke-width="' + f(w) + '"'];
    if (gs.cap) a.push('stroke-linecap="' + (gs.cap === 1 ? 'round' : 'square') + '"');
    if (gs.join) a.push('stroke-linejoin="' + (gs.join === 1 ? 'round' : 'bevel') + '"');
    else if (gs.miter !== 4) a.push('stroke-miterlimit="' + f(gs.miter) + '"');
    const d = gs.dash.filter((v) => typeof v === 'number');
    if (d.length && d.some((v) => v > 0)) {
      a.push('stroke-dasharray="' + d.map((v) => f(v * sc)).join(' ') + '"');
      if (gs.doff) a.push('stroke-dashoffset="' + f(gs.doff * sc) + '"');
    }
    return a.join(' ');
  }

  function paint(doFill, doStroke, eo) {
    if (!path.length) { cur = null; return; }
    const a = ['d="' + pathD(path) + '"'];
    a.push(doFill ? 'fill="' + hex(gs.fc) + '"' : 'fill="none"');
    if (doFill && eo) a.push('fill-rule="evenodd"');
    if (doStroke) a.push(strokeAttrs());
    growExt();
    emit('<path ' + a.join(' ') + '/>');
    nPaths++;
    path = []; cur = null;
    if (aiMode) os.length = 0;
  }
  function clipNow(eo) {
    if (!path.length) return;
    const id = 'c' + (++cid);
    defs.push('<clipPath id="' + id + '"><path d="' + pathD(path) + '"' + (eo ? ' clip-rule="evenodd"' : '') + '/></clipPath>');
    gs.clip = gs.clip.concat(id);
  }
  function showText(s, extraAdvance) {
    addW('text');
    if (!gs.font || !cur) return;
    s = String(s);
    const m = gs.ctm, sz = gs.font.size;
    const fam = gs.font.name.replace(/^[A-Z]{6}\+/, '');
    const base = fam.split(/[-,]/)[0] || 'Helvetica';
    const generic = /times|georgia|garamond|serif|palatino|bookman|minion|caslon|baskerville/i.test(fam) && !/sans/i.test(fam) ? 'serif' : (/courier|mono|consolas/i.test(fam) ? 'monospace' : 'sans-serif');
    const attrs = ['font-family="' + esc(base) + ', ' + generic + '"', 'font-size="' + f(sz) + '"'];
    if (/bold|black|heavy/i.test(fam)) attrs.push('font-weight="bold"');
    if (/italic|oblique/i.test(fam)) attrs.push('font-style="italic"');
    emit('<text transform="translate(' + f(cur[0]) + ' ' + f(cur[1]) + ') matrix(' + f(m[0]) + ' ' + f(m[1]) + ' ' + f(m[2]) + ' ' + f(m[3]) + ' 0 0) scale(1 -1)" ' + attrs.join(' ') + ' fill="' + hex(gs.fc) + '" xml:space="preserve">' + esc(s) + '</text>');
    nPaths++;
    const u = itr(cur[0], cur[1]);
    cur = tr(u[0] + s.length * sz * 0.5 + (extraAdvance || 0), u[1]);
  }

  /* ejecución */
  function lookup(name) {
    for (let i = ds.length - 1; i >= 0; i--) {
      const v = ds[i].m.get(name);
      if (v !== undefined) return v;
    }
    return undefined;
  }
  function runProc(p) {
    for (let i = 0; i < p.length; i++) {
      const t = p[i];
      if (t instanceof Name) exec(t); else os.push(t);
    }
  }
  function callValue(v) {
    if (typeof v === 'function') v();
    else if (Array.isArray(v) && v.ex) runProc(v);
    else os.push(v);
  }
  function exec(t) {
    if (t.lit) { os.push(t); return; }
    if (++steps > LIMIT) { const e = codeError('tooComplex'); e.limit = true; throw e; }
    const v = lookup(t.n);
    if (v === undefined) {
      if (warn.size < 400) addW('op:' + t.n);
      return;
    }
    callValue(v);
  }
  function runBody(p) {
    if (Array.isArray(p)) runProc(p);
    else if (p instanceof Name) exec(p);
    else os.push(p);
  }
  const D = (name, fn) => sys.m.set(name, fn);

  /* pila */
  D('pop', () => { pop(); });
  D('exch', () => { const b = pop(), a = pop(); os.push(b, a); });
  D('dup', () => { const a = pop(); os.push(a, a); });
  D('copy', () => { const n = popNum(); if (n > os.length) throw new Error('stackunderflow'); if (n > 0) os.push(...os.slice(os.length - n)); });
  D('index', () => { const n = popNum(); if (n >= os.length || n < 0) throw new Error('stackunderflow'); os.push(os[os.length - 1 - n]); });
  D('roll', () => {
    let j = popNum(); const n = popNum();
    if (n <= 0) return;
    if (os.length < n) throw new Error('stackunderflow');
    j = ((j % n) + n) % n;
    if (!j) return;
    const seg = os.splice(os.length - n, n);
    os.push(...seg.slice(n - j).concat(seg.slice(0, n - j)));
  });
  D('clear', () => { os.length = 0; });
  D('count', () => { os.push(os.length); });
  D('mark', () => { os.push(MARK); });
  D('[', () => { os.push(MARK); });
  D('<<', () => { os.push(MARK); });
  D(']', () => { const i = os.lastIndexOf(MARK); if (i < 0) throw new Error('unmatchedmark'); os.push(os.splice(i).slice(1)); });
  D('>>', () => {
    const i = os.lastIndexOf(MARK); if (i < 0) throw new Error('unmatchedmark');
    const it = os.splice(i).slice(1), d = new Dict();
    for (let k = 0; k + 1 < it.length; k += 2) d.m.set(keyOf(it[k]), it[k + 1]);
    os.push(d);
  });
  D('counttomark', () => { const i = os.lastIndexOf(MARK); if (i < 0) throw new Error('unmatchedmark'); os.push(os.length - 1 - i); });
  D('cleartomark', () => { const i = os.lastIndexOf(MARK); if (i < 0) throw new Error('unmatchedmark'); os.length = i; });

  /* aritmética */
  D('add', () => { const b = popNum(), a = popNum(); os.push(a + b); });
  D('sub', () => { const b = popNum(), a = popNum(); os.push(a - b); });
  D('mul', () => { const b = popNum(), a = popNum(); os.push(a * b); });
  D('div', () => { const b = popNum(), a = popNum(); os.push(a / b); });
  D('idiv', () => { const b = popNum(), a = popNum(); os.push(Math.trunc(a / b)); });
  D('mod', () => { const b = popNum(), a = popNum(); os.push(a % b); });
  D('neg', () => { os.push(-popNum()); });
  D('abs', () => { os.push(Math.abs(popNum())); });
  D('ceiling', () => { os.push(Math.ceil(popNum())); });
  D('floor', () => { os.push(Math.floor(popNum())); });
  D('round', () => { os.push(Math.floor(popNum() + 0.5)); });
  D('truncate', () => { os.push(Math.trunc(popNum())); });
  D('sqrt', () => { os.push(Math.sqrt(popNum())); });
  D('exp', () => { const e = popNum(), b = popNum(); os.push(Math.pow(b, e)); });
  D('ln', () => { os.push(Math.log(popNum())); });
  D('log', () => { os.push(Math.log10(popNum())); });
  D('sin', () => { os.push(Math.sin(popNum() * Math.PI / 180)); });
  D('cos', () => { os.push(Math.cos(popNum() * Math.PI / 180)); });
  D('atan', () => { const d = popNum(), n = popNum(); let a = Math.atan2(n, d) * 180 / Math.PI; if (a < 0) a += 360; os.push(a); });
  D('rand', () => { os.push(Math.floor(Math.random() * 2147483647)); });
  D('srand', () => { pop(); });
  D('cvi', () => { const v = pop(); os.push(typeof v === 'string' ? (parseInt(v, 10) || 0) : Math.trunc(v)); });
  D('cvr', () => { const v = pop(); os.push(typeof v === 'string' ? (parseFloat(v) || 0) : v); });
  D('cvs', () => { pop(); const v = pop(); os.push(v instanceof Name ? v.n : String(v)); });
  D('cvn', () => { const v = pop(); os.push(new Name(String(v), true)); });
  D('cvx', () => { const v = pop(); if (Array.isArray(v)) { const c = v.slice(); c.ex = true; os.push(c); } else if (v instanceof Name) os.push(new Name(v.n, false)); else os.push(v); });
  D('cvlit', () => { const v = pop(); if (Array.isArray(v)) { const c = v.slice(); os.push(c); } else if (v instanceof Name) os.push(new Name(v.n, true)); else os.push(v); });
  D('xcheck', () => { const v = pop(); os.push((Array.isArray(v) && !!v.ex) || (v instanceof Name && !v.lit)); });
  D('type', () => {
    const v = pop();
    let t = 'nulltype';
    if (typeof v === 'number') t = Number.isInteger(v) ? 'integertype' : 'realtype';
    else if (typeof v === 'boolean') t = 'booleantype';
    else if (typeof v === 'string') t = 'stringtype';
    else if (v instanceof Name) t = 'nametype';
    else if (Array.isArray(v)) t = 'arraytype';
    else if (v instanceof Dict) t = 'dicttype';
    else if (v === MARK) t = 'marktype';
    else if (typeof v === 'function') t = 'operatortype';
    os.push(new Name(t, false));
  });

  /* lógica */
  D('true', () => { os.push(true); });
  D('false', () => { os.push(false); });
  D('null', () => { os.push(null); });
  D('eq', () => { const b = pop(), a = pop(); os.push(same(a, b)); });
  D('ne', () => { const b = pop(), a = pop(); os.push(!same(a, b)); });
  D('gt', () => { const b = pop(), a = pop(); os.push(a > b); });
  D('ge', () => { const b = pop(), a = pop(); os.push(a >= b); });
  D('lt', () => { const b = pop(), a = pop(); os.push(a < b); });
  D('le', () => { const b = pop(), a = pop(); os.push(a <= b); });
  D('and', () => { const b = pop(), a = pop(); os.push(typeof a === 'boolean' ? (a && b) : (a & b)); });
  D('or', () => { const b = pop(), a = pop(); os.push(typeof a === 'boolean' ? (a || b) : (a | b)); });
  D('xor', () => { const b = pop(), a = pop(); os.push(typeof a === 'boolean' ? (a !== b) : (a ^ b)); });
  D('not', () => { const a = pop(); os.push(typeof a === 'boolean' ? !a : ~a); });
  D('bitshift', () => { const s = popNum(), a = popNum(); os.push(s >= 0 ? a << s : a >> -s); });

  /* control */
  D('if', () => { const p = pop(), b = pop(); if (b) runBody(p); });
  D('ifelse', () => { const q = pop(), p = pop(), b = pop(); runBody(b ? p : q); });
  D('for', () => {
    const p = pop(), lim = popNum(), inc = popNum(), ini = popNum();
    if (!inc) return;
    try {
      if (inc > 0) { for (let i = ini; i <= lim + 1e-12; i += inc) { steps++; os.push(i); runBody(p); } }
      else { for (let i = ini; i >= lim - 1e-12; i += inc) { steps++; os.push(i); runBody(p); } }
    } catch (e) { if (e !== EXIT) throw e; }
  });
  D('repeat', () => {
    const p = pop(), n = popNum();
    try { for (let i = 0; i < n; i++) { steps++; runBody(p); } } catch (e) { if (e !== EXIT) throw e; }
  });
  D('loop', () => {
    const p = pop();
    try { for (;;) { if (++steps > LIMIT) { const e = codeError('infiniteLoop'); e.limit = true; throw e; } runBody(p); } } catch (e) { if (e !== EXIT) throw e; }
  });
  D('forall', () => {
    const p = pop(), o = pop();
    try {
      if (Array.isArray(o)) { for (const it of o.slice()) { steps++; os.push(it); runBody(p); } }
      else if (typeof o === 'string') { for (let i = 0; i < o.length; i++) { steps++; os.push(o.charCodeAt(i)); runBody(p); } }
      else if (o instanceof Dict) { for (const [k, v] of Array.from(o.m)) { steps++; os.push(typeof k === 'string' ? new Name(k, true) : k, v); runBody(p); } }
    } catch (e) { if (e !== EXIT) throw e; }
  });
  D('exit', () => { throw EXIT; });
  D('stop', () => { throw STOP; });
  D('stopped', () => {
    const p = pop();
    try { runBody(p); os.push(false); }
    catch (e) { if (e === QUIT || (e && e.limit)) throw e; if (e === EXIT) throw e; os.push(true); }
  });
  D('quit', () => { throw QUIT; });
  D('exec', () => { const o = pop(); if (o instanceof Name && !o.lit) exec(o); else if (Array.isArray(o) && o.ex) runProc(o); else os.push(o); });
  D('bind', () => {});
  D('readonly', () => {}); D('executeonly', () => {}); D('noaccess', () => {}); D('rcheck', () => { os.push(true); }); D('wcheck', () => { os.push(true); });

  /* arrays, cadenas, diccionarios */
  D('array', () => { const n = popNum(); os.push(new Array(n).fill(null)); });
  D('aload', () => { const a = pop(); os.push(...a, a); });
  D('astore', () => { const a = pop(); for (let i = a.length - 1; i >= 0; i--) a[i] = pop(); os.push(a); });
  D('length', () => { const a = pop(); os.push(a instanceof Dict ? a.m.size : a instanceof Name ? a.n.length : a.length); });
  D('get', () => {
    const k = pop(), a = pop();
    if (a instanceof Dict) { const v = a.m.get(keyOf(k)); if (v === undefined) throw new Error('undefined'); os.push(v); }
    else if (typeof a === 'string') os.push(a.charCodeAt(k));
    else os.push(a[k]);
  });
  D('put', () => {
    const v = pop(), k = pop(), a = pop();
    if (a instanceof Dict) a.m.set(keyOf(k), v);
    else if (Array.isArray(a)) a[k] = v;
  });
  D('getinterval', () => { const n = popNum(), i = popNum(), a = pop(); os.push(a.slice(i, i + n)); });
  D('string', () => { os.push('\0'.repeat(popNum())); });
  D('dict', () => { pop(); os.push(new Dict()); });
  D('begin', () => { const d = pop(); if (!(d instanceof Dict)) throw new Error('typecheck'); ds.push(d); });
  D('end', () => { if (ds.length > 2) ds.pop(); });
  D('def', () => { const v = pop(), k = pop(); ds[ds.length - 1].m.set(keyOf(k), v); });
  D('store', () => {
    const v = pop(), k = keyOf(pop());
    for (let i = ds.length - 1; i >= 0; i--) if (ds[i].m.has(k)) { ds[i].m.set(k, v); return; }
    ds[ds.length - 1].m.set(k, v);
  });
  D('load', () => { const v = lookup(keyOf(pop())); if (v === undefined) throw new Error('undefined'); os.push(v); });
  D('known', () => { const k = keyOf(pop()), d = pop(); os.push(d instanceof Dict && d.m.has(k)); });
  D('where', () => {
    const k = keyOf(pop());
    for (let i = ds.length - 1; i >= 0; i--) if (ds[i].m.has(k)) { os.push(ds[i], true); return; }
    os.push(false);
  });
  D('undef', () => { const k = keyOf(pop()), d = pop(); if (d instanceof Dict) d.m.delete(k); });
  D('currentdict', () => { os.push(ds[ds.length - 1]); });
  D('countdictstack', () => { os.push(ds.length); });
  D('systemdict', () => { os.push(sys); });
  D('userdict', () => { os.push(usr); });
  D('globaldict', () => { os.push(usr); });
  D('statusdict', () => { os.push(new Dict()); });
  D('errordict', () => { os.push(new Dict()); });
  D('$error', () => { os.push(new Dict()); });
  D('save', () => { os.push(0); });
  D('restore', () => { pop(); });
  D('languagelevel', () => { os.push(2); });
  D('version', () => { os.push('3010'); });
  D('product', () => { os.push('PostScript'); });
  D('revision', () => { os.push(1); });
  D('usertime', () => { os.push(0); });
  D('realtime', () => { os.push(0); });
  D('=', () => { pop(); }); D('==', () => { pop(); }); D('print', () => { pop(); });
  D('pstack', () => {}); D('flush', () => {}); D('flushfile', () => { pop(); });
  D('currentfile', () => { os.push(null); });
  D('currentpacking', () => { os.push(false); });
  D('currentglobal', () => { os.push(false); });
  D('findresource', () => { pop(); pop(); os.push(new Dict()); });
  D('defineresource', () => { pop(); const v = pop(); pop(); os.push(v); });
  ['setpagedevice', 'setpacking', 'setglobal', 'setflat', 'setstrokeadjust', 'setoverprint', 'setfilloverprint', 'setstrokeoverprint', 'settransfer', 'setblackgeneration', 'setundercolorremoval', 'sethalftone', 'setuserparams', 'setsystemparams', 'setdevparams', 'setcachedevice2', 'setrenderingintent', 'setcolorrendering', 'setcolorspace', 'setpattern'].forEach((n) => D(n, () => { pop(); }));
  D('setscreen', () => { pop(); pop(); pop(); });
  D('setcolortransfer', () => { pop(); pop(); pop(); pop(); });
  D('setcachedevice', () => { for (let i = 0; i < 6; i++) pop(); });
  D('setcharwidth', () => { pop(); pop(); });
  D('setcolorspace', () => {
    const s = pop();
    gs.space = s instanceof Name ? s.n : (Array.isArray(s) && s[0] instanceof Name ? s[0].n : 'DeviceGray');
  });
  D('setcolor', () => {
    const n = /RGB|ABC|Lab/.test(gs.space) ? 3 : /CMYK/.test(gs.space) ? 4 : 1;
    const v = []; for (let i = 0; i < n; i++) v.unshift(pop());
    if (n === 1 && typeof v[0] === 'number') gs.fc = gs.sc = [v[0], v[0], v[0]];
    else if (n === 3) gs.fc = gs.sc = v.map((x) => clamp(x));
    else if (n === 4) gs.fc = gs.sc = cmyk(v[0], v[1], v[2], v[3]);
  });

  /* gráficos: estado */
  D('gsave', () => {
    gstack.push({ gs: Object.assign({}, gs, { ctm: gs.ctm.slice(), fc: gs.fc.slice(), sc: gs.sc.slice() }), path: path.slice(), cur, start });
  });
  D('grestore', () => { const s = gstack.pop(); if (!s) return; gs = s.gs; path = s.path; cur = s.cur; start = s.start; });
  D('grestoreall', () => { while (gstack.length) { const s = gstack.pop(); gs = s.gs; path = s.path; cur = s.cur; start = s.start; } });
  D('initgraphics', () => { gs = newGS(); path = []; cur = null; });
  D('initmatrix', () => { gs.ctm = [1, 0, 0, 1, 0, 0]; });
  D('initclip', () => { gs.clip = []; });
  D('setlinewidth', () => { gs.lw = popNum(); });
  D('setlinecap', () => { gs.cap = popNum(); });
  D('setlinejoin', () => { gs.join = popNum(); });
  D('setmiterlimit', () => { gs.miter = popNum(); });
  D('setdash', () => { const off = popNum(), a = pop(); gs.dash = Array.isArray(a) ? a.slice() : []; gs.doff = off; });
  D('currentlinewidth', () => { os.push(gs.lw); });
  D('setgray', () => { const g = clamp(popNum()); gs.fc = gs.sc = [g, g, g]; });
  D('setrgbcolor', () => { const b = popNum(), g = popNum(), r = popNum(); gs.fc = gs.sc = [clamp(r), clamp(g), clamp(b)]; });
  D('setcmykcolor', () => { const k = popNum(), y = popNum(), m = popNum(), c = popNum(); gs.fc = gs.sc = cmyk(c, m, y, k); });
  D('sethsbcolor', () => { const b = popNum(), s = popNum(), h = popNum(); gs.fc = gs.sc = hsb2rgb(h, s, b); });
  D('currentrgbcolor', () => { os.push(...gs.fc); });
  D('currentgray', () => { os.push((gs.fc[0] + gs.fc[1] + gs.fc[2]) / 3); });

  /* matrices */
  const matArg = () => (Array.isArray(os[os.length - 1]) && os[os.length - 1].length === 6 ? pop() : null);
  D('matrix', () => { os.push([1, 0, 0, 1, 0, 0]); });
  D('identmatrix', () => { const m = pop(); m.splice(0, 6, 1, 0, 0, 1, 0, 0); os.push(m); });
  D('currentmatrix', () => { const m = pop(); m.splice(0, 6, ...gs.ctm); os.push(m); });
  D('setmatrix', () => { gs.ctm = pop().slice(0, 6); });
  D('defaultmatrix', () => { const m = pop(); m.splice(0, 6, 1, 0, 0, 1, 0, 0); os.push(m); });
  D('concat', () => { const m = pop(); gs.ctm = mmul(m, gs.ctm); });
  D('concatmatrix', () => { const c = pop(), b = pop(), a = pop(); c.splice(0, 6, ...mmul(a, b)); os.push(c); });
  D('invertmatrix', () => { const b = pop(), a = pop(); b.splice(0, 6, ...minv(a)); os.push(b); });
  D('translate', () => { const m = matArg(), ty = popNum(), tx = popNum(); const t = [1, 0, 0, 1, tx, ty]; if (m) { m.splice(0, 6, ...t); os.push(m); } else gs.ctm = mmul(t, gs.ctm); });
  D('scale', () => { const m = matArg(), sy = popNum(), sx = popNum(); const t = [sx, 0, 0, sy, 0, 0]; if (m) { m.splice(0, 6, ...t); os.push(m); } else gs.ctm = mmul(t, gs.ctm); });
  D('rotate', () => {
    const m = matArg(), a = popNum() * Math.PI / 180;
    const t = [Math.cos(a), Math.sin(a), -Math.sin(a), Math.cos(a), 0, 0];
    if (m) { m.splice(0, 6, ...t); os.push(m); } else gs.ctm = mmul(t, gs.ctm);
  });
  D('transform', () => { const m = matArg(), y = popNum(), x = popNum(); const c = m || gs.ctm; os.push(c[0] * x + c[2] * y + c[4], c[1] * x + c[3] * y + c[5]); });
  D('dtransform', () => { const m = matArg(), y = popNum(), x = popNum(); const c = m || gs.ctm; os.push(c[0] * x + c[2] * y, c[1] * x + c[3] * y); });
  D('itransform', () => { const m = matArg(), y = popNum(), x = popNum(); const c = minv(m || gs.ctm); os.push(c[0] * x + c[2] * y + c[4], c[1] * x + c[3] * y + c[5]); });
  D('idtransform', () => { const m = matArg(), y = popNum(), x = popNum(); const c = minv(m || gs.ctm); os.push(c[0] * x + c[2] * y, c[1] * x + c[3] * y); });

  /* gráficos: caminos */
  D('newpath', () => { path = []; cur = null; });
  D('moveto', () => { const y = popNum(), x = popNum(); moveto(x, y); });
  D('rmoveto', () => { const dy = popNum(), dx = popNum(); if (!cur) throw new Error('nocurrentpoint'); const u = itr(cur[0], cur[1]); moveto(u[0] + dx, u[1] + dy); });
  D('lineto', () => { const y = popNum(), x = popNum(); lineto(x, y); });
  D('rlineto', () => { const dy = popNum(), dx = popNum(); if (!cur) throw new Error('nocurrentpoint'); const u = itr(cur[0], cur[1]); lineto(u[0] + dx, u[1] + dy); });
  D('curveto', () => { const v = []; for (let i = 0; i < 6; i++) v.unshift(popNum()); curveto(...v); });
  D('rcurveto', () => {
    const v = []; for (let i = 0; i < 6; i++) v.unshift(popNum());
    if (!cur) throw new Error('nocurrentpoint');
    const u = itr(cur[0], cur[1]);
    curveto(u[0] + v[0], u[1] + v[1], u[0] + v[2], u[1] + v[3], u[0] + v[4], u[1] + v[5]);
  });
  D('closepath', () => { closepath(); });
  D('arc', () => { const a2 = popNum(), a1 = popNum(), r = popNum(), y = popNum(), x = popNum(); arcPath(x, y, r, a1, a2, false); });
  D('arcn', () => { const a2 = popNum(), a1 = popNum(), r = popNum(), y = popNum(), x = popNum(); arcPath(x, y, r, a1, a2, true); });
  D('arcto', () => {
    const r = popNum(), y2 = popNum(), x2 = popNum(), y1 = popNum(), x1 = popNum();
    if (!cur) throw new Error('nocurrentpoint');
    const p0 = itr(cur[0], cur[1]);
    const v1 = [p0[0] - x1, p0[1] - y1], v2 = [x2 - x1, y2 - y1];
    const l1 = Math.hypot(...v1), l2 = Math.hypot(...v2);
    if (!l1 || !l2 || !r) { lineto(x1, y1); os.push(x1, y1, x1, y1); return; }
    const n1 = [v1[0] / l1, v1[1] / l1], n2 = [v2[0] / l2, v2[1] / l2];
    const cosA = n1[0] * n2[0] + n1[1] * n2[1];
    const ang = Math.acos(Math.max(-1, Math.min(1, cosA)));
    if (Math.abs(Math.sin(ang)) < 1e-9) { lineto(x1, y1); os.push(x1, y1, x1, y1); return; }
    const t = r / Math.tan(ang / 2);
    const ta = [x1 + n1[0] * t, y1 + n1[1] * t], tb = [x1 + n2[0] * t, y1 + n2[1] * t];
    const cross = n1[0] * n2[1] - n1[1] * n2[0];
    const bis = [n1[0] + n2[0], n1[1] + n2[1]], bl = Math.hypot(...bis);
    const cd = r / Math.sin(ang / 2);
    const c = [x1 + bis[0] / bl * cd, y1 + bis[1] / bl * cd];
    const a1 = Math.atan2(ta[1] - c[1], ta[0] - c[0]) * 180 / Math.PI;
    const a2 = Math.atan2(tb[1] - c[1], tb[0] - c[0]) * 180 / Math.PI;
    lineto(ta[0], ta[1]);
    arcPath(c[0], c[1], r, a1, a2, cross > 0);
    os.push(ta[0], ta[1], tb[0], tb[1]);
  });
  const rectArgs = () => { const h = popNum(), w = popNum(), y = popNum(), x = popNum(); return [x, y, w, h]; };
  const rectPath = (x, y, w, h) => { moveto(x, y); lineto(x + w, y); lineto(x + w, y + h); lineto(x, y + h); closepath(); };
  D('rectfill', () => { const [x, y, w, h] = rectArgs(); path = []; cur = null; rectPath(x, y, w, h); paint(true, false, false); });
  D('rectstroke', () => { const [x, y, w, h] = rectArgs(); path = []; cur = null; rectPath(x, y, w, h); paint(false, true, false); });
  D('rectclip', () => { const [x, y, w, h] = rectArgs(); path = []; cur = null; rectPath(x, y, w, h); clipNow(false); path = []; cur = null; });
  D('currentpoint', () => { if (!cur) throw new Error('nocurrentpoint'); const u = itr(cur[0], cur[1]); os.push(u[0], u[1]); });
  D('fill', () => { paint(true, false, false); });
  D('eofill', () => { paint(true, false, true); });
  D('stroke', () => { paint(false, true, false); });
  D('clip', () => { clipNow(false); });
  D('eoclip', () => { clipNow(true); });
  D('showpage', () => {}); D('copypage', () => {}); D('erasepage', () => {});
  D('flattenpath', () => {}); D('reversepath', () => {});
  D('clippath', () => {
    path = []; cur = null;
    const b = bbDeclared || [0, 0, 612, 792];
    path.push(['M', b[0], b[1]], ['L', b[2], b[1]], ['L', b[2], b[3]], ['L', b[0], b[3]], ['Z']);
  });
  D('pathbbox', () => { os.push(0, 0, 0, 0); });

  /* texto */
  D('findfont', () => { const n = pop(); os.push({ font: true, name: n instanceof Name ? n.n : String(n), size: 1 }); });
  D('definefont', () => { const fnt = pop(); pop(); os.push(fnt); });
  D('scalefont', () => { const s = popNum(), fo = pop(); os.push(Object.assign({}, fo, { size: fo.size * s })); });
  D('makefont', () => { const m = pop(), fo = pop(); os.push(Object.assign({}, fo, { size: fo.size * Math.abs(m[3] || 1) })); });
  D('setfont', () => { gs.font = pop(); });
  D('currentfont', () => { os.push(gs.font || { font: true, name: 'Helvetica', size: 12 }); });
  D('selectfont', () => { const s = pop(), n = pop(); gs.font = { font: true, name: n instanceof Name ? n.n : String(n), size: typeof s === 'number' ? s : 12 }; });
  D('show', () => { showText(pop()); });
  D('ashow', () => { const s = pop(); pop(); pop(); showText(s); });
  D('widthshow', () => { const s = pop(); pop(); pop(); pop(); showText(s); });
  D('awidthshow', () => { const s = pop(); for (let i = 0; i < 5; i++) pop(); showText(s); });
  D('kshow', () => { const s = pop(); pop(); showText(s); });
  D('stringwidth', () => { const s = String(pop()); os.push(s.length * (gs.font ? gs.font.size : 12) * 0.5, 0); });
  D('charpath', () => { pop(); pop(); addW('text'); });
  D('image', () => { const t = os[os.length - 1]; if (t instanceof Dict) pop(); else for (let i = 0; i < 5; i++) pop(); addW('raster'); });
  D('imagemask', () => { const t = os[os.length - 1]; if (t instanceof Dict) pop(); else for (let i = 0; i < 5; i++) pop(); addW('raster'); });
  D('colorimage', () => { for (let i = 0; i < 7; i++) pop(); addW('raster'); });
  D('shfill', () => { pop(); addW('shading'); });
  D('makepattern', () => { pop(); pop(); os.push(new Dict()); addW('shading'); });

  /* operadores abreviados de Adobe Illustrator */
  const aiColor = (stroke) => (c, m, y, k) => { const v = cmyk(c, m, y, k); if (stroke) gs.sc = v; else gs.fc = v; };
  const take = (n) => { const v = []; for (let i = 0; i < n; i++) v.unshift(popNum()); return v; };
  D('m', () => { const [x, y] = take(2); moveto(x, y); });
  D('l', () => { const [x, y] = take(2); lineto(x, y); });
  D('L', () => { const [x, y] = take(2); lineto(x, y); });
  D('c', () => { curveto(...take(6)); });
  D('C', () => { curveto(...take(6)); });
  D('v', () => { const [x2, y2, x3, y3] = take(4); const u = itr(cur[0], cur[1]); curveto(u[0], u[1], x2, y2, x3, y3); });
  D('V', () => { const [x2, y2, x3, y3] = take(4); const u = itr(cur[0], cur[1]); curveto(u[0], u[1], x2, y2, x3, y3); });
  D('y', () => { const [x1, y1, x3, y3] = take(4); curveto(x1, y1, x3, y3, x3, y3); });
  D('Y', () => { const [x1, y1, x3, y3] = take(4); curveto(x1, y1, x3, y3, x3, y3); });
  D('h', () => { closepath(); });
  D('H', () => {});
  D('n', () => { closepath(); if (!compound) { path = []; cur = null; } if (aiMode) os.length = 0; });
  D('N', () => { if (!compound) { path = []; cur = null; } if (aiMode) os.length = 0; });
  D('f', () => { closepath(); paint(true, false, false); });
  D('F', () => { paint(true, false, false); });
  D('f*', () => { closepath(); paint(true, false, true); });
  D('F*', () => { paint(true, false, true); });
  D('s', () => { closepath(); paint(false, true, false); });
  D('S', () => { paint(false, true, false); });
  D('b', () => { closepath(); paint(true, true, false); });
  D('B', () => { paint(true, true, false); });
  D('b*', () => { closepath(); paint(true, true, true); });
  D('B*', () => { paint(true, true, true); });
  D('W', () => { clipNow(false); });
  D('W*', () => { clipNow(true); });
  D('q', () => { sys.m.get('gsave')(); });
  D('Q', () => { sys.m.get('grestore')(); });
  D('u', () => {}); D('U', () => {});
  D('*u', () => { compound++; });
  D('*U', () => { if (compound > 0) compound--; });
  D('k', () => { aiColor(false)(...take(4)); });
  D('K', () => { aiColor(true)(...take(4)); });
  D('g', () => { const [g] = take(1); gs.fc = [clamp(g), clamp(g), clamp(g)]; });
  D('G', () => { const [g] = take(1); gs.sc = [clamp(g), clamp(g), clamp(g)]; });
  D('Xa', () => { const [r, g, b] = take(3); gs.fc = [clamp(r), clamp(g), clamp(b)]; });
  D('XA', () => { const [r, g, b] = take(3); gs.sc = [clamp(r), clamp(g), clamp(b)]; });
  D('x', () => { pop(); pop(); aiColor(false)(...take(4)); });
  D('X', () => { pop(); pop(); aiColor(true)(...take(4)); });
  D('d', () => { const off = popNum(), a = pop(); gs.dash = Array.isArray(a) ? a.slice() : []; gs.doff = off; });
  D('w', () => { gs.lw = popNum(); });
  D('j', () => { gs.join = popNum(); });
  D('J', () => { gs.cap = popNum(); });
  D('M', () => { gs.miter = popNum(); });
  ['i', 'O', 'R', 'D', 'A', 'XR', 'Ln'].forEach((n) => D(n, () => { pop(); }));
  D('Lb', () => { os.length = 0; });
  D('LB', () => {});

  /* ejecución del programa */
  let fatal = null;
  for (let ti = 0; ti < tokens.length; ti++) {
    const t = tokens[ti];
    try {
      if (t instanceof Name) exec(t); else os.push(t);
    } catch (e) {
      if (e === QUIT) break;
      if (e && e.limit) { fatal = e.message; break; }
      if (e === EXIT || e === STOP) continue;
      errors++;
    }
  }
  while (openClips.length) { body.push('</g>'); openClips.pop(); }

  /* área */
  let usedFallback = false;
  if (!bb || !(bb[2] > bb[0]) || !(bb[3] > bb[1])) {
    if (isFinite(ext[0])) { bb = [Math.floor(ext[0]), Math.floor(ext[1]), Math.ceil(ext[2]), Math.ceil(ext[3])]; usedFallback = true; }
    else bb = [0, 0, 612, 792];
  }
  const w = bb[2] - bb[0], h = bb[3] - bb[1];
  const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="' + f(w) + '" height="' + f(h) + '" viewBox="0 0 ' + f(w) + ' ' + f(h) + '">\n' +
    (defs.length ? '<defs>\n' + defs.join('\n') + '\n</defs>\n' : '') +
    '<g transform="matrix(1 0 0 -1 ' + f(-bb[0]) + ' ' + f(bb[3]) + ')">\n' + body.join('\n') + '\n</g>\n</svg>\n';

  /* avisos */
  const notes = [];
  if (fatal) notes.push({ code: fatal });
  if (!nPaths) notes.push({ code: 'empty' });
  if (usedFallback) notes.push({ code: 'noBBox' });
  if (warn.has('raster')) notes.push({ code: 'raster' });
  if (warn.has('shading')) notes.push({ code: 'shading' });
  if (warn.has('text')) notes.push({ code: 'text' });
  if (compressedAI) notes.push({ code: 'compressedAI' });
  const unk = Array.from(warn.entries()).filter((e) => e[0].indexOf('op:') === 0).sort((a, b) => b[1] - a[1]);
  if (unk.length) notes.push({ code: 'unknownOps', n: unk.length, ops: unk.slice(0, 8).map((e) => e[0].slice(3)).join(', ') + (unk.length > 8 ? '…' : '') });
  if (errors) notes.push({ code: 'errors', n: errors });

  return {
    svg, width: w, height: h, bbox: bb, paths: nPaths, notes,
    creator, title: titleM ? titleM[1].trim() : '', usedBBox: !usedFallback && !!bbDeclared
  };
}
