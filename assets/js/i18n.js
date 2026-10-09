/* Двуязычие RU/EN без сборки и без словаря ключей.
   Оба текста лежат в разметке рядом: <span lang="ru">…</span><span lang="en">…</span>,
   CSS прячет чужой язык по <html lang>. Поэтому скрипт подключён в <head>: язык
   выставляется до первой отрисовки, и англоязычный гость не видит «мигания» русским.
   Порядок выбора: ?lang= в ссылке → выбор посетителя (localStorage) → язык браузера. */
(function () {
  'use strict';
  const LANGS = ['ru', 'en'];
  // браузер на этих языках — скорее поймёт русскую версию, чем английскую
  const RU_LIKE = /^(ru|uk|be|kk)\b/i;
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  const params = new URLSearchParams(location.search);
  function detect() {
    const q = params.get('lang');
    if (LANGS.includes(q)) return q;
    try { const s = localStorage.getItem('lang'); if (LANGS.includes(s)) return s; } catch (_) {}
    const first = (navigator.languages && navigator.languages[0]) || navigator.language || 'ru';
    return RU_LIKE.test(first) ? 'ru' : 'en';
  }

  const I18N = {
    lang: detect(),
    // строка для текущего языка — для canvas, тостов, атрибутов
    pick(ru, en) { return I18N.lang === 'en' && en != null ? en : ru; },
    // значение из projects.js: строка или { ru, en }
    tr(v) { return v && typeof v === 'object' ? I18N.pick(v.ru, v.en) : (v == null ? '' : String(v)); },
    // то же, но двуязычным html: язык потом переключается без перерисовки
    both(v) {
      if (!v || typeof v !== 'object') return esc(v);
      return '<span lang="ru">' + esc(v.ru) + '</span><span lang="en">' + esc(v.en != null ? v.en : v.ru) + '</span>';
    },
    set(l) {
      if (!LANGS.includes(l) || l === I18N.lang) return;
      I18N.lang = l;
      document.documentElement.lang = l;
      try { localStorage.setItem('lang', l); } catch (_) {}
      // ?lang= в адресе главнее выбора — значит, его надо переписать, иначе F5 вернёт старый язык
      if (params.has('lang')) {
        try { const u = new URL(location.href); u.searchParams.set('lang', l); history.replaceState(null, '', u); } catch (_) {}
      }
      applyAttrs();
      document.dispatchEvent(new CustomEvent('langchange', { detail: l }));
    },
  };
  window.I18N = I18N;
  document.documentElement.lang = I18N.lang;

  // Атрибуты (aria-label, content у meta, <title>) через CSS не спрятать — меняем руками.
  // Разметка: <a aria-label="На главную" data-l10n data-en-aria-label="Home">.
  function applyAttrs() {
    document.querySelectorAll('[data-l10n]').forEach((el) => {
      Array.from(el.attributes).forEach((a) => {
        if (a.name.indexOf('data-en-') !== 0) return;
        const name = a.name.slice(8), keep = 'data-ru-' + name;
        if (!el.hasAttribute(keep)) el.setAttribute(keep, el.getAttribute(name) || '');
        el.setAttribute(name, el.getAttribute('data-' + I18N.lang + '-' + name));
      });
    });
    const t = document.querySelector('title');
    if (t && t.dataset.en) {
      if (!t.dataset.ru) t.dataset.ru = t.textContent;
      document.title = I18N.lang === 'en' ? t.dataset.en : t.dataset.ru;
    }
    document.querySelectorAll('[data-set-lang]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.setLang === I18N.lang)));
  }

  document.addEventListener('click', (e) => {
    const b = e.target.closest && e.target.closest('[data-set-lang]');
    if (b) I18N.set(b.dataset.setLang);
  });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', applyAttrs);
  else applyAttrs();
})();
