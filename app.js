/* Paradise ordering — plain JS, no framework.
   Dishes: 4 unique AI plates. Nizami + Egg reuse the Chicken plate
   (different CSS tint / scale) — 4-image limit in the build task.
   See final build report for the plain note. */
const DISHES = [
  { id:0, name:"Chicken Dum Biryani", price:335, tag:"Bestseller", serves:"Serves 1 · Halal",
    desc:"Chicken and basmati rice cooked in layers, flavoured with saffron, served with raita and mirchi-ka-salan.",
    img:"images/chicken-dum-biryani.webp", tint:"", reuse:"",
    ingredients:["Saffron rice","Chicken","Fried onion","Mint","Mirchi ka salan","Raita"] },
  { id:1, name:"Mutton Dum Biryani", price:369, tag:"Classic", serves:"Serves 1 · Halal",
    desc:"Tender mutton layered with saffron basmati, served with raita and mirchi-ka-salan.",
    img:"images/mutton-dum-biryani.webp", tint:"", reuse:"",
    ingredients:["Saffron rice","Mutton","Fried onion","Mint","Mirchi ka salan","Raita"] },
  { id:2, name:"Special Nizami Chicken Dum Biryani", price:700, tag:"Serves 2 · 1.1 kg", serves:"Serves 2 · Halal",
    desc:"1.1 kg, 4 juicy chicken pieces, served with salan and raita.",
    img:"images/chicken-dum-biryani.webp", tint:"tint-gold", reuse:"Chicken plate",
    ingredients:["Saffron rice","Chicken ×4","Fried onion","Mint","Mirchi ka salan","Raita"] },
  { id:3, name:"Egg Biryani", price:350, tag:"Serves 1–2", serves:"Serves 1–2 · Halal",
    desc:"Egg layered with saffron basmati, served with salan and raita.",
    img:"images/chicken-dum-biryani.webp", tint:"tint-warm", reuse:"Chicken plate",
    ingredients:["Saffron rice","Egg","Fried onion","Mint","Mirchi ka salan","Raita"] },
  { id:4, name:"Royal Veg Dum Biryani", price:280, tag:"Veg · Serves 1", serves:"Serves 1",
    desc:"Fresh vegetables, saffron basmati, served with salan and raita.",
    img:"images/veg-dum-biryani.webp", tint:"", reuse:"",
    ingredients:["Saffron rice","Mixed veg","Fried onion","Mint","Mirchi ka salan","Raita"] },
  { id:5, name:"Double Ka Meetha", price:86, tag:"Dessert", serves:"Hyderabadi bread pudding",
    desc:"Hyderabadi bread pudding dessert.",
    img:"images/double-ka-meetha.webp", tint:"", reuse:"",
    ingredients:["Fried bread","Milk","Saffron","Almonds","Pistachio"] },
];
const TAX_RATE = 0.05;
const CART_KEY = "paradise-cart-v1";
const inr = n => "₹" + n.toLocaleString("en-IN");

let current = 0, rolling = false, wheelLock = 0;
let cart = loadCart(); // [{id, qty}]

const $ = s => document.querySelector(s);
const plateStage=$("#plateStage"), plate=$("#plate"), plateImg=$("#plateImg"),
  hero=$(".hero"), calloutsEl=$("#callouts"), svg=$("#calloutSvg"),
  cartBtn=$("#cartBtn"), cartDrawer=$("#cartDrawer"), overlay=$("#overlay");

/* ---- Dish switching: roll, never fade ---- */
const CALLOUT_POS = [ // [x%, y%] around the plate
  [50,1],[89,20],[89,79],[50,99],[11,79],[11,20]
];
function renderCallouts(dish){
  calloutsEl.innerHTML=""; svg.innerHTML="";
  dish.ingredients.forEach((ing,i)=>{
    const [x,y]=CALLOUT_POS[i % CALLOUT_POS.length];
    const el=document.createElement("span");
    el.className="callout"; el.textContent=ing;
    el.style.left=x+"%"; el.style.top=y+"%";
    calloutsEl.appendChild(el);
    // thin line from plate edge (centre 50,50, radius ~36) toward the label
    const ang=Math.atan2(y-50,x-50), ex=50+Math.cos(ang)*36, ey=50+Math.sin(ang)*36;
    const lx=50+(x-50)*0.92, ly=50+(y-50)*0.92;
    const ln=document.createElementNS("http://www.w3.org/2000/svg","line");
    ln.setAttribute("x1",ex*10); ln.setAttribute("y1",ey*10);
    ln.setAttribute("x2",lx*10); ln.setAttribute("y2",ly*10);
    svg.appendChild(ln);
    const c=document.createElementNS("http://www.w3.org/2000/svg","circle");
    c.setAttribute("cx",ex*10); c.setAttribute("cy",ey*10); c.setAttribute("r",7);
    svg.appendChild(c);
  });
}
function renderDish(i, animate){
  const d=DISHES[i];
  const apply=()=>{
    plateImg.src=d.img; plateImg.alt=d.name+" on a black plate, top-down";
    plateImg.className=d.tint||"";
    $("#dishIndex").textContent=String(i+1).padStart(2,"0");
    $("#dishTag").textContent=d.tag;
    $("#dishName").textContent=d.name;
    $("#dishDesc").textContent=d.desc;
    $("#dishServes").textContent=d.serves;
    $("#dishPrice").textContent=inr(d.price);
    $("#addPrice").textContent=inr(d.price);
    renderCallouts(d);
    document.querySelectorAll("#sideList li").forEach((li,j)=>li.classList.toggle("active",j===i));
    document.querySelectorAll("#dots button").forEach((b,j)=>b.classList.toggle("active",j===i));
  };
  if(!animate){ apply(); return; }
  rolling=true;
  plateStage.classList.add("rolling-out");
  setTimeout(()=>{
    apply();
    plateStage.classList.remove("rolling-out");
    plateStage.classList.add("rolling-in");
    setTimeout(()=>{ plateStage.classList.remove("rolling-in"); rolling=false; },520);
  },460);
}
function goTo(i){ if(rolling) return; current=(i+DISHES.length)%DISHES.length; renderDish(current,true); }
function next(){ goTo(current+1); } function prev(){ goTo(current-1); }

$("#nextBtn").addEventListener("click",next);
$("#prevBtn").addEventListener("click",prev);
document.addEventListener("keydown",e=>{
  if(e.target.matches("input,select,textarea")) return;
  if(e.key==="ArrowRight") next();
  if(e.key==="ArrowLeft") prev();
  if(e.key==="Escape") closeCart();
});
// Scroll on the plate switches dishes (page scroll still works elsewhere)
plateStage.addEventListener("wheel",e=>{
  e.preventDefault();
  const now=Date.now(); if(now-wheelLock<900) return; wheelLock=now;
  e.deltaY>0 ? next() : prev();
},{passive:false});

/* ---- Ingredient callouts: hover / tap pauses spin + dims rest ---- */
function showCallouts(on){
  plateStage.classList.toggle("show-callouts",on);
  plateStage.classList.toggle("paused",on);
  hero.classList.toggle("dimmed",on);
  $("#ingredientsBtn").setAttribute("aria-expanded",String(on));
}
plateStage.addEventListener("mouseenter",()=>showCallouts(true));
plateStage.addEventListener("mouseleave",()=>showCallouts(false));
plateStage.addEventListener("click",e=>{
  if(e.target.closest(".arrow")) return;
  showCallouts(!plateStage.classList.contains("show-callouts"));
});
$("#ingredientsBtn").addEventListener("click",()=>showCallouts(!plateStage.classList.contains("show-callouts")));

/* ---- Side list + dots + full menu grid ---- */
const sideList=$("#sideList"), dots=$("#dots"), menuGrid=$("#menuGrid");
DISHES.forEach((d,i)=>{
  const li=document.createElement("li");
  li.innerHTML=`<img src="${d.img}" alt="" class="${d.tint}"><span><span class="sl-name">${d.name}</span><span class="sl-price">${inr(d.price)}</span></span>`;
  li.addEventListener("click",()=>goTo(i));
  sideList.appendChild(li);
  const dot=document.createElement("button");
  dot.type="button"; dot.setAttribute("aria-label","Show "+d.name);
  dot.addEventListener("click",()=>goTo(i));
  dots.appendChild(dot);
  const card=document.createElement("article");
  card.className="menu-card "+(d.tint||"");
  card.innerHTML=`<img src="${d.img}" alt="${d.name}"><div class="mc-body"><h3>${d.name}</h3><p>${d.desc}</p><div class="mc-foot"><strong>${inr(d.price)}</strong><button type="button" data-add="${d.id}">Add +</button></div></div>`;
  menuGrid.appendChild(card);
});
menuGrid.addEventListener("click",e=>{
  const b=e.target.closest("[data-add]"); if(b) addToCart(+b.dataset.add, b);
});

/* ---- Cart (localStorage) ---- */
function loadCart(){ try{ return JSON.parse(localStorage.getItem(CART_KEY))||[]; }catch(_){ return []; } }
function saveCart(){ localStorage.setItem(CART_KEY, JSON.stringify(cart)); }
function cartQty(){ return cart.reduce((s,i)=>s+i.qty,0); }
function cartSubtotal(){ return cart.reduce((s,i)=>s + DISHES[i.id].price*i.qty,0); }
function totals(){
  const sub=cartSubtotal(), tax=Math.round(sub*TAX_RATE), total=sub+tax;
  return {sub,tax,total};
}
function renderCart(){
  $("#cartCount").textContent=cartQty();
  const items=$("#cartItems"); items.innerHTML="";
  $("#cartEmpty").style.display=cart.length?"none":"block";
  $("#cartSummary").hidden=!cart.length;
  cart.forEach(ci=>{
    const d=DISHES[ci.id];
    const li=document.createElement("li");
    li.innerHTML=`<img src="${d.img}" alt="" class="${d.tint}">
      <div class="ci-info"><strong>${d.name}</strong><span>${inr(d.price)} each</span></div>
      <div class="qty"><button type="button" data-dec="${d.id}" aria-label="Decrease">−</button><span>${ci.qty}</span><button type="button" data-inc="${d.id}" aria-label="Increase">+</button></div>
      <strong>${inr(d.price*ci.qty)}</strong>`;
    items.appendChild(li);
  });
  const t=totals();
  $("#subTotal").textContent=inr(t.sub);
  $("#taxAmt").textContent=inr(t.tax);
  $("#grandTotal").textContent=inr(t.total);
}
$("#cartItems").addEventListener("click",e=>{
  const inc=e.target.closest("[data-inc]"), dec=e.target.closest("[data-dec]");
  if(inc) changeQty(+inc.dataset.inc,1);
  if(dec) changeQty(+dec.dataset.dec,-1);
});
function changeQty(id,delta){
  const it=cart.find(c=>c.id===id); if(!it) return;
  it.qty+=delta; if(it.qty<=0) cart=cart.filter(c=>c.id!==id);
  saveCart(); renderCart();
}
function animateTotal(from,to){
  const el=$("#grandTotal");
  if(typeof requestAnimationFrame!=="function"){ el.textContent=inr(to); return; }
  const t0=performance.now();
  (function tick(t){
    const p=Math.min(1,(t-t0)/400), v=Math.round(from+(to-from)*p);
    el.textContent=inr(v); if(p<1) requestAnimationFrame(tick);
  })(t0);
}
function addToCart(id, fromEl){
  const before=totals().total;
  const it=cart.find(c=>c.id===id);
  it ? it.qty++ : cart.push({id,qty:1});
  saveCart(); renderCart();
  animateTotal(before, totals().total);
  flyToCart(id);
}
$("#addBtn").addEventListener("click",e=>addToCart(current, e.currentTarget));

/* ---- Fly to cart ---- */
function flyToCart(dishId){
  const r=plateImg.getBoundingClientRect(), target=cartBtn.getBoundingClientRect();
  const clone=plateImg.cloneNode();
  clone.className="fly-clone"; clone.src=DISHES[dishId].img;
  clone.style.left=(r.left+r.width/2-45)+"px"; clone.style.top=(r.top+r.height/2-45)+"px";
  document.body.appendChild(clone);
  const dx=target.left+target.width/2-(r.left+r.width/2), dy=target.top+target.height/2-(r.top+r.height/2);
  cartBtn.classList.add("fly-target");
  const finish=()=>{ clone.remove(); cartBtn.classList.remove("fly-target"); };
  if(typeof clone.animate!=="function"){ setTimeout(finish,300); return; }
  clone.animate([
    {transform:"translate(0,0) scale(1)",opacity:1},
    {transform:`translate(${dx*0.5}px,${dy-140}px) scale(.65)`,opacity:1,offset:.55},
    {transform:`translate(${dx}px,${dy}px) scale(.18)`,opacity:.4}
  ],{duration:750,easing:"cubic-bezier(.3,.7,.4,1)"}).onfinish=finish;
}

/* ---- Cart drawer ---- */
function openCart(){ cartDrawer.classList.add("open"); cartDrawer.setAttribute("aria-hidden","false"); overlay.hidden=false; }
function closeCart(){ cartDrawer.classList.remove("open"); cartDrawer.setAttribute("aria-hidden","true"); overlay.hidden=true; }
cartBtn.addEventListener("click",openCart);
$("#closeCart").addEventListener("click",closeCart);
overlay.addEventListener("click",closeCart);

/* Pickup slots: today 11:30 AM – 10:00 PM, every 30 min, future slots only */
(function(){
  const sel=$("#pickupSlot");
  const now=new Date();
  const startMin=Math.max(11*60+30, Math.ceil((now.getHours()*60+now.getMinutes()+30)/30)*30);
  let day="Today";
  let first=startMin;
  if(first>22*60){ day="Tomorrow"; first=11*60+30; }
  for(let t=first; t<=22*60; t+=30){
    const h=Math.floor(t/60), m=t%60;
    const ap=h<12?"AM":"PM", hh=((h+11)%12)+1;
    const label=`${day}, ${hh}:${m===0?"00":"30"} ${ap}`;
    const o=document.createElement("option"); o.textContent=label; sel.appendChild(o);
  }
})();

/* ---- Place order + tracker ---- */
let trackerTimer=null;
$("#placeOrderBtn").addEventListener("click",()=>{
  const err=$("#formError");
  const name=$("#custName").value.trim();
  if(!cart.length){ err.textContent="Your cart is empty."; err.hidden=false; return; }
  if(!name){ err.textContent="Please enter your name for pickup."; err.hidden=false; $("#custName").focus(); return; }
  if(!$("#pickupSlot").value){ err.textContent="Please choose a pickup time."; err.hidden=false; return; }
  err.hidden=true;
  const t=totals();
  const no="PRD-"+String(Date.now()).slice(-6);
  $("#orderNo").textContent=no;
  $("#confirmText").textContent=`Thank you, ${name}. Your order of ${cartQty()} item${cartQty()>1?"s":""} (${inr(t.total)}) is being prepared.`;
  $("#confirmMeta").textContent=`Pickup: ${$("#pickupOutlet").value} · ${$("#pickupSlot").value} · Pay at pickup`;
  document.querySelectorAll("#tracker li").forEach(li=>li.className="");
  document.querySelector('[data-step="placed"]').classList.add("active");
  $("#confirmModal").hidden=false;
  closeCart();
  clearInterval(trackerTimer);
  let step=0;
  trackerTimer=setInterval(()=>{
    step++;
    const lis=document.querySelectorAll("#tracker li");
    if(step===1){ lis[0].className="done"; lis[1].classList.add("active"); }
    if(step===2){ lis[1].className="done"; lis[2].classList.add("active"); clearInterval(trackerTimer); }
  },4000);
  cart=[]; saveCart(); renderCart();
});
$("#confirmDone").addEventListener("click",()=>{
  $("#confirmModal").hidden=true; clearInterval(trackerTimer);
});

/* Init */
renderDish(0,false);
renderCart();
