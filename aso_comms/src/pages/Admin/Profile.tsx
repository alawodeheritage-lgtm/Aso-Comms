// src/pages/Admin/Profile.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Toast from '../../components/Toast';
import { api } from '../../api/axios';

interface AdminProfileData {
  name: string;
  email: string;
  phone: string;
  role: string;
  department: string;
  employeeId: string;
  joinDate: string;
  avatar?: string;
  stats: {
    complaintsResolved: number;
    activeRepairs: number;
    totalRevenue: number;
    slaCompliance: string;
  };
  recentActivity: {
    id: string;
    action: string;
    date: string;
    icon: string;
    color: string;
  }[];
  permissions: string[];
}

const AdminProfile: React.FC = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' | 'warning' } | null>(null);

  const [profile, setProfile] = useState<AdminProfileData>({
    name: '',
    email: '',
    phone: '',
    role: '',
    department: '',
    employeeId: '',
    joinDate: '',
    stats: {
      complaintsResolved: 0,
      activeRepairs: 0,
      totalRevenue: 0,
      slaCompliance: '0%',
    },
    recentActivity: [],
    permissions: [],
  });

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: '',
    department: '',
  });

  const formatCurrency = (amount: number): string => {
    return `₦${amount.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    })}`;
  };

  const fetchAdminProfile = async () => {
    try {
      setLoading(true);
      // console.log('🔄 Fetching admin profile...');

      const userResponse = await api.get('/api/current-user');
      const currentUser = userResponse.data.user;
      // console.log('👤 Current user:', currentUser);

      const [repairsRes, complaintsRes, expensesRes] = await Promise.all([
        api.get('/repairs'),
        api.get('/complaints'),
        api.get('/expenses')
      ]);

      const repairs = repairsRes.data.repairs || [];
      const complaints = complaintsRes.data.complaints || [];
      const expenses = expensesRes.data.expenses || [];

      const resolvedComplaints = complaints.filter((c: any) => c.status === 'Resolved').length;
      const activeRepairs = repairs.filter((r: any) => r.status !== 'Collected' && r.status !== 'Resolved').length;

      const totalRevenue = expenses
        .filter((e: any) => e.status === 'approved')
        .reduce((sum: number, e: any) => sum + (e.amount || 0), 0);

      const profileData: AdminProfileData = {
        name: currentUser?.username || 'Administrator',
        email: currentUser?.email || 'admin@asocomms.com',
        phone: currentUser?.phoneNumber || 'Not provided',
        role: currentUser?.role === 'ceo' ? 'CEO' : currentUser?.role === 'manager' ? 'Manager' : 'Admin',
        department: 'Administration',
        employeeId: `EMP-${Date.now().toString().slice(-6)}`,
        joinDate: new Date(currentUser?.createdAt || Date.now()).toLocaleDateString('en-US', {
          month: 'long',
          year: 'numeric'
        }),
        stats: {
          complaintsResolved: resolvedComplaints,
          activeRepairs: activeRepairs,
          totalRevenue: totalRevenue,
          slaCompliance: '94.2%',
        },
        recentActivity: [
          {
            id: '1',
            action: `Resolved ${resolvedComplaints} complaints this month`,
            date: 'Today',
            icon: 'check_circle',
            color: 'bg-emerald-50 text-emerald-600',
          },
          {
            id: '2',
            action: `${activeRepairs} active repairs in progress`,
            date: 'Today',
            icon: 'build',
            color: 'bg-blue-50 text-blue-600',
          },
          {
            id: '3',
            action: `Total revenue: ${formatCurrency(totalRevenue)}`,
            date: 'This month',
            icon: 'payments',
            color: 'bg-green-50 text-green-600',
          },
        ],
        permissions: [
          'Manage Complaints',
          'Assign Repairs',
          'Approve Expenses',
          'View Analytics',
          'Manage Team',
        ],
      };

      setProfile(profileData);
      setFormData({
        name: profileData.name,
        email: profileData.email,
        phone: profileData.phone,
        role: profileData.role,
        department: profileData.department,
      });

      // console.log('✅ Profile data loaded:', profileData);
    } catch (err: any) {
      // console.error('❌ Failed to fetch admin profile:', err);
      setToast({
        message: err.response?.data?.error || 'Failed to load profile data.',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminProfile();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await api.patch('/api/update-profile', {
        username: formData.name,
        email: formData.email,
        phoneNumber: formData.phone,
      });

      // console.log('✅ Profile updated:', response.data);

      setProfile((prev) => ({
        ...prev,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        role: formData.role,
        department: formData.department,
      }));
      setIsEditing(false);
      setToast({ message: 'Profile updated successfully!', type: 'success' });
      await fetchAdminProfile();
    } catch (err: any) {
      // console.error('❌ Failed to update profile:', err);
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
      role: profile.role,
      department: profile.department,
    });
    setIsEditing(false);
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
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[#1A365D] border-t-transparent"></div>
          <p className="mt-3 text-sm font-medium text-slate-500">Loading profile...</p>
        </div>
      </div>
    );
  }

  // ============== HUMANIZED UI ==============
  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8 space-y-4 sm:space-y-6">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="material-symbols-outlined text-blue-600 text-xl sm:text-2xl">admin_panel_settings</span>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-display font-bold text-[#1A365D] tracking-tight">Admin Profile</h1>
          </div>
          <p className="text-xs sm:text-sm font-medium text-slate-500">Manage administrative credentials, team permissions, and operational settings.</p>
        </div>
        <div className="flex gap-2 sm:gap-2.5 shrink-0">
          {isEditing ? (
            <>
              <button type="button" onClick={handleCancel} className="px-3 sm:px-4 py-1.5 sm:py-2 border border-slate-300 text-slate-700 rounded-xl font-bold hover:bg-slate-50 transition-colors active:scale-95 text-xs shadow-xs">Cancel</button>
              <button type="button" onClick={handleSave} className="px-3 sm:px-4 py-1.5 sm:py-2 bg-[#1A365D] text-white rounded-xl font-bold hover:bg-[#2D4A6B] transition-all active:scale-95 text-xs shadow-xs">Save Changes</button>
            </>
          ) : (
            <button type="button" onClick={() => setIsEditing(true)} className="px-3 sm:px-4 py-1.5 sm:py-2 bg-[#1A365D] text-white rounded-xl font-bold flex items-center gap-1.5 hover:bg-[#2D4A6B] transition-all active:scale-95 text-xs shadow-xs">
              <span className="material-symbols-outlined text-base">edit</span> Edit Profile
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 overflow-hidden">
        {/* Cover */}
        <div className="bg-gradient-to-r from-[#1A365D] to-[#2D4A6B] px-4 sm:px-6 py-6 sm:py-8 text-white">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
            <div className="relative shrink-0 self-center sm:self-auto">
              <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full bg-white/20 flex items-center justify-center text-white text-xl sm:text-2xl md:text-3xl font-black border-4 border-white/30 shadow-md">
                {initials}
              </div>
              <div className="absolute bottom-0 right-0 bg-blue-500 w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 border-white flex items-center justify-center" title="Verified Admin">
                <span className="material-symbols-outlined text-white text-[8px] sm:text-[11px] font-bold">verified</span>
              </div>
            </div>
            <div className="space-y-1 text-center sm:text-left">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 sm:gap-2.5">
                <h2 className="text-lg sm:text-xl md:text-3xl font-display font-extrabold tracking-tight">{profile.name}</h2>
                <span className="bg-white/20 backdrop-blur-md text-white px-2 sm:px-3 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">shield</span>
                  {profile.role}
                </span>
              </div>
              <p className="text-blue-100 text-xs sm:text-sm font-medium">{profile.department}</p>
              <div className="flex flex-wrap justify-center sm:justify-start gap-3 sm:gap-4 mt-2 text-blue-200/80 text-[10px] sm:text-[11px] font-semibold">
                <p className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">badge</span>{profile.employeeId}</p>
                <p className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">calendar_month</span>Joined {profile.joinDate}</p>
                <p className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">phone</span>{profile.phone}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4 p-3 sm:p-6 border-b border-slate-200/80 bg-slate-50/50">
          <div className="text-center"><p className="text-lg sm:text-xl md:text-2xl font-black text-[#1A365D]">{profile.stats.complaintsResolved}</p><p className="text-[8px] sm:text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mt-0.5">Resolved</p></div>
          <div className="text-center md:border-l border-slate-200/80"><p className="text-lg sm:text-xl md:text-2xl font-black text-[#1A365D]">{profile.stats.activeRepairs}</p><p className="text-[8px] sm:text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mt-0.5">Active Repairs</p></div>
          <div className="text-center border-t md:border-t-0 md:border-l border-slate-200/80 pt-2 md:pt-0"><p className="text-lg sm:text-xl md:text-2xl font-black text-emerald-600">{formatCurrency(profile.stats.totalRevenue)}</p><p className="text-[8px] sm:text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mt-0.5">Total Revenue</p></div>
          <div className="text-center border-t md:border-t-0 md:border-l border-slate-200/80 pt-2 md:pt-0"><p className="text-lg sm:text-xl md:text-2xl font-black text-emerald-600">{profile.stats.slaCompliance}</p><p className="text-[8px] sm:text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mt-0.5">SLA Compliance</p></div>
        </div>

        {/* Personal Information */}
        <div className="p-3 sm:p-6">
          <h3 className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 sm:mb-4 flex items-center gap-1.5">
            <span className="material-symbols-outlined text-blue-600 text-base">badge</span> Professional Information
          </h3>

          {isEditing ? (
            /* Edit Mode */
            <form onSubmit={handleSave} className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-[10px] sm:text-xs font-bold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 sm:px-3.5 py-2 sm:py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition-all text-xs sm:text-sm font-semibold text-slate-800"
                />
              </div>
              <div>
                <label className="block text-[10px] sm:text-xs font-bold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 sm:px-3.5 py-2 sm:py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition-all text-xs sm:text-sm font-semibold text-slate-800"
                />
              </div>
              <div>
                <label className="block text-[10px] sm:text-xs font-bold text-slate-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 sm:px-3.5 py-2 sm:py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition-all text-xs sm:text-sm font-semibold text-slate-800"
                />
              </div>
              <div>
                <label className="block text-[10px] sm:text-xs font-bold text-slate-700 mb-1">Role Title</label>
                <input
                  type="text"
                  required
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-3 sm:px-3.5 py-2 sm:py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition-all text-xs sm:text-sm font-semibold text-slate-800"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-[10px] sm:text-xs font-bold text-slate-700 mb-1">Department</label>
                <input
                  type="text"
                  required
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full px-3 sm:px-3.5 py-2 sm:py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition-all text-xs sm:text-sm font-semibold text-slate-800"
                />
              </div>
            </form>
          ) : (
            /* View Mode */
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-3">
              <div className="bg-slate-50/80 rounded-xl p-2.5 sm:p-3.5 border border-slate-200/60">
                <p className="text-[8px] sm:text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Full Name</p>
                <p className="text-xs sm:text-sm font-bold text-slate-800 mt-0.5">{profile.name}</p>
              </div>
              <div className="bg-slate-50/80 rounded-xl p-2.5 sm:p-3.5 border border-slate-200/60">
                <p className="text-[8px] sm:text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Email</p>
                <p className="text-xs sm:text-sm font-bold text-slate-800 mt-0.5 truncate">{profile.email}</p>
              </div>
              <div className="bg-slate-50/80 rounded-xl p-2.5 sm:p-3.5 border border-slate-200/60">
                <p className="text-[8px] sm:text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Phone</p>
                <p className="text-xs sm:text-sm font-bold text-slate-800 mt-0.5">{profile.phone}</p>
              </div>
              <div className="bg-slate-50/80 rounded-xl p-2.5 sm:p-3.5 border border-slate-200/60">
                <p className="text-[8px] sm:text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Role</p>
                <p className="text-xs sm:text-sm font-bold text-slate-800 mt-0.5">{profile.role}</p>
              </div>
              <div className="bg-slate-50/80 rounded-xl p-2.5 sm:p-3.5 border border-slate-200/60">
                <p className="text-[8px] sm:text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Department</p>
                <p className="text-xs sm:text-sm font-bold text-slate-800 mt-0.5">{profile.department}</p>
              </div>
              <div className="bg-slate-50/80 rounded-xl p-2.5 sm:p-3.5 border border-slate-200/60">
                <p className="text-[8px] sm:text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Employee ID</p>
                <p className="text-xs sm:text-sm font-bold text-slate-800 mt-0.5">{profile.employeeId}</p>
              </div>
            </div>
          )}
        </div>

        {/* Permissions */}
        <div className="p-3 sm:p-6 border-t border-slate-200/80 bg-slate-50/30">
          <h3 className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 sm:mb-3 flex items-center gap-1.5">
            <span className="material-symbols-outlined text-blue-600 text-base">lock</span> Assigned System Permissions
          </h3>
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {profile.permissions.map((permission, index) => (
              <span
                key={index}
                className="bg-blue-50 text-blue-700 border border-blue-100 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[10px] sm:text-xs">check</span>
                {permission}
              </span>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="p-3 sm:p-6 border-t border-slate-200/80">
          <h3 className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 sm:mb-4 flex items-center gap-1.5">
            <span className="material-symbols-outlined text-blue-600 text-base">history</span> Recent System Activity
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
                  <p className="text-[11px] sm:text-xs md:text-sm font-semibold text-slate-800">{activity.action}</p>
                  <p className="text-[9px] sm:text-[11px] font-bold text-slate-400">{activity.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Admin Actions */}
        <div className="p-3 sm:p-6 border-t border-slate-200/80 bg-slate-50/50">
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-2.5">
            <Link
              to="/admin/repairs"
              className="flex-1 flex items-center justify-center gap-1.5 bg-[#1A365D] text-white py-2 sm:py-2.5 rounded-xl font-bold hover:bg-[#2D4A6B] transition-all active:scale-95 text-[10px] sm:text-xs shadow-xs"
            >
              <span className="material-symbols-outlined text-base">build</span>
              Manage Repairs
            </Link>

            <Link
              to="/admin/complaints"
              className="flex-1 flex items-center justify-center gap-1.5 bg-[#D97706]/10 text-[#D97706] border border-[#D97706]/30 py-2 sm:py-2.5 rounded-xl font-bold hover:bg-[#D97706]/20 transition-colors active:scale-95 text-[10px] sm:text-xs"
            >
              <span className="material-symbols-outlined text-base">chat</span>
              Resolve Complaints
            </Link>

            <Link
              to="/admin/financials"
              className="flex-1 flex items-center justify-center gap-1.5 bg-white border border-slate-200/80 text-slate-700 py-2 sm:py-2.5 rounded-xl font-bold hover:bg-slate-50 transition-colors active:scale-95 text-[10px] sm:text-xs shadow-xs"
            >
              <span className="material-symbols-outlined text-base">trending_up</span>
              View Financials
            </Link>
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

export default AdminProfile;