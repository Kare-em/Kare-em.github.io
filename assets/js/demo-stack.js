/* Встроенное демо-плеибл «Stack Tower» для телефона на лендинге.
   Механика: блок ездит, тап — роняем, выступающая часть срезается.
   Без движка и ассетов — чистый Canvas 2D, чтобы не утяжелять страницу.
   Устроено как настоящий плеибл: туториал-рука → геймплей → эндкарта с CTA. */
(function () {
  'use strict';

  // Все числа геймплея — здесь. Размеры — доли ширины/высоты экрана телефона,
  // чтобы демо одинаково игралось в телефоне 300px и 260px на мобиле.
  const CFG = {
    goal: 12,           // блоков до победной эндкарты (≈ 15–25 с игры)
    baseW: 0.56,        // ширина основания, доля ширины
    blockH: 0.046,      // высота блока, доля высоты
    baseY: 0.80,        // верх основания, доля высоты
    keepTopAt: 0.44,    // камера держит верх башни не выше этой доли высоты
    speed: 0.62,        // скорость блока, ширин экрана в секунду
    speedUp: 0.055,     // +5.5% скорости за каждый поставленный блок
    perfectTol: 0.016,  // допуск «Perfect», доля ширины
    gravity: 2.6,       // ускорение обрезков, высот экрана / с²
    hue0: 262,          // первый блок фиолетовый...
    hueStep: 10,        // ...к двенадцатому уходит в оранжевый (цвета лендинга)
    endDelayWin: 0.7,   // пауза перед эндкартой, с — дать увидеть последний блок
    endDelayLose: 1.0,
  };

  // Язык (i18n.js): текст на canvas рисуется каждый кадр — берём язык в момент
  // отрисовки; DOM-оверлеи пишем обоими языками сразу, лишний прячет CSS.
  const tx = (t) => (Array.isArray(t) ? (window.I18N ? window.I18N.pick(t[0], t[1]) : t[0]) : t);
  const bi = (ru, en) => '<span lang="ru">' + ru + '</span><span lang="en">' + en + '</span>';

  function mount(host, opts) {
    opts = opts || {};
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    host.appendChild(canvas);

    const tut = document.createElement('div');
    tut.className = 'demo-tut';
    tut.innerHTML = '<div class="demo-tut__hand" aria-hidden="true">👆</div><div class="demo-tut__text">' + bi('Тапни, чтобы строить', 'Tap to build') + '</div>';
    host.appendChild(tut);

    const endEl = document.createElement('div');
    endEl.className = 'demo-end';
    host.appendChild(endEl);

    let W = 0, H = 0, bh = 0, dpr = 1;
    let state, blocks, cur, dir, falling, pops, rings, camY, perfects, combo, endTimer, stars, won;
    let raf = 0, last = 0, running = false, onScreen = true;

    // ───── размеры ─────
    function measure() {
      const r = host.getBoundingClientRect();
      const w = Math.round(r.width), h = Math.round(r.height);
      if (!w || !h) return false;
      const changed = w !== W || h !== H;
      W = w; H = h; bh = Math.round(H * CFG.blockH);
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = W * dpr; canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      return changed;
    }

    // ───── состояние ─────
    function reset() {
      measure();
      state = 'intro'; won = false;
      const bw = W * CFG.baseW;
      blocks = [{ x: (W - bw) / 2, w: bw, i: 0 }];
      falling = []; pops = []; rings = [];
      camY = 0; perfects = 0; combo = 0; endTimer = -1; dir = 1;
      stars = Array.from({ length: 40 }, () => ({ x: Math.random(), y: Math.random(), r: Math.random() * 1.3 + 0.3, a: Math.random() * 0.5 + 0.2 }));
      spawn();
      tut.classList.add('is-on');
      endEl.classList.remove('is-on');
      endEl.innerHTML = '';
    }

    function spawn() {
      const top = blocks[blocks.length - 1];
      // новый блок выезжает с чередующейся стороны, как в оригинальном Stack
      dir = blocks.length % 2 ? 1 : -1;
      const x = dir > 0 ? -top.w * 0.5 : W - top.w * 0.5;
      cur = { x, w: top.w, i: blocks.length };
    }

    // экранная Y верхней грани блока на уровне i (мировая ось — вверх от основания)
    const yOf = (i) => H * CFG.baseY - i * bh + camY;
    const hueOf = (i) => (CFG.hue0 + i * CFG.hueStep) % 360;

    // ───── ввод ─────
    function onTap(e) {
      if (e.target.closest('.demo-end')) return;
      if (state === 'intro') { state = 'play'; tut.classList.remove('is-on'); }
      if (state !== 'play') return;
      e.preventDefault();
      place();
    }

    function place() {
      const prev = blocks[blocks.length - 1];
      const d = cur.x - prev.x;

      if (Math.abs(d) <= W * CFG.perfectTol) {
        // Perfect: доводим блок ровно на предыдущий, ширина не теряется
        cur.x = prev.x; cur.w = prev.w;
        perfects++; combo++;
        rings.push({ x: cur.x, y: cur.i, w: cur.w, t: 0 });
        pop(combo > 1 ? 'Perfect ×' + combo : 'Perfect!', cur.x + cur.w / 2, cur.i, '#FFD27A');
      } else {
        combo = 0;
        const left = Math.max(cur.x, prev.x);
        const right = Math.min(cur.x + cur.w, prev.x + prev.w);
        const ov = right - left;
        if (ov <= 0) {
          // промах — блок падает целиком
          falling.push(fallPiece(cur.x, cur.w, cur.i, dir));
          state = 'over'; won = false; endTimer = CFG.endDelayLose;
          pop(['Мимо!', 'Miss!'], W / 2, cur.i + 2, '#FF8A8A');
          cur = null;
          return;
        }
        // обрезок — та часть, что вылезла за предыдущий блок
        if (cur.x < prev.x) falling.push(fallPiece(cur.x, prev.x - cur.x, cur.i, -1));
        else falling.push(fallPiece(right, cur.x + cur.w - right, cur.i, 1));
        cur.x = left; cur.w = ov;
      }

      blocks.push({ x: cur.x, w: cur.w, i: cur.i });
      if (blocks.length - 1 >= CFG.goal) {
        state = 'over'; won = true; endTimer = CFG.endDelayWin; cur = null;
        pop(['Башня готова!', 'Tower complete!'], W / 2, blocks.length + 1, '#7EE0B0');
      } else {
        spawn();
      }
    }

    function fallPiece(x, w, i, side) {
      return { x, w, i, wy: (i + 1) * bh, vy: 0, vx: side * W * 0.08, rot: 0, vr: side * (1.5 + Math.random()) };
    }
    function pop(text, x, i, color) { pops.push({ text, x, i, t: 0, color }); }

    // ───── эндкарта ─────
    function showEnd() {
      state = 'end';
      const n = blocks.length - 1;
      endEl.innerHTML =
        '<div class="demo-end__card">' +
          '<div class="demo-end__emoji">' + (won ? '🏆' : '🧱') + '</div>' +
          '<div class="demo-end__title">' + (won ? bi('Башня готова!', 'Tower complete!') : bi('Почти получилось!', 'So close!')) + '</div>' +
          '<div class="demo-end__sub">' + n + ' ' + bi(plural(n, 'блок', 'блока', 'блоков'), n === 1 ? 'block' : 'blocks') + (perfects ? ' · ' + perfects + ' perfect' : '') + '</div>' +
          '<button class="demo-end__cta" type="button">' + bi('Хочу такой плеибл', 'Want one like this') + '</button>' +
          '<button class="demo-end__again" type="button">' + bi('Сыграть ещё', 'Play again') + '</button>' +
        '</div>';
      endEl.querySelector('.demo-end__cta').onclick = () => opts.onCta && opts.onCta();
      endEl.querySelector('.demo-end__again').onclick = () => reset();
      endEl.classList.add('is-on');
    }
    function plural(n, one, few, many) {
      const m10 = n % 10, m100 = n % 100;
      if (m10 === 1 && m100 !== 11) return one;
      if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return few;
      return many;
    }

    // ───── цикл ─────
    function update(dt) {
      const placed = blocks.length - 1;
      if (cur) {
        const speed = W * CFG.speed * (1 + placed * CFG.speedUp);
        cur.x += dir * speed * dt;
        // отскок от краёв: центр блока ходит от 0 до W
        if (cur.x + cur.w / 2 > W) { cur.x = W - cur.w / 2; dir = -1; }
        if (cur.x + cur.w / 2 < 0) { cur.x = -cur.w / 2; dir = 1; }
      }

      const n = blocks.length + (cur ? 1 : 0);
      const target = Math.max(0, n * bh - H * (CFG.baseY - CFG.keepTopAt));
      camY += (target - camY) * Math.min(1, dt * 6);

      const g = H * CFG.gravity;
      for (const f of falling) { f.vy += g * dt; f.wy -= f.vy * dt; f.x += f.vx * dt; f.rot += f.vr * dt; }
      falling = falling.filter((f) => yOf(0) - f.wy < H + 200); // улетел за низ экрана — удаляем

      for (const p of pops) p.t += dt;
      pops = pops.filter((p) => p.t < 1.1);
      for (const r of rings) r.t += dt;
      rings = rings.filter((r) => r.t < 0.6);

      if (endTimer > 0) { endTimer -= dt; if (endTimer <= 0) showEnd(); }
    }

    function roundRect(x, y, w, h, r) {
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(x, y, w, h, r); else ctx.rect(x, y, w, h);
    }

    function drawBlock(x, y, w, h, hue, alpha) {
      ctx.globalAlpha = alpha == null ? 1 : alpha;
      const gr = ctx.createLinearGradient(0, y, 0, y + h);
      gr.addColorStop(0, 'hsl(' + hue + ',95%,70%)');
      gr.addColorStop(1, 'hsl(' + hue + ',80%,50%)');
      ctx.fillStyle = gr;
      roundRect(x, y, w, h - 1, 4); ctx.fill();
      ctx.fillStyle = 'hsla(' + hue + ',100%,88%,.75)';
      roundRect(x + 2, y + 1, Math.max(0, w - 4), 2, 1); ctx.fill();
      ctx.globalAlpha = 1;
    }

    function draw() {
      // фон: тёмно-фиолетовый градиент + звёзды с параллаксом от камеры
      const bg = ctx.createLinearGradient(0, 0, 0, H);
      bg.addColorStop(0, '#1A0B38');
      bg.addColorStop(0.6, '#0E0620');
      bg.addColorStop(1, '#07030F');
      ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
      const glow = ctx.createRadialGradient(W / 2, H * 0.75, 0, W / 2, H * 0.75, W * 0.9);
      glow.addColorStop(0, 'rgba(123,60,255,.35)'); glow.addColorStop(1, 'rgba(123,60,255,0)');
      ctx.fillStyle = glow; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = '#fff';
      for (const s of stars) {
        const sy = ((s.y * H + camY * 0.35) % H + H) % H;
        ctx.globalAlpha = s.a; ctx.beginPath(); ctx.arc(s.x * W, sy, s.r, 0, 6.283); ctx.fill();
      }
      ctx.globalAlpha = 1;

      // основание до низа экрана
      const b0 = blocks[0];
      const y0 = yOf(1);
      drawBlock(b0.x, y0, b0.w, H - y0 + 8, hueOf(0));
      for (let k = 1; k < blocks.length; k++) {
        const b = blocks[k];
        drawBlock(b.x, yOf(b.i + 1), b.w, bh, hueOf(b.i));
      }

      // обрезки
      for (const f of falling) {
        const sy = H * CFG.baseY + camY - f.wy;
        ctx.save();
        ctx.translate(f.x + f.w / 2, sy + bh / 2);
        ctx.rotate(f.rot * 0.25);
        drawBlock(-f.w / 2, -bh / 2, f.w, bh, hueOf(f.i), 0.9);
        ctx.restore();
      }

      // движущийся блок
      if (cur) drawBlock(cur.x, yOf(cur.i + 1), cur.w, bh, hueOf(cur.i));

      // кольца Perfect
      for (const r of rings) {
        const k = r.t / 0.6, pad = 4 + k * 16;
        ctx.strokeStyle = 'rgba(255,210,122,' + (1 - k) + ')'; ctx.lineWidth = 2;
        roundRect(r.x - pad, yOf(r.y + 1) - pad, r.w + pad * 2, bh + pad * 2, 6 + pad / 2); ctx.stroke();
      }

      // всплывающие надписи
      ctx.textAlign = 'center';
      for (const p of pops) {
        const k = p.t / 1.1;
        ctx.globalAlpha = 1 - k * k;
        ctx.fillStyle = p.color;
        ctx.font = '700 ' + Math.round(W * 0.065) + 'px Geologica, system-ui, sans-serif';
        ctx.fillText(tx(p.text), p.x, yOf(p.i + 1) - 14 - k * 40);
      }
      ctx.globalAlpha = 1;

      // HUD: счёт сверху (ниже «чёлки» телефона)
      const placed = blocks.length - 1;
      ctx.fillStyle = '#fff';
      ctx.font = '800 ' + Math.round(W * 0.17) + 'px Geologica, system-ui, sans-serif';
      ctx.fillText(String(placed), W / 2, H * 0.16);
      ctx.fillStyle = 'rgba(255,255,255,.55)';
      ctx.font = '500 ' + Math.round(W * 0.045) + 'px Onest, system-ui, sans-serif';
      ctx.fillText(tx(['из ', 'of ']) + CFG.goal, W / 2, H * 0.16 + W * 0.075);
      // полоска прогресса
      const pw = W * 0.4, px = (W - pw) / 2, py = H * 0.16 + W * 0.11;
      ctx.fillStyle = 'rgba(255,255,255,.12)'; roundRect(px, py, pw, 4, 2); ctx.fill();
      const pg = ctx.createLinearGradient(px, 0, px + pw, 0);
      pg.addColorStop(0, '#7B3CFF'); pg.addColorStop(1, '#FF8A1F');
      ctx.fillStyle = pg; roundRect(px, py, pw * Math.min(1, placed / CFG.goal), 4, 2); ctx.fill();
    }

    function frame(now) {
      if (!running) return;
      const dt = Math.min(0.05, (now - last) / 1000 || 0);
      last = now;
      update(dt);
      draw();
      raf = requestAnimationFrame(frame);
    }

    // цикл крутится, только пока телефон на экране и вкладка активна
    function start() { if (running || !onScreen || document.hidden) return; running = true; last = performance.now(); raf = requestAnimationFrame(frame); }
    function stop() { running = false; cancelAnimationFrame(raf); }

    const io = new IntersectionObserver((es) => { onScreen = es[0].isIntersecting; onScreen ? start() : stop(); });
    io.observe(host);
    const onVis = () => (document.hidden ? stop() : start());
    document.addEventListener('visibilitychange', onVis);
    const ro = new ResizeObserver(() => { if (measure()) reset(); });
    ro.observe(host);
    host.addEventListener('pointerdown', onTap);

    reset();
    start();

    return {
      restart: reset,
      destroy() {
        stop(); io.disconnect(); ro.disconnect();
        document.removeEventListener('visibilitychange', onVis);
        host.removeEventListener('pointerdown', onTap);
        canvas.remove(); tut.remove(); endEl.remove();
      },
    };
  }

  window.StackDemo = { mount };
})();
