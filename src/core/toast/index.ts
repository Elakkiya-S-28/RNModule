import { create } from 'zustand';

export type ToastKind = 'success' | 'error' | 'info' | 'warning';

export interface ToastItem {
  id: string;
  kind: ToastKind;
  message: string;

  title?: string;
  durationMs: number;
}

interface ToastState {
  toasts: ToastItem[];
  show: (t: Omit<ToastItem, 'id' | 'durationMs'> & { durationMs?: number }) => void;
  dismiss: (id: string) => void;
  clear: () => void;
}

let counter = 0;
const DEFAULT_DURATION = 3200;

export const useToastStore = create<ToastState>(set => ({
  toasts: [],
  show: t => {
    const id = `${Date.now()}-${counter++}`;
    const toast: ToastItem = { id, durationMs: DEFAULT_DURATION, ...t };
    set(state => ({ toasts: [...state.toasts, toast] }));
    if (toast.durationMs > 0) {
      setTimeout(() => {
        set(state => ({ toasts: state.toasts.filter(x => x.id !== id) }));
      }, toast.durationMs);
    }
  },
  dismiss: id => set(state => ({ toasts: state.toasts.filter(x => x.id !== id) })),
  clear: () => set({ toasts: [] }),
}));

export const toast = {
  success: (message: string, title?: string) =>
    useToastStore.getState().show({ kind: 'success', message, title }),
  error: (message: string, title?: string) =>
    useToastStore.getState().show({ kind: 'error', message, title }),
  info: (message: string, title?: string) =>
    useToastStore.getState().show({ kind: 'info', message, title }),
  warning: (message: string, title?: string) =>
    useToastStore.getState().show({ kind: 'warning', message, title }),
};

export default useToastStore;
