import React, { useState } from 'react';
import { Calendar, Compass, ShieldCheck } from 'lucide-react';
import { ROOMS_DATA } from './Rooms';

export default function Hero({ onBookClick, onExploreClick }) {
  const today = new Date().toISOString().split('T')[0];
  
  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center transition-transform duration-10000 ease-out transform scale-105"
        style={{
          backgroundImage: "url('/images/hero_background.jpg')",
        }}
      />
      
      {/* Dark Ambient Overlay */}
      <div className="gradient-overlay" />

      {/* Content */}
      <div className="container relative z-10 text-center px-4 flex flex-col items-center pt-24">
        {/* Subtle Luxury Badge */}
        <div 
          className="inline-flex items-center gap-1.5 px-4 py-1 rounded-full mb-6 glass-panel-dark text-accent-gold border border-border-gold text-[0.65rem] uppercase tracking-widest font-medium animate-fade"
          style={{ letterSpacing: '0.25em' }}
        >
          <ShieldCheck size={12} className="text-accent-gold" /> Best Rate Guaranteed
        </div>

        {/* Display Serif Title */}
        <h1 
          className="text-white text-5xl sm:text-6xl md:text-7xl font-light mb-4 max-w-4xl tracking-wide leading-[1.1] animate-fade"
          style={{ 
            fontFamily: 'var(--font-display)',
            textShadow: '0 4px 20px rgba(5, 13, 9, 0.4)'
          }}
        >
          The Sanctuary at <span className="italic text-accent-gold">Peace at Peak</span>
        </h1>
        
        {/* Thin Gold Separator */}
        <div className="gold-divider" />
        
        <p 
          className="text-text-light-secondary text-base sm:text-lg md:text-xl mb-8 max-w-2xl font-light leading-relaxed tracking-wide"
          style={{ textShadow: '0 2px 10px rgba(5, 13, 9, 0.5)' }}
        >
          Discover silence, elegance, and pristine views of the Himalayan range. Experience private wooden cottages and luxury Swiss glamping at 8,500 feet.
        </p>

        {/* Action CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto mb-10">
          <button 
            onClick={onBookClick}
            className="btn btn-primary px-10 py-4 text-xs uppercase tracking-widest"
            style={{ borderRadius: '0px' }}
          >
            Check Availability
          </button>
          
          <button 
            onClick={onExploreClick}
            className="btn btn-secondary px-10 py-4 text-xs uppercase tracking-widest"
            style={{ borderRadius: '0px' }}
          >
            Explore Cottages
          </button>
        </div>

        {/* Floating Mini-Booking Widget */}
        <div className="hero-booking-widget hidden md:block">
          <div className="hero-booking-widget-grid">
            <div className="text-left space-y-1">
              <label className="text-[0.6rem] uppercase tracking-widest font-bold text-accent-gold flex items-center gap-1.5">
                <Calendar size={12} /> Check-In
              </label>
              <input 
                type="date"
                defaultValue={today}
                min={today}
                className="w-full bg-transparent text-white border-0 border-b border-white/20 pb-1 pt-1 text-xs focus:border-accent-gold focus:ring-0 text-left font-medium"
              />
            </div>
            
            <div className="text-left space-y-1">
              <label className="text-[0.6rem] uppercase tracking-widest font-bold text-accent-gold flex items-center gap-1.5">
                <Calendar size={12} /> Check-Out
              </label>
              <input 
                type="date"
                defaultValue={today}
                min={today}
                className="w-full bg-transparent text-white border-0 border-b border-white/20 pb-1 pt-1 text-xs focus:border-accent-gold focus:ring-0 text-left font-medium"
              />
            </div>

            <div className="text-left space-y-1">
              <label className="text-[0.6rem] uppercase tracking-widest font-bold text-accent-gold flex items-center gap-1.5">
                🏔️ Sanctuary
              </label>
              <select 
                className="w-full bg-transparent text-white border-0 border-b border-white/20 pb-1 pt-1 text-xs focus:border-accent-gold focus:ring-0 text-left font-medium select-none"
                style={{ appearance: 'none', background: 'transparent' }}
              >
                {ROOMS_DATA.map(r => (
                  <option key={r.id} value={r.id} className="bg-bg-dark text-white text-xs">{r.name}</option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <button 
                onClick={onBookClick}
                className="btn btn-primary btn-block py-2.5 text-[0.65rem] tracking-widest uppercase"
                style={{ borderRadius: '0px' }}
              >
                RESERVE NOW
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Indicators */}
      <div className="absolute bottom-6 left-10 hidden xl:flex flex-col gap-1 text-[0.7rem] uppercase tracking-widest text-white/50 select-none">
        <p>ELEVATION: <span className="text-accent-gold">8,500 FT</span></p>
        <p>LOCATION: <span className="text-white">KANATAL, IN</span></p>
      </div>

      <div className="absolute bottom-6 right-10 hidden xl:flex flex-col gap-1 text-[0.7rem] uppercase tracking-widest text-white/50 text-right select-none">
        <p>HIMALAYAN VIEW: <span className="text-accent-gold">360° RANGE</span></p>
        <p>SERVICE: <span className="text-white">LUXURY COTTAGE</span></p>
      </div>
    </section>
  );
}
