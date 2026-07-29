// src/components/Footer.tsx
import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-[#e1e2ed] mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#004ac6]">precision_manufacturing</span>
            <span className="text-xl font-bold text-[#191b23]">AsoComms</span>
          </div>

          <nav className="flex flex-wrap justify-center gap-6">
            <Link className="text-[#434655] hover:text-[#004ac6] transition-colors text-sm" to="/">
              Track Status
            </Link>
            <Link className="text-[#434655] hover:text-[#004ac6] transition-colors text-sm" to="/login">
              Sign In
            </Link>
            <Link className="text-[#434655] hover:text-[#004ac6] transition-colors text-sm" to="/register">
              Register
            </Link>
            <a className="text-[#434655] hover:text-[#004ac6] transition-colors text-sm" href="#">
              Privacy Policy
            </a>
            <a className="text-[#434655] hover:text-[#004ac6] transition-colors text-sm" href="#">
              Terms of Service
            </a>
          </nav>
        </div>

        <div className="h-px w-full bg-[#c3c6d7]/30 my-4"></div>

        <p className="text-center text-[#434655] text-sm opacity-80">
          © 2026 AsoComms Professional Management. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;