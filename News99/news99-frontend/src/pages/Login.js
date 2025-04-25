import React, { useState } from 'react';
import { loginUser } from '../services/authService';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { useNavigate, Link } from 'react-router-dom';

const Login = ({ setToken }) => {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { token, role } = await loginUser(credentials);
      localStorage.setItem('token', token);
      setToken(token);

      // DEBUG: Log the role to confirm what's actually returned
      console.log('Role from backend:', role);

      const roleLower = role ? role.toLowerCase() : '';
      if (roleLower === 'admin') {
        navigate('/admin');
      } else {
        navigate('/profile');
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white px-4 py-10">
      <div className="bg-gray-800 p-5 sm:p-8 rounded-xl shadow-lg w-full max-w-xs sm:max-w-sm md:max-w-md">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-center text-white mb-4 sm:mb-6">Welcome Back</h2>
        {error && (
          <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-3 mb-5">
            <p className="text-red-400 text-center text-xs sm:text-sm font-medium">{error}</p>
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          <div className="relative">
            <label htmlFor="email" className="block text-xs sm:text-sm font-medium text-gray-300 mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              id="email"
              placeholder="Enter your email"
              value={credentials.email}
              onChange={handleChange}
              required
              className="w-full p-2.5 sm:p-3 bg-gray-700 text-white text-sm rounded-lg border border-gray-600 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              aria-label="Email"
            />
          </div>

          <div className="relative">
            <label htmlFor="password" className="block text-xs sm:text-sm font-medium text-gray-300 mb-1">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                id="password"
                placeholder="Enter your password"
                value={credentials.password}
                onChange={handleChange}
                required
                className="w-full p-2.5 sm:p-3 bg-gray-700 text-white text-sm rounded-lg border border-gray-600 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                aria-label="Password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute top-1/2 -translate-y-1/2 right-3 text-gray-400 hover:text-gray-200 focus:outline-none"
                aria-label="Toggle Password Visibility"
              >
                {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
              </button>
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="rememberMe"
              name="rememberMe"
              className="h-4 w-4 text-indigo-500 bg-gray-700 rounded border-gray-600 focus:ring-indigo-400"
            />
            <label htmlFor="rememberMe" className="ml-2 text-xs sm:text-sm font-medium text-gray-300">
              Remember Me
            </label>
          </div>

          <div>
            <button
              type="submit"
              className={`w-full py-2.5 sm:py-3 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white text-sm font-bold rounded-lg hover:opacity-90 focus:outline-none focus:ring-4 focus:ring-purple-300 transition ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={loading}
              aria-label="Login"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </div>
        </form>

        <div className="mt-5 sm:mt-6 text-center">
          <p className="text-gray-400 text-xs sm:text-sm">
            Don't have an account?{' '}
            <Link to="/register" className="text-indigo-400 hover:text-indigo-300 font-medium">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
