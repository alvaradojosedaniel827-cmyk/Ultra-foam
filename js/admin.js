// Ultra Foam LLC — Admin Panel Logic
// Depends on: supabaseClient (window global from js/supabase-config.js)

(function () {
  'use strict';

  // DOM refs — resolved on DOMContentLoaded
  let loginScreen, adminPanel, loginForm, loginError, loginBtn;
  let productListEl, productCountEl, addBtn;
  let formModal, productForm, formTitleEl, formError, formSuccess, saveBtn;
  let imageInput, imagePreview;

  // State
  let editingId = null;
  let currentImageUrl = null;

  // =====================
  // AUTH
  // =====================

  async function init() {
    const { data: { session } } = await supabaseClient.auth.getSession();
    renderAuth(session);

    supabaseClient.auth.onAuthStateChange((_event, session) => {
      renderAuth(session);
    });
  }

  function renderAuth(session) {
    if (session) {
      loginScreen.hidden = true;
      adminPanel.hidden = false;
      loadProducts();
    } else {
      loginScreen.hidden = false;
      adminPanel.hidden = true;
    }
  }

  async function handleLogin(e) {
    e.preventDefault();
    loginError.hidden = true;
    loginBtn.textContent = 'Signing in…';
    loginBtn.disabled = true;

    const email = loginForm.querySelector('[name="email"]').value.trim();
    const password = loginForm.querySelector('[name="password"]').value;

    const { error } = await supabaseClient.auth.signInWithPassword({ email, password });

    if (error) {
      loginError.textContent = error.message;
      loginError.hidden = false;
      loginBtn.textContent = 'Sign In';
      loginBtn.disabled = false;
    }
    // On success onAuthStateChange fires and renderAuth() switches the view
  }

  async function handleSignOut() {
    await supabaseClient.auth.signOut();
  }

  // =====================
  // PRODUCTS — READ
  // =====================

  async function loadProducts() {
    productListEl.innerHTML = '<p class="state-msg">Loading…</p>';

    const { data, error } = await supabaseClient
      .from('products')
      .select('*')
      .order('sort_order', { ascending: true, nullsFirst: false });

    if (error) {
      productListEl.innerHTML = `<p class="state-msg is-error">Error: ${escHtml(error.message)}</p>`;
      return;
    }

    productCountEl.textContent = data.length;

    if (data.length === 0) {
      productListEl.innerHTML = '<p class="state-msg">No products yet. Click "+ Add Product" to get started.</p>';
      return;
    }

    productListEl.innerHTML = data.map(p => `
      <div class="product-row" data-id="${escAttr(p.id)}" data-name="${escAttr(p.name)}">
        <div class="product-thumb">
          ${p.image_url
            ? `<img src="${escAttr(p.image_url)}" alt="${escAttr(p.name)}" loading="lazy">`
            : '<span class="no-img">No img</span>'}
        </div>
        <div class="product-info">
          <div class="product-name">${escHtml(p.name)}</div>
          <div class="product-meta">
            <span class="cat-badge cat-${escAttr(p.category)}">${escHtml(p.category)}</span>
            ${p.size_label ? `<span class="meta-tag">${escHtml(p.size_label)}</span>` : ''}
            <span class="meta-price">$${Number(p.price || 0).toFixed(2)}</span>
          </div>
          <div class="product-badges">
            <span class="badge ${p.available ? 'badge-on' : 'badge-off'}">${p.available ? 'Available' : 'Unavailable'}</span>
            ${p.featured ? '<span class="badge badge-featured">Featured</span>' : ''}
          </div>
        </div>
        <div class="product-actions">
          <button class="btn btn-blue btn-edit">Edit</button>
          <button class="btn btn-danger btn-delete">Delete</button>
        </div>
      </div>
    `).join('');
  }

  // =====================
  // PRODUCTS — FORM
  // =====================

  function openAdd() {
    editingId = null;
    currentImageUrl = null;
    formTitleEl.textContent = 'Add Product';
    productForm.reset();
    clearPreview();
    clearMsgs();
    formModal.hidden = false;
    productForm.querySelector('[name="name"]').focus();
  }

  async function openEdit(id) {
    editingId = id;
    clearMsgs();
    formTitleEl.textContent = 'Edit Product';
    formModal.hidden = false;
    saveBtn.textContent = 'Loading…';
    saveBtn.disabled = true;

    const { data, error } = await supabaseClient
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    saveBtn.textContent = 'Save Product';
    saveBtn.disabled = false;

    if (error) {
      showFormError('Failed to load product: ' + error.message);
      return;
    }

    currentImageUrl = data.image_url || null;

    productForm.querySelector('[name="name"]').value       = data.name || '';
    productForm.querySelector('[name="price"]').value      = data.price != null ? data.price : '';
    productForm.querySelector('[name="category"]').value   = data.category || 'detergents';
    productForm.querySelector('[name="size_label"]').value = data.size_label || '';
    productForm.querySelector('[name="available"]').checked = !!data.available;
    productForm.querySelector('[name="featured"]').checked  = !!data.featured;
    productForm.querySelector('[name="sort_order"]').value  = data.sort_order != null ? data.sort_order : '';

    if (data.image_url) {
      imagePreview.src = data.image_url;
      imagePreview.hidden = false;
    } else {
      clearPreview();
    }
  }

  function closeModal() {
    formModal.hidden = true;
    editingId = null;
    currentImageUrl = null;
    productForm.reset();
    clearPreview();
    clearMsgs();
  }

  async function handleSave(e) {
    e.preventDefault();
    clearMsgs();

    const name = productForm.querySelector('[name="name"]').value.trim();
    if (!name) {
      showFormError('Product name is required.');
      productForm.querySelector('[name="name"]').focus();
      return;
    }

    saveBtn.textContent = 'Saving…';
    saveBtn.disabled = true;

    try {
      let image_url = currentImageUrl;

      const file = imageInput.files[0];
      if (file) {
        const ext = file.name.split('.').pop().toLowerCase();
        const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

        const { error: uploadErr } = await supabaseClient.storage
          .from('product-images')
          .upload(path, file, { contentType: file.type, upsert: false });

        if (uploadErr) throw new Error('Image upload failed: ' + uploadErr.message);

        const { data: urlData } = supabaseClient.storage
          .from('product-images')
          .getPublicUrl(path);

        image_url = urlData.publicUrl;
      }

      const payload = {
        name,
        price:       parseFloat(productForm.querySelector('[name="price"]').value)     || 0,
        category:    productForm.querySelector('[name="category"]').value,
        size_label:  productForm.querySelector('[name="size_label"]').value.trim()     || null,
        available:   productForm.querySelector('[name="available"]').checked,
        featured:    productForm.querySelector('[name="featured"]').checked,
        sort_order:  parseInt(productForm.querySelector('[name="sort_order"]').value, 10) || null,
        image_url:   image_url || null,
      };

      let dbError;
      if (editingId) {
        ({ error: dbError } = await supabaseClient.from('products').update(payload).eq('id', editingId));
      } else {
        ({ error: dbError } = await supabaseClient.from('products').insert(payload));
      }

      if (dbError) throw dbError;

      showFormSuccess(editingId ? 'Product updated!' : 'Product added!');
      await loadProducts();
      setTimeout(closeModal, 1200);

    } catch (err) {
      showFormError(err.message || 'An unexpected error occurred.');
    } finally {
      saveBtn.textContent = 'Save Product';
      saveBtn.disabled = false;
    }
  }

  async function handleDelete(id, name) {
    if (!confirm(`Delete "${name}"?\n\nThis cannot be undone.`)) return;

    const { error } = await supabaseClient.from('products').delete().eq('id', id);

    if (error) {
      alert('Delete failed: ' + error.message);
      return;
    }

    await loadProducts();
  }

  // =====================
  // IMAGE PREVIEW
  // =====================

  function handleImageChange() {
    const file = imageInput.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      imagePreview.src = reader.result;
      imagePreview.hidden = false;
    };
    reader.readAsDataURL(file);
  }

  function clearPreview() {
    imageInput.value = '';
    imagePreview.src = '';
    imagePreview.hidden = true;
  }

  // =====================
  // UTILS
  // =====================

  function clearMsgs() {
    formError.hidden   = true;  formError.textContent   = '';
    formSuccess.hidden = true;  formSuccess.textContent = '';
  }

  function showFormError(msg)   { formError.textContent   = msg; formError.hidden   = false; }
  function showFormSuccess(msg) { formSuccess.textContent = msg; formSuccess.hidden = false; }

  function escHtml(str) {
    return String(str ?? '')
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function escAttr(str) {
    return String(str ?? '').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  // =====================
  // BOOTSTRAP
  // =====================

  document.addEventListener('DOMContentLoaded', () => {
    loginScreen    = document.getElementById('login-screen');
    adminPanel     = document.getElementById('admin-panel');
    loginForm      = document.getElementById('login-form');
    loginError     = document.getElementById('login-error');
    loginBtn       = document.getElementById('login-btn');
    productListEl  = document.getElementById('product-list');
    productCountEl = document.getElementById('product-count');
    addBtn         = document.getElementById('add-btn');
    formModal      = document.getElementById('form-modal');
    productForm    = document.getElementById('product-form');
    formTitleEl    = document.getElementById('form-title');
    formError      = document.getElementById('form-error');
    formSuccess    = document.getElementById('form-success');
    saveBtn        = document.getElementById('save-btn');
    imageInput     = document.getElementById('image-input');
    imagePreview   = document.getElementById('image-preview');

    loginForm.addEventListener('submit', handleLogin);
    document.getElementById('signout-btn').addEventListener('click', handleSignOut);
    addBtn.addEventListener('click', openAdd);
    productForm.addEventListener('submit', handleSave);
    document.getElementById('cancel-btn').addEventListener('click', closeModal);
    document.getElementById('modal-close-btn').addEventListener('click', closeModal);
    imageInput.addEventListener('change', handleImageChange);

    // Close modal on backdrop click
    formModal.addEventListener('click', (e) => {
      if (e.target === formModal) closeModal();
    });

    // Close modal on Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !formModal.hidden) closeModal();
    });

    // Event delegation for Edit / Delete inside product list
    productListEl.addEventListener('click', (e) => {
      const row = e.target.closest('.product-row');
      if (!row) return;
      if (e.target.closest('.btn-edit'))   openEdit(row.dataset.id);
      if (e.target.closest('.btn-delete')) handleDelete(row.dataset.id, row.dataset.name);
    });

    init();
  });

})();
