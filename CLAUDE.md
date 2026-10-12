# Лендинг разработчика (Карим Агишев, Playable Ads)

Статичный сайт: чистые HTML/CSS/JS, без сборки и фреймворков. Контент — резюме hh.ru.
Раскладка по мотивам plbx.ai (туннель, свечения, бегущая строка), но палитра и шрифт
свои — решение владельца 09.10.2026: «верни старый дизайн, поменяй цвета и шрифт».
Фиолет/оранж plbx не возвращать. Палитра: фон `#020711`, `--accent` синий `#2F6BFF`,
`--accent-2` бирюза `#14C8E8`, `--accent-3` мята `#2EE6B8`, CTA `--cta` розово-коралловый
`#FF4D7E`. Пробовали и свой стиль с нуля (графит+лайм, коммит 55a5d44) — владелец
вернул эту раскладку. Фавиконка = знак в шапке: «play» на градиенте бирюза→синий→розовый.

## Структура
```
index.html               вся разметка, секции по порядку: hero → #play → цифры →
                         #process → #ai → #skills → #experience → #games → #faq → #contact
assets/css/style.css     токены в :root, адаптив 1000/860/600px, стили демо в конце
assets/js/projects.js    ДАННЫЕ: window.PROJECTS (вкладки с телефоном), window.GAMES
assets/js/demo-stack.js  встроенный мини-плеибл Stack Tower (Canvas 2D), числа в CFG
assets/js/main.js        только рендер и анимации, данных здесь нет
projects/<имя>/index.html  собранные плеиблы (создать папку при первом проекте)
```

## Правила
- Скрипты — обычные `<script>`, НЕ модули: страница должна открываться и через
  `file://`, а модули там режет CORS.
- Проект добавляется только правкой `projects.js` (инструкция в шапке файла):
  html плеибла → `projects/<имя>/index.html`, объект с `src`, заглушку `soon` убрать.
- Шрифты с кириллицей: Manrope (заголовки, и в canvas демо), Onest (текст),
  JetBrains Mono. h1 hero — 2 строки на 375 (40px) и на ПК; меняешь шрифт
  заголовков на более широкий — перемерь (Unbounded на тех же размерах давал 4).
- Подсказка «Тапни» в демо стоит `top: 48%` — над башней; основание на `CFG.baseY`
  (0.80). Двигаешь одно — проверь второе.

## Двуязычие RU/EN (`assets/js/i18n.js`, подключён в `<head>`)
- Оба текста рядом: `<span lang="ru">…</span><span lang="en">…</span>`; CSS прячет
  чужой по `<html lang>`. Язык: `?lang=` → localStorage → язык браузера
  (ru/uk/be/kk → ru, прочие → en). Ссылка на английскую версию — `/?lang=en`.
- Атрибуты (aria-label, meta content): `data-l10n data-en-<attr>="…"`; `<title data-en>`.
- Данные в `projects.js` — `{ ru, en }`, рендер через `I18N.both()` (без
  перерисовки при смене языка); canvas демо — `tx([ru, en])` каждый кадр.
- Новый CSS по тегу внутри карточек — только через `>`: `.tags span` задел бы и
  вложенные `span[lang]` (уже исправлено у `.tags > span`, `.stat > span`).

## Превью
`.claude/launch.json` → «landing»: `python -m http.server 5180 --bind 127.0.0.1`.
Мобилку проверять в панели Browser (`resize_window` mobile), не headless-скрином
(см. `~/.claude/docs/environment.md`, «Скрин страницы целиком»).

## Состояние на 09.10.2026
- Google Play (Crazy Car, The Great Battle, I Am Ouch) → 404, spaceanimals.io
  лежит — на сайт не вынесены. Игры только из RuStore.
- Telegram @kare_pro_gram (12.10.2026); телефон — заглушка «скоро» (`window.CONTACTS`
  в `projects.js`, пустая строка = заглушка). Реальный телефон без явного «да» владельца не ставить.
- Заглушки Grocery Sorting и Gin Rummy сняты 12.10.2026 по просьбе владельца — вкладки
  только с рабочими сборками. Механизм `soon` в `main.js` оставлен.
- Хостинг: GitHub Pages, репо `Kare-em/Kare-em.github.io` (public), сайт
  https://kare-em.github.io/. Деплой = коммит + `git push` в `main`, Pages
  пересобирается сам (~1 мин). Remote с `Kare-em@` — см. `~/.claude/docs/git.md`.
- `CLAUDE.md` лежит в публичном репо и виден по `/CLAUDE.md` — личного сюда не писать.
