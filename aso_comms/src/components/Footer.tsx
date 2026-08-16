// src/components/Footer.tsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Footer: React.FC = () => {
  const location = useLocation();

  // ✅ Only show footer on the landing page
  if (location.pathname !== '/') return null;

  return (
    <footer className="w-full bg-[#F8F6F1] border-t border-slate-200/80 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          {/* Brand */}
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#1A365D] text-3xl">precision_manufacturing</span>
            <span className="text-2xl font-display font-bold text-[#1A365D] tracking-tight">AsoComms</span>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-wrap justify-center gap-6">
            <Link
              to="/track"
              className="text-sm font-medium text-slate-600 hover:text-[#1A365D] transition-colors"
            >
              Track Status
            </Link>
            <Link
              to="/contact"
              className="text-sm font-medium text-slate-600 hover:text-[#1A365D] transition-colors"
            >
              Contact
            </Link>
            <Link
              to="/privacy"
              className="text-sm font-medium text-slate-600 hover:text-[#1A365D] transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              to="/terms"
              className="text-sm font-medium text-slate-600 hover:text-[#1A365D] transition-colors"
            >
              Terms of Service
            </Link>
          </nav>
        </div>

        <div className="h-px w-full bg-slate-200/60 my-6"></div>

        <p className="text-center text-sm text-slate-500">
          © {new Date().getFullYear()} AsoComms Professional Management. All rights reserved.
        </p>
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
    </footer>
  );
};

export default Footer;