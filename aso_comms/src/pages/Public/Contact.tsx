// src/pages/Public/Contact.tsx
import React, { useState } from 'react';

const Contact: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      alert('Message sent successfully! We\'ll get back to you soon.');
      setFormData({ name: '', email: '', subject: '', message: '' });
    }, 1500);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#191b23]">Contact Us</h1>
        <p className="text-sm text-[#434655]">We'd love to hear from you</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Contact Info */}
        <div className="md:col-span-1 space-y-4">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-[#e1e2ed]/50 text-center">
            <div className="w-12 h-12 rounded-full bg-[#dbe1ff] flex items-center justify-center mx-auto mb-2">
              <span className="material-symbols-outlined text-[#004ac6]">call</span>
            </div>
            <p className="text-sm font-semibold text-[#191b23]">Phone</p>
            <p className="text-sm text-[#434655]">+234 800 123 4567</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-[#e1e2ed]/50 text-center">
            <div className="w-12 h-12 rounded-full bg-[#dbe1ff] flex items-center justify-center mx-auto mb-2">
              <span className="material-symbols-outlined text-[#004ac6]">email</span>
            </div>
            <p className="text-sm font-semibold text-[#191b23]">Email</p>
            <p className="text-sm text-[#434655]">support@asocomms.com</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-[#e1e2ed]/50 text-center">
            <div className="w-12 h-12 rounded-full bg-[#dbe1ff] flex items-center justify-center mx-auto mb-2">
              <span className="material-symbols-outlined text-[#004ac6]">location_on</span>
            </div>
            <p className="text-sm font-semibold text-[#191b23]">Location</p>
            <p className="text-sm text-[#434655]">Lagos, Nigeria</p>
          </div>
        </div>

        {/* Contact Form */}
        <div className="md:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-[#e1e2ed]/50 p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#434655] mb-1">Your Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full h-12 px-4 bg-[#faf8ff] border border-[#c3c6d7] rounded-lg focus:ring-2 focus:ring-[#004ac6] focus:border-[#004ac6] outline-none transition-all text-sm"
                  placeholder="John Doe"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#434655] mb-1">Email Address</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full h-12 px-4 bg-[#faf8ff] border border-[#c3c6d7] rounded-lg focus:ring-2 focus:ring-[#004ac6] focus:border-[#004ac6] outline-none transition-all text-sm"
                  placeholder="name@asocomms.pro"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#434655] mb-1">Subject</label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full h-12 px-4 bg-[#faf8ff] border border-[#c3c6d7] rounded-lg focus:ring-2 focus:ring-[#004ac6] focus:border-[#004ac6] outline-none transition-all text-sm"
                  placeholder="Brief summary"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#434655] mb-1">Message</label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full min-h-[120px] p-4 bg-[#faf8ff] border border-[#c3c6d7] rounded-lg focus:ring-2 focus:ring-[#004ac6] focus:border-[#004ac6] outline-none transition-all text-sm resize-none"
                  placeholder="How can we help you?"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 bg-[#004ac6] text-white font-bold rounded-lg hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-80"
              >
                {isLoading ? (
                  <>
                    <span className="material-symbols-outlined animate-spin">progress_activity</span>
                    Sending...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-base">send</span>
                    Send Message
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>

      <style>{`
        .material-symbols-outlined {
          font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
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

export default Contact;