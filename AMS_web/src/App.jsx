import React, { useState, useEffect } from 'react';
import ChoosePlanForm from './components/ChoosePlanForm';
import ScheduleDemoForm from './components/ScheduleDemoForm';
import './App.css';
import { ICONS } from './components/Icons';
import {
  FaRocket,
  FaShieldHalved,
  FaPeopleGroup,
  FaHeadset,
  FaTwitter,
  FaLinkedin,
  FaFacebook,
  FaBars,
  FaXmark,
  FaArrowRight
} from 'react-icons/fa6';

function App() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const [selectedPlanForm, setSelectedPlanForm] = useState(null);
  const [showDemoForm, setShowDemoForm] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const features = [
    { title: 'Apartment Management', desc: 'Efficient block and flat allocation with real-time status tracking.', icon: ICONS.apartment, category: 'Admin' },
    { title: 'Tenant Portal', desc: 'Seamless onboarding with complete document and rent management.', icon: ICONS.tenant, category: 'Resident' },
    { title: 'Smart Maintenance', desc: 'Track service requests from submission to resolution automatically.', icon: ICONS.maintenance, category: 'Management' },
    { title: 'Facility Booking', desc: 'Automated clubhouse and amenity scheduling to prevent overlaps.', icon: ICONS.clubhouse, category: 'Resident' },
    { title: 'Secure Parking', desc: 'Digitized slot allocation and vehicle registration for every block.', icon: ICONS.parking, category: 'Security' },
    { title: 'Gate Security', desc: 'Professional visitor tracking and parcel management for guards.', icon: ICONS.security, category: 'Security' },
    { title: 'Automated Payments', desc: 'Billing, rent collection, and transparent financial reporting.', icon: ICONS.payments, category: 'Management' },
    { title: 'Community Pulse', desc: 'Engage residents with digital polls, notices, and feedback loops.', icon: ICONS.community, category: 'Admin' }
  ];

  const benefits = [
    {
      title: 'For Administrators',
      items: ['Real-time vacancy tracking', 'Automated billing engine', 'Staff performance metrics'],
      accent: 'bg-primary'
    },
    {
      title: 'For Residents',
      items: ['One-tap service requests', 'Digital notice board', 'Secure payment history'],
      accent: 'bg-secondary'
    },
    {
      title: 'For Gate Security',
      items: ['Visitor ID verification', 'Delivery notifications', 'Emergency alerts'],
      accent: 'bg-sidebar'
    }
  ];

  const pricingPlans = [
    {
      name: 'Essential',
      price: '999',
      desc: 'Perfect for small societies starting their digital journey.',
      features: [
        'Apartment Management (Admin)',
        'Resident Portal (Full Access)',
        'Digital Notice Board',
        'Basic Support',
        'Email Notifications'
      ],
      accent: 'bg-emerald-500',
      color: 'text-emerald-500'
    },
    {
      name: 'Professional',
      price: '1999',
      desc: 'Our most popular plan for active communities.',
      features: [
        'Everything in Essential',
        'Smart Maintenance Tracking',
        'Facility & Clubhouse Booking',
        'Secure Parking Allocation',
        'Automated Billing Engine',
        'Priority Support'
      ],
      accent: 'bg-primary',
      color: 'text-primary',
      popular: true
    },
    {
      name: 'Elite',
      price: '2999',
      desc: 'Complete security and financial management suite.',
      features: [
        'Everything in Professional',
        'Gate & Security Management',
        'Visitor & Parcel Tracking',
        'Community Pulse (Polls & Feedback)',
        'Tally & ERP Integration',
        'Dedicated Relationship Manager',
        'Full Backend API Access'
      ],
      accent: 'bg-indigo-600',
      color: 'text-indigo-600'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-primary/20 selection:text-primary-dark">

      {/* HEADER */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'glass-header py-3 shadow-lg' : 'bg-transparent py-5'}`}>
        <div className="max-w-7xl mx-auto px-4 md:px-8 flex justify-between items-center">
          <div className="flex items-center gap-2 group cursor-pointer">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">
              <FaShieldHalved size={20} />
            </div>
            <span className={`text-2xl font-black tracking-tighter ${isScrolled ? 'text-slate-800' : 'text-white'}`}>
              Secure<span className="text-primary">Gate</span>
            </span>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {['Features', 'Modules', 'Solutions', 'Pricing'].map((link) => (
              <a key={link} href={`#${link.toLowerCase()}`} className={`text-sm font-bold uppercase tracking-widest hover:text-primary transition-colors ${isScrolled ? 'text-slate-600' : 'text-white/80 hover:text-white'}`}>
                {link}
              </a>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-4">
            <a href="https://secure-gate-lr.netlify.app/" className={`text-sm font-bold px-5 py-2 rounded-lg transition-all ${isScrolled ? 'text-slate-700 hover:bg-slate-100' : 'text-white hover:bg-white/10'}`}>
              Login
            </a>
            <button 
              onClick={() => setSelectedPlanForm('STARTER')}
              className="bg-primary text-white text-sm font-bold px-6 py-2.5 rounded-lg shadow-lg shadow-primary/20 hover:bg-primary-dark hover:-translate-y-0.5 transition-all active:scale-95">
              Get Started
            </button>
          </div>

          {/* Mobile Toggle */}
          <button className="md:hidden text-primary" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <FaXmark size={24} /> : <FaBars size={24} className={isScrolled ? 'text-slate-800' : 'text-white'} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="absolute top-full left-0 right-0 bg-white shadow-2xl border-t md:hidden animate-fade-in p-6 space-y-4">
            {['Features', 'Modules', 'Solutions', 'Pricing'].map((link) => (
              <a key={link} href={`#${link.toLowerCase()}`} className="block text-lg font-bold text-slate-800 py-2 border-b border-slate-100" onClick={() => setIsMobileMenuOpen(false)}>
                {link}
              </a>
            ))}
            <div className="grid grid-cols-2 gap-4 pt-4">
              <a href="https://secure-gate-lr.netlify.app/" className="text-center py-3 font-bold text-slate-600 bg-slate-50 rounded-xl">Login</a>
              <button 
                onClick={() => { setIsMobileMenuOpen(false); setSelectedPlanForm('STARTER'); }}
                className="text-center py-3 font-bold text-white bg-primary rounded-xl shadow-lg">Signup</button>
            </div>
          </div>
        )}
      </header>

      {/* HERO SECTION */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-slate-900">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80"
            alt="Modern Architecture"
            className="w-full h-full object-cover opacity-40 scale-110 active:scale-100 transition-transform duration-10000"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-900/60 to-slate-900"></div>
          <div className="absolute inset-0 hero-gradient"></div>
        </div>

        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto space-y-4 pt-10">
          <h1 className="text-5xl md:text-8xl font-black text-white tracking-tighter leading-[0.9] drop-shadow-2xl animate-fade-in">
            The Digital Heart of Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-200">Modern Society</span>
          </h1>
          <p className="text-lg md:text-2xl text-slate-300 max-w-3xl mx-auto leading-relaxed animate-fade-in" style={{ animationDelay: '0.2s' }}>
            A comprehensive suite designed for elite apartment complexes.
            Automate management, fortify security, and elevate the resident experience.
          </p>
          <div className="flex flex-col sm:flex-row gap-5 justify-center mt-2 animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <button
              onClick={() => setSelectedPlanForm('STARTER')}
              className="bg-primary text-white font-black uppercase tracking-widest text-sm py-5 px-10 rounded-2xl shadow-2xl shadow-primary/40 hover:bg-primary-dark hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2"
            >
              Start Free Trial <FaRocket />
            </button>
            <button 
              onClick={() => setIsVideoOpen(true)}
              className="bg-white/5 backdrop-blur-xl border-2 border-white/20 text-white font-black uppercase tracking-widest text-sm py-5 px-10 rounded-2xl hover:bg-white hover:text-slate-900 transition-all duration-300"
            >
              Watch Demo
            </button>
          </div>
        </div>
      </section>

      {/* TRUST BAR */}
      <section className="bg-white py-12 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] mb-10">Trusted by over 150+ Premium Communities</p>
          <div className="flex flex-wrap justify-center items-center gap-12 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
            <div className="text-2xl font-black text-slate-800 tracking-tighter">URBAN_SPACE</div>
            <div className="text-2xl font-black text-slate-800 tracking-tighter">ELITE_LIVING</div>
            <div className="text-2xl font-black text-slate-800 tracking-tighter">METRO_TOWERS</div>
            <div className="text-2xl font-black text-slate-800 tracking-tighter">SKY_REIDENCY</div>
          </div>
        </div>
      </section>

      {/* KEY FEATURES / CORE MODULES */}
      <section id="features" className="py-20 px-4 md:px-8 bg-white relative overflow-hidden">
        <div id="modules" className="absolute top-0"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-8">
            <div className="max-w-2xl">
              <h2 className="text-xs font-black text-primary uppercase tracking-[0.4em] mb-4">Core Modules</h2>
              <h3 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter leading-none">
                Everything you need <br /><span className="text-slate-400">to run a mini-city.</span>
              </h3>
            </div>
            <p className="text-lg text-slate-500 max-w-sm font-medium">
              We've digitized every aspect of society management so you can focus on building a community.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group card-hover p-8 bg-slate-50 rounded-[2rem] border border-slate-100 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-4 opacity-5 font-black text-6xl italic group-hover:opacity-10 transition-opacity">0{index + 1}</div>
                <div className="w-16 h-16 mb-8 flex items-center justify-center bg-white rounded-2xl shadow-xl shadow-slate-200 group-hover:bg-primary group-hover:text-white transition-all duration-500">
                  {React.createElement(feature.icon, { size: 28 })}
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-primary mb-2 block">{feature.category}</span>
                <h4 className="text-xl font-black text-slate-900 mb-3 tracking-tight group-hover:text-primary transition-colors">
                  {feature.title}
                </h4>
                <p className="text-slate-500 text-sm leading-relaxed font-medium">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SOLUTIONS SECTION */}
      <section id="solutions" className="py-16 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-8">
            {benefits.map((benefit, i) => (
              <div key={i} className="p-10 rounded-[2.5rem] bg-white/5 border border-white/10 hover:border-white/20 transition-all group">
                <div className={`w-12 h-1.5 ${benefit.accent} rounded-full mb-8 group-hover:w-24 transition-all duration-500`}></div>
                <h4 className="text-3xl font-black mb-8 tracking-tight">{benefit.title}</h4>
                <ul className="space-y-4">
                  {benefit.items.map((item, j) => (
                    <li key={j} className="flex items-center gap-3 text-slate-400 group-hover:text-white transition-colors duration-300">
                      <div className={`w-1.5 h-1.5 rounded-full ${benefit.accent}`}></div>
                      <span className="font-bold text-sm uppercase tracking-widest leading-none">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING SECTION */}
      <section id="pricing" className="py-20 bg-slate-50 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-xs font-black text-primary uppercase tracking-[0.4em] mb-4">Investment Plans</h2>
            <h3 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter leading-none mb-6">
              Tailored for every <br /><span className="text-slate-400">society size.</span>
            </h3>
            <p className="text-lg text-slate-500 font-medium">
              Simple, transparent pricing to help you build a safer, smarter community.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {pricingPlans.map((plan, i) => (
              <div
                key={i}
                className={`relative p-10 rounded-[3rem] border ${plan.popular ? 'border-primary shadow-2xl shadow-primary/20' : 'border-white/10'} bg-slate-900 flex flex-col group hover:translate-y-[-12px] transition-all duration-500 animate-fade-in`}
                style={{ animationDelay: `${0.2 * (i + 1)}s` }}
              >
                {plan.popular && (
                  <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-primary text-white text-[10px] font-black uppercase tracking-widest px-6 py-2 rounded-full shadow-lg">
                    Most Popular
                  </div>
                )}
                <div className="mb-8 text-white">
                  <h4 className="text-xl font-black mb-2 uppercase tracking-tight">{plan.name}</h4>
                  <p className="text-slate-400 text-sm font-medium leading-relaxed">{plan.desc}</p>
                </div>
                <div className="mb-8 flex items-baseline gap-1">
                  <span className="text-4xl font-black text-white">₹{plan.price}</span>
                  <span className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">/ month</span>
                </div>
                <ul className="space-y-4 mb-10 flex-1">
                  {plan.features.map((feature, j) => (
                    <li key={j} className="flex items-start gap-3 text-sm font-bold text-slate-300">
                      <div className={`mt-1.5 w-1.5 h-1.5 rounded-full ${plan.accent}`} />
                      {feature}
                    </li>
                  ))}
                </ul>
                <button 
                  onClick={() => setSelectedPlanForm(plan.name === 'Essential' ? 'STARTER' : plan.name === 'Elite' ? 'ENTERPRISE' : 'PROFESSIONAL')}
                  className={`w-full py-5 rounded-2xl font-black uppercase tracking-widest text-xs transition-all ${plan.popular ? 'bg-primary text-white shadow-xl shadow-primary/30 hover:bg-primary-dark' : 'bg-white/10 text-white hover:bg-white/20 border border-white/10'}`}>
                  Choose Plan
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PREVIEW SECTION */}
      <section className="py-20 bg-white px-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-primary rounded-[3rem] p-12 md:p-20 relative overflow-hidden flex flex-col md:flex-row items-center gap-12 text-white">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-[100px] -mr-48 -mt-48"></div>
            <div className="relative z-10 flex-1 space-y-8 text-center md:text-left">
              <h2 className="text-4xl md:text-7xl font-black tracking-tighter leading-none">
                Experience the <br />Future of Living.
              </h2>
              <p className="text-xl text-white/80 max-w-md font-medium">
                Our intuitive dashboard puts everything in one place. No messy paperwork, no missed calls, just pure efficiency.
              </p>
              <div className="flex flex-wrap gap-4 pt-4 justify-center md:justify-start">
                <div className="bg-white/20 backdrop-blur-md p-4 rounded-2xl border border-white/10 text-center min-w-[120px]">
                  <div className="text-3xl font-black">99%</div>
                  <div className="text-[10px] font-black uppercase opacity-70">Uptime</div>
                </div>
                <div className="bg-white/20 backdrop-blur-md p-4 rounded-2xl border border-white/10 text-center min-w-[120px]">
                  <div className="text-3xl font-black">100k</div>
                  <div className="text-[10px] font-black uppercase opacity-70">Alerts Sent</div>
                </div>
              </div>
            </div>
            <div className="relative z-10 flex-1 w-full max-w-xl">
              <img
                src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
                alt="Dashboard"
                className="rounded-3xl shadow-2xl border-4 border-white/20 animate-float"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-slate-50 relative overflow-hidden">
        <div className="max-w-3xl mx-auto text-center px-4 relative z-10">
          <h2 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tighter mb-8 italic">
            Ready to scale your <br /><span className="text-primary italic">operations?</span>
          </h2>
          <p className="text-xl text-slate-500 mb-12 font-medium">
            Join the forward-thinking societies already using Secure Gate to transform their day-to-day management.
          </p>
          <div className="flex flex-col sm:flex-row gap-5 justify-center">
            <button 
              onClick={() => setShowDemoForm(true)}
              className="bg-primary text-white font-black uppercase tracking-widest text-sm py-5 px-12 rounded-2xl shadow-2xl shadow-primary/30 hover:scale-105 transition-all">
              Schedule a Demo
            </button>
            <button 
              onClick={() => setShowContactModal(true)}
              className="bg-white border-2 border-slate-200 text-slate-800 font-black uppercase tracking-widest text-sm py-5 px-12 rounded-2xl hover:border-primary transition-all">
              Contact Sales
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-slate-900 pt-24 pb-12 px-4 md:px-8 text-white">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <FaShieldHalved className="text-primary" size={32} />
              <span className="text-3xl font-black tracking-tighter font-sans">Secure<span className="text-primary font-sans">Gate</span></span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed max-w-xs font-medium">
              Transforming residential communities through intelligent automation and secure communication.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center hover:bg-primary transition-all text-slate-400 hover:text-white"><FaTwitter /></a>
              <a href="#" className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center hover:bg-primary transition-all text-slate-400 hover:text-white"><FaLinkedin /></a>
              <a href="#" className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center hover:bg-primary transition-all text-slate-400 hover:text-white"><FaFacebook /></a>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-black uppercase tracking-widest text-primary mb-8 underline decoration-2 underline-offset-8">Product</h4>
            <ul className="space-y-4">
              {['Home Automation', 'Security Dashboard', 'Financial Reporting', 'Resident App'].map(item => (
                <li key={item}><a href="#" className="text-slate-400 hover:text-white transition-colors text-sm font-bold uppercase tracking-widest">{item}</a></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-black uppercase tracking-widest text-primary mb-8 underline decoration-2 underline-offset-8">Support</h4>
            <ul className="space-y-4">
              {['Help Center', 'API Docs', 'Community', 'Status'].map(item => (
                <li key={item}><a href="#" className="text-slate-400 hover:text-white transition-colors text-sm font-bold uppercase tracking-widest">{item}</a></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-black uppercase tracking-widest text-primary mb-8 underline decoration-2 underline-offset-8">Contact</h4>
            <ul className="space-y-4">
              <li className="text-slate-400 text-sm font-medium">ops@arahinfotech.net</li>
              <li className="text-slate-400 text-sm font-medium">+91 9696858596</li>
              <li className="text-slate-400 text-sm font-medium">shanmuk empire, ground floor, ayyappa soxiety main road, <br />madhapur, hyderabad, telangana - 500081</li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-xs font-black text-slate-500 uppercase tracking-widest">© 2026 Secure Gate Systems Inc. All rights reserved.</p>
          <div className="flex gap-8">
            <a href="#" className="text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-white">Privacy Policy</a>
            <a href="#" className="text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-white">Terms of Service</a>
          </div>
        </div>
      </footer>

      {/* VIDEO MODAL */}
      {isVideoOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-slate-900/90 backdrop-blur-sm animate-fade-in"
            onClick={() => setIsVideoOpen(false)}
          ></div>
          <div className="relative w-full max-w-5xl aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl animate-zoom-in border border-white/10">
            <button 
              className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/10 hover:bg-white/20 text-white flex items-center justify-center rounded-full backdrop-blur-md transition-all"
              onClick={() => setIsVideoOpen(false)}
            >
              <FaXmark size={20} />
            </button>
            <video 
              className="w-full h-full" 
              controls 
              autoPlay
            >
              <source src="/videos/demo_video.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        </div>
      )}

      {selectedPlanForm && (
        <ChoosePlanForm plan={selectedPlanForm} onClose={() => setSelectedPlanForm(null)} />
      )}

      {showDemoForm && (
        <ScheduleDemoForm onClose={() => setShowDemoForm(false)} />
      )}

      {showContactModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-lg bg-white rounded-[2rem] p-10 shadow-2xl animate-zoom-in">
            <button onClick={() => setShowContactModal(false)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 transition-colors">
              <FaXmark size={24} />
            </button>
            <h3 className="text-3xl font-black text-slate-800 mb-8 tracking-tight">Contact Sales</h3>
            <div className="space-y-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary shrink-0">
                  <FaHeadset size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Phone Number</p>
                  <p className="text-xl font-bold text-slate-700">+91 9696858596</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary shrink-0">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L22 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Email Address</p>
                  <p className="text-xl font-bold text-slate-700">ops@arahinfotech.net</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary shrink-0">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Office Address</p>
                  <p className="text-lg font-bold text-slate-700 leading-tight">shanmuk empire, ground floor, ayyappa soxiety main road, madhapur, hyderabad, telangana - 500081</p>
                </div>
              </div>
            </div>
            <button 
              onClick={() => setShowContactModal(false)}
              className="mt-10 w-full bg-slate-900 text-white font-black uppercase tracking-widest text-sm py-4 rounded-xl hover:bg-slate-800 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

export default App;
