/* Логика лендинга: вкладки проектов и телефон, игры, анимации появления.
   Данные — в projects.js, здесь только рендер. */
(function () {
  'use strict';
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  // тексты из projects.js рисуем обоими языками сразу (i18n.js) — смена языка без перерисовки
  const L = window.I18N, both = L.both;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ───── «Туннель» из квадратов в hero ─────
  const tunnel = $('.hero__tunnel');
  if (tunnel) {
    for (let i = 0; i < 14; i++) {
      const el = document.createElement('i');
      el.style.setProperty('--r', (i * 7) + 'deg');
      el.style.setProperty('--s', Math.pow(0.84, i).toFixed(3));
      el.style.borderColor = 'rgba(150,200,255,' + (0.05 + i * 0.012).toFixed(3) + ')';
      el.style.animationDuration = (90 - i * 4) + 's';
      tunnel.appendChild(el);
    }
  }

  // ───── Шапка и мобильное меню ─────
  const header = $('.header');
  const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 10);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const burger = $('#burger'), nav = $('#nav');
  burger.addEventListener('click', () => {
    const open = nav.classList.toggle('is-open');
    burger.setAttribute('aria-expanded', open);
  });
  nav.addEventListener('click', (e) => {
    if (e.target.closest('a')) { nav.classList.remove('is-open'); burger.setAttribute('aria-expanded', 'false'); }
  });

  // ───── Проекты: вкладки + телефон ─────
  const projects = window.PROJECTS || [];
  const tabs = $('#projectTabs'), brief = $('#projectBrief'), specs = $('#projectSpecs');
  const feats = $('#projectFeatures'), screen = $('#phoneScreen'), restartBtn = $('#restartBtn');
  let active = null, demo = null;

  const toContact = () => $('#contact').scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });

  function mountPhone(p) {
    if (demo) { demo.destroy(); demo = null; }
    screen.innerHTML = '';
    if (p.src) {
      // собранный плеибл — это один html, он живёт в телефоне как есть
      const f = document.createElement('iframe');
      f.src = p.src; f.title = L.tr(p.title); f.loading = 'lazy'; f.allow = 'autoplay; fullscreen';
      screen.appendChild(f);
    } else if (p.demo === 'stack' && window.StackDemo) {
      demo = window.StackDemo.mount(screen, { onCta: toContact });
    }
  }

  function select(id) {
    const p = projects.find((x) => x.id === id);
    if (!p || p.soon) return;
    active = p;
    $$('.tab', tabs).forEach((b) => {
      const on = b.dataset.id === id;
      b.classList.toggle('is-active', on);
      b.setAttribute('aria-selected', on);
    });
    brief.innerHTML = both(p.brief);
    specs.innerHTML = (p.specs || []).map(([k, v]) => '<div><dt>' + both(k) + '</dt><dd>' + both(v) + '</dd></div>').join('');
    feats.innerHTML = (p.features || []).map((f) => '<li>' + both(f) + '</li>').join('');
    mountPhone(p);
  }

  tabs.innerHTML = projects.map((p) =>
    '<button class="tab" role="tab" type="button" data-id="' + esc(p.id) + '"' + (p.soon ? ' disabled' : '') + '>' +
      both(p.title) + '<small>' + both(p.tag) + (p.soon ? both({ ru: ' · скоро', en: ' · soon' }) : '') + '</small></button>'
  ).join('');
  document.addEventListener('langchange', () => {
    const f = $('iframe', screen);
    if (f && active) f.title = L.tr(active.title);
  });
  tabs.addEventListener('click', (e) => {
    const b = e.target.closest('.tab');
    if (b && !b.disabled) select(b.dataset.id);
  });
  restartBtn.addEventListener('click', () => { if (demo) demo.restart(); else if (active) mountPhone(active); });
  // Собранный плеибл по CTA шлёт родителю postMessage {type:'playable_cta'} (стор у него
  // заглушка) — ведём туда же, куда CTA встроенного демо. Принимаем только от своего iframe.
  window.addEventListener('message', (e) => {
    const f = $('iframe', screen);
    if (f && e.source === f.contentWindow && e.data && e.data.type === 'playable_cta') toContact();
  });
  const first = projects.find((p) => !p.soon);
  if (first) select(first.id);

  // ───── Выпущенные игры ─────
  const games = window.GAMES || [];
  const grid = $('#gamesGrid');
  if (!games.length) { $('#games').hidden = true; }
  const tile = ['#2F6BFF,#2EE6B8', '#14C8E8,#2F6BFF', '#2EE6B8,#FF4D7E', '#FF4D7E,#E8245C', '#14C8E8,#3DDC97', '#2F6BFF,#14C8E8'];
  grid.innerHTML = games.map((g, i) =>
    '<a class="game' + (g.featured ? ' game--featured' : '') + '" href="' + esc(g.url) + '" target="_blank" rel="noopener">' +
      '<span class="game__icon" style="background:linear-gradient(135deg,' + tile[i % tile.length] + ')">' +
        '<span>' + both(perLang(g.title, initial)) + '</span>' +
        (g.icon ? '<img src="' + esc(g.icon) + '" alt="" loading="lazy" referrerpolicy="no-referrer" onerror="this.remove()">' : '') +
      '</span>' +
      '<span><span class="game__name">' + both(g.title) + '</span><span class="game__meta">' + both(g.meta) + '</span></span>' +
    '</a>'
  ).join('');
  function initial(s) { return s.replace(/[«»"]/g, '')[0]; }
  function perLang(v, f) { return v && typeof v === 'object' ? { ru: f(v.ru), en: f(v.en) } : f(String(v)); }

  // ───── Контакты кроме почты: пустое поле в CONTACTS = заглушка «скоро» ─────
  const C = window.CONTACTS || {};
  const nick = (C.telegram || '').replace(/^@/, '');
  const contactItems = [
    { label: 'Telegram', text: nick && '@' + nick, href: nick && 'https://t.me/' + encodeURIComponent(nick) },
    { label: { ru: 'Телефон', en: 'Phone' }, text: C.phone, href: C.phone && 'tel:' + C.phone.replace(/[^\d+]/g, '') },
  ];
  $('#contactsRow').innerHTML = contactItems.map((c) => c.href
    ? '<a class="contact-item" href="' + esc(c.href) + '"' + (c.href.indexOf('http') === 0 ? ' target="_blank" rel="noopener"' : '') + '>' +
        both(c.label) + ' <b>' + esc(c.text) + '</b></a>'
    : '<span class="contact-item is-soon">' + both(c.label) + ' <small>' + both({ ru: 'скоро', en: 'soon' }) + '</small></span>'
  ).join('');

  // ───── Появление при скролле ─────
  const counters = new WeakSet();
  function countUp(el) {
    if (counters.has(el)) return;
    counters.add(el);
    const to = +el.dataset.count, pre = el.dataset.prefix || '', suf = el.dataset.suffix || '';
    if (reduceMotion) { el.textContent = pre + to + suf; return; }
    const t0 = performance.now(), dur = 1200;
    (function tick(now) {
      const k = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - k, 3);
      el.textContent = pre + Math.round(to * e) + suf;
      if (k < 1) requestAnimationFrame(tick);
    })(t0);
  }

  let terminalPlayed = false;
  function playTerminal() {
    if (terminalPlayed) return;
    terminalPlayed = true;
    $$('#terminal .t-line').forEach((l) => setTimeout(() => l.classList.add('is-on'), reduceMotion ? 0 : +l.dataset.delay));
  }

  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      const el = en.target;
      el.classList.add('is-in');
      $$('[data-count]', el).forEach(countUp);
      if (el.classList.contains('terminal')) playTerminal();
      io.unobserve(el);
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

  // соседи в одной сетке появляются лесенкой
  $$('.reveal').forEach((el) => {
    const sibs = $$(':scope > .reveal', el.parentElement);
    const idx = sibs.indexOf(el);
    if (idx > 0) el.style.transitionDelay = Math.min(idx, 6) * 70 + 'ms';
    io.observe(el);
  });

  // ───── Почта ─────
  const toast = $('#toast');
  let toastTimer = 0;
  function showToast(text) {
    toast.textContent = text;
    toast.classList.add('is-on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('is-on'), 1800);
  }
  $('#copyEmail').addEventListener('click', (e) => {
    const email = e.currentTarget.dataset.email;
    const done = () => showToast(L.pick('Почта скопирована ✓', 'Email copied ✓'));
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(email).then(done, () => fallbackCopy(email, done));
    } else fallbackCopy(email, done);
  });
  function fallbackCopy(text, done) {
    const ta = document.createElement('textarea');
    ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy'); done(); } catch (_) { showToast(text); }
    ta.remove();
  }

  $('#year').textContent = new Date().getFullYear();
})();
