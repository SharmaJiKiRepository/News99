// news99-frontend/src/pages/Profile.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import { fetchUserProfile } from "../services/authService";

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // NEW: We'll store the become-reporter form fields in state:
  const [reporterForm, setReporterForm] = useState({
    phoneNumber: "",
    reason: "",
    experience: "",
    areaOfInterest: "",
  });

  // Controls whether we show/hide the "Apply Reporter" form
  const [showApplyForm, setShowApplyForm] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetchUserProfile(token)
        .then((data) => {
          setProfile(data);
          setLoading(false);
        })
        .catch((err) => {
          setError(err.response?.data?.message || "Failed to load profile");
          setLoading(false);
        });
    } else {
      setError("You are not logged in.");
      setLoading(false);
    }
  }, []);

  // Handle changes to our new reporter form
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setReporterForm((prev) => ({ ...prev, [name]: value }));
  };

  // Called when user clicks "Submit Application" in our new form
  const handleApplyForReporter = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      // Send all the reporterForm fields to /apply-reporter
      await axios.post(
        "http://localhost:5000/api/apply-reporter",
        {
          phoneNumber: reporterForm.phoneNumber,
          reason: reporterForm.reason,
          experience: reporterForm.experience,
          areaOfInterest: reporterForm.areaOfInterest,
          location: reporterForm.location,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      alert("Reporter request submitted. Pending admin approval.");
      // Reset form, hide it
      setReporterForm({
        phoneNumber: "",
        reason: "",
        experience: "",
        areaOfInterest: "",
        location: reporterForm.location,
      });
      setShowApplyForm(false);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to apply for reporter");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-900">
        <p className="text-gray-300 text-lg animate-pulse">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-900">
        <p className="text-red-400 text-lg">{error}</p>
      </div>
    );
  }

  const usernameInitial = profile?.username?.charAt(0).toUpperCase() || "";
  const roleDisplay = profile?.role
    ? profile.role.charAt(0).toUpperCase() + profile.role.slice(1)
    : "";

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="bg-gray-800 text-white shadow-lg rounded-lg p-6 w-11/12 sm:w-2/3 lg:w-1/3">
        {/* Profile Header */}
        <div className="flex flex-col items-center">
          <div className="w-24 h-24 rounded-full bg-blue-600 flex items-center justify-center mb-4">
            <span className="text-3xl font-bold text-white">{usernameInitial}</span>
          </div>
          <h1 className="text-xl font-semibold mb-2">Welcome, {profile.username}</h1>
          <p className="text-gray-400 text-sm">Your {roleDisplay} Dashboard</p>
        </div>

        {/* Profile Details */}
        <div className="mt-6 space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Email:</span>
            <span className="text-white">{profile.email}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Role:</span>
            <span
              className={`text-sm font-medium ${
                profile.role === "admin" ? "text-red-400" : "text-blue-400"
              }`}
            >
              {roleDisplay}
            </span>
          </div>
        </div>

        {/* Role-Specific Features (User Only) */}
        {profile.role === "user" && (
          <div className="mt-6">
            {/* Toggle button to show/hide the form */}
            {!showApplyForm && (
              <button
                onClick={() => setShowApplyForm(true)}
                className="w-full py-2 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600 transition duration-200"
              >
                Apply to Become a Reporter
              </button>
            )}

            {/* The Apply For Reporter Form */}
            {showApplyForm && (
              <form onSubmit={handleApplyForReporter} className="mt-4 space-y-4">
                <div>
                  <label className="block mb-1 text-gray-300">Phone Number</label>
                  <input
                    name="phoneNumber"
                    value={reporterForm.phoneNumber}
                    onChange={handleFormChange}
                    className="w-full rounded-md bg-gray-700 border border-gray-600 px-3 py-2"
                    placeholder="e.g. +91 555-555-5555"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-gray-300">Area of Interest</label>
                  <input
                    name="areaOfInterest"
                    value={reporterForm.areaOfInterest}
                    onChange={handleFormChange}
                    className="w-full rounded-md bg-gray-700 border border-gray-600 px-3 py-2"
                    placeholder="e.g. Politics, Sports, Tech..."
                  />
                </div>
                <div>
                  <label className="block mb-1 text-gray-300">Your Experience</label>
                  <textarea
                    name="experience"
                    value={reporterForm.experience}
                    onChange={handleFormChange}
                    rows="3"
                    className="w-full rounded-md bg-gray-700 border border-gray-600 px-3 py-2"
                    placeholder="Tell us about any relevant writing or journalism experience..."
                  />
                </div>
                <div>
                  <label className="block mb-1 text-gray-300">Reason / Motivation</label>
                  <textarea
                    name="reason"
                    value={reporterForm.reason}
                    onChange={handleFormChange}
                    rows="3"
                    className="w-full rounded-md bg-gray-700 border border-gray-600 px-3 py-2"
                    placeholder="Why do you want to become a reporter?"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-gray-300">location
                    <textarea
                    name="location"
                    value={reporterForm.location}
                    onChange={handleFormChange}
                    row="3"
                    className="w-full rounded-md bg-gray-700 border border-gray-600 px-3 py-2"
                    />
                  </label>
                </div>
                <button
                  type="submit"
                  className="w-full py-2 mt-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 transition duration-200"
                >
                  Submit Application
                </button>
              </form>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 border-t border-gray-700 pt-4">
          <p className="text-center text-sm text-gray-500">
            Need help? Contact support at:{" "}
            <a
              href="mailto:support@news99.com"
              className="text-blue-400 hover:underline"
            >
              news99publications@gmail.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Profile;
