import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { storage } from '../../../../core/db/storage';

export interface CartItem {
  productId: string;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  addItem: (productId: string, qty?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, qty: number) => void;
  clear: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    set => ({
      items: [],
      addItem: (productId, qty = 1) =>
        set(state => {
          const existing = state.items.find(i => i.productId === productId);
          if (existing) {
            return {
              items: state.items.map(i =>
                i.productId === productId ? { ...i, quantity: i.quantity + qty } : i,
              ),
            };
          }
          return { items: [...state.items, { productId, quantity: qty }] };
        }),
      removeItem: productId =>
        set(state => ({ items: state.items.filter(i => i.productId !== productId) })),
      updateQuantity: (productId, qty) =>
        set(state => ({
          items:
            qty <= 0
              ? state.items.filter(i => i.productId !== productId)
              : state.items.map(i => (i.productId === productId ? { ...i, quantity: qty } : i)),
        })),
      clear: () => set({ items: [] }),
    }),
    { name: 'cart-store', storage: createJSONStorage(() => storage as never) },
  ),
);

export function selectCartCount(items: CartItem[]): number {
  return items.reduce((sum, i) => sum + i.quantity, 0);
}

export function selectCartLinePrice(items: CartItem[], price: number): number {
  return items.reduce((sum, i) => sum + i.quantity * price, 0);
}
