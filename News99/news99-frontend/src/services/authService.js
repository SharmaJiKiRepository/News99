// news99-frontend/src/services/authService.js
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api'; // Use env var, fallback for safety

// ----------------------------------
// Authentication API Functions
// ----------------------------------

// Register User
export const registerUser = async (userData) => {
  try {
    const { data } = await axios.post(`${API_URL}/register`, userData);
    return data;
  } catch (error) {
    handleApiError(error, 'Registration failed');
  }
};

// Login User ✅ **Now using cookies instead of localStorage**
export const loginUser = async (credentials) => {
  try {
    const { data } = await axios.post(`${API_URL}/login`, credentials, {
      withCredentials: true,
    });
    return { token: data.token, role: data.role }; // Role returned for immediate use
  } catch (error) {
    handleApiError(error, 'Login failed');
  }
};

// Logout User ✅ **New Function**
export const logoutUser = async () => {
  try {
    await axios.post(`${API_URL}/logout`, {}, { withCredentials: true });
    return { message: 'Logged out successfully' };
  } catch (error) {
    handleApiError(error, 'Logout failed');
  }
};

// Fetch User Profile
export const fetchUserProfile = async (token) => {
  try {
    const { data } = await axios.get(`${API_URL}/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return data;
  } catch (error) {
    handleApiError(error, 'Failed to fetch user profile');
  }
};

// Update User Role
export const updateUserRole = async (token, newRole) => {
  try {
    const { data } = await axios.put(
      `${API_URL}/updateRole`,
      { role: newRole },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return data;
  } catch (error) {
    handleApiError(error, 'Failed to update user role');
  }
};

// ----------------------------------
// Job API Functions
// ----------------------------------

// Get All Jobs
export const getAllJobs = async () => {
  try {
    const { data } = await axios.get(`${API_URL}/jobs`);
    return data;
  } catch (error) {
    handleApiError(error, 'Failed to fetch jobs');
  }
};

// Add a New Job (Admin only)
export const addJob = async (token, jobData) => {
  try {
    const { title, description, requirements, postedBy, location, company } = jobData;
    // Check for all required fields
    if (!title || !description || !requirements || !postedBy || !location || !company) {
      throw new Error(
        'All fields (title, description, requirements, location, company, postedBy) are required'
      );
    }

    const { data } = await axios.post(`${API_URL}/jobs`, jobData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return data;
  } catch (error) {
    handleApiError(error, 'Failed to add job');
  }
};

// Update Job (Admin only)
export const updateJob = async (token, jobId, jobData) => {
  try {
    const { data } = await axios.put(`${API_URL}/admin/jobs/${jobId}`, jobData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return data;
  } catch (error) {
    handleApiError(error, 'Failed to update job');
  }
};

// Apply for a Job
export const applyForJob = async (token, jobId, applicationData) => {
  try {
    const { data } = await axios.post(`${API_URL}/jobs/${jobId}/apply`, applicationData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return data;
  } catch (error) {
    handleApiError(error, 'Failed to apply for job');
  }
};

// Delete a Job (Admin only)
export const deleteJob = async (token, jobId) => {
  try {
    const { data } = await axios.delete(`${API_URL}/admin/jobs/${jobId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return data;
  } catch (error) {
    handleApiError(error, 'Failed to delete job');
  }
};

// ----------------------------------
// Utility Function for Error Handling
// ----------------------------------

const handleApiError = (error, defaultMessage) => {
  const message = error.response?.data?.message || defaultMessage;
  throw new Error(message);
};
