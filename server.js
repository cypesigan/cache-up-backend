require("dotenv").config();
const express = require("express");
const connectDB = require("./config/db");

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "CacheUp API is running" });
});

const authRoutes = require("./routes/authRoutes");   
app.use("/api/auth", authRoutes ); 

app.use("/api/profile", require("./routes/profileRoutes"));

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
});