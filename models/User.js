// User accounts, stored in Neon Postgres (table "users").
// Passwords are bcrypt-hashed and never returned unless a caller asks for them explicitly.
const bcrypt = require("bcryptjs");
const { query } = require("../config/pg");

const DEFAULT_AVATAR = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80";
const ROLES = ["admin", "teacher", "student"];
const STATUSES = ["pending", "approved", "rejected"];

// API field name -> column name.
const COLUMNS = {
  name: "name",
  email: "email",
  role: "role",
  status: "status",
  avatar: "avatar",
  title: "title",
  bio: "bio",
  department: "department",
  studentId: "student_id",
  phone: "phone",
  joinedDate: "joined_date",
  points: "points",
  gpa: "gpa",
  streakDays: "streak_days",
  studyHours: "study_hours",
  enrolledCourseIds: "enrolled_course_ids",
  assignedCourseIds: "assigned_course_ids",
  registrationNotes: "registration_notes",
};
const FIELDS = Object.keys(COLUMNS);
const ARRAY_FIELDS = ["enrolledCourseIds", "assignedCourseIds"];
const NUMBER_FIELDS = ["points", "streakDays", "studyHours"];

// Same shape mongoose used to throw, so utils/http.js turns it into a 400.
const validationError = (messages) => {
  const err = new Error(messages.join(", "));
  err.name = "ValidationError";
  err.errors = Object.fromEntries(messages.map((m, i) => [String(i), { message: m }]));
  return err;
};

const newId = () => `usr-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
const defaultJoinedDate = () => new Date().toLocaleString("en-US", { month: "long", year: "numeric" });

const validate = (data, { partial }) => {
  const errors = [];
  const has = (key) => !partial || data[key] !== undefined;
  if (has("name")) {
    const name = typeof data.name === "string" ? data.name.trim() : "";
    if (!name) errors.push("Name is required");
    else if (name.length < 2) errors.push("Name must be at least 2 characters");
    else if (name.length > 80) errors.push("Name must be at most 80 characters");
  }
  if (has("email")) {
    const email = typeof data.email === "string" ? data.email.trim() : "";
    if (!email) errors.push("Email is required");
    else if (!/^\S+@\S+\.\S+$/.test(email)) errors.push("Please enter a valid email");
  }
  if (data.role !== undefined && !ROLES.includes(data.role)) errors.push(`"${data.role}" is not a valid role`);
  if (data.status !== undefined && !STATUSES.includes(data.status)) errors.push(`"${data.status}" is not a valid status`);
  for (const key of NUMBER_FIELDS) {
    if (data[key] !== undefined && !Number.isFinite(Number(data[key]))) errors.push(`${key} must be a number`);
  }
  for (const key of ARRAY_FIELDS) {
    if (data[key] !== undefined && !(Array.isArray(data[key]) && data[key].every((v) => typeof v === "string"))) {
      errors.push(`${key} must be a list of ids`);
    }
  }
  if (errors.length) throw validationError(errors);
};

// Normalise one API value for storage.
const toDb = (key, value) => {
  if (value === undefined || value === null) return value === null && ARRAY_FIELDS.includes(key) ? [] : value;
  if (NUMBER_FIELDS.includes(key)) return Number(value);
  if (key === "email") return String(value).trim().toLowerCase();
  if (key === "gpa") return String(value);
  if (typeof value === "string" && ["name", "studentId"].includes(key)) return value.trim();
  return value;
};

// Database row -> API object (no password). Keeps `_id` because the rest of the app expects it.
const fromRow = (row) => {
  if (!row) return null;
  const user = { _id: row.id };
  for (const key of FIELDS) user[key] = row[COLUMNS[key]];
  user.points = Number(user.points);
  user.streakDays = Number(user.streakDays);
  user.studyHours = Number(user.studyHours);
  user.createdAt = row.created_at;
  user.updatedAt = row.updated_at;
  if (row.password_hash !== undefined) Object.defineProperty(user, "passwordHash", { value: row.password_hash, enumerable: false });
  return user;
};

const SELECT = "id, " + FIELDS.map((k) => COLUMNS[k]).join(", ") + ", created_at, updated_at";
const SELECT_WITH_HASH = SELECT + ", password_hash";

// Creates the table on first start. Safe to run every time.
const init = async () => {
  await query(`
    CREATE TABLE IF NOT EXISTS users (
      id                  TEXT PRIMARY KEY,
      name                TEXT NOT NULL CHECK (char_length(name) BETWEEN 2 AND 80),
      email               TEXT NOT NULL UNIQUE,
      password_hash       TEXT NOT NULL,
      role                TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('admin','teacher','student')),
      status              TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
      avatar              TEXT NOT NULL DEFAULT '${DEFAULT_AVATAR}',
      title               TEXT NOT NULL DEFAULT '',
      bio                 TEXT NOT NULL DEFAULT '',
      department          TEXT NOT NULL DEFAULT 'School of Design & Creative Arts',
      student_id          TEXT,
      phone               TEXT NOT NULL DEFAULT '',
      joined_date         TEXT NOT NULL DEFAULT '',
      points              INTEGER NOT NULL DEFAULT 0,
      gpa                 TEXT NOT NULL DEFAULT 'N/A',
      streak_days         INTEGER NOT NULL DEFAULT 0,
      study_hours         DOUBLE PRECISION NOT NULL DEFAULT 0,
      enrolled_course_ids TEXT[] NOT NULL DEFAULT '{}',
      assigned_course_ids TEXT[] NOT NULL DEFAULT '{}',
      registration_notes  TEXT NOT NULL DEFAULT '',
      created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `);
};

// ---- Reads ----
const findById = async (id) => {
  if (typeof id !== "string" || !id) return null;
  const { rows } = await query(`SELECT ${SELECT} FROM users WHERE id = $1`, [id]);
  return fromRow(rows[0]);
};

const findByEmail = async (email, { withPassword = false } = {}) => {
  if (typeof email !== "string" || !email) return null;
  const { rows } = await query(`SELECT ${withPassword ? SELECT_WITH_HASH : SELECT} FROM users WHERE email = $1`, [
    email.trim().toLowerCase(),
  ]);
  return fromRow(rows[0]);
};

// Only the filters the app uses: { status }.
const list = async ({ status } = {}) => {
  const { rows } = status
    ? await query(`SELECT ${SELECT} FROM users WHERE status = $1 ORDER BY created_at DESC`, [status])
    : await query(`SELECT ${SELECT} FROM users ORDER BY created_at DESC`);
  return rows.map(fromRow);
};

const count = async () => {
  const { rows } = await query("SELECT count(*)::int AS n FROM users");
  return rows[0].n;
};

// ---- Writes ----
const buildInsert = (data, passwordHash) => {
  const id = data._id || newId();
  const values = {
    name: data.name,
    email: data.email,
    role: data.role ?? "student",
    status: data.status ?? "pending",
    avatar: data.avatar ?? DEFAULT_AVATAR,
    title: data.title ?? "",
    bio: data.bio ?? "",
    department: data.department ?? "School of Design & Creative Arts",
    studentId: data.studentId ?? null,
    phone: data.phone ?? "",
    joinedDate: data.joinedDate ?? defaultJoinedDate(),
    points: data.points ?? 0,
    gpa: data.gpa ?? "N/A",
    streakDays: data.streakDays ?? 0,
    studyHours: data.studyHours ?? 0,
    enrolledCourseIds: data.enrolledCourseIds ?? [],
    assignedCourseIds: data.assignedCourseIds ?? [],
    registrationNotes: data.registrationNotes ?? "",
  };
  const cols = ["id", ...FIELDS.map((k) => COLUMNS[k]), "password_hash"];
  const params = [id, ...FIELDS.map((k) => toDb(k, values[k])), passwordHash];
  return { cols, params };
};

const insertRow = async ({ cols, params }) => {
  const placeholders = params.map((_, i) => `$${i + 1}`).join(", ");
  const { rows } = await query(`INSERT INTO users (${cols.join(", ")}) VALUES (${placeholders}) RETURNING ${SELECT}`, params);
  return fromRow(rows[0]);
};

// Registers a new account. `data.password` is hashed here.
const create = async (data) => {
  validate(data, { partial: false });
  if (typeof data.password !== "string" || !data.password) throw validationError(["Password is required"]);
  if (data.password.length < 8) throw validationError(["Password must be at least 8 characters"]);
  const hash = await bcrypt.hash(data.password, 10);
  return insertRow(buildInsert(data, hash));
};

// Bulk insert for seeding. `passwordHash` must already be a bcrypt hash.
const insertMany = async (docs) => {
  for (const d of docs) {
    validate(d, { partial: false });
    await insertRow(buildInsert(d, d.passwordHash));
  }
};

const update = async (id, updates) => {
  validate(updates, { partial: true });
  const sets = [];
  const params = [];
  for (const key of FIELDS) {
    if (updates[key] === undefined) continue;
    params.push(toDb(key, updates[key]));
    sets.push(`${COLUMNS[key]} = $${params.length}`);
  }
  if (sets.length === 0) return findById(id);
  params.push(id);
  const { rows } = await query(
    `UPDATE users SET ${sets.join(", ")}, updated_at = now() WHERE id = $${params.length} RETURNING ${SELECT}`,
    params
  );
  return fromRow(rows[0]);
};

const remove = async (id) => {
  const { rows } = await query(`DELETE FROM users WHERE id = $1 RETURNING ${SELECT}`, [id]);
  return fromRow(rows[0]);
};

const deleteAll = () => query("DELETE FROM users");

// ---- Passwords ----
const checkPassword = (user, plain) =>
  !!user && typeof plain === "string" && !!user.passwordHash && bcrypt.compare(plain, user.passwordHash);

const setPassword = async (id, plain) => {
  const hash = await bcrypt.hash(plain, 10);
  await query("UPDATE users SET password_hash = $1, updated_at = now() WHERE id = $2", [hash, id]);
};

module.exports = {
  init,
  findById,
  findByEmail,
  list,
  count,
  create,
  insertMany,
  update,
  remove,
  deleteAll,
  checkPassword,
  setPassword,
};
