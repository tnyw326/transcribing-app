// Cache Manager Utility
export interface CacheStats {
  hits: number;
  misses: number;
  size: number;
  hitRate: number;
}

export class CacheManager {
  private stats = {
    hits: 0,
    misses: 0
  };

  getStats(): CacheStats {
    const total = this.stats.hits + this.stats.misses;
    return {
      hits: this.stats.hits,
      misses: this.stats.misses,
      size: 0, // Will be set by individual caches
      hitRate: total > 0 ? (this.stats.hits / total) * 100 : 0
    };
  }

  recordHit(): void {
    this.stats.hits++;
  }

  recordMiss(): void {
    this.stats.misses++;
  }

  logStats(): void {
    const stats = this.getStats();
    console.log('📊 Cache Statistics:');
    console.log(`   Hits: ${stats.hits}`);
    console.log(`   Misses: ${stats.misses}`);
    console.log(`   Hit Rate: ${stats.hitRate.toFixed(2)}%`);
  }
}

// Global cache manager instance
export const cacheManager = new CacheManager();

// Simple in-memory cache for process results
const processCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

// Check if cache entry is still valid
const isCacheValid = (timestamp: number): boolean => {
  return Date.now() - timestamp < CACHE_TTL;
};

// Get value from cache
export async function kvGet(key: string): Promise<any | null> {
  const cached = processCache.get(key);
  if (cached && isCacheValid(cached.timestamp)) {
    console.log(`🎯 Process Cache HIT for key: ${key}`);
    cacheManager.recordHit();
    return cached.data;
  }
  if (cached) {
    console.log(`⏰ Process Cache EXPIRED for key: ${key}`);
    processCache.delete(key);
  }
  console.log(`❌ Process Cache MISS for key: ${key}`);
  cacheManager.recordMiss();
  return null;
}

// Set value in cache
export async function kvSet(key: string, value: any): Promise<void> {
  processCache.set(key, { data: value, timestamp: Date.now() });
  console.log(`💾 Cached process result for key: ${key}`);
} 