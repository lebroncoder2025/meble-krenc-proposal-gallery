document.documentElement.classList.add('js');
const menu=document.querySelector('.menu'),nav=document.querySelector('.site-nav');
const setMenu=open=>{menu?.setAttribute('aria-expanded',String(open));nav?.classList.toggle('is-open',open)};
menu?.addEventListener('click',()=>setMenu(menu.getAttribute('aria-expanded')!=='true'));
nav?.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>setMenu(false)));
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&menu?.getAttribute('aria-expanded')==='true'){setMenu(false);menu.focus()}});
matchMedia('(min-width:681px)').addEventListener('change',()=>setMenu(false));
document.querySelectorAll('[data-year]').forEach(el=>el.textContent=new Date().getFullYear());
let returnFocus=null;
const openDialog=dialog=>{if(!dialog)return;returnFocus=document.activeElement;dialog.showModal();document.body.classList.add('modal-open')};
document.querySelectorAll('dialog').forEach(dialog=>{
 dialog.addEventListener('close',()=>{document.body.classList.remove('modal-open');if(returnFocus?.isConnected&&!returnFocus.closest('[hidden]'))returnFocus.focus();else document.querySelector('.footer [data-cookie-open]')?.focus()});
 dialog.addEventListener('click',e=>{const r=dialog.getBoundingClientRect();if(e.target===dialog&&(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom))dialog.close()});
});
const lightbox=document.querySelector('[data-lightbox-root]'),photo=document.querySelector('[data-lightbox-image]');
const gallery=[...document.querySelectorAll('[data-lightbox]')];
let selected=gallery,current=0;
document.querySelectorAll('[data-filter]').forEach(button=>button.addEventListener('click',()=>{
 document.querySelectorAll('[data-filter]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
 gallery.forEach(card=>card.hidden=button.dataset.filter!=='all'&&card.dataset.category!==button.dataset.filter);
 selected=gallery.filter(card=>!card.hidden);
 document.querySelector('.gallery-status').textContent='Liczba zdjęć: '+selected.length;
}));
const showPhoto=index=>{current=(index+selected.length)%selected.length;const link=selected[current];photo.src=link.href;photo.alt=link.querySelector('img').alt;document.querySelector('[data-lightbox-caption]').textContent=link.querySelector('.work-caption').innerText.replace('↗','').trim()+' · '+(current+1)+' / '+selected.length};
gallery.forEach(link=>link.addEventListener('click',e=>{if(e.ctrlKey||e.metaKey||e.shiftKey||e.altKey)return;e.preventDefault();showPhoto(selected.indexOf(link));openDialog(lightbox)}));
document.querySelector('[data-lightbox-close]')?.addEventListener('click',()=>lightbox.close());
document.querySelector('[data-lightbox-prev]')?.addEventListener('click',()=>showPhoto(current-1));
document.querySelector('[data-lightbox-next]')?.addEventListener('click',()=>showPhoto(current+1));
lightbox?.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();showPhoto(current+(e.key==='ArrowRight'?1:-1))}});
const cookieKey='mk-cookie-preferences',bar=document.querySelector('[data-cookie-bar]'),settings=document.querySelector('[data-cookie-settings]');
let saved=false;try{saved=Boolean(localStorage.getItem(cookieKey))}catch{/* Storage is optional. */}
if(bar)bar.hidden=saved;
document.querySelectorAll('[data-cookie-open]').forEach(b=>b.addEventListener('click',()=>openDialog(settings)));
const saveCookies=()=>{try{localStorage.setItem(cookieKey,'essential')}catch{/* Dismiss for this visit if storage is blocked. */}if(bar)bar.hidden=true;if(settings?.open)settings.close()};
document.querySelector('[data-cookie-essential]')?.addEventListener('click',saveCookies);
document.querySelector('[data-cookie-save]')?.addEventListener('click',saveCookies);
document.querySelector('[data-cookie-close]')?.addEventListener('click',()=>settings.close());

/* Shared-photo atlas loader: images are optimized once and shared across the three proposal sites. */
(() => {
  const photoKeys = ["apartments-01", "apartments-02", "eating-01", "eating-02", "eating-03", "eating-04", "eating-05", "eating-06", "eating-07", "eating-08", "eating-09", "eating-10", "eating-11", "eating-12", "living-01", "living-02", "living-03", "living-04", "living-05", "living-06", "sleeping-01", "sleeping-02", "sleeping-03", "sleeping-04", "sleeping-05", "sleeping-06", "sleeping-07", "sleeping-08", "sleeping-09", "sleeping-10", "sleeping-11"];
  const photoIndex = Object.fromEntries(photoKeys.map((key,index)=>[key,index]));
  const chunkUrls = Array.from({length:13},(_,i)=>`/meble-krenc-proposal-gallery/assets/shared/sprite-${i+1}.txt`);
  const hydrate = async () => {
    const encoded = (await Promise.all(chunkUrls.map(url=>fetch(url,{cache:'force-cache'}).then(r=>{if(!r.ok) throw new Error(url); return r.text();})))).join('').replace(/\s+/g,'');
    const atlas = new Image();
    atlas.decoding='async';
    atlas.src=`data:image/webp;base64,${encoded}`;
    await atlas.decode();
    const cache=new Map();
    document.querySelectorAll('img[data-photo]').forEach(img=>{
      const key=img.dataset.photo, idx=photoIndex[key];
      if(idx==null) return;
      let url=cache.get(key);
      if(!url){
        const canvas=document.createElement('canvas'); canvas.width=800; canvas.height=600;
        const ctx=canvas.getContext('2d');
        const sx=(idx%2)*400, sy=Math.floor(idx/2)*300;
        ctx.drawImage(atlas,sx,sy,400,300,0,0,800,600);
        url=canvas.toDataURL('image/jpeg',0.9); cache.set(key,url);
      }
      img.src=url; img.classList.add('photo-ready');
      const link=img.closest('a[data-photo-link],a[data-lightbox]'); if(link) link.href=url;
    });
  };
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',()=>hydrate().catch(()=>{})); else hydrate().catch(()=>{});
})();
