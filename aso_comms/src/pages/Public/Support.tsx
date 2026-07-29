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
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#191b23]">Help Center</h1>
        <p className="text-sm text-[#434655]">Find answers to common questions</p>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-[#737686] text-base">search</span>
        <input
          className="w-full h-12 pl-10 pr-4 bg-white border border-[#c3c6d7] rounded-xl focus:ring-2 focus:ring-[#004ac6] focus:border-[#004ac6] outline-none transition-all text-sm"
          placeholder="Search for help topics..."
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <Link to="/track" className="bg-white p-4 rounded-xl border border-[#e1e2ed]/50 text-center hover:shadow-md transition-shadow">
          <span className="material-symbols-outlined text-[#004ac6] text-2xl">search</span>
          <p className="text-xs font-semibold text-[#191b23] mt-1">Track Status</p>
        </Link>
        <Link to="/complaints/new" className="bg-white p-4 rounded-xl border border-[#e1e2ed]/50 text-center hover:shadow-md transition-shadow">
          <span className="material-symbols-outlined text-[#004ac6] text-2xl">add_circle</span>
          <p className="text-xs font-semibold text-[#191b23] mt-1">Lodge Complaint</p>
        </Link>
        <Link to="/chat" className="bg-white p-4 rounded-xl border border-[#e1e2ed]/50 text-center hover:shadow-md transition-shadow">
          <span className="material-symbols-outlined text-[#004ac6] text-2xl">chat</span>
          <p className="text-xs font-semibold text-[#191b23] mt-1">Live Chat</p>
        </Link>
        <Link to="/contact" className="bg-white p-4 rounded-xl border border-[#e1e2ed]/50 text-center hover:shadow-md transition-shadow">
          <span className="material-symbols-outlined text-[#004ac6] text-2xl">call</span>
          <p className="text-xs font-semibold text-[#191b23] mt-1">Contact Us</p>
        </Link>
      </div>

      {/* Categories */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${activeCategory === category
                ? 'bg-[#004ac6] text-white'
                : 'bg-[#e1e2ed] text-[#434655] hover:bg-[#d5d8e8]'
              }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* FAQs */}
      <div className="space-y-3">
        {displayFAQs.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center border border-[#e1e2ed]/50">
            <div className="w-16 h-16 rounded-full bg-[#f3f3fe] flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-[#737686] text-3xl">search_off</span>
            </div>
            <h3 className="text-lg font-bold text-[#191b23] mb-2">No Results Found</h3>
            <p className="text-sm text-[#434655]">Try adjusting your search terms</p>
          </div>
        ) : (
          displayFAQs.map((faq) => (
            <div key={faq.id} className="bg-white rounded-xl shadow-sm border border-[#e1e2ed]/50 overflow-hidden">
              <button
                onClick={() => setExpandedFAQ(expandedFAQ === faq.id ? null : faq.id)}
                className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-[#f3f3fe] transition-colors"
              >
                <div className="flex-1 pr-4">
                  <span className="text-[10px] font-bold uppercase text-[#434655]">{faq.category}</span>
                  <p className="text-sm font-semibold text-[#191b23]">{faq.question}</p>
                </div>
                <span className="material-symbols-outlined text-[#737686]">
                  {expandedFAQ === faq.id ? 'expand_less' : 'expand_more'}
                </span>
              </button>
              {expandedFAQ === faq.id && (
                <div className="px-4 pb-4 pt-1 border-t border-[#e1e2ed]/50">
                  <p className="text-sm text-[#434655]">{faq.answer}</p>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Contact Support */}
      <div className="mt-6 bg-[#dbe1ff] rounded-xl p-6 text-center">
        <h3 className="text-lg font-bold text-[#004ac6] mb-2">Still need help?</h3>
        <p className="text-sm text-[#434655] mb-4">Our support team is available 24/7</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button className="bg-[#004ac6] text-white px-6 py-2 rounded-lg font-semibold hover:opacity-90 transition-colors active:scale-95">
            <span className="flex items-center gap-2 justify-center">
              <span className="material-symbols-outlined text-base">chat</span>
              Live Chat
            </span>
          </button>
          <button className="bg-white text-[#004ac6] px-6 py-2 rounded-lg font-semibold border border-[#004ac6] hover:bg-[#f3f3fe] transition-colors active:scale-95">
            <span className="flex items-center gap-2 justify-center">
              <span className="material-symbols-outlined text-base">email</span>
              Email Support
            </span>
          </button>
        </div>
      </div>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .material-symbols-outlined {
          font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
          display: inline-block;
          line-height: 1;
        }
      `}</style>
    </div>
  );
};

export default Support;