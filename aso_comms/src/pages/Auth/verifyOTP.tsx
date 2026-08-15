// src/pages/Auth/VerifyOTP.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';

const VerifyOTP: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(60);

  const params = new URLSearchParams(location.search);
  const email = params.get('email') || '';
  const purpose = params.get('purpose') || 'reset';

  useEffect(() => {
    if (!email) {
      navigate('/login');
    }
  }, [email, navigate]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    setIsLoading(true);
    setError('');

    console.log('========================================');
    console.log('🔑 Verifying OTP');
    console.log('📧 Email:', email);
    console.log('🔑 Entered OTP:', otp);
    console.log('📧 Purpose:', purpose);
    console.log('========================================');

    try {
      const response = await fetch('http://localhost:5000/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, otp, purpose })
      });

      const data = await response.json();
      console.log('📧 Verification response:', data);

      if (data.success) {
        if (data.redirect) {
          navigate(data.redirect);
        } else if (purpose === 'reset') {
          navigate('/reset-password');
        } else {
          navigate('/dashboard');
        }
      } else {
        setError(data.error || 'Invalid OTP. Please try again.');
        setIsLoading(false);
      }
    } catch (err: any) {
      console.error('Verification error:', err);
      setError('Network error. Please try again.');
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0 || isResending) return;

    setIsResending(true);
    setError('');

    try {
      const response = await fetch('http://localhost:5000/resend-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, purpose })
      });

      const data = await response.json();

      if (data.success) {
        setCountdown(60);
        setError('New OTP sent!');
      } else {
        setError(data.error || 'Failed to resend OTP.');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setIsResending(false);
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
            <span className="material-symbols-outlined text-7xl text-amber-400 mb-4">mark_email_read</span>
            <h2 className="font-display text-3xl font-bold tracking-tight">Check your email</h2>
            <p className="text-blue-100 mt-2 max-w-xs">
              We've sent a 6‑digit code to <span className="font-semibold text-white">{email}</span>
            </p>
            <div className="mt-6 flex gap-4 text-xs font-medium text-blue-200">
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">check_circle</span>
                Secure verification
              </span>
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">support_agent</span>
                Need help? We're here
              </span>
            </div>
          </div>
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-20 h-1 bg-amber-400 rounded-full"></div>
        </div>

        {/* RIGHT – OTP Form */}
        <div className="flex-1 p-8 md:p-12">
          <div className="max-w-sm mx-auto">
            {/* Mobile logo */}
            <div className="flex flex-col items-center gap-2 text-center md:hidden mb-6">
              <span className="material-symbols-outlined text-4xl text-[#1A365D]">precision_manufacturing</span>
              <h1 className="text-2xl font-display font-bold text-[#1A365D]">AsoComms</h1>
            </div>

            <div className="space-y-1">
              <h2 className="text-2xl font-display font-bold text-[#1A365D]">Check your email</h2>
              <p className="text-sm text-slate-500">
                We've sent a 6‑digit code to <span className="font-semibold text-[#1A365D]">{email}</span>
              </p>
            </div>

            {error && (
              <div className={`mt-4 p-3 rounded-xl flex items-center gap-2 text-xs font-medium ${error.includes('sent') ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                } border ${error.includes('sent') ? 'border-green-200' : 'border-red-200'}`}>
                <span className="material-symbols-outlined text-base">
                  {error.includes('sent') ? 'check_circle' : 'error'}
                </span>
                <span>{error}</span>
              </div>
            )}

            <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
              <div className="space-y-1.5">
                <label htmlFor="otp" className="sr-only">
                  6-digit verification code
                </label>
                <input
                  id="otp"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="000000"
                  className="w-full rounded-xl border border-slate-200 bg-white py-4 text-center font-display text-3xl font-bold tracking-widest text-[#1A365D] placeholder:text-slate-300 focus:border-[#1A365D] focus:outline-none focus:ring-2 focus:ring-[#1A365D]/20 transition-shadow"
                  disabled={isLoading}
                />
                <p className="text-center text-xs text-slate-400">
                  Enter the 6-digit code from your email
                </p>
              </div>

              <button
                type="submit"
                disabled={isLoading || otp.length !== 6}
                className="h-11 w-full rounded-xl bg-[#1A365D] text-white font-bold hover:bg-[#2D4A6B] active:scale-95 transition-all shadow-sm shadow-[#1A365D]/20 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 hover:shadow-md hover:-translate-y-0.5"
              >
                {isLoading ? (
                  <>
                    <span className="material-symbols-outlined text-base animate-spin">progress_activity</span>
                    Verifying...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-base">verified</span>
                    Verify OTP
                  </>
                )}
              </button>
            </form>

            {/* Resend */}
            <div className="mt-6 text-center text-sm text-slate-500">
              {"Didn't receive the code? "}
              {countdown > 0 ? (
                <span className="font-medium text-slate-400">
                  Resend in {countdown}s
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={isResending}
                  className="font-semibold text-[#D97706] transition-colors hover:text-[#b85f00] hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isResending ? 'Sending...' : 'Resend code'}
                </button>
              )}
            </div>

            <div className="mt-4 text-center">
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

export default VerifyOTP;