// src/pages/Public/Support.tsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
}

const Support: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);

  const faqs: FAQ[] = [
    {
      id: '1',
      category: 'Complaints',
      question: 'How do I lodge a complaint?',
      answer: 'You can lodge a complaint by clicking on the "Lodge Complaint" button on your dashboard. Fill in the required details and submit. Our team will review it within 24 hours.'
    },
    {
      id: '2',
      category: 'Tracking',
      question: 'How do I track my complaint status?',
      answer: 'You can track your complaint by entering your tracking ID on the Track Status page. You\'ll see real-time updates on the progress of your complaint.'
    },
    {
      id: '3',
      category: 'Repairs',
      question: 'How long does a repair take?',
      answer: 'Most repairs are completed within 24 hours. However, complex repairs may take 2-3 business days. You\'ll be notified of any delays.'
    },
    {
      id: '4',
      category: 'Billing',
      question: 'How do I get a refund?',
      answer: 'For refund requests, please contact our support team directly. We\'ll review your case and process the refund within 5-7 business days.'
    },
    {
      id: '5',
      category: 'Account',
      question: 'How do I reset my password?',
      answer: 'Click on "Forgot Password" on the login page. Enter your email address and we\'ll send you a link to reset your password.'
    }
  ];

  const filteredFAQs = faqs.filter(faq =>
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const categories = ['All', ...new Set(faqs.map(f => f.category))];
  const [activeCategory, setActiveCategory] = useState('All');

  const displayFAQs = activeCategory === 'All'
    ? filteredFAQs
    : filteredFAQs.filter(f => f.category === activeCategory);

  return (
    <div className="min-h-screen bg-[#F8F6F1] px-4 py-6 md:px-6 md:py-8">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Header */}
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold text-[#1A365D] tracking-tight">Help Center</h1>
          <p className="text-sm text-slate-500 mt-0.5">Find answers to common questions – we're here to help.</p>
        </div>

        {/* Search */}
        <div className="relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">search</span>
          <input
            className="w-full h-12 pl-10 pr-4 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#1A365D]/20 focus:border-[#1A365D] focus:bg-white outline-none transition-all text-sm text-slate-800 placeholder-slate-400"
            placeholder="Search for help topics..."
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Link to="/track" className="bg-white rounded-2xl p-4 border border-slate-200/80 text-center hover:border-[#1A365D]/30 hover:shadow-md transition-all group">
            <span className="material-symbols-outlined text-[#1A365D] text-2xl group-hover:scale-110 transition-transform">search</span>
            <p className="text-xs font-bold text-slate-800 mt-1">Track Status</p>
          </Link>
          <Link to="/complaints/new" className="bg-white rounded-2xl p-4 border border-slate-200/80 text-center hover:border-[#1A365D]/30 hover:shadow-md transition-all group">
            <span className="material-symbols-outlined text-[#1A365D] text-2xl group-hover:scale-110 transition-transform">add_circle</span>
            <p className="text-xs font-bold text-slate-800 mt-1">Lodge Complaint</p>
          </Link>
          <Link to="/contact" className="bg-white rounded-2xl p-4 border border-slate-200/80 text-center hover:border-[#1A365D]/30 hover:shadow-md transition-all group">
            <span className="material-symbols-outlined text-[#1A365D] text-2xl group-hover:scale-110 transition-transform">call</span>
            <p className="text-xs font-bold text-slate-800 mt-1">Contact Us</p>
          </Link>
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 text-center">
            <span className="material-symbols-outlined text-[#D97706] text-2xl">chat</span>
            <p className="text-xs font-bold text-slate-800 mt-1">Live Chat</p>
          </div>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-2 border-b border-slate-200/60 pb-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${activeCategory === category
                  ? 'bg-[#1A365D] text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-50 hover:text-[#1A365D]'
                }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* FAQs */}
        <div className="space-y-3">
          {displayFAQs.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center border border-slate-200/80">
              <span className="material-symbols-outlined text-3xl text-slate-300">search_off</span>
              <p className="text-sm font-bold text-slate-700 mt-2">No Results Found</p>
              <p className="text-xs text-slate-500">Try adjusting your search terms.</p>
            </div>
          ) : (
            displayFAQs.map((faq) => (
              <div key={faq.id} className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden hover:border-[#1A365D]/20 transition-all">
                <button
                  onClick={() => setExpandedFAQ(expandedFAQ === faq.id ? null : faq.id)}
                  className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-slate-50/80 transition-colors"
                >
                  <div className="flex-1 pr-4">
                    <span className="text-[10px] font-bold uppercase text-[#D97706]">{faq.category}</span>
                    <p className="text-sm font-semibold text-[#1A365D]">{faq.question}</p>
                  </div>
                  <span className="material-symbols-outlined text-slate-400">
                    {expandedFAQ === faq.id ? 'expand_less' : 'expand_more'}
                  </span>
                </button>
                {expandedFAQ === faq.id && (
                  <div className="px-5 pb-4 pt-1 border-t border-slate-100">
                    <p className="text-sm text-slate-600">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Contact Support */}
        <div className="bg-[#1A365D]/5 rounded-2xl p-6 text-center border border-[#1A365D]/10">
          <h3 className="text-lg font-display font-bold text-[#1A365D] mb-2">Still need help?</h3>
          <p className="text-sm text-slate-500 mb-4">Our support team is available 24/7 to assist you.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button className="inline-flex items-center gap-2 bg-[#1A365D] text-white px-6 py-2.5 rounded-xl font-bold hover:bg-[#2D4A6B] transition-colors active:scale-95 text-sm shadow-sm shadow-[#1A365D]/20">
              <span className="material-symbols-outlined text-base">chat</span>
              Live Chat
            </button>
            <Link to="/contact" className="inline-flex items-center gap-2 bg-white text-[#1A365D] px-6 py-2.5 rounded-xl font-bold border border-[#1A365D]/30 hover:bg-slate-50 transition-colors active:scale-95 text-sm">
              <span className="material-symbols-outlined text-base">email</span>
              Email Support
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

export default Support;