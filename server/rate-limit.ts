/**
 * Simple in-memory rate limiter middleware
 * Tracks requests per IP address
 */

interface RateLimitStore {
  [key: string]: { count: number; resetTime: number };
}

const store: RateLimitStore = {};

/**
 * Create rate limiter middleware
 * @param maxRequests - Maximum number of requests allowed
 * @param windowMs - Time window in milliseconds
 * @param skip - Function to skip rate limiting for certain requests
 */
export function rateLimit(
  maxRequests: number = 100,
  windowMs: number = 60 * 1000,
  skip?: (req: any) => boolean
) {
  return (req: any, res: any, next: any) => {
    // Skip rate limiting if condition is met
    if (skip && skip(req)) {
      return next();
    }

    const ip = req.ip || req.connection.remoteAddress || "unknown";
    const now = Date.now();

    // Initialize or reset the counter if needed
    if (!store[ip] || store[ip].resetTime < now) {
      store[ip] = { count: 0, resetTime: now + windowMs };
    }

    // Increment the counter
    store[ip].count++;

    // Check if limit exceeded
    if (store[ip].count > maxRequests) {
      return res.status(429).json({
        message: "Too many requests, please try again later",
        retryAfter: Math.ceil((store[ip].resetTime - now) / 1000),
      });
    }

    // Add rate limit info to response headers
    res.setHeader("X-RateLimit-Limit", maxRequests);
    res.setHeader("X-RateLimit-Remaining", maxRequests - store[ip].count);
    res.setHeader("X-RateLimit-Reset", store[ip].resetTime);

    next();
  };
}

/**
 * Clean up old entries periodically
 */
export function startRateLimitCleanup(intervalMs: number = 5 * 60 * 1000) {
  setInterval(() => {
    const now = Date.now();
    Object.keys(store).forEach((key) => {
      if (store[key].resetTime < now) {
        delete store[key];
      }
    });
  }, intervalMs);
}
