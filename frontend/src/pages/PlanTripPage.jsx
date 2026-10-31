import React, { useState } from 'react';
import Container from '../components/common/Container';
import { DESTINATIONS } from '../data/destinations';
import { BRAND } from '../utils/constants';
import { Sparkles, Check, ArrowRight, MessageCircle, CheckCircle } from 'lucide-react';

export function PlanTripPage() {
  const [step, setStep] = useState(1);
  const [plan, setPlan] = useState({
    destination: 'Kedarkantha',
    travelType: 'Trekking',
    duration: '4-7 Days',
    budget: '₹10,000 - ₹20,000',
    travelers: 2,
    fullName: '',
    email: '',
    phone: '',
    notes: ''
  });

  const [submitted, setSubmitted] = useState(false);

  const travelStyles = ['Trekking', 'Adventure Sports', 'Honeymoon & Leisure', 'Family Comfort', 'Group Road Trip', 'International Island'];
  const durationOptions = ['Weekend (2-3 Days)', 'Short (4-6 Days)', 'Week (7-10 Days)', 'Extended (10+ Days)'];
  const budgetOptions = ['Under ₹10,000', '₹10,000 - ₹25,000', '₹25,000 - ₹50,000', 'Luxury ₹50,000+'];

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="pt-28 pb-24 bg-[#F7F7F5] min-h-screen">
      <Container className="max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 mb-3">
            <span className="w-2 h-2 rounded-full bg-[#FF6B16]"></span>
            <span className="text-[#FF6B16] font-bold text-xs uppercase tracking-widest">
              CUSTOM TRIP BUILDER
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-[#111111] tracking-tight">
            Plan Your Dream Escape
          </h1>
          <p className="mt-3 text-neutral-600 text-base sm:text-lg">
            Tell us your travel preferences and let our mountain marshals craft a personalized itinerary.
          </p>
        </div>

        {submitted ? (
          <div className="bg-white rounded-3xl p-8 sm:p-12 border border-neutral-100 shadow-xl text-center space-y-6">
            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-10 h-10" />
            </div>

            <h2 className="text-3xl font-black text-neutral-900">
              Trip Proposal Request Received!
            </h2>

            <p className="text-neutral-600 max-w-lg mx-auto text-sm sm:text-base">
              Thank you, <strong className="text-neutral-900">{plan.fullName || 'Adventurer'}</strong>! We’ve logged your request for <strong>{plan.destination}</strong> ({plan.travelType}, {plan.travelers} travelers). Our destination specialist will get in touch shortly with custom itineraries.
            </p>

            {/* Summary Box */}
            <div className="bg-neutral-50 rounded-2xl p-6 text-left max-w-md mx-auto text-xs sm:text-sm space-y-2 border border-neutral-200">
              <div className="flex justify-between">
                <span className="text-neutral-500 font-bold">Destination:</span>
                <span className="font-extrabold text-neutral-900">{plan.destination}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500 font-bold">Travel Style:</span>
                <span className="font-extrabold text-neutral-900">{plan.travelType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500 font-bold">Duration:</span>
                <span className="font-extrabold text-neutral-900">{plan.duration}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500 font-bold">Travelers:</span>
                <span className="font-extrabold text-neutral-900">{plan.travelers} Persons</span>
              </div>
            </div>

            <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
              <a
                href={BRAND.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-md"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Expedite via WhatsApp</span>
              </a>
              <button
                onClick={() => setSubmitted(false)}
                className="px-6 py-3 rounded-full border border-neutral-300 text-neutral-700 font-bold text-xs uppercase tracking-wider hover:bg-neutral-100"
              >
                Create Another Plan
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 sm:p-10 border border-neutral-100 shadow-xl space-y-8">
            {/* 1. Destination Choice */}
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-neutral-400 mb-3">
                1. Select Destination
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {DESTINATIONS.map((d) => (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => setPlan({ ...plan, destination: d.name })}
                    className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                      plan.destination === d.name
                        ? 'border-[#FF6B16] bg-[#FF6B16]/5 text-[#111111] shadow-xs'
                        : 'border-neutral-200 hover:border-neutral-300 text-neutral-600'
                    }`}
                  >
                    <span className="block font-black text-sm">{d.name}</span>
                    <span className="block text-[10px] text-neutral-400 font-semibold">{d.subtitle}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Travel Style */}
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-neutral-400 mb-3">
                2. Travel Style & Preference
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {travelStyles.map((style) => (
                  <button
                    key={style}
                    type="button"
                    onClick={() => setPlan({ ...plan, travelType: style })}
                    className={`py-3 px-4 rounded-2xl border text-xs font-bold transition-all text-left flex items-center justify-between cursor-pointer ${
                      plan.travelType === style
                        ? 'border-[#FF6B16] bg-[#FF6B16] text-white shadow-md shadow-[#FF6B16]/25'
                        : 'border-neutral-200 hover:border-neutral-300 text-neutral-700 bg-neutral-50'
                    }`}
                  >
                    <span>{style}</span>
                    {plan.travelType === style && <Check className="w-3.5 h-3.5" />}
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Duration & Budget */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-neutral-400 mb-2">
                  3. Trip Duration
                </label>
                <select
                  value={plan.duration}
                  onChange={(e) => setPlan({ ...plan, duration: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl border border-neutral-200 text-sm focus:outline-none focus:border-[#FF6B16] bg-neutral-50"
                >
                  {durationOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-neutral-400 mb-2">
                  4. Budget per Person
                </label>
                <select
                  value={plan.budget}
                  onChange={(e) => setPlan({ ...plan, budget: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl border border-neutral-200 text-sm focus:outline-none focus:border-[#FF6B16] bg-neutral-50"
                >
                  {budgetOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* 4. Contact Details */}
            <div className="pt-4 border-t border-neutral-100">
              <label className="block text-xs font-black uppercase tracking-wider text-neutral-400 mb-3">
                5. Your Contact Information
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <input
                    type="text"
                    required
                    placeholder="Your Full Name *"
                    value={plan.fullName}
                    onChange={(e) => setPlan({ ...plan, fullName: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:border-[#FF6B16]"
                  />
                </div>

                <div>
                  <input
                    type="email"
                    required
                    placeholder="Email Address *"
                    value={plan.email}
                    onChange={(e) => setPlan({ ...plan, email: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:border-[#FF6B16]"
                  />
                </div>

                <div>
                  <input
                    type="tel"
                    required
                    placeholder="Phone Number *"
                    value={plan.phone}
                    onChange={(e) => setPlan({ ...plan, phone: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:border-[#FF6B16]"
                  />
                </div>
              </div>

              <div className="mt-4">
                <textarea
                  rows={3}
                  placeholder="Special requests, dietary requirements, preferred start date or group details..."
                  value={plan.notes}
                  onChange={(e) => setPlan({ ...plan, notes: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:border-[#FF6B16]"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-4 rounded-full bg-[#FF6B16] hover:bg-[#e05809] text-white font-extrabold text-sm uppercase tracking-wider shadow-xl shadow-[#FF6B16]/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Get Custom Trip Plan</span>
              <Sparkles className="w-4 h-4" />
            </button>
          </form>
        )}
      </Container>
    </div>
  );
}

export default PlanTripPage;
