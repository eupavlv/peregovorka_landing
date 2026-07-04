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
    const metaEl  = document.getElementById('modal-meta-text');
    const bodyEl  = document.getElementById('modal-body');
    const closeBtn = document.getElementById('modal-close-btn');
    let lastTrigger = null;

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
        icon: '▤',
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
        icon: '♪',
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
        icon: '●',
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
        icon: '✉',
      },
    };

    function open(key, trigger){
      const data = FOLDERS[key];
      if(!data) return;
      lastTrigger = trigger || null;

      titleEl.textContent = data.title;
      metaEl.textContent  = data.meta;

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
      html += '  <a href="#price" class="btn js-cta" data-modal-cta>Вступить в Переговорку <span class="arrow">→</span></a>';
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
