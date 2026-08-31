import { create } from 'zustand';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';

interface ConnectivityState {
  isConnected: boolean;
  isInternetReachable: boolean | null;
  queued: number;
  syncing: boolean;
  lastSyncedAt: number | null;
  initialize: () => () => void;
  setQueried: (n: number) => void;
  setSyncing: (b: boolean) => void;
  connect: () => void;
  disconnect: () => void;
}

export const useConnectivityStore = create<ConnectivityState>(set => ({
  isConnected: true,
  isInternetReachable: null,
  queued: 0,
  syncing: false,
  lastSyncedAt: null,
  initialize: () => {
    const unsub = NetInfo.addEventListener((state: NetInfoState) => {
      const isConnected = !!state.isConnected;
      const isInternetReachable = state.isInternetReachable;
      set(prev => {
        const changed =
          prev.isConnected !== isConnected ||
          prev.isInternetReachable !== isInternetReachable;
        return changed ? { isConnected, isInternetReachable } : prev;
      });
    });
    return unsub;
  },
  setQueried: queued => set({ queued }),
  setSyncing: syncing => set({ syncing }),
  connect: () => set({ isConnected: true, isInternetReachable: true }),
  disconnect: () => set({ isConnected: false, isInternetReachable: false }),
}));

export function useIsOnline(): boolean {
  return useConnectivityStore(
    s => s.isConnected && s.isInternetReachable !== false,
  );
}

export default useConnectivityStore;
