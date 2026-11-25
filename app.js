'use strict';
/* ================= Tiện ích ================= */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const uid = () => Math.random().toString(36).slice(2, 9);
const fmt = (v, d) => (v === null || v === undefined || Number.isNaN(v)) ? '—' : v.toFixed(d);
const trimNum = n => String(+Number(n).toFixed(2));
const debounce = (fn, ms) => { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; };

const svgI = (d, size = 22) => `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
const ico = {
  logo: svgI('<rect x="4" y="3" width="16" height="18" rx="3"/><path d="M9 3v18" style="stroke:var(--t-bad)"/><path d="M12.5 8h4M12.5 12h4M12.5 16h2.5"/>', 24),
  plus: svgI('<path d="M12 5v14M5 12h14"/>'),
  trash: svgI('<path d="M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V4h6v3"/>', 20),
  check: svgI('<path d="M5 12.5l4.5 4.5L19 7.5"/>', 18),
  target: svgI('<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3.5"/>', 18),
  warn: svgI('<path d="M12 4l9 16H3z"/><path d="M12 10v4M12 17.2v.1"/>', 18),
  close: svgI('<path d="M6 6l12 12M18 6L6 18"/>'),
  sliders: svgI('<path d="M4 7h9M17 7h3M4 17h3M11 17h9"/><circle cx="15" cy="7" r="2"/><circle cx="9" cy="17" r="2"/>'),
  swap: svgI('<path d="M8 4v14M8 18l-3-3M8 18l3-3M16 20V6M16 6l-3 3M16 6l3 3"/>'),
  theme: svgI('<circle cx="12" cy="12" r="8.5"/><path d="M12 3.5a8.5 8.5 0 0 1 0 17z" fill="currentColor"/>')
};

/* ================= Trạng thái ================= */
const DEF_SCALE = [['A', 8.5, 4], ['B+', 8, 3.5], ['B', 7, 3], ['C+', 6.5, 2.5], ['C', 5.5, 2], ['D+', 5, 1.5], ['D', 4, 1], ['F', 0, 0]];
const defScale = () => DEF_SCALE.map(([l, m, g]) => ({ l, min: String(m), gp: String(g) }));
const defHs = () => ({ wTx: '1', wGk: '2', wCk: '3', wY1: '1', wY2: '2', dec: '1', style: 'old', cuts: ['8', '6.5', '5', '3.5'] });
const defUni = () => ({ scale: defScale(), cuts: ['3.6', '3.2', '2.5', '2', '1'], retake: 'best', kb: 'text' });
const blankT = () => ({ tx: ['', '', ''], gk: '', ck: '' });
const T = (tx, gk, ck) => ({ tx: tx.map(String), gk: String(gk), ck: String(ck) });
const mkSub = (name, t1, t2) => ({ id: uid(), name, w: '1', t: { 1: t1 || blankT(), 2: t2 || blankT() } });
const mkCourse = (name, cr, sc, o) => Object.assign({ id: uid(), name, cr: String(cr), sc: String(sc), on: true, rt: false }, o || {});

const sampleHS = () => [
  mkSub('Toán', T([8, 9, 7.5], 8.5, 9), T([8.5, 9], 9, '')),
  mkSub('Ngữ văn', T([7, 7.5, 8], 7, 7.5), T([7.5, 8], 7.5, '')),
  mkSub('Tiếng Anh', T([9, 10, 9], 9.5, 9), T([9, 9.5], '', '')),
  mkSub('Vật lí', T([6.5, 7, 8], 6, 7)),
  mkSub('Hóa học', T([7, 8, 7.5], 8, 8.5)),
  mkSub('Sinh học', T([8, 8, 9], 8.5, 8)),
  mkSub('Lịch sử', T([7, 6.5, 8], 7.5, 7)),
  mkSub('Địa lí', T([8, 9, 8], 8, 9))
];
const sampleUni = () => [
  { id: uid(), name: 'HK1 2025–26', courses: [
    mkCourse('Giải tích 1', 3, '8.5'), mkCourse('Đại số tuyến tính', 3, '7.2'), mkCourse('Vật lý đại cương 1', 3, '4.5'),
    mkCourse('Tin học cơ sở', 2, '9.1'), mkCourse('Triết học Mác – Lênin', 3, '7.5'), mkCourse('Giáo dục thể chất 1', 1, '8', { on: false })] },
  { id: uid(), name: 'HK2 2025–26', courses: [
    mkCourse('Giải tích 2', 3, '6.4'), mkCourse('Xác suất thống kê', 3, 'B+'), mkCourse('Lập trình cơ bản', 3, '9.0'),
    mkCourse('Kinh tế chính trị', 2, '7.8'), mkCourse('Vật lý đại cương 1', 3, '7.0', { rt: true })] }
];

const KEY = 'so-diem-v1';
let S = null;
function fresh() {
  return { v: 1, mode: 'hs', theme: null, sample: true, sep: ',',
    hs: { term: 1, target: '8', cfg: defHs(), subjects: sampleHS() },
    uni: { tab: 'all', cfg: defUni(), plan: { target: '3.2', remain: '30' }, terms: sampleUni() } };
}
function normalize(o) {
  const f = fresh(), h = o.hs || {}, u = o.uni || {};
  const s = { v: 1, mode: o.mode === 'uni' ? 'uni' : 'hs', theme: o.theme === 'dark' || o.theme === 'light' ? o.theme : null, sample: !!o.sample, sep: o.sep === '.' ? '.' : ',' };
  s.hs = { term: [1, 2, 'y'].indexOf(h.term) >= 0 ? h.term : 1, target: h.target != null ? String(h.target) : '8', cfg: Object.assign(defHs(), h.cfg || {}), subjects: Array.isArray(h.subjects) ? h.subjects : f.hs.subjects };
  if (!Array.isArray(s.hs.cfg.cuts) || s.hs.cfg.cuts.length < 4) s.hs.cfg.cuts = defHs().cuts;
  const fix = d => ({ tx: Array.isArray(d && d.tx) && d.tx.length ? d.tx.map(String) : ['', '', ''], gk: d && d.gk != null ? String(d.gk) : '', ck: d && d.ck != null ? String(d.ck) : '' });
  s.hs.subjects = s.hs.subjects.map(x => ({ id: x.id || uid(), name: String(x.name || ''), w: x.w != null ? String(x.w) : '1', t: { 1: fix((x.t || {})[1]), 2: fix((x.t || {})[2]) } }));
  s.uni = { tab: u.tab || 'all', cfg: Object.assign(defUni(), u.cfg || {}), plan: Object.assign({ target: '3.2', remain: '30' }, u.plan || {}), terms: Array.isArray(u.terms) ? u.terms : f.uni.terms };
  if (!Array.isArray(s.uni.cfg.scale) || !s.uni.cfg.scale.length) s.uni.cfg.scale = defScale();
  if (!Array.isArray(s.uni.cfg.cuts) || s.uni.cfg.cuts.length < 5) s.uni.cfg.cuts = defUni().cuts;
  s.uni.terms = s.uni.terms.map(t => ({ id: t.id || uid(), name: String(t.name || ''), courses: (Array.isArray(t.courses) ? t.courses : []).map(c => ({ id: c.id || uid(), name: String(c.name || ''), cr: c.cr != null ? String(c.cr) : '', sc: c.sc != null ? String(c.sc) : '', on: c.on !== false, rt: !!c.rt })) }));
  if (s.uni.tab !== 'all' && !s.uni.terms.some(t => t.id === s.uni.tab)) s.uni.tab = 'all';
  return s;
}
function load() { try { const raw = localStorage.getItem(KEY); if (!raw) return null; const o = JSON.parse(raw); return o && o.v === 1 ? o : null; } catch (e) { return null; } }
let saveTimer;
function save() { clearTimeout(saveTimer); saveTimer = setTimeout(() => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* bỏ qua */ } }, 250); }
function wipe() {
  S.hs.subjects.forEach(x => { x.t = { 1: blankT(), 2: blankT() }; });
  const t = { id: uid(), name: 'Học kỳ 1', courses: [mkCourse('', 3, '')] };
  S.uni.terms = [t]; S.uni.tab = t.id; S.sample = false;
}
const curTerm = () => S.uni.terms.find(t => t.id === S.uni.tab) || null;
const uniScale = () => L.cleanScale(S.uni.cfg.scale, defScale());

/* ================= Phần đầu trang (điểm giáo viên chấm) ================= */
const RING_D = 'M22 58 C10 30 52 8 104 8 C158 8 194 28 188 56 C182 84 134 94 92 92 C46 90 6 72 12 44 C17 22 52 12 96 10';
function heroShell(foot) {
  return `<section class="hero" id="hero">
    <p class="h-eye" id="hEye"></p>
    <div class="h-main">
      <div class="ring draw" id="hRing"><svg viewBox="0 0 200 100" preserveAspectRatio="none" aria-hidden="true"><path pathLength="1" d="${RING_D}"/></svg><div class="score" id="hScore">—</div></div>
      <div class="remark" id="hRemark"></div>
    </div>
    <div class="ruler" id="hRuler"></div>
    <div class="stats" id="hStats"></div>
    <p class="h-note" id="hNote"></p>
    ${foot || ''}
  </section>`;
}
function rulerHTML(bands, max, step) {
  const asc = bands.slice().sort((a, b) => a.min - b.min);
  let segs = '', labs = '';
  asc.forEach((b, i) => {
    const lo = Math.max(0, b.min), hi = i < asc.length - 1 ? Math.min(max, asc[i + 1].min) : max, w = Math.max(0, (hi - lo) / max * 100);
    if (w > 0) segs += `<i style="width:${w}%;background:var(--t-${b.tone})"></i>`;
    if (i > 0 && b.min > 0 && b.min < max) labs += `<span style="left:${b.min / max * 100}%">${trimNum(b.min)}</span>`;
  });
  return `<div class="ruler-bands">${segs}</div><div class="ruler-ticks" style="--step:${step / max * 100}%"></div><div class="pin"></div><div class="ruler-labs"><span class="l0" style="left:0">0</span>${labs}<span class="l1" style="left:100%">${trimNum(max)}</span></div>`;
}
function setHero(d) {
  const tone = d.cl ? `var(--t-${d.cl.tone})` : null;
  $('#hEye').textContent = d.eye;
  $('#hRing').style.setProperty('--tone', tone || 'var(--line2)');
  $('#hScore').innerHTML = esc(d.score) + (d.suffix ? `<small>${esc(d.suffix)}</small>` : '');
  const rm = $('#hRemark'); rm.style.setProperty('--tone', tone || 'var(--ink2)');
  rm.innerHTML = (d.cl ? `<span class="word">${esc(d.cl.label)}</span>` : '<span class="word idle">Nhập điểm để bắt đầu</span>') + (d.prov ? '<span class="sub">tạm tính, còn thiếu điểm</span>' : '');
  const rl = $('#hRuler'), sig = d.bands.map(b => b.label + b.min).join('|') + '|' + d.max;
  let built = false;
  if (rl.dataset.sig !== sig) { rl.innerHTML = rulerHTML(d.bands, d.max, d.step); rl.dataset.sig = sig; built = true; }
  const pin = $('.pin', rl);
  const place = () => { if (!pin) return; if (d.value === null) { pin.style.opacity = '0'; } else { pin.style.opacity = '1'; pin.style.left = Math.max(0, Math.min(100, d.value / d.max * 100)) + '%'; } };
  if (built && pin) { pin.style.left = '0%'; pin.style.opacity = '0'; requestAnimationFrame(() => requestAnimationFrame(place)); } else place();
  $('#hStats').innerHTML = d.stats.map(s => `<div class="stat"><span>${esc(s.k)}</span><b>${s.v}</b></div>`).join('');
  $('#hNote').textContent = d.note || '';
  const m = $('#mini'); m.style.setProperty('--tone', tone || 'var(--ink2)');
  $('#miniLab').textContent = d.mini; $('#miniVal').textContent = d.score;
}
let io;
function watchHero() {
  if (io) io.disconnect();
  const hero = $('#hero'), bar = $('#bar'), mini = $('#mini');
  if (!hero || !('IntersectionObserver' in window)) { mini.hidden = true; bar.classList.remove('stuck'); return; }
  io = new IntersectionObserver(([en]) => { const away = !en.isIntersecting; mini.hidden = !away; bar.classList.toggle('stuck', away); }, { rootMargin: '-70px 0px 0px 0px', threshold: 0 });
  io.observe(hero);
}

/* ================= Học sinh ================= */
const hsFoot = () => `<div class="goal"><label class="goal-row"><span>Mục tiêu điểm trung bình</span><input class="sc goal-in" data-f="target" inputmode="decimal" autocomplete="off" value="${esc(S.hs.target)}" aria-label="Mục tiêu điểm trung bình"></label><p class="goal-out" id="goalOut"></p></div>`;
const banner = () => S.sample ? `<div class="banner"><span>Đang hiển thị dữ liệu mẫu để bạn xem thử.</span><button type="button" class="btn sm" data-act="clearSample">Xóa dữ liệu mẫu</button></div>` : '';

function viewHS() {
  const h = S.hs;
  if (h.term === 'y') {
    return banner() + heroShell('') + `<section class="panel"><h3>Điểm từng môn</h3><div id="yearTbl"></div></section><section class="panel"><h3>So sánh giữa các môn</h3><div class="bars" id="bars"></div></section>`;
  }
  return banner() + heroShell(hsFoot()) + `<div class="list" id="list"></div><button type="button" class="add" data-act="addSub">${ico.plus}Thêm môn</button><section class="panel"><h3>So sánh giữa các môn</h3><div class="bars" id="bars"></div></section>`;
}
function subHTML(s) {
  const t = S.hs.term, d = s.t[t], cfg = L.hsCfg(S.hs.cfg);
  const box = (f, val, label, i) => `<input class="sc nav" data-f="${f}" data-s="${s.id}"${i === undefined ? '' : ` data-i="${i}"`} inputmode="decimal" enterkeyhint="next" autocomplete="off" spellcheck="false" value="${esc(val)}" placeholder="–" aria-label="${esc(label)}">`;
  const txs = d.tx.map((v, i) => box('tx', v, `Điểm thường xuyên ${i + 1}`, i)).join('');
  return `<article class="sub card" data-sid="${s.id}">
    <div class="sub-head">
      <input class="name-in nav" data-f="sname" data-s="${s.id}" value="${esc(s.name)}" placeholder="Tên môn" aria-label="Tên môn" autocomplete="off" enterkeyhint="next">
      <div class="avg tint" data-avg></div>
    </div>
    <div class="fields">
      <div class="fld tx"><span class="lab">Thường xuyên <em>×${trimNum(cfg.wTx)}</em></span><div class="tx-row">${txs}<button type="button" class="mini-btn" data-act="txAdd" data-s="${s.id}" aria-label="Thêm một ô điểm thường xuyên">+</button><button type="button" class="mini-btn" data-act="txDel" data-s="${s.id}" aria-label="Bớt một ô điểm thường xuyên">−</button></div></div>
      <div class="fld"><span class="lab">Giữa kỳ <em>×${trimNum(cfg.wGk)}</em></span>${box('gk', d.gk, 'Điểm giữa kỳ')}</div>
      <div class="fld"><span class="lab">Cuối kỳ <em>×${trimNum(cfg.wCk)}</em></span>${box('ck', d.ck, 'Điểm cuối kỳ')}</div>
    </div>
    <div class="hint" data-hint></div>
    <div class="sub-foot">
      <label class="w-lab">Hệ số môn<input class="sc w-in" data-f="sw" data-s="${s.id}" inputmode="decimal" autocomplete="off" value="${esc(s.w)}" aria-label="Hệ số của môn khi tính điểm trung bình chung"><span class="w-help">0 là không tính</span></label>
      <button type="button" class="icon-btn sm danger" data-act="delSub" data-s="${s.id}" aria-label="Xóa môn ${esc(s.name)}">${ico.trash}</button>
    </div>
  </article>`;
}
function hintHS(r, cfg, tgt) {
  if (tgt === null) return null;
  const nd = L.hsNeed(r, cfg, tgt); if (!nd) return null;
  const Tt = fmt(tgt, cfg.dec);
  const where = nd.miss.length === 2 ? 'ở cả giữa kỳ và cuối kỳ' : nd.miss[0] === 'gk' ? 'ở bài giữa kỳ' : 'ở bài cuối kỳ';
  if (nd.x <= 0) return { k: 'ok', h: `${ico.check}<span>Đã chắc chắn đạt ${Tt} cho môn này.</span>` };
  if (nd.x > 10) return { k: 'warn', h: `${ico.warn}<span>Khó đạt ${Tt}: dù được 10 điểm ${where}, môn này tối đa ${fmt(nd.max, cfg.dec)}.</span>` };
  return { k: '', h: `${ico.target}<span>Cần <b>từ ${fmt(L.up1(nd.x), 1)} trở lên</b> ${where} để đạt ${Tt}.</span>` };
}
function planAllHTML(p, tgt, d) {
  if (tgt === null) return 'Nhập mục tiêu để xem cần bao nhiêu điểm.';
  if (!p) return 'Nhập điểm các môn để xem cần bao nhiêu điểm.';
  const Tt = fmt(tgt, d);
  if (p.kind === 'final') { const a = fmt(L.round(p.avg, d), d); return p.ok ? `Đã đạt mục tiêu ${Tt} (hiện ${a}).` : `Chưa đạt mục tiêu ${Tt}: hiện ${a} và các môn đã đủ điểm.`; }
  if (p.x <= 0) return `Đã chắc chắn đạt ${Tt}, dù các bài còn lại bao nhiêu điểm.`;
  if (p.x > 10) return `Khó đạt ${Tt}: dù được 10 điểm ở mọi bài còn lại, điểm trung bình tối đa là ${fmt(L.round(p.max, d), d)}.`;
  return `Để đạt <b>${Tt}</b>, các bài còn lại cần trung bình <b>từ ${fmt(L.up1(p.x), 1)} trở lên</b>.`;
}
function barsHTML(items, bands, d, tgt) {
  const list = items.filter(i => i.v !== null).sort((a, b) => b.v - a.v);
  if (!list.length) return '<p class="empty">Nhập điểm để xem so sánh giữa các môn.</p>';
  return list.map(i => { const cl = L.classify(i.v, bands); return `<div class="brow"><span class="bn">${esc(i.name.trim() || 'Chưa đặt tên')}</span><div class="track"><i style="width:${Math.max(2, Math.min(100, i.v * 10))}%;background:var(--t-${cl.tone})"></i></div><b>${fmt(i.v, d)}</b></div>`; }).join('')
    + (tgt !== null ? `<p class="cap">Vạch đứng là mục tiêu ${fmt(tgt, d)}.</p>` : '');
}
function refreshHS() {
  const h = S.hs, cfg = L.hsCfg(h.cfg), bands = L.hsBands(cfg), t = h.term, d = cfg.dec;
  if (t === 'y') return refreshYear(cfg, bands);
  const tg = L.score(h.target), tgt = L.ok(tg) ? tg : null;
  const rows = h.subjects.map(s => ({ s, r: L.hsTerm(s, t, cfg), w: L.num(s.w, 1) }));
  rows.forEach(({ s, r }) => {
    const card = $(`.sub[data-sid="${s.id}"]`); if (!card) return;
    const cl = L.classify(r.avg, bands), av = $('[data-avg]', card);
    av.textContent = fmt(r.avg, d);
    av.style.setProperty('--tone', cl ? `var(--t-${cl.tone})` : 'var(--ink3)');
    av.classList.toggle('prov', r.avg !== null && !r.complete);
    av.title = r.avg !== null && !r.complete ? 'Tạm tính: môn này chưa đủ cột điểm' : '';
    let bad = false;
    $$('input.sc', card).forEach(inp => { const v = inp.dataset.f === 'sw' ? L.parse(inp.value) : L.score(inp.value); const b = Number.isNaN(v); inp.classList.toggle('bad', b); if (b) bad = true; });
    const he = $('[data-hint]', card), hv = bad ? { k: 'warn', h: `${ico.warn}<span>Có ô điểm chưa hợp lệ. Nhập số từ 0 đến 10, ví dụ 7.5 hoặc 7,5.</span>` } : hintHS(r, cfg, tgt);
    he.className = 'hint' + (hv && hv.k ? ' ' + hv.k : ''); he.innerHTML = hv ? hv.h : '';
  });
  const ov = L.hsOverall(rows.map(x => ({ v: x.r.avg, w: x.w, complete: x.r.complete })), d);
  const cl = L.classify(ov.avg, bands);
  const sc = rows.filter(x => x.r.avg !== null && x.w > 0);
  const hi = sc.reduce((a, x) => (!a || x.r.avg > a.r.avg) ? x : a, null), lo = sc.reduce((a, x) => (!a || x.r.avg < a.r.avg) ? x : a, null);
  const nm = x => esc(x.s.name.trim() || 'Chưa đặt tên');
  setHero({ eye: `Điểm trung bình học kỳ ${t}`, mini: `ĐTB HK${t}`, cl, prov: ov.prov && ov.avg !== null, score: fmt(ov.avg, d), value: ov.avg, max: 10, step: 1, bands,
    stats: [{ k: 'Môn đã có điểm', v: `${sc.length}/${rows.length}` }, { k: 'Cao nhất', v: hi ? `${nm(hi)} ${fmt(hi.r.avg, d)}` : '—' }, { k: 'Thấp nhất', v: lo && sc.length > 1 ? `${nm(lo)} ${fmt(lo.r.avg, d)}` : '—' }] });
  const go = $('#goalOut'); if (go) go.innerHTML = planAllHTML(L.hsPlanAll(rows.map(x => ({ r: x.r, w: x.w })), cfg, tgt), tgt, d);
  const bars = $('#bars');
  if (bars) { bars.innerHTML = barsHTML(rows.map(x => ({ name: x.s.name, v: x.r.avg })), bands, d, tgt); bars.classList.toggle('has-t', tgt !== null); bars.style.setProperty('--t', (tgt === null ? 0 : Math.min(100, tgt * 10)) + '%'); }
}
function refreshYear(cfg, bands) {
  const d = cfg.dec, rows = S.hs.subjects.map(s => ({ s, y: L.hsYear(s, cfg), w: L.num(s.w, 1) }));
  const ov = L.hsOverall(rows.map(x => ({ v: x.y.avg, w: x.w, complete: x.y.complete })), d);
  const o1 = L.hsOverall(rows.map(x => ({ v: x.y.t1.avg, w: x.w, complete: x.y.t1.complete })), d);
  const o2 = L.hsOverall(rows.map(x => ({ v: x.y.t2.avg, w: x.w, complete: x.y.t2.complete })), d);
  const cl = L.classify(ov.avg, bands);
  setHero({ eye: 'Điểm trung bình cả năm', mini: 'ĐTB cả năm', cl, prov: ov.prov && ov.avg !== null, score: fmt(ov.avg, d), value: ov.avg, max: 10, step: 1, bands,
    stats: [{ k: 'Học kỳ 1', v: fmt(o1.avg, d) }, { k: 'Học kỳ 2', v: fmt(o2.avg, d) }, { k: 'Môn đã có điểm', v: `${rows.filter(x => x.y.avg !== null && x.w > 0).length}/${rows.length}` }] });
  const cell = (v, prov, y) => { const c = L.classify(v, bands); return `<span class="v${y ? ' y' : ''}${prov && v !== null ? ' prov' : ''}" style="--tone:${c ? `var(--t-${c.tone})` : 'var(--ink3)'}">${fmt(v, d)}</span>`; };
  $('#yearTbl').innerHTML = rows.length
    ? `<div class="ytbl"><span class="h">Môn</span><span class="h">HK1</span><span class="h">HK2</span><span class="h">Cả năm</span>` + rows.map(x => `<span class="n">${esc(x.s.name.trim() || 'Chưa đặt tên')}</span>${cell(x.y.t1.avg, !x.y.t1.complete)}${cell(x.y.t2.avg, !x.y.t2.complete)}${cell(x.y.avg, !x.y.complete, true)}`).join('') + '</div>'
    : '<p class="empty">Chưa có môn nào. Chuyển sang Học kỳ 1 và bấm “Thêm môn”.</p>';
  $('#bars').innerHTML = barsHTML(rows.map(x => ({ name: x.s.name, v: x.y.avg })), bands, d, null);
}

/* ================= Sinh viên ================= */
function planPanel() {
  const bands = L.uniBands(S.uni.cfg);
  const chips = [[bands[2], 2], [bands[1], 1], [bands[0], 0]].map(([b]) => `<button type="button" class="chip" data-act="setTarget" data-v="${trimNum(b.min)}">${esc(b.label)} ${trimNum(b.min)}</button>`).join('');
  return `<section class="panel"><h3>Cần bao nhiêu điểm?</h3>
    <div class="plan-in">
      <label class="fld"><span class="lab">GPA mục tiêu</span><input class="sc" data-f="ptarget" inputmode="decimal" autocomplete="off" value="${esc(S.uni.plan.target)}"></label>
      <label class="fld"><span class="lab">Số tín chỉ còn lại</span><input class="sc" data-f="premain" inputmode="numeric" autocomplete="off" value="${esc(S.uni.plan.remain)}"></label>
    </div>
    <div class="chips">${chips}</div>
    <div class="plan-out" id="planOut"></div></section>`;
}
function viewUni() {
  const u = S.uni, t = curTerm();
  if (!t) {
    return banner() + heroShell('') + (u.terms.length
      ? `<section class="panel"><h3>GPA theo học kỳ</h3><div class="chart" id="chart"></div><div class="legend"><span><i class="d1"></i>GPA học kỳ</span><span><i class="d2"></i>GPA tích lũy</span></div></section><section class="panel"><h3>Các học kỳ</h3><div id="termTbl"></div></section>`
      : `<section class="panel"><p class="empty">Chưa có học kỳ nào. Thêm học kỳ đầu tiên, rồi nhập môn học và điểm.</p><button type="button" class="btn primary" data-act="addTerm">Thêm học kỳ</button></section>`) + planPanel();
  }
  return banner() + `<div class="termbar"><input class="tname" data-f="tname" value="${esc(t.name)}" placeholder="Tên học kỳ" aria-label="Tên học kỳ" autocomplete="off"><button type="button" class="icon-btn danger" data-act="delTerm" aria-label="Xóa học kỳ này">${ico.trash}</button></div>`
    + heroShell('') + `<div class="list" id="list"></div><button type="button" class="add" data-act="addCourse">${ico.plus}Thêm môn học</button>`;
}
function courseHTML(c) {
  const mode = S.uni.cfg.kb === 'decimal' ? 'decimal' : 'text';
  return `<article class="course card" data-cid="${c.id}">
    <div class="c-head">
      <input class="name-in nav" data-f="cname" data-c="${c.id}" value="${esc(c.name)}" placeholder="Tên môn học" aria-label="Tên môn học" autocomplete="off" enterkeyhint="next">
      <button type="button" class="icon-btn sm danger" data-act="delCourse" data-c="${c.id}" aria-label="Xóa môn ${esc(c.name)}">${ico.trash}</button>
    </div>
    <div class="c-grid">
      <label class="fld"><span class="lab">Tín chỉ</span><input class="sc nav" data-f="cr" data-c="${c.id}" inputmode="decimal" enterkeyhint="next" autocomplete="off" value="${esc(c.cr)}" placeholder="3"></label>
      <label class="fld"><span class="lab">Điểm hệ 10 hoặc điểm chữ</span><input class="sc nav" data-f="sc" data-c="${c.id}" inputmode="${mode}" enterkeyhint="next" autocomplete="off" spellcheck="false" value="${esc(c.sc)}" placeholder="8.5 hoặc B+"></label>
      <div class="grade" data-grade></div>
    </div>
    <div class="c-foot">
      <label class="chk"><input type="checkbox" data-f="on" data-c="${c.id}"${c.on !== false ? ' checked' : ''}>Tính vào GPA</label>
      <label class="chk"><input type="checkbox" data-f="rt" data-c="${c.id}"${c.rt ? ' checked' : ''}>Học lại hoặc cải thiện</label>
    </div>
    <p class="note" data-note></p>
  </article>`;
}
function planUniHTML(nd, tg, rm) {
  if (tg === null || rm === null || !(rm > 0) || !nd) return '<p class="muted">Nhập GPA mục tiêu và số tín chỉ còn lại để xem kết quả.</p>';
  const Tt = tg.toFixed(2);
  const range = `<p class="muted">Với ${trimNum(rm)} tín chỉ còn lại, GPA tích lũy cuối cùng sẽ nằm trong khoảng ${fmt(nd.worst, 2)} đến ${fmt(nd.best, 2)}.</p>`;
  if (nd.need <= 0) return `<p class="big ok">${ico.check}<span>Bạn đã chắc chắn đạt ${Tt}, dù các môn còn lại điểm thấp nhất.</span></p>${range}`;
  if (nd.need > nd.maxGp + 1e-9) return `<p class="big warn"><span>Không thể đạt ${Tt}: dù được điểm cao nhất ở mọi môn còn lại, GPA tích lũy tối đa là ${fmt(nd.best, 2)}.</span></p>`;
  const row = nd.letterRow;
  return `<p class="big"><span>Các môn còn lại cần đạt GPA trung bình <b>từ ${fmt(L.up2(nd.need), 2)} trở lên</b>${row ? `, tương đương điểm <b>${esc(row.l)}</b> (từ ${trimNum(row.min)} điểm hệ 10) ở mỗi môn` : ''}.</span></p>${range}`;
}
function drawChart(el, pts, hiMax) {
  const W = Math.max(280, Math.round(el.clientWidth) || 320), H = 220, pl = 34, pr = 16, pt = 20, pb = 30;
  const vals = []; pts.forEach(p => { if (p.a !== null) vals.push(p.a); if (p.b !== null) vals.push(p.b); });
  if (!vals.length) { el.innerHTML = '<p class="empty">Chưa có điểm nào để vẽ biểu đồ. Nhập điểm ở các học kỳ.</p>'; return; }
  const hi = hiMax, lo = Math.max(0, Math.floor((Math.min(...vals) - 0.4) * 2) / 2), span = hi - lo || 1;
  const X = i => pts.length === 1 ? pl + (W - pl - pr) / 2 : pl + (W - pl - pr) * i / (pts.length - 1);
  const Y = v => pt + (H - pt - pb) * (1 - (v - lo) / span), f1 = v => v.toFixed(1);
  const step = span > 2 ? 1 : 0.5;
  let g = '';
  for (let v = lo; v <= hi + 1e-9; v += step) g += `<line x1="${pl}" x2="${W - pr}" y1="${f1(Y(v))}" y2="${f1(Y(v))}" stroke="var(--line)"/><text x="${pl - 8}" y="${f1(Y(v) + 4)}" text-anchor="end">${trimNum(v)}</text>`;
  const path = key => { let d = '', pen = false; pts.forEach((p, i) => { if (p[key] === null) { pen = false; return; } d += `${pen ? 'L' : 'M'}${f1(X(i))} ${f1(Y(p[key]))} `; pen = true; }); return d; };
  const showAll = pts.length <= 6;
  const dots = (key, color, dy) => pts.map((p, i) => p[key] === null ? '' : `<circle cx="${f1(X(i))}" cy="${f1(Y(p[key]))}" r="4.2" fill="var(--card)" stroke="${color}" stroke-width="2.2"/>` + (showAll || i === pts.length - 1 ? `<text class="val" x="${f1(X(i))}" y="${f1(Y(p[key]) + dy)}" text-anchor="middle">${p[key].toFixed(2)}</text>` : '')).join('');
  const xl = pts.map((p, i) => `<text x="${f1(X(i))}" y="${H - 8}" text-anchor="middle">Kỳ ${i + 1}</text>`).join('');
  el.innerHTML = `<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="Biểu đồ GPA theo học kỳ">${g}<path d="${path('a')}" fill="none" stroke="var(--blue)" stroke-width="2" stroke-dasharray="5 4"/><path d="${path('b')}" fill="none" stroke="var(--ink)" stroke-width="2.6" stroke-linejoin="round" stroke-linecap="round"/>${dots('a', 'var(--blue)', 18)}${dots('b', 'var(--ink)', -10)}${xl}</svg>`;
}
function refreshUni() {
  const u = S.uni, scale = uniScale(), bands = L.uniBands(u.cfg), pol = u.cfg.retake, max = Math.max(1, ...scale.map(r => r.gp));
  const cumAll = L.cumList(u.terms, scale, pol), t = curTerm();
  if (!t) return refreshOverview({ u, scale, bands, pol, max, cumAll });
  const dropped = new Set(cumAll.dropped.map(x => x.id)), idx = u.terms.indexOf(t);
  const ta = L.agg(L.termList(t, scale)), cuma = L.agg(L.cumList(u.terms.slice(0, idx + 1), scale, pol).kept);
  let pending = false;
  t.courses.forEach(co => {
    const card = $(`.course[data-cid="${co.id}"]`); if (!card) return;
    const r = L.course(co, scale), g = r.g, gr = $('[data-grade]', card), note = $('[data-note]', card);
    const cl = g && !g.bad ? L.classify(g.gp, bands) : null;
    gr.style.setProperty('--tone', cl ? `var(--t-${cl.tone})` : 'var(--ink3)');
    gr.classList.toggle('tint', !!cl);
    gr.innerHTML = !g ? '<span class="muted">Chưa có điểm</span>' : g.bad ? '<span class="muted">Chưa hợp lệ</span>' : `<b>${esc(g.letter)}</b><span>${fmt(g.gp, 1)}</span>`;
    $('input[data-f="sc"]', card).classList.toggle('bad', !!(g && g.bad));
    $('input[data-f="cr"]', card).classList.toggle('bad', r.crBad);
    let msg = '';
    if (g && g.bad) msg = 'Nhập điểm từ 0 đến 10, hoặc điểm chữ có trong bảng quy đổi (ví dụ A, B+).';
    else if (r.crBad) msg = 'Số tín chỉ phải là số lớn hơn 0.';
    else if (g && r.cr === null) msg = 'Nhập số tín chỉ để môn này được tính vào GPA.';
    else if (dropped.has(co.id)) msg = 'Không tính vào GPA tích lũy vì môn này đã có lần học với điểm cao hơn.';
    note.textContent = msg; note.classList.toggle('warn', !!(g && g.bad) || r.crBad || (g && r.cr === null));
    if (co.name.trim() && !g) pending = true;
  });
  setHero({ eye: 'GPA học kỳ', mini: 'GPA học kỳ', cl: L.classify(ta.gpa, bands), prov: pending && ta.gpa !== null, score: fmt(ta.gpa, 2), suffix: `/ ${trimNum(max)}`, value: ta.gpa, max, step: 0.5, bands,
    stats: [{ k: 'GPA tích lũy', v: fmt(cuma.gpa, 2) }, { k: 'Tín chỉ học kỳ', v: ta.credits ? trimNum(ta.credits) : '—' }, { k: 'Điểm hệ 10', v: fmt(ta.avg10, 2) + (ta.avg10 !== null && ta.miss10 ? '*' : '') }],
    note: ta.avg10 !== null && ta.miss10 ? '* Chưa gồm các môn nhập bằng điểm chữ.' : '' });
}
function refreshOverview(c) {
  const { u, scale, bands, pol, max } = c, cum = L.agg(c.cumAll.kept);
  const pts = u.terms.map((t, k) => { const a = L.agg(L.termList(t, scale)); return { a: a.gpa, cr: a.credits, b: L.agg(L.cumList(u.terms.slice(0, k + 1), scale, pol).kept).gpa }; });
  setHero({ eye: 'GPA tích lũy', mini: 'GPA tích lũy', cl: L.classify(cum.gpa, bands), prov: false, score: fmt(cum.gpa, 2), suffix: `/ ${trimNum(max)}`, value: cum.gpa, max, step: 0.5, bands,
    stats: [{ k: 'Tín chỉ đạt', v: cum.earned ? trimNum(cum.earned) : '—' }, { k: 'Điểm hệ 10', v: fmt(cum.avg10, 2) + (cum.avg10 !== null && cum.miss10 ? '*' : '') }, { k: 'Số môn', v: String(cum.n) }],
    note: cum.avg10 !== null && cum.miss10 ? '* Chưa gồm các môn nhập bằng điểm chữ.' : '' });
  const ch = $('#chart'); if (ch) drawChart(ch, pts, max);
  const tt = $('#termTbl');
  if (tt) tt.innerHTML = `<div class="trow h"><span>Học kỳ</span><span class="c">Tín chỉ</span><span class="c">GPA kỳ</span><span class="c">Tích lũy</span></div>` + u.terms.map((t, k) => {
    const col = v => { const cl = L.classify(v, bands); return cl ? `var(--t-${cl.tone})` : 'var(--ink3)'; };
    return `<button type="button" class="trow" data-act="uniTab" data-v="${t.id}"><span class="n">${esc(t.name.trim() || 'Học kỳ ' + (k + 1))}</span><span class="c">${pts[k].cr ? trimNum(pts[k].cr) : '—'}</span><span class="c v" style="--tone:${col(pts[k].a)}">${fmt(pts[k].a, 2)}</span><span class="c v" style="--tone:${col(pts[k].b)}">${fmt(pts[k].b, 2)}</span></button>`;
  }).join('');
  const tg = L.num(u.plan.target, null), rm = L.num(u.plan.remain, null);
  const nd = tg !== null && rm !== null && rm > 0 ? L.uniNeed(cum, tg, rm, scale) : null;
  const po = $('#planOut'); if (po) po.innerHTML = planUniHTML(nd, tg, rm);
}

/* ================= Khung trang ================= */
function renderMode() { $$('#modeSeg button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.v === S.mode))); }
function renderTabs() {
  const el = $('#tabs');
  if (S.mode === 'hs') {
    el.setAttribute('aria-label', 'Học kỳ');
    el.innerHTML = [[1, 'Học kỳ 1'], [2, 'Học kỳ 2'], ['y', 'Cả năm']].map(([k, l]) => `<button type="button" class="tab" data-act="hsTerm" data-v="${k}" aria-pressed="${S.hs.term === k}">${l}</button>`).join('');
  } else {
    const u = S.uni;
    el.setAttribute('aria-label', 'Học kỳ');
    el.innerHTML = `<button type="button" class="tab" data-act="uniTab" data-v="all" aria-pressed="${u.tab === 'all'}">Tích lũy</button>`
      + u.terms.map((t, i) => `<button type="button" class="tab" data-act="uniTab" data-v="${t.id}" aria-pressed="${u.tab === t.id}">${esc(t.name.trim() || 'Học kỳ ' + (i + 1))}</button>`).join('')
      + `<button type="button" class="tab add-t" data-act="addTerm">+ Học kỳ</button>`;
  }
  const a = $('.tab[aria-pressed="true"]', el); if (a) el.scrollLeft = a.offsetLeft - (el.clientWidth - a.offsetWidth) / 2;
}
function renderList() {
  const el = $('#list'); if (!el) return;
  if (S.mode === 'hs') el.innerHTML = S.hs.subjects.length ? S.hs.subjects.map(subHTML).join('') : '<p class="empty">Chưa có môn nào. Bấm “Thêm môn” để bắt đầu.</p>';
  else { const t = curTerm(); el.innerHTML = t && t.courses.length ? t.courses.map(courseHTML).join('') : '<p class="empty">Học kỳ này chưa có môn nào. Bấm “Thêm môn học” để bắt đầu.</p>'; }
}
function refresh() { if (S.mode === 'hs') refreshHS(); else refreshUni(); }
function renderView() { $('#view').innerHTML = S.mode === 'hs' ? viewHS() : viewUni(); renderList(); refresh(); watchHero(); }
function renderAll() { renderMode(); renderTabs(); renderView(); }

/* ================= Thao tác ================= */
function focusEl(sel) { const el = $(sel); if (!el) return; el.focus(); try { el.scrollIntoView({ block: 'center', behavior: 'smooth' }); } catch (e) { /* bỏ qua */ } }
function toast(msg, undo) {
  const el = $('#toast'), host = document.querySelector('dialog[open]') || document.body;
  if (el.parentNode !== host) host.appendChild(el);
  el.innerHTML = `<span>${esc(msg)}</span>` + (undo ? '<button type="button" data-act="undo">Hoàn tác</button>' : '');
  el._undo = undo || null; el.hidden = false;
  clearTimeout(toast.t); toast.t = setTimeout(() => { el.hidden = true; el._undo = null; }, undo ? 6500 : 3200);
}
function addSub() {
  const s = mkSub('', blankT(), blankT()); S.hs.subjects.push(s);
  renderList(); refresh(); save(); focusEl(`input[data-f="sname"][data-s="${s.id}"]`);
}
function delSub(id) {
  const i = S.hs.subjects.findIndex(x => x.id === id); if (i < 0) return;
  const rm = S.hs.subjects.splice(i, 1)[0];
  renderList(); refresh(); save();
  toast(rm.name.trim() ? `Đã xóa “${rm.name.trim()}”` : 'Đã xóa môn', () => { S.hs.subjects.splice(i, 0, rm); renderList(); refresh(); save(); });
}
function txChange(id, dir) {
  const s = S.hs.subjects.find(x => x.id === id); if (!s) return;
  const tx = s.t[S.hs.term].tx;
  if (dir > 0) { if (tx.length >= 8) return; tx.push(''); } else { if (tx.length <= 1) return; tx.pop(); }
  renderList(); refresh(); save();
  if (dir > 0) focusEl(`input[data-f="tx"][data-s="${id}"][data-i="${tx.length - 1}"]`);
}
function addTerm() {
  const t = { id: uid(), name: 'Học kỳ ' + (S.uni.terms.length + 1), courses: [mkCourse('', 3, '')] };
  S.uni.terms.push(t); S.uni.tab = t.id; renderTabs(); renderView(); save();
  focusEl(`input[data-f="cname"][data-c="${t.courses[0].id}"]`);
}
function delTerm() {
  const i = S.uni.terms.findIndex(t => t.id === S.uni.tab); if (i < 0) return;
  const rm = S.uni.terms.splice(i, 1)[0]; S.uni.tab = 'all';
  renderTabs(); renderView(); save();
  toast(`Đã xóa ${rm.name.trim() || 'học kỳ'}`, () => { S.uni.terms.splice(i, 0, rm); S.uni.tab = rm.id; renderTabs(); renderView(); save(); });
}
function addCourse() {
  const t = curTerm(); if (!t) return;
  const c = mkCourse('', 3, ''); t.courses.push(c);
  renderList(); refresh(); save(); focusEl(`input[data-f="cname"][data-c="${c.id}"]`);
}
function delCourse(id) {
  const t = curTerm(); if (!t) return;
  const i = t.courses.findIndex(c => c.id === id); if (i < 0) return;
  const rm = t.courses.splice(i, 1)[0];
  renderList(); refresh(); save();
  toast(rm.name.trim() ? `Đã xóa “${rm.name.trim()}”` : 'Đã xóa môn học', () => { t.courses.splice(i, 0, rm); renderList(); refresh(); save(); });
}
function toggleTheme() {
  const dark = S.theme ? S.theme === 'dark' : !!(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
  S.theme = dark ? 'light' : 'dark'; applyTheme(); save();
}
function applyTheme() { const r = document.documentElement; if (S.theme) r.setAttribute('data-theme', S.theme); else r.removeAttribute('data-theme'); }

/* ----- hộp thoại cài đặt ----- */
const nf = (g, k, label, val, i) => `<label class="fld"><span class="lab">${label}</span><input class="sc" data-g="${g}" data-k="${k}"${i === undefined ? '' : ` data-i="${i}"`} inputmode="decimal" autocomplete="off" value="${esc(val)}"></label>`;
const sel = (g, k, val, opts) => `<select class="sel" data-g="${g}" data-k="${k}">${opts.map(([v, l]) => `<option value="${v}"${String(val) === String(v) ? ' selected' : ''}>${l}</option>`).join('')}</select>`;
function cfgHS() {
  const c = S.hs.cfg, names = c.style === 'tt22' ? ['Tốt', 'Khá', 'Đạt'] : ['Giỏi', 'Khá', 'Trung bình', 'Yếu'];
  return `<section class="cfg"><h3>Hệ số điểm trong một học kỳ</h3>
      <div class="grid3">${nf('hs', 'wTx', 'Thường xuyên', c.wTx)}${nf('hs', 'wGk', 'Giữa kỳ', c.wGk)}${nf('hs', 'wCk', 'Cuối kỳ', c.wCk)}</div>
      <p class="note">Mặc định 1, 2, 3 theo Thông tư 22/2021/TT-BGDĐT. Trường bạn dùng hệ số khác thì sửa ở đây.</p></section>
    <section class="cfg"><h3>Hệ số học kỳ khi tính cả năm</h3>
      <div class="grid2">${nf('hs', 'wY1', 'Học kỳ 1', c.wY1)}${nf('hs', 'wY2', 'Học kỳ 2', c.wY2)}</div>
      <p class="note">Mặc định 1 và 2, tức là điểm cả năm = (HK1 + 2 × HK2) / 3.</p></section>
    <section class="cfg"><h3>Làm tròn điểm trung bình</h3>${sel('hs', 'dec', c.dec, [['1', '1 chữ số thập phân (theo quy chế)'], ['2', '2 chữ số thập phân']])}</section>
    <section class="cfg"><h3>Xếp loại</h3>${sel('hs', 'style', c.style, [['old', 'Giỏi, Khá, Trung bình, Yếu, Kém'], ['tt22', 'Tốt, Khá, Đạt, Chưa đạt']])}
      <div class="grid4">${names.map((n, i) => nf('hs', 'cut', `${n} từ`, c.cuts[i], i)).join('')}</div>
      <p class="note">Xếp loại ở đây chỉ dựa vào điểm trung bình. Quy định đầy đủ, ví dụ điều kiện theo từng môn, tùy trường.</p></section>
    <section class="cfg"><button type="button" class="btn" data-act="resetCfg">Khôi phục cài đặt mặc định</button></section>`;
}
function cfgUni() {
  const c = S.uni.cfg, names = ['Xuất sắc', 'Giỏi', 'Khá', 'Trung bình', 'Yếu'];
  const rows = c.scale.map((r, i) => `<div class="srow"><input class="sc" data-g="scale" data-k="l" data-i="${i}" value="${esc(r.l)}" autocomplete="off" aria-label="Điểm chữ"><input class="sc" data-g="scale" data-k="min" data-i="${i}" inputmode="decimal" value="${esc(r.min)}" autocomplete="off" aria-label="Từ điểm hệ 10"><input class="sc" data-g="scale" data-k="gp" data-i="${i}" inputmode="decimal" value="${esc(r.gp)}" autocomplete="off" aria-label="Điểm thang 4"><button type="button" class="icon-btn sm danger" data-act="scaleDel" data-i="${i}" aria-label="Xóa dòng ${esc(r.l)}">${ico.close}</button></div>`).join('');
  return `<section class="cfg"><h3>Bảng quy đổi điểm</h3>
      <div class="srow h"><span>Điểm chữ</span><span>Từ (hệ 10)</span><span>Thang 4</span><span></span></div>${rows}
      <div class="row-btns"><button type="button" class="btn sm" data-act="scaleAdd">Thêm dòng</button><button type="button" class="btn sm" data-act="scaleReset">Dùng bảng mặc định</button></div>
      <p class="note">Bảng mặc định là bảng phổ biến ở nhiều trường. Mỗi trường có thể khác, nên hãy đối chiếu với quy chế của trường bạn. Điểm hệ 10 được làm tròn 1 chữ số thập phân trước khi quy đổi.</p></section>
    <section class="cfg"><h3>Xếp loại theo GPA</h3><div class="grid4">${names.map((n, i) => nf('uni', 'cut', `${n} từ`, c.cuts[i], i)).join('')}</div></section>
    <section class="cfg"><h3>Môn học lại hoặc cải thiện</h3>${sel('uni', 'retake', c.retake, [['best', 'GPA tích lũy lấy lần có điểm cao nhất'], ['last', 'GPA tích lũy lấy lần học cuối']])}
      <p class="note">Các lần học được ghép theo tên môn. Hãy gõ tên môn giống nhau và đánh dấu “Học lại hoặc cải thiện”.</p></section>
    <section class="cfg"><h3>Bàn phím khi nhập điểm</h3>${sel('uni', 'kb', c.kb, [['text', 'Chữ và số (nhập được B+, A)'], ['decimal', 'Chỉ số (nhập nhanh điểm hệ 10)']])}</section>
    <section class="cfg"><button type="button" class="btn" data-act="resetCfg">Khôi phục cài đặt mặc định</button></section>`;
}
function renderCfg() {
  const hs = S.mode === 'hs';
  $('#cfgTitle').textContent = hs ? 'Cài đặt cho học sinh' : 'Cài đặt cho sinh viên';
  $('#cfgBody').innerHTML = hs ? cfgHS() : cfgUni();
}
const rerender = debounce(() => { renderTabs(); renderView(); }, 180);
function onCfg(t, g) {
  const k = t.dataset.k, i = +t.dataset.i;
  if (g === 'hs' || g === 'uni') { const c = S[g].cfg; if (k === 'cut') c.cuts[i] = t.value; else c[k] = t.value; }
  else if (g === 'scale') S.uni.cfg.scale[i][k] = t.value;
  else if (g === 'exp') { S.sep = t.value === '.' ? '.' : ','; save(); return; }
  save(); rerender();
  if (g === 'hs' && k === 'style') renderCfg();
}

/* ----- nhập / xuất ----- */
let DL = null;
function renderData() {
  const hs = S.mode === 'hs', yearTab = hs && S.hs.term === 'y';
  const tm = curTerm(), where = hs ? `Học kỳ ${S.hs.term}` : (S.uni.tab !== 'all' && tm ? (tm.name.trim() || 'học kỳ này') : (S.uni.terms.length ? S.uni.terms[S.uni.terms.length - 1].name.trim() || 'học kỳ cuối' : 'học kỳ mới'));
  const guide = hs
    ? 'Mỗi dòng một môn: <b>tên môn</b>, các điểm thường xuyên, rồi <b>giữa kỳ</b> và <b>cuối kỳ</b>. Cột cách nhau bằng Tab (dán từ Excel hoặc Google Sheets), dấu chấm phẩy hoặc dấu phẩy. Môn đã có sẽ được cập nhật theo tên.'
    : 'Mỗi dòng một môn: <b>tên môn</b>, <b>số tín chỉ</b>, <b>điểm</b> (hệ 10 hoặc điểm chữ). Dán từ Excel, Google Sheets hoặc tệp CSV.';
  const ph = hs ? 'Toán\t8\t9\t7.5\t8.5\t9' : 'Giải tích 1\t3\t8.5';
  $('#dataBody').innerHTML = `<section class="cfg"><h3>Nhập nhanh từ bảng tính</h3><p class="note" style="margin-top:0">${guide}</p>
      ${yearTab ? '<p class="note warn">Chuyển sang Học kỳ 1 hoặc Học kỳ 2 để nhập điểm.</p>' : ''}
      <textarea id="impText" rows="5" placeholder="${esc(ph)}" aria-label="Dữ liệu cần nhập"${yearTab ? ' disabled' : ''}></textarea>
      <div class="row-btns"><label class="btn file">Chọn tệp CSV<input type="file" id="impFile" accept=".csv,.tsv,.txt,text/csv,text/plain"></label><button type="button" class="btn primary" data-act="doImport"${yearTab ? ' disabled' : ''}>Thêm vào ${esc(where)}</button></div></section>
    <section class="cfg"><h3>Xuất bảng điểm</h3>
      <div class="row-btns" style="margin-top:0"><button type="button" class="btn primary" data-act="doXlsx"${DL ? '' : ' hidden'}>Tải tệp Excel</button><button type="button" class="btn" data-act="doCopy">Sao chép bảng</button></div>
      <label class="fld" style="display:block;margin-top:12px"><span class="lab">Dấu thập phân khi sao chép</span>${sel('exp', 'sep', S.sep, [[',', 'Dấu phẩy (8,5) cho Excel tiếng Việt'], ['.', 'Dấu chấm (8.5)']])}</label>
      <p class="note">Tệp Excel lưu điểm dưới dạng số nên mở được ở mọi cài đặt ngôn ngữ.</p></section>
    <section class="cfg"><button type="button" class="btn danger" data-act="resetAll">Xóa toàn bộ dữ liệu</button><p class="note">Xóa hết điểm và cài đặt đã lưu trên thiết bị này.</p></section>`;
}
function openDlg(id) {
  const d = $('#' + id);
  if (id === 'dlgCfg') renderCfg(); else renderData();
  document.documentElement.classList.add('lock');
  if (typeof d.showModal === 'function') { if (!d.open) d.showModal(); } else d.setAttribute('open', '');
}
function exportTable() {
  const numOr = v => { const n = L.score(v); return L.ok(n) ? n : ''; };
  if (S.mode === 'hs') {
    const cfg = L.hsCfg(S.hs.cfg), d = cfg.dec, t = S.hs.term, subs = S.hs.subjects;
    if (t === 'y') {
      const ys = subs.map(s => ({ s, y: L.hsYear(s, cfg), w: L.num(s.w, 1) }));
      const ov = f => L.hsOverall(ys.map(x => ({ v: f(x.y), w: x.w, complete: true })), d).avg;
      const rows = [['Môn', 'ĐTB học kỳ 1', 'ĐTB học kỳ 2', 'ĐTB cả năm']];
      ys.forEach(x => rows.push([x.s.name, x.y.t1.avg, x.y.t2.avg, x.y.avg]));
      rows.push(['Điểm trung bình các môn', ov(y => y.t1.avg), ov(y => y.t2.avg), ov(y => y.avg)]);
      return { rows, name: 'Cả năm', file: 'so-diem-ca-nam.xlsx' };
    }
    const nTx = Math.max(1, ...subs.map(s => s.t[t].tx.filter(v => L.ok(L.score(v))).length));
    const head = ['Môn']; for (let i = 1; i <= nTx; i++) head.push('Thường xuyên ' + i); head.push('Giữa kỳ', 'Cuối kỳ', 'ĐTB môn');
    const rows = [head], items = [];
    subs.forEach(s => {
      const dd = s.t[t], r = L.hsTerm(s, t, cfg), tx = dd.tx.map(numOr).filter(v => v !== '');
      const row = [s.name]; for (let i = 0; i < nTx; i++) row.push(tx[i] === undefined ? '' : tx[i]);
      row.push(numOr(dd.gk), numOr(dd.ck), r.avg === null ? '' : r.avg); rows.push(row); items.push({ v: r.avg, w: L.num(s.w, 1), complete: true });
    });
    const o = L.hsOverall(items, d); const last = ['Điểm trung bình học kỳ']; for (let i = 0; i < nTx + 2; i++) last.push(''); last.push(o.avg === null ? '' : o.avg); rows.push(last);
    return { rows, name: 'Học kỳ ' + t, file: `so-diem-hk${t}.xlsx` };
  }
  const scale = uniScale(), rows = [['Học kỳ', 'Môn học', 'Tín chỉ', 'Điểm hệ 10', 'Điểm chữ', 'Thang 4', 'Tính vào GPA', 'Học lại hoặc cải thiện']];
  S.uni.terms.forEach((tm, k) => tm.courses.forEach(c => {
    if (!c.name.trim() && !String(c.sc).trim()) return;
    const r = L.course(c, scale), g = r.g && !r.g.bad ? r.g : null, n10 = g && g.s10 !== null ? g.s10 : '';
    rows.push([tm.name.trim() || 'Học kỳ ' + (k + 1), c.name, r.cr === null ? '' : r.cr, n10, g ? g.letter : '', g ? g.gp : '', c.on === false ? 'Không' : 'Có', c.rt ? 'Có' : '']);
  }));
  const cum = L.agg(L.cumList(S.uni.terms, scale, S.uni.cfg.retake).kept);
  rows.push(['', '', '', '', '', '', '', ''], ['GPA tích lũy', '', '', '', '', cum.gpa === null ? '' : cum.gpa, '', ''], ['Tín chỉ đạt', '', cum.earned || '', '', '', '', '', '']);
  return { rows, name: 'Bảng điểm', file: 'so-diem-sinh-vien.xlsx' };
}
const toTSV = rows => rows.map(r => r.map(v => v === null || v === undefined || v === '' ? '' : typeof v === 'number' ? String(v).replace('.', S.sep) : String(v).replace(/[\t\r\n]+/g, ' ')).join('\t')).join('\n');
async function copyText(t) {
  try { await navigator.clipboard.writeText(t); return true; } catch (e) { /* thử cách khác */ }
  try { const ta = document.createElement('textarea'); ta.value = t; ta.style.cssText = 'position:fixed;left:-9999px;top:0'; (document.querySelector('dialog[open]') || document.body).appendChild(ta); ta.select(); const r = document.execCommand('copy'); ta.remove(); return r; } catch (e) { return false; }
}
async function doCopy() { const ok = await copyText(toTSV(exportTable().rows)); toast(ok ? 'Đã sao chép. Dán vào Excel hoặc Google Sheets.' : 'Không sao chép được. Hãy thử tải tệp Excel.'); }
async function doXlsx() {
  if (!DL) return;
  const { rows, name, file } = exportTable();
  try { await DL.save({ filename: file, data: L.xlsx(rows, name) }); toast('Đã gửi tệp Excel để lưu.'); }
  catch (e) { if (e && e.code === 'declined') return; toast('Không lưu được tệp. Hãy thử “Sao chép bảng”.'); }
}
function doImport() {
  const txt = ($('#impText') || {}).value || '';
  if (!txt.trim()) { toast('Chưa có dữ liệu. Dán bảng điểm vào ô nhập.'); return; }
  let n = 0;
  if (S.mode === 'hs') {
    if (S.hs.term === 'y') return;
    const term = S.hs.term;
    L.parseHS(txt).forEach(it => {
      let sub = S.hs.subjects.find(s => L.norm(s.name) === L.norm(it.name));
      if (!sub) { sub = mkSub(it.name, blankT(), blankT()); S.hs.subjects.push(sub); }
      sub.t[term] = { tx: it.tx.length ? it.tx.slice() : ['', '', ''], gk: it.gk, ck: it.ck }; n++;
    });
  } else {
    let t = S.uni.tab !== 'all' ? curTerm() : S.uni.terms[S.uni.terms.length - 1];
    if (!t) { t = { id: uid(), name: 'Học kỳ 1', courses: [] }; S.uni.terms.push(t); }
    S.uni.tab = t.id;
    if (t.courses.length === 1 && !t.courses[0].name.trim() && !String(t.courses[0].sc).trim()) t.courses = [];
    L.parseUni(txt).forEach(it => { t.courses.push(mkCourse(it.name, it.cr, it.sc)); n++; });
  }
  if (!n) { toast('Không đọc được dòng nào. Kiểm tra thứ tự cột như hướng dẫn.'); return; }
  $('#dlgData').close(); renderTabs(); renderView(); save();
  toast(`Đã thêm ${n} môn.`);
}

/* ================= Sự kiện ================= */
function onInput(e) {
  const t = e.target; if (!t || !t.dataset) return;
  if (t.dataset.g) return onCfg(t, t.dataset.g);
  const f = t.dataset.f; if (!f) return;
  const sub = t.dataset.s ? S.hs.subjects.find(x => x.id === t.dataset.s) : null;
  const tm = curTerm(), co = t.dataset.c && tm ? tm.courses.find(x => x.id === t.dataset.c) : null;
  if (sub) {
    const d = sub.t[S.hs.term];
    if (f === 'sname') sub.name = t.value; else if (f === 'tx') d.tx[+t.dataset.i] = t.value; else if (f === 'gk') d.gk = t.value; else if (f === 'ck') d.ck = t.value; else if (f === 'sw') sub.w = t.value;
  } else if (co) {
    if (f === 'cname') co.name = t.value; else if (f === 'cr') co.cr = t.value; else if (f === 'sc') co.sc = t.value; else if (f === 'on') co.on = t.checked; else if (f === 'rt') co.rt = t.checked;
  } else if (f === 'target') S.hs.target = t.value;
  else if (f === 'tname' && tm) { tm.name = t.value; renderTabs(); }
  else if (f === 'ptarget') S.uni.plan.target = t.value;
  else if (f === 'premain') S.uni.plan.remain = t.value;
  else return;
  refresh(); save();
}
function onClick(e) {
  const b = e.target.closest('[data-act]'); if (!b) return;
  const a = b.dataset.act, v = b.dataset.v;
  switch (a) {
    case 'mode': S.mode = v; renderAll(); save(); break;
    case 'hsTerm': S.hs.term = v === 'y' ? 'y' : +v; renderTabs(); renderView(); save(); break;
    case 'uniTab': S.uni.tab = v; renderTabs(); renderView(); save(); window.scrollTo({ top: 0 }); break;
    case 'addTerm': addTerm(); break;
    case 'delTerm': delTerm(); break;
    case 'addSub': addSub(); break;
    case 'delSub': delSub(b.dataset.s); break;
    case 'txAdd': txChange(b.dataset.s, 1); break;
    case 'txDel': txChange(b.dataset.s, -1); break;
    case 'addCourse': addCourse(); break;
    case 'delCourse': delCourse(b.dataset.c); break;
    case 'setTarget': { S.uni.plan.target = v; const el = $('input[data-f="ptarget"]'); if (el) el.value = v; refresh(); save(); break; }
    case 'undo': { const el = $('#toast'), fn = el._undo; el.hidden = true; el._undo = null; if (fn) fn(); break; }
    case 'close': { const d = b.closest('dialog'); if (d) d.close(); break; }
    case 'openCfg': openDlg('dlgCfg'); break;
    case 'openData': openDlg('dlgData'); break;
    case 'theme': toggleTheme(); break;
    case 'clearSample': wipe(); renderTabs(); renderView(); save(); toast('Đã xóa dữ liệu mẫu.'); break;
    case 'resetCfg': if (S.mode === 'hs') S.hs.cfg = defHs(); else S.uni.cfg = defUni(); save(); renderCfg(); renderTabs(); renderView(); break;
    case 'scaleAdd': S.uni.cfg.scale.push({ l: '', min: '', gp: '' }); save(); renderCfg(); break;
    case 'scaleDel': if (S.uni.cfg.scale.length > 1) { S.uni.cfg.scale.splice(+b.dataset.i, 1); save(); renderCfg(); rerender(); } break;
    case 'scaleReset': S.uni.cfg.scale = defScale(); save(); renderCfg(); rerender(); break;
    case 'doImport': doImport(); break;
    case 'doCopy': doCopy(); break;
    case 'doXlsx': doXlsx(); break;
    case 'resetAll':
      if (b.dataset.armed) {
        const th = S.theme, md = S.mode;
        try { localStorage.removeItem(KEY); } catch (er) { /* bỏ qua */ }
        S = fresh(); wipe(); S.theme = th; S.mode = md; applyTheme(); save();
        $('#dlgData').close(); renderAll(); toast('Đã xóa toàn bộ dữ liệu.');
      } else {
        b.dataset.armed = '1'; b.textContent = 'Bấm lần nữa để xóa hết';
        setTimeout(() => { if (b.isConnected) { delete b.dataset.armed; b.textContent = 'Xóa toàn bộ dữ liệu'; } }, 4000);
      }
      break;
    default: break;
  }
}
document.addEventListener('input', onInput);
document.addEventListener('change', e => {
  if (e.target && e.target.id === 'impFile') { const f = e.target.files && e.target.files[0]; if (f && f.text) f.text().then(txt => { const ta = $('#impText'); if (ta) ta.value = txt; }); return; }
  onInput(e);
});
document.addEventListener('click', onClick);
document.addEventListener('focusin', e => { const t = e.target; if (t && t.matches && t.matches('input.sc:not([data-g])')) setTimeout(() => { try { t.select(); } catch (er) { /* bỏ qua */ } }, 0); });
document.addEventListener('keydown', e => {
  if (e.key !== 'Enter' || !e.target.matches || !e.target.matches('input.nav')) return;
  e.preventDefault();
  const list = $$('#list input.nav'), i = list.indexOf(e.target);
  if (i >= 0 && i < list.length - 1) { list[i + 1].focus(); } else if (i === list.length - 1) { if (S.mode === 'hs') addSub(); else addCourse(); }
});
$$('dialog').forEach(d => {
  d.addEventListener('click', e => { if (e.target === d) d.close(); });
  d.addEventListener('close', () => document.documentElement.classList.remove('lock'));
});
window.addEventListener('resize', debounce(() => { if ($('#chart')) refresh(); }, 150));

/* ================= Khởi động ================= */
$$('[data-ico]').forEach(el => { el.innerHTML = ico[el.dataset.ico] || ''; });
(function boot() {
  const saved = load();
  S = saved ? normalize(saved) : fresh();
  applyTheme(); renderAll();
  (async () => {
    try { if (window.claude && typeof window.claude.use === 'function') DL = await window.claude.use('downloads'); } catch (e) { DL = null; }
    if (DL && $('#dlgData').open) renderData();
  })();
})();
