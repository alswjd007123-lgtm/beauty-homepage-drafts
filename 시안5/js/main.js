// 시안5 · 루미 래쉬
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const SVG_NS = 'http://www.w3.org/2000/svg';

// 모바일 슬라이드 메뉴
const menuBtn = document.querySelector('.menu-btn');
function setMenu(open) {
  document.body.classList.toggle('open', open);
  menuBtn.setAttribute('aria-expanded', open);
  menuBtn.setAttribute('aria-label', open ? '메뉴 닫기' : '메뉴 열기');
}
menuBtn.addEventListener('click', () => setMenu(!document.body.classList.contains('open')));
document.querySelector('.m-dim').addEventListener('click', () => setMenu(false));
document.querySelectorAll('.m-nav a').forEach(a => a.addEventListener('click', () => setMenu(false)));

// 등장 애니메이션
const io = new IntersectionObserver(entries => entries.forEach(e => {
  if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
}), { threshold: 0.15 });
document.querySelectorAll('.rv').forEach(el => io.observe(el));

/* ---------------------------------------------------------
   나만의 스타일 찾기
   눈매 모양(EYES)과 분위기에 따라 추천(REC)을 고르고,
   SVG로 눈과 속눈썹을 그려 미리 보여준다.
   --------------------------------------------------------- */
const EYES = {
  round: { name: '둥근 눈', inner: [80, 105], outer: [240, 105], up: 35, low: 150, crease: true },
  long:  { name: '가로로 긴 눈', inner: [48, 105], outer: [272, 105], up: 62, low: 134, crease: true },
  down:  { name: '처진 눈', inner: [62, 94], outer: [258, 120], up: 50, low: 142, crease: true },
  up:    { name: '올라간 눈', inner: [62, 114], outer: [258, 86], up: 48, low: 142, crease: true },
  mono:  { name: '홑꺼풀·속쌍', inner: [62, 106], outer: [258, 102], up: 60, low: 136, crease: false }
};
// 길이 분포: t는 눈 앞머리(0)에서 꼬리(1)까지
const PROFILE = {
  cat: t => 0.55 + 0.6 * t,
  doll: t => 0.6 + 0.45 * Math.sin(Math.PI * t),
  lift: t => 0.6 + 0.55 * Math.pow(t, 1.6),
  soft: t => 0.72 + 0.25 * Math.sin(Math.PI * t)
};
const CURL = { 'J컬': 0.12, 'C컬': 0.3, 'CC컬': 0.42, 'D컬': 0.52, 'L컬': 0.66 };
const MOOD = {
  natural: { count: '100–120가닥', lashes: 34, base: 36, width: 2 },
  clear:   { count: '140–160가닥', lashes: 48, base: 42, width: 1.7 },
  glam:    { count: '3D 볼륨 300모', lashes: 76, base: 48, width: 1.2 }
};
const REC = {
  round: { profile: 'cat', tip: '눈꼬리 쪽으로 갈수록 길이를 늘려 둥근 눈매를 가로로 길어 보이게 해요.',
    natural: ['캣아이 내추럴', 'J컬', '9–11mm'], clear: ['캣아이 클리어', 'C컬', '10–12mm'], glam: ['볼륨 캣아이', 'CC컬', '10–13mm'] },
  long: { profile: 'doll', tip: '가운데를 가장 길게 올려 세로 폭을 키우고 눈을 동그랗게 보이게 해요.',
    natural: ['돌 아이 내추럴', 'J컬', '9–11mm'], clear: ['돌 아이', 'C컬', '10–12mm'], glam: ['볼륨 돌 아이', 'D컬', '10–13mm'] },
  down: { profile: 'lift', tip: '눈꼬리 끝을 컬이 강한 가닥으로 올려 처진 인상을 밝게 정리해요.',
    natural: ['업 포인트 내추럴', 'C컬', '9–11mm'], clear: ['리프트 아웃', 'CC컬', '10–12mm'], glam: ['볼륨 업 포인트', 'D컬', '10–13mm'] },
  up: { profile: 'soft', tip: '길이를 고르게 두고 컬을 부드럽게 잡아 올라간 눈꼬리를 순하게 보이게 해요.',
    natural: ['소프트 라운드', 'J컬', '8–10mm'], clear: ['라운드', 'C컬', '9–11mm'], glam: ['볼륨 라운드', 'C컬', '10–12mm'] },
  mono: { profile: 'doll', tip: '꺾임이 큰 L컬로 눈꺼풀 위까지 속눈썹이 보이게 하고, 길이는 짧게 잡아 무게를 줄여요.',
    natural: ['선명 컬 내추럴', 'L컬', '8–10mm'], clear: ['선명 컬 클리어', 'L컬', '9–11mm'], glam: ['볼륨 선명 컬', 'L컬', '9–12mm'] }
};

const el = (tag, attrs) => {
  const n = document.createElementNS(SVG_NS, tag);
  for (const k in attrs) n.setAttribute(k, attrs[k]);
  return n;
};
// 위 눈꺼풀 베지어 곡선의 점과 기울기
function lidPoint(e, t) {
  const [x0, y0] = e.inner, [x3, y3] = e.outer;
  const x1 = x0 + 40, y1 = e.up, x2 = x3 - 40, y2 = e.up, u = 1 - t;
  return {
    x: u*u*u*x0 + 3*u*u*t*x1 + 3*u*t*t*x2 + t*t*t*x3,
    y: u*u*u*y0 + 3*u*u*t*y1 + 3*u*t*t*y2 + t*t*t*y3,
    dx: 3*u*u*(x1-x0) + 6*u*t*(x2-x1) + 3*t*t*(x3-x2),
    dy: 3*u*u*(y1-y0) + 6*u*t*(y2-y1) + 3*t*t*(y3-y2)
  };
}
function drawEye(svg, type, opt) {
  const e = EYES[type];
  svg.textContent = '';
  const [ix, iy] = e.inner, [ox, oy] = e.outer;
  const upper = `M${ix} ${iy} C${ix+40} ${e.up} ${ox-40} ${e.up} ${ox} ${oy}`;
  const shape = `${upper} C${ox-40} ${e.low} ${ix+40} ${e.low} ${ix} ${iy}Z`;
  const id = 'clip' + Math.random().toString(36).slice(2, 7);
  const defs = el('defs', {});
  const cp = el('clipPath', { id });
  cp.appendChild(el('path', { d: shape }));
  defs.appendChild(cp);
  svg.appendChild(defs);
  if (e.crease) svg.appendChild(el('path', { d: `M${ix+18} ${iy-14} C${ix+50} ${e.up-18} ${ox-50} ${e.up-18} ${ox-8} ${oy-16}`, fill: 'none', stroke: '#c9b9e6', 'stroke-width': 2, 'stroke-linecap': 'round' }));
  svg.appendChild(el('path', { d: shape, fill: '#fff', stroke: '#2e2542', 'stroke-width': 2.4 }));
  const g = el('g', { 'clip-path': `url(#${id})` });
  const cx = (ix + ox) / 2, cy = (iy + oy) / 2 - 2;
  g.appendChild(el('circle', { cx, cy, r: 31, fill: '#6b558f' }));
  g.appendChild(el('circle', { cx, cy, r: 14, fill: '#2e2542' }));
  g.appendChild(el('circle', { cx: cx + 9, cy: cy - 10, r: 6, fill: '#fff', opacity: .9 }));
  svg.appendChild(g);
  // 속눈썹
  const n = opt.lashes, prof = PROFILE[opt.profile], k = opt.curl;
  const lashes = el('g', { stroke: '#2e2542', 'stroke-width': opt.width, 'stroke-linecap': 'round', fill: 'none' });
  for (let i = 0; i < n; i++) {
    const t = 0.06 + 0.91 * (i / (n - 1));
    const p = lidPoint(e, t);
    let a = Math.atan2(-p.dx, p.dy); // 곡선의 법선
    if (Math.sin(a) > 0) a += Math.PI; // 위쪽을 향하도록
    const vary = opt.lashes > 60 ? (i % 3 === 0 ? 1 : 0.82) : 1; // 볼륨은 길이를 섞음
    const L = opt.base * prof(t) * vary;
    const lean = (t - 0.5) * 0.9;
    let end = a + lean;
    end += (-Math.PI / 2 - end) * k;
    const c = { x: p.x + Math.cos(a) * L * 0.55, y: p.y + Math.sin(a) * L * 0.55 };
    const q = { x: p.x + Math.cos(end) * L, y: p.y + Math.sin(end) * L };
    lashes.appendChild(el('path', { class: 'lash', d: `M${p.x.toFixed(1)} ${p.y.toFixed(1)} Q${c.x.toFixed(1)} ${c.y.toFixed(1)} ${q.x.toFixed(1)} ${q.y.toFixed(1)}` }));
  }
  svg.appendChild(lashes);
}

// 눈매 선택지 만들기
const eyeOpts = document.getElementById('eyeOpts');
Object.keys(EYES).forEach((type, i) => {
  const label = document.createElement('label');
  label.innerHTML = `<input type="radio" name="eye" value="${type}" ${i === 0 ? 'checked' : ''}><span></span>`;
  const span = label.querySelector('span');
  const icon = document.createElementNS(SVG_NS, 'svg');
  icon.setAttribute('viewBox', '30 10 260 150');
  icon.setAttribute('aria-hidden', 'true');
  drawEye(icon, type, { lashes: 12, profile: 'soft', curl: 0.3, base: 26, width: 3 });
  span.append(icon, EYES[type].name);
  eyeOpts.appendChild(label);
});

const preview = document.getElementById('preview');
const $ = id => document.getElementById(id);
const out = { name: $('rName'), curl: $('rCurl'), len: $('rLen'), count: $('rCount'), tip: $('rTip') };
function updateFinder() {
  const type = document.querySelector('input[name="eye"]:checked').value;
  const mood = document.querySelector('input[name="mood"]:checked').value;
  const rec = REC[type], [name, curl, len] = rec[mood], m = MOOD[mood];
  drawEye(preview, type, { lashes: m.lashes, profile: rec.profile, curl: CURL[curl], base: m.base, width: m.width });
  preview.setAttribute('aria-label', `${EYES[type].name}에 ${name} 디자인을 적용한 미리보기`);
  out.name.textContent = name;
  out.curl.textContent = curl;
  out.len.textContent = len;
  out.count.textContent = m.count;
  out.tip.textContent = rec.tip;
}
document.querySelectorAll('input[name="eye"], input[name="mood"]').forEach(r => r.addEventListener('change', updateFinder));
updateFinder();

/* ---------------------------------------------------------
   포트폴리오: 분류 필터 + 크게 보기
   --------------------------------------------------------- */
const filterBtns = [...document.querySelectorAll('.filters button')];
const items = [...document.querySelectorAll('.g-item')];
filterBtns.forEach(b => b.addEventListener('click', () => {
  filterBtns.forEach(x => { x.classList.toggle('on', x === b); x.setAttribute('aria-pressed', x === b); });
  items.forEach(it => { it.hidden = b.dataset.f !== 'all' && it.dataset.c !== b.dataset.f; });
}));

const lb = document.getElementById('lightbox'), lbImg = document.getElementById('lbImg'), lbCap = document.getElementById('lbCap');
let lbList = [], lbIdx = 0, lastFocus = null;
function showLb(i) {
  lbIdx = (i + lbList.length) % lbList.length;
  const img = lbList[lbIdx].querySelector('img');
  lbImg.src = img.src;
  lbImg.alt = img.alt;
  lbCap.textContent = lbList[lbIdx].querySelector('span').textContent;
}
items.forEach(it => it.addEventListener('click', () => {
  lbList = items.filter(x => !x.hidden);
  lastFocus = it;
  showLb(lbList.indexOf(it));
  lb.hidden = false;
  lb.querySelector('.lb-close').focus();
}));
const closeLb = () => { lb.hidden = true; if (lastFocus) lastFocus.focus(); };
lb.querySelector('.lb-close').addEventListener('click', closeLb);
lb.querySelector('.lb-prev').addEventListener('click', () => showLb(lbIdx - 1));
lb.querySelector('.lb-next').addEventListener('click', () => showLb(lbIdx + 1));
lb.addEventListener('click', e => { if (e.target === lb) closeLb(); });
let touchX = null;
lb.addEventListener('pointerdown', e => { touchX = e.clientX; });
lb.addEventListener('pointerup', e => {
  if (touchX === null) return;
  const dx = e.clientX - touchX;
  if (Math.abs(dx) > 50) showLb(lbIdx + (dx < 0 ? 1 : -1));
  touchX = null;
});
addEventListener('keydown', e => {
  if (e.key === 'Escape') { setMenu(false); if (!lb.hidden) closeLb(); }
  if (lb.hidden) return;
  if (e.key === 'ArrowRight') showLb(lbIdx + 1);
  if (e.key === 'ArrowLeft') showLb(lbIdx - 1);
});

// 후기 슬라이더
const track = document.getElementById('rTrack');
const step = () => track.querySelector('.r-card').offsetWidth + 14;
document.getElementById('rPrev').addEventListener('click', () => track.scrollBy({ left: -step(), behavior: reduceMotion ? 'auto' : 'smooth' }));
document.getElementById('rNext').addEventListener('click', () => track.scrollBy({ left: step(), behavior: reduceMotion ? 'auto' : 'smooth' }));
