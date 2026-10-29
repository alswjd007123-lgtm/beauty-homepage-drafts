// 시안4 · 결 에스테틱
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

// 헤더: 스크롤하면 유리 배경
const header = document.getElementById('header');
const onScroll = () => header.classList.toggle('scrolled', scrollY > 40);
addEventListener('scroll', onScroll, { passive: true });
onScroll();

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

// 등장 애니메이션 + 숫자 카운트업
const io = new IntersectionObserver(entries => entries.forEach(e => {
  if (!e.isIntersecting) return;
  e.target.classList.add('in');
  io.unobserve(e.target);
  e.target.querySelectorAll('[data-count]').forEach(countUp);
}), { threshold: 0.15 });
document.querySelectorAll('.rv').forEach(el => io.observe(el));

function countUp(el) {
  const end = +el.dataset.count;
  if (reduceMotion) return;
  const start = end > 1000 && end < 3000 ? end - 30 : 0; // 연도는 가까운 값에서 시작
  const t0 = performance.now();
  const tick = t => {
    const p = Math.min((t - t0) / 1400, 1);
    const v = Math.round(start + (end - start) * (1 - Math.pow(1 - p, 3)));
    el.textContent = end > 3000 ? v.toLocaleString() : v;
    if (p < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

// 고민별 탭 (방향키로도 이동)
const tabs = [...document.querySelectorAll('.tab')];
function selectTab(tab) {
  tabs.forEach(t => {
    const on = t === tab;
    t.classList.toggle('on', on);
    t.setAttribute('aria-selected', on);
    t.tabIndex = on ? 0 : -1;
    document.getElementById(t.getAttribute('aria-controls')).hidden = !on;
  });
}
tabs.forEach((t, i) => {
  t.addEventListener('click', () => selectTab(t));
  t.addEventListener('keydown', e => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    const next = tabs[(i + (e.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length];
    selectTab(next);
    next.focus();
  });
});

// 상담 예약 폼: 외부 폼 서비스 주소가 설정되면 실제 전송
const form = document.getElementById('consultForm');
const msg = document.getElementById('formMsg');
const dateInput = document.getElementById('f-date');
dateInput.min = new Date().toISOString().slice(0, 10);

form.addEventListener('submit', async e => {
  e.preventDefault();
  msg.classList.remove('err');
  if (!form.checkValidity()) {
    const first = form.querySelector(':invalid');
    msg.textContent = first.id === 'f-agree' ? '개인정보 수집·이용에 동의해 주세요.' : '이름, 연락처, 희망 날짜와 시간대를 모두 입력해 주세요.';
    msg.classList.add('err');
    first.focus();
    return;
  }
  if (form.action.includes('your-form-id')) {
    msg.textContent = '시안이라 아직 실제로 전송되지 않아요. 폼 서비스 주소를 연결하면 접수됩니다.';
    return;
  }
  try {
    const res = await fetch(form.action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } });
    if (!res.ok) throw new Error();
    form.reset();
    msg.textContent = '상담 신청이 접수됐어요. 하루 안에 연락드릴게요.';
  } catch {
    msg.textContent = '전송하지 못했어요. 잠시 후 다시 시도하거나 전화로 문의해 주세요.';
    msg.classList.add('err');
  }
});

// 진입 팝업: 오늘 하루 보지 않기 (저장소를 못 쓰는 환경에서도 동작)
const popup = document.getElementById('popup');
const todayKey = 'gyeol-popup-' + new Date().toISOString().slice(0, 10);
let hiddenToday = false;
try { hiddenToday = localStorage.getItem(todayKey) === '1'; } catch { /* 저장소 사용 불가 */ }
if (!hiddenToday) setTimeout(() => { popup.hidden = false; popup.querySelector('.btn').focus(); }, 1200);
const closePopup = () => { popup.hidden = true; };
popup.querySelectorAll('[data-close]').forEach(b => b.addEventListener('click', closePopup));
document.getElementById('popupToday').addEventListener('click', () => {
  try { localStorage.setItem(todayKey, '1'); } catch { /* 저장소 사용 불가 */ }
  closePopup();
});
popup.addEventListener('click', e => { if (e.target === popup) closePopup(); });
addEventListener('keydown', e => {
  if (e.key !== 'Escape') return;
  setMenu(false);
  closePopup();
});
