// news99-backend/controllers/jobController.js
const Job = require("../models/Job");
const JobApplication = require("../models/JobApplication");
const cloudinary = require('../cloudinaryConfig'); // Import Cloudinary
const streamifier = require('streamifier'); // Import streamifier

// Helper function to upload a file buffer to Cloudinary (Consider moving to a shared utils file later)
const uploadToCloudinary = (fileBuffer, options = {}) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      options, 
      (error, result) => {
        if (result) {
          resolve(result);
        } else {
          reject(error || new Error('Cloudinary upload failed'));
        }
      }
    );
    streamifier.createReadStream(fileBuffer).pipe(stream);
  });
};

/*
  Exported functions:
    - getJobs: Get all jobs (public)
    - addJob: Add a job (Admin only)
    - applyForJob: Apply for a job without file upload
    - applyForJobWithFile: Apply for a job with file upload
    - getAllApplications: Get all job applications (Admin only)
    - updateApplicationStatus: Update an application's status (Admin only)
    - deleteApplication: Delete a job application (Admin only)
*/

// Get all jobs (public)
exports.getJobs = async (req, res) => {
  try {
    const jobs = await Job.find().sort({ createdAt: -1 });
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Add a job (Admin only)
exports.addJob = async (req, res) => {
  const { title, description, requirements, postedBy, location, company } = req.body;
  console.log("Add Job Request Body:", req.body); // Debug logging

  if (!title || !description || !requirements || !postedBy || !location || !company) {
    return res.status(400).json({
      message: "All fields (title, description, requirements, location, company, postedBy) are required",
    });
  }

  try {
    const job = new Job({ title, description, requirements, postedBy, location, company });
    const savedJob = await job.save();
    res.status(201).json(savedJob);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Apply for a job without file upload
exports.applyForJob = async (req, res) => {
  const { id } = req.params; // jobId from URL
  const { applicantName, applicantEmail, resume } = req.body;

  if (!applicantName || !applicantEmail || !resume) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const jobApplication = new JobApplication({
      jobId: id,
      applicantName,
      applicantEmail,
      resume,
    });
    const savedApplication = await jobApplication.save();
    res.status(201).json(savedApplication);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Apply for a job WITH file upload
exports.applyForJobWithFile = async (req, res) => {
  try {
    const { id } = req.params; // jobId from URL
    const { applicantName, applicantEmail } = req.body;
    let finalResumeUrl = req.body.resume || ""; // Use provided link as fallback

    // Validate required fields before file processing
    if (!applicantName || !applicantEmail) {
       return res.status(400).json({
        message: "Applicant name and email are required.",
      });
    }
    
    // If a file was uploaded, upload it to Cloudinary
    if (req.file) {
      // Specify resource_type as 'raw' or 'auto' for non-image files like PDF/DOCX
      // You might want a specific folder for resumes
      const result = await uploadToCloudinary(req.file.buffer, { 
        resource_type: "raw",
        folder: "resumes" 
      });
      finalResumeUrl = result.secure_url; // Use the Cloudinary URL
    }

    // Ensure we have a resume URL (either from link or uploaded file)
    if (!finalResumeUrl) {
      return res.status(400).json({
        message: "Either a resume link or an uploaded resume file is required.",
      });
    }

    const jobApplication = new JobApplication({
      jobId: id,
      applicantName,
      applicantEmail,
      resume: finalResumeUrl, // Save the Cloudinary URL or the provided link
    });

    const savedApp = await jobApplication.save();
    res.status(201).json(savedApp);
  } catch (err) {
    console.error("Error applying for job with file:", err);
    res.status(500).json({ message: `Failed to apply for job: ${err.message}` });
  }
};

// Get all job applications (Admin only)
exports.getAllApplications = async (req, res) => {
  try {
    const applications = await JobApplication.find()
      .sort({ createdAt: -1 })
      .populate("jobId", "title");
    res.status(200).json(applications);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update application status (Approve/Reject)
exports.updateApplicationStatus = async (req, res) => {
  const { id } = req.params; // application ID
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ message: "Status is required." });
  }

  try {
    const updatedApp = await JobApplication.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );
    if (!updatedApp) {
      return res.status(404).json({ message: "Application not found." });
    }
    res.status(200).json(updatedApp);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete a job application (Admin only)
exports.deleteApplication = async (req, res) => {
  try {
    const { id } = req.params; // application ID
    const deletedApp = await JobApplication.findByIdAndDelete(id);
    if (!deletedApp) {
      return res.status(404).json({ message: "Application not found." });
    }
    res.status(200).json({ message: "Application deleted successfully." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
