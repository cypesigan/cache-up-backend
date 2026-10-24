// Tiny in-memory rate limiter (no extra dependency). Good enough for a single server instance.
const rateLimit = ({ windowMs = 15 * 60 * 1000, max = 30, message = "Too many attempts. Please try again later." } = {}) => {
  const hits = new Map();

  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of hits) if (entry.reset <= now) hits.delete(key);
  }, windowMs).unref();

  return (req, res, next) => {
    const key = req.ip || "unknown";
    const now = Date.now();
    let entry = hits.get(key);
    if (!entry || entry.reset <= now) {
      entry = { count: 0, reset: now + windowMs };
      hits.set(key, entry);
    }
    entry.count += 1;
    if (entry.count > max) {
      res.set("Retry-After", String(Math.ceil((entry.reset - now) / 1000)));
      return res.status(429).json({ message });
    }
    next();
  };
};

module.exports = rateLimit;
