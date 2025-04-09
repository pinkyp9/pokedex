// lib/cache.ts
// A simple in-memory cache system for Pokémon data

type CacheEntry<T> = {
    data: T;
    timestamp: number;
  };
  
  class PokemonCache {
    private cache: Map<string, CacheEntry<any>> = new Map();
    private TTL: number = 24 * 60 * 60 * 1000; // 24 hours by default
  
    constructor(ttl?: number) {
      if (ttl) {
        this.TTL = ttl;
      }
    }
  
    get<T>(key: string): T | null {
      const entry = this.cache.get(key);
      
      if (!entry) {
        return null;
      }
      
      const isExpired = Date.now() - entry.timestamp > this.TTL;
      
      if (isExpired) {
        this.cache.delete(key);
        return null;
      }
      
      return entry.data;
    }
  
    set<T>(key: string, data: T): void {
      this.cache.set(key, {
        data,
        timestamp: Date.now(),
      });
    }
  
    clear(): void {
      this.cache.clear();
    }
  }
  
  // Create and export singleton instances for different cache purposes
  export const pokemonDataCache = new PokemonCache();
  export const pokemonNamesCache = new PokemonCache();