// news99-backend/uploads/multerConfig.js
const multer = require("multer");

// Use memory storage for temporary file handling
const storage = multer.memoryStorage();

// Updated allowed MIME types to include more common video formats
const allowedMimeTypes = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "video/mp4",
  "video/webm",
  "video/mpeg",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

// File filter function
const fileFilter = (req, file, cb) => {
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true); // Accept file
  } else {
    cb(
      new Error(
        "Invalid file type. Only images, MP4/WebM/MPEG videos, PDF, DOC, and DOCX are allowed."
      ),
      false
    );
  }
};

// Create the Multer instance using memory storage
const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // Example: 50MB limit for memory storage
  fileFilter,
});

module.exports = upload;
