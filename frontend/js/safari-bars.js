/* Safari on iPad (iPadOS 26 and later) draws its tab row over the top of the page without telling the page, so a
   header at the top of the screen can end up behind it. On those iPads only:
   - --bar-room (64px) is added once at the very top of the page, so whatever starts the page (the header, a top
     bar) begins below the tab row. It never changes, so nothing on the page jumps.
   - --bar-gap is how far below the top of the screen a pinned header (and anything pinned under it, menus and
     pop-ups) has to sit right now: 64px while Safari's tab row is showing, 0 once Safari folds its bars away
     while scrolling, so the header is never covered and never taller than it should be.
   Phones, computers, other iPad browsers and the home-screen app are left alone: both stay unset, which every
   stylesheet reads as 0. Loaded in <head> so the room is there before the page first draws. */
(function () {
  var ROOM = 64;
  try {
    var ua = navigator.userAgent || '';
    var ipad = /iPad/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
    var version = /Version\/(\d+)/.exec(ua);
    var otherBrowser = /CriOS|FxiOS|EdgiOS|OPiOS|GSA\//.test(ua);
    var homeScreen = navigator.standalone === true ||
      (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches);
    if (!ipad || otherBrowser || homeScreen || !version || Number(version[1]) < 26) return;

    var root = document.documentElement;
    root.classList.add('safari-bars');
    root.style.setProperty('--bar-room', ROOM + 'px');
    var css = document.createElement('style');
    css.textContent = 'html.safari-bars{padding-top:var(--bar-room)}';
    (document.head || root).appendChild(css);

    var open = null;
    var setOpen = function (isOpen) {
      if (isOpen === open) return;
      open = isOpen;
      root.style.setProperty('--bar-gap', isOpen ? ROOM + 'px' : '0px');
      root.classList.toggle('safari-bars-folded', !isOpen);
    };
    setOpen(true);

    // Safari folds its bars away as you scroll down and brings them back as you scroll up; the page area
    // (innerHeight) grows and shrinks with them. Compare against the height with the bars out.
    var width = window.innerWidth;
    var base = window.innerHeight;
    var lastScroll = 0;
    var busy = function () {
      var el = document.activeElement;
      var zoomed = window.visualViewport && Math.abs(window.visualViewport.scale - 1) > 0.01;
      return zoomed || (el && (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName)));
    };
    var check = function () {
      if (busy()) return;
      var h = window.innerHeight;
      var w = window.innerWidth;
      if (w !== width || Date.now() - lastScroll > 1000) {
        // A new window size, not Safari's bars: they're out, measure from here.
        width = w;
        base = h;
        setOpen(true);
        return;
      }
      if (h < base) base = h;
      setOpen(h <= base + 20);
    };
    window.addEventListener('resize', check);
    if (window.visualViewport) window.visualViewport.addEventListener('resize', check);
    window.addEventListener('scroll', function () {
      lastScroll = Date.now();
      if (window.scrollY <= 0) setOpen(true);
      else check();
    }, { passive: true });
  } catch (e) {
    /* Never stop the page from loading. */
  }
})();
