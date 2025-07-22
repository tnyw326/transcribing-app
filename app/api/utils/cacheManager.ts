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