import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { storage } from '../../../../core/db/storage';

interface WishlistState {
  productIds: string[];
  toggle: (productId: string) => void;
  remove: (productId: string) => void;
}

/** Persisted wishlist — pure local state. */
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
      remove: productId =>
        set(state => ({ productIds: state.productIds.filter(id => id !== productId) })),
    }),
    { name: 'wishlist-store', storage: createJSONStorage(() => storage as never) },
  ),
);

/** Selector: is a given product currently wished. */
export function isWished(productId: string): boolean {
  return useWishlistStore.getState().productIds.includes(productId);
}

export default useWishlistStore;