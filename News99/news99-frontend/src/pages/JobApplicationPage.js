// news99-frontend/src/pages/JobApplicationPage.js
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { getAllJobs } from "../services/authService";

const JobApplicationPage = () => {
  const { jobId } = useParams(); // jobId from URL
  const navigate = useNavigate();

  // State for job details
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Application form state
  const [applicant, setApplicant] = useState({
    applicantName: "",
    applicantEmail: "",
    resume: "",       // Optional resume link
    resumeFile: null, // File input
  });

  // Fetch job details
  useEffect(() => {
    const fetchSingleJob = async () => {
      try {
        const allJobs = await getAllJobs();
        const foundJob = allJobs.find((j) => j._id === jobId);
        if (!foundJob) {
          setError("Job not found.");
        } else {
          setJob(foundJob);
        }
      } catch (err) {
        setError("Failed to load job details.");
      } finally {
        setLoading(false);
      }
    };
    fetchSingleJob();
  }, [jobId]);

  // Handle text input changes
  const handleChange = (e) => {
    setApplicant({ ...applicant, [e.target.name]: e.target.value });
  };

  // Handle file input changes
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setApplicant((prev) => ({ ...prev, resumeFile: e.target.files[0] }));
    }
  };

  // Submit application (with file)
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate that at least one resume source is provided
    if (!applicant.resume && !applicant.resumeFile) {
      alert("Please provide a resume link or upload your resume file.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("You must be logged in to apply.");
        navigate("/login");
        return;
      }

      // Prepare form data
      const formData = new FormData();
      formData.append("applicantName", applicant.applicantName);
      formData.append("applicantEmail", applicant.applicantEmail);
      formData.append("resume", applicant.resume); // Optional link
      if (applicant.resumeFile) {
        formData.append("resumeFile", applicant.resumeFile);
      }

      // Submit the application via the apply-file endpoint
      const response = await axios.post(
        `http://localhost:5000/api/jobs/${jobId}/apply-file`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      console.log("Application submitted:", response.data);
      alert("Application submitted successfully!");
      navigate("/jobs");
    } catch (err) {
      console.error("Error submitting application:", err);
      alert(err.response?.data?.message || "Failed to submit application");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen w-full bg-gray-900 px-4">
        <div className="animate-pulse">
          <p className="text-white text-lg">Loading job details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen w-full bg-gray-900 px-4">
        <p className="text-red-400 text-lg">{error}</p>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="flex items-center justify-center min-h-screen w-full bg-gray-900 px-4">
        <p className="text-red-400 text-lg">No job found with ID: {jobId}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gray-900 py-4 sm:py-6 md:py-8 px-3 sm:px-4 md:px-6 flex flex-col items-center justify-center">
      <div className="w-full max-w-xs xs:max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl bg-gray-800 rounded-lg shadow-xl overflow-hidden">
        {/* Job Header */}
        <div className="bg-gradient-to-r from-red-600 to-red-800 p-3 sm:p-4 md:p-6">
          <h2 className="text-lg xs:text-xl sm:text-2xl md:text-3xl font-bold text-white">
            Apply for {job.title}
          </h2>
          <p className="text-gray-200 text-xs xs:text-sm md:text-base mt-1 xs:mt-2">{job.company || "News99"}</p>
        </div>
        
        {/* Job Details */}
        <div className="p-3 sm:p-4 md:p-6 border-b border-gray-700 bg-gray-800">
          <div className="mb-3 md:mb-4 text-gray-300">
            <div className="flex flex-col xs:flex-row items-start mb-2">
              <span className="font-medium text-white mr-2 w-24 mb-1 xs:mb-0">Location:</span>
              <span className="text-sm xs:text-base">{job.location || "Remote"}</span>
            </div>
            <div className="flex flex-col items-start">
              <span className="font-medium text-white mr-2 w-24 mb-1 xs:mb-0">Description:</span>
              <p className="text-xs xs:text-sm md:text-base mt-1 xs:mt-0">{job.description}</p>
            </div>
          </div>
        </div>
        
        {/* Application Form */}
        <form onSubmit={handleSubmit} className="p-3 sm:p-4 md:p-6 space-y-3 sm:space-y-4 md:space-y-6 bg-gray-800">
          <div>
            <label className="block text-gray-300 text-xs sm:text-sm font-medium mb-1">Your Name</label>
            <input
              type="text"
              name="applicantName"
              value={applicant.applicantName}
              onChange={handleChange}
              className="w-full p-2 sm:p-2.5 md:p-3 bg-gray-700 border border-gray-600 rounded-lg text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              required
            />
          </div>
          <div>
            <label className="block text-gray-300 text-xs sm:text-sm font-medium mb-1">Your Email</label>
            <input
              type="email"
              name="applicantEmail"
              value={applicant.applicantEmail}
              onChange={handleChange}
              className="w-full p-2 sm:p-2.5 md:p-3 bg-gray-700 border border-gray-600 rounded-lg text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              required
            />
          </div>
          <div>
            <label className="block text-gray-300 text-xs sm:text-sm font-medium mb-1">Optional Resume Link</label>
            <input
              type="text"
              name="resume"
              value={applicant.resume}
              onChange={handleChange}
              className="w-full p-2 sm:p-2.5 md:p-3 bg-gray-700 border border-gray-600 rounded-lg text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="Paste a link to your resume"
            />
          </div>
          <div>
            <label className="block text-gray-300 text-xs sm:text-sm font-medium mb-1">Upload Resume</label>
            <div className="mt-1 flex justify-center px-2 xs:px-3 sm:px-4 md:px-6 pt-3 sm:pt-4 md:pt-5 pb-3 sm:pb-4 md:pb-6 border-2 border-gray-600 border-dashed rounded-lg">
              <div className="space-y-1 text-center">
                <svg
                  className="mx-auto h-6 w-6 xs:h-8 xs:w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 text-gray-400"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 48 48"
                  aria-hidden="true"
                >
                  <path
                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <div className="flex flex-col xs:flex-row text-xs text-gray-400 justify-center items-center">
                  <label
                    htmlFor="file-upload"
                    className="relative cursor-pointer bg-gray-700 rounded-md font-medium text-red-400 hover:text-red-300 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-red-500 mb-1 xs:mb-0 px-2 py-1"
                  >
                    <span className="text-2xs xs:text-xs block">Browse files</span>
                    <input
                      id="file-upload"
                      name="resumeFile"
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={handleFileChange}
                      className="sr-only"
                    />
                  </label>
                  <p className="text-2xs xs:text-xs pl-0 xs:pl-1 mt-1 xs:mt-0">or drag and drop</p>
                </div>
                <p className="text-2xs xs:text-xs text-gray-400">PDF, DOC, DOCX up to 10MB</p>
              </div>
            </div>
            {applicant.resumeFile && (
              <p className="text-2xs xs:text-xs text-green-500 mt-1 sm:mt-2">
                Selected: {applicant.resumeFile.name}
              </p>
            )}
          </div>
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white py-2 xs:py-2.5 md:py-3 rounded-lg text-xs sm:text-sm md:text-base font-medium hover:opacity-90 transition-all"
          >
            Submit Application
          </button>
        </form>
      </div>
    </div>
  );
};

export default JobApplicationPage;
