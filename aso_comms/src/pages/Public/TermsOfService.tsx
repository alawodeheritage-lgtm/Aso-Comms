// src/pages/Public/TermsOfService.tsx
import React from 'react';
import { Link } from 'react-router-dom';

const TermsOfService: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6 md:p-8">
        <div className="flex items-center gap-3 mb-6">
          <span className="material-symbols-outlined text-3xl text-blue-600">description</span>
          <h1 className="text-2xl font-bold text-slate-900">Terms of Service</h1>
        </div>

        <div className="space-y-4 text-sm text-slate-600 leading-relaxed">
          <p><strong>Last updated:</strong> August 10, 2026</p>

          <p>
            Welcome to AsoComms. By using our repair tracking services, you agree to these Terms of Service.
            Please read them carefully.
          </p>

          <h2 className="text-base font-bold text-slate-800 mt-6">1. Acceptance of Terms</h2>
          <p>
            By accessing or using the AsoComms platform, you agree to be bound by these terms.
            If you do not agree, please do not use our services.
          </p>

          <h2 className="text-base font-bold text-slate-800 mt-6">2. Description of Service</h2>
          <p>
            AsoComms provides repair tracking and management services for individuals and businesses.
            We help you log repairs, track status, and communicate with our support team.
          </p>

          <h2 className="text-base font-bold text-slate-800 mt-6">3. User Responsibilities</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>Provide accurate information when logging repairs</li>
            <li>Keep your ticket ID secure and not share it publicly</li>
            <li>Use the service only for lawful purposes</li>
            <li>Respect the privacy of others</li>
          </ul>

          <h2 className="text-base font-bold text-slate-800 mt-6">4. Intellectual Property</h2>
          <p>
            All content on the AsoComms platform, including text, graphics, logos, and software,
            is the property of AsoComms and is protected by copyright and other intellectual property laws.
          </p>

          <h2 className="text-base font-bold text-slate-800 mt-6">5. Limitation of Liability</h2>
          <p>
            AsoComms is not liable for any damages arising from the use of our services, including
            but not limited to loss of data, profits, or business interruption. We provide the service
            "as is" and "as available".
          </p>

          <h2 className="text-base font-bold text-slate-800 mt-6">6. Termination</h2>
          <p>
            We may suspend or terminate your access to the service at any time for any reason,
            including violation of these terms.
          </p>

          <h2 className="text-base font-bold text-slate-800 mt-6">7. Governing Law</h2>
          <p>
            These terms are governed by the laws of Nigeria. Any disputes will be resolved in the
            courts of Lagos, Nigeria.
          </p>

          <h2 className="text-base font-bold text-slate-800 mt-6">8. Changes to Terms</h2>
          <p>
            We may update these terms from time to time. Continued use of the service constitutes
            acceptance of the updated terms.
          </p>

          <h2 className="text-base font-bold text-slate-800 mt-6">9. Contact Us</h2>
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/60">
            <p className="font-medium text-slate-800">AsoComms Support</p>
            <p className="flex items-center gap-2 mt-1">
              <span className="material-symbols-outlined text-sm text-slate-400">mail</span>
              <a href="mailto:support@asocomms.com" className="text-blue-600 hover:underline">support@asocomms.com</a>
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
          <Link to="/" className="text-blue-600 hover:underline text-sm font-medium">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;