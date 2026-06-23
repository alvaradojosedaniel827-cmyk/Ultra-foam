/* =============================================================
   Ultra Foam LLC — products.js
   Fetches products from Supabase and renders them in index.html.
   Depends on: supabaseClient (global from js/supabase-config.js)
              window._UF_reinit (set by js/main.js after init)
   ============================================================= */

(function () {
  'use strict';

  var WA_NUMBER = '13472562800';

  var CAT_LABELS = {
    detergents: 'Laundry Detergents',
    softeners:  'Fabric Softeners',
    cleaners:   'Household Cleaners',
    addons:     'Laundry Add-Ons'
  };
  var CAT_ORDER = ['detergents', 'softeners', 'cleaners', 'addons'];

  /* ----------------------------------------------------------
     Helpers
     ---------------------------------------------------------- */

  function esc(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function buildWALink(msg) {
    return 'https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(msg);
  }

  /* ----------------------------------------------------------
     Card builder — matches the existing hardcoded card structure
     ---------------------------------------------------------- */

  function buildCard(p) {
    var isOos      = !p.available;
    var isFeatured = !!p.featured;
    var productRef = p.name + (p.size_label ? ' (' + p.size_label + ')' : '');

    // Image or SVG placeholder (matches existing #ic-pods placeholder)
    var media = p.image_url
      ? '<img src="' + esc(p.image_url) + '" alt="' + esc(p.name)
          + '" loading="lazy" width="400" height="400">'
      : '<span class="product-placeholder" aria-hidden="true">'
          + '<svg class="product-icon" viewBox="0 0 64 64">'
          + '<use href="#ic-pods"/></svg></span>';

    // Overlay badges on the media div (position: relative)
    var badges = '';
    if (isFeatured) badges += '<span class="product-badge product-badge--featured">Featured</span>';
    if (isOos)      badges += '<span class="product-badge product-badge--oos">Out of stock</span>';

    // Order button: disabled for OOS; data-whatsapp for available (wired by initWhatsApp)
    var orderBtn = isOos
      ? '<button class="btn btn-secondary btn-sm product-order" disabled aria-disabled="true">'
          + 'Out of stock</button>'
      : '<a class="btn btn-secondary btn-sm product-order" data-whatsapp'
          + ' data-product="' + esc(productRef) + '">Order</a>';

    var tag = p.size_label
      ? '<span class="product-tag">' + esc(p.size_label) + '</span>'
      : '';

    return '<article class="product-card' + (isOos ? ' is-oos' : '')
        + '" data-category="' + esc(p.category) + '">'
      + '<div class="product-media">' + media + badges + '</div>'
      + '<div class="product-body">'
      + '<h4 class="product-name">' + esc(p.name) + '</h4>'
      + tag
      + orderBtn
      + '</div>'
      + '</article>';
  }

  function buildCategorySection(cat, products) {
    return '<div class="product-category">'
      + '<div class="category-head">'
      + '<h3 class="category-title">' + esc(CAT_LABELS[cat] || cat) + '</h3>'
      + '<span class="category-line" aria-hidden="true"></span>'
      + '</div>'
      + '<div class="product-grid">'
      + products.map(buildCard).join('')
      + '</div>'
      + '</div>';
  }

  /* ----------------------------------------------------------
     Update sidebar category counts dynamically
     ---------------------------------------------------------- */

  function updateCounts(grouped, total) {
    var allEl = document.getElementById('count-all');
    if (allEl) allEl.textContent = total;
    CAT_ORDER.forEach(function (cat) {
      var el = document.getElementById('count-' + cat);
      if (el) el.textContent = grouped[cat] ? grouped[cat].length : 0;
    });
  }

  /* ----------------------------------------------------------
     Main: fetch → render → hook into existing filter + WA logic
     ---------------------------------------------------------- */

  async function loadProducts() {
    var loadingEl = document.getElementById('products-loading');
    var renderEl  = document.getElementById('products-render');
    if (!renderEl) return; // guard: only runs on index.html

    try {
      if (typeof supabaseClient === 'undefined') {
        throw new Error('supabaseClient not available');
      }

      var result = await supabaseClient
        .from('products')
        .select('*')
        .order('sort_order', { ascending: true, nullsFirst: false })
        .order('name',       { ascending: true });

      if (result.error) throw result.error;

      var data = result.data || [];
      if (data.length === 0) throw new Error('Empty product list');

      // Group by category (preserving CAT_ORDER)
      var grouped = {};
      CAT_ORDER.forEach(function (cat) { grouped[cat] = []; });
      data.forEach(function (p) {
        if (grouped[p.category]) {
          grouped[p.category].push(p);
        } else {
          grouped[p.category] = [p];
        }
      });

      // Build HTML: only render categories that have products
      var html = CAT_ORDER
        .filter(function (cat) { return grouped[cat] && grouped[cat].length > 0; })
        .map(function (cat) { return buildCategorySection(cat, grouped[cat]); })
        .join('');

      renderEl.innerHTML = html;
      updateCounts(grouped, data.length);

      // Swap: hide skeleton, show products
      if (loadingEl) loadingEl.hidden = true;
      renderEl.hidden = false;

      // Re-wire WhatsApp hrefs on new Order buttons and re-apply active filter.
      // _UF_reinit is set by main.js init() which runs before DOMContentLoaded.
      if (typeof window._UF_reinit === 'function') window._UF_reinit();

    } catch (err) {
      console.warn('[Ultra Foam] Products failed to load:', err && err.message || err);

      if (loadingEl) loadingEl.hidden = true;

      var waFallback = buildWALink(
        "Hi Ultra Foam! I’d like to see your product catalog and place an order."
      );
      renderEl.innerHTML =
        '<div class="catalog-error">'
        + '<p>Our product list couldn’t be loaded right now.</p>'
        + '<p>Please <a href="' + esc(waFallback)
        + '" target="_blank" rel="noopener noreferrer">contact us on WhatsApp</a>'
        + ' to place your order, or try refreshing the page.</p>'
        + '</div>';
      renderEl.hidden = false;
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadProducts);
  } else {
    loadProducts();
  }

})();
