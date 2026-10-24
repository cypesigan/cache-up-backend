const mongoose = require("mongoose");
const { isProd } = require("./env");

let memoryServer = null;

mongoose.connection.on("error", (err) => console.error("MongoDB connection error:", err.message));
mongoose.connection.on("disconnected", () => console.warn("MongoDB disconnected"));

const connectDB = async () => {
  const uri = process.env.MONGO_URI;

  if (uri) {
    try {
      // Never log the URI itself: it contains the database password.
      await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
      console.log(`MongoDB connected: database "${mongoose.connection.name}" on ${mongoose.connection.host}`);
      return;
    } catch (error) {
      console.error("MongoDB connection failed:", error.message);
      // In production a silent fallback would make data disappear on every restart, so stop instead.
      if (isProd) throw error;
      console.warn("Development mode: falling back to a temporary in-memory MongoDB.");
    }
  } else if (isProd) {
    throw new Error("MONGO_URI is not set. Add your MongoDB Atlas connection string to the environment variables.");
  } else {
    console.log("No MONGO_URI set: using a temporary in-memory MongoDB (data is lost on restart).");
  }

  const { MongoMemoryServer } = require("mongodb-memory-server");
  memoryServer = await MongoMemoryServer.create();
  await mongoose.connect(memoryServer.getUri());
  console.log("In-memory MongoDB is running.");
};

const disconnectDB = async () => {
  await mongoose.disconnect();
  if (memoryServer) await memoryServer.stop();
};

module.exports = connectDB;
module.exports.disconnectDB = disconnectDB;
