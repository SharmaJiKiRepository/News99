// news99-frontend/src/pages/CategoryNews.js
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

const BASE_URL = process.env.REACT_APP_BASE_URL || 'http://localhost:5000';
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const getImageUrl = (image) => {
  if (!image) return "";
  if (image.startsWith("http") || image.startsWith("https")) return image;
  return `${BASE_URL}${image}`;
};

function CategoryNews() {
  const { category } = useParams();
  const [newsItems, setNewsItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    axios
      .get(`${API_URL}/news?category=${encodeURIComponent(category)}`)
      .then(response => {
        setNewsItems(response.data);
        setLoading(false);
      })
      .catch(err => {
        setError('Failed to load news for this category.');
        setLoading(false);
      });
  }, [category]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading news for {category}...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="category-news-page max-w-4xl mx-auto px-4 py-8">
      <header className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-red-600">
          {category} News
        </h1>
      </header>
      {newsItems.length === 0 ? (
        <p>No news found in this category.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {newsItems.map(news => (
            <div
              key={news._id}
              className="card border border-gray-300 shadow-md rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300"
            >
              {news.image && (
                <img
                  src={getImageUrl(news.image)}
                  alt={news.title}
                  className="w-full h-40 object-cover sm:h-48 md:h-56"
                />
              )}
              <div className="p-4">
                <h3 className="text-lg font-bold text-black">{news.title}</h3>
                <p className="text-sm mt-2 text-gray-700">
                  {news.description.substring(0, 100)}...
                </p>
                <Link
                  to={`/news/${news._id}`}
                  className="text-blue-500 mt-2 inline-block"
                >
                  Read More
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default CategoryNews;
