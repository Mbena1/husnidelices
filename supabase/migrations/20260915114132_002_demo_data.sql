/*
# Demo Data Seed

## Overview
Inserts demonstration data for the patisserie platform: categories, products with images,
gallery items, promotions, collections, themes, events, banners, and site settings.
All data is clearly demo/sample data for testing the platform.

## Data Inserted
1. Site settings (single row with default bakery info)
2. Default theme + Benin Independence theme + Christmas theme + Valentine theme
3. Categories (Gateaux, Cupcakes, Tartes, Viennoiseries, Desserts, Chocolats, Pieces montees)
4. Products (8 demo products with images)
5. Gallery items (8 showcase photos)
6. Promotions (2 active promos)
7. Collections (2 collections)
8. Events (Benin Independence Day)
9. Banners (1 active banner)

## Notes
- All images are from Pexels (license-free stock photos)
- Prices are in FCFA (integer values)
- This is DEMO DATA only — clearly marked as such
*/

-- ============================================================
-- SITE SETTINGS
-- ============================================================

INSERT INTO public.site_settings (
  bakery_name, tagline, phone, whatsapp_number, email, address, city, hours,
  currency, delivery_fee, whatsapp_message,
  social_facebook, social_instagram,
  about_text, hero_title, hero_subtitle
) VALUES (
  'Délices Dorés',
  'L''art de créer des moments inoubliables',
  '+229 01 00 00 00',
  '22901000000',
  'contact@delicesdores.bj',
  'Cotonou, Bénin',
  'Cotonou',
  'Lun-Sam: 8h00 - 19h00',
  'FCFA',
  1500,
  'Bonjour, je souhaite passer une commande chez Délices Dorés.',
  'https://facebook.com/delicesdores',
  'https://instagram.com/delicesdores',
  'Bienvenue chez Délices Dorés, votre pâtisserie artisanale d''exception au cœur du Bénin. Chaque création est une œuvre d''art, confectionnée avec passion et les meilleurs ingrédients. Du gâteau de mariage à la tarte aux fruits frais, nous transformons vos moments en souvenirs inoubliables.',
  'L''art de créer des moments inoubliables',
  'Pâtisserie artisanale d''exception au Bénin'
) ON CONFLICT DO NOTHING;

-- ============================================================
-- THEMES
-- ============================================================

INSERT INTO public.themes (name, description, primary_color, secondary_color, accent_color, text_color, background_color, button_color, hero_image, hero_title, hero_subtitle, is_active, is_default) VALUES
(
  'Thème Classique',
  'Thème par défaut — élégant et chaleureux',
  '#3D2817',
  '#C8A96A',
  '#D4AF37',
  '#2A1F14',
  '#FAF6F0',
  '#3D2817',
  NULL,
  NULL,
  NULL,
  true,
  true
),
(
  'Célébrons le Bénin',
  'Thème spécial pour la Fête de l''Indépendance — couleurs patriotiques élégantes',
  '#008751',
  '#FCD116',
  '#E60C2B',
  '#1A1A1A',
  '#FFFCF5',
  '#008751',
  NULL,
  'Célébrons le Bénin ensemble',
  'Des créations inspirées de nos couleurs nationales',
  false,
  false
),
(
  'Esprit de Noël',
  'Ambiance chaleureuse et festive pour les fêtes de fin d''année',
  '#8B2635',
  '#2D6A4F',
  '#D4AF37',
  '#2A1F14',
  '#FBF5F0',
  '#8B2635',
  NULL,
  'Magie de Noël',
  'Des douceurs pour célébrer les fêtes',
  false,
  false
),
(
  'Saint-Valentin',
  'Ambiance romantique et premium pour la Saint-Valentin',
  '#B8336A',
  '#E8B4BC',
  '#D4AF37',
  '#3D1A2B',
  '#FFF5F5',
  '#B8336A',
  NULL,
  'L''amour au goûter sucré',
  'Des créations qui font battre le cœur',
  false,
  false
) ON CONFLICT DO NOTHING;

-- ============================================================
-- CATEGORIES
-- ============================================================

INSERT INTO public.categories (name, slug, description, icon, sort_order) VALUES
('Gâteaux', 'gateaux', 'Gâteaux pour toutes les occasions', 'cake', 1),
('Cupcakes', 'cupcakes', 'Petits gâteaux individuels décorés', 'cupcake', 2),
('Tartes', 'tartes', 'Tartes aux fruits et créations sucrées', 'pie-chart', 3),
('Viennoiseries', 'viennoiseries', 'Croissants, pains au chocolat et douceurs', 'croissant', 4),
('Desserts', 'desserts', 'Desserts individuels et entremets', 'ice-cream', 5),
('Chocolats', 'chocolats', 'Truffes, pralines et créations chocolatées', 'cookie', 6),
('Pièces Montées', 'pieces-montees', 'Pièces montées pour grands événements', 'wedding-cake', 7),
('Personnalisés', 'personnalises', 'Créations sur mesure selon vos envies', 'sparkles', 8)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- PRODUCTS
-- ============================================================

INSERT INTO public.products (category_id, name, slug, description, price, compare_at_price, prep_time_hours, is_available, is_featured, is_active, tags) VALUES
(
  (SELECT id FROM public.categories WHERE slug = 'gateaux'),
  'Gâteau Chocolat Royal',
  'gateau-chocolat-royal',
  'Un gâteau au chocolat intense, ganache onctueuse et décorations élégantes. Parfait pour les anniversaires et célébrations.',
  25000,
  30000,
  48,
  true,
  true,
  true,
  ARRAY['chocolat', 'anniversaire', 'ganache']
),
(
  (SELECT id FROM public.categories WHERE slug = 'gateaux'),
  'Gâteau Vanille Délicate',
  'gateau-vanille-delicate',
  'Gâteau à la vanille de Madagascar, crème au beurre légère et décorations florales. Une élégance raffinée.',
  22000,
  NULL,
  48,
  true,
  true,
  true,
  ARRAY['vanille', 'anniversaire', 'fleurs']
),
(
  (SELECT id FROM public.categories WHERE slug = 'cupcakes'),
  'Cupcakes Festifs',
  'cupcakes-festifs',
  'Lot de 6 cupcakes décorés avec glaçage coloré et vermicelles. Parfaits pour les fêtes et goûters.',
  8000,
  10000,
  24,
  true,
  true,
  true,
  ARRAY['cupcakes', 'fête', 'couleur']
),
(
  (SELECT id FROM public.categories WHERE slug = 'tartes'),
  'Tarte aux Fruits Frais',
  'tarte-aux-fruits-frais',
  'Tarte sablée garnie de crème pâtissière et fruits frais de saison. Fraises, kiwi, myrtilles.',
  15000,
  NULL,
  24,
  true,
  false,
  true,
  ARRAY['fruits', 'saison', 'frais']
),
(
  (SELECT id FROM public.categories WHERE slug = 'pieces-montees'),
  'Pièce Montée Mariage',
  'piece-montee-mariage',
  'Pièce montée à 3 étages pour mariage. Décorations florales personnalisables. Sur rendez-vous.',
  120000,
  NULL,
  120,
  true,
  true,
  true,
  ARRAY['mariage', '3-etages', 'fleuri']
),
(
  (SELECT id FROM public.categories WHERE slug = 'desserts'),
  'Macarons Assortis',
  'macarons-assortis',
  'Boîte de 12 macarons assortis: vanille, chocolat, framboise, pistache, caramel. Un délice raffiné.',
  12000,
  NULL,
  24,
  true,
  false,
  true,
  ARRAY['macarons', 'assortiment', 'boîte']
),
(
  (SELECT id FROM public.categories WHERE slug = 'chocolats'),
  'Truffes Chocolat Artisanales',
  'truffes-chocolat-artisanales',
  'Boîte de 20 truffes au chocolat noir et lait, enrobées de cacao. Fabriquées à la main.',
  10000,
  12000,
  12,
  true,
  false,
  true,
  ARRAY['chocolat', 'truffes', 'artisanal']
),
(
  (SELECT id FROM public.categories WHERE slug = 'viennoiseries'),
  'Croissants Artisanaux',
  'croissants-artisanaux',
  'Lot de 6 croissants pur beurre, feuilletés à la main. Dorés et croustillants.',
  5000,
  NULL,
  6,
  true,
  false,
  true,
  ARRAY['croissant', 'beurre', 'matin']
) ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- PRODUCT IMAGES
-- ============================================================

INSERT INTO public.product_images (product_id, url, alt, sort_order) VALUES
(
  (SELECT id FROM public.products WHERE slug = 'gateau-chocolat-royal'),
  'https://images.pexels.com/photos/18131293/pexels-photo-18131293.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  'Gâteau au chocolat pour anniversaire',
  0
),
(
  (SELECT id FROM public.products WHERE slug = 'gateau-chocolat-royal'),
  'https://images.pexels.com/photos/34498572/pexels-photo-34498572.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  'Gâteau au chocolat avec myrtilles',
  1
),
(
  (SELECT id FROM public.products WHERE slug = 'gateau-chocolat-royal'),
  'https://images.pexels.com/photos/1682474/pexels-photo-1682474.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  'Gâteau décoré avec fleurs',
  2
),
(
  (SELECT id FROM public.products WHERE slug = 'gateau-vanille-delicate'),
  'https://images.pexels.com/photos/32125114/pexels-photo-32125114.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  'Gâteau avec fleurs roses',
  0
),
(
  (SELECT id FROM public.products WHERE slug = 'gateau-vanille-delicate'),
  'https://images.pexels.com/photos/29625650/pexels-photo-29625650.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  'Gâteau blanc avec fraises',
  1
),
(
  (SELECT id FROM public.products WHERE slug = 'cupcakes-festifs'),
  'https://images.pexels.com/photos/11128671/pexels-photo-11128671.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  'Cupcakes roses avec vermicelles',
  0
),
(
  (SELECT id FROM public.products WHERE slug = 'cupcakes-festifs'),
  'https://images.pexels.com/photos/8356594/pexels-photo-8356594.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  'Cupcakes colorés décorés',
  1
),
(
  (SELECT id FROM public.products WHERE slug = 'tarte-aux-fruits-frais'),
  'https://images.pexels.com/photos/34208221/pexels-photo-34208221.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  'Tarte aux fruits rouges',
  0
),
(
  (SELECT id FROM public.products WHERE slug = 'tarte-aux-fruits-frais'),
  'https://images.pexels.com/photos/4748367/pexels-photo-4748367.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  'Tarte aux fruits vue de dessus',
  1
),
(
  (SELECT id FROM public.products WHERE slug = 'piece-montee-mariage'),
  'https://images.pexels.com/photos/16935947/pexels-photo-16935947.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  'Pièce montée blanc et vert',
  0
),
(
  (SELECT id FROM public.products WHERE slug = 'piece-montee-mariage'),
  'https://images.pexels.com/photos/38986757/pexels-photo-38986757.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  'Pièce montée 3 étages avec fleurs',
  1
),
(
  (SELECT id FROM public.products WHERE slug = 'piece-montee-mariage'),
  'https://images.pexels.com/photos/18853333/pexels-photo-18853333.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  'Pièce montée 5 étages avec fleurs blanches',
  2
),
(
  (SELECT id FROM public.products WHERE slug = 'macarons-assortis'),
  'https://images.pexels.com/photos/5317221/pexels-photo-5317221.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  'Macarons colorés',
  0
),
(
  (SELECT id FROM public.products WHERE slug = 'macarons-assortis'),
  'https://images.pexels.com/photos/8356243/pexels-photo-8356243.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  'Macarons pastel',
  1
),
(
  (SELECT id FROM public.products WHERE slug = 'truffes-chocolat-artisanales'),
  'https://images.pexels.com/photos/6487798/pexels-photo-6487798.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  'Truffes en chocolat artisanales',
  0
),
(
  (SELECT id FROM public.products WHERE slug = 'truffes-chocolat-artisanales'),
  'https://images.pexels.com/photos/15550434/pexels-photo-15550434.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  'Pralines au chocolat',
  1
),
(
  (SELECT id FROM public.products WHERE slug = 'croissants-artisanaux'),
  'https://images.pexels.com/photos/30853716/pexels-photo-30853716.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  'Croissants dorés',
  0
),
(
  (SELECT id FROM public.products WHERE slug = 'croissants-artisanaux'),
  'https://images.pexels.com/photos/38594753/pexels-photo-38594753.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  'Croissants sur plaque',
  1
) ON CONFLICT DO NOTHING;

-- ============================================================
-- GALLERY
-- ============================================================

INSERT INTO public.gallery (title, description, image_url, category, event_date, sort_order) VALUES
(
  'Mariage Élégance',
  'Pièce montée pour un mariage somptueux à Cotonou',
  'https://images.pexels.com/photos/17315403/pexels-photo-17315403.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  'mariage',
  '2024-12-15',
  0
),
(
  'Anniversaire Royal',
  'Gâteau chocolat pour un anniversaire inoubliable',
  'https://images.pexels.com/photos/32397324/pexels-photo-32397324.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  'anniversaire',
  '2025-01-20',
  1
),
(
  'Baptême Pastel',
  'Création délicate pour une célébration de baptême',
  'https://images.pexels.com/photos/1682474/pexels-photo-1682474.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  'bapteme',
  '2025-02-10',
  2
),
(
  'Tour de Macarons',
  'Pièce montée de macarons pour un événement',
  'https://images.pexels.com/photos/26774587/pexels-photo-26774587.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  'evenement',
  '2025-03-05',
  3
),
(
  'Gâteau Fleuri',
  'Gâteau décoré de fleurs fraîches pour un anniversaire',
  'https://images.pexels.com/photos/17029579/pexels-photo-17029579.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  'anniversaire',
  '2025-04-12',
  4
),
(
  'Création Personnalisée',
  'Gâteau personnalisé sur le thème d''un anniversaire',
  'https://images.pexels.com/photos/12616001/pexels-photo-12616001.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  'personnalise',
  '2025-05-01',
  5
),
(
  'Tartes Raffinées',
  'Assortiment de tartes pour un buffet',
  'https://images.pexels.com/photos/39213897/pexels-photo-39213897.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  'evenement',
  '2025-06-18',
  6
),
(
  'Douceurs Chocolatées',
  'Assortiment de truffes et pralines',
  'https://images.pexels.com/photos/9279002/pexels-photo-9279002.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  'autre',
  '2025-07-22',
  7
) ON CONFLICT DO NOTHING;

-- ============================================================
-- PROMOTIONS
-- ============================================================

INSERT INTO public.promotions (title, description, discount_type, discount_value, start_date, end_date, is_active) VALUES
(
  'Rentrée Gourmande',
  'Profitez de -20% sur tous nos gâteaux pour la rentrée',
  'percentage',
  20,
  now(),
  now() + interval '30 days',
  true
),
(
  'Lot de Cupcakes à prix réduit',
  '6 cupcakes pour 8000 FCFA au lieu de 10000 FCFA',
  'fixed',
  2000,
  now(),
  now() + interval '15 days',
  true
) ON CONFLICT DO NOTHING;

-- ============================================================
-- PROMO CODES
-- ============================================================

INSERT INTO public.promo_codes (code, description, discount_type, discount_value, max_uses, is_active) VALUES
('BIENVENUE10', 'Code de bienvenue - 10% sur votre première commande', 'percentage', 10, 100, true),
('FETE5000', 'Réduction de 5000 FCFA sur les commandes de plus de 50000 FCFA', 'fixed', 5000, 50, true)
ON CONFLICT (code) DO NOTHING;

-- ============================================================
-- COLLECTIONS
-- ============================================================

INSERT INTO public.collections (title, description, image_url, is_active, is_featured, sort_order, start_date, end_date) VALUES
(
  'Collection Anniversaire',
  'Des gâteaux spectaculaires pour célébrer chaque année',
  'https://images.pexels.com/photos/7330772/pexels-photo-7330772.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  true,
  true,
  0,
  now(),
  now() + interval '90 days'
),
(
  'Collection Mariage',
  'Pièces montées et créations d''exception pour votre jour J',
  'https://images.pexels.com/photos/36581572/pexels-photo-36581572.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  true,
  true,
  1,
  now(),
  now() + interval '180 days'
) ON CONFLICT DO NOTHING;

-- Link products to collections
INSERT INTO public.collection_products (collection_id, product_id, sort_order) VALUES
(
  (SELECT id FROM public.collections WHERE title = 'Collection Anniversaire'),
  (SELECT id FROM public.products WHERE slug = 'gateau-chocolat-royal'),
  0
),
(
  (SELECT id FROM public.collections WHERE title = 'Collection Anniversaire'),
  (SELECT id FROM public.products WHERE slug = 'gateau-vanille-delicate'),
  1
),
(
  (SELECT id FROM public.collections WHERE title = 'Collection Anniversaire'),
  (SELECT id FROM public.products WHERE slug = 'cupcakes-festifs'),
  2
),
(
  (SELECT id FROM public.collections WHERE title = 'Collection Mariage'),
  (SELECT id FROM public.products WHERE slug = 'piece-montee-mariage'),
  0
),
(
  (SELECT id FROM public.collections WHERE title = 'Collection Mariage'),
  (SELECT id FROM public.products WHERE slug = 'macarons-assortis'),
  1
) ON CONFLICT DO NOTHING;

-- ============================================================
-- EVENTS
-- ============================================================

INSERT INTO public.events (name, description, theme_id, start_date, end_date, is_recurring, is_active) VALUES
(
  'Fête de l''Indépendance du Bénin',
  'Célébration du 1er août — Fête nationale du Bénin',
  (SELECT id FROM public.themes WHERE name = 'Célébrons le Bénin'),
  '2026-07-31',
  '2026-08-02',
  true,
  true
) ON CONFLICT DO NOTHING;

-- ============================================================
-- BANNERS
-- ============================================================

INSERT INTO public.banners (title, text, button_label, button_link, image_url, is_active, sort_order) VALUES
(
  'Nouvelle Collection Anniversaire',
  'Découvrez nos nouvelles créations pour célébrer vos anniversaires en beauté',
  'Voir la collection',
  '/collections',
  'https://images.pexels.com/photos/1682474/pexels-photo-1682474.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  true,
  0
) ON CONFLICT DO NOTHING;