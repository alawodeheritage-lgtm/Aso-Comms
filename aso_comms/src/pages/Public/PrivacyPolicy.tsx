// src/pages/Public/PrivacyPolicy.tsx
import React from 'react';
import { Link } from 'react-router-dom';

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#F8F6F1] px-4 py-6 md:px-6 md:py-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6 md:p-8">
          <div className="flex items-center gap-3 mb-6">
            <span className="material-symbols-outlined text-3xl text-[#1A365D]">privacy_tip</span>
            <h1 className="text-2xl md:text-3xl font-display font-bold text-[#1A365D] tracking-tight">Privacy Policy</h1>
          </div>

          <div className="space-y-4 text-sm text-slate-600 leading-relaxed">
            <p><strong>Last updated:</strong> August 15, 2026</p>

            <p>
              At AsoComms, we take your privacy seriously. This Privacy Policy explains how we collect,
              use, disclose, and safeguard your information when you use our repair tracking services.
            </p>

            <h2 className="text-base font-bold text-[#1A365D] mt-6">1. Information We Collect</h2>
            <p>
              We collect information you provide directly, such as your name, email address, phone number,
              device details, and repair history. We also collect information automatically through cookies
              and similar technologies to improve your experience.
            </p>

            <h2 className="text-base font-bold text-[#1A365D] mt-6">2. How We Use Your Information</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>To provide, maintain, and improve our repair tracking services</li>
              <li>To communicate with you about your repair status and updates</li>
              <li>To comply with legal obligations and resolve disputes</li>
              <li>To prevent fraud and enhance security</li>
            </ul>

            <h2 className="text-base font-bold text-[#1A365D] mt-6">3. Data Security</h2>
            <p>
              We implement appropriate technical and organizational measures to protect your personal data.
              However, no method of transmission over the internet is 100% secure, so we cannot guarantee absolute security.
            </p>

            <h2 className="text-base font-bold text-[#1A365D] mt-6">4. Your Rights</h2>
            <p>
              You have the right to access, correct, or delete your personal information at any time.
              To exercise these rights, please contact us using the information below.
            </p>

            <h2 className="text-base font-bold text-[#1A365D] mt-6">5. Data Retention</h2>
            <p>
              We retain your information only for as long as necessary to provide our services and comply with legal obligations.
            </p>

            <h2 className="text-base font-bold text-[#1A365D] mt-6">6. Third-Party Services</h2>
            <p>
              We may use third-party services (e.g., Cloudinary for image storage) that have their own privacy policies.
              We encourage you to review their policies.
            </p>

            <h2 className="text-base font-bold text-[#1A365D] mt-6">7. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page.
            </p>

            <h2 className="text-base font-bold text-[#1A365D] mt-6">8. Contact Us</h2>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/60">
              <p className="font-medium text-[#1A365D]">AsoComms Support</p>
              <p className="flex items-center gap-2 mt-1">
                <span className="material-symbols-outlined text-sm text-slate-400">mail</span>
                <a href="mailto:support@asocomms.com" className="text-[#D97706] hover:underline">support@asocomms.com</a>
              </p>
              <p className="flex items-center gap-2 mt-1">
                <span className="material-symbols-outlined text-sm text-slate-400">phone</span>
                <span>+234 800 000 0000</span>
              </p>
              <p className="flex items-center gap-2 mt-1">
                <span className="material-symbols-outlined text-sm text-slate-400">location_on</span>
                <span>Lagos, Nigeria</span>
              </p>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-slate-200/60 text-center">
            <Link to="/" className="text-[#D97706] hover:text-[#b85f00] hover:underline text-sm font-medium transition-colors">
              ← Back to Home
            </Link>
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

export default PrivacyPolicy;