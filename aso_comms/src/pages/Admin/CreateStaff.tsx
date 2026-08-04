// src/pages/Admin/CreateStaff.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Toast from '../../components/Toast';
import { api } from '../../api/axios';

interface StaffFormData {
  username: string;
  email: string;
  password: string;
  role: 'manager' | 'ceo';
  phoneNumber: string;
  secretKey: string;
}

const CreateStaff: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' | 'warning' } | null>(null);

  const [formData, setFormData] = useState<StaffFormData>({
    username: '',
    email: '',
    password: '',
    role: 'manager',
    phoneNumber: '',
    secretKey: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate
    if (!formData.username || !formData.email || !formData.password || !formData.secretKey) {
      setToast({ message: 'Please fill in all required fields', type: 'error' });
      return;
    }

    if (formData.password.length < 8) {
      setToast({ message: 'Password must be at least 8 characters long', type: 'error' });
      return;
    }

    setLoading(true);

    try {
      console.log('📤 Creating staff with data:', {
        username: formData.username,
        email: formData.email,
        role: formData.role,
        phoneNumber: formData.phoneNumber
      });

      const response = await api.post('/admin/create-staff', formData);
      console.log('✅ Staff created:', response.data);

      setToast({
        message: `Staff account created successfully! OTP sent to ${formData.email}`,
        type: 'success'
      });

      // Reset form
      setFormData({
        username: '',
        email: '',
        password: '',
        role: 'manager',
        phoneNumber: '',
        secretKey: '',
      });

      // Redirect to verify OTP page for the new staff
      if (response.data.redirect) {
        setTimeout(() => {
          navigate(response.data.redirect);
        }, 2000);
      } else {
        setTimeout(() => {
          navigate('/admin');
        }, 2000);
      }

    } catch (err: any) {
      console.error('❌ Failed to create staff:', err);
      console.error('Error response:', err.response?.data);

      // Handle specific error messages
      const errorMessage = err.response?.data?.error ||
        err.response?.data?.message ||
        'Failed to create staff account. Please try again.';
      setToast({ message: errorMessage, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <span className="material-symbols-outlined text-blue-600 text-2xl">
            person_add
          </span>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
            Create Staff Account
          </h1>
        </div>
        <p className="text-sm text-slate-500">
          Create a new staff account (Manager or CEO). Only CEOs and Managers can create staff accounts.
        </p>
        <div className="mt-3 p-3 bg-blue-50 border border-blue-100 rounded-xl flex items-start gap-2">
          <span className="material-symbols-outlined text-blue-600 text-sm mt-0.5">info</span>
          <div>
            <span className="text-xs text-blue-700 font-medium">Staff members will receive an OTP via email to verify their account.</span>
            <p className="text-xs text-blue-600 mt-1">
              <span className="font-bold">Note:</span> The admin secret key is required for creating staff accounts.
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 p-4 sm:p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Full Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 text-lg">
                person
              </span>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="w-full h-11 pl-10 pr-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:bg-white outline-none transition-all text-sm text-slate-800 font-medium"
                placeholder="John Doe"
                required
                disabled={loading}
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Email Address <span className="text-red-500">*</span>
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
                className="w-full h-11 pl-10 pr-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:bg-white outline-none transition-all text-sm text-slate-800 font-medium"
                placeholder="staff@asocomms.com"
                required
                disabled={loading}
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
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                className="w-full h-11 pl-10 pr-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:bg-white outline-none transition-all text-sm text-slate-800 font-medium"
                placeholder="+234 800 000 0000"
                disabled={loading}
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 text-lg">
                lock
              </span>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full h-11 pl-10 pr-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:bg-white outline-none transition-all text-sm text-slate-800 font-medium"
                placeholder="•••••••• (min 8 chars)"
                required
                disabled={loading}
              />
            </div>
            <p className="text-[10px] text-slate-500 mt-1">Password must be at least 8 characters long</p>
          </div>

          {/* Role */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Role <span className="text-red-500">*</span>
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:bg-white outline-none transition-all text-sm text-slate-800 font-semibold"
              disabled={loading}
            >
              <option value="manager">Manager</option>
              <option value="ceo">CEO</option>
            </select>
          </div>

          {/* Secret Key */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Admin Secret Key <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 text-lg">
                key
              </span>
              <input
                type="password"
                name="secretKey"
                value={formData.secretKey}
                onChange={handleChange}
                className="w-full h-11 pl-10 pr-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:bg-white outline-none transition-all text-sm text-slate-800 font-medium"
                placeholder="Enter the admin secret key"
                required
                disabled={loading}
              />
            </div>
            <p className="text-[10px] text-slate-500 mt-1">
              The secret key is required to create staff accounts. Contact your administrator.
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 active:scale-95 transition-all shadow-sm shadow-blue-500/20 text-sm mt-2 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="material-symbols-outlined animate-spin text-base">progress_activity</span>
                Creating Staff...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-base">person_add</span>
                Create Staff Account
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateStaff;