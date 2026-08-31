type StorageLike = {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
  removeItem: (key: string) => Promise<void>;
};

let nativeStorage: StorageLike | null = null;
try {
  const AsyncStorage = require('@react-native-async-storage/async-storage').default;
  nativeStorage = AsyncStorage;
} catch {
  nativeStorage = null;
}
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

  setBackend(backend: StorageLike | null): void {
    this.backend = backend ?? this.memoryBackend;
  }

  async getItem(key: string): Promise<string | null> {
    try {
      return await this.backend.getItem(this.prefix(key));
    } catch {
      return null;
    }
  }

  async setItem(key: string, value: string): Promise<void> {
    try {
      await this.backend.setItem(this.prefix(key), value);
    } catch {
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      await this.backend.removeItem(this.prefix(key));
    } catch {
    }
  }

  async getJSON<T>(key: string): Promise<T | null> {
    const raw = await this.getItem(key);
    if (raw == null) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  }

  async setJSON<T>(key: string, value: T): Promise<void> {
    await this.setItem(key, JSON.stringify(value));
  }

  async remove(key: string): Promise<void> {
    await this.removeItem(key);
  }

  async clearAll(): Promise<void> {
    if (this.backend === this.memoryBackend) {
      (this as unknown as { memoryBackend: StorageLike }).memoryBackend =
        createInMemoryStorage();
    }
  }

  private prefix(key: string): string {
    return `@ayurveda/${key}`;
  }
}
export const storage = new StorageService();
export type { StorageLike };
export default storage;
