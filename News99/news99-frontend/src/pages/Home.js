// news99-frontend/src/pages/Home.js

import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

// Convert relative paths to absolute
const BASE_URL = process.env.REACT_APP_BASE_URL || 'http://localhost:5000';
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const getImageUrl = (path) => {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return `${BASE_URL}${path}`;
};

// More robust approach to parse YouTube ID
// This attempts to capture ID from typical forms: watch?v=, youtu.be/, embed/, etc.
const getEmbedUrl = (url) => {
  if (!url) return "";

  // This pattern tries to capture the ID from various typical YouTube links
  // If it fails, we'll just return "" so no embed is shown
  const regex =
    /(?:youtube\.com\/(?:.*v=|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{6,})/i;
  const match = url.match(regex);

  if (match && match[1]) {
    // match[1] is the captured ID
    const videoId = match[1];
    return `https://www.youtube.com/embed/${videoId}?autoplay=0`;
  }
  return ""; // fallback
};

function Home() {
  const [newsItems, setNewsItems] = useState([]);
  const [siteConfig, setSiteConfig] = useState({
    heroImage: "",
    heroHeadline: "Top Stories of the Day",
    heroSubheading: "Stay informed with the latest news and analysis.",
    heroCTAText: "Explore Top News",
    heroCTALink: "/category/National"
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isBreaking, setIsBreaking] = useState(false);

  useEffect(() => {
    // fetch site config
    axios
      .get(`${API_URL}/site-config`)
      .then((res) => {
        if (res.data) {
          setSiteConfig(res.data);
        }
      })
      .catch((err) => console.log("Failed to load site config:", err));

    // fetch news
    axios
      .get(`${API_URL}/news`)
      .then((res) => {
        setNewsItems(res.data);
        // Check if any news has breaking flag
        const hasBreaking = res.data.some(item => item.isBreaking === true);
        setIsBreaking(hasBreaking);
        setLoading(false);
      })
      .catch((err) => {
        setError("Failed to load news");
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
        <p className="text-xl">Loading news...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
        <p className="text-red-400 text-xl">{error}</p>
      </div>
    );
  }

  // Slices for your layout
  const featuredNews = newsItems.slice(0, 3);

  // Include items that have either a youtubeLink or a local video
  const videoHighlights = newsItems.filter(
    (item) =>
      (item.youtubeLink && item.youtubeLink.trim() !== "") ||
      (item.video && item.video.trim() !== "")
  );

  const latestNews = newsItems.slice(0, 9);
  const breakingNews = newsItems.filter(item => item.isBreaking === true);

  return (
    <div className="bg-gray-900 text-gray-100 min-h-screen">
      {/* HERO SECTION - Professional News Style */}
      <section className="relative w-full h-[350px] sm:h-[400px] md:h-[500px] lg:h-[600px] overflow-hidden">
        {/* Hero Background with Proper Overlay Gradient */}
        <div className="absolute inset-0 w-full h-full bg-gradient-to-t from-black to-transparent z-10"></div>
        
        {/* Hero Image with Proper Sizing */}
        {siteConfig.heroImage && (
          <img
            src={getImageUrl(siteConfig.heroImage)}
            alt="Featured News"
            className="absolute inset-0 w-full h-full object-cover object-center transform scale-105 animate-slow-zoom"
            style={{ objectPosition: 'center 25%' }}
          />
        )}
        
        {/* Text Overlay Container */}
        <div className="absolute inset-0 z-20 flex flex-col justify-end px-4 sm:px-6 md:px-8 pb-10 sm:pb-12 md:pb-16 lg:pb-20 max-w-screen-lg mx-auto">
          {/* Breaking News Tag - Conditional */}
          {isBreaking && (
            <div className="flex items-center mb-3 sm:mb-4 animate-pulse">
              <span className="bg-red-600 text-white text-xs sm:text-sm py-1 px-2 sm:px-3 rounded-sm font-bold mr-2">
                BREAKING
              </span>
            </div>
          )}
          
          {/* Hero Headline */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-3 sm:mb-4 md:mb-5 leading-tight drop-shadow-lg">
            {siteConfig.heroHeadline}
          </h1>
          
          {/* Hero Subheading */}
          <p className="text-base sm:text-lg md:text-xl text-gray-200 mb-8 sm:mb-10 md:mb-12 max-w-2xl drop-shadow-md">
            {siteConfig.heroSubheading}
          </p>
          
          {/* CTA Button - Centered and Floating */}
          <div className="flex justify-center w-full">
            <Link
              to={siteConfig.heroCTALink || "/category/National"}
              className="inline-flex items-center justify-center bg-red-600 hover:bg-red-700 text-white px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 md:py-3 rounded-md font-semibold transition-all text-xs sm:text-sm md:text-base shadow-lg hover:shadow-xl transform hover:scale-105 animate-pulse-slow border border-white/20"
            >
              {siteConfig.heroCTAText || "Explore Top News"}
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* TICKER - Breaking News Ticker */}
      <div className="bg-red-700 text-white py-2 overflow-hidden relative">
        <div className="flex items-center px-2 sm:px-4">
          <div className="bg-black text-white px-2 py-1 text-xs sm:text-sm font-bold mr-4 whitespace-nowrap">
            BREAKING NEWS
          </div>
          <marquee scrollamount="4" scrolldelay="50" className="text-xs sm:text-sm font-medium">
            {breakingNews.length > 0 
              ? breakingNews.map((n) => n.title).join(" • ") 
              : newsItems.length > 0 
                ? newsItems.map((n) => n.title).join(" • ") 
                : "No breaking news available"}
          </marquee>
        </div>
      </div>

      {/* FEATURED STORIES - Improved grid layout */}
      <section className="mt-6 sm:mt-8 md:mt-10 px-4 sm:px-6 md:px-8 max-w-7xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-bold text-red-500 text-center mb-4 sm:mb-6 border-b border-gray-800 pb-2">
          Editor&apos;s Pick
        </h2>
        {featuredNews.length === 0 ? (
          <p className="text-center text-gray-300">
            No featured news available.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
            {featuredNews.map((news) => (
              <div
                key={news._id}
                className="bg-gray-800 rounded-lg shadow hover:shadow-xl transition-shadow flex flex-col"
              >
                {news.image && (
                  <div className="h-40 sm:h-36 md:h-40 overflow-hidden rounded-t-lg">
                    <img
                      src={getImageUrl(news.image)}
                      alt={news.title}
                      className="w-full h-full object-cover object-center transform transition-transform duration-500 hover:scale-110"
                    />
                  </div>
                )}
                <div className="p-3 sm:p-4 flex-grow flex flex-col">
                  <h3 className="text-md sm:text-lg font-bold mb-2 line-clamp-2">{news.title}</h3>
                  <p className="text-xs sm:text-sm text-gray-400 mb-3 flex-grow line-clamp-3">
                    {news.description.substring(0, 100)}...
                  </p>
                  <Link
                    to={`/news/${news._id}`}
                    className="text-blue-400 hover:underline text-sm sm:text-base mt-auto"
                  >
                    Read More
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* VIDEO HIGHLIGHTS - Improved responsive grid */}
      {videoHighlights.length > 0 && (
        <section className="mt-10 sm:mt-12 md:mt-14 px-4 sm:px-6 md:px-8 max-w-7xl mx-auto">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-red-500 text-center mb-4 sm:mb-6 border-b border-gray-800 pb-2">
            Video Highlights
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
            {videoHighlights.slice(0, 6).map((video) => {
              if (video.youtubeLink && video.youtubeLink.trim() !== "") {
                const embedUrl = getEmbedUrl(video.youtubeLink);
                if (!embedUrl) {
                  // If we can't parse the ID, skip or fallback
                  return null;
                }
                return (
                  <div
                    key={video._id}
                    className="bg-gray-800 rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden"
                  >
                    <div className="relative w-full pt-[56.25%]"> {/* 16:9 aspect ratio */}
                      <iframe
                        src={embedUrl}
                        title={video.title}
                        className="absolute top-0 left-0 w-full h-full"
                        allowFullScreen
                      ></iframe>
                    </div>
                    <div className="p-3 sm:p-4">
                      <h3 className="text-sm sm:text-md md:text-lg font-bold line-clamp-2">
                        {video.title}
                      </h3>
                    </div>
                  </div>
                );
              } else if (video.video && video.video.trim() !== "") {
                return (
                  <div
                    key={video._id}
                    className="bg-gray-800 rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden"
                  >
                    <div className="relative w-full pt-[56.25%]"> {/* 16:9 aspect ratio */}
                      <video
                        className="absolute top-0 left-0 w-full h-full"
                        src={getImageUrl(video.video)}
                        controls
                      />
                    </div>
                    <div className="p-3 sm:p-4">
                      <h3 className="text-sm sm:text-md md:text-lg font-bold line-clamp-2">
                        {video.title}
                      </h3>
                    </div>
                  </div>
                );
              }
              return null;
            })}
          </div>
        </section>
      )}

      {/* LATEST NEWS - Improved responsive grid */}
      <section className="mt-10 sm:mt-12 md:mt-14 px-4 sm:px-6 md:px-8 pb-10 sm:pb-12 md:pb-16 max-w-7xl mx-auto">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-red-500 text-center mb-4 sm:mb-6 border-b border-gray-800 pb-2">
          Latest Articles
        </h2>
        {latestNews.length === 0 ? (
          <p className="text-center text-gray-300">
            No recent articles available.
          </p>
        ) : (
          <div className="grid gap-4 sm:gap-6 md:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {latestNews.map((item) => (
              <Link
                to={`/news/${item._id}`}
                key={item._id}
                className="bg-gray-800 rounded-lg shadow hover:shadow-lg transition-shadow group flex flex-col h-full"
              >
                {item.image && (
                  <div className="h-36 sm:h-32 md:h-40 overflow-hidden rounded-t-lg">
                    <img
                      src={getImageUrl(item.image)}
                      alt={item.title}
                      className="w-full h-full object-cover object-center transform transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>
                )}
                <div className="p-3 sm:p-4 flex-grow">
                  <h3 className="text-sm sm:text-base md:text-lg font-semibold mb-2 group-hover:text-red-400 transition-colors line-clamp-2">
                    {item.title}
                  </h3>
                  <p className="text-xs text-gray-400 mb-2 line-clamp-3">
                    {item.description?.substring(0, 100)}...
                  </p>
                  <div className="flex items-center justify-between text-xs text-gray-500 mt-auto">
                    <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                    <span className="text-red-400 font-medium">Read More</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default Home;
