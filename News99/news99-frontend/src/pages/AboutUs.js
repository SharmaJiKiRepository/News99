import React from "react";

const AboutUs = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center py-6 xs:py-8 sm:py-10 md:py-12 px-3 xs:px-4 sm:px-6">
      <div className="max-w-6xl w-full p-3 xs:p-4 sm:p-6 bg-gray-800 rounded-lg shadow-md">
        <h1 className="text-xl xs:text-2xl sm:text-3xl md:text-4xl font-bold text-center text-white mb-4 xs:mb-5 sm:mb-6 md:mb-8">
          About Us
        </h1>
        <div className="flex flex-col lg:flex-row items-center lg:items-start lg:space-x-10">
          {/* Image Section */}
          <div className="lg:w-1/2 w-full mb-4 xs:mb-5 sm:mb-6 lg:mb-0">
            <img
              src="https://via.placeholder.com/500x350"
              alt="About Us"
              className="rounded-lg shadow-lg w-full h-auto object-cover"
            />
          </div>

          {/* Content Section */}
          <div className="lg:w-1/2 w-full">
            <p className="text-gray-300 text-xs xs:text-sm sm:text-base md:text-lg leading-relaxed mb-3 xs:mb-4 sm:mb-6">
              Welcome to News99, where we empower both users and reporters
              to share knowledge, ideas, and insights. We are committed to
              providing a seamless experience for our users, whether they are
              browsing articles, writing as reporters, or collaborating on
              unique projects.
            </p>
            <p className="text-gray-300 text-xs xs:text-sm sm:text-base md:text-lg leading-relaxed mb-3 xs:mb-4 sm:mb-6">
              Our mission is to create a space where meaningful stories are
              shared, valuable information is delivered, and a vibrant community
              is nurtured. With a dedicated team and a vision to innovate, we
              strive to make this platform a trusted source for all.
            </p>
            <p className="text-gray-300 text-xs xs:text-sm sm:text-base md:text-lg leading-relaxed">
              Whether you're here to read, write, or grow, we're here to support
              you every step of the way. Together, let's build something
              extraordinary.
            </p>
          </div>
        </div>
      </div>

      {/* Meet the Team Section */}
      <div className="max-w-6xl w-full mt-4 xs:mt-5 sm:mt-8 md:mt-12 p-3 xs:p-4 sm:p-6 bg-gray-800 rounded-lg shadow-md">
        <h2 className="text-lg xs:text-xl sm:text-2xl md:text-3xl font-bold text-center text-white mb-3 xs:mb-4 sm:mb-6">
          Meet the Team
        </h2>
        <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-3 xs:gap-4 sm:gap-6">
          {/* Team Member 1 */}
          <div className="bg-gray-700 p-3 xs:p-4 rounded-lg text-center shadow-lg">
            <img
              src="https://via.placeholder.com/100"
              alt="Team Member"
              className="w-14 h-14 xs:w-16 xs:h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 mx-auto rounded-full mb-2 xs:mb-3 sm:mb-4"
            />
            <h3 className="text-base xs:text-lg sm:text-xl font-semibold text-white">Ashok Kumar</h3>
            <p className="text-gray-400 text-xs xs:text-sm sm:text-base">CEO & Founder</p>
          </div>

          {/* Team Member 2 */}
          <div className="bg-gray-700 p-3 xs:p-4 rounded-lg text-center shadow-lg">
            <img
              src="https://via.placeholder.com/100"
              alt="Team Member"
              className="w-14 h-14 xs:w-16 xs:h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 mx-auto rounded-full mb-2 xs:mb-3 sm:mb-4"
            />
            <h3 className="text-base xs:text-lg sm:text-xl font-semibold text-white">Harsh Bhardwaj</h3>
            <p className="text-gray-400 text-xs xs:text-sm sm:text-base">Lead Developer</p>
          </div>

          {/* Team Member 3 */}
          <div className="bg-gray-700 p-3 xs:p-4 rounded-lg text-center shadow-lg">
            <img
              src="https://via.placeholder.com/100"
              alt="Team Member"
              className="w-14 h-14 xs:w-16 xs:h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 mx-auto rounded-full mb-2 xs:mb-3 sm:mb-4"
            />
            <h3 className="text-base xs:text-lg sm:text-xl font-semibold text-white">Harsh Bhardwaj</h3>
            <p className="text-gray-400 text-xs xs:text-sm sm:text-base">Marketing Manager</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;
