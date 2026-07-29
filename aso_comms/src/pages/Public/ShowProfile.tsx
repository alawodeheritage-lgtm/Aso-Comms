import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

interface ProfileData {
  id: string;
  name: string;
  initials: string;
  role: string;
  location: string;
  tier: string;
  arr: string;
  tickets: number;
  tenure: string;
  csat: number;
  email: string;
  phone: string;
  linkedin: string;
  address: string;
  avatar?: string;
}

const ShowProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  // Mock profile data - In real app, this would come from an API
  useEffect(() => {
    // Simulate API call
    const timer = setTimeout(() => {
      setProfile({
        id: id || 'CUST-001',
        name: 'Olabisi Johnson',
        initials: 'OJ',
        role: 'Enterprise Customer',
        location: 'Lagos, Nigeria',
        tier: 'Executive Tier',
        arr: '₦2.4M',
        tickets: 3,
        tenure: '2yr',
        csat: 4.9,
        email: 'o.johnson@j-logistics.com',
        phone: '+234 803 123 4567',
        linkedin: 'linkedin.com/in/o-johnson',
        address: '12 Victoria Island, Lagos State, Nigeria',
      });
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [id]);

  const handleCopyEmail = (email: string) => {
    navigator.clipboard.writeText(email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 p-12 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
          <p className="mt-3 text-xs font-bold text-slate-500">Loading profile details...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 p-8 sm:p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-3xl">error</span>
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-1">Profile Not Found</h3>
          <p className="text-xs text-slate-500 mb-6 max-w-xs mx-auto">
            The profile you are looking for does not exist or may have been removed.
          </p>
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 bg-blue-600 text-white font-bold py-2.5 px-5 rounded-xl hover:bg-blue-700 transition-all text-xs"
          >
            Go back home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* Back Button */}
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-blue-600 transition-colors"
      >
        <span className="material-symbols-outlined text-base">arrow_back</span>
        Back to Home
      </Link>

      {/* Profile Card */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-700 to-blue-600 px-6 py-8 text-white">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-white/20 flex items-center justify-center text-white text-2xl sm:text-3xl font-extrabold border-4 border-white/30 shadow-md shrink-0">
              {profile.initials}
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                  {profile.name}
                </h1>
                <span className="inline-flex items-center gap-1 bg-white/20 backdrop-blur-md px-3 py-0.5 rounded-full text-[11px] font-bold">
                  <span className="material-symbols-outlined text-sm">verified</span>
                  {profile.tier}
                </span>
              </div>
              <p className="text-blue-100 text-xs sm:text-sm font-medium">
                {profile.role} • {profile.location}
              </p>
              <div className="flex flex-wrap gap-2 pt-2">
                <button className="bg-white text-blue-600 px-4 py-2 rounded-xl text-xs font-bold hover:bg-blue-50 transition-colors active:scale-95 flex items-center gap-1.5 shadow-xs">
                  <span className="material-symbols-outlined text-base">chat</span>
                  Message
                </button>
                <button className="bg-white/15 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-white/25 transition-colors active:scale-95 flex items-center gap-1.5 border border-white/20">
                  <span className="material-symbols-outlined text-base">share</span>
                  Share Profile
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 sm:p-6 border-b border-slate-200/80 bg-slate-50/50">
          <div className="text-center md:text-left">
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
              ARR
            </p>
            <p className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">{profile.arr}</p>
          </div>
          <div className="text-center md:text-left">
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
              Tickets
            </p>
            <p className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">
              {profile.tickets}
            </p>
          </div>
          <div className="text-center md:text-left">
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
              Tenure
            </p>
            <p className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">
              {profile.tenure}
            </p>
          </div>
          <div className="text-center md:text-left">
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
              CSAT
            </p>
            <div className="flex items-center justify-center md:justify-start gap-1 mt-0.5">
              <p className="text-xl sm:text-2xl font-black text-slate-900">{profile.csat}</p>
              <span
                className="material-symbols-outlined text-amber-400 text-xl"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                star
              </span>
            </div>
          </div>
        </div>

        {/* Contact Details */}
        <div className="p-4 sm:p-6 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <span className="material-symbols-outlined text-blue-600 text-base">
              contact_page
            </span>
            Contact Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="bg-slate-50/80 rounded-xl p-3.5 border border-slate-200/60">
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                Email
              </p>
              <div className="flex items-center justify-between gap-2 mt-1">
                <span className="text-xs font-bold text-slate-800 truncate">{profile.email}</span>
                <button
                  onClick={() => handleCopyEmail(profile.email)}
                  title="Copy email"
                  className="text-blue-600 hover:bg-blue-50 p-1.5 rounded-lg transition-colors shrink-0 flex items-center justify-center"
                >
                  <span className="material-symbols-outlined text-base">
                    {copied ? 'check' : 'content_copy'}
                  </span>
                </button>
              </div>
            </div>

            <div className="bg-slate-50/80 rounded-xl p-3.5 border border-slate-200/60">
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                Phone
              </p>
              <div className="flex items-center justify-between gap-2 mt-1">
                <span className="text-xs font-bold text-slate-800">{profile.phone}</span>
                <a
                  href={`tel:${profile.phone}`}
                  className="text-blue-600 hover:bg-blue-50 p-1.5 rounded-lg transition-colors shrink-0 flex items-center justify-center"
                >
                  <span className="material-symbols-outlined text-base">call</span>
                </a>
              </div>
            </div>

            <div className="bg-slate-50/80 rounded-xl p-3.5 border border-slate-200/60">
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                LinkedIn
              </p>
              <a
                className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1 truncate mt-1"
                href={`https://${profile.linkedin}`}
                target="_blank"
                rel="noreferrer"
              >
                <span className="truncate">{profile.linkedin}</span>
                <span className="material-symbols-outlined text-sm shrink-0">open_in_new</span>
              </a>
            </div>

            <div className="bg-slate-50/80 rounded-xl p-3.5 border border-slate-200/60">
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                Address
              </p>
              <p className="text-xs font-bold text-slate-800 truncate mt-1">{profile.address}</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-4 sm:p-6 border-t border-slate-200/80 bg-slate-50/50">
          <div className="flex flex-col sm:flex-row gap-3">
            <button className="flex-1 flex items-center justify-center gap-1.5 bg-blue-600 text-white py-2.5 rounded-xl font-bold text-xs hover:bg-blue-700 transition-all active:scale-95 shadow-xs">
              <span className="material-symbols-outlined text-base">chat</span>
              Send Message
            </button>
            <button className="flex-1 flex items-center justify-center gap-1.5 bg-white border border-slate-200/80 text-slate-700 py-2.5 rounded-xl font-bold text-xs hover:bg-slate-50 transition-colors active:scale-95 shadow-xs">
              <span className="material-symbols-outlined text-base">schedule</span>
              Schedule Meeting
            </button>
            <Link
              to="/complaints"
              className="flex-1 flex items-center justify-center gap-1.5 bg-blue-50 text-blue-700 py-2.5 rounded-xl font-bold text-xs hover:bg-blue-100 transition-colors active:scale-95 border border-blue-100"
            >
              <span className="material-symbols-outlined text-base">assignment</span>
              View Tickets
            </Link>
          </div>
        </div>

        {/* Related Info */}
        <div className="p-4 sm:p-6 border-t border-slate-200/80">
          <div className="flex items-center gap-1.5 mb-3">
            <span className="material-symbols-outlined text-blue-600 text-base">info</span>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
              ACCOUNT HEALTH
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-full">
              <span
                className="material-symbols-outlined text-emerald-600 text-sm"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                check_circle
              </span>
              <span className="text-xs font-bold text-emerald-700">Low Risk</span>
            </div>
            <div className="flex items-center gap-1.5 bg-blue-50 border border-blue-100 px-3 py-1 rounded-full">
              <span className="material-symbols-outlined text-blue-600 text-sm">verified</span>
              <span className="text-xs font-bold text-blue-700">Verified Account</span>
            </div>
            <div className="flex items-center gap-1.5 bg-slate-100 border border-slate-200 px-3 py-1 rounded-full">
              <span className="material-symbols-outlined text-slate-500 text-sm">
                calendar_month
              </span>
              <span className="text-xs font-bold text-slate-700">2 Years Active</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Link
          to="/complaints"
          className="bg-white p-4 rounded-2xl border border-slate-200/80 text-center hover:border-blue-300 hover:shadow-md transition-all group"
        >
          <span className="material-symbols-outlined text-blue-600 text-2xl group-hover:scale-110 transition-transform">
            search
          </span>
          <p className="text-xs font-bold text-slate-800 mt-1">Track Complaint</p>
        </Link>
        <Link
          to="/complaints/new"
          className="bg-white p-4 rounded-2xl border border-slate-200/80 text-center hover:border-blue-300 hover:shadow-md transition-all group"
        >
          <span className="material-symbols-outlined text-blue-600 text-2xl group-hover:scale-110 transition-transform">
            add_circle
          </span>
          <p className="text-xs font-bold text-slate-800 mt-1">Lodge Complaint</p>
        </Link>
        <Link
          to="/dashboard"
          className="bg-white p-4 rounded-2xl border border-slate-200/80 text-center hover:border-blue-300 hover:shadow-md transition-all group"
        >
          <span className="material-symbols-outlined text-blue-600 text-2xl group-hover:scale-110 transition-transform">
            dashboard
          </span>
          <p className="text-xs font-bold text-slate-800 mt-1">Dashboard</p>
        </Link>
        <button
          onClick={handlePrint}
          className="bg-white p-4 rounded-2xl border border-slate-200/80 text-center hover:border-blue-300 hover:shadow-md transition-all group"
        >
          <span className="material-symbols-outlined text-blue-600 text-2xl group-hover:scale-110 transition-transform">
            print
          </span>
          <p className="text-xs font-bold text-slate-800 mt-1">Print Profile</p>
        </button>
      </div>

      {/* Global CSS for Material Icons */}
      <style>{`
        .material-symbols-outlined {
          font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
          vertical-align: middle;
        }
      `}</style>
    </div>
  );
};

export default ShowProfile;