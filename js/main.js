/* =============================================================
   Ultra Foam LLC — main.js
   Phase 2: navbar, hero, CTAs, WhatsApp links, order modal.
   Vanilla JS only.
   ============================================================= */

(function () {
  'use strict';

  /* -----------------------------------------------------------
     CONFIG
     ----------------------------------------------------------- */
  // WhatsApp number — international format, digits only, no "+".
  var WHATSAPP_NUMBER = '13472562800';

  // CHANGE: default pre-filled WhatsApp message
  var WHATSAPP_MESSAGE =
    "Hi Ultra Foam! I'd like to order cleaning products (5-gallon buckets). Can you share pricing and availability?";

  function buildWhatsAppLink(message) {
    var text = message || WHATSAPP_MESSAGE;
    return 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(text);
  }

  /* -----------------------------------------------------------
     NAVBAR — scroll style + hamburger menu
     ----------------------------------------------------------- */
  function initNavbar() {
    var navbar = document.getElementById('navbar');
    var toggle = document.getElementById('navToggle');
    var menu = document.getElementById('navMenu');
    var backdrop = document.getElementById('navBackdrop');

    if (navbar) {
      var onScroll = function () {
        navbar.classList.toggle('is-scrolled', window.scrollY > 12);
      };
      onScroll();
      window.addEventListener('scroll', onScroll, { passive: true });
    }

    if (!toggle || !menu) return;

    function openMenu() {
      toggle.classList.add('is-open');
      menu.classList.add('is-open');
      toggle.setAttribute('aria-expanded', 'true');
      toggle.setAttribute('aria-label', 'Close menu');
      if (backdrop) {
        backdrop.hidden = false;
        requestAnimationFrame(function () { backdrop.classList.add('is-visible'); });
      }
      document.body.classList.add('no-scroll');
    }

    function closeMenu() {
      toggle.classList.remove('is-open');
      menu.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Open menu');
      if (backdrop) {
        backdrop.classList.remove('is-visible');
        setTimeout(function () { backdrop.hidden = true; }, 300);
      }
      document.body.classList.remove('no-scroll');
    }

    toggle.addEventListener('click', function () {
      if (menu.classList.contains('is-open')) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    if (backdrop) backdrop.addEventListener('click', closeMenu);

    // Close menu when a nav link is tapped
    menu.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', closeMenu);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menu.classList.contains('is-open')) closeMenu();
    });
  }

  /* -----------------------------------------------------------
     SMOOTH SCROLL for in-page anchors
     ----------------------------------------------------------- */
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(function (link) {
      link.addEventListener('click', function (e) {
        var id = link.getAttribute('href');
        if (!id || id === '#') return;
        var target = document.querySelector(id);
        if (!target) return;
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
  }

  /* -----------------------------------------------------------
     WHATSAPP links
     ----------------------------------------------------------- */
  function initWhatsApp() {
    document.querySelectorAll('[data-whatsapp]').forEach(function (el) {
      // A product card passes data-product to pre-fill a product-specific message.
      var product = el.getAttribute('data-product');
      var message = product
        ? "Hi Ultra Foam! I'd like to order: " + product + ". Is it available and what's the price?"
        : WHATSAPP_MESSAGE;
      el.setAttribute('href', buildWhatsAppLink(message));
      el.setAttribute('target', '_blank');
      el.setAttribute('rel', 'noopener noreferrer');
    });
  }

  /* -----------------------------------------------------------
     ORDER / QUOTE MODAL
     ----------------------------------------------------------- */
  function initModal() {
    var modal = document.getElementById('orderModal');
    if (!modal) return;
    var lastFocused = null;

    function openModal(presetBundle) {
      lastFocused = document.activeElement;
      // A bundle card passes its label (e.g. "3 Buckets") to pre-select the radio.
      if (presetBundle) {
        var radio = modal.querySelector('input[name="bundle"][value="' + presetBundle + '"]');
        if (radio) radio.checked = true;
      }
      modal.hidden = false;
      document.body.classList.add('no-scroll');
      var firstInput = modal.querySelector('input, textarea, button');
      if (firstInput) firstInput.focus();
    }

    function closeModal() {
      modal.hidden = true;
      document.body.classList.remove('no-scroll');
      if (lastFocused && typeof lastFocused.focus === 'function') lastFocused.focus();
    }

    document.querySelectorAll('[data-open-modal]').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        openModal(btn.getAttribute('data-bundle'));
      });
    });

    modal.querySelectorAll('[data-close-modal]').forEach(function (btn) {
      btn.addEventListener('click', closeModal);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !modal.hidden) closeModal();
    });

    initForm(modal);
  }

  /* -----------------------------------------------------------
     ORDER FORM — loading state + submit handling
     ----------------------------------------------------------- */
  function initForm(modal) {
    var form = document.getElementById('orderForm');
    var submitBtn = document.getElementById('formSubmit');
    if (!form || !submitBtn) return;

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      var data = {
        name: form.name.value.trim(),
        email: form.email.value.trim(),
        phone: form.phone.value.trim(),
        bundle: (form.querySelector('input[name="bundle"]:checked') || {}).value || '',
        notes: form.notes.value.trim()
      };

      // Loading state
      submitBtn.classList.add('is-loading');
      var labelEl = submitBtn.querySelector('.form-submit-label');
      if (labelEl) labelEl.textContent = 'Sending...';

      // Phase 2: log + redirect. CRM wiring comes in a later phase.
      console.log('Order lead submitted:', data);

      /* CHANGE: enable in a later phase to send the lead to the API.
      fetch('/api/submit-lead.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
        .then(function () { window.location.href = 'gracias.html'; })
        .catch(function () { window.location.href = 'gracias.html'; });
      */

      // Temporary: simulate async then redirect to thank-you page.
      setTimeout(function () {
        window.location.href = 'gracias.html';
      }, 800);
    });
  }

  /* -----------------------------------------------------------
     CATALOG FILTER — sidebar / chip row
     Cards are re-queried on every filter call so dynamically
     loaded products from Supabase are always included.
     ----------------------------------------------------------- */
  function initCatalogFilter() {
    var filterBtns = document.querySelectorAll('.cat-btn[data-filter]');

    if (!filterBtns.length) return;

    var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var currentFilter = 'all';

    function setFilter(filter) {
      currentFilter = filter;

      // Live query — works with hardcoded AND dynamically rendered cards.
      var cards    = document.querySelectorAll('.product-card[data-category]');
      var sections = document.querySelectorAll('.catalog-products .product-category');

      filterBtns.forEach(function (btn) {
        var active = btn.getAttribute('data-filter') === filter;
        btn.classList.toggle('is-active', active);
        btn.setAttribute('aria-pressed', active ? 'true' : 'false');
      });

      cards.forEach(function (card) {
        var match = filter === 'all' || card.getAttribute('data-category') === filter;
        if (match) {
          card.style.display = '';
          if (!reducedMotion) {
            card.classList.remove('is-filtering');
            void card.offsetWidth;
            card.classList.add('is-filtering');
          }
        } else {
          card.style.display = 'none';
          card.classList.remove('is-filtering');
        }
      });

      sections.forEach(function (section) {
        var sectionCards = section.querySelectorAll('.product-card[data-category]');
        var hasVisible = false;
        sectionCards.forEach(function (c) {
          if (filter === 'all' || c.getAttribute('data-category') === filter) hasVisible = true;
        });
        section.style.display = hasVisible ? '' : 'none';
      });
    }

    filterBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        setFilter(btn.getAttribute('data-filter'));
      });
    });

    setFilter('all');

    // Expose so products.js can re-apply the active filter after dynamic render.
    window._UF_applyFilter = function () { setFilter(currentFilter); };
  }

  /* -----------------------------------------------------------
     SCROLL PROGRESS BAR
     ----------------------------------------------------------- */
  function initScrollProgress() {
    var bar = document.getElementById('scrollBar');
    if (!bar) return;
    var ticking = false;

    function update() {
      var doc = document.documentElement;
      var max = doc.scrollHeight - doc.clientHeight;
      var pct = max > 0 ? (doc.scrollTop / max) * 100 : 0;
      bar.style.width = pct + '%';
      ticking = false;
    }

    function onScroll() {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    }

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
  }

  /* -----------------------------------------------------------
     SCROLL REVEAL — fade + slide up via IntersectionObserver.
     Skipped entirely when the user prefers reduced motion, so
     all content stays visible with no animation.
     ----------------------------------------------------------- */
  function initReveal() {
    if (!('IntersectionObserver' in window) ||
        window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    var targets = Array.prototype.slice.call(
      document.querySelectorAll('.section-head, .product-card, .price-card, .why-item, [data-reveal]')
    );
    if (!targets.length) return;

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    targets.forEach(function (el) {
      el.classList.add('reveal');

      // Subtle stagger among same-type cards inside a grid.
      var staggerClass = el.classList.contains('product-card') ? 'product-card'
        : el.classList.contains('price-card') ? 'price-card'
        : el.classList.contains('why-item') ? 'why-item' : null;

      if (staggerClass && el.parentNode) {
        var sibs = Array.prototype.filter.call(el.parentNode.children, function (c) {
          return c.classList && c.classList.contains(staggerClass);
        });
        var idx = sibs.indexOf(el);
        if (idx > 0) el.style.transitionDelay = Math.min(idx, 6) * 60 + 'ms';
      }

      observer.observe(el);
    });
  }

  /* -----------------------------------------------------------
     BOOTSTRAP
     ----------------------------------------------------------- */
  function init() {
    document.documentElement.classList.add('js-ready');
    initNavbar();
    initSmoothScroll();
    initWhatsApp();
    initModal();
    initCatalogFilter();
    initScrollProgress();
    initReveal();

    // Hook called by js/products.js after Supabase cards are injected.
    // Re-wires WhatsApp hrefs on new <a data-whatsapp> elements and
    // re-applies the currently active category filter.
    window._UF_reinit = function () {
      initWhatsApp();
      if (typeof window._UF_applyFilter === 'function') window._UF_applyFilter();
    };
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
