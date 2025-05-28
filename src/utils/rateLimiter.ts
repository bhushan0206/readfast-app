import { create } from 'zustand';

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

interface RateLimitStore {
  limits: Record<string, RateLimitEntry>;
  checkLimit: (key: string, maxAttempts: number, windowMs: number) => boolean;
  resetLimit: (key: string) => void;
  cleanupExpired: () => void;
}

export const useRateLimitStore = create<RateLimitStore>((set, get) => ({
  limits: {},

  checkLimit: (key: string, maxAttempts: number, windowMs: number) => {
    const now = Date.now();
    const { limits } = get();
    const entry = limits[key];

    // Clean up expired entries periodically
    if (Math.random() < 0.1) {
      get().cleanupExpired();
    }

    // No existing entry, create new one
    if (!entry) {
      set({
        limits: {
          ...limits,
          [key]: { count: 1, resetTime: now + windowMs }
        }
      });
      return true;
    }

    // Entry expired, reset
    if (now > entry.resetTime) {
      set({
        limits: {
          ...limits,
          [key]: { count: 1, resetTime: now + windowMs }
        }
      });
      return true;
    }

    // Entry still valid, check count
    if (entry.count >= maxAttempts) {
      return false; // Rate limit exceeded
    }

    // Increment count
    set({
      limits: {
        ...limits,
        [key]: { ...entry, count: entry.count + 1 }
      }
    });
    return true;
  },

  resetLimit: (key: string) => {
    const { limits } = get();
    const { [key]: removed, ...remaining } = limits;
    set({ limits: remaining });
  },

  cleanupExpired: () => {
    const now = Date.now();
    const { limits } = get();
    const validLimits: Record<string, RateLimitEntry> = {};

    Object.entries(limits).forEach(([key, entry]) => {
      if (now <= entry.resetTime) {
        validLimits[key] = entry;
      }
    });

    set({ limits: validLimits });
  }
}));

// Rate limiting utility functions
export class RateLimiter {
  private static getClientKey(identifier: string, action: string): string {
    return `${identifier}:${action}`;
  }

  static checkAuthLimit(userId: string): boolean {
    const key = this.getClientKey(userId, 'auth');
    return useRateLimitStore.getState().checkLimit(key, 5, 15 * 60 * 1000); // 5 attempts per 15 minutes
  }

  static checkReadingSessionLimit(userId: string): boolean {
    const key = this.getClientKey(userId, 'reading');
    return useRateLimitStore.getState().checkLimit(key, 10, 60 * 1000); // 10 sessions per minute
  }

  static checkFileUploadLimit(userId: string): boolean {
    const key = this.getClientKey(userId, 'upload');
    return useRateLimitStore.getState().checkLimit(key, 5, 60 * 60 * 1000); // 5 uploads per hour
  }

  static checkAPILimit(userId: string, endpoint: string): boolean {
    const key = this.getClientKey(userId, endpoint);
    return useRateLimitStore.getState().checkLimit(key, 100, 60 * 1000); // 100 requests per minute
  }

  static resetLimit(userId: string, action: string): void {
    const key = this.getClientKey(userId, action);
    useRateLimitStore.getState().resetLimit(key);
  }
}

export default RateLimiter;