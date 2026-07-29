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
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#191b23]">Settings</h1>
        <p className="text-sm text-[#434655]">Manage your account preferences</p>
      </div>

      <div className="space-y-4">
        {/* Notifications */}
        <div className="bg-white rounded-xl shadow-sm border border-[#e1e2ed]/50 overflow-hidden">
          <div className="p-4 border-b border-[#e1e2ed]/50">
            <h3 className="text-sm font-bold text-[#191b23] flex items-center gap-2">
              <span className="material-symbols-outlined text-[#004ac6] text-base">notifications</span>
              Notifications
            </h3>
          </div>
          <div className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-[#191b23]">Email Notifications</p>
                <p className="text-xs text-[#434655]">Receive updates via email</p>
              </div>
              <button
                onClick={() => handleToggle('emailNotifications')}
                className={`w-12 h-6 rounded-full transition-colors ${settings.emailNotifications ? 'bg-[#004ac6]' : 'bg-[#c3c6d7]'
                  }`}
              >
                <div className={`w-4 h-4 rounded-full bg-white transition-transform ${settings.emailNotifications ? 'translate-x-6' : 'translate-x-1'
                  }`}></div>
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-[#191b23]">Push Notifications</p>
                <p className="text-xs text-[#434655]">Receive real-time alerts</p>
              </div>
              <button
                onClick={() => handleToggle('pushNotifications')}
                className={`w-12 h-6 rounded-full transition-colors ${settings.pushNotifications ? 'bg-[#004ac6]' : 'bg-[#c3c6d7]'
                  }`}
              >
                <div className={`w-4 h-4 rounded-full bg-white transition-transform ${settings.pushNotifications ? 'translate-x-6' : 'translate-x-1'
                  }`}></div>
              </button>
            </div>
          </div>
        </div>

        {/* Preferences */}
        <div className="bg-white rounded-xl shadow-sm border border-[#e1e2ed]/50 overflow-hidden">
          <div className="p-4 border-b border-[#e1e2ed]/50">
            <h3 className="text-sm font-bold text-[#191b23] flex items-center gap-2">
              <span className="material-symbols-outlined text-[#004ac6] text-base">settings</span>
              Preferences
            </h3>
          </div>
          <div className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-[#191b23]">Dark Mode</p>
                <p className="text-xs text-[#434655]">Switch to dark theme</p>
              </div>
              <button
                onClick={() => handleToggle('darkMode')}
                className={`w-12 h-6 rounded-full transition-colors ${settings.darkMode ? 'bg-[#004ac6]' : 'bg-[#c3c6d7]'
                  }`}
              >
                <div className={`w-4 h-4 rounded-full bg-white transition-transform ${settings.darkMode ? 'translate-x-6' : 'translate-x-1'
                  }`}></div>
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-[#191b23]">Language</p>
                <p className="text-xs text-[#434655]">Select your preferred language</p>
              </div>
              <select className="px-3 py-1.5 bg-[#faf8ff] border border-[#c3c6d7] rounded-lg text-sm">
                <option>English</option>
                <option>French</option>
                <option>Spanish</option>
              </select>
            </div>
          </div>
        </div>

        {/* Security */}
        <div className="bg-white rounded-xl shadow-sm border border-[#e1e2ed]/50 overflow-hidden">
          <div className="p-4 border-b border-[#e1e2ed]/50">
            <h3 className="text-sm font-bold text-[#191b23] flex items-center gap-2">
              <span className="material-symbols-outlined text-[#004ac6] text-base">security</span>
              Security
            </h3>
          </div>
          <div className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-[#191b23]">Two-Factor Authentication</p>
                <p className="text-xs text-[#434655]">Add an extra layer of security</p>
              </div>
              <button
                onClick={() => handleToggle('twoFactorAuth')}
                className={`w-12 h-6 rounded-full transition-colors ${settings.twoFactorAuth ? 'bg-[#004ac6]' : 'bg-[#c3c6d7]'
                  }`}
              >
                <div className={`w-4 h-4 rounded-full bg-white transition-transform ${settings.twoFactorAuth ? 'translate-x-6' : 'translate-x-1'
                  }`}></div>
              </button>
            </div>
            <div>
              <p className="text-sm font-semibold text-[#191b23] mb-1">Session Timeout</p>
              <select className="w-full px-3 py-2 bg-[#faf8ff] border border-[#c3c6d7] rounded-lg text-sm">
                <option value="15">15 minutes</option>
                <option value="30">30 minutes</option>
                <option value="60">1 hour</option>
                <option value="120">2 hours</option>
              </select>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-white rounded-xl shadow-sm border border-[#ba1a1a]/20 overflow-hidden">
          <div className="p-4 border-b border-[#ba1a1a]/20 bg-[#ffdad6]/5">
            <h3 className="text-sm font-bold text-[#ba1a1a] flex items-center gap-2">
              <span className="material-symbols-outlined text-base">warning</span>
              Danger Zone
            </h3>
          </div>
          <div className="p-4">
            <button className="w-full py-2.5 border border-[#ba1a1a] text-[#ba1a1a] rounded-lg font-semibold hover:bg-[#ffdad6]/10 transition-colors active:scale-95 text-sm">
              Delete Account
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .material-symbols-outlined {
          font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
          display: inline-block;
          line-height: 1;
        }
      `}</style>
    </div>
  );
};

export default Settings;