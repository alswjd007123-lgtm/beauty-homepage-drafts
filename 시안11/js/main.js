// 네일 하루 · 화면 동작
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// 헤더
const header = document.getElementById('header');
const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 40);
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

// 스크롤 등장
const io = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const siblings = [...entry.target.parentElement.children].filter(el => el.classList.contains('reveal'));
    entry.target.style.transitionDelay = `${Math.max(0, siblings.indexOf(entry.target)) * 50}ms`;
    entry.target.classList.add('in');
    io.unobserve(entry.target);
  });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach(el => io.observe(el));

// 손톱 그림: 디자인 이름(art)과 길이(len)로 SVG를 만든다
const C = { cobalt: '#2B47D9', butter: '#F6E27A', nude: '#F1E1D8', white: '#FFFFFF', ink: '#1C1F2E' };
let uid = 0;
function nailSVG(art, len = 'long') {
  const id = `n${++uid}`;
  const top = len === 'short' ? 26 : 4;
  const shape = `M8 88 L8 ${top + 24} Q8 ${top} 30 ${top} Q52 ${top} 52 ${top + 24} L52 88 Z`;
  const ART = {
    french: `<rect width="60" height="90" fill="${C.nude}"/><path d="M0 ${top + 22} Q30 ${top + 34} 60 ${top + 22} V0 H0Z" fill="${C.white}"/>`,
    cobalt: `<rect width="60" height="90" fill="${C.cobalt}"/>`,
    butter: `<rect width="60" height="90" fill="${C.butter}"/>`,
    dots: `<rect width="60" height="90" fill="${C.white}"/>${[[20, 30], [38, 44], [22, 60], [40, 74], [30, 18]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="5" fill="${C.cobalt}"/>`).join('')}`,
    wave: `<rect width="60" height="90" fill="${C.white}"/><path d="M0 50 Q15 36 30 50 T60 50 V64 Q45 52 30 64 T0 64Z" fill="${C.cobalt}"/><path d="M0 66 Q15 54 30 66 T60 66 V76 Q45 66 30 76 T0 76Z" fill="${C.butter}"/>`,
    half: `<rect width="60" height="90" fill="${C.white}"/><path d="M0 90 L60 30 V90Z" fill="${C.cobalt}"/>`,
    line: `<rect width="60" height="90" fill="${C.nude}"/><path d="M30 ${top + 8} V86" stroke="${C.ink}" stroke-width="1.6"/><circle cx="30" cy="${top + 30}" r="3" fill="${C.butter}" stroke="${C.ink}" stroke-width="1"/>`,
    check: `<rect width="60" height="90" fill="${C.butter}"/><path d="M0 0h15v90h15V0h15v90h15" fill="none"/>${[0, 20, 40].map(x => `<rect x="${x}" y="0" width="10" height="90" fill="${C.white}" opacity=".7"/>`).join('')}${[10, 40, 70].map(y => `<rect x="0" y="${y}" width="60" height="10" fill="${C.cobalt}" opacity=".35"/>`).join('')}`
  };
  return `<defs><clipPath id="${id}"><path d="${shape}"/></clipPath></defs>
    <g clip-path="url(#${id})">${ART[art] || ART.cobalt}</g>
    <path d="${shape}" fill="none" stroke="rgba(28,31,46,.18)" stroke-width="1.2"/>
    <path d="M16 ${top + 26} Q16 ${top + 12} 26 ${top + 9}" stroke="#fff" stroke-width="3" stroke-linecap="round" fill="none" opacity=".55"/>`;
}
document.querySelectorAll('svg.nail[data-art]').forEach(svg => { svg.innerHTML = nailSVG(svg.dataset.art); });

// 이달의 디자인 목록과 필터
const DESIGNS = [
  { name: '코발트 원컬러', art: 'cobalt', len: 'short', mood: 'simple' },
  { name: '버터 프렌치', art: 'french', len: 'long', mood: 'simple' },
  { name: '블루 도트', art: 'dots', len: 'short', mood: 'point' },
  { name: '물결 투톤', art: 'wave', len: 'long', mood: 'art' },
  { name: '사선 하프', art: 'half', len: 'short', mood: 'point' },
  { name: '버터 원컬러', art: 'butter', len: 'long', mood: 'simple' },
  { name: '한 줄 라인', art: 'line', len: 'short', mood: 'art' },
  { name: '깅엄 체크', art: 'check', len: 'long', mood: 'art' }
];
const LABEL = { short: '짧은 손톱', long: '긴 손톱', simple: '심플', point: '포인트', art: '아트' };
const grid = document.getElementById('designGrid');
const count = document.getElementById('count');
const state = { len: 'all', mood: 'all' };

function render() {
  const list = DESIGNS.filter(d => (state.len === 'all' || d.len === state.len) && (state.mood === 'all' || d.mood === state.mood));
  grid.innerHTML = list.map(d => {
    const fingers = [0, 1, 2].map(() => `<svg viewBox="0 0 60 90" aria-hidden="true">${nailSVG(d.art, d.len)}</svg>`).join('');
    return `<article class="design">
      <div class="stage">${fingers}</div>
      <h3>${d.name}</h3>
      <div class="meta"><span>${LABEL[d.len]}</span><span>${LABEL[d.mood]}</span></div>
      <a href="#reserve">이 디자인으로 예약 →</a>
    </article>`;
  }).join('');
  count.textContent = list.length ? `${list.length}개 디자인` : '조건에 맞는 디자인이 없어요. 다른 조건을 골라 보세요.';
  if (reduceMotion) grid.querySelectorAll('.design').forEach(el => { el.style.animation = 'none'; });
}
document.querySelectorAll('.chips button').forEach(btn => btn.addEventListener('click', () => {
  state[btn.dataset.k] = btn.dataset.v;
  btn.parentElement.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(b === btn)));
  render();
}));
render();
