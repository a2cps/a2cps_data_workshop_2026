// Interactive hero.
//  1. Ambient glyphs: a sparse field of small science icons (molecules, DNA,
//     brains, MRI slices, test tubes, neurons) drifting slowly across the hero.
//     They are gently attracted to the cursor when it comes near, and drift
//     back home when it leaves.
//  2. The A2CPS mark shifts hue and tilts under the cursor.
//  3. The cover network: hovering over the graphic fires a colour pulse that
//     flows node-to-node through the network, drawn on a canvas overlay.
(function () {
  var hero = document.querySelector('.hero');
  if (!hero) return;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var dpr = Math.min(window.devicePixelRatio || 1, 2);
  var palette = ['#0e9aa7', '#f26b3a', '#f2b32c', '#5b8fc7', '#12325c', '#d93a2b', '#a84fd1', '#e64fa8'];

  /* ------------------------------------------------------------------ */
  /* Glyph drawings (each centred at 0,0 in a ~24px box)                 */
  /* ------------------------------------------------------------------ */
  function molecule(c, col) {
    c.strokeStyle = col; c.fillStyle = col; c.lineWidth = 1.6;
    var pts = [[-9, 4], [0, -8], [9, 4], [0, 2]];
    c.beginPath(); c.moveTo(pts[0][0], pts[0][1]); c.lineTo(pts[1][0], pts[1][1]); c.lineTo(pts[2][0], pts[2][1]); c.lineTo(pts[3][0], pts[3][1]); c.closePath(); c.stroke();
    pts.forEach(function (p, i) { c.beginPath(); c.arc(p[0], p[1], i === 3 ? 3.2 : 2.4, 0, Math.PI * 2); c.fill(); });
  }
  function dna(c, col) {
    c.strokeStyle = col; c.lineWidth = 1.6; c.lineCap = 'round';
    for (var s = 0; s < 2; s++) {
      c.beginPath();
      for (var y = -12; y <= 12; y += 1) {
        var x = Math.sin((y / 24) * Math.PI * 2 + s * Math.PI) * 6;
        if (y === -12) c.moveTo(x, y); else c.lineTo(x, y);
      }
      c.stroke();
    }
    c.lineWidth = 1.1;
    for (var yy = -10; yy <= 10; yy += 5) {
      var x1 = Math.sin((yy / 24) * Math.PI * 2) * 6, x2 = -x1;
      c.beginPath(); c.moveTo(x1, yy); c.lineTo(x2, yy); c.stroke();
    }
  }
  function brain(c, col) {
    c.strokeStyle = col; c.lineWidth = 1.6; c.lineJoin = 'round';
    c.beginPath();
    c.moveTo(-10, 2); c.bezierCurveTo(-13, -6, -6, -12, 0, -9); c.bezierCurveTo(6, -13, 13, -6, 10, 2);
    c.bezierCurveTo(12, 8, 4, 12, 1, 8); c.bezierCurveTo(-3, 12, -12, 8, -10, 2); c.closePath(); c.stroke();
    c.lineWidth = 1.1;
    c.beginPath(); c.moveTo(0, -9); c.lineTo(0, 8); c.stroke();
    c.beginPath(); c.moveTo(-8, -2); c.quadraticCurveTo(-4, 0, -6, 4); c.stroke();
    c.beginPath(); c.moveTo(8, -2); c.quadraticCurveTo(4, 0, 6, 4); c.stroke();
    c.beginPath(); c.moveTo(-5, -7); c.quadraticCurveTo(-2, -4, -3, -1); c.stroke();
    c.beginPath(); c.moveTo(5, -7); c.quadraticCurveTo(2, -4, 3, -1); c.stroke();
  }
  function mri(c, col) {
    c.strokeStyle = col; c.lineWidth = 1.6; c.fillStyle = col;
    c.beginPath(); c.ellipse(0, 0, 11, 13, 0, 0, Math.PI * 2); c.stroke();
    c.globalAlpha *= 0.5;
    c.beginPath(); c.ellipse(0, 1, 7, 9, 0, 0, Math.PI * 2); c.stroke();
    c.globalAlpha *= 2;
    c.beginPath(); c.ellipse(-3, -1, 1.6, 3.5, 0, 0, Math.PI * 2); c.fill();
    c.beginPath(); c.ellipse(3, -1, 1.6, 3.5, 0, 0, Math.PI * 2); c.fill();
  }
  function tube(c, col) {
    c.strokeStyle = col; c.fillStyle = col; c.lineWidth = 1.6; c.lineCap = 'round';
    c.beginPath(); c.moveTo(-4, -11); c.lineTo(-4, 7); c.arc(0, 7, 4, Math.PI, 0, true); c.lineTo(4, -11); c.stroke();
    c.beginPath(); c.moveTo(-6, -11); c.lineTo(6, -11); c.stroke();
    c.globalAlpha *= 0.55;
    c.beginPath(); c.moveTo(-4, 0); c.lineTo(4, 0); c.lineTo(4, 7); c.arc(0, 7, 4, 0, Math.PI, false); c.closePath(); c.fill();
  }
  function neuron(c, col) {
    c.strokeStyle = col; c.fillStyle = col; c.lineWidth = 1.5; c.lineCap = 'round';
    c.beginPath(); c.arc(-3, 0, 3.5, 0, Math.PI * 2); c.fill();
    var br = [[-6, -2, -12, -9], [-2, -3, -3, -12], [-6, 2, -12, 9], [-1, 3, 2, 10]];
    br.forEach(function (b) { c.beginPath(); c.moveTo(b[0], b[1]); c.lineTo(b[2], b[3]); c.stroke(); });
    c.beginPath(); c.moveTo(0, 0); c.lineTo(12, 0); c.stroke();
    c.beginPath(); c.moveTo(12, 0); c.lineTo(15, -3); c.moveTo(12, 0); c.lineTo(15, 3); c.stroke();
  }
  function heart(c, col) {
    c.strokeStyle = col; c.lineWidth = 1.6; c.lineJoin = 'round'; c.lineCap = 'round';
    c.beginPath(); c.moveTo(-13, 0); c.lineTo(-6, 0); c.lineTo(-4, -6); c.lineTo(-1, 8); c.lineTo(2, -9); c.lineTo(4, 3); c.lineTo(6, 0); c.lineTo(13, 0); c.stroke();
  }
  function knee(c, col) {
    c.strokeStyle = col; c.lineWidth = 1.8; c.lineCap = 'round';
    c.beginPath(); c.moveTo(-3, -12); c.lineTo(-3, -3); c.stroke();
    c.beginPath(); c.moveTo(1, 3); c.lineTo(1, 12); c.stroke();
    c.beginPath(); c.arc(-3, -2, 3, 0, Math.PI * 2); c.stroke();
    c.beginPath(); c.arc(1, 2, 3, 0, Math.PI * 2); c.stroke();
  }
  var glyphs = [molecule, dna, brain, mri, tube, neuron, heart, knee];

  /* ------------------------------------------------------------------ */
  /* 1. Ambient glyph field                                              */
  /* ------------------------------------------------------------------ */
  var canvas = hero.querySelector('.hero__canvas');
  var stage = hero.querySelector('.logo-stage');
  var net = hero.querySelector('.net');
  if (canvas && !reduce) {
    var ctx = canvas.getContext('2d');
    var W = 0, H = 0, field = [], mouse = { x: -1e4, y: -1e4, on: false };

    function seed() {
      var n = Math.max(6, Math.min(14, Math.round(W * H / 75000)));
      // keep glyphs out of the headline/text block and the logo, and spaced apart
      var hr = hero.getBoundingClientRect();
      var avoid = [];
      hero.querySelectorAll('.hero__grid > div:first-child, .logo-stage, .net').forEach(function (el) {
        var r = el.getBoundingClientRect();
        avoid.push([r.left - hr.left - 24, r.top - hr.top - 24, r.right - hr.left + 24, r.bottom - hr.top + 24]);
      });
      function ok(x, y) {
        for (var i = 0; i < avoid.length; i++) { var a = avoid[i]; if (x > a[0] && x < a[2] && y > a[1] && y < a[3]) return false; }
        for (var j = 0; j < field.length; j++) { var dx = field[j].hx - x, dy = field[j].hy - y; if (dx * dx + dy * dy < 110 * 110) return false; }
        return true;
      }
      field = [];
      for (var i = 0; i < n; i++) {
        var hx, hy, tries = 0;
        do { hx = 20 + Math.random() * (W - 40); hy = 20 + Math.random() * (H - 40); tries++; } while (!ok(hx, hy) && tries < 60);
        if (tries >= 60) continue;
        field.push({
          hx: hx, hy: hy, x: hx, y: hy, vx: 0, vy: 0,
          ph: Math.random() * Math.PI * 2, sp: 0.15 + Math.random() * 0.25,
          rot: Math.random() * Math.PI * 2, vr: (Math.random() - 0.5) * 0.004,
          s: 0.8 + Math.random() * 0.6, a: 0.28 + Math.random() * 0.22,
          col: palette[Math.floor(Math.random() * palette.length)],
          g: glyphs[Math.floor(Math.random() * glyphs.length)]
        });
      }
    }
    function resize() {
      var r = hero.getBoundingClientRect();
      var changed = Math.abs(r.width - W) > 40 || Math.abs(r.height - H) > 40;
      W = r.width; H = r.height;
      canvas.width = W * dpr; canvas.height = H * dpr;
      canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (changed || !field.length) seed();
    }
    resize();
    window.addEventListener('resize', resize);

    hero.addEventListener('pointermove', function (e) {
      var r = hero.getBoundingClientRect();
      mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top; mouse.on = true;
    });
    hero.addEventListener('pointerleave', function () { mouse.on = false; mouse.x = -1e4; mouse.y = -1e4; });

    var last = performance.now();
    function frame(now) {
      var dt = Math.min(40, now - last) / 16.7; last = now;
      ctx.clearRect(0, 0, W, H);
      var R = 280; // attraction radius
      for (var i = 0; i < field.length; i++) {
        var p = field[i];
        p.ph += 0.004 * dt;
        // slow wander around the home position
        var tx = p.hx + Math.cos(p.ph * 1.3) * 22, ty = p.hy + Math.sin(p.ph) * 16;
        var ax = (tx - p.x) * 0.0025, ay = (ty - p.y) * 0.0025;
        var near = 0;
        if (mouse.on) {
          var dx = mouse.x - p.x, dy = mouse.y - p.y, d = Math.sqrt(dx * dx + dy * dy);
          if (d < R && d > 1) {
            near = 1 - d / R;
            var pull = 0.13 * near * near;   // gentle, eases in
            ax += dx / d * pull; ay += dy / d * pull;
          }
        }
        p.vx = (p.vx + ax * dt) * 0.94; p.vy = (p.vy + ay * dt) * 0.94;
        p.x += p.vx * dt; p.y += p.vy * dt; p.rot += p.vr * dt;
        ctx.save();
        ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.scale(p.s, p.s);
        ctx.globalAlpha = p.a + near * 0.45;
        p.g(ctx, p.col);
        ctx.restore();
      }
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  /* ------------------------------------------------------------------ */
  /* 3. Cover network: colour pulses flowing node to node                */
  /* ------------------------------------------------------------------ */
  var nodesData = window.A2CPS_NODES;
  var netCanvas = net && net.querySelector('canvas');
  var netImg = net && net.querySelector('img');
  if (net && netCanvas && netImg && nodesData && nodesData.length) {
    var nctx = netCanvas.getContext('2d');
    var NW = 0, NH = 0;
    var nodes = nodesData.map(function (d) { return { fx: d[0], fy: d[1], fr: d[2], h: d[3], s: d[4], v: d[5], x: 0, y: 0, r: 0, t0: Infinity, hue: 0, parent: -1, nb: [] }; });

    // neighbour graph, anisotropic: distances across the width count ~2.5x,
    // so links (and therefore the flow) run mostly down the length of the graphic
    var ASPECT = 914 / 805, XW = 2.5;
    (function buildGraph() {
      var reach = 0.2, K = 4;
      for (var i = 0; i < nodes.length; i++) {
        var a = nodes[i], cand = [];
        for (var j = 0; j < nodes.length; j++) {
          if (i === j) continue;
          var b = nodes[j], dx = (a.fx - b.fx) * XW, dy = (a.fy - b.fy) * ASPECT, d = Math.sqrt(dx * dx + dy * dy);
          if (d < reach) cand.push([d, j]);
        }
        cand.sort(function (p, q) { return p[0] - q[0]; });
        a.nb = cand.slice(0, K).map(function (c) { return c[1]; });
      }
      nodes.forEach(function (a, i) { a.nb.forEach(function (j) { if (nodes[j].nb.indexOf(i) < 0) nodes[j].nb.push(i); }); });
    })();
    // hop delay: quick along the length, slow across the width
    function hopCost(i, j) {
      var dx = Math.abs(nodes[i].fx - nodes[j].fx), dy = Math.abs(nodes[i].fy - nodes[j].fy) * ASPECT;
      var across = dx / (dx + dy + 1e-6);
      return 70 + 160 * across;
    }

    function nresize() {
      var r = netImg.getBoundingClientRect();
      NW = r.width; NH = r.height;
      netCanvas.width = NW * dpr; netCanvas.height = NH * dpr;
      netCanvas.style.width = NW + 'px'; netCanvas.style.height = NH + 'px';
      nctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      nodes.forEach(function (n) { n.x = n.fx * NW; n.y = n.fy * NH; n.r = n.fr * NW; });
    }
    if (netImg.complete) nresize(); else netImg.addEventListener('load', nresize);
    window.addEventListener('resize', nresize);

    var nraf = null, lastPulse = 0, lastSrc = -1;
    var bg = (function () {
      var m = /rgba?\((\d+),\s*(\d+),\s*(\d+)/.exec(getComputedStyle(document.body).backgroundColor || '');
      return m ? m[1] + ',' + m[2] + ',' + m[3] : '243,245,248';
    })();
    function pulse(src, now, hueShift) {
      // Dijkstra over hop delays: nodes further down the network light up later
      var MAXT = 1100, dist = {}, prev = {}, done = {}, open = [src];
      dist[src] = 0;
      while (open.length) {
        var bi = 0;
        for (var k = 1; k < open.length; k++) if (dist[open[k]] < dist[open[bi]]) bi = k;
        var i = open.splice(bi, 1)[0];
        if (done[i]) continue;
        done[i] = true;
        var n = nodes[i], t = now + dist[i];
        if (t < n.t0 || now - n.t0 > 1400) { n.t0 = t; n.hue = (n.h + hueShift + dist[i] / 12) % 360; n.parent = prev[i] === undefined ? -1 : prev[i]; }
        n.nb.forEach(function (j) {
          var nd = dist[i] + hopCost(i, j);
          if (nd > MAXT) return;
          if (dist[j] === undefined || nd < dist[j]) { dist[j] = nd; prev[j] = i; open.push(j); }
        });
      }
      if (!nraf) nraf = requestAnimationFrame(nframe);
    }
    function nframe(now) {
      nctx.clearRect(0, 0, NW, NH);
      var alive = false;
      for (var i = 0; i < nodes.length; i++) {
        var n = nodes[i], age = now - n.t0;
        if (age < 0) { alive = true; continue; }
        var k = Math.exp(-age / 1100) * (1 - Math.exp(-age / 90));
        if (k < 0.02) continue;
        alive = true;
        var col = 'hsla(' + n.hue + ', 85%, 58%, ';
        // link to the node the pulse came from
        if (n.parent >= 0) {
          var p = nodes[n.parent];
          nctx.strokeStyle = col + (k * 0.55).toFixed(3) + ')'; nctx.lineWidth = 1.4;
          nctx.beginPath(); nctx.moveTo(p.x, p.y); nctx.lineTo(n.x, n.y); nctx.stroke();
        }
        // soft halo then the recoloured node
        nctx.fillStyle = col + (k * 0.18).toFixed(3) + ')';
        nctx.beginPath(); nctx.arc(n.x, n.y, n.r * (1.6 + k * 0.6), 0, Math.PI * 2); nctx.fill();
        nctx.fillStyle = 'rgba(' + bg + ',' + (k * 0.9).toFixed(3) + ')';
        nctx.beginPath(); nctx.arc(n.x, n.y, n.r * (1 + k * 0.25), 0, Math.PI * 2); nctx.fill();
        nctx.fillStyle = col + (k * 0.9).toFixed(3) + ')';
        nctx.beginPath(); nctx.arc(n.x, n.y, n.r * (1 + k * 0.25), 0, Math.PI * 2); nctx.fill();
      }
      nraf = alive ? requestAnimationFrame(nframe) : null;
    }
    function nearest(x, y) {
      var best = -1, bd = Infinity;
      for (var i = 0; i < nodes.length; i++) {
        var dx = nodes[i].x - x, dy = nodes[i].y - y, d = dx * dx + dy * dy;
        if (d < bd) { bd = d; best = i; }
      }
      return Math.sqrt(bd) < Math.max(28, NW * 0.06) ? best : -1;
    }
    net.addEventListener('pointermove', function (e) {
      if (reduce) return;
      var r = netImg.getBoundingClientRect();
      var i = nearest(e.clientX - r.left, e.clientY - r.top), now = performance.now();
      if (i >= 0 && (i !== lastSrc || now - lastPulse > 700)) {
        lastSrc = i; lastPulse = now;
        pulse(i, now, 60 + Math.random() * 160);
      }
    });
    net.addEventListener('click', function (e) {
      var r = netImg.getBoundingClientRect();
      var i = nearest(e.clientX - r.left, e.clientY - r.top);
      if (i >= 0) pulse(i, performance.now(), 60 + Math.random() * 160);
    });
    // an occasional idle pulse so the network breathes before anyone touches it
    if (!reduce) {
      setInterval(function () {
        if (document.hidden || performance.now() - lastPulse < 6000) return;
        pulse(Math.floor(Math.random() * nodes.length), performance.now(), 60 + Math.random() * 160);
      }, 5000);
    }
  }
})();
