const mongoose = require("mongoose");

const SiteConfigSchema = new mongoose.Schema(
  {
    heroImage: {
      type: String,
      default: "https://via.placeholder.com/1200x500",
    },
    heroHeadline: {
      type: String,
      default: "Top Stories of the Day",
    },
    heroSubheading: {
      type: String,
      default: "Stay informed with the latest news and analysis.",
    },
    heroCTAText: {
      type: String,
      default: "Explore Top News",
    },
    heroCTALink: {
      type: String,
      default: "/category/National",
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("SiteConfig", SiteConfigSchema);
