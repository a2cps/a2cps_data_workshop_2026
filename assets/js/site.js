// Shared behaviour: nav toggle, scroll reveal, animated bars.
(function () {
  var toggle = document.querySelector('.nav__toggle');
  var links = document.querySelector('.nav__links');
  if (toggle && links) {
    toggle.addEventListener('click', function () {
      var open = links.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var io = ('IntersectionObserver' in window) ? new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      e.target.classList.add('in');
      e.target.querySelectorAll('.bar .fill').forEach(function (f) {
        f.style.width = f.getAttribute('data-w') + '%';
      });
      io.unobserve(e.target);
    });
  }, { threshold: 0.05, rootMargin: "0px 0px -5% 0px" }) : null;

  document.querySelectorAll('.reveal, .bars').forEach(function (el) {
    if (io && !reduce) io.observe(el);
    else {
      el.classList.add('in');
      el.querySelectorAll('.bar .fill').forEach(function (f) { f.style.width = f.getAttribute('data-w') + '%'; });
    }
  });
})();
