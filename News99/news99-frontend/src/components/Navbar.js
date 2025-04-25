import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import logo from "../logo.jpg";
import { FaYoutube, FaFacebookF, FaTwitter, FaInstagram, FaWhatsapp, FaSearch, FaBars, FaTimes, FaBriefcase } from "react-icons/fa";

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function Navbar({ user, onLogout }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [categories, setCategories] = useState([]);
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const menuRef = useRef(null);

  // Toggle mobile menu
  const toggleMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
    // When opening menu, prevent body scrolling
    if (!mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  };

  // Update date and time every second
  useEffect(() => {
    const timerId = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);

    return () => {
      clearInterval(timerId);
    };
  }, []);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get(`${API_URL}/categories`);
        setCategories(res.data);
      } catch (error) {
        console.error("Failed to fetch categories", error);
      }
    };
    fetchCategories();
  }, []);

  // Handle outside click to close mobile menu
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMobileMenuOpen(false);
        document.body.style.overflow = "auto";
      }
    }

    if (mobileMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [mobileMenuOpen]);

  // Clean up overflow style when component unmounts
  useEffect(() => {
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  // Handle search submit
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    // Implement search functionality here
    console.log("Searching for:", searchQuery);
    // Reset search and close menu
    setSearchQuery("");
    setMobileMenuOpen(false);
  };

  return (
    <nav className="bg-black text-white shadow-lg">
      {/* Top Bar with Date/Time and YouTube Link */}
      <div className="bg-red-700 py-2 px-4 hidden sm:flex items-center justify-between">
        <div className="text-sm text-white font-medium whitespace-nowrap">
          <span>{currentDateTime.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
          <span className="mx-2">|</span>
          <span>{currentDateTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}</span>
        </div>

        {/* YouTube Link - Right Side */}
        <a
          href="https://www.youtube.com/@news99publications"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center space-x-2 text-sm font-bold hover:underline"
        >
          <FaYoutube className="text-white text-lg" />
          <span>Visit our YouTube Channel: News99 Publications</span>
        </a>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between py-3">
        {/* Mobile Hamburger Menu Button */}
        <button
          onClick={toggleMenu}
          className="lg:hidden text-white hover:text-gray-400 p-2"
          aria-label="Toggle navigation"
        >
          <FaBars className="h-6 w-6" />
        </button>

        {/* Logo - Center for mobile, left for desktop */}
        <div className="lg:order-first flex-1 flex justify-center lg:justify-start">
          <Link to="/" className="flex-shrink-0">
            <img src={logo} alt="News99 Logo" className="h-10 md:h-12 w-auto" />
          </Link>
        </div>

        {/* Desktop Navigation Links - hidden on mobile */}
        <div className="hidden lg:flex lg:items-center lg:space-x-4 xl:space-x-6">
          <Link to="/" className="text-white hover:text-red-500 font-medium px-3 py-2">
            Home
          </Link>
          
          <div className="relative group">
            <button className="text-white hover:text-red-500 font-medium px-3 py-2 flex items-center">
              Categories <span className="ml-1">▼</span>
            </button>
            <div className="absolute left-0 mt-1 w-48 bg-black border border-gray-800 rounded shadow-xl z-50 hidden group-hover:block">
              {categories.map((cat) => (
                <Link
                  key={cat}
                  to={`/category/${cat}`}
                  className="block px-4 py-2 hover:bg-red-600 whitespace-nowrap"
                >
                  {cat}
                </Link>
              ))}
            </div>
          </div>
          
          {/* Special styling for Jobs link */}
          <Link 
            to="/jobs" 
            className="bg-red-600 text-white hover:bg-red-700 font-bold px-4 py-2 rounded-md flex items-center space-x-1 relative border-b-2 border-yellow-400 shadow-md transform transition-transform hover:scale-105"
          >
            <FaBriefcase className="text-yellow-300" />
            <span>JOBS</span>
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-300 rounded-full animate-pulse"></div>
          </Link>
          
          <Link to="/contact" className="text-white hover:text-red-500 font-medium px-3 py-2">
            Contact
          </Link>
          <Link to="/about" className="text-white hover:text-red-500 font-medium px-3 py-2">
            About Us
          </Link>

          {/* Auth Links for Desktop */}
          {user ? (
            <>
              {user.role === "admin" ? (
                <Link to="/admin" className="text-white hover:text-red-500 font-medium px-3 py-2">
                  Admin Dashboard
                </Link>
              ) : (
                <Link to="/profile" className="text-white hover:text-red-500 font-medium px-3 py-2">
                  Profile
                </Link>
              )}
              <button onClick={onLogout} className="text-red-500 hover:text-red-700 font-medium px-3 py-2">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-white hover:text-red-500 font-medium px-3 py-2">
                Login
              </Link>
              <Link to="/register" className="text-white hover:text-red-500 font-medium px-3 py-2">
                Register
              </Link>
            </>
          )}
        </div>

        {/* Search Icon for Mobile */}
        <div className="lg:hidden">
          <button className="text-white p-2">
            <FaSearch className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Mobile Menu - Slide-out drawer */}
      <div 
        ref={menuRef}
        className={`fixed top-0 left-0 w-80 h-full bg-gray-900 z-50 shadow-xl transform transition-transform duration-300 ease-in-out ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        } overflow-y-auto`}
      >
        {/* Mobile Menu Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-800">
          <Link to="/" onClick={() => setMobileMenuOpen(false)}>
            <img src={logo} alt="News99 Logo" className="h-8 w-auto" />
          </Link>
          <button onClick={toggleMenu} className="text-white hover:text-red-500">
            <FaTimes className="h-6 w-6" />
          </button>
        </div>

        {/* Social Media Icons */}
        <div className="flex justify-center space-x-4 py-3 border-b border-gray-800">
          <a href="#" className="text-gray-400 hover:text-white">
            <FaFacebookF className="h-5 w-5" />
          </a>
          <a href="#" className="text-gray-400 hover:text-white">
            <FaTwitter className="h-5 w-5" />
          </a>
          <a href="#" className="text-gray-400 hover:text-white">
            <FaInstagram className="h-5 w-5" />
          </a>
          <a href="#" className="text-gray-400 hover:text-white">
            <FaWhatsapp className="h-5 w-5" />
          </a>
          <a href="https://www.youtube.com/@news99publications" className="text-gray-400 hover:text-white">
            <FaYoutube className="h-5 w-5" />
          </a>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b border-gray-800">
          <form onSubmit={handleSearchSubmit} className="flex">
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-800 text-white px-4 py-2 rounded-l focus:outline-none"
            />
            <button
              type="submit"
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-r"
            >
              <FaSearch />
            </button>
          </form>
        </div>

        {/* Mobile Menu Links */}
        <div className="py-2">
          <Link 
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-4 py-2 hover:bg-gray-800 border-b border-gray-800"
          >
            Home
          </Link>
          <div className="block px-4 py-2 hover:bg-gray-800 border-b border-gray-800">
            <div className="flex justify-between items-center cursor-pointer">
              <span>Categories</span>
              <span>▼</span>
            </div>
            <div className="pl-4 mt-2 space-y-1">
              {categories.map((cat) => (
                <Link
                  key={cat}
                  to={`/category/${cat}`}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-1 hover:text-red-500"
                >
                  {cat}
                </Link>
              ))}
            </div>
          </div>
          
          {/* Special styling for Jobs in mobile menu too */}
          <Link
            to="/jobs"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center px-4 py-3 border-b border-gray-800 bg-red-600 text-white space-x-2 font-bold"
          >
            <FaBriefcase className="text-yellow-300" />
            <span>JOBS</span>
            <div className="w-2 h-2 bg-yellow-300 rounded-full ml-1 animate-pulse"></div>
          </Link>
          
          <Link
            to="/contact"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-4 py-2 hover:bg-gray-800 border-b border-gray-800"
          >
            Contact
          </Link>
          <Link
            to="/about"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-4 py-2 hover:bg-gray-800 border-b border-gray-800"
          >
            About Us
          </Link>

          {/* Auth Links for Mobile */}
          {user ? (
            <>
              {user.role === "admin" ? (
                <Link
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-2 hover:bg-gray-800 border-b border-gray-800"
                >
                  Admin Dashboard
                </Link>
              ) : (
                <Link
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-2 hover:bg-gray-800 border-b border-gray-800"
                >
                  Profile
                </Link>
              )}
              <button
                onClick={() => {
                  onLogout();
                  setMobileMenuOpen(false);
                }}
                className="block w-full text-left px-4 py-2 hover:bg-gray-800 border-b border-gray-800 text-red-500"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-2 hover:bg-gray-800 border-b border-gray-800"
              >
                Login
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-2 hover:bg-gray-800 border-b border-gray-800"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Modal Overlay for Mobile Menu */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={toggleMenu}
        />
      )}
    </nav>
  );
}

export default Navbar;
