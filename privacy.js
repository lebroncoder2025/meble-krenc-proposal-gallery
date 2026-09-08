(() => {
  'use strict';
  const variant = document.body.dataset.proposal;
  const key = `mk_privacy_choice_${variant}`;
  const path = location.pathname.slice(0, location.pathname.lastIndexOf('/') + 1);
  const maxAge = 15552000;
  let choice = null;
  try {
    const raw = document.cookie.split('; ').find(row => row.startsWith(key + '='));
    const parsed = raw ? JSON.parse(decodeURIComponent(raw.slice(key.length + 1))) : null;
    if (parsed?.version === 1 && typeof parsed.external === 'boolean') choice = parsed;
  } catch { /* Invalid or blocked cookies mean no optional consent. */ }
  const closeIcon = '<svg class="ui-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="m6 6 12 12M18 6 6 18"/></svg>';
  document.body.insertAdjacentHTML('beforeend', `
    <aside class="mk-consent-banner" hidden aria-label="Ustawienia prywatności">
      <div><strong>Twoja prywatność</strong><p>Bez reklam i analityki. Ty decydujesz, czy wczytać mapę Google. <a href="cookies.html">Polityka cookies</a></p></div>
      <div class="mk-consent-actions"><button type="button" data-consent-open>Ustawienia</button><button type="button" data-consent-essential>Tylko niezbędne</button><button type="button" data-consent-accept>Akceptuj wszystko</button></div>
    </aside>
    <dialog class="mk-consent-dialog" aria-labelledby="mk-consent-title" aria-describedby="mk-consent-description">
      <div class="mk-consent-heading"><span>Prywatność / Meble Krenc</span><button type="button" class="mk-icon-button" data-consent-close aria-label="Zamknij ustawienia cookies">${closeIcon}</button></div>
      <h2 id="mk-consent-title">Ustawienia cookies</h2>
      <p id="mk-consent-description">Wybierz, na co się zgadzasz. Zmianę lub wycofanie zgody znajdziesz zawsze w stopce. Nie używamy analityki ani reklam.</p>
      <label class="mk-consent-option"><span><strong>Niezbędne</strong><small>Zapamiętanie Twojego wyboru przez 180 dni. Zawsze aktywne.</small></span><input type="checkbox" checked disabled aria-label="Niezbędne — zawsze aktywne"></label>
      <label class="mk-consent-option"><span><strong>Treści zewnętrzne</strong><small>Mapa Google na stronie kontaktu. Jej włączenie powoduje połączenie z serwerami Google.</small></span><input type="checkbox" data-consent-external aria-label="Zezwalaj na treści zewnętrzne Google Maps"></label>
      <p class="mk-consent-status" data-consent-status role="status"></p>
      <div class="mk-consent-actions"><button type="button" data-consent-essential>Tylko niezbędne</button><button type="button" data-consent-save>Zapisz ustawienia</button></div>
      <div class="mk-consent-bottom"><button type="button" data-consent-reset>Wycofaj zgodę i usuń zapis</button><a href="polityka-prywatnosci.html">Polityka prywatności</a><a href="cookies.html">Polityka cookies</a></div>
    </dialog>`);
  const banner = document.querySelector('.mk-consent-banner');
  const dialog = document.querySelector('.mk-consent-dialog');
  const toggle = dialog.querySelector('[data-consent-external]');
  const status = dialog.querySelector('[data-consent-status]');
  let trigger = null;
  function sync() {
    document.querySelectorAll('[data-map-src]').forEach(frame => {
      const allowed = choice?.external === true;
      if (allowed && !frame.hasAttribute('src')) frame.src = frame.dataset.mapSrc;
      if (!allowed) frame.removeAttribute('src');
      frame.hidden = !allowed;
      frame.closest('.mk-map').querySelector('.mk-map-placeholder').hidden = allowed;
    });
    document.querySelectorAll('[data-current-consent]').forEach(el => {
      el.textContent = !choice ? 'Brak zapisanego wyboru. Treści zewnętrzne są wyłączone.' : choice.external ? 'Zapisany wybór: niezbędne i treści zewnętrzne.' : 'Zapisany wybór: tylko niezbędne. Treści zewnętrzne są wyłączone.';
    });
  }
  function open(event) {
    event?.preventDefault();
    trigger = document.activeElement;
    toggle.checked = Boolean(choice?.external);
    status.textContent = choice ? 'Możesz zmienić zapisany wybór.' : 'Nie zapisano jeszcze Twojego wyboru.';
    dialog.showModal();
    document.body.classList.add('mk-consent-open');
  }
  function save(external) {
    choice = {version: 1, external: Boolean(external)};
    const raw = encodeURIComponent(JSON.stringify(choice));
    let stored = false;
    try {
      document.cookie = `${key}=${raw}; Max-Age=${maxAge}; Path=${path}; SameSite=Lax${location.protocol === 'https:' ? '; Secure' : ''}`;
      stored = document.cookie.split('; ').some(row => row === `${key}=${raw}`);
    } catch { /* Keep the choice for this visit only. */ }
    sync();
    banner.hidden = true;
    if (stored) dialog.close();
    else {
      if (!dialog.open) open();
      toggle.checked = choice.external;
      status.textContent = 'Przeglądarka blokuje zapis cookies. Twój wybór działa tylko podczas tej wizyty.';
    }
  }
  document.querySelectorAll('[data-cookie-open],[data-consent-open]').forEach(button => {
    button.hidden = false;
    button.addEventListener('click', open);
  });
  document.querySelectorAll('[data-consent-essential]').forEach(button => button.addEventListener('click', () => save(false)));
  document.querySelectorAll('[data-consent-accept]').forEach(button => button.addEventListener('click', () => save(true)));
  dialog.querySelector('[data-consent-save]').addEventListener('click', () => save(toggle.checked));
  dialog.querySelector('[data-consent-close]').addEventListener('click', () => dialog.close());
  dialog.querySelector('[data-consent-reset]').addEventListener('click', () => {
    try { document.cookie = `${key}=; Max-Age=0; Path=${path}; SameSite=Lax`; } catch {}
    choice = null;
    toggle.checked = false;
    sync();
    banner.hidden = false;
    status.textContent = 'Zgoda została wycofana. Mapa jest wyłączona, a zapis usunięty.';
  });
  dialog.addEventListener('close', () => {
    document.body.classList.remove('mk-consent-open');
    if (trigger?.isConnected && !trigger.closest('[hidden]')) trigger.focus();
    else document.querySelector('footer [data-cookie-open]')?.focus();
  });
  dialog.addEventListener('click', event => {
    const r = dialog.getBoundingClientRect();
    if (event.target === dialog && (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom)) dialog.close();
  });
  banner.hidden = Boolean(choice);
  sync();
})();
