// news99-backend/routes.js

const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const path = require("path");
const cloudinary = require("../cloudinaryConfig"); // Import Cloudinary config
const streamifier = require('streamifier'); // Import streamifier
const { body, validationResult } = require('express-validator'); // Import validation functions

const User = require("../models/User");
const Job = require("../models/Job");
const Article = require("../models/Article");
const JobApplication = require("../models/JobApplication");
const Message = require("../models/Message");

const {
  getJobs,
  addJob,
  applyForJob,
  applyForJobWithFile,
  getAllApplications,
  updateApplicationStatus,
  deleteApplication,
} = require("../controllers/jobController");

const {
  createNews,
  getAllNews,
  getNewsById,
  updateNews,
  deleteNews,
  approveNews,
  rejectNews,
  getMySubmissions,
  getAllNewsAdmin,
} = require("../controllers/newsController");

const {
  applyForReporter,
  getAllReporterRequests,
  approveReporterRequest,
  rejectReporterRequest,
  deleteReporterRequest,
} = require("../controllers/reporterRequestController");

const {
  createTask,
  getAllTasks,
  updateTaskStatus,
  deleteTask,
  getReporterTasks,
  updateTaskByReporter,
} = require("../controllers/taskController");

const { createComment, getComments } = require("../controllers/commentController");

const SiteConfig = require("../models/SiteConfig");
const upload = require("../multerConfig");
require("dotenv").config();

const router = express.Router();

// ----------------------------------
// MIDDLEWARES
// ----------------------------------
// Function to handle validation results
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, role }
    next();
  } catch (err) {
    return res.status(401).json({ message: "Unauthorized: Invalid or expired token" });
  }
};

const verifyAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied. Admins only." });
  }
  next();
};

const verifyReporter = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  if (req.user.role === "reporter" || req.user.role === "admin") {
    return next();
  }
  return res.status(403).json({ message: "Access denied. Reporters or Admins only." });
};

// Allows a token but doesn't require it, e.g. for public news access
function optionalVerifyToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(" ")[1];
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
    } catch (err) {
      // ignore invalid token
    }
  }
  next();
}

// ----------------------------------
// USER AUTH ROUTES
// ----------------------------------
router.post("/register", 
  // Validation middleware chain
  [
    body('username', 'Username is required').notEmpty().trim().escape(),
    body('email', 'Please include a valid email').isEmail().normalizeEmail(),
    body('password', 'Password must be 6 or more characters').isLength({ min: 6 }),
    body('role', 'Invalid role').optional().isIn(['user', 'reporter']),
    body('bio').optional().trim().escape()
  ],
  handleValidationErrors, // Handle any validation errors
  async (req, res) => {
    // Existing logic (no need for manual checks like !username || !email anymore)
    const { username, email, password, role = "user", bio = "" } = req.body;
    
    try {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(409).json({ message: "Email already exists." });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = new User({ username, email, password: hashedPassword, role, bio });
      await newUser.save();

      res.status(201).json({
        message: "User registered successfully.",
        user: { id: newUser._id, username, email, role },
      });
    } catch (err) {
      console.error("Registration error:", err); // Log server errors
      res.status(500).json({ message: `Server error: ${err.message}` });
    }
});

router.post("/login", 
  // Validation middleware chain
  [
    body('email', 'Please include a valid email').isEmail().normalizeEmail(),
    body('password', 'Password is required').exists()
  ],
  handleValidationErrors,
  async (req, res) => {
    // Existing logic
    const { email, password } = req.body;
    
    try {
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ message: "User not found." });
      }
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ message: "Invalid credentials." });
      }

      const token = jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );
      res.status(200).json({
        message: "Login successful.",
        token,
        role: user.role,
        userId: user._id,
        username: user.username,
      });
    } catch (err) {
      console.error("Login error:", err); // Log server errors
      res.status(500).json({ message: `Server error: ${err.message}` });
    }
});

router.get("/profile", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found." });
    res.status(200).json({
      id: user._id,
      username: user.username,
      email: user.email,
      bio: user.bio,
      role: user.role,
    });
  } catch (err) {
    res.status(500).json({ message: `Failed to fetch user profile: ${err.message}` });
  }
});

// ----------------------------------
// ADMIN ROUTES
// ----------------------------------
router.get("/admin/users", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const users = await User.find({}, "username email role");
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: `Failed to fetch users: ${err.message}` });
  }
});

router.get("/admin/jobs", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const jobs = await Job.find({}, "title company createdAt");
    res.status(200).json(jobs);
  } catch (err) {
    res.status(500).json({ message: `Failed to fetch jobs: ${err.message}` });
  }
});

router.put("/admin/jobs/:id", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { title, description, requirements, postedBy, location, company } = req.body;
    if (!title || !description || !requirements || !postedBy || !location || !company) {
      return res.status(400).json({
        message:
          "All fields (title, description, requirements, location, company, postedBy) are required"
      });
    }

    const updatedJob = await Job.findByIdAndUpdate(
      req.params.id,
      { title, description, requirements, postedBy, location, company },
      { new: true }
    );
    if (!updatedJob) {
      return res.status(404).json({ message: "Job not found." });
    }
    res.status(200).json(updatedJob);
  } catch (err) {
    res.status(500).json({ message: `Failed to update job: ${err.message}` });
  }
});

router.delete("/admin/jobs/:id", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const job = await Job.findByIdAndDelete(req.params.id);
    if (!job) {
      return res.status(404).json({ message: "Job not found." });
    }
    res.status(200).json({ message: "Job deleted successfully." });
  } catch (err) {
    res.status(500).json({ message: `Failed to delete job: ${err.message}` });
  }
});

router.get("/admin/applications", verifyToken, verifyAdmin, getAllApplications);
router.put("/admin/applications/:id", verifyToken, verifyAdmin, updateApplicationStatus);
router.delete("/admin/applications/:id", verifyToken, verifyAdmin, deleteApplication);

// Reporter Requests
// Note: the user can pass phoneNumber, reason, experience, areaOfInterest, etc. in the body
router.post("/apply-reporter", verifyToken, async (req, res) => {
  if (req.user.role !== "user") {
    return res
      .status(400)
      .json({ message: "Only users can apply to become a reporter." });
  }
  applyForReporter(req, res);
});

router.get("/admin/reporter-requests", verifyToken, verifyAdmin, getAllReporterRequests);
router.patch("/admin/reporter-requests/:id/approve", verifyToken, verifyAdmin, approveReporterRequest);
router.patch("/admin/reporter-requests/:id/reject", verifyToken, verifyAdmin, rejectReporterRequest);
router.delete("/admin/reporter-requests/:id", verifyToken, verifyAdmin, deleteReporterRequest);

// Admin news route to get all news submissions (pending, approved, rejected)
router.get("/admin/news", verifyToken, verifyAdmin, getAllNewsAdmin);

// ----------------------------------
// JOB ROUTES
// ----------------------------------
router.get("/jobs", getJobs);
router.post("/jobs", verifyToken, verifyAdmin, addJob);
router.post("/jobs/:id/apply", verifyToken, applyForJob);
router.post("/jobs/:id/apply-file", verifyToken, upload.single("resumeFile"), applyForJobWithFile);

// ----------------------------------
// ARTICLE ROUTES
// ----------------------------------
router.get("/articles", async (req, res) => {
  try {
    const articles = await Article.find().sort({ createdAt: -1 });
    res.json(articles);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/articles", verifyToken, async (req, res) => {
  const { title, content, category } = req.body;
  try {
    const article = new Article({
      title,
      content,
      category,
      author: req.user.id,
    });
    const savedArticle = await article.save();
    res.status(201).json({
      message: "Article created",
      article: savedArticle
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ----------------------------------
// NEWS ROUTES
// ----------------------------------
router.get("/news", getAllNews);
router.get("/news/my-submissions", verifyToken, verifyReporter, getMySubmissions);
router.get("/news/:id", optionalVerifyToken, getNewsById);

// Accept image and video in form-data
router.post(
  "/news",
  verifyToken,
  verifyReporter,
  upload.fields([{ name: "image" }, { name: "video" }]),
  createNews
);

router.put(
  "/news/:id",
  verifyToken,
  verifyAdmin,
  upload.fields([{ name: "image" }, { name: "video" }]),
  updateNews
);

router.delete("/news/:id", verifyToken, verifyAdmin, deleteNews);
router.patch("/news/:id/approve", verifyToken, verifyAdmin, approveNews);
router.patch("/news/:id/reject", verifyToken, verifyAdmin, rejectNews);

// ----------------------------------
// COMMENTS
// ----------------------------------
router.post("/news/:newsId/comments", verifyToken, createComment);
router.get("/news/:newsId/comments", getComments);

// ----------------------------------
// TASK ROUTES
// ----------------------------------
router.post("/admin/tasks", verifyToken, verifyAdmin, createTask);
router.get("/admin/tasks", verifyToken, verifyAdmin, getAllTasks);
router.put("/admin/tasks/:id", verifyToken, verifyAdmin, updateTaskStatus);
router.delete("/admin/tasks/:id", verifyToken, verifyAdmin, deleteTask);

// Reporter can get or update tasks
router.get("/reporter/tasks", verifyToken, verifyReporter, getReporterTasks);
router.put("/reporter/tasks/:id", verifyToken, verifyReporter, updateTaskByReporter);

// ----------------------------------
// SITE CONFIG
// ----------------------------------
router.get("/site-config", async (req, res) => {
  try {
    let config = await SiteConfig.findOne({});
    if (!config) {
      config = await SiteConfig.create({});
    }
    res.json(config);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put(
  "/site-config",
  verifyToken,
  verifyAdmin,
  upload.single("heroImage"), // Multer handles the temporary upload to memory
  async (req, res) => {
    try {
      let heroImageUrl = req.body.heroImage; // Keep existing image path if no new file

      // If a new file is uploaded, upload it to Cloudinary from buffer
      if (req.file) {
        // Use a Promise to handle the stream upload
        const uploadPromise = new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { /* Optional: Add Cloudinary upload options */ }, 
            (error, result) => {
              if (result) {
                resolve(result);
              } else {
                reject(error || new Error('Cloudinary upload failed'));
              }
            }
          );
          // Pipe the buffer from memory into the Cloudinary upload stream
          streamifier.createReadStream(req.file.buffer).pipe(stream);
        });

        const result = await uploadPromise; // Wait for the upload to complete
        heroImageUrl = result.secure_url; // Get the secure URL from Cloudinary
      }

      // Extract other hero section fields from request body
      const { 
        heroHeadline,
        heroSubheading, 
        heroCTAText, 
        heroCTALink 
      } = req.body;
      
      // Find or create config
      let config = await SiteConfig.findOne({});
      if (!config) {
        config = await SiteConfig.create({ 
          heroImage: heroImageUrl, // Save Cloudinary URL
          ...(heroHeadline && { heroHeadline }),
          ...(heroSubheading && { heroSubheading }),
          ...(heroCTAText && { heroCTAText }),
          ...(heroCTALink && { heroCTALink })
        });
      } else {
        // Update existing config with new values if provided
        if (heroImageUrl) config.heroImage = heroImageUrl; // Save Cloudinary URL
        if (heroHeadline) config.heroHeadline = heroHeadline;
        if (heroSubheading) config.heroSubheading = heroSubheading;
        if (heroCTAText) config.heroCTAText = heroCTAText;
        if (heroCTALink) config.heroCTALink = heroCTALink;
        
        await config.save();
      }
      res.json(config); // Send back the updated config (with Cloudinary URL)
    } catch (err) {
      console.error("Error updating site config:", err); // Log the error
      res.status(500).json({ message: err.message });
    }
  }
);

// ----------------------------------
// CATEGORIES
// ----------------------------------
router.get("/categories", (req, res) => {
  const categories = [
    "National",
    "International",
    "Business",
    "Sports",
    "Entertainment",
    "Technology",
    "General"
  ];
  res.json(categories);
});

// ----------------------------------
// CONTACT FORM
// ----------------------------------
router.post("/contact", async (req, res) => {
  const { name, email, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ message: "All fields are required." });
  }
  try {
    const newMsg = new Message({ name, email, message });
    await newMsg.save();
    res.status(201).json({ message: "Your message has been received." });
  } catch (err) {
    res.status(500).json({ message: `Server error: ${err.message}` });
  }
});

// ----------------------------------
// ADMIN MESSAGES
// ----------------------------------
router.get("/admin/messages", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const messages = await Message.find().sort({ createdAt: -1 });
    res.json(messages);
  } catch (err) {
    res
      .status(500)
      .json({ message: `Failed to fetch messages: ${err.message}` });
  }
});

router.delete("/admin/messages/:id", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const msg = await Message.findByIdAndDelete(req.params.id);
    if (!msg) {
      return res.status(404).json({ message: "Message not found." });
    }
    res.json({ message: "Message deleted successfully." });
  } catch (err) {
    res
      .status(500)
      .json({ message: `Failed to delete message: ${err.message}` });
  }
});

module.exports = router;
