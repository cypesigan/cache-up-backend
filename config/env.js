// Central place for environment configuration.
// dotenv must already be loaded (server.js / seed.js call require("dotenv").config() first).

const isProd = process.env.NODE_ENV === "production";

// In production a real secret is mandatory. Locally we use a throwaway default so `npm run dev` just works.
const JWT_SECRET = process.env.JWT_SECRET || (isProd ? "" : "dev-only-secret-change-me");
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not set. Add a long random string to your environment variables.");
}

// CLIENT_URL can be a comma separated list. Entries may use a * wildcard, e.g. https://*.vercel.app
const CLIENT_URLS = (process.env.CLIENT_URL || "")
  .split(",")
  .map((s) => s.trim().replace(/\/$/, ""))
  .filter(Boolean);

module.exports = {
  isProd,
  JWT_SECRET,
  CLIENT_URLS,
  PORT: process.env.PORT || 5000,
  AUTO_SEED: process.env.AUTO_SEED !== "false",
  ALLOW_RESEED: process.env.ALLOW_RESEED === "true",
};
