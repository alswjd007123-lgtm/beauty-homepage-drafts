// 시안8 물결채
(function () {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const body = document.body;

  /* ---------- 공통 움직임 코어 ---------- */

  // 모바일 메뉴
  const menuBtn = $('.menu-btn');
  const setMenu = (open) => {
    body.classList.toggle('menu-open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? '전체 메뉴 닫기' : '전체 메뉴 열기');
  };
  menuBtn.addEventListener('click', () => setMenu(!body.classList.contains('menu-open')));
  $('.m-dim').addEventListener('click', () => setMenu(false));
  $$('.m-nav a').forEach((a) => a.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });

  // 히어로 슬라이드: 자동 넘김 + 진행 바 + 번호 + 스와이프
  const slides = $$('.hs-slide');
  if (slides.length) {
    const no = $('#hsNo'), bar = $('#hsBar'), pauseBtn = $('#hsPause');
    const DURATION = 6500;
    let cur = 0, playing = !reduce, t0 = performance.now(), elapsed = 0;
    const go = (i) => {
      slides[cur].classList.remove('on');
      cur = (i + slides.length) % slides.length;
      slides[cur].classList.add('on');
      no.textContent = String(cur + 1).padStart(2, '0');
      elapsed = 0; t0 = performance.now();
    };
    const frame = (t) => {
      if (playing) {
        const p = Math.min((elapsed + t - t0) / DURATION, 1);
        bar.style.transform = `scaleX(${p})`;
        if (p >= 1) go(cur + 1);
      }
      requestAnimationFrame(frame);
    };
    const setPlaying = (on) => {
      if (on === playing) return;
      if (on) t0 = performance.now(); else elapsed += performance.now() - t0;
      playing = on;
      pauseBtn.textContent = on ? '❚❚' : '▶';
      pauseBtn.setAttribute('aria-label', on ? '자동 넘김 멈춤' : '자동 넘김 시작');
    };
    if (reduce) { pauseBtn.textContent = '▶'; pauseBtn.setAttribute('aria-label', '자동 넘김 시작'); }
    $('#hsPrev').addEventListener('click', () => go(cur - 1));
    $('#hsNext').addEventListener('click', () => go(cur + 1));
    pauseBtn.addEventListener('click', () => setPlaying(!playing));
    let sx = null;
    const box = $('.hs');
    box.addEventListener('pointerdown', (e) => { sx = e.clientX; });
    box.addEventListener('pointerup', (e) => {
      if (sx === null) return;
      const dx = e.clientX - sx;
      if (Math.abs(dx) > 50) go(cur + (dx < 0 ? 1 : -1));
      sx = null;
    });
    requestAnimationFrame(frame);
  }

  // 스크롤 등장 + 마스크 + 숫자 카운트업
  $$('.svc-row, .facts, .bento, .around-track, .faq-list').forEach((g) => {
    [...g.children].forEach((c, i) => c.style.setProperty('--d', `${i * 0.09}s`));
  });
  const countUp = (el) => {
    const end = Number(el.dataset.count);
    if (reduce) { el.textContent = end; return; }
    const t0 = performance.now();
    const tick = (t) => {
      const p = Math.min((t - t0) / 1400, 1);
      el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      en.target.classList.add('in');
      en.target.querySelectorAll('[data-count]').forEach(countUp);
      io.unobserve(en.target);
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
  $$('.rv, .mask').forEach((el) => io.observe(el));

  // 흐르는 사진 띠
  $$('.marquee-track').forEach((t) => { t.innerHTML += t.innerHTML; });

  // 스크롤 묶음 처리: 헤더 숨김, 맨 위로, 패럴랙스, 하단 바
  const header = $('#header');
  const topBtn = $('#toTop');
  const bottomBar = $('.bottom-bar');
  const pxEls = $$('[data-parallax]');
  let lastY = window.scrollY, ticking = false;
  const onScroll = () => {
    const y = window.scrollY;
    const down = y > lastY;
    header.classList.toggle('scrolled', y > 40);
    header.classList.toggle('hide', down && y > 500 && !body.classList.contains('menu-open'));
    if (topBtn) topBtn.classList.toggle('show', y > 900);
    if (bottomBar) bottomBar.style.transform = down && y > 500 ? 'translateY(140%)' : '';
    if (!reduce) {
      pxEls.forEach((el) => {
        const r = el.parentElement.getBoundingClientRect();
        if (r.bottom < 0 || r.top > innerHeight) return;
        el.style.transform = `translate3d(0, ${(r.top + r.height / 2 - innerHeight / 2) * -Number(el.dataset.parallax)}px, 0)`;
      });
    }
    lastY = y; ticking = false;
  };
  window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();
  if (topBtn) topBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }));

  /* ---------- 시안8 전용 ---------- */

  // 유리 위 마우스 빛 (PC만)
  if (fine) {
    $$('.spot').forEach((el) => {
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        el.style.setProperty('--x', `${e.clientX - r.left}px`);
        el.style.setProperty('--y', `${e.clientY - r.top}px`);
      });
    });
  }

  // 예약 바: 날짜 기본값과 안내
  const form = $('.book-bar');
  const inEl = form.querySelector('[name="checkin"]');
  const outEl = form.querySelector('[name="checkout"]');
  const pad = (n) => String(n).padStart(2, '0');
  const fmt = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  inEl.min = fmt(new Date());
  inEl.addEventListener('change', () => {
    if (!inEl.value) return;
    const next = new Date(inEl.value); next.setDate(next.getDate() + 1);
    outEl.min = fmt(next);
    if (!outEl.value || outEl.value <= inEl.value) outEl.value = fmt(next);
  });
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const note = $('#bookNote');
    if (!inEl.value || !outEl.value) { note.textContent = '체크인과 체크아웃 날짜를 골라 주세요.'; return; }
    note.textContent = `${inEl.value} ~ ${outEl.value}, ${form.guests.value} 일정으로 문의할게요. 예약 안내로 이동해요.`;
    $('#reserve').scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
  });

  // 객실 세그먼트 탭
  const seg = $('.seg');
  const tabs = $$('[role="tab"]', seg);
  const select = (idx) => {
    tabs.forEach((t, i) => {
      const on = i === idx;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      document.getElementById(t.getAttribute('aria-controls')).hidden = !on;
    });
    seg.dataset.active = String(idx);
  };
  tabs.forEach((t, i) => {
    t.addEventListener('click', () => select(i));
    t.addEventListener('keydown', (e) => {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      const n = (i + (e.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
      select(n); tabs[n].focus();
    });
  });

  // 객실 사진 갤러리: 썸네일을 누르면 큰 사진 교체
  $$('.gallery').forEach((g) => {
    const main = $('.g-main img', g);
    const thumbs = $$('.g-thumbs button', g);
    thumbs.forEach((b) => b.addEventListener('click', () => {
      thumbs.forEach((x) => x.classList.toggle('on', x === b));
      main.src = b.dataset.src;
      main.alt = b.dataset.alt;
      main.classList.remove('swap'); void main.offsetWidth; main.classList.add('swap');
    }));
  });

  $('#year').textContent = new Date().getFullYear();
})();
