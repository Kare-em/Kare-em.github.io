/* Данные лендинга. Проекты, игры и контакты — здесь, вёрстку трогать не нужно.

   КАК ДОБАВИТЬ ПРОЕКТ (плеибл):
   1. Положить собранный html в projects/<имя>/index.html
      (для AppLovin-сборки super-html это один файл — просто скопировать).
   2. Найти его заглушку в PROJECTS (или добавить объект по образцу ниже),
      заполнить brief/specs/features, указать src.
   3. Строку soon: true удалить — вкладка станет активной.
   Порядок в массиве = порядок вкладок; первая активная открывается по умолчанию.

   Тексты двуязычные: { ru: '…', en: '…' }. Если текст одинаков на обоих
   языках (название, имя движка) — можно просто строкой.

   Поля:
     id        — уникальный ключ (латиницей)
     title     — название на вкладке
     tag       — подпись мелким шрифтом под названием (движок/жанр)
     brief     — «ТЗ» в строке над телефоном: одна-две фразы, что просили сделать
     specs     — пары [подпись, значение] для левой колонки
     features  — что внутри плеибла (правая колонка, галочки)
     src       — путь к html плеибла; откроется в телефоне через iframe
     demo      — вместо src: имя встроенного демо (сейчас есть только 'stack')
     soon      — true = неактивная вкладка-заглушка с пометкой «скоро» */
window.PROJECTS = [
  {
    id: 'stack-demo',
    title: 'Stack Tower',
    tag: { ru: 'демо · Canvas 2D', en: 'demo · Canvas 2D' },
    brief: {
      ru: 'Сделай мини-плеибл: блок ездит туда-обратно, тап — роняешь, лишнее срезается. Один палец, 15 секунд, туториал-рука в начале и эндкарта с CTA в конце.',
      en: 'Make a mini playable: a block slides back and forth, tap to drop it, the overhang gets sliced off. One finger, 15 seconds, a tutorial hand at the start and an end card with a CTA.',
    },
    specs: [
      [{ ru: 'Движок', en: 'Engine' }, { ru: 'Чистый Canvas 2D', en: 'Plain Canvas 2D' }],
      [{ ru: 'Вес', en: 'Size' }, { ru: '≈ 8 КБ', en: '≈ 8 KB' }],
      [{ ru: 'Длительность', en: 'Length' }, { ru: '15–30 с', en: '15–30 s' }],
      [{ ru: 'Ориентация', en: 'Orientation' }, { ru: 'Портрет 9:16', en: 'Portrait 9:16' }],
    ],
    features: [
      { ru: 'Туториал-рука', en: 'Tutorial hand' },
      { ru: 'Срез по перекрытию', en: 'Overlap slicing' },
      { ru: 'Perfect-бонус', en: 'Perfect bonus' },
      { ru: 'Эндкарта и CTA', en: 'End card & CTA' },
    ],
    demo: 'stack',
  },
  {
    id: 'white-redesign',
    title: 'Forge Idle',
    tag: { ru: 'Cocos Creator · idle-аркада', en: 'Cocos Creator · idle arcade' },
    brief: {
      ru: 'Сделай плеибл в жанре idle-аркады: герой бегает джойстиком, носит руду из шахты в печь и на наковальню, продаёт товар покупателям из очереди и тратит монеты на апгрейды.',
      en: 'Make an idle-arcade playable: the hero runs on a joystick, carries ore from the mine to the furnace and anvil, sells goods to a queue of customers and spends coins on upgrades.',
    },
    specs: [
      [{ ru: 'Движок', en: 'Engine' }, 'Cocos Creator 3.8'],
      [{ ru: 'Вес', en: 'Size' }, { ru: '≈ 4,6 МБ', en: '≈ 4.6 MB' }],
      [{ ru: 'Сборка', en: 'Build' }, { ru: 'super-html, один HTML', en: 'super-html, single HTML' }],
      [{ ru: 'Ориентация', en: 'Orientation' }, { ru: 'Портрет 9:16', en: 'Portrait 9:16' }],
    ],
    features: [
      { ru: 'Джойстик и туториал', en: 'Joystick & tutorial' },
      { ru: 'Цепочка производства', en: 'Production chain' },
      { ru: 'Очередь покупателей', en: 'Customer queue' },
      { ru: 'Апгрейды и босс', en: 'Upgrades & boss' },
    ],
    src: 'projects/white-redesign/index.html',
  },

  // Заглушки: сборки ещё не перенесены. Заполнить по образцу Stack Tower, добавить src, убрать soon.
  {
    id: 'grocery-sorting',
    title: 'Grocery Sorting',
    tag: { ru: 'Cocos Creator · сортировка', en: 'Cocos Creator · sorting' },
    // src: 'projects/grocery-sorting/index.html',
    soon: true,
  },
  {
    id: 'gin-rummy',
    title: 'Gin Rummy',
    tag: { ru: 'Cocos Creator · карты', en: 'Cocos Creator · cards' },
    // src: 'projects/gin-rummy/index.html',
    soon: true,
  },
];

/* Контакты в блоке «Связаться», кроме почты (она в разметке).
   Пустая строка = заглушка «скоро»; заполнил — стала ссылкой. */
window.CONTACTS = {
  telegram: '',   // ник без @: 'karim_dev' → t.me/karim_dev
  phone: '',      // как показать: '+7 900 000-00-00' → ссылка tel:+79000000000
};

/* Выпущенные мобильные игры (до Playable Ads). featured — крупная карточка.
   icon — ссылка на иконку стора; если не загрузится, рисуется плитка с буквой.
   Проверено 09.10.2026: страницы RuStore живые; Google Play (Crazy Car,
   The Great Battle, I Am Ouch) отдают 404 — сняты, поэтому здесь их нет. */
const RS = 'https://static.rustore.ru/imgproxy/';
window.GAMES = [
  { title: 'Toy Car', meta: { ru: '3D-гонки по открытому миру · RuStore', en: 'Open-world 3D racing · RuStore' }, url: 'https://apps.rustore.ru/app/com.creosplay.toycar', featured: true,
    icon: RS + 'yGi2dErl9Z7NO4xHiebCqCCr1ifivYogfwFuR20ziIw/preset:web_app_icon_160/plain/https://static.rustore.ru/49180e91-185f-4fe2-8ba7-7bccd17d2232@webp' },
  { title: '2048', meta: { ru: 'Головоломка · RuStore', en: 'Puzzle · RuStore' }, url: 'https://apps.rustore.ru/app/com.creosplay.game2048',
    icon: RS + 'ZHLMR7qHUzP_WsPziFPfH2oHmQPBQ9MGvR02M4QDs_w/preset:web_app_icon_160/plain/https://static.rustore.ru/apk/79616703/content/ICON/89f20011-6042-41ad-9a6e-64cafe0f02d5.png@webp' },
  { title: { ru: 'Крестики-нолики', en: 'Tic-Tac-Toe' }, meta: { ru: 'Настольная · RuStore', en: 'Board game · RuStore' }, url: 'https://apps.rustore.ru/app/com.creosplay.tictactoe',
    icon: RS + '7iIJWkU9Yq7FwzxIUVensDj_6MQJKYHG4qSF6it1AbY/preset:web_app_icon_160/plain/https://static.rustore.ru/apk/79620287/content/ICON/859f9d59-f6de-459a-8f9e-2ea8fad45be4.png@webp' },
  { title: { ru: 'Пасьянс «Паук»', en: 'Spider Solitaire' }, meta: { ru: 'Карточная · RuStore', en: 'Card game · RuStore' }, url: 'https://apps.rustore.ru/app/com.creosplay.soliterspider',
    icon: RS + 'vAvjMLx_jn2Ing8W2hNrt_--kGUvP1lML6hyrlR8ZM0/preset:web_app_icon_62/plain/https://static.rustore.ru/apk/79617215/content/ICON/f992d92c-1da5-441b-b1f9-32c9a7620801.jpg@webp' },
  { title: { ru: 'Шашки', en: 'Checkers' }, meta: { ru: 'Настольная · RuStore', en: 'Board game · RuStore' }, url: 'https://apps.rustore.ru/app/com.creosplay.Checkers',
    icon: RS + '2M1QmOfQppAuHjdGzdfcOPZlbDhtOpLL1EeisNDSd1g/preset:web_app_icon_62/plain/https://static.rustore.ru/40c4b305-6548-4161-824d-abe3be6c3c2b@webp' },
  { title: { ru: 'Нарды', en: 'Backgammon' }, meta: { ru: 'Настольная · RuStore', en: 'Board game · RuStore' }, url: 'https://apps.rustore.ru/app/com.DefaultCompany.Nardi',
    icon: RS + '9UPQKWZ8vkFiiop-9g4IPi6H9MCbfSfGvKoPfswhR3I/preset:web_app_icon_62/plain/https://static.rustore.ru/06c7a15f-f6da-429f-bab5-8ab21131724a@webp' },
];
