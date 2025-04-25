// news99-frontend/src/pages/Categories.js
import React from 'react';
import { Link } from 'react-router-dom';

function Categories() {
  const categories = [
    "National",
    "International",
    "Business",
    "Sports",
    "Entertainment",
    "Technology",
    "Health",
    "Lifestyle",
    "Science",
    "Education",
    "Regional",
    "Editorials",
    "Videos"
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-white py-8 px-4 sm:px-6">
      {/* Header Section */}
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">
            News <span className="text-red-500">Categories</span>
          </h1>
          <p className="mt-2 text-sm sm:text-base text-gray-400">
            Explore our wide range of topics to stay informed
          </p>
        </header>
        
        {/* Categories Grid */}
        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
          {categories.map((category) => (
            <Link 
              key={category}
              to={`/category/${encodeURIComponent(category)}`} 
              aria-label={`View ${category} news`}
              className="bg-gray-800 border border-gray-700 hover:border-red-500 rounded-lg p-4 sm:p-5 text-center group transition-all duration-300 hover:bg-gray-750 hover:shadow-xl"
            >
              <span className="text-base sm:text-lg font-medium text-gray-200 group-hover:text-white">
                {category}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Categories;
