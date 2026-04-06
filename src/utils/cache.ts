import { CacheEntry } from '../types';

/**
 * Simple in-memory cache with TTL support.
 * Reduces redundant API calls to package registries.
 */
export class Cache {
  private store = new Map<string, CacheEntry<any>>();
  private defaultTTL: number;

  constructor(defaultTTLSeconds: number = 3600) {
    this.defaultTTL = defaultTTLSeconds * 1000;
  }

  get<T>(key: string): T | null {
    const entry = this.store.get(key);
    if (!entry) { return null; }

    if (Date.now() - entry.timestamp > entry.ttl) {
      this.store.delete(key);
      return null;
    }

    return entry.data as T;
  }

  set<T>(key: string, data: T, ttlSeconds?: number): void {
    this.store.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlSeconds ? ttlSeconds * 1000 : this.defaultTTL,
    });
  }

  clear(): void {
    this.store.clear();
  }

  size(): number {
    return this.store.size;
  }
}

// Singleton cache instance shared across scanners
export const globalCache = new Cache(3600);
