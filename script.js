  // clock in menubar
  (function(){
    const el = document.getElementById('clock');
    function tick(){
      const d = new Date();
      const days = ['Вс','Пн','Вт','Ср','Чт','Пт','Сб'];
      const months = ['янв','фев','мар','апр','мая','июн','июл','авг','сен','окт','ноя','дек'];
      const day = days[d.getDay()];
      const dd = d.getDate();
      const mm = months[d.getMonth()];
      const hh = String(d.getHours()).padStart(2,'0');
      const mi = String(d.getMinutes()).padStart(2,'0');
      el.textContent = day + ', ' + dd + ' ' + mm + ' · ' + hh + ':' + mi;
    }
    tick();
    setInterval(tick, 30000);
  })();

  // typing effect for hero h1
  (function(){
    const target = document.getElementById('hero-typed');
    if(!target) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const word = 'Переговорка';
    if(reduced){ target.textContent = word; return; }

    const TYPE_MIN = 90, TYPE_MAX = 170;     // per-letter typing
    const ERASE_MIN = 55, ERASE_MAX = 95;    // per-letter erasing
    const HOLD_FULL = 2600;                  // pause after fully typed
    const HOLD_EMPTY = 700;                  // pause before retyping
    const INITIAL_HOLD = 3000;               // show static for 3s before first cycle
    const rand = (a,b) => a + Math.random() * (b - a);
    let cancelled = false;
    const wait = ms => new Promise(r => setTimeout(r, ms));

    async function loop(){
      // show fully typed word, statically, for 3 seconds
      target.textContent = word;
      await wait(INITIAL_HOLD);
      // first erase to kick off the cycle
      for(let i = word.length - 1; i >= 0; i--){
        if(cancelled) return;
        target.textContent = word.slice(0, i);
        await wait(rand(ERASE_MIN, ERASE_MAX));
      }
      await wait(HOLD_EMPTY);

      while(!cancelled){
        // type
        for(let i = 1; i <= word.length; i++){
          if(cancelled) return;
          target.textContent = word.slice(0, i);
          await wait(rand(TYPE_MIN, TYPE_MAX));
        }
        await wait(HOLD_FULL);
        // erase
        for(let i = word.length - 1; i >= 0; i--){
          if(cancelled) return;
          target.textContent = word.slice(0, i);
          await wait(rand(ERASE_MIN, ERASE_MAX));
        }
        await wait(HOLD_EMPTY);
      }
    }
    loop();

    // pause when tab is hidden to avoid drift
    document.addEventListener('visibilitychange', () => {
      // simplest approach: just let it run; loop awaits anyway
    });
  })();

  // folder modal
  (function(){
    const overlay = document.getElementById('folder-modal');
    const win     = document.getElementById('modal-window');
    const titleEl = document.getElementById('modal-title-text');
    const bodyEl  = document.getElementById('modal-body');
    const closeBtn = document.getElementById('modal-close-btn');
    let lastTrigger = null;

    const ICON = {
      play: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="6 3 20 12 6 21 6 3"/></svg>',
      music: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>',
      radio: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4.9 19.1C1 15.2 1 8.8 4.9 4.9"/><path d="M7.8 16.2c-2.3-2.3-2.3-6.1 0-8.5"/><circle cx="12" cy="12" r="2"/><path d="M16.2 7.8c2.3 2.3 2.3 6.1 0 8.5"/><path d="M19.1 4.9C23 8.8 23 15.1 19.1 19"/></svg>',
      message: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',
    };

    const FOLDERS = {
      lessons: {
        title: '~/peregovorka/уроки',
        meta:  '35+ уроков · .mp4',
        intro: 'Видеоуроки, новые каждый месяц. Смотришь в&nbsp;своём темпе, старое остаётся в&nbsp;канале.',
        groups: [
          { name: 'Стратегия и аналитика', items: [
            'Экскурсия по офису', 'Типы блогеров', 'Архетипы',
            'Анализ: себя, ЦА и&nbsp;конкурентов', 'Стратегия для роста блога',
          ]},
          { name: 'Сценарии и посты', items: [
            'Сценарии и&nbsp;триггеры', 'Схемы сторителлингов', 'Посты-карусели',
          ]},
          { name: 'Форматы для рилс', items: [
            '8&nbsp;форматов: от&nbsp;сериала и&nbsp;реакций до&nbsp;ностальгии и&nbsp;абсурда',
          ]},
          { name: 'Триггеры', items: [
            '10&nbsp;уроков + бонусный, 30+ триггеров на&nbsp;примерах',
            'Текстовые шпаргалки, которые можно скачать',
          ]},
          { name: 'Воронки', items: [
            'Воронка', 'Воронка в&nbsp;актуальное', 'Воронка в&nbsp;шапке',
            'Воронка по&nbsp;кодовому слову', 'Лид-магнит', 'Лид-магнитная воронка',
          ]},
          { name: 'Дополнительно', items: [
            'Threads', 'Что снимать в&nbsp;декабре', 'Золотая неделя',
          ]},
        ],
        ext: '.mp4',
        icon: ICON.play,
      },
      podcasts: {
        title: '~/peregovorka/подкасты',
        meta:  '20+ выпусков · .mp3',
        intro: 'Разговорный формат про&nbsp;контент без&nbsp;воды. Можно слушать фоном.',
        items: [
          'Алгоритмы рилс',
          'Где брать идеи',
          'Как часто постить',
          'Самый важный показатель',
          'Как я&nbsp;пишу сценарии',
          'Ошибки при сценариях, ч.&nbsp;1',
          'Ошибки при сценариях, ч.&nbsp;2',
          'Быть собой в&nbsp;блоге',
          'Сезонность',
          'Какой контент не&nbsp;работает',
          'Золотая неделя',
          'Цели по&nbsp;SMART',
          'Архетипы. Пояснительный',
          'Игра в&nbsp;ассоциации',
          'Мои стратегии',
          'Контент на&nbsp;14&nbsp;февраля',
          'Чаще или качественнее',
          'Наблюдения за&nbsp;2&nbsp;года',
          'Нужен ли&nbsp;контент-план',
          'База рилс',
          'Поведение в&nbsp;кризис',
        ],
        ext: '.mp3',
        icon: ICON.music,
      },
      lives: {
        title: '~/peregovorka/эфиры',
        meta:  '14+ эфиров · live',
        intro: 'Разборы, сценарии и&nbsp;челленджи — вживую. Без&nbsp;строгого расписания, записи остаются.',
        groups: [
          { name: 'Каждые 2 недели', items: [
            'Разборы рилс (присылаешь ролик — разбираю лично)',
            'Пишем сценарии с&nbsp;Никой (пишем вместе в&nbsp;прямом эфире)',
          ]},
          { name: 'Отдельные эфиры и лекции', items: [
            'Мастер-класс по&nbsp;триггерам',
            'Разборы воронок',
            'Лекция «Монетизация блога»',
            'Новогодний корпоратив-разборы',
          ]},
          { name: 'Челлендж-рилс', items: [
            'Еженедельные задания (1–7)',
          ]},
        ],
        ext: '.live',
        icon: ICON.radio,
      },
      digest: {
        title: '~/peregovorka/дайджест',
        meta:  '2 раза в месяц · live',
        intro: '2&nbsp;раза в&nbsp;месяц выходит рубрика «Дайджест инфоповодов и&nbsp;трендов»: я&nbsp;собираю самые горячие инфоповоды и&nbsp;тренды и&nbsp;показываю, как адаптировать их&nbsp;под свою тематику — чтобы снимать контент по&nbsp;свежим темам, пока они на&nbsp;пике.',
        ext: '',
        icon: '',
      },
      chat: {
        title: '~/peregovorka/чат',
        meta:  'всегда онлайн',
        intro: 'Место, где обсуждают контент, скидывают идеи и&nbsp;дают обратную связь. Без токсичности — проверено.',
        items: [
          'Идеи и&nbsp;референсы',
          'Сценарии на&nbsp;разбор',
          'Болталка',
          'Новости платформ',
          'Технические вопросы',
        ],
        ext: '.chan',
        icon: ICON.message,
      },
      reviews: {
        title: '~/peregovorka/отзывы',
        meta:  '',
        intro: 'Скрины отзывов участников — что забирают из&nbsp;клуба и&nbsp;как это меняет их&nbsp;подход к&nbsp;контенту. Скоро появятся здесь.',
        ext: '',
        icon: '',
      },
      myblog: {
        title: '~/peregovorka/мой-блог',
        meta:  '',
        intro: 'Результаты Ники — рост охватов, просмотры, вовлечённость. Скрины из&nbsp;личной статистики. Скоро появятся здесь.',
        ext: '',
        icon: '',
      },
    };

    function open(key, trigger){
      const data = FOLDERS[key];
      if(!data) return;
      lastTrigger = trigger || null;

      win.dataset.folder = key;
      titleEl.textContent = data.title;

      function renderItem(name){
        return '<div class="file-row"><span class="ic">' + data.icon + '</span> ' + name + ' <span class="ext">' + data.ext + '</span></div>';
      }

      let html = '';
      html += '<p class="modal-intro">' + data.intro + '</p>';
      if(data.groups || (data.items && data.items.length)){
        html += '<div class="modal-list">';
        if(data.groups){
          data.groups.forEach(function(g){
            html += '<div class="modal-group">';
            html += '<div class="modal-group-name">' + g.name + '</div>';
            g.items.forEach(function(name){ html += renderItem(name); });
            html += '</div>';
          });
        } else {
          data.items.forEach(function(name){ html += renderItem(name); });
        }
        html += '</div>';
      }
      html += '<div class="modal-cta-row">';
      html += '  <a href="#price" class="btn js-cta" data-modal-cta>Вступить в Переговорку <svg class="arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg></a>';
      html += '</div>';
      bodyEl.innerHTML = html;

      overlay.hidden = false;
      requestAnimationFrame(function(){ overlay.classList.add('open'); });
      document.body.classList.add('modal-locked');
      setTimeout(function(){ closeBtn.focus(); }, 50);
    }

    function close(){
      overlay.classList.remove('open');
      document.body.classList.remove('modal-locked');
      setTimeout(function(){
        overlay.hidden = true;
        bodyEl.innerHTML = '';
        if(lastTrigger && lastTrigger.focus) lastTrigger.focus();
      }, 220);
    }

    document.querySelectorAll('.big-folder').forEach(function(btn){
      btn.addEventListener('click', function(){ open(btn.dataset.folder, btn); });
    });
    closeBtn.addEventListener('click', close);
    overlay.addEventListener('click', function(e){ if(e.target === overlay) close(); });
    document.addEventListener('keydown', function(e){ if(e.key === 'Escape' && overlay.classList.contains('open')) close(); });
    bodyEl.addEventListener('click', function(e){
      const a = e.target.closest('[data-modal-cta]');
      if(a) close();
    });
  })();

  // sticky cta after hero
  (function(){
    const cta = document.getElementById('stickycta');
    const hero = document.querySelector('.hero');
    function check(){
      if(!hero) return;
      const rect = hero.getBoundingClientRect();
      if(rect.bottom < 80){
        cta.classList.add('show');
      } else {
        cta.classList.remove('show');
      }
    }
    window.addEventListener('scroll', check, { passive: true });
    window.addEventListener('resize', check);
    check();
  })();
