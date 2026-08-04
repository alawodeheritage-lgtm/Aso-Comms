// src/pages/Customer/Profile.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Toast from '../../components/Toast';
import { api } from '../../api/axios';

interface CustomerProfileData {
  name: string;
  email: string;
  phone: string;
  location: string;
  memberSince: string;
  status: 'Premium' | 'Standard' | 'Guest';
  stats: {
    complaints: number;
    resolved: number;
    inProgress: number;
    totalSpent: number;
  };
  recentActivity: {
    id: string;
    action: string;
    date: string;
    icon: string;
    color: string;
  }[];
}

const CustomerProfile: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' | 'warning' } | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingChanges, setPendingChanges] = useState<any>(null);

  const [profile, setProfile] = useState<CustomerProfileData>({
    name: '',
    email: '',
    phone: '',
    location: '',
    memberSince: '',
    status: 'Standard',
    stats: {
      complaints: 0,
      resolved: 0,
      inProgress: 0,
      totalSpent: 0,
    },
    recentActivity: [],
  });

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
  });

  // Format currency
  const formatCurrency = (amount: number): string => {
    return `₦${amount.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    })}`;
  };

  // Fetch customer profile data using USER ID
  const fetchCustomerProfile = async () => {
    try {
      setLoading(true);
      console.log('🔄 Fetching customer profile...');

      // Get current user info
      const userResponse = await api.get('/api/current-user');
      const currentUser = userResponse.data.user;
      console.log('👤 Current user:', currentUser);

      // Fetch user's repairs and complaints using USER ID
      const [repairsRes, complaintsRes] = await Promise.all([
        api.get('/repairs?filter=user'), // Backend will filter by user ID
        api.get('/complaints?filter=user') // Backend will filter by user ID
      ]);

      const repairs = repairsRes.data.repairs || [];
      const complaints = complaintsRes.data.complaints || [];

      // Calculate stats
      const totalComplaints = complaints.length;
      const resolvedComplaints = complaints.filter((c: any) => c.status === 'Resolved').length;
      const inProgressComplaints = complaints.filter((c: any) => c.status !== 'Resolved' && c.status !== 'Closed').length;

      // Calculate total spent from repairs
      const totalSpent = repairs.reduce((sum: number, r: any) =>
        sum + (r.financials?.amountPaid || 0), 0
      );

      // Determine customer status
      let status: 'Premium' | 'Standard' | 'Guest' = 'Guest';
      if (totalSpent > 100000) {
        status = 'Premium';
      } else if (totalSpent > 0) {
        status = 'Standard';
      }

      // Build profile data
      const profileData: CustomerProfileData = {
        name: currentUser?.username || 'Customer',
        email: currentUser?.email || 'customer@asocomms.com',
        phone: currentUser?.phoneNumber || 'Not provided',
        location: currentUser?.location || 'Lagos, Nigeria',
        memberSince: new Date(currentUser?.createdAt || Date.now()).toLocaleDateString('en-US', {
          month: 'long',
          year: 'numeric'
        }),
        status: status,
        stats: {
          complaints: totalComplaints,
          resolved: resolvedComplaints,
          inProgress: inProgressComplaints,
          totalSpent: totalSpent,
        },
        recentActivity: [
          {
            id: '1',
            action: `${totalComplaints} complaints logged`,
            date: 'This month',
            icon: 'chat',
            color: 'bg-blue-50 text-blue-600',
          },
          {
            id: '2',
            action: `${resolvedComplaints} complaints resolved`,
            date: 'This month',
            icon: 'check_circle',
            color: 'bg-emerald-50 text-emerald-600',
          },
          {
            id: '3',
            action: `Total spent: ${formatCurrency(totalSpent)}`,
            date: 'Lifetime',
            icon: 'payments',
            color: 'bg-green-50 text-green-600',
          },
        ],
      };

      setProfile(profileData);
      setFormData({
        name: profileData.name,
        email: profileData.email,
        phone: profileData.phone,
        location: profileData.location,
      });

      console.log('✅ Customer profile loaded:', profileData);
    } catch (err: any) {
      console.error('❌ Failed to fetch customer profile:', err);
      setToast({
        message: err.response?.data?.error || 'Failed to load profile data.',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchCustomerProfile();
    }
  }, [user]);

  // Check if email or phone has changed
  const hasEmailOrPhoneChanged = () => {
    return formData.email !== profile.email || formData.phone !== profile.phone;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    // If email or phone changed, show confirmation dialog
    if (hasEmailOrPhoneChanged()) {
      setPendingChanges(formData);
      setShowConfirmDialog(true);
      return;
    }

    // Otherwise, save directly
    await saveProfileChanges(formData);
  };

  const saveProfileChanges = async (data: any) => {
    try {
      const response = await api.patch('/api/update-profile', {
        username: data.name,
        email: data.email,
        phoneNumber: data.phone,
        location: data.location,
      });

      console.log('✅ Profile updated:', response.data);

      // Update the user context
      if (updateUser) {
        updateUser({
          ...user,
          username: data.name,
          email: data.email,
          phoneNumber: data.phone,
        });
      }

      setProfile((prev) => ({
        ...prev,
        name: data.name,
        email: data.email,
        phone: data.phone,
        location: data.location,
      }));
      setIsEditing(false);
      setShowConfirmDialog(false);
      setToast({
        message: 'Profile updated successfully! Your records have been preserved.',
        type: 'success'
      });
      await fetchCustomerProfile();
    } catch (err: any) {
      console.error('❌ Failed to update profile:', err);
      setToast({
        message: err.response?.data?.error || 'Failed to update profile.',
        type: 'error'
      });
    }
  };

  const handleCancel = () => {
    setFormData({
      name: profile.name,
      email: profile.email,
      phone: profile.phone,
      location: profile.location,
    });
    setIsEditing(false);
    setShowConfirmDialog(false);
  };

  const initials = profile.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
          <p className="mt-3 text-sm font-medium text-slate-500">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8 space-y-4 sm:space-y-6">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Confirmation Dialog for Email/Phone Change */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <span className="material-symbols-outlined text-amber-500 text-3xl">warning</span>
              <h3 className="text-lg font-bold text-slate-900">Important: Contact Info Change</h3>
            </div>
            <div className="space-y-3 mb-6">
              <p className="text-sm text-slate-600">
                Changing your email or phone number will:
              </p>
              <ul className="text-sm text-slate-600 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500">✓</span>
                  <span>Your repair history will remain intact</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500">✓</span>
                  <span>Your complaint history will be preserved</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-500">⚠</span>
                  <span>Staff will see your new contact details going forward</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-500">⚠</span>
                  <span>Previous records will keep old contact info for audit purposes</span>
                </li>
              </ul>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmDialog(false)}
                className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-xl font-bold hover:bg-slate-50 transition-colors text-sm"
              >
                Cancel
              </button>
              <button
                onClick={() => saveProfileChanges(pendingChanges)}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors text-sm"
              >
                Proceed Anyway
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="material-symbols-outlined text-blue-600 text-xl sm:text-2xl">
              person
            </span>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
              My Profile
            </h1>
          </div>
          <p className="text-xs sm:text-sm font-medium text-slate-500">
            Manage your personal information and account settings
          </p>
        </div>
        <div className="flex gap-2 sm:gap-2.5 shrink-0">
          {isEditing ? (
            <>
              <button
                type="button"
                onClick={handleCancel}
                className="px-3 sm:px-4 py-1.5 sm:py-2 border border-slate-300 text-slate-700 rounded-xl font-bold hover:bg-slate-50 transition-colors active:scale-95 text-xs shadow-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all active:scale-95 text-xs shadow-xs cursor-pointer"
              >
                Save Changes
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-600 text-white rounded-xl font-bold flex items-center gap-1.5 hover:bg-blue-700 transition-all active:scale-95 text-xs shadow-xs cursor-pointer"
            >
              <span className="material-symbols-outlined text-base">edit</span>
              Edit Profile
            </button>
          )}
        </div>
      </div>

      {/* Rest of the profile UI remains the same... */}
      {/* Main Profile Card Container */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 overflow-hidden">
        {/* Cover Header */}
        <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-blue-800 px-4 sm:px-6 py-6 sm:py-8 text-white">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
            <div className="relative shrink-0 self-center sm:self-auto">
              <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full bg-white/20 flex items-center justify-center text-white text-xl sm:text-2xl md:text-3xl font-black border-4 border-white/30 shadow-md">
                {initials}
              </div>
              <div
                className="absolute bottom-0 right-0 bg-emerald-500 w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 border-white flex items-center justify-center"
                title="Active"
              >
                <span className="material-symbols-outlined text-white text-[8px] sm:text-[11px] font-bold">
                  check
                </span>
              </div>
            </div>
            <div className="space-y-1 text-center sm:text-left">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 sm:gap-2.5">
                <h2 className="text-lg sm:text-xl md:text-3xl font-extrabold tracking-tight">
                  {profile.name}
                </h2>
                <span className={`px-2 sm:px-3 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold ${profile.status === 'Premium'
                  ? 'bg-yellow-400 text-yellow-900'
                  : profile.status === 'Standard'
                    ? 'bg-blue-400 text-blue-900'
                    : 'bg-slate-400 text-slate-900'
                  }`}>
                  {profile.status}
                </span>
              </div>
              <p className="text-blue-100 text-xs sm:text-sm font-medium">
                {profile.location}
              </p>
              <div className="flex flex-wrap justify-center sm:justify-start gap-3 sm:gap-4 mt-2 text-blue-200/80 text-[10px] sm:text-[11px] font-semibold">
                <p className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">calendar_month</span>
                  Member since {profile.memberSince}
                </p>
                <p className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">phone</span>
                  {profile.phone}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Customer Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4 p-3 sm:p-6 border-b border-slate-200/80 bg-slate-50/50">
          <div className="text-center">
            <p className="text-lg sm:text-xl md:text-2xl font-black text-blue-600">
              {profile.stats.complaints}
            </p>
            <p className="text-[8px] sm:text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mt-0.5">
              Total Complaints
            </p>
          </div>
          <div className="text-center md:border-l border-slate-200/80">
            <p className="text-lg sm:text-xl md:text-2xl font-black text-emerald-600">
              {profile.stats.resolved}
            </p>
            <p className="text-[8px] sm:text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mt-0.5">
              Resolved
            </p>
          </div>
          <div className="text-center border-t md:border-t-0 md:border-l border-slate-200/80 pt-2 md:pt-0">
            <p className="text-lg sm:text-xl md:text-2xl font-black text-amber-600">
              {profile.stats.inProgress}
            </p>
            <p className="text-[8px] sm:text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mt-0.5">
              In Progress
            </p>
          </div>
          <div className="text-center border-t md:border-t-0 md:border-l border-slate-200/80 pt-2 md:pt-0">
            <p className="text-lg sm:text-xl md:text-2xl font-black text-emerald-600">
              {formatCurrency(profile.stats.totalSpent)}
            </p>
            <p className="text-[8px] sm:text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mt-0.5">
              Total Spent
            </p>
          </div>
        </div>

        {/* Form / Details Section */}
        <div className="p-3 sm:p-6">
          <h3 className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 sm:mb-4 flex items-center gap-1.5">
            <span className="material-symbols-outlined text-blue-600 text-base">badge</span>
            Personal Information
          </h3>

          {isEditing ? (
            /* Edit Mode */
            <form onSubmit={handleSave} className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-[10px] sm:text-xs font-bold text-slate-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 sm:px-3.5 py-2 sm:py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition-all text-xs sm:text-sm font-semibold text-slate-800"
                />
              </div>

              <div>
                <label className="block text-[10px] sm:text-xs font-bold text-slate-700 mb-1">
                  Email Address
                  {formData.email !== profile.email && (
                    <span className="ml-2 text-[8px] text-amber-500 font-bold">
                      ⚠ Will be updated
                    </span>
                  )}
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={`w-full px-3 sm:px-3.5 py-2 sm:py-2.5 bg-slate-50 border rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition-all text-xs sm:text-sm font-semibold text-slate-800 ${formData.email !== profile.email
                      ? 'border-amber-400 bg-amber-50/50'
                      : 'border-slate-300'
                    }`}
                />
                {formData.email !== profile.email && (
                  <p className="text-[8px] text-amber-500 mt-1 font-medium">
                    Changing your email will update your login credentials
                  </p>
                )}
              </div>

              <div>
                <label className="block text-[10px] sm:text-xs font-bold text-slate-700 mb-1">
                  Phone Number
                  {formData.phone !== profile.phone && (
                    <span className="ml-2 text-[8px] text-amber-500 font-bold">
                      ⚠ Will be updated
                    </span>
                  )}
                </label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className={`w-full px-3 sm:px-3.5 py-2 sm:py-2.5 bg-slate-50 border rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition-all text-xs sm:text-sm font-semibold text-slate-800 ${formData.phone !== profile.phone
                      ? 'border-amber-400 bg-amber-50/50'
                      : 'border-slate-300'
                    }`}
                />
                {formData.phone !== profile.phone && (
                  <p className="text-[8px] text-amber-500 mt-1 font-medium">
                    Your repair and complaint records will retain old phone for reference
                  </p>
                )}
              </div>

              <div>
                <label className="block text-[10px] sm:text-xs font-bold text-slate-700 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  required
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-3 sm:px-3.5 py-2 sm:py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition-all text-xs sm:text-sm font-semibold text-slate-800"
                />
              </div>
            </form>
          ) : (
            /* View Mode */
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-3">
              <div className="bg-slate-50/80 rounded-xl p-2.5 sm:p-3.5 border border-slate-200/60">
                <p className="text-[8px] sm:text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                  Full Name
                </p>
                <p className="text-xs sm:text-sm font-bold text-slate-800 mt-0.5">
                  {profile.name}
                </p>
              </div>

              <div className="bg-slate-50/80 rounded-xl p-2.5 sm:p-3.5 border border-slate-200/60">
                <p className="text-[8px] sm:text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                  Email
                </p>
                <p className="text-xs sm:text-sm font-bold text-slate-800 mt-0.5 truncate">
                  {profile.email}
                </p>
              </div>

              <div className="bg-slate-50/80 rounded-xl p-2.5 sm:p-3.5 border border-slate-200/60">
                <p className="text-[8px] sm:text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                  Phone
                </p>
                <p className="text-xs sm:text-sm font-bold text-slate-800 mt-0.5">
                  {profile.phone}
                </p>
              </div>

              <div className="bg-slate-50/80 rounded-xl p-2.5 sm:p-3.5 border border-slate-200/60">
                <p className="text-[8px] sm:text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                  Location
                </p>
                <p className="text-xs sm:text-sm font-bold text-slate-800 mt-0.5">
                  {profile.location}
                </p>
              </div>

              <div className="bg-slate-50/80 rounded-xl p-2.5 sm:p-3.5 border border-slate-200/60">
                <p className="text-[8px] sm:text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                  Member Since
                </p>
                <p className="text-xs sm:text-sm font-bold text-slate-800 mt-0.5">
                  {profile.memberSince}
                </p>
              </div>

              <div className="bg-slate-50/80 rounded-xl p-2.5 sm:p-3.5 border border-slate-200/60">
                <p className="text-[8px] sm:text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                  Account Status
                </p>
                <p className="text-xs sm:text-sm font-bold text-slate-800 mt-0.5">
                  {profile.status}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="p-3 sm:p-6 border-t border-slate-200/80">
          <h3 className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 sm:mb-4 flex items-center gap-1.5">
            <span className="material-symbols-outlined text-blue-600 text-base">history</span>
            Recent Activity
          </h3>
          <div className="space-y-2 sm:space-y-3">
            {profile.recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-start gap-2 sm:gap-3">
                <div
                  className={`w-6 h-6 sm:w-8 sm:h-8 rounded-xl ${activity.color} flex items-center justify-center shrink-0 shadow-xs mt-0.5`}
                >
                  <span className="material-symbols-outlined text-sm sm:text-base">{activity.icon}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] sm:text-xs md:text-sm font-semibold text-slate-800">
                    {activity.action}
                  </p>
                  <p className="text-[9px] sm:text-[11px] font-bold text-slate-400">{activity.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="p-3 sm:p-6 border-t border-slate-200/80 bg-slate-50/50">
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-2.5">
            <Link
              to="/complaints/new"
              className="flex-1 flex items-center justify-center gap-1.5 bg-blue-600 text-white py-2 sm:py-2.5 rounded-xl font-bold hover:bg-blue-700 transition-all active:scale-95 text-[10px] sm:text-xs shadow-xs"
            >
              <span className="material-symbols-outlined text-base">add_circle</span>
              Lodge Complaint
            </Link>

            <Link
              to="/complaints"
              className="flex-1 flex items-center justify-center gap-1.5 bg-blue-50 text-blue-700 border border-blue-100 py-2 sm:py-2.5 rounded-xl font-bold hover:bg-blue-100 transition-colors active:scale-95 text-[10px] sm:text-xs"
            >
              <span className="material-symbols-outlined text-base">chat</span>
              My Complaints
            </Link>

            <Link
              to="/track"
              className="flex-1 flex items-center justify-center gap-1.5 bg-white border border-slate-200/80 text-slate-700 py-2 sm:py-2.5 rounded-xl font-bold hover:bg-slate-50 transition-colors active:scale-95 text-[10px] sm:text-xs shadow-xs"
            >
              <span className="material-symbols-outlined text-base">search</span>
              Track Status
            </Link>
          </div>
        </div>
      </div>

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

export default CustomerProfile;