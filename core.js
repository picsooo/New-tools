/* NTB maquette — état, en-tête, dock de versions, panier & devis */
const S={get(k,d){try{const v=localStorage.getItem('ntb_'+k);return v===null?d:JSON.parse(v)}catch(e){return d}},set(k,v){try{localStorage.setItem('ntb_'+k,JSON.stringify(v))}catch(e){}}};
const qp=new URLSearchParams(location.search);
if(qp.get('v')==='a'||qp.get('v')==='b')S.set('v',qp.get('v'));
if(qp.get('mode')==='shop'||qp.get('mode')==='devis')S.set('mode',qp.get('mode'));
const V=S.get('v','a'),MODE=S.get('mode','shop');
document.documentElement.dataset.v=V;document.documentElement.dataset.mode=MODE;
const DA=n=>n.toLocaleString('fr-FR').replace(/\u202f|\u00a0/g,' ')+' DA';
const esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;');
const FALLBACK=(label)=>'data:image/svg+xml;utf8,'+encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"><rect width="400" height="400" fill="#e9ecf2"/><g fill="none" stroke="#9aa6bd" stroke-width="10" stroke-linecap="round"><path d="M120 280l110-110M250 120l40 40-40 40-40-40z"/></g><text x="200" y="350" text-anchor="middle" font-family="Arial" font-size="26" fill="#6c7892">${label}</text></svg>`);
function pimgSrc(p){return p.img||catOf(p.cat).img}
function bigTag(p,cls){if(!p.big)return imgTag(pimgSrc(p),p.n,cls,p.b);return `<img class="${cls||''}" src="${p.big}" alt="${esc(p.n)}" referrerpolicy="no-referrer" onerror="this.onerror=function(){this.onerror=null;this.src=FALLBACK('${esc(p.b)}')};this.src='${p.img}'">`}
function imgTag(src,alt,cls,label){return `<img class="${cls||''}" src="${src}" alt="${esc(alt)}" loading="lazy" referrerpolicy="no-referrer" onerror="this.onerror=null;this.src=FALLBACK('${esc(label||'NTB')}')">`}
const Cart={get:()=>S.get('cart',[]),save:c=>{S.set('cart',c);Chrome.counts()},
 add(id,qty,variant){const c=Cart.get();const k=id+'|'+(variant||'');const l=c.find(x=>x.k===k);if(l)l.q+=qty;else c.push({k,id,v:variant||'',q:qty});Cart.save(c)},
 price(l){const p=byId(l.id);if(p.vars&&l.v){const o=p.vars.o.find(x=>x[0]===l.v);if(o)return o[1]}return p.p},
 total(){return Cart.get().reduce((s,l)=>s+Cart.price(l)*l.q,0)},count(){return Cart.get().reduce((s,l)=>s+l.q,0)}};
const Quote={get:()=>S.get('quote',[]),save:c=>{S.set('quote',c);Chrome.counts()},
 add(id,qty,variant){const c=Quote.get();const k=id+'|'+(variant||'');const l=c.find(x=>x.k===k);if(l)l.q+=qty;else c.push({k,id,v:variant||'',q:qty});Quote.save(c)},count(){return Quote.get().reduce((s,l)=>s+l.q,0)}};
function toast(html){let t=document.getElementById('toast');if(!t){t=document.createElement('div');t.id='toast';document.body.appendChild(t)}t.innerHTML=html;t.classList.add('on');clearTimeout(t._h);t._h=setTimeout(()=>t.classList.remove('on'),3200)}
function addItem(id,qty,variant){const p=byId(id);if(MODE==='devis'){Quote.add(id,qty,variant);toast(`<b>Ajouté à votre demande de devis</b><span>${esc(p.n)}${variant?' · '+esc(variant):''} × ${qty}</span><a href="devis.html">Voir ma demande →</a>`)}else{Cart.add(id,qty,variant);toast(`<b>Ajouté au panier</b><span>${esc(p.n)}${variant?' · '+esc(variant):''} × ${qty}</span><a href="panier.html">Voir le panier →</a>`)}}
function card(p){const c=catOf(p.cat);return `<article class="pcard">
 <a class="pimg" href="produit.html?id=${p.id}">${imgTag(pimgSrc(p),p.n,'',p.b)}${p.tag?`<span class="ptag">${p.tag}</span>`:''}${p.img?'':'<span class="nophoto">Visuel famille — photo produit à venir</span>'}<span class="pst"><i></i>Voir la fiche</span></a>
 <div class="pbody"><div class="pmeta"><span>${p.b}</span><span class="mono">${p.sku}</span></div>
 <h3><a href="produit.html?id=${p.id}">${esc(p.n)}</a></h3><p class="pcat">${c.n}</p>
 <div class="pfoot">${MODE==='shop'?`<b class="price">${p.vars?'dès ':''}${DA(p.vars?Math.min(...p.vars.o.map(o=>o[1])):p.p)}</b>`:'<b class="price q">Prix sur devis</b>'}
 <button class="addbtn" onclick="addItem('${p.id}',1,${p.vars?`'${esc(p.vars.o[0][0])}'`:'null'})" aria-label="${MODE==='shop'?'Ajouter au panier':'Ajouter au devis'}">${MODE==='shop'?ICO.cart:ICO.doc}<span>${MODE==='shop'?'Ajouter':'Au devis'}</span></button></div></div></article>`}
const ICO={cart:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 4h2l2.4 11.2a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.5L21 8H6.2"/><circle cx="10" cy="20" r="1.4"/><circle cx="17" cy="20" r="1.4"/></svg>',
 doc:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M9 13h6M9 17h4"/></svg>',
 search:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></svg>',
 phone:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/></svg>',
 pin:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/></svg>',
 mail:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m4 7 8 6 8-6"/></svg>',
 truck:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M3 6h11v10H3zM14 10h4l3 3v3h-7"/><circle cx="7" cy="18" r="1.8"/><circle cx="17" cy="18" r="1.8"/></svg>',
 check:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12 5 5 9-10"/></svg>',
 wa:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm5.3 14.1c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .2-3.3-.7-2.8-1.2-4.6-4-4.7-4.2-.1-.2-1.1-1.5-1.1-2.8s.7-2 .9-2.3c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.9 2.1c.1.2.1.4 0 .6l-.4.6-.4.4c-.2.2-.3.4-.1.7.7 1.2 1.6 2 2.7 2.6.3.2.5.1.7-.1l.8-1c.2-.3.4-.2.7-.1l2 .9c.3.2.5.3.5.5 0 .2 0 .8-.2 1.3z"/></svg>'};
const Chrome={
 counts(){const n=MODE==='shop'?Cart.count():Quote.count();document.querySelectorAll('.bcount').forEach(e=>{e.textContent=n;e.classList.toggle('on',n>0)})},
 init(active){
  const here=location.pathname.split('/').pop()||'index.html';const act=f=>here===f?' class="act"':'';
  const logo=`<a class="logo" href="index.html" aria-label="NTB accueil"><img src="${NTB.logo}" alt="NTB" referrerpolicy="no-referrer" onerror="this.replaceWith(Object.assign(document.createElement('b'),{className:'logotxt',textContent:'NTB'}))"><span class="lsub">New Tools Bey</span></a>`;
  const basket=MODE==='shop'?`<a class="bask" href="panier.html" aria-label="Panier">${ICO.cart}<span class="bcount">0</span></a>`:`<a class="bask" href="devis.html" aria-label="Demande de devis">${ICO.doc}<span class="bcount">0</span></a>`;
  document.getElementById('hdr').outerHTML=`<div class="topbar"><div class="wrap tb"><span>${ICO.truck} Livraison à Alger et en wilayas · Retrait au magasin d'El Hamiz</span><span class="tbr"><a href="${NTB.tel}">${ICO.phone} ${NTB.phone}</a><a href="mailto:${NTB.email}">${ICO.mail} ${NTB.email}</a></span></div></div>
<header class="hd" id="hd"><div class="wrap hdi">${logo}
 <form class="hsearch" action="catalogue.html">${ICO.search}<input name="q" placeholder="Rechercher une référence, une marque… (ex. ORCA, perforateur, BEY)" aria-label="Recherche"></form>
 <nav class="hnav"><a href="catalogue.html"${act('catalogue.html')}>Catalogue</a><a href="index.html#familles">Familles</a><a href="index.html#pro">Professionnels</a><a href="index.html#contact">Contact</a></nav>
 <div class="hact">${MODE==='shop'?`<a class="demo" href="paiement.html"><i></i>Démo paiement</a>`:`<a class="demo" href="devis.html"><i></i>Démo devis</a>`}${basket}<button class="burger" id="burger" aria-label="Menu">☰</button></div></div>
 <div class="mnav" id="mnav"><a href="catalogue.html">Catalogue</a>${CATS.slice(0,8).map(c=>`<a href="catalogue.html?c=${c.id}">${c.n}</a>`).join('')}<a href="${MODE==='shop'?'panier.html':'devis.html'}">${MODE==='shop'?'Mon panier':'Ma demande de devis'}</a><a href="index.html#contact">Contact</a></div></header>`;
  const f=document.getElementById('ftr');
  if(f)f.outerHTML=`<footer class="ft"><div class="wrap fti">
 <div class="fcol fbrand">${logo}<p>Fournisseur et distributeur d'outillage professionnel, de peinture et de quincaillerie. Plus de 20 ans d'expertise en Algérie : qualité, choix et accompagnement.</p><p class="tl">${NTB.tagline}</p></div>
 <div class="fcol"><h4>Catalogue</h4>${CATS.slice(0,6).map(c=>`<a href="catalogue.html?c=${c.id}">${c.n}</a>`).join('')}</div>
 <div class="fcol"><h4>Commander</h4><a href="panier.html?mode=shop">Boutique en ligne</a><a href="devis.html?mode=devis">Demande de devis</a><a href="index.html#pro">Comptes professionnels</a><a href="index.html#contact">Nous rendre visite</a></div>
 <div class="fcol"><h4>Contact</h4><a href="${NTB.tel}">${NTB.phone}</a><a href="mailto:${NTB.email}">${NTB.email}</a><a href="${NTB.map}" target="_blank" rel="noopener">${NTB.addr}</a><a href="${NTB.wa}" target="_blank" rel="noopener">WhatsApp</a></div>
</div><div class="wrap fbot"><span>© NTB — New Tools Bey. Maquette de présentation.</span><span>Paiement CIB · Edahabia · à la livraison</span></div></footer>`;
  const dock=document.createElement('div');dock.className='dock';dock.innerHTML=`
 <div class="dk"><span class="dkl">Proposition</span><div class="seg"><button data-v="a" class="${V==='a'?'on':''}">A · Corporate</button><button data-v="b" class="${V==='b'?'on':''}">B · Ultra moderne</button></div></div>
 <div class="dk"><span class="dkl">Type de site</span><div class="seg"><button data-m="shop" class="${MODE==='shop'?'on':''}">E-commerce</button><button data-m="devis" class="${MODE==='devis'?'on':''}">Catalogue + devis</button></div></div>
 <button class="dkx" aria-label="Réduire">–</button>`;
  document.body.appendChild(dock);
  const pill=document.createElement('button');pill.className='dockpill';pill.innerHTML='<i></i>Changer de version';document.body.appendChild(pill);
  const setMin=m=>{dock.classList.toggle('min',m);pill.classList.toggle('on',m);S.set('dockmin',m)};setMin(S.get('dockmin',false));
  dock.querySelector('.dkx').onclick=()=>setMin(true);pill.onclick=()=>setMin(false);
  dock.querySelectorAll('[data-v]').forEach(b=>b.onclick=()=>{S.set('v',b.dataset.v);location.search=keep('v',b.dataset.v)});
  dock.querySelectorAll('[data-m]').forEach(b=>b.onclick=()=>{S.set('mode',b.dataset.m);let pg=here;if(b.dataset.m==='devis'&&(pg==='panier.html'||pg==='paiement.html'))pg='devis.html';if(b.dataset.m==='shop'&&pg==='devis.html')pg='panier.html';location.href=pg+'?'+keep('mode',b.dataset.m)});
  const wa=document.createElement('a');wa.className='wa';wa.href=NTB.wa;wa.target='_blank';wa.rel='noopener';wa.setAttribute('aria-label','WhatsApp');wa.innerHTML=ICO.wa;document.body.appendChild(wa);
  const bg=document.getElementById('burger'),mn=document.getElementById('mnav');bg.onclick=()=>{mn.classList.toggle('open');bg.textContent=mn.classList.contains('open')?'✕':'☰'};
  const hd=document.getElementById('hd');const sc=()=>hd.classList.toggle('solid',scrollY>30);addEventListener('scroll',sc,{passive:true});sc();
  const q=qp.get('q');if(q)document.querySelector('.hsearch input').value=q;
  Chrome.counts();Reveal();
 }};
function keep(k,v){const p=new URLSearchParams(location.search);p.set(k,v);return p.toString()}
function Reveal(){const els=document.querySelectorAll('.rv:not(.in)');if(!('IntersectionObserver' in window)){els.forEach(e=>e.classList.add('in'));return}const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{rootMargin:'0px 0px -8% 0px'});els.forEach(e=>io.observe(e))}
function wilOpts(sel){return '<option value="">Wilaya</option>'+WILAYAS.map((w,i)=>`<option${w===sel?' selected':''}>${String(i+1).padStart(2,'0')} — ${w}</option>`).join('')}
