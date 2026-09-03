// Interactive hero: the A2CPS mark shifts hue and tilts with the cursor, and the
// cursor leaves a trail of small science glyphs (molecules, brains, DNA, MRI
// slices, test tubes, neurons) that drift and fade on a canvas behind the logo.
(function () {
  var hero = document.querySelector('.hero');
  var stage = document.querySelector('.logo-stage');
  var img = document.querySelector('.logo-stage__img');
  var canvas = document.querySelector('.hero__canvas');
  if (!hero || !stage || !img || !canvas) return;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var ctx = canvas.getContext('2d');
  var dpr = Math.min(window.devicePixelRatio || 1, 2);
  var W = 0, H = 0;

  function resize() {
    var r = hero.getBoundingClientRect();
    W = r.width; H = r.height;
    canvas.width = W * dpr; canvas.height = H * dpr;
    canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize();
  window.addEventListener('resize', resize);

  var palette = ['#0e9aa7', '#f26b3a', '#f2b32c', '#5b8fc7', '#12325c', '#d93a2b'];
  var particles = [];
  var MAX = 140;

  // ---- glyph drawings (each drawn centred at 0,0 in a ~24px box) ----
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
    // stylised joint: two bones meeting
    c.strokeStyle = col; c.lineWidth = 1.8; c.lineCap = 'round';
    c.beginPath(); c.moveTo(-3, -12); c.lineTo(-3, -3); c.stroke();
    c.beginPath(); c.moveTo(1, 3); c.lineTo(1, 12); c.stroke();
    c.beginPath(); c.arc(-3, -2, 3, 0, Math.PI * 2); c.stroke();
    c.beginPath(); c.arc(1, 2, 3, 0, Math.PI * 2); c.stroke();
  }
  var glyphs = [molecule, dna, brain, mri, tube, neuron, heart, knee, molecule, brain, dna];

  function spawn(x, y, burst) {
    var n = burst ? 10 : 1 + Math.floor(Math.random() * 2);
    for (var i = 0; i < n; i++) {
      if (particles.length >= MAX) particles.shift();
      var a = Math.random() * Math.PI * 2;
      var sp = burst ? 1.4 + Math.random() * 2.2 : 0.3 + Math.random() * 0.9;
      particles.push({
        x: x + (Math.random() - 0.5) * 10, y: y + (Math.random() - 0.5) * 10,
        vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - (burst ? 0.4 : 0.7),
        rot: Math.random() * Math.PI * 2, vr: (Math.random() - 0.5) * 0.06,
        s: 0.75 + Math.random() * 0.8, life: 1, decay: 0.006 + Math.random() * 0.008,
        col: palette[Math.floor(Math.random() * palette.length)],
        g: glyphs[Math.floor(Math.random() * glyphs.length)]
      });
    }
  }

  var raf = null;
  function frame() {
    ctx.clearRect(0, 0, W, H);
    for (var i = particles.length - 1; i >= 0; i--) {
      var p = particles[i];
      p.x += p.vx; p.y += p.vy; p.vy -= 0.008; p.vx *= 0.995; p.rot += p.vr; p.life -= p.decay;
      if (p.life <= 0) { particles.splice(i, 1); continue; }
      ctx.save();
      ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.scale(p.s, p.s);
      ctx.globalAlpha = Math.min(1, p.life * 1.4);
      p.g(ctx, p.col);
      ctx.restore();
    }
    if (particles.length) raf = requestAnimationFrame(frame); else raf = null;
  }
  function kick() { if (!raf) raf = requestAnimationFrame(frame); }

  // ---- pointer handling: hue shift + tilt + trail ----
  var lastSpawn = 0;
  function pointer(e) {
    var hr = hero.getBoundingClientRect();
    var x = e.clientX - hr.left, y = e.clientY - hr.top;
    var sr = stage.getBoundingClientRect();
    var nx = (e.clientX - sr.left) / sr.width - 0.5;   // -0.5..0.5
    var ny = (e.clientY - sr.top) / sr.height - 0.5;
    var hue = Math.round(((nx + 0.5) * 300 + (ny + 0.5) * 60)) % 360;
    var sat = 1.15 + Math.abs(ny) * 0.4;
    img.style.filter = 'hue-rotate(' + hue + 'deg) saturate(' + sat.toFixed(2) + ') drop-shadow(0 18px 30px rgba(15,27,45,.22))';
    img.style.transform = 'rotateY(' + (nx * 22).toFixed(1) + 'deg) rotateX(' + (-ny * 16).toFixed(1) + 'deg) scale(1.03)';
    var ring = stage.querySelector('.logo-stage__ring');
    if (ring) ring.style.transform = 'translate(' + (nx * 30).toFixed(1) + 'px,' + (ny * 30).toFixed(1) + 'px)';
    stage.classList.add('active');
    if (reduce) return;
    var now = performance.now();
    if (now - lastSpawn > 34) { lastSpawn = now; spawn(x, y, false); kick(); }
  }
  function leave() {
    img.style.filter = ''; img.style.transform = '';
    var ring = stage.querySelector('.logo-stage__ring'); if (ring) ring.style.transform = '';
    stage.classList.remove('active');
  }
  stage.addEventListener('pointermove', pointer);
  stage.addEventListener('pointerleave', leave);
  stage.addEventListener('click', function (e) {
    if (reduce) return;
    var hr = hero.getBoundingClientRect();
    spawn(e.clientX - hr.left, e.clientY - hr.top, true); kick();
  });
  // Trail also across the wider hero text area, so the whole banner feels alive.
  hero.addEventListener('pointermove', function (e) {
    if (reduce || stage.contains(e.target)) return;
    var now = performance.now();
    if (now - lastSpawn > 90) {
      var hr = hero.getBoundingClientRect();
      lastSpawn = now; spawn(e.clientX - hr.left, e.clientY - hr.top, false); kick();
    }
  });

  // Idle: an occasional gentle drift of glyphs from behind the logo, so the hero
  // isn't static before the visitor moves the mouse.
  if (!reduce) {
    setInterval(function () {
      if (document.hidden) return;
      var sr = stage.getBoundingClientRect(), hr = hero.getBoundingClientRect();
      spawn(sr.left - hr.left + sr.width * (0.2 + Math.random() * 0.6), sr.top - hr.top + sr.height * (0.3 + Math.random() * 0.5), false);
      kick();
    }, 900);
  }
})();
