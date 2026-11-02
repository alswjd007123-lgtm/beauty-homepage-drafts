// 온브로우 · 화면 동작

// 헤더
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

// 스크롤 등장
const io = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const siblings = [...entry.target.parentElement.children].filter(el => el.classList.contains('reveal'));
    entry.target.style.transitionDelay = `${Math.max(0, siblings.indexOf(entry.target)) * 70}ms`;
    entry.target.classList.add('in');
    io.unobserve(entry.target);
  });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach(el => io.observe(el));

// 눈썹 그리기 (오른쪽 눈썹을 그리고 좌우 반전해 왼쪽을 만든다)
// 눈썹 중심선: u=0 앞머리(x=295) → u=1 꼬리(x=415)
const SHAPES = {
  straight: { h: 5, peak: 0.7, k: 1, drop: 4 },
  soft: { h: 14, peak: 0.66, k: 1.4, drop: 8 },
  arch: { h: 24, peak: 0.58, k: 1.8, drop: 12 },
  angle: { h: 22, peak: 0.68, k: 1, drop: 14, sharp: true }
};
const TONES = { light: 0.42, natural: 0.68, bold: 0.95 };
function centerY(s, u) {
  const base = 118;
  if (u <= s.peak) return base - s.h * Math.pow(u / s.peak, s.k === 1 ? 1 : 1 / s.k);
  const v = (u - s.peak) / (1 - s.peak);
  const fall = s.sharp ? v : Math.pow(v, 1.3);
  return base - s.h + (s.h + s.drop) * fall * 0.85;
}
const thick = u => 15 * Math.pow(1 - u, 0.65) + 3;
function seeded(seed) {
  let x = seed;
  return () => { x = (x * 16807) % 2147483647; return (x - 1) / 2147483646; };
}
function browMarkup(shapeKey, tone, style, color, strokeW = 1.5) {
  const s = SHAPES[shapeKey];
  const X = u => 295 + 120 * u;
  const op = TONES[tone];
  if (style === 'shade') {
    const top = [], bottom = [];
    for (let i = 0; i <= 30; i++) {
      const u = i / 30, y = centerY(s, u), t = thick(u);
      top.push(`${X(u).toFixed(1)} ${(y - t / 2).toFixed(1)}`);
      bottom.unshift(`${X(u).toFixed(1)} ${(y + t / 2).toFixed(1)}`);
    }
    const id = `g${shapeKey}${tone}${Math.round(strokeW * 10)}`;
    return `<defs><linearGradient id="${id}" x1="295" x2="415" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="${color}" stop-opacity="${op * 0.25}"/><stop offset=".35" stop-color="${color}" stop-opacity="${op}"/><stop offset="1" stop-color="${color}" stop-opacity="${op}"/></linearGradient></defs>
      <path d="M${top.join(' L')} L${bottom.join(' L')}Z" fill="url(#${id})" stroke="none"/>`;
  }
  const rnd = seeded(7);
  let d = '';
  for (let i = 0; i < 90; i++) {
    const u = Math.pow(rnd(), 0.9);
    const y = centerY(s, u), t = thick(u);
    const off = (rnd() - 0.5) * t * 0.9;
    const x0 = X(u), y0 = y + off + t * 0.2;
    // 앞머리는 위로 서고, 뒤로 갈수록 꼬리 방향으로 눕는다
    const dy = centerY(s, Math.min(1, u + 0.02)) - y;
    const ang = u < 0.18 ? -Math.PI / 2 + u * 3 : Math.atan2(dy, 2.4) - 0.35;
    const len = 9 + rnd() * 6;
    const x1 = x0 + Math.cos(ang) * len, y1 = y0 + Math.sin(ang) * len;
    d += `M${x0.toFixed(1)} ${y0.toFixed(1)} Q${((x0 + x1) / 2 + 1.5).toFixed(1)} ${((y0 + y1) / 2 - 1).toFixed(1)} ${x1.toFixed(1)} ${y1.toFixed(1)}`;
  }
  return `<path d="${d}" fill="none" stroke="${color}" stroke-opacity="${op}" stroke-width="${strokeW}" stroke-linecap="round"/>`;
}
function faceMarkup(shape, tone, style) {
  const brow = browMarkup(shape, tone, style, '#4A3426');
  const eye = cx => `<path d="M${cx - 52} 178 Q${cx} 140 ${cx + 52} 178 Q${cx} 202 ${cx - 52} 178Z" fill="#fff" stroke="#6B5143" stroke-width="2"/>
    <circle cx="${cx}" cy="176" r="15" fill="#3B2B22"/><circle cx="${cx + 5}" cy="171" r="4" fill="#fff"/>
    <path d="M${cx - 52} 178 Q${cx} 140 ${cx + 52} 178" fill="none" stroke="#3B2B22" stroke-width="3"/>`;
  return `${eye(170)}${eye(350)}
    <path d="M250 150 Q245 210 236 240 M270 150 Q275 210 284 240" fill="none" stroke="#C9A58C" stroke-width="2" opacity=".6"/>
    <g>${brow}</g><g transform="translate(520 0) scale(-1 1)">${brow}</g>`;
}

// 히어로: 금색 결 눈썹 하나를 크게
document.getElementById('heroBrow').innerHTML =
  `<g transform="translate(-876 -276) scale(3.2)">${browMarkup('soft', 'bold', 'hair', 'currentColor', 0.55)}</g>`;

// 미리보기 조작
const pick = { shape: 'soft', tone: 'natural', style: 'hair' };
const NAMES = { straight: '일자', soft: '소프트 아치', arch: '아치', angle: '각진 아치', light: '연하게', natural: '자연스럽게', bold: '또렷하게', hair: '결 표현', shade: '음영' };
const SHAPE_TIP = {
  straight: '눈썹 산을 거의 두지 않아 어려 보이고 부드러운 인상이에요.',
  soft: '산을 살짝만 올려 가장 무난하고 자연스러워요.',
  arch: '산을 높여 눈매가 시원하고 우아해 보여요.',
  angle: '산에 각을 줘서 또렷하고 단정한 인상을 만들어요.'
};
const STYLE_TIP = {
  hair: '결 표현은 털처럼 한 올씩 그려 가까이서 봐도 자연스러워요.',
  shade: '음영은 메이크업한 듯 부드럽게 채워져요.'
};
const face = document.getElementById('browFace');
const desc = document.getElementById('browDesc');
function update() {
  face.innerHTML = faceMarkup(pick.shape, pick.tone, pick.style);
  face.setAttribute('aria-label', `${NAMES[pick.shape]} 모양, ${NAMES[pick.tone]}, ${NAMES[pick.style]} 눈썹 미리보기`);
  desc.innerHTML = `<b>${NAMES[pick.shape]} · ${NAMES[pick.tone]} · ${NAMES[pick.style]}</b>${SHAPE_TIP[pick.shape]} ${STYLE_TIP[pick.style]}`;
}
document.querySelectorAll('.opts').forEach(group => {
  group.querySelectorAll('button').forEach(btn => btn.addEventListener('click', () => {
    pick[group.dataset.key] = btn.dataset.v;
    group.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(b === btn)));
    update();
  }));
});
update();
