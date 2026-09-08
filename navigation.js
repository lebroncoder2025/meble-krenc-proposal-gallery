(() => {
  const header = document.querySelector('header');
  const nav = header?.querySelector('nav');
  const menu = header?.querySelector('button[aria-controls]');
  if (!nav || !menu) return;
  const variant = document.body.dataset.proposal;
  const breakpoint = variant === 'editorial' ? 640 : variant === 'gallery' ? 680 : 700;
  const mobile = matchMedia(`(max-width:${breakpoint}px)`);
  const links = [...nav.querySelectorAll('a')];
  const main = document.querySelector('main');
  const footer = document.querySelector('footer');
  const backdrop = document.createElement('button');
  backdrop.type = 'button'; backdrop.className = 'mk-nav-backdrop'; backdrop.hidden = true;
  backdrop.tabIndex = -1; backdrop.setAttribute('aria-label', 'Zamknij menu');
  document.body.append(backdrop);
  if (variant === 'editorial') menu.innerHTML = '<span class="sr-only">Menu</span><svg class="ui-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path data-menu-glyph d="M4 8h16M4 16h16"/></svg>';
  if (variant === 'gallery') [...menu.childNodes].filter(node => node.nodeType === Node.TEXT_NODE && node.textContent.trim()).forEach(node => { const label = document.createElement('span'); label.dataset.menuLabel = ''; label.textContent = node.textContent.trim(); node.replaceWith(label); });
  menu.hidden = false;
  let open = false;
  function setOpen(value, focus = false) {
    open = value && mobile.matches;
    menu.setAttribute('aria-expanded', String(open));
    menu.setAttribute('aria-label', open ? 'Zamknij menu' : 'Otwórz menu');
    const label = menu.querySelector('[data-menu-label],.sr-only');
    if (label) label.textContent = open ? 'Zamknij' : 'Menu';
    menu.querySelector('[data-menu-glyph]')?.setAttribute('d', open ? 'm6 6 12 12M18 6 6 18' : 'M4 8h16M4 16h16');
    nav.classList.toggle('is-open', open);
    document.body.classList.toggle('navigation-open', open);
    backdrop.hidden = !open;
    if (main) main.inert = open;
    if (footer) footer.inert = open;
    if (focus) (open ? links.find(a => a.hasAttribute('aria-current')) || links[0] : menu)?.focus();
  }
  menu.addEventListener('click', () => setOpen(!open, true));
  backdrop.addEventListener('click', () => setOpen(false, true));
  mobile.addEventListener('change', () => setOpen(false));
  document.addEventListener('keydown', event => {
    if (!open || document.querySelector('dialog[open]')) return;
    if (event.key === 'Escape') { event.preventDefault(); setOpen(false, true); }
    if (event.key === 'Tab') {
      const items = [menu, ...links].filter(el => el.getClientRects().length);
      const first = items[0], last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
  });
  const filename = () => location.pathname.split('/').pop() || 'index.html';
  let currentLink = null, currentType = null;
  function setCurrent(link, type) {
    if (link === currentLink && type === currentType) return;
    currentLink = link; currentType = type;
    links.forEach(a => { a.classList.toggle('is-current', a === link); if (a === link) a.setAttribute('aria-current', type); else a.removeAttribute('aria-current'); });
  }
  const sections = variant === 'gallery' && filename() === 'index.html' ? links.map(link => ({link, element:document.getElementById(new URL(link.href).hash.slice(1))})).filter(item => item.element) : [];
  let queued = false;
  function update() {
    queued = false;
    const height = header.getBoundingClientRect().height;
    document.documentElement.style.setProperty('--navigation-height', `${height}px`);
    header.classList.toggle('has-scrolled', scrollY > 12);
    if (sections.length) {
      let active = sections[0];
      const line = height + Math.min(innerHeight * .2, 150);
      sections.forEach(item => { if (item.element.getBoundingClientRect().top <= line) active = item; });
      setCurrent(active.link, 'location');
    }
  }
  if (!sections.length) setCurrent(links.find(a => new URL(a.href).pathname.split('/').pop() === filename() && !a.classList.contains('nav-cta')), 'page');
  const schedule = () => { if (!queued) { queued = true; requestAnimationFrame(update); } };
  addEventListener('scroll', schedule, {passive:true});
  addEventListener('resize', schedule);
  new ResizeObserver(schedule).observe(header);
  links.forEach(link => link.addEventListener('click', event => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const target = new URL(link.href);
    const samePage = (target.pathname.split('/').pop() || 'index.html') === filename();
    setOpen(false);
    if (samePage && target.hash) {
      const section = document.getElementById(target.hash.slice(1));
      if (section) {
        event.preventDefault();
        history.pushState(null, '', target.hash);
        section.setAttribute('tabindex', '-1'); section.focus({preventScroll:true});
        section.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion:reduce)').matches ? 'instant' : 'smooth'});
      }
    }
  }));
  document.querySelectorAll('footer a[href]').forEach(a => {
    const target = new URL(a.href);
    if (target.origin === location.origin && target.pathname.split('/').pop() === filename()) a.setAttribute('aria-current','page');
  });
  setOpen(false); update();
})();
