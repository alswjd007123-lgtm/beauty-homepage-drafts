// loader
addEventListener('load',()=>setTimeout(()=>document.body.classList.add('ready'),700));
setTimeout(()=>document.body.classList.add('ready'),3000);
document.querySelector('.m-toggle').onclick=()=>document.body.classList.toggle('open');
document.querySelectorAll('nav a').forEach(a=>a.onclick=()=>document.body.classList.remove('open'));

// cursor
const cur=document.querySelector('.cursor');
let mx=0,my=0,cx=0,cy=0;
addEventListener('mousemove',e=>{mx=e.clientX;my=e.clientY});
(function loop(){cx+=(mx-cx)*.2;cy+=(my-cy)*.2;cur.style.transform=`translate(${cx}px,${cy}px)`;requestAnimationFrame(loop)})();
document.querySelectorAll('a,button,.h-card,.tile').forEach(el=>{
  el.addEventListener('mouseenter',()=>cur.classList.add('big'));
  el.addEventListener('mouseleave',()=>cur.classList.remove('big'));
});

// mosaic mouse parallax
const tiles=[...document.querySelectorAll('.tile')];
document.querySelector('.mosaic').addEventListener('mousemove',e=>{
  const x=e.clientX/innerWidth-.5,y=e.clientY/innerHeight-.5;
  tiles.forEach(t=>{const d=+t.dataset.depth;t.querySelector('img').style.transform=`scale(1.1) translate(${x*d}px,${y*d}px)`});
});

// statement words light up on scroll
const wp=document.getElementById('words');
wp.innerHTML=wp.textContent.split(' ').map(w=>`<span class="w">${w}</span>`).join(' ');
const ws=[...wp.querySelectorAll('.w')];

// horizontal scroll section
const hs=document.querySelector('.hscroll'),track=document.querySelector('.h-track'),bar=document.querySelector('.h-prog i'),hc=document.getElementById('hCount');
function sizeH(){hs.style.height=(track.scrollWidth-innerWidth+innerHeight+80)+'px'}
addEventListener('resize',sizeH);addEventListener('load',sizeH);sizeH();

function onScroll(){
  const r=wp.getBoundingClientRect(),p=Math.min(Math.max((innerHeight*.8-r.top)/(r.height+innerHeight*.3),0),1);
  ws.forEach((w,i)=>w.classList.toggle('on',i/ws.length<p));

  const hr=hs.getBoundingClientRect(),max=track.scrollWidth-innerWidth+80;
  const hp=Math.min(Math.max(-hr.top/(hs.offsetHeight-innerHeight),0),1);
  track.style.transform=`translateX(${-hp*max}px)`;
  bar.style.transform=`scaleX(${hp})`;
  hc.textContent=String(Math.min(7,Math.floor(hp*6.99)+1)).padStart(2,'0');
}
addEventListener('scroll',onScroll,{passive:true});onScroll();

// reveal
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{threshold:.15});
document.querySelectorAll('.rv').forEach(el=>io.observe(el));

// color chips
const nails=[...document.querySelectorAll('.nail')],chips=[...document.querySelectorAll('.chip')],cn=document.getElementById('cName');
function paint(c){nails.forEach((n,i)=>setTimeout(()=>n.setAttribute('fill',c.dataset.c),i*90));cn.innerHTML=`${c.dataset.k}<small>${c.dataset.n}</small>`}
chips.forEach(c=>c.onclick=()=>{chips.forEach(x=>x.classList.toggle('on',x===c));paint(c)});
paint(chips[0]);

// menu filter + floating image
document.querySelectorAll('.cat button').forEach(b=>b.onclick=()=>{
  document.querySelectorAll('.cat button').forEach(x=>x.classList.toggle('on',x===b));
  document.querySelectorAll('.m-row').forEach(r=>r.classList.toggle('hide',b.dataset.f!=='all'&&r.dataset.c!==b.dataset.f));
});
const fi=document.querySelector('.float-img'),fimg=fi.querySelector('img');
let fx=0,fy=0;
document.querySelectorAll('.m-row').forEach(r=>{
  r.addEventListener('mouseenter',()=>{fimg.src=r.dataset.img;fi.classList.add('on')});
  r.addEventListener('mouseleave',()=>fi.classList.remove('on'));
});
addEventListener('mousemove',e=>{fi.style.left=e.clientX+160+'px';fi.style.top=e.clientY+'px'});

// 다듬기: 모바일 슬라이드 메뉴 (딤 클릭 · ESC로 닫기, 스크린리더 상태 안내)
const mBtn=document.querySelector('.m-toggle');
function setMenu(open){
  document.body.classList.toggle('open',open);
  mBtn.setAttribute('aria-expanded',open);
  mBtn.setAttribute('aria-label',open?'메뉴 닫기':'메뉴 열기');
  mBtn.textContent=open?'닫기':'메뉴';
}
mBtn.onclick=()=>setMenu(!document.body.classList.contains('open'));
document.querySelector('.m-dim').onclick=()=>setMenu(false);
document.querySelectorAll('nav a').forEach(a=>a.onclick=()=>setMenu(false));
addEventListener('keydown',e=>{if(e.key==='Escape')setMenu(false)});

// 메뉴 분류 버튼 선택 상태 안내
document.querySelectorAll('.cat button').forEach(b=>b.addEventListener('click',()=>{
  document.querySelectorAll('.cat button').forEach(x=>x.setAttribute('aria-pressed',x===b));
}));

// 움직임 줄이기 설정 시 로딩 화면 바로 넘기기
if(matchMedia('(prefers-reduced-motion: reduce)').matches)document.body.classList.add('ready');
