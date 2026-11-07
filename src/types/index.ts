import type { ORDER_STATUS_LABELS, PAYMENT_LABELS, REVIEW_STATUS_LABELS } from "@/config/site";

export type OrderStatus = keyof typeof ORDER_STATUS_LABELS;
export type PaymentMethod = keyof typeof PAYMENT_LABELS;
export type ReviewStatus = keyof typeof REVIEW_STATUS_LABELS;
export type NotifyStatus = "pending" | "sent" | "failed" | "disabled";

export interface StoreSettings {
  name: string;
  phone: string;
  address: string;
  addressNote: string | null;
  postalCode: string | null;
  hoursText: string;
  openTime: string;
  closeTime: string;
  orderingEnabled: boolean;
  combosEnabled: boolean;
}

export interface Category {
  id: string;
  slug: string;
  name: string;
  sort_order: number;
  is_active: boolean;
}

export interface ProductOption {
  id: string;
  product_id: string;
  name: string;
  price: number;
  is_active: boolean;
  sort_order: number;
}

export interface Product {
  id: string;
  category_id: string;
  name: string;
  description: string | null;
  weight: string | null;
  price: number;
  image_url: string | null;
  is_active: boolean;
  is_available: boolean;
  is_featured: boolean;
  needs_verification: boolean;
  sort_order: number;
  product_options: ProductOption[];
}

export interface MenuCategory extends Category {
  products: Product[];
}

export interface Review {
  id: string;
  author_name: string;
  rating: number;
  body: string;
  published_at: string | null;
}

export interface ReviewSummary {
  count: number;
  average: number;
}

export interface OrderItemRow {
  id: string;
  product_id: string | null;
  product_name: string;
  unit_price: number;
  options: { id: string; name: string; price: number }[];
  options_price: number;
  quantity: number;
  line_total: number;
}

export interface OrderRow {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  comment: string | null;
  payment_method: PaymentMethod;
  status: OrderStatus;
  is_paid: boolean;
  total: number;
  notify_status: NotifyStatus;
  notify_attempts: number;
  notify_error: string | null;
  notified_at: string | null;
  created_at: string;
}
