(function(){
'use strict';
// ====== CONFIG ======
const FPX_CHECKOUT_URL = "YOUR_FPX_PAYMENT_URL_HERE";
const PACKAGES = {
  start:{name:'INFINITE START',price:299,platforms:['Meta','TikTok','Google']},
  growth:{name:'INFINITE GROWTH',price:499,platforms:['Meta + TikTok','Meta + Google','TikTok + Google']},
  scale:{name:'INFINITE SCALE',price:699,platforms:['Meta + TikTok + Google']}
};
const $ = s => document.querySelector(s);
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

// Header scroll effect
const hdr = $('#hdr');
if(hdr){const f=()=>hdr.classList.toggle('sc',scrollY>20);addEventListener('scroll',f,{passive:true});f();}

// Mobile menu
const m=$('#mnav'),b=$('#burger'),c=$('#close');
if(m&&b){
  const set=o=>{m.classList.toggle('open',o);b.setAttribute('aria-expanded',o);document.body.style.overflow=o?'hidden':'';(o?c:b).focus();};
  b.onclick=()=>set(true);c.onclick=()=>set(false);
  m.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>set(false)));
  addEventListener('keydown',e=>{if(e.key==='Escape'&&m.classList.contains('open'))set(false);});
  matchMedia('(min-width:1024px)').addEventListener('change',e=>{if(e.matches)set(false);});
}

// Scroll reveal
const rv=document.querySelectorAll('.rv');
if('IntersectionObserver' in window&&!reduce){
  const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target);}}),{threshold:.12});
  rv.forEach(el=>io.observe(el));
}else rv.forEach(el=>el.classList.add('in'));

// 800+ counter
const num=$('#num');
if(num){
  const to=+num.dataset.to;
  const run=()=>{if(reduce){num.textContent=to+'+';return;}const t0=performance.now(),d=1800;
    (function step(t){const p=Math.min((t-t0)/d,1);num.textContent=Math.round(to*(1-Math.pow(1-p,3)))+(p===1?'+':'');if(p<1)requestAnimationFrame(step);})(t0);};
  if('IntersectionObserver' in window){const o=new IntersectionObserver(es=>{if(es[0].isIntersecting){run();o.disconnect();}},{threshold:.4});num.textContent='0';o.observe(num);}
}

// Industry marquee (list duplicated for seamless loop)
const track=$('#track');
if(track){
  const inds=[['PROPERTY','property'],['AUTOMOTIVE','automotive'],['RESTAURANTS & FOOD','restaurant'],['HEALTH & BEAUTY','spa'],['TAKAFUL & HIBAH','takaful'],['CLEANING','cleaning'],['RENOVATION','renovation'],['CAR RENTAL','car-rental'],['RECONDITIONED CARS','recon-cars'],['HOUSEHOLD REPAIR','repair'],['EDUCATION','education'],['AND MANY MORE','more']];
  const html=inds.map(([n,i])=>`<div class="ind"><div><img src="images/${i}.jpg" alt="${n.replace('&','and')}" loading="lazy" width="260" height="195"></div><span>${n.replace('&','&amp;')}</span></div>`).join('');
  track.innerHTML=html+html;
  track.querySelectorAll('img').forEach((im,k)=>{if(k>=inds.length){im.alt='';im.parentElement.parentElement.setAttribute('aria-hidden','true');}});
}

// Checkout
const form=$('#form');
if(form){
  const sel=$('#package'),plat=$('#platform');
  const fmt=n=>'RM'+n.toLocaleString('en-MY');
  const render=()=>{
    const p=PACKAGES[sel.value];
    $('#pname').textContent=p.name;
    $('#pprice').innerHTML=fmt(p.price)+'<small> / BULAN</small>';
    $('#pshort').textContent=p.name;$('#pfee').textContent=fmt(p.price);
    plat.innerHTML=p.platforms.map(x=>`<option>${x}</option>`).join('');
    history.replaceState(null,'','?package='+sel.value);
  };
  const q=new URLSearchParams(location.search).get('package');
  if(PACKAGES[q])sel.value=q;else sel.value='growth';
  sel.addEventListener('change',render);render();

  form.addEventListener('submit',e=>{
    e.preventDefault();let ok=true,first=null;
    form.querySelectorAll('[required]').forEach(el=>{
      const er=el.parentElement.querySelector('.err');let msg='';
      if(!el.value.trim())msg='This field is required.';
      else if(el.type==='email'&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(el.value))msg='Enter a valid email address.';
      else if(el.type==='tel'&&el.value.replace(/\D/g,'').length<9)msg='Enter a valid phone number.';
      if(er)er.textContent=msg;if(msg){ok=false;first=first||el;}
    });
    if(!ok){first.focus();return;}
    const p=PACKAGES[sel.value];
    // Price comes from PACKAGES (never from user input). Send `order` to your backend here before redirecting.
    const order={...Object.fromEntries(new FormData(form)),packageName:p.name,amount:p.price,currency:'MYR'};
    try{sessionStorage.setItem('im_order',JSON.stringify(order));}catch(_){}
    if(FPX_CHECKOUT_URL.indexOf('YOUR_')===0){alert('Payment URL not configured yet. Set FPX_CHECKOUT_URL in script.js.');return;}
    const u=new URL(FPX_CHECKOUT_URL);u.searchParams.set('package',sel.value);u.searchParams.set('amount',p.price);
    location.href=u.toString();
  });
}
})();
