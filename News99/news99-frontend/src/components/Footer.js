import React from 'react';
import { Link } from 'react-router-dom';
import { FaTwitter, FaFacebookF, FaYoutube, FaInstagram, FaEnvelope, FaMapMarkerAlt, FaPhone } from 'react-icons/fa';
import logo from "../logo.jpg"; // Assuming logo.jpg is in src/

function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-gray-900 text-gray-400 border-t border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 sm:pt-10 md:pt-12 pb-6 sm:pb-8">
        <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8">
          {/* Column 1 - About */}
          <div className="col-span-1 xs:col-span-2 md:col-span-1">
            <Link to="/" className="inline-block mb-4">
               <img src={logo} alt="News99" className="h-10 sm:h-12 w-auto" />
            </Link>
            <p className="mb-4 text-xs sm:text-sm leading-relaxed text-gray-500">
              News99 brings you the latest breaking news, in-depth analysis, and exclusive coverage from around the world. Your trusted source for staying informed.
            </p>
            <div className="flex space-x-2 sm:space-x-3 mt-4">
              <a href="#" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white bg-gray-800 hover:bg-red-600 h-8 w-8 sm:h-9 sm:w-9 rounded-full flex items-center justify-center transition-colors">
                <FaFacebookF className="text-xs sm:text-sm" />
              </a>
              <a href="#" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white bg-gray-800 hover:bg-red-600 h-8 w-8 sm:h-9 sm:w-9 rounded-full flex items-center justify-center transition-colors">
                <FaTwitter className="text-xs sm:text-sm" />
              </a>
              <a href="https://youtube.com/@news99publications" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white bg-gray-800 hover:bg-red-600 h-8 w-8 sm:h-9 sm:w-9 rounded-full flex items-center justify-center transition-colors">
                <FaYoutube className="text-xs sm:text-sm" />
              </a>
              <a href="#" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white bg-gray-800 hover:bg-red-600 h-8 w-8 sm:h-9 sm:w-9 rounded-full flex items-center justify-center transition-colors">
                <FaInstagram className="text-xs sm:text-sm" />
              </a>
            </div>
          </div>

          {/* Column 2 - Quick Links */}
          <div>
            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-white border-b-2 border-red-600 pb-1 sm:pb-2 inline-block">Quick Links</h3>
            <ul className="space-y-1 sm:space-y-2 text-sm">
              <li><Link to="/" className="hover:text-red-500 transition-colors">Home</Link></li>
              <li><Link to="/about" className="hover:text-red-500 transition-colors">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-red-500 transition-colors">Contact</Link></li>
              <li><Link to="/categories" className="hover:text-red-500 transition-colors">Categories</Link></li>
              <li><Link to="/jobs" className="hover:text-red-500 transition-colors">Careers</Link></li>
              <li><Link to="/privacy-policy" className="hover:text-red-500 transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>

          {/* Column 3 - Popular Categories */}
          <div>
            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-white border-b-2 border-red-600 pb-1 sm:pb-2 inline-block">Categories</h3>
            <ul className="space-y-1 sm:space-y-2 text-sm">
              <li><Link to="/category/national" className="hover:text-red-500 transition-colors">National</Link></li>
              <li><Link to="/category/international" className="hover:text-red-500 transition-colors">International</Link></li>
              <li><Link to="/category/business" className="hover:text-red-500 transition-colors">Business</Link></li>
              <li><Link to="/category/technology" className="hover:text-red-500 transition-colors">Technology</Link></li>
              <li><Link to="/category/sports" className="hover:text-red-500 transition-colors">Sports</Link></li>
              <li><Link to="/category/entertainment" className="hover:text-red-500 transition-colors">Entertainment</Link></li>
            </ul>
          </div>

          {/* Column 4 - Contact */}
          <div>
            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-white border-b-2 border-red-600 pb-1 sm:pb-2 inline-block">Contact Us</h3>
            <ul className="space-y-2 sm:space-y-3 text-sm">
              <li className="flex items-start">
                <FaMapMarkerAlt className="text-red-500 mt-1 mr-2 sm:mr-3 flex-shrink-0 text-xs sm:text-sm" />
                <span>123 News Street, New Delhi, India</span>
              </li>
              <li className="flex items-center">
                <FaPhone className="text-red-500 mr-2 sm:mr-3 flex-shrink-0 text-xs sm:text-sm" />
                <span>+91 1234567890</span>
              </li>
              <li className="flex items-center">
                <FaEnvelope className="text-red-500 mr-2 sm:mr-3 flex-shrink-0 text-xs sm:text-sm" />
                <a href="mailto:contact@news99.com" className="hover:text-red-500 transition-colors">
                  contact@news99.com
                </a>
              </li>
            </ul>
            <div className="mt-4 sm:mt-6">
              <h4 className="text-xs sm:text-sm font-semibold mb-2 text-white">Subscribe to Newsletter</h4>
              <form className="flex flex-col xs:flex-row">
                <input
                  type="email"
                  placeholder="Your email address"
                  aria-label="Email for newsletter"
                  required
                  className="bg-gray-800 border border-gray-700 text-xs sm:text-sm rounded-lg xs:rounded-r-none xs:rounded-l-lg px-3 py-2 focus:outline-none focus:border-red-500 flex-grow text-gray-200 placeholder-gray-500 w-full mb-2 xs:mb-0"
                />
                <button
                  type="submit"
                  className="bg-red-600 hover:bg-red-700 text-white rounded-lg xs:rounded-l-none xs:rounded-r-lg px-3 py-2 transition-colors text-xs sm:text-sm font-medium w-full xs:w-auto"
                >
                  Subscribe
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Copyright Section */}
        <div className="border-t border-gray-700 mt-6 sm:mt-8 pt-4 sm:pt-6 text-center">
         <p className="text-xs sm:text-sm text-gray-500">
  &copy; {currentYear} News99. All Rights Reserved. Designed & Developed by{" "}
  <a
    href="https://wa.me/919817523917"
    target="_blank"
    rel="noopener noreferrer"
    className="text-red-500 font-semibold hover:underline"
  >
    Harsh Bhardwaj
  </a>.
</p>

        </div>
      </div>
    </footer>
  );
}

export default Footer;