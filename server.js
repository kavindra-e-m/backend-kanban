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
  process.env.FRONTEND_URL || "https://your-bucket-name.s3.amazonaws.com",
  process.env.CLOUDFRONT_URL || "https://your-cloudfront-domain.cloudfront.net"
];

server.use(cors({
  origin: allowedOrigins,
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