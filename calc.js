'use strict';
/*LOGIC-START*/
const L = (() => {
  const round = (x, d) => { const k = Math.pow(10, d); return Math.round((x + 1e-9) * k) / k; };
  const parse = s => {
    if (s === null || s === undefined) return null;
    const t = String(s).trim().replace(',', '.');
    if (t === '') return null;
    return /^(\d+\.?\d*|\.\d+)$/.test(t) ? parseFloat(t) : NaN;
  };
  const ok = n => n !== null && n !== undefined && !Number.isNaN(n);
  const score = s => { const n = parse(s); return ok(n) && n > 10 ? NaN : n; };
  const num = (s, d) => { const n = parse(s); return ok(n) ? n : d; };
  const norm = s => String(s || '').trim().toLowerCase().replace(/\s+/g, ' ');
  const up1 = x => Math.ceil(x * 10 - 1e-9) / 10;
  const up2 = x => Math.ceil(x * 100 - 1e-9) / 100;

  /* ----- Học sinh ----- */
  const hsCfg = c => ({
    wTx: num(c.wTx, 1), wGk: num(c.wGk, 2), wCk: num(c.wCk, 3), wY1: num(c.wY1, 1), wY2: num(c.wY2, 2),
    dec: num(c.dec, 1) >= 2 ? 2 : 1,
    style: c.style === 'tt22' ? 'tt22' : 'old',
    cuts: [8, 6.5, 5, 3.5].map((d, i) => num((c.cuts || [])[i], d))
  });
  const hsBands = c => c.style === 'tt22'
    ? [{ min: c.cuts[0], label: 'Tốt', tone: 'great' }, { min: c.cuts[1], label: 'Khá', tone: 'good' }, { min: c.cuts[2], label: 'Đạt', tone: 'mid' }, { min: -1, label: 'Chưa đạt', tone: 'bad' }]
    : [{ min: c.cuts[0], label: 'Giỏi', tone: 'great' }, { min: c.cuts[1], label: 'Khá', tone: 'good' }, { min: c.cuts[2], label: 'Trung bình', tone: 'mid' }, { min: c.cuts[3], label: 'Yếu', tone: 'weak' }, { min: -1, label: 'Kém', tone: 'bad' }];
  const classify = (v, bands) => ok(v) ? (bands.find(b => v >= b.min) || bands[bands.length - 1]) : null;

  const hsTerm = (sub, term, cfg) => {
    const d = sub.t[term];
    let sum = 0, w = 0, nTx = 0;
    (d.tx || []).forEach(s => { const v = score(s); if (ok(v)) { sum += v * cfg.wTx; w += cfg.wTx; nTx++; } });
    const gk = score(d.gk), ck = score(d.ck), hasGk = ok(gk), hasCk = ok(ck);
    if (hasGk) { sum += gk * cfg.wGk; w += cfg.wGk; }
    if (hasCk) { sum += ck * cfg.wCk; w += cfg.wCk; }
    const entered = nTx > 0 || hasGk || hasCk;
    const raw = entered && w > 0 ? sum / w : null;
    return { raw, avg: raw === null ? null : round(raw, cfg.dec), complete: nTx > 0 && hasGk && hasCk, sum, w, nTx, hasGk, hasCk, entered };
  };
  const hsOverall = (items, dec) => {
    let s = 0, w = 0, n = 0, prov = false;
    items.forEach(it => { if (!ok(it.v) || !(it.w > 0)) return; s += it.v * it.w; w += it.w; n++; if (!it.complete) prov = true; });
    return { avg: w > 0 ? round(s / w, dec) : null, n, prov };
  };
  const hsYear = (sub, cfg) => {
    const a = hsTerm(sub, 1, cfg), b = hsTerm(sub, 2, cfg);
    let raw = null;
    const both = a.avg !== null && b.avg !== null;
    if (both) { const tw = cfg.wY1 + cfg.wY2; raw = tw > 0 ? (a.avg * cfg.wY1 + b.avg * cfg.wY2) / tw : (a.avg + b.avg) / 2; }
    else if (a.avg !== null) raw = a.avg;
    else if (b.avg !== null) raw = b.avg;
    return { t1: a, t2: b, avg: raw === null ? null : round(raw, cfg.dec), complete: both && a.complete && b.complete };
  };
  const hsNeed = (r, cfg, target) => {
    if (!r.entered) return null;
    let wm = 0; const miss = [];
    if (!r.hasGk) { miss.push('gk'); wm += cfg.wGk; }
    if (!r.hasCk) { miss.push('ck'); wm += cfg.wCk; }
    if (!miss.length || !(wm > 0)) return null;
    const eff = target - 0.5 * Math.pow(10, -cfg.dec) + 1e-9;
    return { miss, x: (eff * (r.w + wm) - r.sum) / wm, max: round((r.sum + 10 * wm) / (r.w + wm), cfg.dec) };
  };
  const hsPlanAll = (rows, cfg, target) => {
    let W = 0, A = 0, B = 0, open = 0;
    rows.forEach(({ r, w }) => {
      if (!(w > 0) || !r.entered || !(r.w > 0)) return;
      W += w;
      let wm = 0; if (!r.hasGk) wm += cfg.wGk; if (!r.hasCk) wm += cfg.wCk;
      if (!(wm > 0)) { A += w * (r.sum / r.w); return; }
      const T = r.w + wm; A += w * (r.sum / T); B += w * (wm / T); open++;
    });
    if (!(W > 0)) return null;
    const eff = target - 0.5 * Math.pow(10, -cfg.dec) + 1e-9;
    if (!open) { const avg = A / W; return { kind: 'final', avg, ok: avg >= eff }; }
    return { kind: 'open', x: (eff * W - A) / B, max: (A + 10 * B) / W };
  };

  /* ----- Sinh viên ----- */
  const cleanScale = (sc, fallback) => {
    const f = list => (list || []).map(r => ({ l: String(r.l == null ? '' : r.l).trim(), min: parse(r.min), gp: parse(r.gp) }))
      .filter(r => r.l && ok(r.min) && ok(r.gp)).sort((a, b) => b.min - a.min);
    const rows = f(sc);
    return rows.length ? rows : f(fallback);
  };
  const grade = (raw, scale) => {
    const t = String(raw == null ? '' : raw).trim();
    if (t === '') return null;
    const n = parse(t);
    if (ok(n)) {
      if (n > 10) return { bad: true };
      const r = round(n, 1);
      const row = scale.find(x => r >= x.min) || scale[scale.length - 1];
      return row ? { s10: n, letter: row.l, gp: row.gp } : { bad: true };
    }
    const k = t.replace(/\s+/g, '').toLowerCase();
    const row = scale.find(x => x.l.replace(/\s+/g, '').toLowerCase() === k);
    return row ? { s10: null, letter: row.l, gp: row.gp } : { bad: true };
  };
  const course = (c, scale) => {
    const cr = parse(c.cr), g = grade(c.sc, scale);
    const crOk = ok(cr) && cr > 0 && cr <= 30;
    const rawCr = String(c.cr == null ? '' : c.cr).trim();
    return { cr: crOk ? cr : null, crBad: rawCr !== '' && !crOk, g, ok: !!g && !g.bad && crOk, on: c.on !== false };
  };
  const termList = (t, scale) => {
    const out = [];
    t.courses.forEach(c => {
      const r = course(c, scale);
      if (r.ok && r.on) out.push({ id: c.id, key: norm(c.name), rt: !!c.rt, cr: r.cr, gp: r.g.gp, s10: r.g.s10 });
    });
    return out;
  };
  const cumList = (terms, scale, policy) => {
    const all = [];
    terms.forEach(t => termList(t, scale).forEach(x => { x.i = all.length; all.push(x); }));
    const groups = new Map();
    all.forEach(x => { if (!x.key) return; if (!groups.has(x.key)) groups.set(x.key, []); groups.get(x.key).push(x); });
    const drop = new Set();
    groups.forEach(arr => {
      if (arr.length < 2 || !arr.some(x => x.rt)) return;
      let keep = arr[0];
      arr.forEach(x => { if (policy === 'last' ? x.i > keep.i : (x.gp > keep.gp || (x.gp === keep.gp && x.i > keep.i))) keep = x; });
      arr.forEach(x => { if (x !== keep) drop.add(x.i); });
    });
    return { kept: all.filter(x => !drop.has(x.i)), dropped: all.filter(x => drop.has(x.i)) };
  };
  const agg = list => {
    let C = 0, P = 0, E = 0, C10 = 0, P10 = 0;
    list.forEach(x => {
      C += x.cr; P += x.cr * x.gp; if (x.gp > 0) E += x.cr;
      if (x.s10 !== null && x.s10 !== undefined) { C10 += x.cr; P10 += x.cr * x.s10; }
    });
    return { n: list.length, credits: C, earned: E, pts: P, gpa: C > 0 ? round(P / C, 2) : null, avg10: C10 > 0 ? round(P10 / C10, 2) : null, miss10: list.some(x => x.s10 === null || x.s10 === undefined) };
  };
  const uniBands = c => {
    const k = c.cuts || [];
    const v = [3.6, 3.2, 2.5, 2, 1].map((d, i) => num(k[i], d));
    return [{ min: v[0], label: 'Xuất sắc', tone: 'top' }, { min: v[1], label: 'Giỏi', tone: 'great' }, { min: v[2], label: 'Khá', tone: 'good' }, { min: v[3], label: 'Trung bình', tone: 'mid' }, { min: v[4], label: 'Yếu', tone: 'weak' }, { min: -1, label: 'Kém', tone: 'bad' }];
  };
  const uniNeed = (cum, target, remain, scale) => {
    if (!(remain > 0)) return null;
    const maxGp = Math.max(...scale.map(r => r.gp));
    const total = cum.credits + remain;
    const eff = target - 0.005 + 1e-9;
    const need = (eff * total - cum.pts) / remain;
    const best = (cum.pts + maxGp * remain) / total, worst = cum.pts / total;
    let letterRow = null;
    if (need > 0 && need <= maxGp + 1e-9) letterRow = scale.filter(r => r.gp >= need - 1e-9).sort((a, b) => a.gp - b.gp)[0] || null;
    return { need, best, worst, letterRow, maxGp };
  };

  /* ----- Nhập nhanh ----- */
  const splitLine = line => (line.indexOf('\t') >= 0 ? line.split('\t') : line.indexOf(';') >= 0 ? line.split(';') : line.split(',')).map(x => x.trim());
  const parseHS = text => {
    const out = [];
    String(text).split(/\r?\n/).forEach(line => {
      if (!line.trim()) return;
      let cells = splitLine(line);
      if (cells.length === 1) {
        const m = line.trim().match(/^(.*?[^\d.,\s])\s+((?:\d+(?:[.,]\d+)?(?:\s+|$))+)$/);
        if (m) cells = [m[1].trim()].concat(m[2].trim().split(/\s+/));
      }
      const name = cells[0], rest = cells.slice(1);
      if (!name || !rest.length) return;
      const clean = v => (ok(score(v)) ? v : '');
      const item = rest.length >= 3
        ? { name, tx: rest.slice(0, -2).filter(v => ok(score(v))), gk: clean(rest[rest.length - 2]), ck: clean(rest[rest.length - 1]) }
        : { name, tx: rest.filter(v => ok(score(v))), gk: '', ck: '' };
      if (!item.tx.length && item.gk === '' && item.ck === '') return;
      out.push(item);
    });
    return out;
  };
  const parseUni = text => {
    const out = [];
    String(text).split(/\r?\n/).forEach(line => {
      if (!line.trim()) return;
      const c = splitLine(line);
      if (c.length < 2 || !c[0]) return;
      const cr = parse(c[1]);
      if (!ok(cr) || cr <= 0 || cr > 30) return;
      out.push({ name: c[0], cr: c[1], sc: c[2] || '' });
    });
    return out;
  };

  /* ----- Xuất .xlsx (tự dựng, không cần thư viện) ----- */
  const crcTable = (() => { const t = []; for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
  const crc32 = b => { let c = 0xFFFFFFFF; for (let i = 0; i < b.length; i++) c = crcTable[(c ^ b[i]) & 255] ^ (c >>> 8); return (c ^ 0xFFFFFFFF) >>> 0; };
  const zip = files => {
    const enc = new TextEncoder(), out = [], cd = [];
    let off = 0;
    const w16 = v => [v & 255, (v >>> 8) & 255], w32 = v => [v & 255, (v >>> 8) & 255, (v >>> 16) & 255, (v >>> 24) & 255];
    files.forEach(f => {
      const nm = enc.encode(f.name), crc = crc32(f.data), n = f.data.length;
      const lh = Uint8Array.from([0x50, 0x4b, 3, 4, ...w16(20), ...w16(0x0800), ...w16(0), ...w16(0), ...w16(0x21), ...w32(crc), ...w32(n), ...w32(n), ...w16(nm.length), ...w16(0)]);
      out.push(lh, nm, f.data);
      cd.push(Uint8Array.from([0x50, 0x4b, 1, 2, ...w16(20), ...w16(20), ...w16(0x0800), ...w16(0), ...w16(0), ...w16(0x21), ...w32(crc), ...w32(n), ...w32(n), ...w16(nm.length), ...w16(0), ...w16(0), ...w16(0), ...w16(0), ...w32(0), ...w32(off)]), nm);
      off += lh.length + nm.length + n;
    });
    const cdSize = cd.reduce((a, b) => a + b.length, 0);
    const end = Uint8Array.from([0x50, 0x4b, 5, 6, ...w16(0), ...w16(0), ...w16(files.length), ...w16(files.length), ...w32(cdSize), ...w32(off), ...w16(0)]);
    const all = out.concat(cd, [end]), res = new Uint8Array(all.reduce((a, b) => a + b.length, 0));
    let p = 0; all.forEach(b => { res.set(b, p); p += b.length; });
    return res;
  };
  const xmlEsc = s => String(s).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const colName = i => { let s = ''; for (i++; i > 0; i = Math.floor((i - 1) / 26)) s = String.fromCharCode(65 + (i - 1) % 26) + s; return s; };
  const xlsx = (rows, sheet) => {
    const enc = new TextEncoder(), widths = [];
    rows.forEach(r => r.forEach((v, c) => { const l = String(v == null ? '' : v).length; widths[c] = Math.max(widths[c] || 8, Math.min(40, l + 2)); }));
    let sd = '';
    rows.forEach((r, ri) => {
      let cells = '';
      r.forEach((v, ci) => {
        if (v === null || v === undefined || v === '') return;
        const ref = colName(ci) + (ri + 1), st = ri === 0 ? ' s="1"' : '';
        if (typeof v === 'number' && Number.isFinite(v)) cells += `<c r="${ref}"${st}><v>${v}</v></c>`;
        else cells += `<c r="${ref}" t="inlineStr"${st}><is><t xml:space="preserve">${xmlEsc(v)}</t></is></c>`;
      });
      sd += `<row r="${ri + 1}">${cells}</row>`;
    });
    const H = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>';
    const NS = 'http://schemas.openxmlformats.org/spreadsheetml/2006/main', RN = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships', PR = 'http://schemas.openxmlformats.org/package/2006/relationships';
    const name = xmlEsc(String(sheet || 'Bảng điểm').replace(/[\[\]:*?\/\\]/g, ' ').slice(0, 31) || 'Bảng điểm');
    const parts = [
      ['[Content_Types].xml', `${H}<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/></Types>`],
      ['_rels/.rels', `${H}<Relationships xmlns="${PR}"><Relationship Id="rId1" Type="${RN}/officeDocument" Target="xl/workbook.xml"/></Relationships>`],
      ['xl/workbook.xml', `${H}<workbook xmlns="${NS}" xmlns:r="${RN}"><sheets><sheet name="${name}" sheetId="1" r:id="rId1"/></sheets></workbook>`],
      ['xl/_rels/workbook.xml.rels', `${H}<Relationships xmlns="${PR}"><Relationship Id="rId1" Type="${RN}/worksheet" Target="worksheets/sheet1.xml"/><Relationship Id="rId2" Type="${RN}/styles" Target="styles.xml"/></Relationships>`],
      ['xl/styles.xml', `${H}<styleSheet xmlns="${NS}"><fonts count="2"><font><sz val="11"/><name val="Calibri"/></font><font><b/><sz val="11"/><name val="Calibri"/></font></fonts><fills count="2"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill></fills><borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="2"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/><xf numFmtId="0" fontId="1" fillId="0" borderId="0" xfId="0" applyFont="1"/></cellXfs><cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles></styleSheet>`],
      ['xl/worksheets/sheet1.xml', `${H}<worksheet xmlns="${NS}"><sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews><cols>${widths.map((w, i) => `<col min="${i + 1}" max="${i + 1}" width="${w}" customWidth="1"/>`).join('')}</cols><sheetData>${sd}</sheetData></worksheet>`]
    ];
    return zip(parts.map(([n, t]) => ({ name: n, data: enc.encode(t) })));
  };

  return { round, parse, ok, score, num, norm, up1, up2, hsCfg, hsBands, classify, hsTerm, hsOverall, hsYear, hsNeed, hsPlanAll, cleanScale, grade, course, termList, cumList, agg, uniBands, uniNeed, parseHS, parseUni, xlsx };
})();
/*LOGIC-END*/
