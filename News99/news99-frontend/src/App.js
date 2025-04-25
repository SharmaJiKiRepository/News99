// news99-frontend/src/App.js
import React, { useState, useEffect, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode"; // <-- Named import, not default
import { Helmet } from "react-helmet";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { fetchUserProfile } from "./services/authService";

// Lazy load pages for performance optimization
const Home = React.lazy(() => import("./pages/Home"));
const Categories = React.lazy(() => import("./pages/Categories"));
const CategoryNews = React.lazy(() => import("./pages/CategoryNews"));
const NewsDetail = React.lazy(() => import("./pages/NewsDetail"));
const Jobs = React.lazy(() => import("./pages/Jobs"));
const JobApplicationPage = React.lazy(() => import("./pages/JobApplicationPage"));
const Contact = React.lazy(() => import("./pages/Contact"));
const AboutUs = React.lazy(() => import("./pages/AboutUs"));
const Register = React.lazy(() => import("./pages/Register"));
const Login = React.lazy(() => import("./pages/Login"));

// Profile components
const Profile = React.lazy(() => import("./pages/Profile"));
const ReporterDashboard = React.lazy(() => import("./pages/ReporterDashboard"));

const AdminDashboard = React.lazy(() => import("./pages/AdminDashboard"));

function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token") || "");

  useEffect(() => {
    if (token) {
      try {
        // Decode the token with the named import
        const decoded = jwtDecode(token);
        // Basic user object from token
        setUser({ role: decoded.role, ...decoded });

        // Fetch full user profile from backend
        fetchUserProfile(token)
          .then((profile) => {
            setUser(profile);
          })
          .catch(() => {
            // Token invalid or profile fetch failed; log out
            localStorage.removeItem("token");
            setToken("");
            setUser(null);
          });
      } catch (err) {
        console.error("Invalid token, logging out...", err);
        localStorage.removeItem("token");
        setToken("");
        setUser(null);
      }
    }
  }, [token]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken("");
    setUser(null);
  };

  // Basic role-based route guard
  const ProtectedRoute = ({ children, role }) => {
    if (!token) return <Navigate to="/login" replace />;
    if (role && user?.role !== role) return <Navigate to="/" replace />;
    return children;
  };

  return (
    <Router>
      <Helmet>
        <title>News99 - Latest News and Updates</title>
        <meta
          name="description"
          content="News99 brings you the latest news across various categories including national, international, business, sports, and entertainment. Stay informed with our up-to-date coverage."
        />
        <meta
          name="keywords"
          content="News, Latest News, Breaking News, National, International, Business, Sports, Entertainment"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </Helmet>

      <div className="flex flex-col min-h-screen bg-gray-900">
        <Navbar user={user} onLogout={handleLogout} />

        <main className="flex-grow">
          <Suspense
            fallback={
              <div className="flex items-center justify-center min-h-[50vh]">
                <div className="animate-pulse flex flex-col items-center">
                  <div className="h-12 w-12 rounded-full bg-red-600 mb-3"></div>
                  <p className="text-white">Loading...</p>
                </div>
              </div>
            }
          >
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/categories" element={<Categories />} />
              <Route path="/category/:category" element={<CategoryNews />} />
              <Route path="/news/:id" element={<NewsDetail />} />
              <Route path="/jobs" element={<Jobs />} />
              <Route path="/job-application/:jobId" element={<JobApplicationPage />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/about" element={<AboutUs />} />
              <Route path="/register" element={<Register />} />

              {/* Login (pass setToken if needed) */}
              <Route path="/login" element={<Login setToken={setToken} />} />

              {/* Authenticated Routes */}
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    {/* If user is reporter, show ReporterDashboard,
                        otherwise show Profile. */}
                    {user?.role === "reporter" ? (
                      <ReporterDashboard />
                    ) : (
                      <Profile />
                    )}
                  </ProtectedRoute>
                }
              />

              {/* Admin-Only */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute role="admin">
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </Suspense>
        </main>

        <Footer />
      </div>
    </Router>
  );
}

export default App;
