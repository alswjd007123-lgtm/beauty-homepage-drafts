// 쇼트컷 클럽 · 화면 동작

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

// 얼굴형 + 길이 그림
const FACES = {
  round: { rx: 56, ry: 60 },
  oval: { rx: 50, ry: 66 },
  long: { rx: 44, ry: 76 },
  square: { rx: 52, ry: 64, square: true }
};
function faceSVG(faceKey, len) {
  const f = FACES[faceKey];
  const cx = 120, cy = 118, { rx, ry } = f;
  const top = cy - ry - 18;
  const W = rx + (len === 'short' ? 9 : 18);
  const endY = len === 'short' ? cy + 6 : len === 'bob' ? cy + ry - 4 : cy + ry + 58;
  const sag = len === 'short' ? -14 : 10;
  const back = `M${cx - W} ${endY} V${cy - 20} Q${cx - W} ${top} ${cx} ${top} Q${cx + W} ${top} ${cx + W} ${cy - 20} V${endY} Q${cx} ${endY + sag} ${cx - W} ${endY}Z`;
  const face = f.square
    ? `<path d="M${cx - rx} ${cy - ry + 30} Q${cx - rx} ${cy - ry} ${cx} ${cy - ry} Q${cx + rx} ${cy - ry} ${cx + rx} ${cy - ry + 30} V${cy + ry - 30} Q${cx + rx} ${cy + ry - 4} ${cx + rx - 26} ${cy + ry} H${cx - rx + 26} Q${cx - rx} ${cy + ry - 4} ${cx - rx} ${cy + ry - 30}Z" class="skin"/>`
    : `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" class="skin"/>`;
  const bang = `M${cx - rx - 6} ${cy - ry * 0.3} Q${cx - rx - 2} ${top + 2} ${cx} ${top + 2} Q${cx + rx + 2} ${top + 2} ${cx + rx + 6} ${cy - ry * 0.3} Q${cx + rx * 0.2} ${cy - ry * 0.78} ${cx - rx * 0.3} ${cy - ry * 0.55} Q${cx - rx * 0.8} ${cy - ry * 0.45} ${cx - rx - 6} ${cy - ry * 0.3}Z`;
  return `
    <path d="M28 260 Q36 214 96 204 V176 H144 V204 Q204 214 212 260Z" fill="#fff" stroke="#111" stroke-width="2.5"/>
    <path d="${back}" fill="#111"/>
    ${face}
    <path d="M${cx - 22} ${cy + 4} h12 M${cx + 10} ${cy + 4} h12" stroke="#111" stroke-width="3" stroke-linecap="round"/>
    <path d="M${cx - 12} ${cy + ry * 0.45} Q${cx} ${cy + ry * 0.55} ${cx + 12} ${cy + ry * 0.45}" stroke="#111" stroke-width="2.5" fill="none" stroke-linecap="round"/>
    <path d="${bang}" fill="#111"/>`;
}
const style = document.createElement('style');
style.textContent = '.face .skin{fill:#FBE6D6;stroke:#111;stroke-width:2.5}';
document.head.appendChild(style);
document.querySelectorAll('svg.face[data-face]').forEach(svg => { svg.innerHTML = faceSVG(svg.dataset.face, svg.dataset.len); });

// 미리보기 조작
const NAMES = { round: '둥근형', oval: '계란형', long: '긴 형', square: '각진 형', short: '숏컷', bob: '단발', mid: '중단발' };
const FACE_TIP = {
  round: '정수리에 볼륨을 주고 옆선은 차분하게 눌러 얼굴이 길어 보이게 해요.',
  oval: '어떤 길이도 잘 어울려요. 원하는 분위기로 골라 보세요.',
  long: '옆 볼륨과 앞머리로 가로선을 만들어 얼굴 길이를 줄여 보이게 해요.',
  square: '턱선에서 딱 끝나는 길이는 피하고, 끝을 가볍게 쳐서 각을 부드럽게 해요.'
};
const LEN_TIP = {
  short: '숏컷은 가마 방향이 중요해요. 상담 때 먼저 확인해요.',
  bob: '단발은 끝선 높이를 1cm 단위로 같이 정해요.',
  mid: '중단발은 레이어를 넣으면 손질이 쉬워져요.'
};
const pick = { face: 'oval', len: 'bob' };
const previewFace = document.getElementById('previewFace');
function update() {
  previewFace.innerHTML = faceSVG(pick.face, pick.len);
  previewFace.setAttribute('aria-label', `${NAMES[pick.face]} 얼굴에 ${NAMES[pick.len]} 미리보기`);
  document.getElementById('tipTitle').textContent = `${NAMES[pick.face]} × ${NAMES[pick.len]}`;
  document.getElementById('tipText').textContent = `${FACE_TIP[pick.face]} ${LEN_TIP[pick.len]}`;
}
document.querySelectorAll('.seg').forEach(seg => {
  seg.querySelectorAll('button').forEach(btn => btn.addEventListener('click', () => {
    pick[seg.dataset.key] = btn.dataset.v;
    seg.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(b === btn)));
    update();
  }));
});
update();
