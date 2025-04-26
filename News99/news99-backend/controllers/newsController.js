// news99-backend/controllers/newsController.js

const News = require("../models/News");
const User = require("../models/User");
const cloudinary = require('../cloudinaryConfig'); // Import Cloudinary
const streamifier = require('streamifier'); // Import streamifier

// Helper function to upload a file buffer to Cloudinary
const uploadToCloudinary = (fileBuffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { /* Optional: Add Cloudinary upload options, e.g., folder: "news_uploads" */ }, 
      (error, result) => {
        if (result) {
          resolve(result);
        } else {
          reject(error || new Error('Cloudinary upload failed'));
        }
      }
    );
    streamifier.createReadStream(fileBuffer).pipe(stream);
  });
};

// 1) Create a news item (REPORTER or ADMIN), handling both image & video
exports.createNews = async (req, res) => {
  try {
    const { title, description, category, youtubeLink } = req.body;
    const authorId = req.user.id;

    // Basic validation
    if (!title || !description) {
      return res
        .status(400)
        .json({ message: "Title and description are required." });
    }

    const status = req.user.role === "admin" ? "approved" : "pending";

    let imageUrl = "";
    let videoUrl = "";

    // Upload image if present
    if (req.files && req.files.image && req.files.image[0]) {
      const imageResult = await uploadToCloudinary(req.files.image[0].buffer);
      imageUrl = imageResult.secure_url;
    }

    // Upload video if present
    if (req.files && req.files.video && req.files.video[0]) {
      const videoResult = await uploadToCloudinary(req.files.video[0].buffer);
      videoUrl = videoResult.secure_url;
    }

    // Create & save the new news doc
    const newsItem = new News({
      title,
      description,
      author: authorId,
      category: category || "General",
      youtubeLink: youtubeLink || "",
      image: imageUrl, // Save Cloudinary URL
      video: videoUrl, // Save Cloudinary URL
      status,
    });

    const savedNews = await newsItem.save();
    res.status(201).json({
      message: "News submitted successfully.",
      news: savedNews,
    });
  } catch (err) {
    console.error("Error creating news:", err); // Log the detailed error
    res.status(500).json({ message: `Failed to create news: ${err.message}` });
  }
};

// 2) Return only approved news to the public
exports.getAllNews = async (req, res) => {
  const { category } = req.query;
  try {
    const query = category
      ? { category, status: "approved" }
      : { status: "approved" };

    const news = await News.find(query)
      .sort({ createdAt: -1 })
      .populate("author", "username email");
    res.json(news);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 3) Get a single news item by ID
exports.getNewsById = async (req, res) => {
  try {
    const newsItem = await News.findById(req.params.id).populate(
      "author",
      "username email"
    );
    if (!newsItem) {
      return res.status(404).json({ message: "News item not found." });
    }

    // If it's approved, anyone can view it
    if (newsItem.status === "approved") {
      return res.json(newsItem);
    }

    // Otherwise only admin or the author can view
    if (
      req.user &&
      (req.user.role === "admin" ||
        String(newsItem.author._id) === String(req.user.id))
    ) {
      return res.json(newsItem);
    }

    return res
      .status(403)
      .json({ message: "You don't have permission to view this news item." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 4) Update a news item (admin only), handling both image & video
exports.updateNews = async (req, res) => {
  try {
    const { title, description, category, youtubeLink } = req.body;

    if (!title || !description) {
      return res
        .status(400)
        .json({ message: "Title and description are required." });
    }

    // Find the existing doc
    const newsItem = await News.findById(req.params.id);
    if (!newsItem) {
      return res.status(404).json({ message: "News item not found." });
    }

    // Update text fields
    newsItem.title = title;
    newsItem.description = description;
    newsItem.category = category || newsItem.category; // Keep old if not provided
    newsItem.youtubeLink = youtubeLink || newsItem.youtubeLink; // Keep old if not provided

    // Upload new image if present
    if (req.files && req.files.image && req.files.image[0]) {
      const imageResult = await uploadToCloudinary(req.files.image[0].buffer);
      newsItem.image = imageResult.secure_url; // Save Cloudinary URL
    } else if (req.body.image === '') { // Allow clearing the image
       newsItem.image = '';
    }

    // Upload new video if present
    if (req.files && req.files.video && req.files.video[0]) {
      const videoResult = await uploadToCloudinary(req.files.video[0].buffer);
      newsItem.video = videoResult.secure_url; // Save Cloudinary URL
    } else if (req.body.video === '') { // Allow clearing the video
       newsItem.video = '';
    }

    const updatedNews = await newsItem.save();
    res.json(updatedNews);
  } catch (err) {
    console.error("Error updating news:", err); // Log the detailed error
    res.status(500).json({ message: `Failed to update news: ${err.message}` });
  }
};

// 5) Delete news (admin only)
exports.deleteNews = async (req, res) => {
  try {
    const deletedNews = await News.findByIdAndDelete(req.params.id);
    if (!deletedNews) {
      return res.status(404).json({ message: "News item not found." });
    }
    res.json({ message: "News item deleted successfully." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 6) Approve pending news
exports.approveNews = async (req, res) => {
  try {
    const newsId = req.params.id;
    const newsItem = await News.findById(newsId);
    if (!newsItem) {
      return res.status(404).json({ message: "News item not found." });
    }
    newsItem.status = "approved";
    // Clear any previous rejection reason
    newsItem.rejectionReason = "";
    await newsItem.save();

    res.json({
      message: "News item approved successfully.",
      news: newsItem,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 7) Reject news
exports.rejectNews = async (req, res) => {
  try {
    const { id } = req.params;
    const { rejectionReason } = req.body;
    if (!rejectionReason) {
      return res
        .status(400)
        .json({ message: "Rejection reason is required." });
    }

    const newsItem = await News.findById(id);
    if (!newsItem) {
      return res.status(404).json({ message: "News item not found." });
    }
    newsItem.status = "rejected";
    newsItem.rejectionReason = rejectionReason;
    await newsItem.save();

    res.json({
      message: "News item rejected.",
      news: newsItem,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 8) Return all news from the current reporter
exports.getMySubmissions = async (req, res) => {
  try {
    const reporterId = req.user.id;
    const myNews = await News.find({ author: reporterId })
      .sort({ createdAt: -1 })
      .populate("author", "username email");
    res.json(myNews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 9) Return ALL news (for admin use)
exports.getAllNewsAdmin = async (req, res) => {
  try {
    const news = await News.find().populate("author", "username email");
    res.json(news);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
