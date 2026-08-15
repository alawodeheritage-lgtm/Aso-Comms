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

  // WhatsApp number (replace with your actual number)
  const whatsappNumber = '2348068676961';
  const whatsappLink = `https://wa.me/${whatsappNumber}`;

  return (
    <div className="min-h-screen bg-[#F8F6F1] px-4 py-6 md:px-6 md:py-8">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Header */}
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold text-[#1A365D] tracking-tight">Contact Us</h1>
          <p className="text-sm text-slate-500 mt-0.5">We'd love to hear from you – reach out anytime.</p>
        </div>

        {/* WhatsApp CTA */}
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center hover:shadow-md transition-shadow">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <div className="w-14 h-14 rounded-full bg-[#25D366] flex items-center justify-center flex-shrink-0 shadow-md shadow-[#25D366]/20">
              <span className="material-symbols-outlined text-white text-3xl">chat</span>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-display font-bold text-[#1A365D]">Chat with us on WhatsApp</h3>
              <p className="text-sm text-slate-600">Fastest way to reach us – we reply within minutes.</p>
            </div>
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#25D366] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#20b85f] transition-colors active:scale-95 shadow-sm shadow-[#25D366]/20"
            >
              <span className="material-symbols-outlined text-base">chat</span>
              WhatsApp Us
            </a>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Contact Info */}
          <div className="md:col-span-1 space-y-4">
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow text-center">
              <div className="w-12 h-12 rounded-full bg-[#1A365D]/10 flex items-center justify-center mx-auto mb-3">
                <span className="material-symbols-outlined text-[#1A365D] text-2xl">call</span>
              </div>
              <p className="text-sm font-bold text-[#1A365D]">Phone</p>
              <p className="text-sm text-slate-600">+234 800 123 4567</p>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow text-center">
              <div className="w-12 h-12 rounded-full bg-[#1A365D]/10 flex items-center justify-center mx-auto mb-3">
                <span className="material-symbols-outlined text-[#1A365D] text-2xl">email</span>
              </div>
              <p className="text-sm font-bold text-[#1A365D]">Email</p>
              <p className="text-sm text-slate-600">support@asocomms.com</p>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow text-center">
              <div className="w-12 h-12 rounded-full bg-[#1A365D]/10 flex items-center justify-center mx-auto mb-3">
                <span className="material-symbols-outlined text-[#1A365D] text-2xl">location_on</span>
              </div>
              <p className="text-sm font-bold text-[#1A365D]">Location</p>
              <p className="text-sm text-slate-600">Ibadan, Nigeria</p>
            </div>

            {/* Quick WhatsApp button in contact info */}
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="block bg-[#25D366] text-white rounded-2xl p-5 border border-[#25D366]/30 shadow-sm hover:shadow-md transition-shadow text-center"
            >
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-3">
                <span className="material-symbols-outlined text-white text-2xl">chat</span>
              </div>
              <p className="text-sm font-bold">Chat on WhatsApp</p>
              <p className="text-xs text-white/80">Quick replies, 24/7 support</p>
            </a>
          </div>

          {/* Contact Form */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6">
              <h3 className="text-sm font-display font-bold text-[#1A365D] mb-4">Send us a message</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Your Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#1A365D]/20 focus:border-[#1A365D] focus:bg-white outline-none transition-all text-sm text-slate-800 placeholder-slate-400"
                    placeholder="John Doe"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#1A365D]/20 focus:border-[#1A365D] focus:bg-white outline-none transition-all text-sm text-slate-800 placeholder-slate-400"
                    placeholder="name@asocomms.pro"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Subject</label>
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#1A365D]/20 focus:border-[#1A365D] focus:bg-white outline-none transition-all text-sm text-slate-800 placeholder-slate-400"
                    placeholder="Brief summary"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Message</label>
                  <textarea
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    rows={4}
                    className="w-full min-h-[100px] p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#1A365D]/20 focus:border-[#1A365D] focus:bg-white outline-none transition-all text-sm text-slate-800 placeholder-slate-400 resize-none"
                    placeholder="How can we help you?"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-11 bg-[#1A365D] text-white font-bold rounded-xl hover:bg-[#2D4A6B] active:scale-95 transition-all shadow-sm shadow-[#1A365D]/20 text-sm disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <span className="material-symbols-outlined animate-spin text-base">progress_activity</span>
                      Sending...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-base">send</span>
                      Send Message
                    </>
                  )}
                </button>

                <p className="text-xs text-slate-400 text-center mt-2">
                  Or reach us faster via <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="text-[#25D366] font-bold hover:underline">WhatsApp</a>.
                </p>
              </form>
            </div>
          </div>
        </div>

        {/* Floating WhatsApp Button */}
        <a
          href={whatsappLink}
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-6 right-6 z-50 bg-[#25D366] text-white p-4 rounded-full shadow-lg shadow-[#25D366]/30 hover:bg-[#20b85f] transition-colors active:scale-95 flex items-center justify-center group"
          aria-label="Chat on WhatsApp"
        >
          <span className="material-symbols-outlined text-3xl">chat</span>
          <span className="absolute right-full mr-3 bg-white text-slate-700 text-xs font-bold px-3 py-1.5 rounded-xl shadow-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-slate-200/80">
            WhatsApp Us
          </span>
        </a>

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
          .animate-spin {
            animation: spin 1s linear infinite;
          }
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </div>
  );
};

export default Contact;