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

  // src/pages/Auth/VerifyOTP.tsx - Add better debugging
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
      headers: {
        'Content-Type': 'application/json',
      },
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
        headers: {
          'Content-Type': 'application/json',
        },
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
    <div className="min-h-screen flex items-center justify-center py-12 px-4 bg-slate-50/50">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="material-symbols-outlined text-blue-600 text-3xl">verified</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900">
            {purpose === 'reset' ? 'Reset Password' : 'Verify Your Account'}
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            {purpose === 'reset' 
              ? `Enter the OTP sent to ${email} to reset your password`
              : `We've sent a 6-digit code to ${email}`
            }
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6">
          {error && (
            <div className={`mb-4 p-3 rounded-xl flex items-center gap-2 text-xs font-medium ${
              error.includes('sent') ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
            }`}>
              <span className="material-symbols-outlined text-base">
                {error.includes('sent') ? 'check_circle' : 'error'}
              </span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Enter OTP Code</label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition-all text-center text-lg font-bold tracking-widest"
                placeholder="000000"
                maxLength={6}
                required
                disabled={isLoading}
              />
              <p className="text-xs text-slate-400 mt-1 text-center">Enter the 6-digit code from your email</p>
            </div>

            <button
              type="submit"
              disabled={isLoading || otp.length !== 6}
              className="w-full h-12 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm shadow-blue-500/20"
            >
              {isLoading ? (
                <>
                  <span className="material-symbols-outlined animate-spin">progress_activity</span>
                  Verifying...
                </>
              ) : (
                'Verify OTP'
              )}
            </button>
          </form>

          <div className="mt-4 text-center">
            <p className="text-sm text-slate-500">
              Didn't receive the code?{' '}
              <button
                onClick={handleResend}
                disabled={countdown > 0 || isResending}
                className={`font-bold ${
                  countdown > 0 ? 'text-slate-400' : 'text-blue-600 hover:underline'
                }`}
              >
                {isResending ? 'Sending...' : countdown > 0 ? `Resend in ${countdown}s` : 'Resend'}
              </button>
            </p>
          </div>

          <div className="mt-4 text-center">
            <Link to="/login" className="text-sm text-blue-600 font-bold hover:underline">
              Back to Sign In
            </Link>
          </div>
        </div>
      </div>

      <style>{`
        .material-symbols-outlined {
          font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
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