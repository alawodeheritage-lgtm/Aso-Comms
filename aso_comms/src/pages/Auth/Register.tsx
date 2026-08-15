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
  const [showConfirm, setShowConfirm] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (errorMsg) setErrorMsg('');
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

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
        headers: { 'Content-Type': 'application/json' },
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
        console.log('📧 Registration successful!');
        console.log('🔑 Your OTP is:', data.otp);
        localStorage.setItem('registerEmail', formData.email);
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
    <div className="min-h-screen flex items-center justify-center bg-[#F8F6F1] px-4 py-8">
      <div className="w-full max-w-5xl rounded-2xl bg-white shadow-xl shadow-slate-200/60 overflow-hidden border border-slate-200/80 flex flex-col md:flex-row">

        {/* LEFT – Brand side (warm, human) */}
        <div className="relative md:w-2/5 bg-gradient-to-br from-[#1A365D] to-[#2D4A6B] p-8 flex flex-col items-center justify-center text-white hidden md:flex">
          <svg
            className="absolute top-0 right-0 opacity-10"
            width="200"
            height="200"
            viewBox="0 0 200 200"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="150" cy="150" r="100" fill="#D97706" />
            <circle cx="50" cy="50" r="80" fill="#D97706" opacity="0.5" />
          </svg>
          <div className="relative z-10 text-center">
            <span className="material-symbols-outlined text-7xl text-amber-400 mb-4">person_add</span>
            <h2 className="font-display text-3xl font-bold tracking-tight">Join AsoComms</h2>
            <p className="text-blue-100 mt-2 max-w-xs">
              Start managing your repairs with confidence.
            </p>
            <div className="mt-6 flex gap-4 text-xs font-medium text-blue-200">
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">check_circle</span>
                Free to join
              </span>
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">security</span>
                Secure & private
              </span>
            </div>
          </div>
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-20 h-1 bg-amber-400 rounded-full"></div>
        </div>

        {/* RIGHT – Registration Form */}
        <div className="flex-1 p-8 md:p-12">
          <div className="max-w-sm mx-auto">
            {/* Mobile logo */}
            <div className="flex flex-col items-center gap-2 text-center md:hidden mb-6">
              <span className="material-symbols-outlined text-4xl text-[#1A365D]">precision_manufacturing</span>
              <h1 className="text-2xl font-display font-bold text-[#1A365D]">AsoComms</h1>
            </div>

            <div className="space-y-1">
              <h2 className="text-2xl font-display font-bold text-[#1A365D]">Create your account</h2>
              <p className="text-sm text-slate-500">It’s quick and easy – get started below.</p>
            </div>

            {errorMsg && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-600 font-medium">
                <span className="material-symbols-outlined text-base">error</span>
                <span>{errorMsg}</span>
              </div>
            )}

            <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
              {/* Full Name */}
              <div className="space-y-1.5">
                <label htmlFor="fullName" className="text-sm font-medium text-slate-700">Full Name</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">person</span>
                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    autoComplete="name"
                    placeholder="Jane Doe"
                    value={formData.fullName}
                    onChange={handleChange}
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#1A365D] focus:outline-none focus:ring-2 focus:ring-[#1A365D]/20 transition-shadow"
                    required
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label htmlFor="email" className="text-sm font-medium text-slate-700">Email</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">mail</span>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#1A365D] focus:outline-none focus:ring-2 focus:ring-[#1A365D]/20 transition-shadow"
                    required
                  />
                </div>
              </div>

              {/* Phone */}
              <div className="space-y-1.5">
                <label htmlFor="phone" className="text-sm font-medium text-slate-700">Phone</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">call</span>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    placeholder="+234 800 000 0000"
                    value={formData.phone}
                    onChange={handleChange}
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#1A365D] focus:outline-none focus:ring-2 focus:ring-[#1A365D]/20 transition-shadow"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label htmlFor="password" className="text-sm font-medium text-slate-700">Password</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">lock</span>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    placeholder="Create a password"
                    value={formData.password}
                    onChange={handleChange}
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-11 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#1A365D] focus:outline-none focus:ring-2 focus:ring-[#1A365D]/20 transition-shadow"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-slate-400 transition-colors hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#1A365D]/20"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    <span className="material-symbols-outlined text-base">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-1.5">
                <label htmlFor="confirmPassword" className="text-sm font-medium text-slate-700">Confirm Password</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">lock_reset</span>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirm ? 'text' : 'password'}
                    autoComplete="new-password"
                    placeholder="Re-enter your password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-11 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#1A365D] focus:outline-none focus:ring-2 focus:ring-[#1A365D]/20 transition-shadow"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-slate-400 transition-colors hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#1A365D]/20"
                    aria-label={showConfirm ? 'Hide confirm' : 'Show confirm'}
                  >
                    <span className="material-symbols-outlined text-base">
                      {showConfirm ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Submit button with hover lift */}
              <button
                type="submit"
                disabled={isLoading}
                className="h-11 w-full rounded-xl bg-[#1A365D] text-white font-bold hover:bg-[#2D4A6B] active:scale-95 transition-all shadow-sm shadow-[#1A365D]/20 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 hover:shadow-md hover:-translate-y-0.5"
              >
                {isLoading ? (
                  <>
                    <span className="material-symbols-outlined text-base animate-spin">progress_activity</span>
                    Creating account...
                  </>
                ) : (
                  'Join now'
                )}
              </button>
            </form>

            {/* Footer */}
            <p className="mt-6 text-center text-sm text-slate-500">
              {"Already have an account? "}
              <Link to="/login" className="font-medium text-[#D97706] transition-colors hover:text-[#b85f00] hover:underline">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>

      <style>{`
        .font-display {
          font-family: 'Space Grotesk', system-ui, sans-serif;
        }
        .material-symbols-outlined {
          font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
          vertical-align: middle;
          display: inline-block;
          line-height: 1;
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