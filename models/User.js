const mongoose = require("mongoose");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: () => `usr-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    },
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [80, "Name must be at most 80 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
      select: false,
    },
    role: {
      type: String,
      enum: ["admin", "teacher", "student"],
      default: "student",
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    avatar: {
      type: String,
      default: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80",
    },
    title: {
      type: String,
      default: "",
    },
    bio: {
      type: String,
      default: "",
    },
    department: {
      type: String,
      default: "School of Design & Creative Arts",
    },
    studentId: {
      type: String,
      trim: true,
    },
    phone: {
      type: String,
      default: "",
    },
    joinedDate: {
      type: String,
      default: () => new Date().toLocaleString("en-US", { month: "long", year: "numeric" }),
    },
    points: {
      type: Number,
      default: 0,
    },
    gpa: {
      type: String,
      default: "N/A",
    },
    streakDays: {
      type: Number,
      default: 0,
    },
    studyHours: {
      type: Number,
      default: 0,
    },
    enrolledCourseIds: {
      type: [String],
      default: [],
    },
    assignedCourseIds: {
      type: [String],
      default: [],
    },
    registrationNotes: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
