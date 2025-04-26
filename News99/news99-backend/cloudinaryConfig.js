const cloudinary = require('cloudinary').v2;
const dotenv = require('dotenv');

dotenv.config();

// === BEGIN DIAGNOSTIC LOGGING ===
console.log("--- Cloudinary Config Environment Variables ---");
console.log("CLOUDINARY_CLOUD_NAME:", process.env.CLOUDINARY_CLOUD_NAME ? `"${process.env.CLOUDINARY_CLOUD_NAME}"` : "(Not Set or Empty)");
console.log("CLOUDINARY_API_KEY:", process.env.CLOUDINARY_API_KEY ? `"${process.env.CLOUDINARY_API_KEY}"` : "(Not Set or Empty)");
console.log("CLOUDINARY_API_SECRET:", process.env.CLOUDINARY_API_SECRET ? `"${process.env.CLOUDINARY_API_SECRET.substring(0, 5)}..."` : "(Not Set or Empty)"); // Log only first few chars of secret
console.log("---------------------------------------------");
// === END DIAGNOSTIC LOGGING ===

// Configure Cloudinary with your credentials from environment variables
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET 
});

module.exports = cloudinary; 