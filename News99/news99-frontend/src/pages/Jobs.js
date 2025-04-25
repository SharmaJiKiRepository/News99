// news99-frontend/src/pages/Jobs.js
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAllJobs } from "../services/authService";

function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const fetchedJobs = await getAllJobs();
        setJobs(fetchedJobs);
      } catch (err) {
        setError(err.message || "Failed to fetch jobs");
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-gray-900 text-white py-6 sm:py-8 md:py-10 px-4 sm:px-6 flex items-center justify-center">
        <div className="max-w-6xl w-full">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center text-white mb-4 sm:mb-6">
            Available Jobs
          </h1>
          <p className="text-center text-gray-400">Loading jobs...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen w-full bg-gray-900 text-white py-6 sm:py-8 md:py-10 px-4 sm:px-6 flex items-center justify-center">
        <div className="max-w-6xl w-full">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center text-white mb-4 sm:mb-6">
            Available Jobs
          </h1>
          <p className="text-center text-red-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gray-900 text-white py-6 sm:py-8 md:py-10 px-4 sm:px-6 flex items-center justify-center">
      <div className="max-w-6xl w-full">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center text-white mb-4 sm:mb-6 md:mb-8">
          Available Jobs
        </h1>

        {jobs.length === 0 ? (
          <p className="text-center text-gray-400">
            No jobs are currently available.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {jobs.map((job) => (
              <div
                key={job._id}
                className="bg-gray-800 shadow-lg rounded-lg overflow-hidden transition-all duration-300 hover:shadow-xl hover:translate-y-[-2px]"
              >
                {/* Job Content */}
                <div className="p-4 sm:p-5">
                  <h3 className="text-lg sm:text-xl font-semibold text-white mb-2 line-clamp-2">
                    {job.title}
                  </h3>
                  <p className="text-gray-300 text-sm mb-3 line-clamp-3">
                    {job.description?.slice(0, 100)}...
                  </p>
                  
                  <div className="space-y-2 mb-4">
                    <p className="text-gray-400 text-xs sm:text-sm flex items-center">
                      <span className="font-medium mr-2">Location:</span> 
                      <span>{job.location || "Remote"}</span>
                    </p>
                    <p className="text-gray-400 text-xs sm:text-sm flex items-center">
                      <span className="font-medium mr-2">Company:</span> 
                      <span>{job.company || "News99"}</span>
                    </p>
                  </div>

                  <Link
                    to={`/job-application/${job._id}`}
                    className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-md text-center block transition duration-300 text-sm font-medium"
                  >
                    Apply Now
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Jobs;
