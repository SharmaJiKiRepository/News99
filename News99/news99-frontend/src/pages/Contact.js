import React, { useState } from 'react';
import axios from 'axios';
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    setError('');
    
    try {
      const res = await axios.post(`${API_URL}/contact`, formData);
      setSuccess(true);
      setFormData({ name: '', email: '', message: '' });
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-900 text-white min-h-screen">
      <div className="max-w-6xl mx-auto px-3 xs:px-4 sm:px-6 py-6 xs:py-8 sm:py-10 md:py-16">
        <h1 className="text-xl xs:text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-3 xs:mb-4 sm:mb-6 text-white">Contact Us</h1>
        <p className="text-center text-gray-400 max-w-2xl mx-auto mb-6 xs:mb-8 sm:mb-12 text-xs xs:text-sm sm:text-base">
          Have questions or feedback? We're here to help. Fill out the form below and our team will get back to you as soon as possible.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 xs:gap-5 sm:gap-6 md:gap-8 items-start">
          {/* Contact Form - Now first on mobile for better UX */}
          <div className="bg-gray-800 rounded-lg shadow-xl p-4 xs:p-5 sm:p-6 md:p-8 order-1">
            {success && (
              <div className="mb-4 xs:mb-5 sm:mb-6 p-3 xs:p-4 bg-green-900/30 border border-green-500/30 rounded-lg">
                <p className="text-green-400 text-xs xs:text-sm sm:text-base text-center">Your message has been sent successfully! We'll get back to you soon.</p>
              </div>
            )}

            {error && (
              <div className="mb-4 xs:mb-5 sm:mb-6 p-3 xs:p-4 bg-red-900/30 border border-red-500/30 rounded-lg">
                <p className="text-red-400 text-xs xs:text-sm sm:text-base text-center">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3 xs:space-y-4 sm:space-y-6">
              {/* Name Field */}
              <div>
                <label htmlFor="name" className="block text-xs xs:text-sm font-medium text-gray-300 mb-1">
                  Full Name
                </label>
                <div className="flex items-center border border-gray-600 rounded-lg focus-within:ring-2 focus-within:ring-red-500 bg-gray-700">
                  <FaUser className="text-gray-400 mx-2 xs:mx-3" size={14} />
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full p-2 xs:p-2.5 sm:p-3 outline-none bg-transparent text-white text-xs xs:text-sm"
                    placeholder="Enter your name"
                    required
                  />
                </div>
              </div>

              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-xs xs:text-sm font-medium text-gray-300 mb-1">
                  Email Address
                </label>
                <div className="flex items-center border border-gray-600 rounded-lg focus-within:ring-2 focus-within:ring-red-500 bg-gray-700">
                  <FaEnvelope className="text-gray-400 mx-2 xs:mx-3" size={14} />
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full p-2 xs:p-2.5 sm:p-3 outline-none bg-transparent text-white text-xs xs:text-sm"
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>

              {/* Message Field */}
              <div>
                <label htmlFor="message" className="block text-xs xs:text-sm font-medium text-gray-300 mb-1">
                  Message
                </label>
                <div className="border border-gray-600 rounded-lg focus-within:ring-2 focus-within:ring-red-500 bg-gray-700">
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    className="w-full p-2 xs:p-2.5 sm:p-3 outline-none bg-transparent text-white text-xs xs:text-sm"
                    rows="4"
                    placeholder="Your message"
                    required
                  ></textarea>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-red-600 hover:bg-red-700 text-white py-2 xs:py-2.5 sm:py-3 rounded-lg transition duration-300 text-xs xs:text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </div>

          {/* Contact Information */}
          <div className="bg-gray-800 rounded-lg shadow-xl p-4 xs:p-5 sm:p-6 md:p-8 order-2">
            <h2 className="text-lg xs:text-xl sm:text-2xl font-semibold mb-3 xs:mb-4 sm:mb-6 text-white">Contact Information</h2>
            
            <div className="space-y-3 xs:space-y-4 sm:space-y-6">
              <div className="flex items-start">
                <div className="bg-gray-700 rounded-full p-2 xs:p-2.5 mr-3 xs:mr-4 flex-shrink-0">
                  <FaPhone className="text-red-500" size={16} />
                </div>
                <div>
                  <h3 className="text-sm xs:text-base font-medium text-gray-200">Phone</h3>
                  <p className="text-gray-400 text-xs xs:text-sm sm:text-base">+91 9254722542</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="bg-gray-700 rounded-full p-2 xs:p-2.5 mr-3 xs:mr-4 flex-shrink-0">
                  <FaEnvelope className="text-red-500" size={16} />
                </div>
                <div>
                  <h3 className="text-sm xs:text-base font-medium text-gray-200">Email</h3>
                  <p className="text-gray-400 text-xs xs:text-sm sm:text-base break-all">news99publications@gmail.com</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="bg-gray-700 rounded-full p-2 xs:p-2.5 mr-3 xs:mr-4 flex-shrink-0">
                  <FaMapMarkerAlt className="text-red-500" size={16} />
                </div>
                <div>
                  <h3 className="text-sm xs:text-base font-medium text-gray-200">Office Address</h3>
                  <p className="text-gray-400 text-xs xs:text-sm sm:text-base">
                    News99 Publications, Delhi NCR, India
                  </p>
                </div>
              </div>
            </div>
            
            <div className="mt-4 xs:mt-5 sm:mt-6 md:mt-8 p-3 xs:p-4 bg-gray-700 rounded-lg">
              <h3 className="text-sm xs:text-base font-medium text-white mb-1 xs:mb-2">Business Hours</h3>
              <p className="text-gray-300 text-xs xs:text-sm">Monday - Friday: 9:00 AM - 6:00 PM</p>
              <p className="text-gray-300 text-xs xs:text-sm">Saturday: 10:00 AM - 4:00 PM</p>
              <p className="text-gray-300 text-xs xs:text-sm">Sunday: Closed</p>
            </div>

            {/* Map Embed (only on larger screens) */}
            <div className="mt-4 xs:mt-5 sm:mt-8 rounded-lg overflow-hidden hidden xs:block">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d448193.95104811017!2d76.76355621214013!3d28.644287358277957!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390cfd5b347eb62d%3A0x37205b715389640!2sDelhi!5e0!3m2!1sen!2sin!4v1689870841082!5m2!1sen!2sin"
                width="100%"
                height="180"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Our Location"
              ></iframe>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Contact;
