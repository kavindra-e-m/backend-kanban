const express = require("express");  
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
dotenv.config();

const server = express();

// Middleware
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "http://127.0.0.1:5173",
  "https://mern-frontend-rjfc.vercel.app",
  process.env.FRONTEND_URL
].filter(Boolean);

server.use(cors({
  origin: allowedOrigins.length > 0 ? allowedOrigins : true,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
server.use(express.json());
server.use(express.urlencoded({ extended: true }));

// Database Connection
mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/kanban_board")
.then(() => console.log("✅ MongoDB connected"))
.catch(err => console.log("❌ MongoDB connection error:", err.message));

// Health check endpoint
server.get("/", (req, res) => {
  res.json({ message: "Backend is running!", timestamp: new Date().toISOString() });
});

server.get("/health", (req, res) => {
  res.json({ 
    status: "OK", 
    message: "Server is healthy",
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? "Connected" : "Disconnected"
  });
});

// Routes
server.use("/api/product", require("./routes/productroute"));
server.use("/api/user", require("./routes/userroute"));
server.use("/api/admin", require("./routes/adminroute"));

// Error handling middleware
server.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});