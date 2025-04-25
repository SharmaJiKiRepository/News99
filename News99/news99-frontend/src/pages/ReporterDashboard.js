import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  FiFileText,
  FiCheckSquare,
  FiArchive,
  FiPlusCircle,
  FiMenu,
  FiX
} from "react-icons/fi";

const ReporterDashboard = () => {
  const [activeSection, setActiveSection] = useState("submissions");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // -------------------------
  // 1) My Submissions (all statuses)
  // -------------------------
  const [submissions, setSubmissions] = useState([]);
  const [submissionsLoading, setSubmissionsLoading] = useState(true);
  const [submissionsError, setSubmissionsError] = useState("");

  // -------------------------
  // 2) Submit News Form
  // -------------------------
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("General"); 
  const [imageFile, setImageFile] = useState(null);
  const [availableCategories, setAvailableCategories] = useState([
    "General",
    "Politics",
    "Sports",
    "Entertainment",
    "Technology"
  ]);

  // -------------------------
  // 3) Assigned Tasks
  // -------------------------
  const [tasks, setTasks] = useState([]);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [tasksError, setTasksError] = useState("");

  // Toggle mobile menu
  const toggleMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  // Navigate to section (closes mobile menu)
  const navigateToSection = (section) => {
    setActiveSection(section);
    setMobileMenuOpen(false);
  };

  // On mount: fetch submissions, tasks, and categories
  useEffect(() => {
    fetchMySubmissions();
    fetchAssignedTasks();
    fetchCategories();
  }, []);

  // ============================
  // FETCH: My Submissions (all statuses)
  // ============================
  const fetchMySubmissions = async () => {
    try {
      const token = localStorage.getItem("token");
      setSubmissionsLoading(true);
      const res = await axios.get("http://localhost:5000/api/news/my-submissions", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSubmissions(res.data);
    } catch (err) {
      setSubmissionsError(err.response?.data?.message || "Failed to load submissions");
    } finally {
      setSubmissionsLoading(false);
    }
  };

  // ============================
  // FETCH: Assigned Tasks
  // ============================
  const fetchAssignedTasks = async () => {
    try {
      const token = localStorage.getItem("token");
      setTasksLoading(true);
      const res = await axios.get("http://localhost:5000/api/reporter/tasks", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTasks(res.data);
    } catch (err) {
      setTasksError(err.response?.data?.message || "Failed to load tasks");
    } finally {
      setTasksLoading(false);
    }
  };

  // ============================
  // FETCH: Available Categories
  // ============================
  const fetchCategories = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/categories");
      setAvailableCategories(res.data);
    } catch (err) {
      console.error("Failed to fetch categories, using defaults.", err);
    }
  };

  // ============================
  // SUBMIT NEWS
  // ============================
  const handleSubmitNews = async (e) => {
    e.preventDefault();
    if (!title || !description) {
      alert("Title and description are required.");
      return;
    }
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("category", category);
      if (imageFile) {
        formData.append("image", imageFile);
      }

      await axios.post("http://localhost:5000/api/news", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      alert("News submitted successfully (pending admin approval).");
      // Clear form
      setTitle("");
      setDescription("");
      setCategory("General");
      setImageFile(null);
      // Refresh "My Submissions"
      fetchMySubmissions();
      setActiveSection("submissions");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to submit news");
    }
  };

  // ============================
  // ACCEPT TASK (reporter)
  // ============================
  const handleAcceptTask = async (taskId) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.put(
        `http://localhost:5000/api/reporter/tasks/${taskId}`,
        { status: "in-progress" },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setTasks((prev) => prev.map((t) => (t._id === taskId ? res.data : t)));
      alert("Task accepted! Status changed to in-progress.");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to accept task");
    }
  };

  // ============================
  // COMPLETE TASK (reporter)
  // ============================
  const handleCompleteTask = async (taskId) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.put(
        `http://localhost:5000/api/reporter/tasks/${taskId}`,
        { status: "completed" },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setTasks((prev) => prev.map((t) => (t._id === taskId ? res.data : t)));
      alert("Task marked as completed!");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to complete task");
    }
  };

  // ============================
  // RENDER: My Submissions
  // ============================
  const renderSubmissionsSection = () => (
    <div className="bg-gray-800 p-4 rounded-md shadow-md">
      <h2 className="text-xl font-semibold mb-4">My Submissions</h2>
      {submissionsLoading ? (
        <p>Loading your submissions...</p>
      ) : submissionsError ? (
        <p className="text-red-400">{submissionsError}</p>
      ) : submissions.length === 0 ? (
        <p>No submissions yet.</p>
      ) : (
        <div className="space-y-3">
          {submissions.map((item) => (
            <div
              key={item._id}
              className="p-3 rounded-md bg-gray-700 border border-gray-600"
            >
              <h3 className="font-bold">{item.title}</h3>
              <p className="text-sm text-gray-300 mb-1">
                Status: {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
              </p>
              {item.status === "rejected" && (
                <p className="text-sm text-red-400">
                  Rejection Reason: {item.rejectionReason}
                </p>
              )}
              <p className="text-sm">Category: {item.category || "General"}</p>
              <p>{item.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // ============================
  // RENDER: Submit News
  // ============================
  const renderSubmitNewsSection = () => (
    <div className="bg-gray-800 p-4 rounded-md shadow-md">
      <h2 className="text-xl font-semibold mb-4">Submit News Article</h2>
      <form onSubmit={handleSubmitNews} className="space-y-4">
        <div>
          <label className="block mb-1 font-medium">Title</label>
          <input
            type="text"
            className="w-full bg-gray-700 rounded px-3 py-2"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter article headline"
            required
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">Description</label>
          <textarea
            className="w-full bg-gray-700 rounded px-3 py-2"
            rows="3"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Write your news content here..."
            required
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">Category</label>
          <select
            className="w-full bg-gray-700 rounded px-3 py-2"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
          >
            {availableCategories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block mb-1 font-medium">Upload Image (Optional)</label>
          <input
            type="file"
            accept="image/*"
            className="w-full bg-gray-700 rounded px-3 py-2"
            onChange={(e) => setImageFile(e.target.files[0])}
          />
        </div>
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
        >
          Submit Article
        </button>
      </form>
    </div>
  );

  // ============================
  // RENDER: Assigned Tasks
  // ============================
  const renderAssignedTasksSection = () => (
    <div className="bg-gray-800 p-4 rounded-md shadow-md">
      <h2 className="text-xl font-semibold mb-4">Assigned Tasks</h2>
      {tasksLoading ? (
        <p>Loading your tasks...</p>
      ) : tasksError ? (
        <p className="text-red-400">{tasksError}</p>
      ) : tasks.length === 0 ? (
        <p>No tasks assigned to you yet.</p>
      ) : (
        <div className="space-y-3">
          {tasks.map((task) => (
            <div
              key={task._id}
              className="p-3 rounded-md bg-gray-700 border border-gray-600"
            >
              <h3 className="font-bold">{task.title}</h3>
              <p className="text-sm mb-2">
                Status:{" "}
                <span
                  className={`font-medium px-2 py-0.5 rounded ${
                    task.status === "pending"
                      ? "bg-yellow-800 text-yellow-200"
                      : task.status === "in-progress"
                      ? "bg-blue-800 text-blue-200"
                      : "bg-green-800 text-green-200"
                  }`}
                >
                  {task.status}
                </span>
              </p>
              <p className="mb-2">{task.description}</p>

              {task.status === "pending" ? (
                <button
                  onClick={() => handleAcceptTask(task._id)}
                  className="bg-green-600 hover:bg-green-700 text-white py-1 px-3 rounded text-sm"
                >
                  Accept Task
                </button>
              ) : task.status === "in-progress" ? (
                <button
                  onClick={() => handleCompleteTask(task._id)}
                  className="bg-blue-600 hover:bg-blue-700 text-white py-1 px-3 rounded text-sm"
                >
                  Mark as Completed
                </button>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // ============================
  // RENDER: Published Articles
  // ============================
  const renderPublishedArticlesSection = () => {
    const publishedArticles = submissions.filter(
      (item) => item.status === "approved"
    );

    return (
      <div className="bg-gray-800 p-4 rounded-md shadow-md">
        <h2 className="text-xl font-semibold mb-4">Published Articles</h2>
        {submissionsLoading ? (
          <p>Loading your published articles...</p>
        ) : publishedArticles.length === 0 ? (
          <p>No published articles yet.</p>
        ) : (
          <div className="space-y-3">
            {publishedArticles.map((article) => (
              <div
                key={article._id}
                className="p-3 rounded-md bg-gray-700 border border-gray-600"
              >
                <h3 className="font-bold">{article.title}</h3>
                <p className="text-sm mb-1">Category: {article.category || "General"}</p>
                <p>{article.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-2 sm:p-4">
      {/* Mobile header with menu toggle */}
      <div className="lg:hidden flex items-center justify-between bg-gray-800 p-3 mb-4 rounded-md shadow-md">
        <h1 className="text-xl font-semibold">Reporter Dashboard</h1>
        <button 
          onClick={toggleMenu} 
          className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors"
        >
          {mobileMenuOpen ? <FiX size={20} /> : <FiMenu size={20} />}
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-4">
        {/* Sidebar - Fixed for mobile, normal for desktop */}
        <aside 
          className={`bg-gray-800 rounded-md shadow-md lg:w-64 p-4 fixed lg:static inset-y-0 left-0 transform ${
            mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          } lg:translate-x-0 transition-transform duration-300 ease-in-out z-30 overflow-y-auto h-full`}
        >
          <div className="hidden lg:block mb-4 pb-2 border-b border-gray-700">
            <h2 className="text-2xl font-bold">Reporter Dashboard</h2>
          </div>
          
          <nav>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => navigateToSection("submissions")}
                  className={`w-full flex items-center p-3 rounded-md ${
                    activeSection === "submissions" ? "bg-red-600" : "hover:bg-gray-700"
                  }`}
                >
                  <FiFileText className="mr-3" />
                  My Submissions
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateToSection("submit")}
                  className={`w-full flex items-center p-3 rounded-md ${
                    activeSection === "submit" ? "bg-red-600" : "hover:bg-gray-700"
                  }`}
                >
                  <FiPlusCircle className="mr-3" />
                  Submit News
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateToSection("tasks")}
                  className={`w-full flex items-center p-3 rounded-md ${
                    activeSection === "tasks" ? "bg-red-600" : "hover:bg-gray-700"
                  }`}
                >
                  <FiCheckSquare className="mr-3" />
                  Assigned Tasks
                  {tasks.filter(t => t.status === "pending").length > 0 && (
                    <span className="ml-auto bg-red-500 text-white rounded-full h-5 w-5 flex items-center justify-center text-xs">
                      {tasks.filter(t => t.status === "pending").length}
                    </span>
                  )}
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateToSection("published")}
                  className={`w-full flex items-center p-3 rounded-md ${
                    activeSection === "published" ? "bg-red-600" : "hover:bg-gray-700"
                  }`}
                >
                  <FiArchive className="mr-3" />
                  Published Articles
                </button>
              </li>
            </ul>
          </nav>
        </aside>

        {/* Backdrop for mobile sidebar */}
        {mobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
            onClick={toggleMenu}
          ></div>
        )}

        {/* Main Content */}
        <main className="lg:flex-1">
          {activeSection === "submissions" && renderSubmissionsSection()}
          {activeSection === "submit" && renderSubmitNewsSection()}
          {activeSection === "tasks" && renderAssignedTasksSection()}
          {activeSection === "published" && renderPublishedArticlesSection()}
        </main>
      </div>
    </div>
  );
};

export default ReporterDashboard;
