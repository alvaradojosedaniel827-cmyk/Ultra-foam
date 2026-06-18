/* =============================================================
   Ultra Foam LLC — main.js
   Phase 1: bootstrap only.
   Interactive behavior (nav, scroll reveals, form handling,
   WhatsApp links) will be added in later phases.
   ============================================================= */

(function () {
  'use strict';

  function init() {
    // Placeholder — feature modules wired up in later phases.
    document.documentElement.classList.add('js-ready');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
