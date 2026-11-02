// 소담 스킨 · 화면 동작

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
}, { threshold: 0.15 });
document.querySelectorAll('.reveal').forEach(el => io.observe(el));

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

// 3분 피부 체크: 고민 → 관리 추천, 타입·경험에 따라 한 줄 덧붙임
const form = document.getElementById('check-form');
const out = document.getElementById('checkResult');
const CARE = {
  dry: { name: '수분 결 관리', tab: 't-dry' },
  calm: { name: '진정 리셋 관리', tab: 't-calm' },
  firm: { name: '윤곽 리프팅 관리', tab: 't-firm' },
  tone: { name: '맑은 결 관리', tab: 't-tone' }
};
const TYPE_TIP = {
  dry: '건성 피부라 마무리 보습 단계를 길게 잡을게요.',
  oily: '지성 피부라 무겁지 않은 제형으로 골라 드릴게요.',
  combi: '부위마다 다르게 관리해요. T존과 볼을 나눠서 볼게요.',
  sensitive: '민감한 피부라 첫 관리는 자극 테스트부터 해요.'
};
const EXP_TIP = {
  first: '처음 오시면 상담 시간을 넉넉히 잡아 드려요.',
  some: '지난 관리 경험을 들려주시면 맞춰 드릴게요.',
  regular: '지금 받고 계신 관리와 겹치지 않게 조정해요.'
};
form.addEventListener('submit', e => {
  e.preventDefault();
  if (!form.reportValidity()) return;
  const d = new FormData(form);
  const care = CARE[d.get('worry')];
  out.innerHTML = `<p class="en kicker">Your Care</p>
    <h3>${care.name}</h3>
    <p>${TYPE_TIP[d.get('type')]} ${EXP_TIP[d.get('exp')]}</p>
    <a href="#care" data-tab="${care.tab}">이 관리 자세히 보기 →</a>`;
  out.hidden = false;
  out.querySelector('a').addEventListener('click', ev => selectTab(document.getElementById(ev.currentTarget.dataset.tab)));
});
