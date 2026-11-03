(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var coarse = window.matchMedia('(hover: none) and (pointer: coarse)').matches;

  /* ---------- Reveal: rows fade up, staggered, once ---------- */
  var items = [].slice.call(document.querySelectorAll('.reveal-item'));
  if (reduce || !('IntersectionObserver' in window)) {
    items.forEach(function (el) { el.classList.add('in'); });
  } else {
    var rio = new IntersectionObserver(function (entries) {
      var batch = entries.filter(function (e) { return e.isIntersecting; });
      batch.forEach(function (e, i) {
        e.target.style.transitionDelay = (0.05 + i * 0.09) + 's';
        e.target.classList.add('in');
        rio.unobserve(e.target);
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0 });
    items.forEach(function (el) { rio.observe(el); });
  }

  /* ---------- Journey: swimlane timeline ---------- */
  var START = 2016, END = 2027, SPAN = END - START;
  function T(y, m, d) { return y + ((m || 1) - 1) / 12 + ((d || 1) - 1) / 365; }
  var pct = function (t) { return ((t - START) / SPAN) * 100; };

  var lanes = [
    { key: 'sodio', name: 'Sodio', href: '#sodio', from: T(2016, 11), to: T(2022, 2), hl: false },
    { key: 'munim', name: 'Munim', href: '#munim', from: T(2019, 11), to: T(2021, 12), hl: false },
    { key: 'truffles', name: 'Truffles', href: '#truffles', from: T(2022, 2), to: T(2024, 2), hl: true },
    { key: 'chainrisk', name: 'Chainrisk', href: '#chainrisk', from: T(2024, 2), to: T(2025, 5), hl: true },
    { key: 'now', name: 'Now', href: '#now', hl: true }
  ];
  var events = [
    { lane: 'sodio', t: T(2016, 11), date: 'Nov 2016', text: 'Co-founded Sodio with Naveen Saraswat.', src: [8] },
    { lane: 'sodio', t: T(2022, 2), date: 'Feb 2022', text: 'Handed Sodio on.', src: [] },
    { lane: 'munim', t: T(2019, 11), date: 'Nov 2019', text: 'Started Munim in Bengaluru.', src: [] },
    { lane: 'munim', t: T(2020, 6), date: '2020', text: 'Munim launched.', src: [7] },
    { lane: 'munim', t: T(2022, 2, 28), date: '28 Feb 2022', text: 'BikeWo acquired Munim, cash and stock.', src: [9, 10, 7] },
    { lane: 'truffles', t: T(2022, 2), date: 'Feb 2022', text: 'Co-founded Truffles and became CTO.', src: [1] },
    { lane: 'truffles', t: T(2023, 3, 21), date: '21 Mar 2023', text: "Outlier Ventures' first Zero Knowledge Base Camp cohort.", src: [2] },
    { lane: 'truffles', t: T(2023, 4, 4), date: '4 Apr 2023', text: 'V1 payment platform announced: 10 geographies, 13 currencies.', src: [3] },
    { lane: 'truffles', t: T(2023, 5, 23), date: '23 May 2023', text: 'NFT invoicing announced on Polygon.', src: [19] },
    { lane: 'truffles', t: T(2023, 6, 1), date: '1 Jun 2023', text: 'Polygon Supernets paper posted to arXiv.', src: [11] },
    { lane: 'truffles', t: T(2023, 6, 19), date: '19 Jun 2023', text: 'Outlier Ventures reports the angel round closed.', src: [15] },
    { lane: 'chainrisk', t: T(2024, 2), date: 'Feb 2024', text: 'Joined Chainrisk as co-founder and CTO.', src: [] },
    { lane: 'chainrisk', t: T(2024, 7, 24), date: 'Jul 2024', text: 'RiskLayer Builders Round, co-led by Antler and Momentum6.', src: [13, 14, 12, 5] },
    { lane: 'chainrisk', t: T(2025, 5), date: 'May 2025', text: 'Left Chainrisk.', src: [1] },
    { lane: 'now', t: T(2026, 11), date: 'Now', text: 'Building Ballast and running Provingmark.', src: [], pulse: true }
  ];
  var laneByKey = {};
  lanes.forEach(function (l) { laneByKey[l.key] = l; });

  var chart = document.getElementById('journey-chart');
  var list = document.getElementById('journey-list');
  if (chart) {
    var years = '';
    for (var y = 2016; y <= 2026; y += 2) {
      years += '<span style="left:' + (y === 2016 ? 0 : pct(y)) + '%">' + y + '</span>';
    }
    var html = '<div class="j-rows">';
    lanes.forEach(function (l) {
      var evs = events.filter(function (e) { return e.lane === l.key; }).sort(function (a, b) { return a.t - b.t; });
      var levels = [32, 10, 54], last = [-9, -9, -9];
      var marks = evs.map(function (e, i) {
        var lv = 0;
        for (var k = 0; k < levels.length; k++) { if (e.t - last[k] > 0.34) { lv = k; break; } lv = (k + 1) % levels.length; }
        last[lv] = e.t;
        var links = '';
        if (e.src.length) {
          links += e.src.map(function (n) { return '<a href="#src-' + n + '">Source ' + (n < 10 ? '0' + n : n) + '</a>'; }).join('');
        }
        links += '<a href="' + l.href + '">Chapter</a>';
        var data = encodeURIComponent(JSON.stringify({ d: e.date, x: e.text, l: links }));
        return '<button type="button" class="j-mark' + (e.pulse ? ' pulse' : '') + '" style="left:' + pct(e.t) + '%;top:' + levels[lv] + 'px" aria-label="' + e.date + ': ' + e.text + '" aria-expanded="false" data-tip="' + data + '"></button>';
      }).join('');
      var bar = l.from != null ? '<div class="j-bar" style="left:' + pct(l.from) + '%;width:' + (pct(l.to) - pct(l.from)) + '%"></div>' : '';
      html += '<div class="j-row' + (l.hl ? ' hl' : '') + '"><div class="j-name"><a href="' + l.href + '">' + l.name + '</a></div><div class="j-track">' + bar + marks + '</div></div>';
    });
    html += '<div class="j-now" style="left:calc(var(--lw) + var(--gap) + (100% - var(--lw) - var(--gap)) * ' + (pct(T(2026, 11)) / 100) + ')"><em>now</em></div></div>';
    html += '<div class="j-axis" aria-hidden="true"><span></span><div class="j-ticks">' + years + '</div></div><div class="j-tip" role="tooltip"></div>';
    chart.innerHTML = html;

    var tip = chart.querySelector('.j-tip');
    var hideTimer = 0, openBtn = null;
    var show = function (btn) {
      clearTimeout(hideTimer);
      var d = JSON.parse(decodeURIComponent(btn.getAttribute('data-tip')));
      tip.innerHTML = '<time>' + d.d + '</time><p>' + d.x + '</p><div class="j-links">' + d.l + '</div>';
      var c = chart.getBoundingClientRect(), b = btn.getBoundingClientRect();
      var w = Math.min(300, window.innerWidth * 0.8);
      var left = b.left - c.left + b.width / 2 - w / 2;
      left = Math.max(8, Math.min(left, c.width - w - 8));
      var below = b.top - c.top + 26;
      tip.style.left = left + 'px';
      tip.style.top = (below + 170 > c.height ? b.top - c.top - 130 : below) + 'px';
      tip.classList.add('show');
      if (openBtn && openBtn !== btn) openBtn.setAttribute('aria-expanded', 'false');
      btn.setAttribute('aria-expanded', 'true');
      openBtn = btn;
    };
    var hide = function () {
      hideTimer = setTimeout(function () {
        tip.classList.remove('show');
        if (openBtn) openBtn.setAttribute('aria-expanded', 'false');
        openBtn = null;
      }, 180);
    };
    [].slice.call(chart.querySelectorAll('.j-mark')).forEach(function (btn) {
      btn.addEventListener('mouseenter', function () { show(btn); });
      btn.addEventListener('focus', function () { show(btn); });
      btn.addEventListener('mouseleave', hide);
      btn.addEventListener('blur', hide);
      btn.addEventListener('click', function (ev) {
        ev.stopPropagation();
        if (openBtn === btn && tip.classList.contains('show')) { clearTimeout(hideTimer); hide(); } else { show(btn); }
      });
    });
    tip.addEventListener('mouseenter', function () { clearTimeout(hideTimer); });
    tip.addEventListener('mouseleave', hide);
    document.addEventListener('click', function (e) { if (!chart.contains(e.target)) { clearTimeout(hideTimer); hide(); } });

    if (reduce || !('IntersectionObserver' in window)) {
      chart.classList.add('in');
    } else {
      var cio = new IntersectionObserver(function (es) {
        if (es.some(function (e) { return e.isIntersecting; })) { chart.classList.add('in'); cio.disconnect(); }
      }, { threshold: 0.25 });
      cio.observe(chart);
    }
  }
  if (list) {
    list.innerHTML = events.slice().sort(function (a, b) { return a.t - b.t; }).map(function (e) {
      return '<li><time>' + e.date + '</time><div><b>' + laneByKey[e.lane].name + '</b><span>' + e.text + '</span></div></li>';
    }).join('');
  }

  /* ---------- Rail: amber line fills as you read; dots light up ---------- */
  var rails = [].slice.call(document.querySelectorAll('.rail'));
  var queued = false;
  function updateRails() {
    queued = false;
    var line = window.innerHeight * 0.62;
    rails.forEach(function (rail) {
      var r = rail.getBoundingClientRect();
      var p = Math.max(0, Math.min(1, (line - r.top) / r.height));
      rail.style.setProperty('--p', reduce ? 1 : p.toFixed(3));
      [].slice.call(rail.children).forEach(function (ms) {
        ms.classList.toggle('on', reduce || ms.getBoundingClientRect().top < line);
      });
    });
    var current = '';
    ['journey', 'sodio', 'munim', 'truffles', 'chainrisk', 'now', 'sources'].forEach(function (id) {
      var el = document.getElementById(id);
      if (el && el.getBoundingClientRect().top <= 160) current = id;
    });
    [].slice.call(document.querySelectorAll('.nav ul a')).forEach(function (a) {
      a.classList.toggle('on', a.getAttribute('href') === '#' + current);
    });
  }
  function queueUpdate() { if (!queued) { queued = true; requestAnimationFrame(updateRails); } }
  window.addEventListener('scroll', queueUpdate, { passive: true });
  window.addEventListener('resize', queueUpdate);
  updateRails();

  /* ---------- Edge glow: pointer-tracked amber arc on card borders ---------- */
  var cards = [].slice.call(document.querySelectorAll('.edge')).map(function (card) {
    var el = document.createElement('div');
    el.className = 'edge-glow';
    el.setAttribute('aria-hidden', 'true');
    if (coarse) el.setAttribute('data-touch', '');
    card.appendChild(el);
    return { card: card, el: el, cur: 0, tgt: 0, running: false };
  });
  function lerpTick(c) {
    var diff = ((((c.tgt - c.cur + 180) % 360) + 360) % 360) - 180;
    c.cur += diff * 0.14;
    c.el.style.setProperty('--eg-angle', c.cur.toFixed(2));
    if (Math.abs(diff) > 0.4) { requestAnimationFrame(function () { lerpTick(c); }); } else { c.running = false; }
  }
  function aim(c, r, x, y) {
    c.tgt = (Math.atan2(y - (r.top + r.height / 2), x - (r.left + r.width / 2)) * 180) / Math.PI + 90;
    if (!c.running) { c.running = true; requestAnimationFrame(function () { lerpTick(c); }); }
  }
  if (!coarse) {
    document.body.addEventListener('pointermove', function (e) {
      cards.forEach(function (c) {
        var r = c.card.getBoundingClientRect();
        if (!r.width) return;
        var inside = e.clientX > r.left - 72 && e.clientX < r.right + 72 && e.clientY > r.top - 72 && e.clientY < r.bottom + 72;
        c.el.style.setProperty('--eg-active', inside ? '1' : '0');
        if (inside) aim(c, r, e.clientX, e.clientY);
      });
    }, { passive: true });
  } else {
    var swing = function () {
      var vh = window.innerHeight, lx = window.innerWidth * 0.82, ly = vh * 0.5;
      cards.forEach(function (c) {
        var r = c.card.getBoundingClientRect();
        if (r.bottom < 0 || r.top > vh) { c.el.style.setProperty('--eg-active', '0'); return; }
        var d = Math.abs(r.top + r.height / 2 - ly) / (vh * 0.5);
        c.el.style.setProperty('--eg-active', Math.max(0, Math.min(1, 1.25 - d * 1.6)).toFixed(3));
        aim(c, r, lx, ly);
      });
    };
    window.addEventListener('scroll', function () { requestAnimationFrame(swing); }, { passive: true });
    swing();
  }
})();
