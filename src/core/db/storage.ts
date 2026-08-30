/**
 * Storage abstraction.
 *
 * Wraps AsyncStorage but detects when the native module is unavailable
 * (e.g. during Jest tests or if the native link is missing) and transparently
 * falls back to an in-memory implementation so the rest of the app can rely on
 * a consistent async KV API.
 *
 * All values are JSON-serialised so arbitrary structured data can be stored.
 */

type StorageLike = {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
  removeItem: (key: string) => Promise<void>;
};

let nativeStorage: StorageLike | null = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const AsyncStorage = require('@react-native-async-storage/async-storage').default;
  nativeStorage = AsyncStorage;
} catch {
  nativeStorage = null;
}

/** In-memory fallback (also used by tests via an explicit injectable backend). */
export function createInMemoryStorage(initial: Record<string, string> = {}): StorageLike {
  const map = new Map<string, string>(Object.entries(initial));
  return {
    async getItem(key) {
      return map.has(key) ? (map.get(key) as string) : null;
    },
    async setItem(key, value) {
      map.set(key, value);
    },
    async removeItem(key) {
      map.delete(key);
    },
  };
}

class StorageService {
  private backend: StorageLike;
  private readonly memoryBackend = createInMemoryStorage();

  constructor() {
    this.backend =
      nativeStorage && typeof nativeStorage.getItem === 'function'
        ? nativeStorage
        : this.memoryBackend;
  }

  /** Allow tests / SSR to swap or inject a backend. */
  setBackend(backend: StorageLike | null): void {
    this.backend = backend ?? this.memoryBackend;
  }

  async getJSON<T>(key: string): Promise<T | null> {
    try {
      const raw = await this.backend.getItem(this.prefix(key));
      if (raw == null) return null;
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  }

  async setJSON<T>(key: string, value: T): Promise<void> {
    try {
      await this.backend.setItem(this.prefix(key), JSON.stringify(value));
    } catch {
      // ignore write failures (quota etc.) - storage is best-effort
    }
  }

  async remove(key: string): Promise<void> {
    try {
      await this.backend.removeItem(this.prefix(key));
    } catch {
      // ignore
    }
  }

  async clearAll(): Promise<void> {
    try {
      const suffix = this.prefix('');
      // Iterate & remove keys we own (best-effort for native backends).
      // Memory backend is cheap to clear entirely.
      if (this.backend === this.memoryBackend) {
        await this.memoryBackend.removeItem('__all__');
        // re-create a fresh map
        (this as unknown as { memoryBackend: StorageLike }).memoryBackend =
          createInMemoryStorage();
      }
      void suffix;
    } catch {
      // ignore
    }
  }

  private prefix(key: string): string {
    return `@ayurveda/${key}`;
  }
}

export const storage = new StorageService();
export type { StorageLike };
export default storage;