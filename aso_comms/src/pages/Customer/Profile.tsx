import React, { useState } from 'react';
import { Link } from 'react-router-dom';

interface CustomerProfileData {
  name: string;
  email: string;
  phone: string;
  location: string;
  memberSince: string;
  status: 'Premium' | 'Standard';
  avatar?: string;
  stats: {
    complaints: number;
    resolved: number;
    inProgress: number;
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
  const [isEditing, setIsEditing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [profile, setProfile] = useState<CustomerProfileData>({
    name: 'Olabisi Johnson',
    email: 'o.johnson@j-logistics.com',
    phone: '+234 803 123 4567',
    location: 'Lagos, Nigeria',
    memberSince: 'January 2022',
    status: 'Premium',
    stats: {
      complaints: 14,
      resolved: 11,
      inProgress: 3,
    },
    recentActivity: [
      {
        id: '1',
        action: 'Complaint #REC-2045 status updated to In Progress',
        date: '2 hours ago',
        icon: 'update',
        color: 'bg-blue-50 text-blue-600',
      },
      {
        id: '2',
        action: 'Complaint #REC-2030 resolved successfully',
        date: '1 day ago',
        icon: 'check_circle',
        color: 'bg-emerald-50 text-emerald-600',
      },
      {
        id: '3',
        action: 'New complaint logged: Screen Replacement',
        date: '3 days ago',
        icon: 'chat',
        color: 'bg-amber-50 text-amber-600',
      },
    ],
  });

  const [formData, setFormData] = useState({
    name: profile.name,
    email: profile.email,
    phone: profile.phone,
    location: profile.location,
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setProfile((prev) => ({
      ...prev,
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      location: formData.location,
    }));
    setIsEditing(false);
    triggerToast('Profile updated successfully!');
  };

  const handleCancel = () => {
    setFormData({
      name: profile.name,
      email: profile.email,
      phone: profile.phone,
      location: profile.location,
    });
    setIsEditing(false);
  };

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handlePrint = () => {
    window.print();
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
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            My Profile
          </h1>
          <p className="text-xs sm:text-sm font-medium text-slate-500">
            View and manage your personal account details
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

      {/* Profile Card Container */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 overflow-hidden">
        {/* Cover / Header */}
        <div className="bg-gradient-to-r from-blue-700 to-blue-600 px-6 py-8 text-white">
          <div className="flex flex-col sm:flex-row sm:items-center gap-6">
            <div className="relative shrink-0 self-start sm:self-auto">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-white/20 flex items-center justify-center text-white text-2xl sm:text-3xl font-black border-4 border-white/30 shadow-md">
                {initials}
              </div>
              <div
                className="absolute bottom-0 right-0 bg-emerald-500 w-4.5 h-4.5 rounded-full border-2 border-white"
                title="Active Now"
              ></div>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-xl sm:text-3xl font-extrabold tracking-tight">
                  {profile.name}
                </h2>
                <span className="bg-white/20 backdrop-blur-md text-white px-3 py-0.5 rounded-full text-[11px] font-bold flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">verified</span>
                  {profile.status}
                </span>
              </div>
              <p className="text-blue-100 text-xs sm:text-sm font-medium">{profile.location}</p>
              <p className="text-blue-200/80 text-[11px] font-semibold">
                Member since {profile.memberSince}
              </p>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 p-4 sm:p-6 border-b border-slate-200/80 bg-slate-50/50">
          <div className="text-center">
            <p className="text-xl sm:text-2xl font-black text-blue-600">
              {profile.stats.complaints}
            </p>
            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mt-0.5">
              Complaints
            </p>
          </div>
          <div className="text-center border-x border-slate-200/80">
            <p className="text-xl sm:text-2xl font-black text-emerald-600">
              {profile.stats.resolved}
            </p>
            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mt-0.5">
              Resolved
            </p>
          </div>
          <div className="text-center">
            <p className="text-xl sm:text-2xl font-black text-blue-600">
              {profile.stats.inProgress}
            </p>
            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mt-0.5">
              In Progress
            </p>
          </div>
        </div>

        {/* Profile Details Form */}
        <div className="p-4 sm:p-6">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-1.5">
            <span className="material-symbols-outlined text-blue-600 text-base">
              contact_page
            </span>
            Personal Information
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
                  Location
                </label>
                <input
                  type="text"
                  required
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition-all text-xs sm:text-sm font-semibold text-slate-800"
                />
              </div>
            </form>
          ) : (
            /* View Mode */
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                  Email Address
                </p>
                <p className="text-xs sm:text-sm font-bold text-slate-800 mt-0.5 truncate">
                  {profile.email}
                </p>
              </div>

              <div className="bg-slate-50/80 rounded-xl p-3.5 border border-slate-200/60">
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                  Phone Number
                </p>
                <p className="text-xs sm:text-sm font-bold text-slate-800 mt-0.5">
                  {profile.phone}
                </p>
              </div>

              <div className="bg-slate-50/80 rounded-xl p-3.5 border border-slate-200/60">
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                  Location
                </p>
                <p className="text-xs sm:text-sm font-bold text-slate-800 mt-0.5">
                  {profile.location}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="p-4 sm:p-6 border-t border-slate-200/80 bg-slate-50/30">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-1.5">
            <span className="material-symbols-outlined text-blue-600 text-base">history</span>
            Recent Activity
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

        {/* Quick Actions */}
        <div className="p-4 sm:p-6 border-t border-slate-200/80 bg-slate-50/50">
          <div className="flex flex-col sm:flex-row gap-2.5">
            <Link
              to="/complaints/new"
              className="flex-1 flex items-center justify-center gap-1.5 bg-blue-600 text-white py-2.5 rounded-xl font-bold hover:bg-blue-700 transition-all active:scale-95 text-xs shadow-xs"
            >
              <span className="material-symbols-outlined text-base">add_circle</span>
              Lodge Complaint
            </Link>

            <Link
              to="/track"
              className="flex-1 flex items-center justify-center gap-1.5 bg-white border border-slate-200/80 text-slate-700 py-2.5 rounded-xl font-bold hover:bg-slate-50 transition-colors active:scale-95 text-xs shadow-xs"
            >
              <span className="material-symbols-outlined text-base">search</span>
              Track Status
            </Link>

            <button
              type="button"
              onClick={handlePrint}
              className="flex-1 flex items-center justify-center gap-1.5 bg-blue-50 text-blue-700 border border-blue-100 py-2.5 rounded-xl font-bold hover:bg-blue-100 transition-colors active:scale-95 text-xs"
            >
              <span className="material-symbols-outlined text-base">print</span>
              Print Profile
            </button>
          </div>
        </div>
      </div>

      {/* Global CSS Icons styling */}
      <style>{`
        .material-symbols-outlined {
          font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
          vertical-align: middle;
        }
      `}</style>
    </div>
  );
};

export default CustomerProfile;