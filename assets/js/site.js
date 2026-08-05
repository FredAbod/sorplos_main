/* Sorplos — header interactions.
   Two behaviours only: the Ventures dropdown and the mobile menu.
   The design opens the dropdown on hover; pointer devices get that,
   and everyone gets click/keyboard on the same control. */

(function () {
  'use strict';

  var menu = document.querySelector('[data-nav-menu]');
  var trigger = menu && menu.querySelector('[data-nav-trigger]');

  if (menu && trigger) {
    var hoverCapable = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

    var setOpen = function (open) {
      menu.classList.toggle('is-open', open);
      trigger.setAttribute('aria-expanded', String(open));
    };

    // Track how the panel was opened, so a click on a trigger the pointer is
    // already hovering does not immediately toggle it shut again.
    var openedByHover = false;

    trigger.addEventListener('click', function () {
      if (openedByHover && menu.classList.contains('is-open')) {
        openedByHover = false;
        return;
      }
      setOpen(!menu.classList.contains('is-open'));
    });

    if (hoverCapable) {
      menu.addEventListener('mouseenter', function () {
        openedByHover = !menu.classList.contains('is-open');
        setOpen(true);
      });
      menu.addEventListener('mouseleave', function () {
        openedByHover = false;
        setOpen(false);
      });
    }

    // Tabbing out of the dropdown closes it.
    menu.addEventListener('focusout', function (event) {
      if (!menu.contains(event.relatedTarget)) setOpen(false);
    });

    document.addEventListener('click', function (event) {
      if (!menu.contains(event.target)) setOpen(false);
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && menu.classList.contains('is-open')) {
        setOpen(false);
        trigger.focus();
      }
    });
  }

  /* ---- Scroll reveals ----------------------------------------------------
     Elements are marked hidden from JS rather than in the markup, so a failed
     or disabled script leaves the page fully readable instead of blank. */

  var REVEAL_SELECTORS = [
    '.rule',
    '.statement-block',
    '.section__head',
    '.section > .section__title',
    '.ventures > *',
    '.split__aside',
    '.trait',
    '.principles > .principle',
    '.partners',
    '.careers > *',
    '.footer__col',
    '.footer__legal',
    '.venture-hero__meta',
    '.venture-hero__title',
    '.venture-hero__lede',
    '.venture-hero__inner > .hero__actions',
    '.capabilities > .capability',
    '.channels > *',
    '.cta-band__inner',
    '.cross-links > *'
  ];

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!reduceMotion && 'IntersectionObserver' in window) {
    var targets = [];

    REVEAL_SELECTORS.forEach(function (selector) {
      Array.prototype.forEach.call(document.querySelectorAll(selector), function (el) {
        if (targets.indexOf(el) === -1) targets.push(el);
      });
    });

    // Stagger siblings so a row of cards arrives in sequence, not as a slab.
    var seenPerParent = new Map();

    targets.forEach(function (el) {
      var index = seenPerParent.get(el.parentElement) || 0;
      seenPerParent.set(el.parentElement, index + 1);
      el.style.setProperty('--reveal-delay', Math.min(index, 6) * 70 + 'ms');
      el.setAttribute('data-reveal', '');
    });

    // Dividers keep their own observer: they are never unobserved, so the
    // light sweep replays every time one comes back into view.
    var rules = targets.filter(function (el) { return el.classList.contains('rule'); });
    var others = targets.filter(function (el) { return !el.classList.contains('rule'); });

    var reveal = function (el) {
      if (el.classList.contains('is-in')) return;
      el.classList.add('is-in');
      observer.unobserve(el);
    };

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) reveal(entry.target);
      });
    }, { rootMargin: '0px 0px -48px 0px', threshold: 0 });

    others.forEach(function (el) { observer.observe(el); });

    var lastY = window.scrollY;
    var direction = 'down';

    window.addEventListener('scroll', function () {
      var y = window.scrollY;
      if (y === lastY) return;
      direction = y > lastY ? 'down' : 'up';
      lastY = y;
    }, { passive: true });

    var playSweep = function (el) {
      el.classList.remove('sweep-ltr', 'sweep-rtl');
      void el.offsetWidth; // reflow, so re-adding the class restarts the animation
      el.classList.add(direction === 'up' ? 'sweep-rtl' : 'sweep-ltr');
    };

    var ruleObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in'); // stays visible once shown
          playSweep(entry.target);
        } else {
          // Clear it so the next entry can start a fresh sweep.
          entry.target.classList.remove('sweep-ltr', 'sweep-rtl');
        }
      });
    }, { rootMargin: '0px 0px -48px 0px', threshold: 0 });

    rules.forEach(function (el) { ruleObserver.observe(el); });

    // The bottom margin creates a dead zone the last elements on the page can
    // never leave, so flush anything still hidden once we reach the end.
    var flush = function () {
      if (window.innerHeight + window.scrollY < document.documentElement.scrollHeight - 4) return;
      targets.forEach(reveal);
      window.removeEventListener('scroll', flush);
    };

    window.addEventListener('scroll', flush, { passive: true });
    window.addEventListener('resize', flush, { passive: true });
    flush();
  }

  var toggle = document.querySelector('[data-menu-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (toggle && mobileNav) {
    var setMobileOpen = function (open) {
      mobileNav.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    };

    toggle.addEventListener('click', function () {
      setMobileOpen(!mobileNav.classList.contains('is-open'));
    });

    // Following a link inside the panel should not leave it hanging open.
    mobileNav.addEventListener('click', function (event) {
      if (event.target.closest('a')) setMobileOpen(false);
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && mobileNav.classList.contains('is-open')) {
        setMobileOpen(false);
        toggle.focus();
      }
    });

    // The panel is a mobile affordance; drop it if the viewport grows past the breakpoint.
    window.matchMedia('(min-width: 721px)').addEventListener('change', function (event) {
      if (event.matches) setMobileOpen(false);
    });
  }
})();
