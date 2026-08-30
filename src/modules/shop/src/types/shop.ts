/** Shop module domain types. */

export type ProductCategory =
  | 'Herbal Supplements'
  | 'Oils'
  | 'Personal Care'
  | 'Ayurvedic Medicines'
  | 'Teas & Tonics'
  | 'Fitness'
  | 'Wellness Kits'
  | 'Other';

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  brand: string;
  price: number;
  /** Original price pre-discount (for strikethrough). */
  mrp: number;
  rating: number;
  reviewsCount: number;
  stock: number;
  description: string;
  tags: string[];
  imageUrl: string | null;
  herbal: boolean;
  weight: string;
  createdAt: number;
}

export type SortOption = 'relevance' | 'price-asc' | 'price-desc' | 'rating' | 'newest';

export interface ProductFilters {
  query?: string;
  categories?: ProductCategory[];
  brands?: string[];
  minPrice?: number | null;
  maxPrice?: number | null;
  minRating?: number | null;
  inStock?: boolean;
  herbalOnly?: boolean;
}

export interface ProductListResult {
  items: Product[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface CartItem {
  productId: string;
  quantity: number;
}

export interface CartState {
  items: CartItem[];
  updatedAt: number;
}

export interface WishlistState {
  productIds: string[];
}

export interface CheckoutSummary {
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  total: number;
  itemCount: number;
}