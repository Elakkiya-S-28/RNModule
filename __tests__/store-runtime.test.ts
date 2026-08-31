import { useCartStore } from '../src/modules/shop/src/store/cartStore';
import { useWishlistStore } from '../src/modules/shop/src/store/wishlistStore';
import { storage } from '../src/core/db/storage';

beforeEach(async () => {
  await storage.clearAll();
  useCartStore.setState({ items: [] });
  useWishlistStore.setState({ productIds: [] });
});

test('add to cart from empty', () => {
  const c = useCartStore.getState();
  expect(typeof c.addItem).toBe('function');
  c.addItem('prd-1', 1);
  expect(useCartStore.getState().items).toEqual([{ productId: 'prd-1', quantity: 1 }]);
});

test('increment and decrement quantity stay valid', () => {
  const s = useCartStore.getState();
  s.addItem('prd-1', 1);
  s.addItem('prd-1', 1);
  expect(useCartStore.getState().items[0].quantity).toBe(2);
  s.updateQuantity('prd-1', 1);
  expect(useCartStore.getState().items[0].quantity).toBe(1);
  s.updateQuantity('prd-1', 0);
  expect(useCartStore.getState().items).toEqual([]);
});

test('wishlist toggle adds and removes', () => {
  const w = useWishlistStore.getState();
  expect(typeof w.toggle).toBe('function');
  expect(typeof w.remove).toBe('function');
  w.toggle('prd-2');
  expect(useWishlistStore.getState().productIds).toContain('prd-2');
  w.toggle('prd-2');
  expect(useWishlistStore.getState().productIds).not.toContain('prd-2');
});

test('removeItem clears a cart entry', () => {
  const s = useCartStore.getState();
  s.addItem('prd-3', 2);
  s.removeItem('prd-3');
  expect(useCartStore.getState().items).toEqual([]);
});
