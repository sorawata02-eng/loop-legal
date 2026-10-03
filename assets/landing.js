/* Loop — landing page behaviour. Everything here is optional: without it the page
 * reads the same, the hero shows its still frame and every section is visible. */
(function () {
  'use strict';
  var root = document.documentElement;
  root.classList.add('js');

  var reduceMotion = false;
  try { reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { /* old browser */ }

  /* ---- The hero video -------------------------------------------------------
   * HEVC with an alpha channel keeps only the phone visible. WebKit (Safari, and
   * every browser on iPhone, in-app browsers included) plays it with its alpha;
   * desktop Chrome can decode HEVC but drops the alpha and would show a black box,
   * so it keeps the poster. */
  var demo = document.getElementById('demo');
  if (demo && !reduceMotion) {
    var ua = navigator.userAgent || '';
    var isIOS = /iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
    var isDesktopSafari = /Macintosh/.test(ua) && /Version\/\d+.*Safari/.test(ua) && !/Chrome|Chromium|Edg|OPR|Firefox/.test(ua);
    if ((isIOS || isDesktopSafari) && demo.canPlayType('video/mp4; codecs="hvc1"')) {
      var source = document.createElement('source');
      source.src = 'assets/demo.mov';
      source.type = 'video/mp4; codecs="hvc1"';
      demo.appendChild(source);
      demo.preload = 'auto';
      demo.load();
      var play = function () {
        var p = demo.play();
        if (p && typeof p.catch === 'function') p.catch(function () { /* Low Power Mode: the poster stays */ });
      };
      play();
      // Pause off screen, resume on screen (saves battery on long scrolls).
      if ('IntersectionObserver' in window) {
        new IntersectionObserver(function (entries) {
          entries.forEach(function (entry) { if (entry.isIntersecting) play(); else demo.pause(); });
        }, { threshold: 0.15 }).observe(demo);
      }
    }
  }

  /* ---- Sections come in as they scroll into view ---------------------------- */
  var reveals = Array.prototype.slice.call(document.querySelectorAll('.reveal'));
  if (reveals.length) {
    if (reduceMotion || !('IntersectionObserver' in window)) {
      reveals.forEach(function (el) { el.classList.add('in'); });
    } else {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) { entry.target.classList.add('in'); io.unobserve(entry.target); }
        });
      }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
      reveals.forEach(function (el) { io.observe(el); });
    }
  }

  /* ---- The subtitle ribbon: the word being said lights up, like in the app --- */
  var karaoke = document.getElementById('karaoke');
  if (karaoke) {
    var words = karaoke.querySelectorAll('span');
    // Roughly the rhythm of the line as it's said.
    var beats = [380, 260, 230, 300, 620, 300, 280, 260, 900];
    var i = -1, timer = null, visible = false;
    var step = function () {
      if (i >= 0) words[i].classList.remove('on');
      i = (i + 1) % (words.length + 1);
      if (i === words.length) { i = -1; timer = setTimeout(step, 700); return; }
      words[i].classList.add('on');
      timer = setTimeout(step, beats[i] || 300);
    };
    if (reduceMotion) {
      words[words.length - 1].classList.add('on');
    } else if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting && !visible) { visible = true; step(); }
          else if (!entry.isIntersecting && visible) { visible = false; clearTimeout(timer); }
        });
      }).observe(karaoke);
    } else {
      step();
    }
  }
})();
