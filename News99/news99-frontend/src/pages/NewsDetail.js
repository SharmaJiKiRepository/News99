// news99-frontend/src/pages/NewsDetail.js

import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const BASE_URL = process.env.REACT_APP_BASE_URL || 'http://localhost:5000';

// A more forgiving function to extract the YouTube video ID:
const getVideoId = (url) => {
  if (!url) return "";
  try {
    // Attempt to parse as a URL
    const parsed = new URL(url);
    // If youtube.com, read "?v=xxxx"
    if (parsed.hostname.includes("youtube.com")) {
      return parsed.searchParams.get("v") || "";
    }
    // If youtu.be/xxxx
    if (parsed.hostname.includes("youtu.be")) {
      return parsed.pathname.slice(1);
    }
  } catch {
    // Fallback to regex if new URL fails
    const regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=)([^#\?\s]*).*/;
    const match = url.match(regExp);
    if (match && match[2]) return match[2];
  }
  return "";
};

const getEmbedUrl = (url) => {
  const videoId = getVideoId(url);
  return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=0` : "";
};

const getImageUrl = (path) => {
  if (!path) return "";
  if (path.startsWith("http") || path.startsWith("https")) return path;
  return `${BASE_URL}${path}`;
};

const NewsDetail = () => {
  const { id } = useParams(); // news ID
  const [news, setNews] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Comments
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const res = await axios.get(`${API_URL}/news/${id}`);
        setNews(res.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch news");
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, [id]);

  // Fetch comments from /news/:newsId/comments
  useEffect(() => {
    const fetchComments = async () => {
      try {
        const res = await axios.get(`${API_URL}/news/${id}/comments`);
        setComments(res.data);
      } catch (err) {
        console.log("Failed to load comments", err.response?.data?.message);
      }
    };
    fetchComments();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
        <p className="text-xl">Loading news details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
        <p className="text-red-500 text-xl">{error}</p>
      </div>
    );
  }

  if (!news) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
        <p className="text-xl">No news found.</p>
      </div>
    );
  }

  // Social share
  const currentUrl = window.location.href;
  const shareText = encodeURIComponent(`Check out this news: ${news.title}`);
  const facebookShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`;
  const twitterShareUrl = `https://twitter.com/intent/tweet?text=${shareText}&url=${encodeURIComponent(currentUrl)}`;
  const whatsappShareUrl = `https://api.whatsapp.com/send?text=${shareText}%20${encodeURIComponent(currentUrl)}`;

  // Submit new comment
  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("You must be logged in to comment!");
        return;
      }
      const headers = { Authorization: `Bearer ${token}` };
      const res = await axios.post(
        `${API_URL}/news/${id}/comments`,
        { text: newComment },
        { headers }
      );
      // If success, prepend new comment to list
      setComments((prev) => [res.data.comment, ...prev]);
      setNewComment("");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to post comment.");
    }
  };

  return (
    <div className="bg-gray-900 text-white min-h-screen py-6 md:py-8 px-4">
      <article className="max-w-4xl mx-auto bg-gray-800 rounded-lg shadow-xl overflow-hidden">
        {/* Main Content Area */}
        <div className="p-4 sm:p-6 md:p-8">
          {/* Title */}
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 leading-tight text-white">{news.title}</h1>
          
          {/* Author and Date info */}
          <div className="text-xs sm:text-sm text-gray-400 mb-6">
            By {typeof news.author === "string" ? news.author : news.author?.username || "Unknown"} on{" "}
            {new Date(news.createdAt).toLocaleDateString()}
          </div>

          {/* If we have an image, show it */}
          {news.image && (
            <div className="mb-6">
              <img
                src={getImageUrl(news.image)}
                alt={news.title}
                className="w-full h-auto max-h-[200px] sm:max-h-[300px] md:max-h-[400px] object-contain rounded-lg shadow-lg"
              />
            </div>
          )}

          {/* If we have a local video, show it */}
          {news.video && news.video.trim() !== "" && (
            <div className="mb-6">
              <video
                className="w-full h-auto rounded-lg shadow-lg"
                src={getImageUrl(news.video)}
                controls
              />
            </div>
          )}

          {/* If we have a YouTube link, show embed */}
          {news.youtubeLink && news.youtubeLink.trim() !== "" && (
            <div className="relative w-full mb-6 rounded-lg overflow-hidden shadow-lg" style={{ paddingTop: "56.25%" }}>
              <iframe
                src={getEmbedUrl(news.youtubeLink)}
                title={news.title}
                className="absolute top-0 left-0 w-full h-full"
                allowFullScreen
              ></iframe>
            </div>
          )}

          {/* News Content */}
          <div className="mt-6 mb-8">
            <div className="text-gray-300 space-y-4 leading-relaxed text-sm sm:text-base">
              {news.description.split('\n').map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          </div>

          {/* Social share */}
          <div className="mt-8 pt-6 border-t border-gray-700">
            <h2 className="text-lg sm:text-xl font-semibold mb-4 text-white">Share this article</h2>
            <div className="flex flex-wrap gap-4">
              <a
                href={facebookShareUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full text-xs sm:text-sm transition-colors"
              >
                Share on Facebook
              </a>
              <a
                href={twitterShareUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-blue-400 hover:bg-blue-500 text-white px-4 py-2 rounded-full text-xs sm:text-sm transition-colors"
              >
                Share on Twitter
              </a>
              <a
                href={whatsappShareUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-full text-xs sm:text-sm transition-colors"
              >
                Share on WhatsApp
              </a>
            </div>
          </div>

          {/* Comments Section */}
          <div className="mt-8 pt-6 border-t border-gray-700">
            <h2 className="text-lg sm:text-xl font-semibold mb-4 text-white">Comments</h2>

            {/* Comment Form */}
            <form onSubmit={handleCommentSubmit} className="mb-6">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write a comment..."
                className="w-full p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition mb-3"
                rows="3"
              ></textarea>
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors"
              >
                Post Comment
              </button>
            </form>

            {/* Display Comments */}
            {comments.length === 0 ? (
              <p className="text-gray-400 text-center py-4">No comments yet. Be the first to comment!</p>
            ) : (
              <div className="space-y-4">
                {comments.map((comment) => (
                  <div key={comment._id} className="bg-gray-700 p-3 sm:p-4 rounded-lg">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-2">
                      <span className="font-medium text-sm">{comment.userId?.username || "Unknown User"}</span>
                      <span className="text-xs text-gray-400">{new Date(comment.createdAt).toLocaleString()}</span>
                    </div>
                    <p className="text-gray-200 text-sm sm:text-base">{comment.text}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </article>
    </div>
  );
};

export default NewsDetail;
