// server.js (or app.js — whichever is your main entry file)
const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");
const routes = require("./routes/routes"); // Consolidated routes file
const multer = require("multer");

dotenv.config();

const app = express();

// Serve static files from the "uploads" directory
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ------------------------------------
// CORS CONFIG — Add Allowed Methods & Headers
// ------------------------------------
const allowedOrigins = [
  'http://localhost:3000', // Your local frontend
  'https://news99.vercel.app'  // Your deployed frontend
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// If you want to explicitly handle OPTIONS on all routes:
app.options("*", cors());

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Use consolidated routes with `/api` prefix
app.use("/api", routes);

// Database connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Connected to the database");
  })
  .catch((err) => {
    console.error("Database connection error:", err);
    // Consider exiting the process if DB connection fails on startup
    // process.exit(1); 
  });

// File Upload Handling
const upload = multer({ dest: "uploads/" });
app.post("/api/upload", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded." });
  }
  res.json({ filePath: `/uploads/${req.file.filename}` });
});

// === Central Error Handling Middleware ===
// This should be defined AFTER all other app.use() and routes calls
app.use((err, req, res, next) => {
  console.error("[Unhandled Error]:", err.stack || err);
  
  // Default error status and message
  let statusCode = err.statusCode || 500; 
  let message = err.message || 'Internal Server Error';

  // Specific error types can be handled here if needed
  // Example: Mongoose validation error
  if (err.name === 'ValidationError') { 
    statusCode = 400;
    // Combine multiple validation errors into one message
    message = Object.values(err.errors).map(val => val.message).join(', ');
  }
  
  // Example: Duplicate key error
  if (err.code === 11000) {
    statusCode = 409; // Conflict
    message = `Duplicate field value entered: ${Object.keys(err.keyValue)} already exists.`;
  }

  // Send response
  res.status(statusCode).json({
    status: 'error',
    message: message
  });
});

// Server
const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
