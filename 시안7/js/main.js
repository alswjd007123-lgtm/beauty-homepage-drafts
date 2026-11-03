// 시안7 윤슬 로스터스
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
    const DURATION = 6000;
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

  // 스크롤 등장 + 마스크 + 숫자 카운트업 (같은 묶음 안에서는 순서대로)
  $$('.quick, .stats, .bean-track, .cat-grid, .grid8, .notice-list').forEach((g) => {
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
  const watch = (root = document) => $$('.rv, .mask', root).forEach((el) => io.observe(el));
  watch();

  // 스티키 섹션: 보이는 항목에 맞춰 사진 교체
  $$('[data-swap]').forEach((box) => {
    const imgs = $$('.swap-img', box);
    const items = $$('.swap-item', box);
    const num = $('#procNum', box);
    const sio = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        const i = Number(en.target.dataset.i);
        items.forEach((x) => x.classList.toggle('on', x === en.target));
        imgs.forEach((im, k) => im.classList.toggle('on', k === i));
        if (num) num.textContent = String(i + 1).padStart(2, '0');
      });
    }, { rootMargin: '-45% 0px -45% 0px' });
    items.forEach((x) => sio.observe(x));
  });

  // 흐르는 사진 띠: 내용을 한 번 더 붙여 끊김 없이
  $$('.marquee-track').forEach((t) => { t.innerHTML += t.innerHTML; });

  // 스크롤 묶음 처리: 헤더 숨김, 맨 위로, 패럴랙스, 키네틱 띠
  const header = $('#header');
  const topBtn = $('#toTop');
  const bottomBar = $('.bottom-bar');
  const pxEls = $$('[data-parallax]');
  const rows = $$('.kinetic-row');
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
      rows.forEach((r) => {
        const w = r.firstElementChild.offsetWidth;
        let x = (y * Number(r.dataset.speed)) % w;
        if (x > 0) x -= w;
        r.style.transform = `translate3d(${x}px,0,0)`;
      });
    }
    lastY = y; ticking = false;
  };
  window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();
  if (topBtn) topBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }));

  /* ---------- 시안7 전용 ---------- */

  // 메뉴 탭 (분류 사진 카드와 연결)
  const tabs = $$('[role="tab"]');
  const selectTab = (tab) => {
    tabs.forEach((t) => {
      const on = t === tab;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      document.getElementById(t.getAttribute('aria-controls')).hidden = !on;
    });
  };
  tabs.forEach((t, idx) => {
    t.addEventListener('click', () => selectTab(t));
    t.addEventListener('keydown', (e) => {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      const next = tabs[(idx + (e.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length];
      selectTab(next); next.focus();
    });
  });
  $$('.cat').forEach((c) => c.addEventListener('click', () => {
    const tab = document.getElementById(c.dataset.tab);
    selectTab(tab);
    $('.board').scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' });
  }));

  // 원두 취향 찾기
  const picks = {};
  const beans = {
    'high-black': { name: '예가체프 꽃잎', desc: '자스민과 레몬 향이 또렷해요. 핸드드립으로 마셔 보세요.' },
    'high-milk': { name: '우일라 캐러멜', desc: '산미가 부드럽고 단맛이 있어 우유와도 잘 어울려요.' },
    'low-black': { name: '윤슬 블렌드', desc: '꿀과 구운 견과 맛. 매일 마시기 편한 하우스 블렌드예요.' },
    'low-milk': { name: '세하도 너트', desc: '고소하고 묵직해서 라떼로 마시면 진하게 살아나요.' }
  };
  const result = $('#finderResult');
  $$('.opts button').forEach((b) => {
    b.addEventListener('click', () => {
      const q = b.dataset.q;
      picks[q] = b.dataset.v;
      $$(`.opts button[data-q="${q}"]`).forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
      if (picks.acid && picks.milk) {
        const r = beans[`${picks.acid}-${picks.milk}`];
        result.innerHTML = `<p>오늘 추천 원두</p><h3>${r.name}</h3><p>${r.desc}</p><a href="#beans" class="btn btn-yellow">원두 자세히 보기</a>`;
        result.classList.remove('show'); void result.offsetWidth; result.classList.add('show');
      }
    });
  });

  // 소식: 데이터로 렌더링 (내용은 실제 공지로 교체)
  const notices = [
    { tag: '안내', date: '2026.11.01', title: '원두 정기배송을 시작해요', text: '2주 간격, 원하는 원두와 분쇄도를 고를 수 있어요.' },
    { tag: '휴무', date: '2026.10.28', title: '월요일은 로스팅 하는 날', text: '매주 월요일은 매장 문을 닫고 원두를 볶아요.' },
    { tag: '클래스', date: '2026.10.20', title: '홈 브루잉 클래스 준비 중', text: '일정이 정해지면 이곳과 카톡 채널로 알려 드릴게요.' }
  ];
  const list = $('#noticeList');
  list.innerHTML = notices.map((n, i) => `<article class="notice-item glass rv" style="--d:${i * 0.09}s"><span class="tag">${n.tag}</span><h3>${n.title}</h3><p>${n.text}</p><time>${n.date}</time></article>`).join('');
  watch(list);

  $('#year').textContent = new Date().getFullYear();
})();
