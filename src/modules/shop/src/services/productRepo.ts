
import {
  Product,
  ProductCategory,
  ProductFilters,
  ProductListResult,
  SortOption,
} from '../types/shop';
import { PRODUCT_BRANDS, SEEDS, mulberry32 } from '../../../../core/db/mock/names';

export const PRODUCT_COUNT = 20000;

const CATEGORIES: ProductCategory[] = [
  'Herbal Supplements', 'Oils', 'Personal Care', 'Ayurvedic Medicines',
  'Teas & Tonics', 'Fitness', 'Wellness Kits', 'Other',
];
const NAMES = [
  'Ashwagandha Capsules', 'Triphala Powder', 'Brahmi Oil', 'Chyawanprash',
  'Amla Juice', 'Tulsi Drops', 'Shilajit Resin', 'Neem Tablets',
  'Guduchi Extract', 'Shatavari Syrup', 'Kesar Face Cream', 'Aloe Vera Gel',
  'Licorice Tea', 'Cardamom Blend', 'Patanjali Kesav', 'Kumkumadi Oil',
  'Mulethi Powder', 'Haritaki Churna', 'Safed Musli', 'Giloy Stem',
];
const WEIGHTS = ['30g', '60g', '120g', '250ml', '500ml', '1kg', '10 tablets', '30 tablets', '60 tablets'];

const productCache = new Map<number, Product>();

export function getProductByRank(rank: number): Product {
  const cached = productCache.get(rank);
  if (cached) return cached;
  const rng = mulberry32(SEEDS.products + rank);
  const category = CATEGORIES[Math.floor(rng() * CATEGORIES.length)];
  const base = NAMES[Math.floor(rng() * NAMES.length)];
  const name = category === 'Personal Care' ? `${base} ${rank % 40}` : `${base} ${(rank % 60) + 1}`;
  const price = 50 + Math.floor(rng() * 90) * 10;
  const mrp = Math.round((price * (1.2 + rng() * 0.5)) / 10) * 10;
  const product: Product = {
    id: `prd-${rank + 1}`,
    name,
    category,
    brand: PRODUCT_BRANDS[Math.floor(rng() * PRODUCT_BRANDS.length)],
    price,
    mrp,
    rating: Math.round((3.2 + rng() * 1.7) * 10) / 10,
    reviewsCount: Math.floor(rng() * 1200),
    stock: rng() < 0.12 ? 0 : 5 + Math.floor(rng() * 600),
    description:
      `${name} — a premium Ayurvedic ${category.toLowerCase()} product crafted from natural herbs. ` +
      `Supports holistic wellness and daily vitality.`,
    tags: [category, rng() < 0.5 ? 'Organic' : 'Natural', rng() < 0.4 ? 'Herbal' : 'Pure'],
    imageUrl: null,
    herbal: rng() < 0.8,
    weight: WEIGHTS[Math.floor(rng() * WEIGHTS.length)],
    createdAt: Date.now() - Math.floor(rng() * 365 * 86400000),
  };
  productCache.set(rank, product);
  return product;
}

export function getProductById(id: string): Product | null {
  const m = /^prd-(\d+)$/.exec(id);
  if (!m) return null;
  const rank = Number(m[1]) - 1;
  if (rank < 0 || rank >= PRODUCT_COUNT) return null;
  return getProductByRank(rank);
}

export function getProductsPage(
  page: number,
  pageSize: number,
  filters: ProductFilters = {},
  sort: SortOption = 'relevance',
  infinite = false,
): ProductListResult {

  const matchingRanks: number[] = [];
  for (let i = 0; i < PRODUCT_COUNT; i++) {
    if (matchesProduct(getProductByRank(i), filters)) matchingRanks.push(i);
  }

  if (sort === 'price-asc') matchingRanks.sort((a, b) => getProductByRank(a).price - getProductByRank(b).price);
  else if (sort === 'price-desc') matchingRanks.sort((a, b) => getProductByRank(b).price - getProductByRank(a).price);
  else if (sort === 'rating') matchingRanks.sort((a, b) => getProductByRank(b).rating - getProductByRank(a).rating);
  else if (sort === 'newest') matchingRanks.sort((a, b) => getProductByRank(b).createdAt - getProductByRank(a).createdAt);

  const start = (page - 1) * pageSize;
  const items = matchingRanks.slice(start, start + pageSize).map(r => getProductByRank(r));
  const totalMatching = matchingRanks.length;
  const end = start + pageSize;
  return {
    items,
    total: totalMatching,
    page,
    pageSize,
    hasMore: infinite ? end < totalMatching : true,
  };
}

function matchesProduct(p: Product, f: ProductFilters): boolean {
  if (f.query) {
    const q = f.query.toLowerCase().trim();
    if (
      !p.name.toLowerCase().includes(q) &&
      !p.brand.toLowerCase().includes(q) &&
      !p.category.toLowerCase().includes(q)
    ) {
      return false;
    }
  }
  if (f.categories?.length && !f.categories.includes(p.category)) return false;
  if (f.brands?.length && !f.brands.includes(p.brand)) return false;
  if (f.minPrice != null && p.price < f.minPrice) return false;
  if (f.maxPrice != null && p.price > f.maxPrice) return false;
  if (f.minRating != null && p.rating < f.minRating) return false;
  if (f.inStock && p.stock <= 0) return false;
  if (f.herbalOnly && !p.herbal) return false;
  return true;
}

export function getAllBrands(): string[] {
  return PRODUCT_BRANDS;
}

export { CATEGORIES as PRODUCT_CATEGORIES };
