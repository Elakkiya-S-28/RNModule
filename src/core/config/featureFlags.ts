import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { storage } from '../db/storage';

export type FlagKey =
  | 'shop.checkout'
  | 'consult.darkModeButton'
  | 'health.attachmentPreview'
  | 'consultation.cancelFlow'
  | 'shop.recommendations';

interface FlagDef {
  key: FlagKey;
  default: boolean;
  description: string;
}

export const FLAG_REGISTRY: FlagDef[] = [
  { key: 'shop.checkout', default: true, description: 'Enable cart checkout' },
  { key: 'consultation.cancelFlow', default: true, description: 'Enable cancel-booking flow' },
  { key: 'shop.recommendations', default: false, description: 'Enable product recommendations (staged)' },
  { key: 'consult.darkModeButton', default: true, description: 'Toggle button for dark mode' },
  { key: 'health.attachmentPreview', default: true, description: 'Attachment thumbnails in records' },
];

const defaults = FLAG_REGISTRY.reduce(
  (acc, f) => ({ ...acc, [f.key]: f.default }),
  {} as Record<FlagKey, boolean>,
);

interface FlagState {
  flags: Record<FlagKey, boolean>;
  setEnabled: (key: FlagKey, value: boolean) => void;
}

export const useFeatureFlags = create<FlagState>()(
  persist(
    set => ({
      flags: defaults,
      setEnabled: (key, value) =>
        set(state => ({ flags: { ...state.flags, [key]: value } })),
    }),
    { name: 'feature-flags', storage: createJSONStorage(() => storage as never) },
  ),
);

export function isFeatureEnabled(key: FlagKey): boolean {
  return useFeatureFlags.getState().flags[key];
}

export default useFeatureFlags;
