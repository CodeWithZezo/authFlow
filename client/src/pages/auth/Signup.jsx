import React, { useEffect, useState } from 'react';
import { Shield, Github, Chrome, Mail, Lock, Eye, EyeOff, User, Phone } from 'lucide-react';
import {useAuthStore} from "../../store/auth"
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { validateEmail, validateFullName, validatePassword, validatePhone } from '../../validators/validators';

export default function SignUp() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone:''
  });

  const signup = useAuthStore((state) => state.signup);
  const error = useAuthStore((state) => state.error);
  const setError = useAuthStore((state) => state.setError);

  useEffect(() => {
    if(error){
      toast.error(error);
      setError(null);
    }
  }, [error]);

  const handleSubmit = async () => {
  const {
    email,
    fullName,
    phone,
    password,
    confirmPassword,
  } = formData;

  // Email
  if (!validateEmail(email)) {
    toast.error("Please enter a valid email address");
    return;
  }

  // Full name (max 100 chars)
  if (!validateFullName(fullName)) {
    toast.error("Full name must be between 1 and 100 characters");
    return;
  }

  // Phone
  if(phone.length > 0){
    if (!validatePhone(phone)) {
    toast.error("Please enter a valid phone number");
    return;
  }
  }

  // Password match
  if (password !== confirmPassword) {
    toast.error("Passwords do not match");
    return;
  }

  // Password rules
  // const passwordCheck = validatePassword(password);
  // if (!passwordCheck.valid) {
  //   toast.error("Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number");
  //   return;
  // }

  // Frontend-only validation passed
  const res = await signup(formData);

  if (res.success) {
    toast.success("Signup successful");
    navigate("/dashboard");
  } else {
    toast.error(res.message);
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

        {/* Sign Up Card */}
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-slate-700">
          {/* Social Sign Up Buttons */}
          {/* <div className="space-y-3 mb-6">
            <button className="w-full flex items-center justify-center space-x-3 bg-slate-700/50 border border-slate-600 rounded-lg py-3 hover:bg-slate-700 transition text-white font-medium">
              <Github className="w-5 h-5" />
              <span>Continue with GitHub</span>
            </button>
            <button className="w-full flex items-center justify-center space-x-3 bg-slate-700/50 border border-slate-600 rounded-lg py-3 hover:bg-slate-700 transition text-white font-medium">
              <Chrome className="w-5 h-5" />
              <span>Continue with Google</span>
            </button>
          </div> */}

          {/* Divider */}
          {/* <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-3 bg-slate-800/50 text-slate-400">Or continue with email</span>
            </div>
          </div> */}

          {/* Sign Up Form */}
          <div className="space-y-5">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-2">
                Full name
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

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-300 mb-2">
                Confirm password
              </label>
              <div className="relative">
                <Lock className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full pl-11 pr-12 py-3 bg-slate-900/50 border border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-white placeholder-slate-500 transition"
                  placeholder="••••••••" 
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-300 transition"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            {/* add phone field */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-slate-300 mb-2">
                Phone number (optional)
              </label>
              <div className="relative">
                <Phone className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  id="phone"
                  name="phone"
                  type="text"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full pl-11 pr-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-white placeholder-slate-500 transition"
                  placeholder="1234567890 "
                />
              </div>
            </div>


            {/* Terms and Conditions */}
            <div>
              <label className="flex items-start space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-slate-600 bg-slate-900 text-indigo-600 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-0 mt-0.5"
                />
                <span className="text-sm text-slate-300">
                  I agree to the{' '}
                  <a href="#" className="text-indigo-400 hover:text-indigo-300">Terms of Service</a>
                  {' '}and{' '}
                  <a href="#" className="text-indigo-400 hover:text-indigo-300">Privacy Policy</a>
                </span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-500 transition font-medium shadow-lg shadow-indigo-500/30"
            >
              Create account
            </button>
          </div>

          {/* Sign In Link */}
          <div className="mt-6 text-center">
            <p className="text-slate-400">
              Already have an account?{' '}
              <a href="#" className="text-indigo-400 hover:text-indigo-300 font-medium transition">
                Sign in
              </a>
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
}