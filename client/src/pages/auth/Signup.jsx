// src/pages/SignupPage.jsx
import React, { useState } from 'react';
import { Shield, Github, Chrome, Mail, Lock, Eye, EyeOff, User, Phone, AlertCircle } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export const Signup = () => {
  const navigate = useNavigate();
  const { signup, isLoading, error, clearError } = useAuth();
  
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    phone: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    
    const result = await signup({
      ...formData,
      phone: formData.phone || undefined,
    });
    
    if (result.success) {
      navigate('/dashboard');
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center space-x-2 mb-4">
            <Shield className="w-10 h-10 text-indigo-400" />
            <span className="text-2xl font-bold text-white">AuthKit</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Create an account</h1>
          <p className="text-slate-400">Get started with your free account</p>
        </div>

        {/* Signup Card */}
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-slate-700">
          {/* Error Alert */}
          {error && (
            <div className="mb-6 bg-red-500/10 border border-red-500/50 rounded-lg p-4 flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            </div>
          )}

          {/* Social Login Buttons */}
          <div className="space-y-3 mb-6">
            <button 
              type="button"
              className="w-full flex items-center justify-center space-x-3 bg-slate-700/50 border border-slate-600 rounded-lg py-3 hover:bg-slate-700 transition text-white font-medium"
            >
              <Github className="w-5 h-5" />
              <span>Continue with GitHub</span>
            </button>
            <button 
              type="button"
              className="w-full flex items-center justify-center space-x-3 bg-slate-700/50 border border-slate-600 rounded-lg py-3 hover:bg-slate-700 transition text-white font-medium"
            >
              <Chrome className="w-5 h-5" />
              <span>Continue with Google</span>
            </button>
          </div>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-3 bg-slate-800/50 text-slate-400">Or continue with email</span>
            </div>
          </div>

          {/* Signup Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-slate-300 mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="w-full pl-11 pr-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-white placeholder-slate-500 transition"
                  placeholder="John Doe"
                  disabled={isLoading}
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
                Email address
              </label>
              <div className="relative">
                <Mail className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-11 pr-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-white placeholder-slate-500 transition"
                  placeholder="you@example.com"
                  disabled={isLoading}
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-slate-300 mb-2">
                Phone Number <span className="text-slate-500">(Optional)</span>
              </label>
              <div className="relative">
                <Phone className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full pl-11 pr-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-white placeholder-slate-500 transition"
                  placeholder="+1 (555) 000-0000"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-11 pr-12 py-3 bg-slate-900/50 border border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-white placeholder-slate-500 transition"
                  placeholder="••••••••"
                  disabled={isLoading}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-300 transition"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Terms and Conditions */}
            <div className="flex items-start space-x-2">
              <input
                type="checkbox"
                id="terms"
                className="w-4 h-4 rounded border-slate-600 bg-slate-900 text-indigo-600 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-0 mt-0.5"
                required
              />
              <label htmlFor="terms" className="text-sm text-slate-300">
                I agree to the{' '}
                <a href="#" className="text-indigo-400 hover:text-indigo-300 transition">
                  Terms of Service
                </a>
                {' '}and{' '}
                <a href="#" className="text-indigo-400 hover:text-indigo-300 transition">
                  Privacy Policy
                </a>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-500 transition font-medium shadow-lg shadow-indigo-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating account...
                </>
              ) : (
                'Create account'
              )}
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-slate-400">
              Already have an account?{' '}
              <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-medium transition">
                Sign in
              </Link>
            </p>
          </div>
        </div>

        {/* Footer Links */}
        <div className="mt-8 text-center space-x-6 text-sm text-slate-500">
          <a href="#" className="hover:text-slate-300 transition">Privacy Policy</a>
          <a href="#" className="hover:text-slate-300 transition">Terms of Service</a>
        </div>
      </div>
    </div>
  );
};