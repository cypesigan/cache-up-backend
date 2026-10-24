// Shared helpers for controllers.

const BLOCKED_KEYS = ["_id", "id", "createdAt", "updatedAt", "__v"];

// Turn a mongoose doc into the shape the frontend expects (adds `id`, drops __v).
const serialize = (doc) => {
  if (!doc) return doc;
  const obj = typeof doc.toObject === "function" ? doc.toObject() : { ...doc };
  obj.id = obj._id;
  delete obj.__v;
  return obj;
};

// Copy of a request body without keys a client must never set directly.
const cleanBody = (body, extraBlocked = []) => {
  const out = { ...(body || {}) };
  for (const key of [...BLOCKED_KEYS, ...extraBlocked]) delete out[key];
  return out;
};

// The frontend generates its own ids (e.g. "asg-1700000000000") and sends them as `id`.
const clientId = (body) => {
  const id = body && body.id;
  return typeof id === "string" && id.length > 0 && id.length <= 80 ? id : undefined;
};

// Map mongoose errors to sensible HTTP responses.
const sendError = (res, error, fallbackMessage = "Something went wrong") => {
  if (error && error.name === "ValidationError") {
    const message = Object.values(error.errors).map((e) => e.message).join(", ");
    return res.status(400).json({ message });
  }
  if (error && error.name === "CastError") {
    return res.status(400).json({ message: `Invalid value for "${error.path}"` });
  }
  if (error && error.code === 11000) {
    const field = Object.keys(error.keyPattern || {})[0] || "value";
    return res.status(409).json({ message: `That ${field} is already in use` });
  }
  if (error && error.code === "23505") {
    // Postgres unique violation, e.g. users_email_key -> "email"
    const match = /_(\w+)_key$/.exec(error.constraint || "");
    return res.status(409).json({ message: `That ${match ? match[1] : "value"} is already in use` });
  }
  console.error(fallbackMessage, error);
  return res.status(500).json({ message: fallbackMessage });
};

module.exports = { serialize, cleanBody, clientId, sendError };
