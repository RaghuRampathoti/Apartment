import React, { useState } from 'react';
import { FaXmark } from 'react-icons/fa6';
import { FaCheckCircle, FaSpinner } from 'react-icons/fa';

export default function ScheduleDemoForm({ onClose }) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    apartmentName: '',
    flatsCount: '',
    preferredDateTime: ''
  });
  const [status, setStatus] = useState('idle'); // idle, loading, success, error

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    try {
      const response = await fetch('http://localhost:8080/api/demos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (response.ok) {
        setStatus('success');
      } else {
        setStatus('error');
      }
    } catch (error) {
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-sm animate-fade-in">
        <div className="relative w-full max-w-lg bg-white rounded-[2rem] p-10 text-center shadow-2xl">
          <button onClick={onClose} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 transition-colors">
            <FaXmark size={24} />
          </button>
          <div className="flex justify-center mb-6 text-emerald-500">
            <FaCheckCircle size={64} />
          </div>
          <h3 className="text-3xl font-black text-slate-800 mb-4 tracking-tight">Demo Requested!</h3>
          <p className="text-slate-500 font-medium leading-relaxed">
            Thank you! Your demo request has been received. Our team will contact you shortly to confirm your preferred time slot.
          </p>
          <button 
            onClick={onClose}
            className="mt-8 bg-slate-100 text-slate-700 font-black uppercase tracking-widest text-sm py-4 px-8 rounded-xl hover:bg-slate-200 transition-colors w-full"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-sm overflow-y-auto pt-24 pb-12">
      <div className="relative w-full max-w-2xl bg-white rounded-[2rem] shadow-2xl animate-zoom-in my-auto">
        
        <div className="p-8 border-b border-slate-100 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">Schedule a Demo</h2>
            <p className="text-sm font-medium text-slate-500 mt-1">Book a personalized walkthrough of the Secure Gate platform.</p>
          </div>
          <button onClick={onClose} className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors">
            <FaXmark size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Full Name *</label>
              <input required name="name" value={formData.name} onChange={handleChange}
                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-bold text-slate-700" 
                placeholder="John Doe" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Phone Number *</label>
              <input required name="phone" value={formData.phone} onChange={handleChange}
                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-bold text-slate-700" 
                placeholder="+91 XXXXXXXXXX" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Email Address *</label>
              <input required type="email" name="email" value={formData.email} onChange={handleChange}
                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-bold text-slate-700" 
                placeholder="john@example.com" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Apartment Name *</label>
              <input required name="apartmentName" value={formData.apartmentName} onChange={handleChange}
                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-bold text-slate-700" 
                placeholder="Green Valley Heights" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Flats *</label>
              <input required type="number" name="flatsCount" value={formData.flatsCount} onChange={handleChange}
                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-bold text-slate-700" 
                placeholder="150" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Preferred Date & Time *</label>
              <input required type="datetime-local" name="preferredDateTime" value={formData.preferredDateTime} onChange={handleChange}
                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-bold text-slate-700 appearance-none" />
            </div>
          </div>

          {status === 'error' && (
            <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm font-bold border border-red-100">
              Something went wrong. Please try again.
            </div>
          )}

          <div className="pt-4 flex gap-4">
            <button 
              type="button" onClick={onClose}
              className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit" disabled={status === 'loading'}
              className="flex-1 py-4 bg-primary text-white rounded-xl font-black uppercase tracking-widest text-xs hover:bg-primary-dark transition-colors shadow-lg shadow-primary/20 flex justify-center items-center gap-2"
            >
              {status === 'loading' ? <><FaSpinner className="animate-spin" /> Submitting</> : 'Confirm Booking'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
