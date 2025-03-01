require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

// Initialize Express App
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// PostgreSQL Connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    require: true,
    rejectUnauthorized: false,  
  },
});

pool.connect()
  .then(() => console.log("Connected to PostgreSQL"))
  .catch(err => console.error("Database connection error:", err));


app.get("/", (req, res) => {
  res.send("Backend is running!");
});

// Import Route Files
const authRoutes = require("./routes/auth");
const chatRoutes = require("./routes/chat");
const supplementRoutes = require("./routes/supplements");
const conversationRoutes = require("./routes/conversation");

// Use Route Files
app.use("/auth", authRoutes);
app.use("/chat", chatRoutes);
app.use("/supplements", supplementRoutes);
app.use("/conversations", conversationRoutes);

// Start the Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
});
