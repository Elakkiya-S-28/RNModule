import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { storage } from '../../../../core/db/storage';

interface WishlistState {
  productIds: string[];
  toggle: (productId: string) => void;
  add: (productId: string) => void;
  remove: (productId: string) => void;
  clear: () => void;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    set => ({
      productIds: [],
      toggle: productId =>
        set(state => ({
          productIds: state.productIds.includes(productId)
            ? state.productIds.filter(id => id !== productId)
            : [...state.productIds, productId],
        })),
      add: productId =>
        set(state =>
          state.productIds.includes(productId)
            ? state
            : { productIds: [...state.productIds, productId] },
        ),
      remove: productId =>
        set(state => ({ productIds: state.productIds.filter(id => id !== productId) })),
      clear: () => set({ productIds: [] }),
    }),
    { name: 'wishlist-store', storage: createJSONStorage(() => storage as never) },
  ),
);

export function useWishlistProducts(): string[] {
  return useWishlistStore(s => s.productIds);
}

export function isWished(productId: string): boolean {
  return useWishlistStore.getState().productIds.includes(productId);
}

export default useWishlistStore;
