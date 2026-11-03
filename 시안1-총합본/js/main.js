// header
const hd=document.getElementById('hd');
addEventListener('scroll',()=>hd.classList.toggle('scrolled',scrollY>60));
document.querySelector('.menu-btn').onclick=()=>document.body.classList.toggle('open');
document.querySelectorAll('.m-nav a').forEach(a=>a.onclick=()=>document.body.classList.remove('open'));

// hero slider + thumbnail progress
const slides=[...document.querySelectorAll('.slide')],thumbs=[...document.querySelectorAll('.thumb')];
let cur=0,timer;
function go(i){
  slides[cur].classList.remove('on');thumbs[cur].classList.remove('on');
  cur=i;void thumbs[cur].offsetWidth;
  slides[cur].classList.add('on');thumbs[cur].classList.add('on');
  clearTimeout(timer);timer=setTimeout(()=>go((cur+1)%slides.length),6000);
}
thumbs.forEach(t=>t.onclick=()=>go(+t.dataset.i));
timer=setTimeout(()=>go(1),6000);

// reveal + counters
const io=new IntersectionObserver(es=>es.forEach(e=>{
  if(!e.isIntersecting)return;
  e.target.classList.add('in');io.unobserve(e.target);
  e.target.querySelectorAll('[data-count]').forEach(n=>{
    const end=+n.dataset.count,t0=performance.now();
    (function tick(t){const p=Math.min((t-t0)/1600,1);n.textContent=Math.round(end*(1-Math.pow(1-p,3)));if(p<1)requestAnimationFrame(tick)})(t0);
  });
}),{threshold:.2});
document.querySelectorAll('.rv,.mask').forEach(el=>io.observe(el));

// sticky program: swap image by active item
const pImgs=[...document.querySelectorAll('.prog-visual img')],pItems=[...document.querySelectorAll('.prog-item')];
const pio=new IntersectionObserver(es=>es.forEach(e=>{
  if(!e.isIntersecting)return;
  const i=+e.target.dataset.i;
  pItems.forEach(x=>x.classList.toggle('on',x===e.target));
  pImgs.forEach((im,k)=>im.classList.toggle('on',k===i));
}),{rootMargin:'-45% 0px -45% 0px'});
pItems.forEach(x=>pio.observe(x));

// price tabs
const tabs=[...document.querySelectorAll('.tab')],panels=[...document.querySelectorAll('.price-panel')];
tabs.forEach(t=>t.onclick=()=>{tabs.forEach(x=>x.classList.toggle('on',x===t));panels.forEach((p,k)=>p.classList.toggle('on',k==t.dataset.t))});

// review marquee loop (duplicate cards)
const mq=document.getElementById('mq');mq.innerHTML+=mq.innerHTML;

// parallax
const px=document.querySelector('[data-parallax]');
addEventListener('scroll',()=>{
  const r=px.parentElement.getBoundingClientRect();
  if(r.bottom>0&&r.top<innerHeight)px.style.transform=`translateY(${(r.top-innerHeight/2)*-.15}px)`;
},{passive:true});

// 다듬기: 모바일 슬라이드 메뉴 (딤 클릭 · ESC로 닫기, 스크린리더 상태 안내)
const mBtn=document.querySelector('.menu-btn');
function setMenu(open){
  document.body.classList.toggle('open',open);
  mBtn.setAttribute('aria-expanded',open);
  mBtn.setAttribute('aria-label',open?'메뉴 닫기':'메뉴 열기');
}
mBtn.onclick=()=>setMenu(!document.body.classList.contains('open'));
document.querySelector('.m-dim').onclick=()=>setMenu(false);
document.querySelectorAll('.m-nav a').forEach(a=>a.onclick=()=>setMenu(false));
addEventListener('keydown',e=>{if(e.key==='Escape')setMenu(false)});

// 히어로 썸네일 키보드 조작
const reduceMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;
thumbs.forEach(t=>{
  t.tabIndex=0;t.setAttribute('role','button');
  t.setAttribute('aria-label',t.querySelector('b').textContent+' 슬라이드 보기');
  t.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();go(+t.dataset.i);if(reduceMotion)clearTimeout(timer)}};
});
// 움직임 줄이기 설정 시 자동 넘김 멈춤
if(reduceMotion){clearTimeout(timer);thumbs.forEach(t=>t.addEventListener('click',()=>clearTimeout(timer)))}
