// 시안9 포지 퍼스널 트레이닝
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
    const DURATION = 5500;
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
  $$('.stats-grid, .index-list, .coach-grid, .price-grid, .faq-list').forEach((g) => {
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

  // 스티키 섹션: 보이는 단계에 맞춰 사진과 글자 교체
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
        if (num) num.textContent = en.target.dataset.label;
      });
    }, { rootMargin: '-45% 0px -45% 0px' });
    items.forEach((x) => sio.observe(x));
  });

  // 흐르는 띠 (사진·글자)
  $$('.marquee-track').forEach((t) => { t.innerHTML += t.innerHTML; });

  // 스크롤 묶음 처리: 진행 바, 헤더 숨김, 맨 위로, 패럴랙스, 하단 바
  const header = $('#header');
  const progress = $('#progress');
  const topBtn = $('#toTop');
  const bottomBar = $('.bottom-bar');
  const pxEls = $$('[data-parallax]');
  let lastY = window.scrollY, ticking = false;
  const onScroll = () => {
    const y = window.scrollY;
    const down = y > lastY;
    const max = document.documentElement.scrollHeight - innerHeight;
    progress.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
    header.classList.toggle('scrolled', y > 40);
    header.classList.toggle('hide', down && y > 500 && !body.classList.contains('menu-open'));
    if (topBtn) topBtn.classList.toggle('show', y > 900);
    if (bottomBar) bottomBar.style.transform = down && y > 500 ? 'translateY(110%)' : '';
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

  /* ---------- 시안9 전용 ---------- */

  // 프로그램 펼치기
  $$('.row-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const open = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!open));
      document.getElementById(btn.getAttribute('aria-controls')).hidden = open;
    });
  });

  // 프로그램 목록: 커서를 따라오는 사진 (PC, 움직임 줄이기 아닐 때)
  if (fine && !reduce) {
    const hover = $('#hoverImg');
    const himg = $('img', hover);
    let tx = 0, ty = 0, cx = 0, cy = 0, raf = null;
    const follow = () => {
      cx += (tx - cx) * 0.18; cy += (ty - cy) * 0.18;
      hover.style.left = `${cx}px`; hover.style.top = `${cy}px`;
      raf = Math.abs(tx - cx) + Math.abs(ty - cy) > 0.5 ? requestAnimationFrame(follow) : null;
    };
    $$('.row').forEach((row) => {
      const btn = $('.row-btn', row);
      btn.addEventListener('pointerenter', (e) => {
        himg.src = row.dataset.img;
        tx = cx = e.clientX; ty = cy = e.clientY;
        follow();
        hover.classList.add('on');
      });
      btn.addEventListener('pointermove', (e) => {
        tx = e.clientX; ty = e.clientY;
        if (!raf) raf = requestAnimationFrame(follow);
      });
      btn.addEventListener('pointerleave', () => hover.classList.remove('on'));
    });
  }

  // 단계형 체험 신청 폼
  const form = $('#trialForm');
  const sets = $$('.fs', form);
  const dots = $$('.steps-bar span', form);
  const label = $('#stepLabel');
  const msg = $('#formMsg');
  const prevBtn = $('#prevBtn');
  const nextBtn = $('#nextBtn');
  const submitBtn = $('#submitBtn');
  const names = ['목표', '시간대', '연락처'];
  let step = 0;
  const show = (i) => {
    step = i;
    sets.forEach((s, idx) => { s.hidden = idx !== i; });
    dots.forEach((d, idx) => d.classList.toggle('on', idx <= i));
    label.textContent = `${i + 1} / 3 · ${names[i]}`;
    prevBtn.hidden = i === 0;
    nextBtn.hidden = i === sets.length - 1;
    submitBtn.hidden = i !== sets.length - 1;
    msg.textContent = '';
  };
  const valid = (i) => {
    const fields = $$('input', sets[i]);
    const radios = fields.filter((f) => f.type === 'radio');
    if (radios.length && !radios.some((r) => r.checked)) { msg.textContent = '하나를 골라 주세요.'; return false; }
    const bad = fields.find((f) => f.type !== 'radio' && !f.checkValidity());
    if (bad) {
      msg.textContent = bad.type === 'checkbox' ? '개인정보 수집·이용에 동의해 주세요.' : `${bad.name}을(를) 입력해 주세요.`;
      bad.focus();
      return false;
    }
    return true;
  };
  nextBtn.addEventListener('click', () => { if (valid(step)) show(step + 1); });
  prevBtn.addEventListener('click', () => show(step - 1));
  // 선택하면 자동으로 다음 단계
  sets.slice(0, 2).forEach((s, i) => s.addEventListener('change', () => setTimeout(() => { if (step === i) show(i + 1); }, 260)));
  form.addEventListener('submit', (e) => {
    e.preventDefault(); // 외부 폼 연결 전까지는 전송하지 않음
    if (!valid(step)) return;
    sets.forEach((s) => { s.hidden = true; });
    $('.form-nav', form).hidden = true;
    label.textContent = '완료';
    $('#done').hidden = false;
  });

  $('#year').textContent = new Date().getFullYear();
})();
