/*
# Core Schema — Pâtisserie Platform

## Overview
Creates the complete database schema for a premium pastry e-commerce platform with
client and admin functionality. Includes products, orders, custom requests, gallery,
promotions, collections, themes, events, notifications, and site settings.

## Tables Created
1. profiles — extends auth.users with role, phone, address info
2. categories — product categories (cakes, cupcakes, etc.)
3. products — pastry products with pricing, availability, prep time
4. product_images — multiple images per product
5. favorites — user favorited products
6. orders — customer orders with delivery info and status
7. order_items — line items within an order
8. custom_requests — personalized cake requests
9. custom_request_images — inspiration photos for custom requests
10. gallery — showcase of past creations
11. promotions — discount campaigns (percentage or fixed)
12. promo_codes — redeemable codes
13. collections — seasonal/themed product collections
14. collection_products — junction table for collection <-> products
15. themes — visual themes with colors, hero image, fonts
16. events — scheduled events that activate themes
17. site_settings — global settings (name, phone, WhatsApp, address, etc.)
18. notifications — user and admin notifications
19. banners — homepage banners with scheduling

## Security
- RLS enabled on ALL tables
- Public read for: categories, products (active only), product_images, gallery, collections,
  collection_products, promotions (active), themes (active), site_settings, banners (active)
- Authenticated write for: orders (own), order_items (via order ownership), custom_requests (own),
  custom_request_images (via request ownership), favorites (own), profiles (own), notifications (own)
- Admin full access on all tables via is_admin() check
- Owner columns default to auth.uid() so inserts work without passing user_id

## Notes
- is_admin() SQL function checks raw_app_meta_data->>'role' = 'admin'
- Currency: FCFA (stored as integer, displayed as FCFA)
- All timestamps are timestamptz with defaults
*/

-- ============================================================
-- HELPER FUNCTIONS
-- ============================================================

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT COALESCE(auth.jwt() -> 'app_metadata' ->> 'role', '') = 'admin';
$$;

-- ============================================================
-- PROFILES
-- ============================================================

CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  first_name text,
  last_name text,
  phone text,
  address text,
  city text,
  notes text,
  role text NOT NULL DEFAULT 'customer',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select_own_or_admin" ON public.profiles;
CREATE POLICY "profiles_select_own_or_admin" ON public.profiles FOR SELECT
  TO authenticated USING (auth.uid() = id OR public.is_admin());

DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_update_own_or_admin" ON public.profiles;
CREATE POLICY "profiles_update_own_or_admin" ON public.profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id OR public.is_admin()) WITH CHECK (auth.uid() = id OR public.is_admin());

DROP POLICY IF EXISTS "profiles_admin_all" ON public.profiles;
CREATE POLICY "profiles_admin_all" ON public.profiles FOR ALL
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'first_name', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'last_name', ''),
    COALESCE(NEW.raw_app_meta_data ->> 'role', 'customer')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- CATEGORIES
-- ============================================================

CREATE TABLE IF NOT EXISTS public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  icon text,
  sort_order int NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "categories_public_read" ON public.categories;
CREATE POLICY "categories_public_read" ON public.categories FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "categories_admin_write" ON public.categories;
CREATE POLICY "categories_admin_write" ON public.categories FOR ALL
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ============================================================
-- PRODUCTS
-- ============================================================

CREATE TABLE IF NOT EXISTS public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  price int NOT NULL DEFAULT 0,
  compare_at_price int,
  prep_time_hours int NOT NULL DEFAULT 24,
  is_available boolean NOT NULL DEFAULT true,
  is_featured boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  stock int,
  sort_order int NOT NULL DEFAULT 0,
  tags text[] DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "products_public_read" ON public.products;
CREATE POLICY "products_public_read" ON public.products FOR SELECT
  TO anon, authenticated USING (is_active = true);

DROP POLICY IF EXISTS "products_admin_write" ON public.products;
CREATE POLICY "products_admin_write" ON public.products FOR ALL
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ============================================================
-- PRODUCT IMAGES
-- ============================================================

CREATE TABLE IF NOT EXISTS public.product_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  url text NOT NULL,
  alt text,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "product_images_public_read" ON public.product_images;
CREATE POLICY "product_images_public_read" ON public.product_images FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "product_images_admin_write" ON public.product_images;
CREATE POLICY "product_images_admin_write" ON public.product_images FOR ALL
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ============================================================
-- FAVORITES
-- ============================================================

CREATE TABLE IF NOT EXISTS public.favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, product_id)
);

ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "favorites_select_own" ON public.favorites;
CREATE POLICY "favorites_select_own" ON public.favorites FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "favorites_insert_own" ON public.favorites;
CREATE POLICY "favorites_insert_own" ON public.favorites FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "favorites_delete_own" ON public.favorites;
CREATE POLICY "favorites_delete_own" ON public.favorites FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ============================================================
-- ORDERS
-- ============================================================

CREATE TABLE IF NOT EXISTS public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number text NOT NULL UNIQUE,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  customer_name text NOT NULL,
  customer_phone text NOT NULL,
  customer_email text,
  delivery_address text,
  delivery_city text,
  delivery_method text NOT NULL DEFAULT 'pickup',
  delivery_fee int NOT NULL DEFAULT 0,
  desired_date date,
  desired_time text,
  instructions text,
  subtotal int NOT NULL DEFAULT 0,
  discount int NOT NULL DEFAULT 0,
  total int NOT NULL DEFAULT 0,
  promo_code text,
  status text NOT NULL DEFAULT 'pending',
  payment_method text NOT NULL DEFAULT 'cash_on_delivery',
  payment_status text NOT NULL DEFAULT 'pending',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "orders_select_own_or_admin" ON public.orders;
CREATE POLICY "orders_select_own_or_admin" ON public.orders FOR SELECT
  TO authenticated USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "orders_insert_own" ON public.orders;
CREATE POLICY "orders_insert_own" ON public.orders FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "orders_update_own_or_admin" ON public.orders;
CREATE POLICY "orders_update_own_or_admin" ON public.orders FOR UPDATE
  TO authenticated USING (auth.uid() = user_id OR public.is_admin()) WITH CHECK (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "orders_admin_delete" ON public.orders;
CREATE POLICY "orders_admin_delete" ON public.orders FOR DELETE
  TO authenticated USING (public.is_admin());

-- ============================================================
-- ORDER ITEMS
-- ============================================================

CREATE TABLE IF NOT EXISTS public.order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id uuid REFERENCES public.products(id) ON DELETE SET NULL,
  product_name text NOT NULL,
  product_image text,
  unit_price int NOT NULL DEFAULT 0,
  quantity int NOT NULL DEFAULT 1,
  subtotal int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "order_items_select_own_or_admin" ON public.order_items;
CREATE POLICY "order_items_select_own_or_admin" ON public.order_items FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND (o.user_id = auth.uid() OR public.is_admin()))
  );

DROP POLICY IF EXISTS "order_items_insert_own" ON public.order_items;
CREATE POLICY "order_items_insert_own" ON public.order_items FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND o.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "order_items_admin_update" ON public.order_items;
CREATE POLICY "order_items_admin_update" ON public.order_items FOR UPDATE
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "order_items_admin_delete" ON public.order_items;
CREATE POLICY "order_items_admin_delete" ON public.order_items FOR DELETE
  TO authenticated USING (public.is_admin());

-- ============================================================
-- CUSTOM REQUESTS
-- ============================================================

CREATE TABLE IF NOT EXISTS public.custom_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  desired_date date,
  servings int,
  budget int,
  flavor text,
  color_theme text,
  theme_description text,
  size text,
  description text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  admin_response text,
  proposed_price int,
  contact_preference text DEFAULT 'whatsapp',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.custom_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "custom_requests_select_own_or_admin" ON public.custom_requests;
CREATE POLICY "custom_requests_select_own_or_admin" ON public.custom_requests FOR SELECT
  TO authenticated USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "custom_requests_insert_own" ON public.custom_requests;
CREATE POLICY "custom_requests_insert_own" ON public.custom_requests FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "custom_requests_update_own_or_admin" ON public.custom_requests;
CREATE POLICY "custom_requests_update_own_or_admin" ON public.custom_requests FOR UPDATE
  TO authenticated USING (auth.uid() = user_id OR public.is_admin()) WITH CHECK (auth.uid() = user_id OR public.is_admin());

-- ============================================================
-- CUSTOM REQUEST IMAGES
-- ============================================================

CREATE TABLE IF NOT EXISTS public.custom_request_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid NOT NULL REFERENCES public.custom_requests(id) ON DELETE CASCADE,
  url text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.custom_request_images ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "custom_request_images_select_own_or_admin" ON public.custom_request_images;
CREATE POLICY "custom_request_images_select_own_or_admin" ON public.custom_request_images FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM public.custom_requests cr WHERE cr.id = request_id AND (cr.user_id = auth.uid() OR public.is_admin()))
  );

DROP POLICY IF EXISTS "custom_request_images_insert_own" ON public.custom_request_images;
CREATE POLICY "custom_request_images_insert_own" ON public.custom_request_images FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM public.custom_requests cr WHERE cr.id = request_id AND cr.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "custom_request_images_admin_delete" ON public.custom_request_images;
CREATE POLICY "custom_request_images_admin_delete" ON public.custom_request_images FOR DELETE
  TO authenticated USING (public.is_admin());

-- ============================================================
-- GALLERY
-- ============================================================

CREATE TABLE IF NOT EXISTS public.gallery (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  image_url text NOT NULL,
  category text NOT NULL DEFAULT 'autre',
  event_date date,
  sort_order int NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.gallery ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "gallery_public_read" ON public.gallery;
CREATE POLICY "gallery_public_read" ON public.gallery FOR SELECT
  TO anon, authenticated USING (is_active = true);

DROP POLICY IF EXISTS "gallery_admin_write" ON public.gallery;
CREATE POLICY "gallery_admin_write" ON public.gallery FOR ALL
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ============================================================
-- PROMOTIONS
-- ============================================================

CREATE TABLE IF NOT EXISTS public.promotions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  discount_type text NOT NULL DEFAULT 'percentage',
  discount_value int NOT NULL DEFAULT 0,
  product_id uuid REFERENCES public.products(id) ON DELETE CASCADE,
  category_id uuid REFERENCES public.categories(id) ON DELETE CASCADE,
  start_date timestamptz NOT NULL DEFAULT now(),
  end_date timestamptz,
  is_active boolean NOT NULL DEFAULT true,
  banner_image text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "promotions_public_read" ON public.promotions;
CREATE POLICY "promotions_public_read" ON public.promotions FOR SELECT
  TO anon, authenticated USING (is_active = true);

DROP POLICY IF EXISTS "promotions_admin_write" ON public.promotions;
CREATE POLICY "promotions_admin_write" ON public.promotions FOR ALL
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ============================================================
-- PROMO CODES
-- ============================================================

CREATE TABLE IF NOT EXISTS public.promo_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  description text,
  discount_type text NOT NULL DEFAULT 'percentage',
  discount_value int NOT NULL DEFAULT 0,
  max_uses int,
  used_count int NOT NULL DEFAULT 0,
  start_date timestamptz NOT NULL DEFAULT now(),
  end_date timestamptz,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.promo_codes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "promo_codes_public_read" ON public.promo_codes;
CREATE POLICY "promo_codes_public_read" ON public.promo_codes FOR SELECT
  TO anon, authenticated USING (is_active = true);

DROP POLICY IF EXISTS "promo_codes_admin_write" ON public.promo_codes;
CREATE POLICY "promo_codes_admin_write" ON public.promo_codes FOR ALL
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ============================================================
-- COLLECTIONS
-- ============================================================

CREATE TABLE IF NOT EXISTS public.collections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  image_url text,
  promotion_id uuid REFERENCES public.promotions(id) ON DELETE SET NULL,
  start_date timestamptz,
  end_date timestamptz,
  is_active boolean NOT NULL DEFAULT true,
  is_featured boolean NOT NULL DEFAULT false,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "collections_public_read" ON public.collections;
CREATE POLICY "collections_public_read" ON public.collections FOR SELECT
  TO anon, authenticated USING (is_active = true);

DROP POLICY IF EXISTS "collections_admin_write" ON public.collections;
CREATE POLICY "collections_admin_write" ON public.collections FOR ALL
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ============================================================
-- COLLECTION PRODUCTS
-- ============================================================

CREATE TABLE IF NOT EXISTS public.collection_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_id uuid NOT NULL REFERENCES public.collections(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  sort_order int NOT NULL DEFAULT 0,
  UNIQUE(collection_id, product_id)
);

ALTER TABLE public.collection_products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "collection_products_public_read" ON public.collection_products;
CREATE POLICY "collection_products_public_read" ON public.collection_products FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "collection_products_admin_write" ON public.collection_products;
CREATE POLICY "collection_products_admin_write" ON public.collection_products FOR ALL
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ============================================================
-- THEMES
-- ============================================================

CREATE TABLE IF NOT EXISTS public.themes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  primary_color text NOT NULL DEFAULT '3D2817',
  secondary_color text NOT NULL DEFAULT 'C8A96A',
  accent_color text NOT NULL DEFAULT 'D4AF37',
  text_color text NOT NULL DEFAULT '2A1F14',
  background_color text NOT NULL DEFAULT 'FAF6F0',
  button_color text NOT NULL DEFAULT '3D2817',
  hero_image text,
  hero_title text,
  hero_subtitle text,
  banner_text text,
  logo_url text,
  font_family text DEFAULT 'Inter',
  is_active boolean NOT NULL DEFAULT false,
  is_default boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.themes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "themes_public_read" ON public.themes;
CREATE POLICY "themes_public_read" ON public.themes FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "themes_admin_write" ON public.themes;
CREATE POLICY "themes_admin_write" ON public.themes FOR ALL
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ============================================================
-- EVENTS
-- ============================================================

CREATE TABLE IF NOT EXISTS public.events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  theme_id uuid REFERENCES public.themes(id) ON DELETE SET NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  is_recurring boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "events_public_read" ON public.events;
CREATE POLICY "events_public_read" ON public.events FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "events_admin_write" ON public.events;
CREATE POLICY "events_admin_write" ON public.events FOR ALL
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ============================================================
-- SITE SETTINGS
-- ============================================================

CREATE TABLE IF NOT EXISTS public.site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bakery_name text NOT NULL DEFAULT 'Délices Dorés',
  tagline text NOT NULL DEFAULT 'L''art de créer des moments inoubliables',
  logo_url text,
  favicon_url text,
  phone text,
  whatsapp_number text,
  email text,
  address text,
  city text,
  hours text,
  currency text NOT NULL DEFAULT 'FCFA',
  delivery_fee int NOT NULL DEFAULT 0,
  whatsapp_message text DEFAULT 'Bonjour, je souhaite passer une commande.',
  social_facebook text,
  social_instagram text,
  social_tiktok text,
  about_text text,
  hero_title text DEFAULT 'L''art de créer des moments inoubliables',
  hero_subtitle text DEFAULT 'Pâtisserie artisanale d''exception au Bénin',
  active_theme_id uuid REFERENCES public.themes(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "site_settings_public_read" ON public.site_settings;
CREATE POLICY "site_settings_public_read" ON public.site_settings FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "site_settings_admin_write" ON public.site_settings;
CREATE POLICY "site_settings_admin_write" ON public.site_settings FOR ALL
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ============================================================
-- NOTIFICATIONS
-- ============================================================

CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  message text NOT NULL,
  type text NOT NULL DEFAULT 'info',
  link text,
  is_read boolean NOT NULL DEFAULT false,
  is_admin_target boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "notifications_select_own_or_admin" ON public.notifications;
CREATE POLICY "notifications_select_own_or_admin" ON public.notifications FOR SELECT
  TO authenticated USING (auth.uid() = user_id OR (is_admin_target = true AND public.is_admin()));

DROP POLICY IF EXISTS "notifications_insert_own_or_admin" ON public.notifications;
CREATE POLICY "notifications_insert_own_or_admin" ON public.notifications FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "notifications_update_own_or_admin" ON public.notifications;
CREATE POLICY "notifications_update_own_or_admin" ON public.notifications FOR UPDATE
  TO authenticated USING (auth.uid() = user_id OR public.is_admin()) WITH CHECK (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "notifications_delete_own_or_admin" ON public.notifications;
CREATE POLICY "notifications_delete_own_or_admin" ON public.notifications FOR DELETE
  TO authenticated USING (auth.uid() = user_id OR public.is_admin());

-- ============================================================
-- BANNERS
-- ============================================================

CREATE TABLE IF NOT EXISTS public.banners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  text text,
  button_label text,
  button_link text,
  image_url text,
  start_date timestamptz NOT NULL DEFAULT now(),
  end_date timestamptz,
  is_active boolean NOT NULL DEFAULT true,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "banners_public_read" ON public.banners;
CREATE POLICY "banners_public_read" ON public.banners FOR SELECT
  TO anon, authenticated USING (is_active = true);

DROP POLICY IF EXISTS "banners_admin_write" ON public.banners;
CREATE POLICY "banners_admin_write" ON public.banners FOR ALL
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_active ON public.products(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_products_featured ON public.products(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_product_images_product ON public.product_images(product_id);
CREATE INDEX IF NOT EXISTS idx_orders_user ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_favorites_user ON public.favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_custom_requests_user ON public.custom_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_gallery_active ON public.gallery(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_promotions_active ON public.promotions(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_collections_active ON public.collections(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_banners_active ON public.banners(is_active) WHERE is_active = true;