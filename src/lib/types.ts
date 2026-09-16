export type UserRole = 'customer' | 'admin';

export interface Profile {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  neighborhood: string | null;
  avatar_url: string | null;
  notes: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

export interface Product {
  id: string;
  category_id: string | null;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  compare_at_price: number | null;
  prep_time_hours: number;
  is_available: boolean;
  is_featured: boolean;
  is_active: boolean;
  stock: number | null;
  sort_order: number;
  tags: string[];
  created_at: string;
  updated_at: string;
  category?: Category | null;
  product_images?: ProductImage[];
}

export interface ProductImage {
  id: string;
  product_id: string;
  url: string;
  alt: string | null;
  sort_order: number;
  created_at: string;
}

export interface Favorite {
  id: string;
  user_id: string;
  product_id: string;
  created_at: string;
  product?: Product;
}

export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled' | 'refused';

export interface Order {
  id: string;
  order_number: string;
  user_id: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  delivery_address: string | null;
  delivery_city: string | null;
  delivery_method: string;
  delivery_fee: number;
  desired_date: string | null;
  desired_time: string | null;
  instructions: string | null;
  subtotal: number;
  discount: number;
  total: number;
  promo_code: string | null;
  status: OrderStatus;
  payment_method: string;
  payment_status: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
  order_items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  product_image: string | null;
  unit_price: number;
  quantity: number;
  subtotal: number;
  created_at: string;
}

export type CustomRequestStatus = 'pending' | 'reviewing' | 'quoted' | 'accepted' | 'declined';

export interface CustomRequest {
  id: string;
  user_id: string;
  event_type: string;
  desired_date: string | null;
  servings: number | null;
  budget: number | null;
  flavor: string | null;
  color_theme: string | null;
  theme_description: string | null;
  size: string | null;
  description: string;
  status: CustomRequestStatus;
  admin_response: string | null;
  proposed_price: number | null;
  contact_preference: string;
  created_at: string;
  updated_at: string;
  custom_request_images?: CustomRequestImage[];
}

export interface CustomRequestImage {
  id: string;
  request_id: string;
  url: string;
  created_at: string;
}

export interface GalleryItem {
  id: string;
  title: string;
  description: string | null;
  image_url: string;
  category: string;
  event_date: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

export interface Promotion {
  id: string;
  title: string;
  description: string | null;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  product_id: string | null;
  category_id: string | null;
  start_date: string;
  end_date: string | null;
  is_active: boolean;
  banner_image: string | null;
  created_at: string;
}

export interface PromoCode {
  id: string;
  code: string;
  description: string | null;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  max_uses: number | null;
  used_count: number;
  start_date: string;
  end_date: string | null;
  is_active: boolean;
  created_at: string;
}

export interface Collection {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  promotion_id: string | null;
  start_date: string | null;
  end_date: string | null;
  is_active: boolean;
  is_featured: boolean;
  sort_order: number;
  created_at: string;
  collection_products?: CollectionProduct[];
}

export interface CollectionProduct {
  id: string;
  collection_id: string;
  product_id: string;
  sort_order: number;
  product?: Product;
}

export interface Theme {
  id: string;
  name: string;
  description: string | null;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  text_color: string;
  background_color: string;
  button_color: string;
  hero_image: string | null;
  hero_title: string | null;
  hero_subtitle: string | null;
  banner_text: string | null;
  logo_url: string | null;
  font_family: string | null;
  is_active: boolean;
  is_default: boolean;
  created_at: string;
}

export interface Event {
  id: string;
  name: string;
  description: string | null;
  theme_id: string | null;
  start_date: string;
  end_date: string;
  is_recurring: boolean;
  is_active: boolean;
  created_at: string;
  theme?: Theme | null;
}

export interface SiteSettings {
  id: string;
  bakery_name: string;
  tagline: string;
  logo_url: string | null;
  favicon_url: string | null;
  phone: string | null;
  whatsapp_number: string | null;
  email: string | null;
  address: string | null;
  city: string | null;
  hours: string | null;
  currency: string;
  delivery_fee: number;
  whatsapp_message: string;
  social_facebook: string | null;
  social_instagram: string | null;
  social_tiktok: string | null;
  about_text: string | null;
  hero_title: string;
  hero_subtitle: string;
  active_theme_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  user_id: string | null;
  title: string;
  message: string;
  type: string;
  link: string | null;
  is_read: boolean;
  is_admin_target: boolean;
  created_at: string;
}

export interface Banner {
  id: string;
  title: string;
  text: string | null;
  button_label: string | null;
  button_link: string | null;
  image_url: string | null;
  start_date: string;
  end_date: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}
