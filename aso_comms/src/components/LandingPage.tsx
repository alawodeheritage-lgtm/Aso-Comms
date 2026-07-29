import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

interface Service {
  icon: string;
  name: string;
  price: string;
}

interface Feature {
  icon: string;
  title: string;
  description: string;
}

interface Testimonial {
  id: number;
  text: string;
  name: string;
  role: string;
  initials: string;
}

const LandingPage: React.FC = () => {
  const sliderRef = useRef<HTMLDivElement>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Testimonial slider data
  const testimonials: Testimonial[] = [
    {
      id: 1,
      text: '"Saved my iPhone 14 after a terrible drop. The screen looks and feels exactly like the original. Done in 30 mins!"',
      name: 'James D.',
      role: 'Smartphone Repair',
      initials: 'JD'
    },
    {
      id: 2,
      text: '"Most reliable laptop repair in the city. They fixed my MacBook\'s motherboard when everyone else said it was dead."',
      name: 'Sarah M.',
      role: 'Laptop Specialist',
      initials: 'SM'
    },
    {
      id: 3,
      text: '"Professional service from start to finish. They kept me updated throughout the repair process. Highly recommend!"',
      name: 'Michael O.',
      role: 'Business Owner',
      initials: 'MO'
    }
  ];

  // Services data
  const services: Service[] = [
    { icon: 'phone_iphone', name: 'Screen Replacement', price: 'From $89' },
    { icon: 'battery_charging_full', name: 'Battery Swap', price: 'From $49' },
    { icon: 'usb', name: 'Charging Port', price: 'From $59' },
    { icon: 'terminal', name: 'Software Fix', price: 'From $39' }
  ];

  // Features data
  const features: Feature[] = [
    {
      icon: 'workspace_premium',
      title: 'Certified Techs',
      description: 'Our team is manufacturer-certified with over 10 years of experience in complex micro-soldering and board repairs.'
    },
    {
      icon: 'rocket_launch',
      title: '24-Hour Turnaround',
      description: 'We value your time. 90% of our standard repairs are completed and returned to customers within a single business day.'
    },
    {
      icon: 'verified_user',
      title: 'Genuine Parts',
      description: 'We only use OEM or high-quality grade-A parts, backed by our industry-leading 12-month satisfaction warranty.'
    }
  ];

  // Intersection Observer for scroll animations
  useEffect(() => {
    const sections = document.querySelectorAll('.animate-section');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('opacity-100', 'translate-y-0');
            entry.target.classList.remove('opacity-0', 'translate-y-10');
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    sections.forEach((section) => {
      observer.observe(section);
    });

    return () => {
      sections.forEach((section) => {
        observer.unobserve(section);
      });
    };
  }, []);

  return (
    <div className="min-h-screen w-full flex flex-col bg-slate-50 text-slate-900 font-sans antialiased overflow-x-hidden">
      {/* TopAppBar */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md shadow-xs border-b border-slate-200/80">
        <div className="flex justify-between items-center px-4 md:px-6 py-3.5 w-full max-w-7xl mx-auto">
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <span className="material-symbols-outlined text-xl">bolt</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Aso<span className="text-blue-600">Comms</span>
            </h1>
          </Link>

          {/* Desktop Navigation Link Cluster */}
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <Link to="/repairs" className="hover:text-blue-600 transition-colors">Services</Link>
            <Link to="/track" className="hover:text-blue-600 transition-colors">Track Status</Link>
          </div>

          {/* Desktop Action Buttons */}
          <div className="hidden sm:flex items-center gap-3">
            <Link
              to="/login"
              className="text-sm font-semibold text-slate-700 hover:text-blue-600 px-3 py-2 rounded-lg transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 shadow-sm shadow-blue-600/30 transition-all active:scale-95"
            >
              Get Started
            </Link>
          </div>

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="sm:hidden p-2 text-slate-700 hover:bg-slate-100 transition-colors rounded-xl focus:outline-none"
            aria-label="Toggle Navigation Menu"
          >
            <span className="material-symbols-outlined">
              {mobileMenuOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>

        {/* Mobile Slide-down Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="sm:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-6 space-y-3 shadow-lg animate-in slide-in-from-top-2">
            <Link
              to="/repairs"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-base font-medium text-slate-800 hover:bg-slate-50"
            >
              Our Services
            </Link>
            <Link
              to="/track"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-base font-medium text-slate-800 hover:bg-slate-50"
            >
              Track Complaint / Status
            </Link>
            <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 rounded-xl text-sm font-semibold text-slate-700 border border-slate-200"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 rounded-xl text-sm font-semibold text-white bg-blue-600 shadow-sm"
              >
                Get Started
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 pt-16">
        {/* Hero Section */}
        <section className="px-4 py-12 md:py-20 lg:py-24 relative overflow-hidden bg-gradient-to-b from-blue-50/60 via-slate-50 to-slate-50">
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-blue-400/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="relative z-10 max-w-6xl mx-auto">
            <div className="flex flex-col lg:grid lg:grid-cols-2 gap-10 lg:gap-12 items-center">
              {/* Left Content */}
              <div className="text-center lg:text-left">
                <div className="inline-flex items-center gap-2 bg-blue-100/80 border border-blue-200/60 px-3.5 py-1.5 rounded-full mb-6 shadow-2xs">
                  <span className="material-symbols-outlined text-blue-700 text-sm">verified</span>
                  <span className="text-xs font-bold text-blue-900 tracking-wide uppercase">Trusted by 5,000+ Customers</span>
                </div>
                <h2 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
                  Expert Device Repairs
                  <span className="text-blue-600 block mt-1">You Can Trust.</span>
                </h2>
                <p className="text-base sm:text-lg text-slate-600 max-w-lg mx-auto lg:mx-0 mt-5 leading-relaxed">
                  Fast, reliable, and professional repair services for smartphones, laptops, and tablets. Most repairs completed in under 24 hours.
                </p>
                <div className="flex flex-col sm:flex-row gap-3.5 mt-8 justify-center lg:justify-start">
                  <Link
                    to="/repairs"
                    className="w-full sm:w-auto bg-blue-600 text-white px-8 py-3.5 rounded-xl font-bold text-center shadow-lg shadow-blue-600/25 hover:bg-blue-700 hover:shadow-blue-600/35 transition-all active:scale-[0.98]"
                  >
                    Book a Repair
                  </Link>
                  <Link
                    to="/track"
                    className="w-full sm:w-auto bg-white text-slate-700 border border-slate-300 px-8 py-3.5 rounded-xl font-semibold text-center hover:bg-slate-100/80 transition-colors active:scale-[0.98] flex items-center justify-center gap-2 shadow-2xs"
                  >
                    <span className="material-symbols-outlined text-lg text-slate-500">search</span>
                    Track Your Complaint
                  </Link>
                </div>
              </div>

              {/* Right Image */}
              <div className="w-full max-w-md mx-auto lg:max-w-none">
                <div className="rounded-2xl overflow-hidden shadow-2xl border border-slate-200/80 relative aspect-[4/3] group">
                  <img
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuAZbFjXFYrgLCeS9xa8o_QSaHOLVb1kc4tPYCUWUge2kEQ3sJ-oX3f6VLVpWYHlHIq4OGi9htfN9d9odiXW5wGxr1Zx1uKPMt1uw22I4s7vqUdBO_JW-m5KJ4_HiL0NZ0PUmzVkqtmHk2l-wE8mXYBJ8J5x3FHN96ew3lf0JXfnsuMhTI0x5LCXgCqCGMVwU08s8m2eUHUlf7MmB2OKkxPeZTufX7v_rcvdOWRkIU4lZKdflz66KZHGSEVCIucKzcGML-15ChCUB80"
                    alt="Professional technician repairing a smartphone"
                  />
                  <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md p-3.5 rounded-xl flex items-center gap-3.5 shadow-xl border border-slate-100">
                    <div className="w-11 h-11 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="material-symbols-outlined text-emerald-700 text-xl">timer</span>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Average Repair Time</p>
                      <p className="text-base font-bold text-slate-900">45 Minutes</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Services Grid */}
        <section className="px-4 py-12 md:py-16 bg-white border-y border-slate-200/60">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-end justify-between mb-8">
              <div>
                <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Our Services</h3>
                <div className="w-12 h-1 bg-blue-600 rounded-full mt-2"></div>
              </div>
              <Link className="text-xs sm:text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 group" to="/repairs">
                All Services <span className="material-symbols-outlined text-base group-hover:translate-x-0.5 transition-transform">arrow_forward</span>
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {services.map((service, index) => (
                <Link
                  to="/repairs"
                  key={index}
                  className="bg-slate-50 hover:bg-blue-50/50 border border-slate-200/80 rounded-2xl p-5 shadow-xs flex flex-col gap-3 transition-all hover:-translate-y-0.5 hover:shadow-md group cursor-pointer"
                >
                  <div className="w-11 h-11 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <span className="material-symbols-outlined text-xl">{service.icon}</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{service.name}</h4>
                    <p className="text-xs font-semibold text-slate-500 mt-0.5">{service.price}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Why Us */}
        <section className="px-4 py-12 md:py-16 bg-slate-50">
          <div className="max-w-4xl mx-auto">
            <h3 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-10 text-center tracking-tight">The AsoComms Difference</h3>
            <div className="space-y-6">
              {features.map((feature, index) => (
                <div key={index} className="flex gap-4 sm:gap-5 items-start bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center">
                    <span className="material-symbols-outlined text-blue-600 text-2xl">{feature.icon}</span>
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-slate-900">{feature.title}</h4>
                    <p className="text-sm text-slate-600 mt-1 leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="px-4 py-12 md:py-16 bg-white border-t border-slate-200/60 overflow-hidden">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-10">
              <div className="flex text-amber-400 gap-1 justify-center mb-3">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                ))}
              </div>
              <h3 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">What Our Clients Say</h3>
            </div>
            <div
              ref={sliderRef}
              className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide gap-5 pb-4"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {testimonials.map((testimonial) => (
                <div
                  key={testimonial.id}
                  className="min-w-[85vw] sm:min-w-[60vw] md:min-w-[45vw] lg:min-w-[33.33%] snap-center bg-slate-50 p-6 rounded-2xl border border-slate-200 flex flex-col justify-between gap-6 shadow-2xs"
                >
                  <p className="text-sm md:text-base italic text-slate-700 leading-relaxed">{testimonial.text}</p>
                  <div className="flex items-center gap-3.5 pt-4 border-t border-slate-200/60">
                    <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                      {testimonial.initials}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">{testimonial.name}</p>
                      <p className="text-xs font-medium text-slate-500">{testimonial.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="px-4 py-12 md:py-16 max-w-5xl mx-auto w-full">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-3xl p-8 md:p-12 text-center text-white shadow-xl shadow-blue-600/20 relative overflow-hidden">
            <div className="absolute -right-12 -bottom-12 w-56 h-56 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
            <h2 className="text-2xl sm:text-4xl font-extrabold mb-3 tracking-tight">Ready to fix your device?</h2>
            <p className="text-sm sm:text-base text-blue-100 max-w-xl mx-auto mb-8 leading-relaxed">
              Get a free, no-obligation quote today and join thousands of happy customers.
            </p>
            <div className="flex flex-col sm:flex-row gap-3.5 justify-center">
              <Link
                to="/repairs"
                className="bg-white text-blue-700 px-8 py-3.5 rounded-xl font-bold shadow-md hover:bg-blue-50 transition-all active:scale-95"
              >
                Get Free Quote
              </Link>
              <Link
                to="/track"
                className="bg-blue-700/60 text-white px-8 py-3.5 rounded-xl font-bold border border-white/20 hover:bg-blue-700/90 transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-lg">search</span>
                Track Status
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full bg-slate-900 text-slate-300">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                <span className="material-symbols-outlined text-lg">bolt</span>
              </div>
              <span className="text-xl font-bold text-white tracking-tight">AsoComms</span>
            </Link>
            <nav className="flex flex-wrap justify-center gap-6">
              <Link className="text-slate-400 hover:text-white transition-colors text-sm font-medium" to="/repairs">Services</Link>
              <Link className="text-slate-400 hover:text-white transition-colors text-sm font-medium" to="/repairs">Pricing</Link>
              <Link className="text-slate-400 hover:text-white transition-colors text-sm font-medium" to="/track">Track Complaint</Link>
              <Link className="text-slate-400 hover:text-white transition-colors text-sm font-medium" to="/login">Sign In</Link>
            </nav>
          </div>
          <div className="h-px w-full bg-slate-800 my-6"></div>
          <p className="text-center text-slate-500 text-xs sm:text-sm">
            © 2024 AsoComms Professional Management. All rights reserved.
          </p>
        </div>
      </footer>

      {/* Tailwind v4 & Material Icons Custom Utilities */}
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
          vertical-align: middle;
        }
        .animate-section {
          transition: opacity 0.7s ease-out, transform 0.7s ease-out;
        }
        .opacity-0 {
          opacity: 0;
        }
        .translate-y-10 {
          transform: translateY(10px);
        }
        .opacity-100 {
          opacity: 1;
        }
        .translate-y-0 {
          transform: translateY(0);
        }
      `}</style>
    </div>
  );
};

export default LandingPage;