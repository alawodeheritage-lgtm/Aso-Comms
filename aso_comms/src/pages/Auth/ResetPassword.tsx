// src/pages/Auth/ResetPassword.tsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../api/axios';

const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Password strength helper
  const getStrength = (pwd: string) => {
    if (pwd.length === 0) return { width: '0%', color: '#D1D5DB', label: '' };
    if (pwd.length < 6) return { width: '33%', color: '#EF4444', label: 'Weak' };
    if (pwd.length < 10) return { width: '66%', color: '#D97706', label: 'Medium' };
    return { width: '100%', color: '#10B981', label: 'Strong' };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match');
      return;
    }
    if (password.length < 8) {
      setErrorMsg('Password must be at least 8 characters long');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    try {
      await api.post('/reset-password', { password });
      navigate('/login');
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error || 'Failed to reset password. Please try again.');
      setIsLoading(false);
    }
  };

  const strength = getStrength(password);

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
            <span className="material-symbols-outlined text-7xl text-amber-400 mb-4">lock_reset</span>
            <h2 className="font-display text-3xl font-bold tracking-tight">Set a new password</h2>
            <p className="text-blue-100 mt-2 max-w-xs">
              Create a new, secure password for your account.
            </p>
            <div className="mt-6 flex gap-4 text-xs font-medium text-blue-200">
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">check_circle</span>
                Secure & private
              </span>
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">support_agent</span>
                We're here to help
              </span>
            </div>
          </div>
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-20 h-1 bg-amber-400 rounded-full"></div>
        </div>

        {/* RIGHT – Form */}
        <div className="flex-1 p-8 md:p-12">
          <div className="max-w-sm mx-auto">
            {/* Mobile logo */}
            <div className="flex flex-col items-center gap-2 text-center md:hidden mb-6">
              <span className="material-symbols-outlined text-4xl text-[#1A365D]">precision_manufacturing</span>
              <h1 className="text-2xl font-display font-bold text-[#1A365D]">AsoComms</h1>
            </div>

            <div className="space-y-1">
              <h2 className="text-2xl font-display font-bold text-[#1A365D]">Set a new password</h2>
              <p className="text-sm text-slate-500">Create a new, secure password for your account.</p>
            </div>

            {errorMsg && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-600 font-medium">
                <span className="material-symbols-outlined text-base">error</span>
                <span>{errorMsg}</span>
              </div>
            )}

            <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
              {/* New Password */}
              <div className="space-y-1.5">
                <label htmlFor="new-password" className="text-sm font-medium text-slate-700">
                  New password
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">lock</span>
                  <input
                    id="new-password"
                    type={showNew ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a new password"
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-11 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#1A365D] focus:outline-none focus:ring-2 focus:ring-[#1A365D]/20 transition-shadow"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew(!showNew)}
                    className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-slate-400 transition-colors hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#1A365D]/20"
                    aria-label={showNew ? 'Hide password' : 'Show password'}
                  >
                    <span className="material-symbols-outlined text-base">
                      {showNew ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>

                {/* Strength indicator */}
                {password.length > 0 && (
                  <div className="pt-1">
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#1A365D]/10">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{ width: strength.width, backgroundColor: strength.color }}
                      />
                    </div>
                    <p className="mt-1.5 text-xs font-medium" style={{ color: strength.color }}>
                      {strength.label}
                    </p>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-1.5">
                <label htmlFor="confirm-password" className="text-sm font-medium text-slate-700">
                  Confirm password
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">lock_reset</span>
                  <input
                    id="confirm-password"
                    type={showConfirm ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter your password"
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

              <button
                type="submit"
                disabled={isLoading}
                className="h-11 w-full rounded-xl bg-[#1A365D] text-white font-bold hover:bg-[#2D4A6B] active:scale-95 transition-all shadow-sm shadow-[#1A365D]/20 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 hover:shadow-md hover:-translate-y-0.5"
              >
                {isLoading ? (
                  <>
                    <span className="material-symbols-outlined text-base animate-spin">progress_activity</span>
                    Resetting password...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-base">lock_reset</span>
                    Reset password
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-[#D97706] transition-colors hover:text-[#b85f00] hover:underline"
              >
                <span className="material-symbols-outlined text-base">arrow_back</span>
                Back to Sign In
              </Link>
            </div>
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

export default ResetPassword;