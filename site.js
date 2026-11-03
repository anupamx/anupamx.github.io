(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var coarse = window.matchMedia('(hover: none) and (pointer: coarse)').matches;

  setTimeout(function () { document.documentElement.classList.add('anim-done'); }, 3200);

  /* ---------- Reveal: rows fade up, staggered, once ---------- */
  var items = [].slice.call(document.querySelectorAll('.reveal-item'));
  if (reduce || !('IntersectionObserver' in window)) {
    items.forEach(function (el) { el.classList.add('in'); });
  } else {
    var ioFired = false;
    var rio = new IntersectionObserver(function (entries) {
      ioFired = true;
      entries.filter(function (e) { return e.isIntersecting; }).forEach(function (e, i) {
        e.target.style.transitionDelay = (0.05 + i * 0.09) + 's';
        e.target.classList.add('in');
        rio.unobserve(e.target);
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0 });
    items.forEach(function (el) { rio.observe(el); });
    /* Failsafe: if the observer never reports (blocked, throttled or unsupported), show everything. */
    setTimeout(function () { if (!ioFired) items.forEach(function (el) { el.classList.add('in'); }); }, 2500);
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
    { lane: 'sodio', t: T(2016, 11), date: '2016', text: 'Co-founded Sodio with Naveen Saraswat.', src: [8] },
    { lane: 'munim', t: T(2019, 11), date: 'Nov 2019', text: 'Started Munim in Bengaluru with Naveen Saraswat.', src: [1] },
    { lane: 'munim', t: T(2020, 6), date: '2020', text: 'Munim launched.', src: [7] },
    { lane: 'munim', t: T(2022, 2, 28), date: '28 Feb 2022', text: 'BikeWo acquired Munim, cash and stock.', src: [9, 21, 10, 7, 32] },
    { lane: 'truffles', t: T(2022, 2), date: 'Feb 2022', text: 'Co-founded Truffles and became CTO.', src: [1, 22] },
    { lane: 'truffles', t: T(2023, 3, 21), date: '21 Mar 2023', text: "Outlier Ventures' first Zero Knowledge Base Camp cohort.", src: [2] },
    { lane: 'truffles', t: T(2023, 4, 4), date: '4 Apr 2023', text: 'V1 payment platform announced: 10 geographies, 13 currencies.', src: [3] },
    { lane: 'truffles', t: T(2023, 6, 1), date: '1 Jun 2023', text: 'Polygon Supernets paper posted to arXiv.', src: [11] },
    { lane: 'truffles', t: T(2023, 6, 19), date: '19 Jun 2023', text: 'Outlier Ventures reports the angel round closed.', src: [15] },
    { lane: 'truffles', t: T(2023, 7, 27), date: '27 Jul 2023', text: 'Truffles launches with 22 business clients.', src: [27] },
    { lane: 'truffles', t: T(2023, 8, 24), date: '24 Aug 2023', text: 'Halborn security assessment announced as complete.', src: [28, 24] },
    { lane: 'truffles', t: T(2024, 2, 6), date: '6 to 7 Feb 2024', text: 'Founder speaker on the ZK proofs panel at the Red Beard Ventures Summit.', src: [26, 18] },
    { lane: 'chainrisk', t: T(2024, 2), date: 'Feb 2024', text: 'Joined Chainrisk as co-founder and CTO.', src: [] },
    { lane: 'chainrisk', t: T(2024, 7, 24), date: 'Jul 2024', text: 'RiskLayer Builders Round, co-led by Antler and Momentum6.', src: [13, 14, 12, 5, 20, 30, 31] },
    { lane: 'now', t: T(2026, 11), date: 'Now', text: 'Building Ballast and running Provingmark.', src: [], pulse: true }
  ];
  var laneByKey = {};
  lanes.forEach(function (l) { laneByKey[l.key] = l; });

  var chart = document.getElementById('journey-chart');
  var list = document.getElementById('journey-list');
  var LEVELS = [44, 16, 72, 30, 58];
  var MIN_GAP = 24;

  if (chart) {
    chart.setAttribute('role', 'group');
    var years = '';
    for (var y = 2016; y <= 2026; y += 2) {
      years += '<span style="left:' + (y === 2016 ? 0 : pct(y)) + '%">' + y + '</span>';
    }
    var html = '<div class="j-rows">';
    lanes.forEach(function (l) {
      var evs = events.filter(function (e) { return e.lane === l.key; }).sort(function (a, b) { return a.t - b.t; });
      var marks = evs.map(function (e) {
        var links = '';
        if (e.src.length) {
          links += e.src.map(function (n) { return '<a href="#src-' + n + '">Source ' + (n < 10 ? '0' + n : n) + '</a>'; }).join('');
        }
        links += '<a href="' + l.href + '">Chapter</a>';
        var data = encodeURIComponent(JSON.stringify({ d: e.date, x: e.text, l: links }));
        return '<button type="button" class="j-mark' + (e.pulse ? ' pulse' : '') + '" data-t="' + pct(e.t) + '" aria-label="' + e.date + ': ' + e.text + '" aria-expanded="false" aria-controls="j-tip" data-tip="' + data + '"></button>';
      }).join('');
      var bar = l.from != null ? '<div class="j-bar" style="left:' + pct(l.from) + '%;width:' + (pct(l.to) - pct(l.from)) + '%"></div>' : '';
      html += '<div class="j-row' + (l.hl ? ' hl' : '') + '"><div class="j-name"><a href="' + l.href + '">' + l.name + '</a></div><div class="j-track">' + bar + marks + '</div></div>';
    });
    html += '<div class="j-now" style="left:calc(var(--lw) + var(--gap) + (100% - var(--lw) - var(--gap)) * ' + (pct(T(2026, 11)) / 100) + ')"><em>now</em></div></div>';
    html += '<div class="j-axis" aria-hidden="true"><span></span><div class="j-ticks">' + years + '</div></div><div class="j-tip" id="j-tip" role="tooltip"></div>';
    chart.innerHTML = html;

    /* Place markers by pixel distance so close events never sit on top of each other. */
    var layout = function () {
      [].slice.call(chart.querySelectorAll('.j-track')).forEach(function (track) {
        var w = track.clientWidth;
        if (!w) return;
        var last = LEVELS.map(function () { return -999; });
        [].slice.call(track.querySelectorAll('.j-mark')).forEach(function (m) {
          var x = (parseFloat(m.getAttribute('data-t')) / 100) * w;
          var pick = -1, best = -1, bestIdx = 0;
          for (var k = 0; k < LEVELS.length; k++) {
            var dist = x - last[k];
            if (dist >= MIN_GAP) { pick = k; break; }
            if (dist > best) { best = dist; bestIdx = k; }
          }
          if (pick < 0) pick = bestIdx;
          last[pick] = x;
          m.style.left = m.getAttribute('data-t') + '%';
          m.style.top = LEVELS[pick] + 'px';
        });
      });
    };
    layout();
    var rt = 0;
    window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(layout, 120); });

    var tip = chart.querySelector('.j-tip');
    var hideTimer = 0, openBtn = null, hoverOpenAt = 0;
    var close = function () {
      tip.classList.remove('show');
      if (openBtn) openBtn.setAttribute('aria-expanded', 'false');
      openBtn = null;
    };
    var show = function (btn) {
      clearTimeout(hideTimer);
      var d = JSON.parse(decodeURIComponent(btn.getAttribute('data-tip')));
      tip.innerHTML = '<time>' + d.d + '</time><p>' + d.x + '</p><div class="j-links">' + d.l + '</div>';
      var c = chart.getBoundingClientRect(), b = btn.getBoundingClientRect();
      var w = Math.min(300, window.innerWidth * 0.8);
      var h = tip.offsetHeight;
      var left = Math.max(8, Math.min(b.left - c.left + b.width / 2 - w / 2, c.width - w - 8));
      var below = b.top - c.top + 24;
      tip.style.left = left + 'px';
      tip.style.top = (below + h + 8 > c.height ? b.top - c.top - h - 8 : below) + 'px';
      tip.classList.add('show');
      if (openBtn && openBtn !== btn) openBtn.setAttribute('aria-expanded', 'false');
      btn.setAttribute('aria-expanded', 'true');
      openBtn = btn;
    };
    var hideSoon = function () { clearTimeout(hideTimer); hideTimer = setTimeout(close, 220); };

    [].slice.call(chart.querySelectorAll('.j-mark')).forEach(function (btn) {
      btn.addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse') { show(btn); hoverOpenAt = Date.now(); } });
      btn.addEventListener('pointerleave', function (e) { if (e.pointerType === 'mouse') hideSoon(); });
      btn.addEventListener('focus', function () { show(btn); });
      btn.addEventListener('blur', hideSoon);
      btn.addEventListener('click', function (ev) {
        ev.stopPropagation();
        if (Date.now() - hoverOpenAt < 400) return;
        if (openBtn === btn && tip.classList.contains('show')) { close(); } else { show(btn); }
      });
    });
    tip.addEventListener('pointerenter', function () { clearTimeout(hideTimer); });
    tip.addEventListener('pointerleave', hideSoon);
    tip.addEventListener('focusin', function () { clearTimeout(hideTimer); });
    tip.addEventListener('focusout', hideSoon);
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && openBtn) { var b = openBtn; close(); b.focus(); }
    });
    document.addEventListener('click', function (e) { if (!chart.contains(e.target)) close(); });

    if (reduce || !('IntersectionObserver' in window)) {
      chart.classList.add('in');
    } else {
      var cioFired = false;
      var cio = new IntersectionObserver(function (es) {
        cioFired = true;
        if (es.some(function (e) { return e.isIntersecting; })) { chart.classList.add('in'); cio.disconnect(); }
      }, { threshold: 0.25 });
      cio.observe(chart);
      setTimeout(function () { if (!cioFired) chart.classList.add('in'); }, 2500);
    }
  }
  if (list) {
    list.innerHTML = events.slice().sort(function (a, b) { return a.t - b.t; }).map(function (e) {
      return '<li><time>' + e.date + '</time><div><b>' + laneByKey[e.lane].name + '</b><span>' + e.text + '</span></div></li>';
    }).join('');
  }

  /* ---------- Rail progress and nav state: batch reads, then write ---------- */
  var rails = [].slice.call(document.querySelectorAll('.rail'));
  var navLinks = [].slice.call(document.querySelectorAll('.nav ul a'));
  var sectionIds = ['journey', 'sodio', 'munim', 'truffles', 'chainrisk', 'now', 'sources'];
  var sections = sectionIds.map(function (id) { return document.getElementById(id); });
  var queued = false;
  function updateRails() {
    queued = false;
    var line = window.innerHeight * 0.62;
    var railData = rails.map(function (rail) {
      return { rail: rail, r: rail.getBoundingClientRect(), tops: [].slice.call(rail.children).map(function (ms) { return ms.getBoundingClientRect().top; }) };
    });
    var secTops = sections.map(function (el) { return el ? el.getBoundingClientRect().top : Infinity; });
    railData.forEach(function (d) {
      var p = Math.max(0, Math.min(1, (line - d.r.top) / d.r.height));
      d.rail.style.setProperty('--p', reduce ? 1 : p.toFixed(3));
      [].slice.call(d.rail.children).forEach(function (ms, i) { ms.classList.toggle('on', reduce || d.tops[i] < line); });
    });
    var current = '';
    sectionIds.forEach(function (id, i) { if (secTops[i] <= 160) current = id; });
    navLinks.forEach(function (a) {
      var on = a.getAttribute('href') === '#' + current;
      a.classList.toggle('on', on);
      if (on) a.setAttribute('aria-current', 'location'); else a.removeAttribute('aria-current');
    });
  }
  function queueUpdate() { if (!queued) { queued = true; requestAnimationFrame(updateRails); } }
  window.addEventListener('scroll', queueUpdate, { passive: true });
  window.addEventListener('resize', queueUpdate);
  updateRails();

  /* ---------- Edge glow: pointer-tracked amber arc on card borders ---------- */
  if (!reduce) {
    var cards = [].slice.call(document.querySelectorAll('.edge')).map(function (card) {
      var el = document.createElement('div');
      el.className = 'edge-glow';
      el.setAttribute('aria-hidden', 'true');
      if (coarse) el.setAttribute('data-touch', '');
      card.appendChild(el);
      return { card: card, el: el, cur: 0, tgt: 0, running: false, active: '0' };
    });
    var lerpTick = function (c) {
      var diff = ((((c.tgt - c.cur + 180) % 360) + 360) % 360) - 180;
      c.cur += diff * 0.14;
      c.el.style.setProperty('--eg-angle', c.cur.toFixed(2));
      if (Math.abs(diff) > 0.4) { requestAnimationFrame(function () { lerpTick(c); }); } else { c.running = false; }
    };
    var aim = function (c, r, x, y) {
      c.tgt = (Math.atan2(y - (r.top + r.height / 2), x - (r.left + r.width / 2)) * 180) / Math.PI + 90;
      if (!c.running) { c.running = true; requestAnimationFrame(function () { lerpTick(c); }); }
    };
    var setActive = function (c, v) { if (c.active !== v) { c.active = v; c.el.style.setProperty('--eg-active', v); } };
    if (!coarse) {
      var lastE = null, pending = false;
      document.body.addEventListener('pointermove', function (e) {
        lastE = e;
        if (pending) return;
        pending = true;
        requestAnimationFrame(function () {
          pending = false;
          var rects = cards.map(function (c) { return c.card.getBoundingClientRect(); });
          cards.forEach(function (c, i) {
            var r = rects[i];
            if (!r.width) return;
            var inside = lastE.clientX > r.left - 72 && lastE.clientX < r.right + 72 && lastE.clientY > r.top - 72 && lastE.clientY < r.bottom + 72;
            setActive(c, inside ? '1' : '0');
            if (inside) aim(c, r, lastE.clientX, lastE.clientY);
          });
        });
      }, { passive: true });
    } else {
      var swingQueued = false;
      var swing = function () {
        swingQueued = false;
        var vh = window.innerHeight, lx = window.innerWidth * 0.82, ly = vh * 0.5;
        var rects = cards.map(function (c) { return c.card.getBoundingClientRect(); });
        cards.forEach(function (c, i) {
          var r = rects[i];
          if (r.bottom < 0 || r.top > vh) { setActive(c, '0'); return; }
          var d = Math.abs(r.top + r.height / 2 - ly) / (vh * 0.5);
          setActive(c, Math.max(0, Math.min(1, 1.25 - d * 1.6)).toFixed(2));
          aim(c, r, lx, ly);
        });
      };
      window.addEventListener('scroll', function () { if (!swingQueued) { swingQueued = true; requestAnimationFrame(swing); } }, { passive: true });
      swing();
    }
  }
})();
