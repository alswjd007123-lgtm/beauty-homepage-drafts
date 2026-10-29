// 시안6 · 아뜰리에 온도
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

// 헤더: 스크롤하면 유리 배경, 아래로 내리면 숨김 / 맨 위로 버튼
const header = document.getElementById('header');
const toTop = document.getElementById('toTop');
let lastY = 0;
addEventListener('scroll', () => {
  const y = scrollY;
  header.classList.toggle('scrolled', y > 40);
  header.classList.toggle('hide', y > lastY && y > 400 && !document.body.classList.contains('open'));
  toTop.classList.toggle('on', y > 700);
  lastY = y;
}, { passive: true });

// 전체 메뉴 (슬라이드)
const menuBtn = document.querySelector('.menu-btn');
function setMenu(open) {
  document.body.classList.toggle('open', open);
  menuBtn.setAttribute('aria-expanded', open);
  menuBtn.setAttribute('aria-label', open ? '전체 메뉴 닫기' : '전체 메뉴 열기');
}
menuBtn.addEventListener('click', () => setMenu(!document.body.classList.contains('open')));
document.querySelector('.m-dim').addEventListener('click', () => setMenu(false));
document.querySelectorAll('.m-nav a').forEach(a => a.addEventListener('click', () => setMenu(false)));
addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });

/* ---------------------------------------------------------
   풀스크린 배너: 페이지 번호 + 진행 바 + 자동 넘김 + 스와이프
   --------------------------------------------------------- */
const slides = [...document.querySelectorAll('.slide')];
const curNo = document.getElementById('curNo');
const bar = document.getElementById('progress');
const pauseBtn = document.getElementById('pauseSlide');
const DURATION = 6000;
let cur = 0, playing = !reduceMotion, t0 = 0, elapsed = 0;

function go(i) {
  slides[cur].classList.remove('on');
  cur = (i + slides.length) % slides.length;
  slides[cur].classList.add('on');
  curNo.textContent = String(cur + 1).padStart(2, '0');
  elapsed = 0;
  t0 = performance.now();
}
function frame(t) {
  if (playing) {
    const p = Math.min((elapsed + t - t0) / DURATION, 1);
    bar.style.transform = `scaleX(${p})`;
    if (p >= 1) go(cur + 1);
  }
  requestAnimationFrame(frame);
}
function setPlaying(on) {
  if (on === playing) return;
  if (on) t0 = performance.now(); else elapsed += performance.now() - t0;
  playing = on;
  pauseBtn.textContent = on ? '❚❚' : '▶';
  pauseBtn.setAttribute('aria-label', on ? '자동 넘김 멈춤' : '자동 넘김 시작');
}
document.getElementById('prevSlide').addEventListener('click', () => go(cur - 1));
document.getElementById('nextSlide').addEventListener('click', () => go(cur + 1));
pauseBtn.addEventListener('click', () => setPlaying(!playing));
if (reduceMotion) { pauseBtn.textContent = '▶'; pauseBtn.setAttribute('aria-label', '자동 넘김 시작'); }
t0 = performance.now();
requestAnimationFrame(frame);

let startX = null;
const slideBox = document.querySelector('.slides');
slideBox.addEventListener('pointerdown', e => { startX = e.clientX; });
slideBox.addEventListener('pointerup', e => {
  if (startX === null) return;
  const dx = e.clientX - startX;
  if (Math.abs(dx) > 50) go(cur + (dx < 0 ? 1 : -1));
  startX = null;
});

// 룩북 좌우 버튼
const track = document.getElementById('lookTrack');
const step = () => track.querySelector('.look').offsetWidth + 14;
document.getElementById('lbPrev').addEventListener('click', () => track.scrollBy({ left: -step(), behavior: reduceMotion ? 'auto' : 'smooth' }));
document.getElementById('lbNext').addEventListener('click', () => track.scrollBy({ left: step(), behavior: reduceMotion ? 'auto' : 'smooth' }));

// 브랜드 콘셉트 공간 사진 전환
const spaceImgs = [...document.querySelectorAll('.space-slider img')];
let si = 0;
if (!reduceMotion) setInterval(() => {
  spaceImgs[si].classList.remove('on');
  si = (si + 1) % spaceImgs.length;
  spaceImgs[si].classList.add('on');
}, 4000);

// 등장 애니메이션 + 숫자 카운트업
const io = new IntersectionObserver(entries => entries.forEach(e => {
  if (!e.isIntersecting) return;
  e.target.classList.add('in');
  io.unobserve(e.target);
  const n = e.target.querySelector('[data-count]');
  if (n && !reduceMotion) countUp(n);
}), { threshold: 0.15 });
document.querySelectorAll('.rv').forEach(el => io.observe(el));

function countUp(el) {
  const end = +el.dataset.count;
  const start = end > 1900 && end < 2100 ? end - 25 : 0; // 연도는 가까운 값에서 시작
  const t1 = performance.now();
  const tick = t => {
    const p = Math.min((t - t1) / 1400, 1);
    const v = Math.round(start + (end - start) * (1 - Math.pow(1 - p, 3)));
    el.textContent = end >= 10000 ? v.toLocaleString() : v;
    if (p < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}
