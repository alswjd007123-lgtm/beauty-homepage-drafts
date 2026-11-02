// 스무스 왁싱 · 화면 동작

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
    entry.target.style.transitionDelay = `${Math.max(0, siblings.indexOf(entry.target)) * 60}ms`;
    entry.target.classList.add('in');
    io.unobserve(entry.target);
  });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach(el => io.observe(el));

// 부위 탭 (화살표 키로도 이동)
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

// 방문 전 체크리스트
const boxes = [...document.querySelectorAll('.list input')];
const meterBar = document.getElementById('meterBar');
const meterText = document.getElementById('meterText');
const done = document.getElementById('checkDone');
function updateCheck() {
  const n = boxes.filter(b => b.checked).length;
  meterBar.style.transform = `scaleX(${n / boxes.length})`;
  meterText.textContent = `${n} / ${boxes.length} 준비했어요`;
  done.hidden = n !== boxes.length;
}
boxes.forEach(b => b.addEventListener('change', updateCheck));
updateCheck();
