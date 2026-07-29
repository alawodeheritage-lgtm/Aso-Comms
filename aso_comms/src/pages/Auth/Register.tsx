// src/pages/Auth/Register.tsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (errorMsg) setErrorMsg('');
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // src/pages/Auth/Register.tsx - Updated handleSubmit
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  // Validation
  if (formData.password !== formData.confirmPassword) {
    setErrorMsg('Passwords do not match');
    return;
  }
  if (formData.password.length < 8) {
    setErrorMsg('Password must be at least 8 characters long');
    return;
  }

  setIsLoading(true);
  setErrorMsg('');

  try {
    const response = await fetch('http://localhost:5000/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        username: formData.fullName.trim(),
        email: formData.email.trim(),
        phoneNumber: formData.phone.trim(),
        password: formData.password
      })
    });

    const data = await response.json();

    if (response.ok) {
      // Log the OTP for testing (in case email doesn't arrive)
      console.log('📧 Registration successful!');
      console.log('🔑 Your OTP is:', data.otp);
      console.log('📧 Check your email or use this OTP to verify.');
      
      // Store email for OTP verification
      localStorage.setItem('registerEmail', formData.email);
      
      // Redirect to OTP verification
      navigate(`/verify-otp?email=${encodeURIComponent(formData.email)}&purpose=signup`);
    } else {
      setErrorMsg(data.error || 'Registration failed. Please try again.');
      setIsLoading(false);
    }
  } catch (err: any) {
    console.error('Registration error:', err);
    setErrorMsg('Network error. Please check if the server is running.');
    setIsLoading(false);
  }
};

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-slate-50/50 py-8 sm:py-12">
      <div className="w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-6 sm:mb-8">
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 mb-3 group"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <span className="material-symbols-outlined text-2xl">
                precision_manufacturing
              </span>
            </div>
            <span className="text-2xl font-extrabold tracking-tight text-slate-900">
              AsoComms
            </span>
          </Link>
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900">
            Create Account
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Start managing repair tickets and requests today
          </p>
        </div>

        {/* Card Container */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-5 sm:p-8">
          {/* Validation Error Banner */}
          {errorMsg && (
            <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl flex items-center gap-2 text-xs text-red-600 font-medium">
              <span className="material-symbols-outlined text-base">error</span>
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5 sm:space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Full Name
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 text-lg">
                  person
                </span>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="w-full h-11 sm:h-12 pl-10 pr-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:bg-white outline-none transition-all text-sm text-slate-800 placeholder-slate-400 font-medium"
                  placeholder="John Doe"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 text-lg">
                  mail
                </span>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full h-11 sm:h-12 pl-10 pr-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:bg-white outline-none transition-all text-sm text-slate-800 placeholder-slate-400 font-medium"
                  placeholder="name@asocomms.pro"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Phone Number
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 text-lg">
                  call
                </span>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full h-11 sm:h-12 pl-10 pr-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:bg-white outline-none transition-all text-sm text-slate-800 placeholder-slate-400 font-medium"
                  placeholder="+234 800 000 0000"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Password
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 text-lg">
                  lock
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full h-11 sm:h-12 pl-10 pr-11 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:bg-white outline-none transition-all text-sm text-slate-800 placeholder-slate-400 font-medium"
                  placeholder="••••••••"
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-blue-600 transition-colors flex items-center justify-center"
                  disabled={isLoading}
                >
                  <span className="material-symbols-outlined text-lg">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 text-lg">
                  lock_reset
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full h-11 sm:h-12 pl-10 pr-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:bg-white outline-none transition-all text-sm text-slate-800 placeholder-slate-400 font-medium"
                  placeholder="••••••••"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 sm:h-12 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 active:scale-95 transition-all flex items-center justify-center gap-2 text-sm shadow-sm shadow-blue-500/20 disabled:opacity-80 disabled:cursor-not-allowed pt-1"
            >
              {isLoading ? (
                <>
                  <span className="material-symbols-outlined text-base animate-spin">
                    progress_activity
                  </span>
                  Creating Account...
                </>
              ) : (
                <>
                  Create Account
                  <span className="material-symbols-outlined text-lg">
                    chevron_right
                  </span>
                </>
              )}
            </button>
          </form>

          {/* Login Prompt */}
          <div className="mt-6 pt-5 text-center border-t border-slate-100">
            <p className="text-xs sm:text-sm text-slate-500">
              Already have an account?{' '}
              <Link
                to="/login"
                className="text-blue-600 font-bold hover:text-blue-700 transition-colors"
              >
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Icon Styling */}
      <style>{`
        .material-symbols-outlined {
          font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
          vertical-align: middle;
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Register;