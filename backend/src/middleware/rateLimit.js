// Simple rate limiting without express-rate-limit for now
const rateLimitStore = new Map()

const createRateLimiter = (options = {}) => {
  const windowMs = options.windowMs || 15 * 60 * 1000 // 15 minutes
  const max = options.max || 100
  
  return (req, res, next) => {
    const key = req.ip
    const now = Date.now()
    
    if (!rateLimitStore.has(key)) {
      rateLimitStore.set(key, { count: 1, resetTime: now + windowMs })
      return next()
    }
    
    const record = rateLimitStore.get(key)
    
    if (now > record.resetTime) {
      record.count = 1
      record.resetTime = now + windowMs
      return next()
    }
    
    if (record.count >= max) {
      return res.status(429).json({
        error: 'Too many requests',
        message: 'Rate limit exceeded. Please try again later.'
      })
    }
    
    record.count++
    next()
  }
}

const generalRateLimit = createRateLimiter()
const swapRateLimit = createRateLimiter({ windowMs: 5 * 60 * 1000, max: 10 })

module.exports = {
  generalRateLimit,
  swapRateLimit,
  createRateLimiter
}