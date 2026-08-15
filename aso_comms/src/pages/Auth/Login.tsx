// src/pages/Auth/Login.tsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login, user, isLoading: authLoading } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  // 🔒 Auth logic – unchanged
  useEffect(() => {
    console.log('👤 Login: Auth state changed', { user: user?.username, role: user?.role, authLoading });

    if (!authLoading && user) {
      console.log('✅ Login: User already logged in, redirecting...');
      if (user.role === 'manager' || user.role === 'ceo') {
        navigate('/admin', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    }
  }, [user, authLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Please enter both username and password');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      console.log('🔐 Attempting login with:', { username });

      const response = await login(username.trim(), password);
      console.log('✅ Login response:', response);

      if (response.user && !response.user.isVerified) {
        navigate(`/verify-otp?email=${encodeURIComponent(response.user.email)}&purpose=signup`);
        return;
      }
    } catch (err: any) {
      console.error('❌ Login error:', err);

      if (err.response?.status === 403 && err.response?.data?.needsVerification) {
        navigate(`/verify-otp?email=${encodeURIComponent(err.response.data.email)}&purpose=signup`);
        return;
      }

      if (err.response?.status === 401) {
        setError('Invalid username or password. Please try again.');
      } else if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Login failed. Please check your credentials and try again.');
      }
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8F6F1] px-4 py-8">
      {/* Main container – responsive split layout */}
      <div className="w-full max-w-5xl rounded-2xl bg-white shadow-xl shadow-slate-200/60 overflow-hidden border border-slate-200/80 flex flex-col md:flex-row">

        {/* LEFT SIDE – Brand illustration (warm, human) */}
        <div className="relative md:w-2/5 bg-gradient-to-br from-[#1A365D] to-[#2D4A6B] p-8 flex flex-col items-center justify-center text-white hidden md:flex">
          {/* Decorative abstract shape */}
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
            <span className="material-symbols-outlined text-7xl text-amber-400 mb-4">precision_manufacturing</span>
            <h2 className="font-display text-3xl font-bold tracking-tight">AsoComms</h2>
            <p className="text-blue-100 mt-2 max-w-xs">
              Trusted repair management for your devices.
            </p>
            <div className="mt-6 flex gap-4 text-xs font-medium text-blue-200">
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">check_circle</span>
                Trusted by 500+ customers
              </span>
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">build</span>
                Expert repairs
              </span>
            </div>
          </div>
          {/* Bottom decorative line */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-20 h-1 bg-amber-400 rounded-full"></div>
        </div>

        {/* RIGHT SIDE – Login Form */}
        <div className="flex-1 p-8 md:p-12">
          <div className="max-w-sm mx-auto">
            {/* Logo + title (mobile) */}
            <div className="flex flex-col items-center gap-2 text-center md:hidden mb-6">
              <span className="material-symbols-outlined text-4xl text-[#1A365D]">precision_manufacturing</span>
              <h1 className="text-2xl font-display font-bold text-[#1A365D]">AsoComms</h1>
            </div>

            <div className="space-y-1">
              <h2 className="text-2xl font-display font-bold text-[#1A365D]">Welcome back</h2>
              <p className="text-sm text-slate-500">Let’s get your devices sorted. Sign in below.</p>
            </div>

            {/* Error message */}
            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-600 font-medium">
                <span className="material-symbols-outlined text-base">error</span>
                <span>{error}</span>
              </div>
            )}

            <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
              {/* Email */}
              <div className="space-y-1.5">
                <label htmlFor="email" className="text-sm font-medium text-slate-700">
                  Email address
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">mail</span>
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#1A365D] focus:outline-none focus:ring-2 focus:ring-[#1A365D]/20 transition-shadow"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label htmlFor="password" className="text-sm font-medium text-slate-700">
                  Password
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">lock</span>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-11 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#1A365D] focus:outline-none focus:ring-2 focus:ring-[#1A365D]/20 transition-shadow"
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

              {/* Remember me + forgot */}
              <div className="flex items-center justify-between">
                <label htmlFor="remember" className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
                  <input
                    id="remember"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-[#1A365D] accent-[#1A365D] focus:ring-2 focus:ring-[#1A365D]/20"
                  />
                  Remember me
                </label>
                <Link
                  to="/forgot-password"
                  className="text-sm font-medium text-[#D97706] transition-colors hover:text-[#b85f00] hover:underline"
                >
                  Forgot password?
                </Link>
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
                    Signing in...
                  </>
                ) : (
                  'Let’s go'
                )}
              </button>
            </form>

            {/* Footer */}
            <p className="mt-6 text-center text-sm text-slate-500">
              {"Don't have an account? "}
              <Link to="/register" className="font-medium text-[#D97706] transition-colors hover:text-[#b85f00] hover:underline">
                Create one now
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Inline styles for custom font and animations */}
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
        /* Optional: smooth transition for card */
        .rounded-2xl {
          transition: box-shadow 0.3s ease;
        }
        .rounded-2xl:hover {
          box-shadow: 0 20px 60px -12px rgba(26,54,93,0.15);
        }
      `}</style>
    </div>
  );
};

export default Login;