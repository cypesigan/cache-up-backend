require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const { isProd, CLIENT_URLS, PORT, AUTO_SEED, ALLOW_RESEED } = require("./config/env");
const connectDB = require("./config/db");
const pg = require("./config/pg");
const seedDatabase = require("./seed");
const User = require("./models/User");
const Course = require("./models/Course");
const { protect, restrictTo } = require("./middleware/auth");

const app = express();

// Render / Railway / Vercel put a proxy in front of the app; this makes req.ip the real client address.
app.set("trust proxy", 1);
app.disable("x-powered-by");

// ---- CORS ----
// CLIENT_URL may be a comma separated list and may use a * wildcard (e.g. https://*.vercel.app).
// Auth uses a Bearer token (no cookies), so an unset CLIENT_URL simply allows every origin.
const escapeRegex = (s) => s.replace(/[.+?^${}()|[\]\\]/g, "\\$&");
const originAllowed = (origin) => {
  if (!origin || CLIENT_URLS.length === 0) return true;
  return CLIENT_URLS.some((pattern) =>
    pattern.includes("*")
      ? new RegExp(`^${pattern.split("*").map(escapeRegex).join(".*")}$`).test(origin)
      : pattern === origin
  );
};
app.use(
  cors({
    origin: (origin, callback) => callback(null, originAllowed(origin)),
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    maxAge: 86400,
  })
);

// ---- Body parsing ----
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use((req, res, next) => {
  if (req.body === undefined) req.body = {}; // Express 5 leaves it undefined when a request has no body
  next();
});

// ---- Health ----
app.get("/", (req, res) => {
  res.json({ message: "CacheUp API is running smoothly", status: "ok" });
});

app.get("/api/health", async (req, res) => {
  const dbReady = mongoose.connection.readyState === 1;
  const usersReady = await pg.isReady();
  const ok = dbReady && usersReady;
  res.status(ok ? 200 : 503).json({
    message: ok ? "CacheUp API is healthy" : "Database is not connected",
    database: dbReady ? "connected" : "disconnected",
    accountsDatabase: usersReady ? "connected" : "disconnected",
    timestamp: new Date().toISOString(),
  });
});

// ---- Routes ----
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/courses", require("./routes/courseRoutes"));
app.use("/api/assignments", require("./routes/assignmentRoutes"));
app.use("/api/submissions", require("./routes/submissionRoutes"));
app.use("/api/quizzes", require("./routes/quizRoutes"));
app.use("/api/materials", require("./routes/materialRoutes"));
app.use("/api/announcements", require("./routes/announcementRoutes"));
app.use("/api/schedule", require("./routes/scheduleRoutes"));

// Wipes every collection and reloads the demo data, so it is admin-only and must be switched on explicitly.
app.post("/api/admin/reseed", protect, restrictTo("admin"), async (req, res) => {
  if (!ALLOW_RESEED) {
    return res.status(403).json({ message: "Reseeding is disabled. Set ALLOW_RESEED=true to enable it." });
  }
  try {
    await seedDatabase();
    res.json({ message: "Database reseeded successfully from demo data!" });
  } catch (error) {
    console.error("Reseed failed:", error);
    res.status(500).json({ message: "Reseeding failed" });
  }
});

// ---- 404 + error handling (always JSON) ----
app.use("/api", (req, res) => {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
});

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  if (err.type === "entity.parse.failed") return res.status(400).json({ message: "Invalid JSON in request body" });
  if (err.type === "entity.too.large") return res.status(413).json({ message: "Request body is too large" });
  console.error("Unhandled error:", err);
  res.status(err.status || 500).json({ message: isProd ? "Internal server error" : err.message });
});

// ---- Start ----
const start = async () => {
  await connectDB();
  await User.init(); // accounts live in Neon Postgres

  try {
    // First run on an empty database: load the demo data. Seeding wipes MongoDB, so it only runs
    // when MongoDB holds no courses either (protects real data if the accounts table is ever empty).
    const count = await User.count();
    if (count === 0 && AUTO_SEED && (await Course.countDocuments()) === 0) {
      console.log("Database is empty. Running initial seeding...");
      await seedDatabase();
    } else {
      console.log(`Database contains ${count} user account(s).`);
    }
  } catch (err) {
    console.error("Auto-seeding check error:", err.message);
  }

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT} (${isProd ? "production" : "development"})`);
  });
};

start().catch((err) => {
  console.error("Failed to start server:", err.message);
  process.exit(1);
});
