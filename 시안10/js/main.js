// 래쉬 노트 · 화면 동작
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// 헤더: 스크롤하면 반투명 배경
const header = document.getElementById('header');
const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 20);
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

// 모바일 메뉴
const burger = document.getElementById('burger');
const nav = document.getElementById('nav');
function setMenu(open) {
  nav.classList.toggle('open', open);
  burger.setAttribute('aria-expanded', String(open));
  burger.setAttribute('aria-label', open ? '메뉴 닫기' : '메뉴 열기');
}
burger.addEventListener('click', () => setMenu(!nav.classList.contains('open')));
nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setMenu(false)));
document.addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });

// 스크롤 등장 (같은 줄의 카드는 60ms씩 차례로)
const io = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const siblings = [...entry.target.parentElement.children].filter(el => el.classList.contains('reveal'));
    entry.target.style.transitionDelay = `${Math.max(0, siblings.indexOf(entry.target)) * 60}ms`;
    entry.target.classList.add('in');
    io.unobserve(entry.target);
  });
}, { threshold: 0.15 });
document.querySelectorAll('.reveal').forEach(el => io.observe(el));

// 속눈썹 그리기: 윗눈꺼풀 곡선을 따라 길이·컬이 다른 선을 그린다
const SVG_NS = 'http://www.w3.org/2000/svg';
const PROFILES = {
  natural: t => 13 + 3 * Math.sin(Math.PI * t),
  cat: t => 7 + 20 * Math.pow(t, 1.7),
  doll: t => 9 + 15 * Math.sin(Math.PI * t)
};
function bez(p0, c, p2, t) {
  const u = 1 - t;
  return { x: u * u * p0.x + 2 * u * t * c.x + t * t * p2.x, y: u * u * p0.y + 2 * u * t * c.y + t * t * p2.y };
}
function drawEye(svg, type) {
  svg.textContent = '';
  const p0 = { x: 22, y: 72 }, c = { x: 100, y: 22 }, p2 = { x: 178, y: 72 };
  const lower = `M${p0.x} ${p0.y} Q100 106 ${p2.x} ${p2.y}`;
  const add = (tag, attrs) => {
    const el = document.createElementNS(SVG_NS, tag);
    Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
    svg.appendChild(el);
    return el;
  };
  add('path', { d: `M${p0.x} ${p0.y} Q${c.x} ${c.y} ${p2.x} ${p2.y} Q100 106 ${p0.x} ${p0.y}Z`, fill: 'rgba(255,255,255,.75)' });
  add('circle', { cx: 100, cy: 66, r: 20, fill: 'currentColor', opacity: '.85' });
  add('circle', { cx: 107, cy: 59, r: 5, fill: '#fff', opacity: '.9' });
  add('path', { d: lower, fill: 'none', stroke: 'currentColor', 'stroke-width': 1.5, opacity: '.5' });
  const len = PROFILES[type] || PROFILES.natural;
  const g = add('g', { fill: 'none', stroke: 'currentColor', 'stroke-width': 1.6, 'stroke-linecap': 'round' });
  for (let i = 0; i <= 28; i++) {
    const t = 0.05 + (i / 28) * 0.92;
    const b = bez(p0, c, p2, t);
    const d = { x: 2 * (1 - t) * (c.x - p0.x) + 2 * t * (p2.x - c.x), y: 2 * (1 - t) * (c.y - p0.y) + 2 * t * (p2.y - c.y) };
    const m = Math.hypot(d.x, d.y);
    const tx = d.x / m, ty = d.y / m;
    const nx = ty, ny = -tx; // 눈꺼풀 바깥(위)쪽
    const L = len(t);
    const lean = (t - 0.5) * 0.9;
    const end = { x: b.x + (nx + tx * lean) * L, y: b.y + (ny + ty * lean) * L };
    const ctrl = { x: b.x + nx * L * 0.7, y: b.y + ny * L * 0.7 };
    const path = document.createElementNS(SVG_NS, 'path');
    path.setAttribute('d', `M${b.x.toFixed(1)} ${b.y.toFixed(1)} Q${ctrl.x.toFixed(1)} ${ctrl.y.toFixed(1)} ${end.x.toFixed(1)} ${end.y.toFixed(1)}`);
    g.appendChild(path);
  }
  add('path', { d: `M${p0.x} ${p0.y} Q${c.x} ${c.y} ${p2.x} ${p2.y}`, fill: 'none', stroke: 'currentColor', 'stroke-width': 2.4 });
}
document.querySelectorAll('svg[data-lash]').forEach(svg => drawEye(svg, svg.dataset.lash));

// 1분 스타일 찾기
const quiz = document.getElementById('quiz');
const steps = [...quiz.querySelectorAll('.q')];
const stepCount = document.getElementById('stepCount');
const progressBar = document.getElementById('progressBar');
const result = document.getElementById('result');
const RESULTS = {
  natural: { name: '내추럴 결', type: 'natural', base: '길이 차이를 줄여 원래 내 속눈썹처럼 보이게 해요.' },
  clear: { name: '캣 라인', type: 'cat', base: '눈꼬리 쪽을 길게 빼서 눈매를 또렷하고 길어 보이게 해요.' },
  glam: { name: '돌 아이', type: 'doll', base: '눈 가운데를 가장 길게 두어 눈이 동그랗고 커 보여요.' }
};
const EYE_TIP = {
  double: '쌍꺼풀 라인이 가려지지 않게 컬 높이를 맞춰요.',
  inner: '속쌍꺼풀에 눌리지 않도록 컬을 한 단계 올려요.',
  mono: '무쌍 눈매는 속눈썹이 덮이지 않게 컬을 충분히 올려요.'
};
const MAKEUP_TIP = {
  none: '맨얼굴에도 어색하지 않게 숱을 가볍게 잡아요.',
  daily: '데일리 메이크업과 어울리는 숱으로 맞춰요.',
  full: '아이 메이크업과 겹쳐도 무겁지 않게 숱을 조절해요.'
};
let current = 0;
function showStep(i) {
  current = i;
  steps.forEach((s, n) => { s.hidden = n !== i; });
  stepCount.textContent = `${i + 1} / ${steps.length}`;
  progressBar.style.width = `${((i + 1) / steps.length) * 100}%`;
}
quiz.addEventListener('change', () => {
  if (current < steps.length - 1) {
    setTimeout(() => {
      showStep(current + 1);
      steps[current].querySelector('input').focus({ preventScroll: true });
    }, reduceMotion ? 0 : 180);
    return;
  }
  const data = new FormData(quiz);
  const r = RESULTS[data.get('mood')];
  document.getElementById('resultName').textContent = r.name;
  document.getElementById('resultDesc').textContent = `${r.base} ${EYE_TIP[data.get('eye')]} ${MAKEUP_TIP[data.get('makeup')]}`;
  drawEye(document.getElementById('resultEye'), r.type);
  quiz.hidden = true;
  result.hidden = false;
  stepCount.textContent = '결과';
  progressBar.style.width = '100%';
});
document.getElementById('quizReset').addEventListener('click', () => {
  quiz.reset();
  quiz.hidden = false;
  result.hidden = true;
  showStep(0);
  steps[0].querySelector('input').focus();
});

// 탭 (화살표 키로도 이동)
const tabs = [...document.querySelectorAll('[role="tab"]')];
function selectTab(tab) {
  tabs.forEach(t => {
    const on = t === tab;
    t.setAttribute('aria-selected', String(on));
    t.tabIndex = on ? 0 : -1;
    document.getElementById(t.getAttribute('aria-controls')).hidden = !on;
  });
}
tabs.forEach((tab, i) => {
  tab.addEventListener('click', () => selectTab(tab));
  tab.addEventListener('keydown', e => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    const next = tabs[(i + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length];
    selectTab(next);
    next.focus();
  });
});

// 리터치 시기 계산기
const calc = document.getElementById('calc');
const calcDate = document.getElementById('calcDate');
const calcOut = document.getElementById('calcOut');
const today = new Date();
calcDate.max = today.toISOString().slice(0, 10);
const fmt = d => `${d.getMonth() + 1}월 ${d.getDate()}일`;
calc.addEventListener('submit', e => {
  e.preventDefault();
  if (!calcDate.value) { calcOut.textContent = '시술한 날짜를 골라 주세요.'; return; }
  const opt = document.getElementById('calcType').selectedOptions[0];
  const base = new Date(calcDate.value + 'T00:00:00');
  const from = new Date(base); from.setDate(base.getDate() + Number(opt.dataset.from));
  const to = new Date(base); to.setDate(base.getDate() + Number(opt.dataset.to));
  calcOut.textContent = `${fmt(from)} ~ ${fmt(to)} 사이에 오시면 좋아요.`;
});
