export interface SiteSettings {
  brand_name: string;
  slogan: string;
  logo: string | null;
  about: string;
  phone: string;
  email: string;
  address: string;
  instagram: string;
  telegram: string;
  whatsapp: string;
  linkedin: string;
  hero_badge: string;
  hero_title_line1: string;
  hero_title_line2: string;
  hero_subtitle: string;
  hero_bg_image: string | null;
  hero_product_image: string | null;
  hero_cta_label: string | null;
  hero_cta_link: string | null;
}

export interface CategorySubItem {
  name: string;
  link: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  image: string | null;
  product_count: number;
  sub_items: CategorySubItem[];
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  short_description: string;
  description?: string;
  image: string | null;
  category: number | Category;
  category_name?: string;
  is_featured: boolean;
  is_active: boolean;
  is_purchasable: boolean;
  price: number;
  discount_price: number;
  stock: number;
  features?: string[];
  gallery?: { id: number; image: string; alt: string }[];
}

export interface Paginated<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface HeroSlide {
  id: number;
  title: string;
  subtitle: string;
  image: string | null;
  cta_label: string;
  cta_link: string;
}

export interface ServiceRequestStatus {
  tracking_code: string;
  full_name: string;
  request_type_display: string;
  product_name: string;
  status: string;
  status_display: string;
  admin_note: string;
  created_at: string;
  updated_at: string;
}

export interface CartItem {
  id: number;
  product: number;
  product_name: string;
  product_price: number;
  product_discount_price: number;
  product_image: string | null;
  quantity: number;
  subtotal: number;
  max_stock: number;
}

export interface Cart {
  id: number;
  items: CartItem[];
  total: number;
  items_count: number;
}

export interface OrderItem {
  id: number;
  product: number;
  product_name: string;
  product_image: string | null;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

export interface Order {
  id: number;
  full_name: string;
  phone: string;
  address: string;
  postal_code: string;
  status: string;
  status_display: string;
  total: number;
  ref_id: string;
  tracking_code: string;
  items: OrderItem[];
  created_at: string;
}

export interface Payment {
  id: number;
  order: number;
  amount: number;
  gateway: string;
  gateway_display: string;
  status: string;
  status_display: string;
  ref_id: string;
  authority: string;
  created_at: string;
}

export interface CreateOrderData {
  full_name: string;
  phone: string;
  address: string;
  postal_code?: string;
}
