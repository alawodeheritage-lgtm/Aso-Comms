import React, { useState } from 'react';
import { Link } from 'react-router-dom';

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
    teamMembers: number;
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
  const [isEditing, setIsEditing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [profile, setProfile] = useState<AdminProfileData>({
    name: 'Akinwunmi Sode',
    email: 'a.sode@asocomms.com',
    phone: '+234 802 345 6789',
    role: 'Account Manager',
    department: 'Customer Success',
    employeeId: 'EMP-2024-001',
    joinDate: 'March 2023',
    stats: {
      complaintsResolved: 147,
      activeRepairs: 23,
      teamMembers: 8,
      slaCompliance: '94.2%',
    },
    recentActivity: [
      {
        id: '1',
        action: 'Resolved complaint #CMP-88219',
        date: '2 hours ago',
        icon: 'check_circle',
        color: 'bg-emerald-50 text-emerald-600',
      },
      {
        id: '2',
        action: 'Assigned repair #REC-2045 to Tech_Support',
        date: '4 hours ago',
        icon: 'assignment',
        color: 'bg-blue-50 text-blue-600',
      },
      {
        id: '3',
        action: 'Updated SLA policy for enterprise clients',
        date: '1 day ago',
        icon: 'update',
        color: 'bg-amber-50 text-amber-600',
      },
    ],
    permissions: [
      'Manage Complaints',
      'Assign Repairs',
      'Approve Expenses',
      'View Analytics',
      'Manage Team',
    ],
  });

  const [formData, setFormData] = useState({
    name: profile.name,
    email: profile.email,
    phone: profile.phone,
    role: profile.role,
    department: profile.department,
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setProfile((prev) => ({
      ...prev,
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      role: formData.role,
      department: formData.department,
    }));
    setIsEditing(false);
    triggerToast('Admin profile updated successfully!');
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

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const initials = profile.name
    .split(' ')
    .map((n) => n[0])
    .join('');

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 text-xs font-bold animate-in">
          <span className="material-symbols-outlined text-emerald-400 text-base">
            check_circle
          </span>
          {toastMessage}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="material-symbols-outlined text-blue-600 text-2xl">
              admin_panel_settings
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Admin Profile
            </h1>
          </div>
          <p className="text-xs sm:text-sm font-medium text-slate-500">
            Manage administrative credentials, team permissions, and operational settings
          </p>
        </div>
        <div className="flex gap-2.5 shrink-0">
          {isEditing ? (
            <>
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl font-bold hover:bg-slate-50 transition-colors active:scale-95 text-xs shadow-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="px-4 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all active:scale-95 text-xs shadow-xs cursor-pointer"
              >
                Save Changes
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-xl font-bold flex items-center gap-1.5 hover:bg-blue-700 transition-all active:scale-95 text-xs shadow-xs cursor-pointer"
            >
              <span className="material-symbols-outlined text-base">edit</span>
              Edit Profile
            </button>
          )}
        </div>
      </div>

      {/* Main Profile Card Container */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 overflow-hidden">
        {/* Cover Header */}
        <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-blue-800 px-6 py-8 text-white">
          <div className="flex flex-col sm:flex-row sm:items-center gap-6">
            <div className="relative shrink-0 self-start sm:self-auto">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-white/20 flex items-center justify-center text-white text-2xl sm:text-3xl font-black border-4 border-white/30 shadow-md">
                {initials}
              </div>
              <div
                className="absolute bottom-0 right-0 bg-blue-500 w-5 h-5 rounded-full border-2 border-white flex items-center justify-center"
                title="Verified Admin"
              >
                <span className="material-symbols-outlined text-white text-[11px] font-bold">
                  verified
                </span>
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-xl sm:text-3xl font-extrabold tracking-tight">
                  {profile.name}
                </h2>
                <span className="bg-white/20 backdrop-blur-md text-white px-3 py-0.5 rounded-full text-[11px] font-bold flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">shield</span>
                  {profile.role}
                </span>
              </div>
              <p className="text-blue-100 text-xs sm:text-sm font-medium">
                {profile.department}
              </p>
              <div className="flex flex-wrap gap-4 mt-2 text-blue-200/80 text-[11px] font-semibold">
                <p className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">badge</span>
                  {profile.employeeId}
                </p>
                <p className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">calendar_month</span>
                  Joined {profile.joinDate}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Admin Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4 p-4 sm:p-6 border-b border-slate-200/80 bg-slate-50/50">
          <div className="text-center">
            <p className="text-xl sm:text-2xl font-black text-blue-600">
              {profile.stats.complaintsResolved}
            </p>
            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mt-0.5">
              Resolved
            </p>
          </div>
          <div className="text-center md:border-l border-slate-200/80">
            <p className="text-xl sm:text-2xl font-black text-blue-600">
              {profile.stats.activeRepairs}
            </p>
            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mt-0.5">
              Active Repairs
            </p>
          </div>
          <div className="text-center border-t md:border-t-0 md:border-l border-slate-200/80 pt-2 md:pt-0">
            <p className="text-xl sm:text-2xl font-black text-blue-600">
              {profile.stats.teamMembers}
            </p>
            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mt-0.5">
              Team Members
            </p>
          </div>
          <div className="text-center border-t md:border-t-0 md:border-l border-slate-200/80 pt-2 md:pt-0">
            <p className="text-xl sm:text-2xl font-black text-emerald-600">
              {profile.stats.slaCompliance}
            </p>
            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mt-0.5">
              SLA Compliance
            </p>
          </div>
        </div>

        {/* Form / Details Section */}
        <div className="p-4 sm:p-6">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-1.5">
            <span className="material-symbols-outlined text-blue-600 text-base">badge</span>
            Professional Information
          </h3>

          {isEditing ? (
            /* Edit Mode */
            <form onSubmit={handleSave} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition-all text-xs sm:text-sm font-semibold text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition-all text-xs sm:text-sm font-semibold text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition-all text-xs sm:text-sm font-semibold text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Role Title
                </label>
                <input
                  type="text"
                  required
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition-all text-xs sm:text-sm font-semibold text-slate-800"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Department
                </label>
                <input
                  type="text"
                  required
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition-all text-xs sm:text-sm font-semibold text-slate-800"
                />
              </div>
            </form>
          ) : (
            /* View Mode */
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              <div className="bg-slate-50/80 rounded-xl p-3.5 border border-slate-200/60">
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                  Full Name
                </p>
                <p className="text-xs sm:text-sm font-bold text-slate-800 mt-0.5">
                  {profile.name}
                </p>
              </div>

              <div className="bg-slate-50/80 rounded-xl p-3.5 border border-slate-200/60">
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                  Email
                </p>
                <p className="text-xs sm:text-sm font-bold text-slate-800 mt-0.5 truncate">
                  {profile.email}
                </p>
              </div>

              <div className="bg-slate-50/80 rounded-xl p-3.5 border border-slate-200/60">
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                  Phone
                </p>
                <p className="text-xs sm:text-sm font-bold text-slate-800 mt-0.5">
                  {profile.phone}
                </p>
              </div>

              <div className="bg-slate-50/80 rounded-xl p-3.5 border border-slate-200/60">
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                  Role
                </p>
                <p className="text-xs sm:text-sm font-bold text-slate-800 mt-0.5">
                  {profile.role}
                </p>
              </div>

              <div className="bg-slate-50/80 rounded-xl p-3.5 border border-slate-200/60">
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                  Department
                </p>
                <p className="text-xs sm:text-sm font-bold text-slate-800 mt-0.5">
                  {profile.department}
                </p>
              </div>

              <div className="bg-slate-50/80 rounded-xl p-3.5 border border-slate-200/60">
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                  Employee ID
                </p>
                <p className="text-xs sm:text-sm font-bold text-slate-800 mt-0.5">
                  {profile.employeeId}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Permissions */}
        <div className="p-4 sm:p-6 border-t border-slate-200/80 bg-slate-50/30">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
            <span className="material-symbols-outlined text-blue-600 text-base">lock</span>
            Assigned System Permissions
          </h3>
          <div className="flex flex-wrap gap-2">
            {profile.permissions.map((permission, index) => (
              <span
                key={index}
                className="bg-blue-50 text-blue-700 border border-blue-100 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-xs">check</span>
                {permission}
              </span>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="p-4 sm:p-6 border-t border-slate-200/80">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-1.5">
            <span className="material-symbols-outlined text-blue-600 text-base">history</span>
            Recent System Activity
          </h3>
          <div className="space-y-3">
            {profile.recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3">
                <div
                  className={`w-8 h-8 rounded-xl ${activity.color} flex items-center justify-center shrink-0 shadow-xs mt-0.5`}
                >
                  <span className="material-symbols-outlined text-base">{activity.icon}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-semibold text-slate-800">
                    {activity.action}
                  </p>
                  <p className="text-[11px] font-bold text-slate-400">{activity.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Admin Actions */}
        <div className="p-4 sm:p-6 border-t border-slate-200/80 bg-slate-50/50">
          <div className="flex flex-col sm:flex-row gap-2.5">
            <Link
              to="/admin/repairs"
              className="flex-1 flex items-center justify-center gap-1.5 bg-blue-600 text-white py-2.5 rounded-xl font-bold hover:bg-blue-700 transition-all active:scale-95 text-xs shadow-xs"
            >
              <span className="material-symbols-outlined text-base">build</span>
              Manage Repairs
            </Link>

            <Link
              to="/admin/complaints"
              className="flex-1 flex items-center justify-center gap-1.5 bg-blue-50 text-blue-700 border border-blue-100 py-2.5 rounded-xl font-bold hover:bg-blue-100 transition-colors active:scale-95 text-xs"
            >
              <span className="material-symbols-outlined text-base">chat</span>
              Resolve Complaints
            </Link>

            <Link
              to="/admin/financials"
              className="flex-1 flex items-center justify-center gap-1.5 bg-white border border-slate-200/80 text-slate-700 py-2.5 rounded-xl font-bold hover:bg-slate-50 transition-colors active:scale-95 text-xs shadow-xs"
            >
              <span className="material-symbols-outlined text-base">trending_up</span>
              View Financials
            </Link>
          </div>
        </div>
      </div>

      <style>{`
        .material-symbols-outlined {
          font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
          vertical-align: middle;
        }
      `}</style>
    </div>
  );
};

export default AdminProfile;