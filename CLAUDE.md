# Лендинг разработчика (Карим Агишев, Playable Ads)

Статичный сайт: чистые HTML/CSS/JS, без сборки и фреймворков. Стиль — по образцу
plbx.ai (тёмный фон, фиолет/оранж, туннель из квадратов). Контент — резюме hh.ru.

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
- Шрифты с кириллицей: Geologica (заголовки), Onest (текст), JetBrains Mono.
  Bricolage Grotesque из plbx кириллицы не имеет.
- Подсказка «Тапни» в демо стоит `top: 48%` — над башней; основание на `CFG.baseY`
  (0.80). Двигаешь одно — проверь второе.

## Превью
`.claude/launch.json` → «landing»: `python -m http.server 5180 --bind 127.0.0.1`.
Мобилку проверять в панели Browser (`resize_window` mobile), не headless-скрином
(см. `~/.claude/docs/environment.md`, «Скрин страницы целиком»).

## Состояние на 09.10.2026
- Google Play (Crazy Car, The Great Battle, I Am Ouch) → 404, spaceanimals.io
  лежит — на сайт не вынесены. Игры только из RuStore.
- Телефон на сайт не выносили — ждёт решения владельца.
- Хостинг не выбран, git не инициализирован.
