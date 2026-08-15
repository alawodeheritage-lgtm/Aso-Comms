// src/pages/Customer/Settings.tsx
import React, { useState } from 'react';

const Settings: React.FC = () => {
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    darkMode: false,
    language: 'English',
    twoFactorAuth: false,
    sessionTimeout: '30'
  });

  const handleToggle = (key: keyof typeof settings) => {
    if (typeof settings[key] === 'boolean') {
      setSettings({ ...settings, [key]: !settings[key] });
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F6F1] px-4 py-6 md:px-6 md:py-8">
      <div className="max-w-3xl mx-auto space-y-6">

        {/* Header */}
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold text-[#1A365D] tracking-tight">Settings</h1>
          <p className="text-sm text-slate-500 mt-0.5">Manage your account preferences and notifications.</p>
        </div>

        {/* Notifications */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2.5">
            <span className="material-symbols-outlined text-[#1A365D] text-xl">notifications</span>
            <h2 className="text-sm font-bold text-[#1A365D]">Notifications</h2>
          </div>
          <div className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-800">Email Notifications</p>
                <p className="text-xs text-slate-500">Receive updates via email</p>
              </div>
              <button
                onClick={() => handleToggle('emailNotifications')}
                className={`w-12 h-6 rounded-full transition-colors ${settings.emailNotifications ? 'bg-[#1A365D]' : 'bg-slate-300'
                  } relative`}
              >
                <div className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${settings.emailNotifications ? 'translate-x-6' : 'translate-x-1'
                  } shadow-sm`} />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-800">Push Notifications</p>
                <p className="text-xs text-slate-500">Receive real-time alerts</p>
              </div>
              <button
                onClick={() => handleToggle('pushNotifications')}
                className={`w-12 h-6 rounded-full transition-colors ${settings.pushNotifications ? 'bg-[#1A365D]' : 'bg-slate-300'
                  } relative`}
              >
                <div className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${settings.pushNotifications ? 'translate-x-6' : 'translate-x-1'
                  } shadow-sm`} />
              </button>
            </div>
          </div>
        </div>

        {/* Preferences */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2.5">
            <span className="material-symbols-outlined text-[#1A365D] text-xl">settings</span>
            <h2 className="text-sm font-bold text-[#1A365D]">Preferences</h2>
          </div>
          <div className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-800">Dark Mode</p>
                <p className="text-xs text-slate-500">Switch to dark theme</p>
              </div>
              <button
                onClick={() => handleToggle('darkMode')}
                className={`w-12 h-6 rounded-full transition-colors ${settings.darkMode ? 'bg-[#1A365D]' : 'bg-slate-300'
                  } relative`}
              >
                <div className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${settings.darkMode ? 'translate-x-6' : 'translate-x-1'
                  } shadow-sm`} />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-800">Language</p>
                <p className="text-xs text-slate-500">Select your preferred language</p>
              </div>
              <select
                value={settings.language}
                onChange={(e) => setSettings({ ...settings, language: e.target.value })}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:ring-2 focus:ring-[#1A365D]/20 focus:border-[#1A365D] outline-none transition-all"
              >
                <option>English</option>
                <option>French</option>
                <option>Spanish</option>
              </select>
            </div>
          </div>
        </div>

        {/* Security */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2.5">
            <span className="material-symbols-outlined text-[#1A365D] text-xl">security</span>
            <h2 className="text-sm font-bold text-[#1A365D]">Security</h2>
          </div>
          <div className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-800">Two-Factor Authentication</p>
                <p className="text-xs text-slate-500">Add an extra layer of security</p>
              </div>
              <button
                onClick={() => handleToggle('twoFactorAuth')}
                className={`w-12 h-6 rounded-full transition-colors ${settings.twoFactorAuth ? 'bg-[#1A365D]' : 'bg-slate-300'
                  } relative`}
              >
                <div className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${settings.twoFactorAuth ? 'translate-x-6' : 'translate-x-1'
                  } shadow-sm`} />
              </button>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800 mb-1.5">Session Timeout</p>
              <select
                value={settings.sessionTimeout}
                onChange={(e) => setSettings({ ...settings, sessionTimeout: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:ring-2 focus:ring-[#1A365D]/20 focus:border-[#1A365D] outline-none transition-all"
              >
                <option value="15">15 minutes</option>
                <option value="30">30 minutes</option>
                <option value="60">1 hour</option>
                <option value="120">2 hours</option>
              </select>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-white rounded-2xl border border-red-200/40 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-red-100 bg-red-50/30 flex items-center gap-2.5">
            <span className="material-symbols-outlined text-red-600 text-xl">warning</span>
            <h2 className="text-sm font-bold text-red-600">Danger Zone</h2>
          </div>
          <div className="p-5">
            <button
              className="w-full py-2.5 border border-red-300 text-red-600 rounded-xl font-semibold hover:bg-red-50 transition-colors active:scale-95 text-sm"
              onClick={() => {
                if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
                  // Delete account logic (not implemented)
                  alert('Account deletion is not implemented in this demo.');
                }
              }}
            >
              Delete Account
            </button>
            <p className="text-xs text-slate-500 mt-2 text-center">This action is irreversible. All your data will be permanently removed.</p>
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
        `}</style>
      </div>
    </div>
  );
};

export default Settings;