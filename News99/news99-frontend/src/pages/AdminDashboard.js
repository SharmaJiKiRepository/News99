// news99-frontend/src/pages/AdminDashboard.js

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  getAllJobs,
  addJob,
  updateJob,
  deleteJob,
  fetchUserProfile,
} from "../services/authService";
import {
  FiEdit,
  FiTrash2,
  FiUpload,
  FiCheckCircle,
  FiXCircle,
  FiUsers,
  FiBriefcase,
  FiInbox,
  FiFileText,
  FiSettings,
  FiUserCheck,
  FiCheckSquare,
  FiMail,
  FiMenu,
  FiX,
} from "react-icons/fi";

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const BASE_URL = process.env.REACT_APP_BASE_URL || 'http://localhost:5000';

const isURL = (str = "") => str.startsWith("http://") || str.startsWith("https://");

const AdminDashboard = () => {
  const navigate = useNavigate();

  // Mobile sidebar state
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Active section for sidebar
  const [activeSection, setActiveSection] = useState("users");

  // States
  const [users, setUsers] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [newsList, setNewsList] = useState([]);
  const [heroImageFile, setHeroImageFile] = useState(null);
  const [reporterRequests, setReporterRequests] = useState([]);
  const [tasks, setTasks] = useState([]);

  // NEW: messages state
  const [messages, setMessages] = useState([]);

  // For Job management
  const [editingJob, setEditingJob] = useState(null);
  const [newJob, setNewJob] = useState({
    title: "",
    description: "",
    location: "",
    company: "",
    requirements: "",
    postedBy: "",
  });

  // For News management (notice we have "video" as well as "image")
  const [editingNews, setEditingNews] = useState(null);
  const [newsForm, setNewsForm] = useState({
    title: "",
    description: "",
    author: "",
    category: "",
    image: "",
    video: "",
    youtubeLink: "",
  });

  // For tasks
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    assignedTo: "",
  });
  const [taskError, setTaskError] = useState("");

  // For dynamic categories
  const [availableCategories, setAvailableCategories] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // NEW: site config state
  const [siteConfig, setSiteConfig] = useState({
    heroImage: "",
    heroHeadline: "",
    heroSubheading: "",
    heroCTAText: "", 
    heroCTALink: ""
  });

  // Toggle sidebar on mobile
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Close sidebar when changing sections on mobile
  const handleSectionChange = (section) => {
    setActiveSection(section);
    setSidebarOpen(false);
  };

  // On mount: verify admin, fetch data, fetch categories
  useEffect(() => {
    const verifyAdmin = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }
        const profile = await fetchUserProfile(token);
        if (profile.role !== "admin") {
          navigate("/");
          return;
        }
        fetchAdminData(token);
        fetchCategories();
        fetchSiteConfig();
      } catch (err) {
        navigate("/login");
      }
    };

    const fetchAdminData = async (token) => {
      try {
        const headers = { Authorization: `Bearer ${token}` };

        // 1) Fetch Users
        const usersRes = await axios.get(`${API_URL}/admin/users`, { headers });
        setUsers(usersRes.data);

        // 2) Fetch Jobs
        const fetchedJobs = await getAllJobs();
        setJobs(fetchedJobs);

        // 3) Fetch Applications
        const appsRes = await axios.get(`${API_URL}/admin/applications`, { headers });
        setApplications(appsRes.data);

        // 4) Fetch News (all submissions)
        const newsRes = await axios.get(`${API_URL}/admin/news`, { headers });
        setNewsList(newsRes.data);

        // 5) Fetch Pending Reporter Requests
        const requestRes = await axios.get(
          `${API_URL}/admin/reporter-requests?status=pending`,
          { headers }
        );
        setReporterRequests(requestRes.data);

        // 6) Fetch Tasks
        const tasksRes = await axios.get(`${API_URL}/admin/tasks`, { headers });
        setTasks(tasksRes.data);

        // 7) NEW: Fetch Messages (Contact form submissions)
        const msgRes = await axios.get(`${API_URL}/admin/messages`, { headers });
        setMessages(msgRes.data);

      } catch (err) {
        setError("Failed to fetch admin data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    // Fetch site config
    const fetchSiteConfig = async () => {
      try {
        const res = await axios.get(`${API_URL}/site-config`);
        if (res.data) {
          setSiteConfig(res.data);
        }
      } catch (err) {
        console.error("Failed to fetch site config:", err);
      }
    };

    // Fetch categories from /api/categories
    const fetchCategories = async () => {
      try {
        const res = await axios.get(`${API_URL}/categories`);
        setAvailableCategories(res.data);
      } catch (err) {
        console.error("Failed to fetch categories. Using fallback list.", err);
        setAvailableCategories(["General", "Politics", "Sports", "Entertainment", "Technology"]);
      }
    };

    verifyAdmin();
  }, [navigate]);

  // -------------- REPORTER REQUESTS --------------
  const handleApproveRequest = async (reqId) => {
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };
      await axios.patch(
        `${API_URL}/admin/reporter-requests/${reqId}/approve`,
        {},
        { headers }
      );
      setReporterRequests((prev) => prev.filter((r) => r._id !== reqId));
      alert("Reporter request approved!");
    } catch (err) {
      alert("Failed to approve request: " + err.message);
    }
  };

  const handleRejectRequest = async (reqId) => {
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };
      await axios.patch(
        `${API_URL}/admin/reporter-requests/${reqId}/reject`,
        {},
        { headers }
      );
      setReporterRequests((prev) => prev.filter((r) => r._id !== reqId));
      alert("Reporter request rejected!");
    } catch (err) {
      alert("Failed to reject request: " + err.message);
    }
  };

  const handleDeleteRequest = async (reqId) => {
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };
      await axios.delete(`${API_URL}/admin/reporter-requests/${reqId}`, { headers });
      setReporterRequests((prev) => prev.filter((r) => r._id !== reqId));
      alert("Request deleted!");
    } catch (err) {
      alert("Failed to delete request: " + err.message);
    }
  };

  // -------------- JOBS --------------
  const handleJobSubmit = async (e) => {
    e.preventDefault();
    const { title, description, location, company, requirements, postedBy } = newJob;
    if (!title || !description || !location || !company || !requirements || !postedBy) {
      alert("Please fill in all fields.");
      return;
    }
    try {
      const token = localStorage.getItem("token");
      if (editingJob) {
        await updateJob(token, editingJob._id, newJob);
        setJobs((jobs) => jobs.map((job) => (job._id === editingJob._id ? { ...job, ...newJob } : job)));
        alert("Job updated successfully!");
      } else {
        const response = await addJob(token, newJob);
        setJobs((jobs) => [...jobs, response.data]);
        alert("Job posted successfully!");
      }
      setEditingJob(null);
      setNewJob({
        title: "",
        description: "",
        location: "",
        company: "",
        requirements: "",
        postedBy: "",
      });
    } catch (err) {
      setError(
        editingJob
          ? "Failed to update job. Please try again."
          : "Failed to post job. Please try again."
      );
    }
  };

  const handleJobEdit = (job) => {
    setEditingJob(job);
    setNewJob({
      title: job.title || "",
      description: job.description || "",
      location: job.location || "",
      company: job.company || "",
      requirements: job.requirements || "",
      postedBy: job.postedBy || "",
    });
    setActiveSection("jobs");
  };

  const handleJobDelete = async (jobId) => {
    const token = localStorage.getItem("token");
    try {
      await deleteJob(token, jobId);
      setJobs((jobs) => jobs.filter((job) => job._id !== jobId));
      alert("Job deleted successfully!");
    } catch (err) {
      setError("Failed to delete job. Please try again.");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewJob((prev) => ({ ...prev, [name]: value }));
  };

  // -------------- APPLICATIONS --------------
  const handleApplicationStatus = async (appId, newStatus) => {
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };
      const response = await axios.put(
        `${API_URL}/admin/applications/${appId}`,
        { status: newStatus },
        { headers }
      );
      const updatedApp = response.data;
      setApplications((prev) => prev.map((a) => (a._id === appId ? updatedApp : a)));
    } catch (err) {
      alert("Failed to update application status: " + err.message);
    }
  };

  const handleApplicationDelete = async (appId) => {
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };
      await axios.delete(`${API_URL}/admin/applications/${appId}`, { headers });
      setApplications((prev) => prev.filter((a) => a._id !== appId));
      alert("Application deleted successfully!");
    } catch (err) {
      alert("Failed to delete application: " + err.message);
    }
  };

  // -------------- NEWS --------------
  const handleNewsInputChange = (e) => {
    const { name, value } = e.target;
    setNewsForm((prev) => ({ ...prev, [name]: value }));
  };

  // Called for image OR video file changes:
  const handleFileChange = (e) => {
    setNewsForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.files[0], // works for both "image" or "video"
    }));
  };

  const handleNewsSubmit = async (e) => {
    e.preventDefault();
    const { title, description, author } = newsForm;
    if (!title || !description || !author) {
      alert("Title, description, and author are required.");
      return;
    }
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };
      let res;

      // If either image or video is a File, we use FormData
      const isFileUpload =
        newsForm.image instanceof File || newsForm.video instanceof File;

      if (isFileUpload) {
        const formData = new FormData();

        // Append all text fields
        formData.append("title", newsForm.title);
        formData.append("description", newsForm.description);
        formData.append("author", newsForm.author);
        formData.append("category", newsForm.category);
        formData.append("youtubeLink", newsForm.youtubeLink);

        // If there's an image file, append it
        if (newsForm.image instanceof File) {
          formData.append("image", newsForm.image);
        }
        // If there's a video file, append it
        if (newsForm.video instanceof File) {
          formData.append("video", newsForm.video);
        }

        if (editingNews) {
          // Update existing news
          res = await axios.put(
            `${API_URL}/news/${editingNews._id}`,
            formData,
            { headers: { ...headers, "Content-Type": "multipart/form-data" } }
          );
        } else {
          // Create new news
          res = await axios.post(
            `${API_URL}/news`,
            formData,
            { headers: { ...headers, "Content-Type": "multipart/form-data" } }
          );
        }
      } else {
        // If no file is being uploaded, just send JSON
        if (editingNews) {
          res = await axios.put(
            `${API_URL}/news/${editingNews._id}`,
            newsForm,
            { headers }
          );
        } else {
          res = await axios.post(
            `${API_URL}/news`,
            newsForm,
            { headers }
          );
        }
      }

      // Handle response
      const updatedNews = res.data;
      if (editingNews) {
        // We updated existing news
        setNewsList((newsList) =>
          newsList.map((n) => (n._id === editingNews._id ? updatedNews : n))
        );
        alert("News updated successfully!");
      } else {
        // We created new news
        setNewsList((newsList) => [...newsList, updatedNews]);
        alert("News created successfully!");
      }

      // Reset form
      setEditingNews(null);
      setNewsForm({
        title: "",
        description: "",
        author: "",
        category: "",
        image: "",
        video: "",
        youtubeLink: "",
      });
    } catch (err) {
      alert(err.response?.data?.message || "Failed to submit news");
    }
  };

  const handleNewsEdit = (newsItem) => {
    setEditingNews(newsItem);
    setNewsForm({
      title: newsItem.title || "",
      description: newsItem.description || "",
      author: newsItem.author || "",
      category: newsItem.category || "",
      image: "",
      video: "",
      youtubeLink: newsItem.youtubeLink || "",
    });
    setActiveSection("news");
  };

  const handleNewsDelete = async (newsId) => {
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };
      await axios.delete(`${API_URL}/news/${newsId}`, { headers });
      setNewsList((newsList) => newsList.filter((n) => n._id !== newsId));
      alert("News deleted successfully!");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete news");
    }
  };

  const handleApproveNews = async (newsId) => {
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };
      const res = await axios.patch(
        `${API_URL}/news/${newsId}/approve`,
        {},
        { headers }
      );
      setNewsList((prev) =>
        prev.map((news) => (news._id === newsId ? res.data.news : news))
      );
      alert("News approved successfully!");
    } catch (err) {
      alert("Failed to approve news: " + err.message);
    }
  };

  const handleRejectNews = async (newsId) => {
    const rejectionReason = prompt("Please provide a reason for rejection:");
    if (!rejectionReason) {
      alert("Rejection reason is required.");
      return;
    }
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };
      const res = await axios.patch(
        `${API_URL}/news/${newsId}/reject`,
        { rejectionReason },
        { headers }
      );
      setNewsList((prev) =>
        prev.map((news) => (news._id === newsId ? res.data.news : news))
      );
      alert("News rejected.");
    } catch (err) {
      alert("Failed to reject news: " + err.message);
    }
  };

  // -------------- SITE CONFIG --------------
  const handleHeroImageFileChange = (e) => {
    setHeroImageFile(e.target.files[0]);
  };

  const handleHeroImageSubmit = async (e) => {
    e.preventDefault();
    if (!heroImageFile) {
      alert("Please select a file to upload.");
      return;
    }
    const token = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };
    const formData = new FormData();
    formData.append("heroImage", heroImageFile);
    try {
      await axios.put(`${API_URL}/site-config`, formData, {
        headers: { ...headers, "Content-Type": "multipart/form-data" },
      });
      alert("Hero image updated successfully!");
    } catch (err) {
      alert("Failed to update hero image.");
    }
  };

  const handleHeroTextChange = (e) => {
    const { name, value } = e.target;
    setSiteConfig(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleHeroTextSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };
    try {
      const { heroHeadline, heroSubheading, heroCTAText, heroCTALink } = siteConfig;
      await axios.put(
        `${API_URL}/site-config`, 
        { heroHeadline, heroSubheading, heroCTAText, heroCTALink },
        { headers }
      );
      alert("Hero text updated successfully!");
    } catch (err) {
      alert("Failed to update hero text: " + err.message);
    }
  };

  // -------------- TASKS --------------
  const handleTaskInputChange = (e) => {
    const { name, value } = e.target;
    setNewTask((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };
    if (!newTask.title || !newTask.assignedTo) {
      setTaskError("Please fill all required fields (title, assignedTo).");
      return;
    }
    try {
      const res = await axios.post(`${API_URL}/admin/tasks`, newTask, { headers });
      setTasks((prev) => [...prev, res.data]);
      setNewTask({ title: "", description: "", assignedTo: "" });
      setTaskError("");
      alert("Task created successfully!");
    } catch (err) {
      setTaskError("Failed to create task. " + err.message);
    }
  };

  const handleTaskStatusUpdate = async (taskId, newStatus) => {
    const token = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };
    try {
      const res = await axios.put(
        `${API_URL}/admin/tasks/${taskId}`,
        { status: newStatus },
        { headers }
      );
      setTasks((prev) => prev.map((t) => (t._id === taskId ? res.data : t)));
    } catch (err) {
      alert("Failed to update task status: " + err.message);
    }
  };

  const handleTaskDelete = async (taskId) => {
    const token = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };
    try {
      await axios.delete(`${API_URL}/admin/tasks/${taskId}`, { headers });
      setTasks((prev) => prev.filter((t) => t._id !== taskId));
    } catch (err) {
      alert("Failed to delete task: " + err.message);
    }
  };

  // -------------- MESSAGES (CONTACT FORM) --------------
  const handleMessageDelete = async (msgId) => {
    const token = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };
    try {
      await axios.delete(`${API_URL}/admin/messages/${msgId}`, { headers });
      setMessages((prev) => prev.filter((m) => m._id !== msgId));
      alert("Message deleted.");
    } catch (err) {
      alert("Failed to delete message: " + err.message);
    }
  };

  // -------------- RENDER FUNCTIONS --------------

  // Reporter Requests
  const renderReporterRequests = () => (
    <div className="glass-panel bg-gray-800/50 rounded-xl p-5 shadow-2xl border border-gray-700/30">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <FiUserCheck className="text-green-400" /> Reporter Requests
      </h2>
      {reporterRequests.length === 0 ? (
        <p className="text-gray-400">No pending requests found.</p>
      ) : (
        reporterRequests.map((request) => (
          <div key={request._id} className="p-3 mb-2 border border-gray-700 rounded-lg">
            <p>
              <span className="font-semibold">Username:</span> {request.user?.username}
            </p>
            <p>
              <span className="font-semibold">Email:</span> {request.user?.email}
            </p>
            <p>
              <span className="font-semibold">phoneNumber:</span> {request.phoneNumber}
            </p>
            <p>
              <span className="font-semibold">Location:</span>{request.location}
            </p>
            <p>
              <span className="font-semibold">Status:</span> {request.status}
            </p>
            <div className="mt-2 flex gap-3">
              <button
                onClick={() => handleApproveRequest(request._id)}
                className="bg-green-600 hover:bg-green-700 px-3 py-1 rounded-md"
              >
                Approve
              </button>
              <button
                onClick={() => handleRejectRequest(request._id)}
                className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded-md"
              >
                Reject
              </button>
              <button
                onClick={() => handleDeleteRequest(request._id)}
                className="bg-gray-600 hover:bg-gray-700 px-3 py-1 rounded-md"
              >
                Delete
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );

  // Users
  const renderUsersSection = () => (
    <div className="glass-panel bg-gray-800/50 rounded-xl p-5 shadow-2xl border border-gray-700/30">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <FiUsers className="text-blue-400" /> User Management
      </h2>
      <div className="overflow-x-auto scrollbar-thin">
        <table className="w-full">
          <thead className="bg-gray-700/50">
            <tr>
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">Email</th>
              <th className="p-3 text-left">Role</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id || user.id} className="hover:bg-gray-700/20 transition-colors">
                <td className="p-3">{user.username}</td>
                <td className="p-3 text-gray-400">{user.email}</td>
                <td className="p-3">
                  <span className="capitalize px-3 py-1 rounded-full text-sm bg-gray-700/50">
                    {user.role}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  // Jobs
  const renderJobsSection = () => (
    <div className="glass-panel bg-gray-800/50 rounded-xl p-5 shadow-2xl border border-gray-700/30">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <FiBriefcase className="text-green-400" /> Job Management
      </h2>
      <div className="space-y-6">
        <div className="bg-gray-900/30 p-4 rounded-lg">
          <h3 className="text-lg font-medium mb-4">
            {editingJob ? "Edit Position" : "Create New Job"}
          </h3>
          <form onSubmit={handleJobSubmit} className="grid gap-4">
            <input
              name="title"
              value={newJob.title}
              onChange={handleInputChange}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2"
              placeholder="Job Title"
            />
            <textarea
              name="description"
              value={newJob.description}
              onChange={handleInputChange}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2"
              placeholder="Job Description"
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                name="location"
                value={newJob.location}
                onChange={handleInputChange}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2"
                placeholder="Location"
              />
              <input
                name="company"
                value={newJob.company}
                onChange={handleInputChange}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2"
                placeholder="Company"
              />
            </div>
            <textarea
              name="requirements"
              value={newJob.requirements}
              onChange={handleInputChange}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2"
              placeholder="Job Requirements"
            />
            <input
              name="postedBy"
              value={newJob.postedBy}
              onChange={handleInputChange}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2"
              placeholder="Posted By"
            />
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition-all"
            >
              {editingJob ? "Update Job" : "Create Job"}
            </button>
          </form>
        </div>
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full">
            <thead className="bg-gray-700/50">
              <tr>
                <th className="p-3 text-left">Title</th>
                <th className="p-3 text-left">Company</th>
                <th className="p-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {jobs
                .filter((job) => job && job.title)
                .map((job, i) => (
                  <tr key={job._id || i} className="hover:bg-gray-700/20 transition-colors">
                    <td className="p-3">{job.title}</td>
                    <td className="p-3 text-gray-400">{job.company || "N/A"}</td>
                    <td className="p-3 flex gap-2">
                      <button
                        onClick={() => handleJobEdit(job)}
                        className="p-2 hover:bg-gray-700 rounded-lg text-blue-400"
                      >
                        <FiEdit />
                      </button>
                      <button
                        onClick={() => handleJobDelete(job._id)}
                        className="p-2 hover:bg-gray-700 rounded-lg text-red-400"
                      >
                        <FiTrash2 />
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // Applications
  const renderApplicationsSection = () => (
    <div className="glass-panel bg-gray-800/50 rounded-xl p-5 shadow-2xl border border-gray-700/30">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <FiInbox className="text-yellow-400" /> Applications
      </h2>
      <div className="overflow-x-auto scrollbar-thin">
        <table className="w-full">
          <thead className="bg-gray-700/50">
            <tr>
              <th className="p-3 text-left">Applicant</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Actions</th>
              <th className="p-3 text-left">Resume</th>
            </tr>
          </thead>
          <tbody>
            {applications.map((app) => (
              <tr key={app._id} className="hover:bg-gray-700/20 transition-colors">
                <td className="p-3">
                  <div>
                    <div className="font-medium">{app.applicantName}</div>
                    <div className="text-sm text-gray-400">{app.applicantEmail}</div>
                  </div>
                </td>
                <td className="p-3">
                  <span
                    className={`px-3 py-1 rounded-full text-sm ${
                      app.status === "Approved"
                        ? "bg-green-900/50 text-green-400"
                        : app.status === "Rejected"
                        ? "bg-red-900/50 text-red-400"
                        : "bg-yellow-900/50 text-yellow-400"
                    }`}
                  >
                    {app.status}
                  </span>
                </td>
                <td className="p-3 flex gap-2">
                  {app.status === "Pending" && (
                    <>
                      <button
                        onClick={() => handleApplicationStatus(app._id, "Approved")}
                        className="p-2 hover:bg-gray-700 rounded-lg text-green-400"
                      >
                        <FiCheckCircle />
                      </button>
                      <button
                        onClick={() => handleApplicationStatus(app._id, "Rejected")}
                        className="p-2 hover:bg-gray-700 rounded-lg text-red-400"
                      >
                        <FiXCircle />
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => handleApplicationDelete(app._id)}
                    className="p-2 hover:bg-gray-700 rounded-lg text-gray-400"
                  >
                    <FiTrash2 />
                  </button>
                </td>
                <td className="p-3">
                  {isURL(app.resume) ? (
                    <a
                      href={app.resume}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline text-blue-400"
                    >
                      View Resume
                    </a>
                  ) : (
                    app.resume
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  // News
  const renderNewsSection = () => (
    <div className="glass-panel bg-gray-800/50 rounded-xl p-5 shadow-2xl border border-gray-700/30">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <FiFileText className="text-purple-400" /> News Management
      </h2>
      <div className="space-y-6">
        <div className="bg-gray-900/30 p-4 rounded-lg">
          <h3 className="text-lg font-medium mb-4">
            {editingNews ? "Edit News" : "Create New News"}
          </h3>
          <form onSubmit={handleNewsSubmit} className="grid gap-4">
            <input
              name="title"
              value={newsForm.title}
              onChange={handleNewsInputChange}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2"
              placeholder="News Title"
            />
            <textarea
              name="description"
              value={newsForm.description}
              onChange={handleNewsInputChange}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2"
              placeholder="News Description"
            />
            <input
              name="author"
              value={newsForm.author}
              onChange={handleNewsInputChange}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2"
              placeholder="Author"
            />
            <select
              name="category"
              value={newsForm.category}
              onChange={handleNewsInputChange}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2"
            >
              <option value="">Select Category</option>
              {availableCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            <input
              name="youtubeLink"
              value={newsForm.youtubeLink}
              onChange={handleNewsInputChange}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2"
              placeholder="YouTube video link (optional)"
            />

            {/* Image upload block */}
            <div className="border-2 border-dashed border-gray-700 rounded-lg p-4 text-center">
              <FiUpload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
              <input
                type="file"
                id="newsImageFile"
                name="image"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <label
                htmlFor="newsImageFile"
                className="cursor-pointer text-blue-400 hover:text-blue-300"
              >
                Click to upload news image
              </label>
            </div>

            {/* Video upload block */}
            <div className="border-2 border-dashed border-gray-700 rounded-lg p-4 text-center">
              <FiUpload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
              <input
                type="file"
                id="newsVideoFile"
                name="video"
                accept="video/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <label
                htmlFor="newsVideoFile"
                className="cursor-pointer text-blue-400 hover:text-blue-300"
              >
                Click to upload video file (optional)
              </label>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg"
            >
              {editingNews ? "Update News" : "Create News"}
            </button>
          </form>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-700/50">
              <tr>
                <th className="p-3 text-left">Title</th>
                <th className="p-3 text-left">Author</th>
                <th className="p-3 text-left">Category</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-left">Rejection Reason</th>
                <th className="p-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {newsList.map((newsItem) => (
                <tr key={newsItem._id} className="hover:bg-gray-700/20 transition-colors">
                  <td className="p-3">{newsItem.title}</td>
                  <td className="p-3 text-gray-400">
                    {newsItem.author?.username || "N/A"}
                  </td>
                  <td className="p-3">{newsItem.category}</td>
                  <td className="p-3">
                    <span
                      className={`px-3 py-1 rounded-full text-sm ${
                        newsItem.status === "approved"
                          ? "bg-green-900/50 text-green-400"
                          : newsItem.status === "rejected"
                          ? "bg-red-900/50 text-red-400"
                          : "bg-yellow-900/50 text-yellow-400"
                      }`}
                    >
                      {newsItem.status}
                    </span>
                  </td>
                  <td className="p-3">
                    {newsItem.status === "rejected"
                      ? newsItem.rejectionReason
                      : "-"}
                  </td>
                  <td className="p-3 flex gap-2">
                    {newsItem.status === "pending" && (
                      <>
                        <button
                          onClick={() => handleApproveNews(newsItem._id)}
                          className="p-2 hover:bg-gray-700 rounded-lg text-green-400"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleRejectNews(newsItem._id)}
                          className="p-2 hover:bg-gray-700 rounded-lg text-red-400"
                        >
                          Reject
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => handleNewsEdit(newsItem)}
                      className="p-2 hover:bg-gray-700 rounded-lg text-blue-400"
                    >
                      <FiEdit />
                    </button>
                    <button
                      onClick={() => handleNewsDelete(newsItem._id)}
                      className="p-2 hover:bg-gray-700 rounded-lg text-red-400"
                    >
                      <FiTrash2 />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // Tasks
  const renderTasksSection = () => (
    <div className="glass-panel bg-gray-800/50 rounded-xl p-5 shadow-2xl border border-gray-700/30">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <FiCheckSquare className="text-yellow-400" /> Assign Tasks to Reporters
      </h2>
      <div className="bg-gray-900/30 p-4 rounded-lg mb-4">
        <h3 className="text-lg font-medium mb-4">Create New Task</h3>
        <form onSubmit={handleCreateTask} className="grid gap-4">
          <input
            type="text"
            name="title"
            value={newTask.title}
            onChange={handleTaskInputChange}
            placeholder="Task Title"
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2"
          />
          <textarea
            name="description"
            value={newTask.description}
            onChange={handleTaskInputChange}
            placeholder="Task Description (optional)"
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2"
          />
          <select
            name="assignedTo"
            value={newTask.assignedTo}
            onChange={handleTaskInputChange}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2"
          >
            <option value="">Select Reporter</option>
            {users
              .filter((u) => u.role === "reporter")
              .map((rep) => (
                <option key={rep._id} value={rep._id}>
                  {rep.username}
                </option>
              ))}
          </select>
          {taskError && <p className="text-red-400">{taskError}</p>}
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg"
          >
            Create Task
          </button>
        </form>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-700/50">
            <tr>
              <th className="p-3 text-left">Title</th>
              <th className="p-3 text-left">Assigned To</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((task) => (
              <tr key={task._id} className="hover:bg-gray-700/20 transition-colors">
                <td className="p-3">{task.title}</td>
                <td className="p-3 text-gray-400">{task.assignedTo?.username || "N/A"}</td>
                <td className="p-3">
                  <span
                    className={`px-3 py-1 rounded-full text-sm ${
                      task.status === "completed"
                        ? "bg-green-900/50 text-green-400"
                        : task.status === "in-progress"
                        ? "bg-yellow-900/50 text-yellow-400"
                        : "bg-red-900/50 text-red-400"
                    }`}
                  >
                    {task.status}
                  </span>
                </td>
                <td className="p-3 flex gap-2">
                  {task.status !== "completed" && (
                    <>
                      <button
                        onClick={() => handleTaskStatusUpdate(task._id, "in-progress")}
                        className="p-2 hover:bg-gray-700 rounded-lg text-yellow-400"
                      >
                        Mark In-Progress
                      </button>
                      <button
                        onClick={() => handleTaskStatusUpdate(task._id, "completed")}
                        className="p-2 hover:bg-gray-700 rounded-lg text-green-400"
                      >
                        Mark Completed
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => handleTaskDelete(task._id)}
                    className="p-2 hover:bg-gray-700 rounded-lg text-red-400"
                  >
                    <FiTrash2 />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  // NEW: Render messages
  const renderMessagesSection = () => (
    <div className="glass-panel bg-gray-800/50 rounded-xl p-5 shadow-2xl border border-gray-700/30">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <FiMail className="text-blue-400" /> Contact Messages
      </h2>
      {messages.length === 0 ? (
        <p className="text-gray-400">No messages found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-700/50">
              <tr>
                <th className="p-3 text-left">Name</th>
                <th className="p-3 text-left">Email</th>
                <th className="p-3 text-left">Message</th>
                <th className="p-3 text-left">Date</th>
                <th className="p-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {messages.map((msg) => (
                <tr key={msg._id} className="hover:bg-gray-700/20 transition-colors">
                  <td className="p-3">{msg.name}</td>
                  <td className="p-3 text-gray-400">{msg.email}</td>
                  <td className="p-3">{msg.message}</td>
                  <td className="p-3">
                    {new Date(msg.createdAt).toLocaleString()}
                  </td>
                  <td className="p-3">
                    <button
                      onClick={() => handleMessageDelete(msg._id)}
                      className="p-2 hover:bg-gray-700 rounded-lg text-red-400"
                    >
                      <FiTrash2 />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  // Site Config
  const renderConfigSection = () => (
    <div className="grid gap-6 grid-cols-1">
      {/* Hero Image Upload */}
      <div className="glass-panel bg-gray-800/50 rounded-xl p-5 shadow-2xl border border-gray-700/30">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <FiSettings className="text-red-400" /> Hero Image Configuration
        </h2>
        <div className="mb-6">
          <h3 className="font-medium text-gray-300 mb-2">Current Hero Image:</h3>
          {siteConfig.heroImage && (
            <div className="relative w-full h-40 overflow-hidden rounded-lg">
              <img 
                src={siteConfig.heroImage.startsWith('http') 
                  ? siteConfig.heroImage 
                  : `${BASE_URL}${siteConfig.heroImage}`
                } 
                alt="Current Hero" 
                className="w-full h-full object-cover"
              />
            </div>
          )}
        </div>
        <form onSubmit={handleHeroImageSubmit} className="space-y-4">
          <div className="border-2 border-dashed border-gray-700 rounded-lg p-4 text-center">
            <FiUpload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
            <input
              type="file"
              id="heroImageFile"
              onChange={handleHeroImageFileChange}
              className="hidden"
            />
            <label
              htmlFor="heroImageFile"
              className="cursor-pointer text-blue-400 hover:text-blue-300"
            >
              Click to upload new hero image
            </label>
            {heroImageFile && (
              <p className="mt-2 text-green-400 text-sm">Selected: {heroImageFile.name}</p>
            )}
          </div>
          <button
            type="submit"
            disabled={!heroImageFile}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-2 rounded-lg transition-all"
          >
            Update Hero Image
          </button>
        </form>
      </div>

      {/* Hero Text Configuration */}
      <div className="glass-panel bg-gray-800/50 rounded-xl p-5 shadow-2xl border border-gray-700/30">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <FiSettings className="text-red-400" /> Hero Text Configuration
        </h2>
        <p className="text-gray-400 mb-4 text-sm">
          Customize the text that appears overlaid on the hero image at the top of the homepage.
        </p>
        <form onSubmit={handleHeroTextSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Headline
            </label>
            <input
              type="text"
              name="heroHeadline"
              value={siteConfig.heroHeadline}
              onChange={handleHeroTextChange}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-white"
              placeholder="Top Stories of the Day"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Subheading
            </label>
            <input
              type="text"
              name="heroSubheading"
              value={siteConfig.heroSubheading}
              onChange={handleHeroTextChange}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-white"
              placeholder="Stay informed with the latest news and analysis."
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Button Text
            </label>
            <input
              type="text"
              name="heroCTAText"
              value={siteConfig.heroCTAText}
              onChange={handleHeroTextChange}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-white"
              placeholder="Explore Top News"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Button Link
            </label>
            <input
              type="text"
              name="heroCTALink"
              value={siteConfig.heroCTALink}
              onChange={handleHeroTextChange}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-white"
              placeholder="/category/National"
            />
          </div>
          
          <div className="flex justify-between items-center pt-2">
            <button
              type="button"
              onClick={() => setSiteConfig({
                ...siteConfig,
                heroHeadline: "Top Stories of the Day",
                heroSubheading: "Stay informed with the latest news and analysis.",
                heroCTAText: "Explore Top News",
                heroCTALink: "/category/National"
              })}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg"
            >
              Reset to Default
            </button>
            
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>

      {/* Preview Section */}
      <div className="glass-panel bg-gray-800/50 rounded-xl p-5 shadow-2xl border border-gray-700/30">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <FiSettings className="text-red-400" /> Hero Preview
        </h2>
        <div className="relative w-full h-64 overflow-hidden rounded-lg bg-gray-900">
          {/* Gradient Overlay */}
          <div className="absolute inset-0 w-full h-full bg-gradient-to-t from-black to-transparent z-10"></div>
          
          {/* Hero Image */}
          {siteConfig.heroImage && (
            <img
              src={siteConfig.heroImage.startsWith('http') 
                ? siteConfig.heroImage 
                : `${BASE_URL}${siteConfig.heroImage}`
              }
              alt="Hero Preview"
              className="absolute inset-0 w-full h-full object-cover"
            />
          )}
          
          {/* Text Overlay */}
          <div className="absolute inset-0 z-20 flex flex-col justify-end p-4">
            <h3 className="text-xl font-bold text-white mb-1">
              {siteConfig.heroHeadline || "Top Stories of the Day"}
            </h3>
            <p className="text-sm text-gray-200 mb-2">
              {siteConfig.heroSubheading || "Stay informed with the latest news and analysis."}
            </p>
            <div className="inline-block bg-red-600 text-white px-3 py-1 rounded-md text-sm font-medium">
              {siteConfig.heroCTAText || "Explore Top News"}
            </div>
          </div>
        </div>
        <p className="text-gray-400 mt-2 text-sm text-center">
          This is a simplified preview. Check the homepage to see the actual result.
        </p>
      </div>
    </div>
  );

  // MAIN RETURN
  return (
    <div className="flex h-screen bg-gray-900 text-gray-100">
      {/* Mobile Sidebar Toggle Button */}
      <button 
        onClick={toggleSidebar} 
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-gray-800 rounded text-white"
      >
        {sidebarOpen ? <FiX /> : <FiMenu />}
      </button>

      {/* Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-gray-800 p-6 space-y-6 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 transition-transform duration-300 ease-in-out overflow-y-auto`}
      >
        <h2 className="text-2xl font-semibold text-white">Admin Panel</h2>
        <nav className="space-y-2">
          {/* Sidebar Links - use handleSectionChange onClick */}
          <SidebarLink section="users" activeSection={activeSection} onClick={handleSectionChange} icon={<FiUsers />}>Manage Users</SidebarLink>
          <SidebarLink section="jobs" activeSection={activeSection} onClick={handleSectionChange} icon={<FiBriefcase />}>Manage Jobs</SidebarLink>
          <SidebarLink section="applications" activeSection={activeSection} onClick={handleSectionChange} icon={<FiInbox />}>Job Applications</SidebarLink>
          <SidebarLink section="reporterRequests" activeSection={activeSection} onClick={handleSectionChange} icon={<FiUserCheck />}>Reporter Requests</SidebarLink>
          <SidebarLink section="news" activeSection={activeSection} onClick={handleSectionChange} icon={<FiFileText />}>Manage News</SidebarLink>
          <SidebarLink section="tasks" activeSection={activeSection} onClick={handleSectionChange} icon={<FiCheckSquare />}>Manage Tasks</SidebarLink>
          <SidebarLink section="messages" activeSection={activeSection} onClick={handleSectionChange} icon={<FiMail />}>Contact Messages</SidebarLink>
          <SidebarLink section="config" activeSection={activeSection} onClick={handleSectionChange} icon={<FiSettings />}>Site Config</SidebarLink>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        {/* Conditional rendering based on activeSection */}
        {loading && <p>Loading...</p>}
        {error && <p className="text-red-500">{error}</p>}
        {!loading && !error && (
          <>
            {activeSection === "users" && renderUsersSection()}
            {activeSection === "jobs" && renderJobsSection()}
            {activeSection === "applications" && renderApplicationsSection()}
            {activeSection === "reporterRequests" && renderReporterRequests()}
            {activeSection === "news" && renderNewsSection()}
            {activeSection === "tasks" && renderTasksSection()}
            {activeSection === "messages" && renderMessagesSection()}
            {activeSection === "config" && renderConfigSection()}
          </>
        )}
      </main>
    </div>
  );
};

// Helper component for sidebar links (optional but good practice)
const SidebarLink = ({ section, activeSection, onClick, icon, children }) => (
  <button 
    onClick={() => onClick(section)} 
    className={`flex items-center w-full px-4 py-2 rounded transition-colors duration-200 ${activeSection === section ? 'bg-purple-600 text-white' : 'text-gray-400 hover:bg-gray-700 hover:text-white'}`}
  >
    <span className="mr-3">{icon}</span>
    {children}
  </button>
);

export default AdminDashboard;
