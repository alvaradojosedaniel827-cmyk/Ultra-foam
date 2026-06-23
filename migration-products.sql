-- ============================================================
-- Ultra Foam LLC — Migración inicial: 18 productos
-- EJECUTAR UNA SOLA VEZ en el SQL Editor de Supabase.
-- No hay ON CONFLICT por nombre; ejecutarlo dos veces
-- creará duplicados. Verificar que la tabla esté vacía antes.
-- ============================================================

INSERT INTO public.products
  (name, price, category, size_label, image_url, available, featured, sort_order)
VALUES

  -- ── DETERGENTS ──────────────────────────────────────────────────────────────
  (
    'Tide Ultra Oxi', NULL, 'detergents', '5 Gallons',
    'https://ultrafoam.store/assets/images/detergent-tide-ultra-oxi.jpeg',
    true, false, 10
  ),
  (
    'Tide Ultra Downy', NULL, 'detergents', '5 Gallons',
    'https://ultrafoam.store/assets/images/detergent-tide-ultra-downy.jpeg',
    true, false, 20
  ),
  (
    'Tide Free & Gentle', NULL, 'detergents', '5 Gallons',
    'https://ultrafoam.store/assets/images/detergent-tide-free-gentle.jpeg',
    true, false, 30
  ),
  (
    'Gain Ultra Oxi', NULL, 'detergents', '5 Gallons',
    'https://ultrafoam.store/assets/images/detergent-gain-ultra-oxi.jpeg',
    true, false, 40
  ),
  (
    'Persil', NULL, 'detergents', '5 Gallons',
    'https://ultrafoam.store/assets/images/detergent-persil.jpeg',
    true, false, 50
  ),
  (
    'Dreft Baby Detergent', NULL, 'detergents', '5 Gallons',
    'https://ultrafoam.store/assets/images/detergent-dreft-baby.jpeg',
    true, false, 60
  ),

  -- ── SOFTENERS ───────────────────────────────────────────────────────────────
  (
    'Downy April Fresh', NULL, 'softeners', '5 Gallons',
    'https://ultrafoam.store/assets/images/softener-downy-april-fresh.jpeg',
    true, false, 70
  ),
  (
    'Gain Fabric Softener', NULL, 'softeners', '5 Gallons',
    'https://ultrafoam.store/assets/images/softener-gain.jpeg',
    true, false, 80
  ),
  (
    'Suavitel Fabric Softener', NULL, 'softeners', '5 Gallons',
    'https://ultrafoam.store/assets/images/softener-suavitel.jpeg',
    true, false, 90
  ),

  -- ── CLEANERS ────────────────────────────────────────────────────────────────
  (
    'Fabuloso', NULL, 'cleaners', '5 Gallons',
    'https://ultrafoam.store/assets/images/cleaner-fabuloso.jpeg',
    true, false, 100
  ),
  (
    'Pine-Sol', NULL, 'cleaners', '5 Gallons',
    'https://ultrafoam.store/assets/images/cleaner-pine-sol.jpeg',
    true, false, 110
  ),
  (
    'Clorox Bleach', NULL, 'cleaners', '5 Gallons',
    'https://ultrafoam.store/assets/images/cleaner-clorox-bleach.jpeg',
    true, false, 120
  ),
  (
    'Dawn Professional Dish Soap', NULL, 'cleaners', '5 Gallons',
    'https://ultrafoam.store/assets/images/cleaner-dawn-professional.jpeg',
    true, false, 130
  ),
  (
    'Degreaser', NULL, 'cleaners', '5 Gallons',
    'https://ultrafoam.store/assets/images/cleaner-degreaser.jpeg',
    true, false, 140
  ),

  -- ── ADD-ONS ─────────────────────────────────────────────────────────────────
  (
    'Tide Pods with Oxi', NULL, 'addons', '150 Count',
    NULL,                          -- sin imagen en assets/images/
    true, false, 150
  ),
  (
    'Gain Pods', NULL, 'addons', '150 Count',
    'https://ultrafoam.store/assets/images/addon-gain-pods.jpeg',
    true, false, 160
  ),
  (
    'April Fresh Scent Beads', NULL, 'addons', '5 lb Bag',
    NULL,                          -- sin imagen en assets/images/
    true, false, 170
  ),
  (
    'Unstoppable Scent Beads', NULL, 'addons', '5 lb Bag',
    NULL,                          -- sin imagen en assets/images/
    true, false, 180
  );
