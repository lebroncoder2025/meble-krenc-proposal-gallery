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
