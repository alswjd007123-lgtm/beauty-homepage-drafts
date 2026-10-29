// header hide on scroll down
const hd=document.getElementById('hd'),toTop=document.getElementById('toTop');let last=0;
addEventListener('scroll',()=>{const y=scrollY;hd.classList.toggle('hide',y>last&&y>200);last=y;toTop.classList.toggle('on',y>600)},{passive:true});
document.querySelector('.burger').onclick=()=>document.body.classList.toggle('open');
document.querySelectorAll('.m-nav a').forEach(a=>a.onclick=()=>document.body.classList.remove('open'));

// rotating keyword
const rot=document.querySelector('.rotator span'),words=['레이어드 컷','빌드펌','발레아쥬','두피 클리닉'];let wi=0;
const rotTimer=setInterval(()=>{rot.style.transform='translateY(-110%)';setTimeout(()=>{wi=(wi+1)%words.length;rot.style.transition='none';rot.style.transform='translateY(110%)';rot.textContent=words[wi];void rot.offsetWidth;rot.style.transition='';rot.style.transform='none'},450)},2600);

// reveal + counters
const io=new IntersectionObserver(es=>es.forEach(e=>{
  if(!e.isIntersecting)return;e.target.classList.add('in');io.unobserve(e.target);
  e.target.querySelectorAll('[data-n]').forEach(n=>{const end=+n.dataset.n,t0=performance.now();
    (function f(t){const p=Math.min((t-t0)/1500,1);n.textContent=Math.round(end*(1-Math.pow(1-p,4))).toLocaleString();if(p<1)requestAnimationFrame(f)})(t0)});
}),{threshold:.2});
document.querySelectorAll('.rv,.hl').forEach(el=>io.observe(el));

// before/after drag
const cmp=document.getElementById('cmp'),bf=cmp.querySelector('.before'),hdl=cmp.querySelector('.handle');let drag=false;
function setCmp(x){const r=cmp.getBoundingClientRect(),p=Math.min(Math.max((x-r.left)/r.width,0),1)*100;bf.style.clipPath=`inset(0 ${100-p}% 0 0)`;hdl.style.left=p+'%'}
cmp.addEventListener('pointerdown',e=>{drag=true;setCmp(e.clientX)});
addEventListener('pointermove',e=>drag&&setCmp(e.clientX));
addEventListener('pointerup',()=>drag=false);

// FAQ
document.querySelectorAll('.q button').forEach(b=>b.onclick=()=>{const q=b.parentElement,on=q.classList.contains('on');document.querySelectorAll('.q').forEach(x=>x.classList.remove('on'));if(!on)q.classList.add('on')});

// booking
const state={svc:null,des:null,date:null,time:null,price:0};
function pop(id,v){const el=document.getElementById(id);el.textContent=v;el.classList.add('pop');setTimeout(()=>el.classList.remove('pop'),300)}
function bindOpts(box){box.querySelectorAll('.opt').forEach(o=>o.onclick=()=>{
  box.querySelectorAll('.opt').forEach(x=>x.classList.toggle('on',x===o));
  const k=box.dataset.k;state[k]=o.dataset.v;pop('s-'+k,o.dataset.v);
  if(k==='svc'){state.price=+o.dataset.p;document.getElementById('s-price').textContent=state.price.toLocaleString()}
})}
document.querySelectorAll('.opts[data-k]:not(#times)').forEach(bindOpts);

const days=['일','월','화','수','목','금','토'],dBox=document.getElementById('dates'),tBox=document.getElementById('times');
for(let i=0;i<7;i++){
  const d=new Date();d.setDate(d.getDate()+i);
  const b=document.createElement('button');b.className='date'+(d.getDay()===2?' off':'');
  b.innerHTML=`<small>${i===0?'오늘':days[d.getDay()]}</small><b>${d.getDate()}</b>`;
  b.onclick=()=>{dBox.querySelectorAll('.date').forEach(x=>x.classList.toggle('on',x===b));state.date=`${d.getMonth()+1}/${d.getDate()} (${days[d.getDay()]})`;pop('s-date',state.date);renderTimes(i)};
  dBox.appendChild(b);
}
function renderTimes(seed){
  const slots=['10:30','11:30','13:00','14:00','15:30','17:00','18:30','19:30'];
  tBox.innerHTML=slots.map((s,i)=>`<button class="opt" data-v="${s}" ${(i*3+seed)%4===0?'disabled':''}>${s}</button>`).join('');
  state.time=null;pop('s-time','-');bindOpts(tBox);
}
renderTimes(0);

const toast=document.getElementById('toast');
document.getElementById('bkBtn').onclick=()=>{
  const miss=['svc','des','date','time'].filter(k=>!state[k]);
  toast.textContent=miss.length?'시술 · 디자이너 · 날짜 · 시간을 모두 선택해 주세요':`${state.date} ${state.time} 선택 완료! 네이버 예약에서 확정해 주세요`;
  toast.classList.add('on');setTimeout(()=>toast.classList.remove('on'),2600);
};

// 다듬기: 모바일 슬라이드 메뉴 (딤 클릭 · ESC로 닫기, 스크린리더 상태 안내)
const burger=document.querySelector('.burger');
function setMenu(open){
  document.body.classList.toggle('open',open);
  burger.setAttribute('aria-expanded',open);
  burger.setAttribute('aria-label',open?'메뉴 닫기':'메뉴 열기');
  burger.textContent=open?'✕':'☰';
}
burger.onclick=()=>setMenu(!document.body.classList.contains('open'));
document.querySelector('.m-dim').onclick=()=>setMenu(false);
document.querySelectorAll('.m-nav a').forEach(a=>a.onclick=()=>setMenu(false));
addEventListener('keydown',e=>{if(e.key==='Escape')setMenu(false)});

// 비포·애프터 방향키 조작
let cmpPos=50;
function moveCmp(p){cmpPos=Math.min(100,Math.max(0,p));bf.style.clipPath=`inset(0 ${100-cmpPos}% 0 0)`;hdl.style.left=cmpPos+'%';cmp.setAttribute('aria-valuenow',Math.round(cmpPos))}
cmp.addEventListener('keydown',e=>{
  if(e.key!=='ArrowLeft'&&e.key!=='ArrowRight')return;
  e.preventDefault();moveCmp(cmpPos+(e.key==='ArrowRight'?5:-5));
});
cmp.addEventListener('pointerup',()=>moveCmp(parseFloat(hdl.style.left)||50));

// 자주 묻는 질문 펼침 상태 안내
const syncFaq=()=>document.querySelectorAll('.q').forEach(q=>q.querySelector('button').setAttribute('aria-expanded',q.classList.contains('on')));
document.querySelectorAll('.q button').forEach(b=>b.addEventListener('click',syncFaq));
syncFaq();

// 움직임 줄이기 설정 시 키워드 회전 멈춤
if(matchMedia('(prefers-reduced-motion: reduce)').matches)clearInterval(rotTimer);
