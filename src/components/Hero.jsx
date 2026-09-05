import React, { useState, useEffect } from 'react';
import { Calendar, ShieldCheck } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

export default function Hero({ onBookClick, onExploreClick }) {
  const { heroSlides, rooms } = useAppContext();
  const slides = heroSlides && heroSlides.length > 0 ? heroSlides : [];
  const track = slides.length > 1 ? [slides[slides.length - 1], ...slides, slides[0]] : slides;

  const [currentIndex, setCurrentIndex] = useState(1); // Starts at slides[0] (index 1 in track)
  const [isTransitioning, setIsTransitioning] = useState(true);
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (slides.length <= 1) return;

    const timer = setInterval(() => {
      setIsTransitioning(true);
      setCurrentIndex((prev) => prev - 1); // Move left in track = images slide smoothly to the right
    }, 2000);

    return () => clearInterval(timer);
  }, [slides.length]);

  // When reaching the cloned boundary on the left (index 0), snap silently to index slides.length
  const handleTransitionEnd = () => {
    if (currentIndex === 0) {
      setIsTransitioning(false);
      setCurrentIndex(slides.length);
    }
  };

  const activeSlide = slides.length > 0 ? slides[(currentIndex - 1 + slides.length) % slides.length] : null;

  return (
    <section className="relative min-h-screen h-[100dvh] flex items-center justify-center overflow-hidden bg-[#050d09]">
      
      {/* =========================================================================
          1. DESKTOP VIEW (>= 768px): Cinematic Full-Bleed Cover with Centered Overlay
         ========================================================================= */}
      <div className="hero-desktop-wrapper">
        {/* Infinite Sliding Track */}
        <div
          className="absolute inset-0 flex"
          onTransitionEnd={handleTransitionEnd}
          style={{
            width: `${track.length * 100}%`,
            transform: `translate3d(-${(currentIndex * 100) / track.length}%, 0, 0)`,
            transition: isTransitioning
              ? 'transform 1000ms cubic-bezier(0.25, 1, 0.5, 1)'
              : 'none',
            willChange: 'transform',
          }}
        >
          {track.map((slide, idx) => (
            <div
              key={idx}
              className="relative h-full flex-shrink-0"
              style={{
                width: `${100 / track.length}%`,
                backgroundImage: `url('${slide.url}')`,
                backgroundSize: 'cover',
                backgroundPosition: slide.position || 'center center',
                backgroundRepeat: 'no-repeat',
                filter: 'contrast(1.08) brightness(0.95) saturate(1.12)',
                imageRendering: 'high-quality',
              }}
            />
          ))}
        </div>
        {/* Dark Ambient Overlay */}
        <div className="gradient-overlay" style={{ zIndex: 2 }} />
      </div>

      {/* Desktop Centered Content Overlay */}
      <div className="container relative text-center px-4 hero-desktop-content flex-col items-center pt-20 sm:pt-24" style={{ zIndex: 10 }}>
        {/* Subtle Luxury Badge */}
        <div 
          className="inline-flex items-center gap-1.5 px-4 py-1 rounded-full mb-6 glass-panel-dark text-accent-gold border border-border-gold text-[0.65rem] uppercase tracking-widest font-medium animate-fade"
          style={{ letterSpacing: '0.22em' }}
        >
          <ShieldCheck size={12} className="text-accent-gold" /> Best Rate Guaranteed
        </div>

        {/* Display Serif Title */}
        <h1 
          className="text-white text-5xl md:text-7xl font-light mb-4 max-w-4xl tracking-wide leading-[1.1] animate-fade"
          style={{ 
            fontFamily: 'var(--font-display)',
            textShadow: '0 4px 20px rgba(5, 13, 9, 0.7)'
          }}
        >
          The Sanctuary at <span className="italic text-accent-gold">Peace at Peak</span>
        </h1>
        
        {/* Thin Gold Separator */}
        <div className="gold-divider" />
        
        <p 
          className="text-text-light-secondary text-lg md:text-xl mb-8 max-w-2xl font-light leading-relaxed tracking-wide px-2"
          style={{ textShadow: '0 2px 10px rgba(5, 13, 9, 0.7)' }}
        >
          Discover silence, elegance, and pristine views of the Himalayan range. Experience private wooden cottages and luxury Swiss glamping at 8,500 feet.
        </p>

        {/* Action CTAs */}
        <div className="flex flex-row gap-4 w-auto mb-10">
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
        <div className="hero-booking-widget">
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
                {rooms.map(r => (
                  <option key={r.id} value={r.id} className="bg-bg-dark text-white text-xs">
                    {r.name} {r.available === false ? '(Sold Out)' : ''}
                  </option>
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

      {/* Desktop Floating Corner Badges */}
      <div className="absolute bottom-6 left-10 hidden xl:flex flex-col gap-1 text-[0.7rem] uppercase tracking-widest text-white/50 select-none" style={{ zIndex: 10 }}>
        <p>ELEVATION: <span className="text-accent-gold">8,500 FT</span></p>
        <p>LOCATION: <span className="text-white">KANATAL, IN</span></p>
      </div>

      <div className="absolute bottom-6 right-10 hidden xl:flex flex-col gap-1 text-[0.7rem] uppercase tracking-widest text-white/50 text-right select-none" style={{ zIndex: 10 }}>
        <p>HIMALAYAN VIEW: <span className="text-accent-gold">360° RANGE</span></p>
        <p>SERVICE: <span className="text-white">LUXURY COTTAGE</span></p>
      </div>


      {/* =========================================================================
          2. MOBILE & ANDROID VIEW (< 768px):
             - Text strictly ABOVE the image
             - Middle stage: 100% full, uncropped, unzoomed image
             - Action buttons strictly BELOW the image
         ========================================================================= */}
      <div className="hero-mobile-wrapper">
        {/* Dynamic ambient backdrop tone from active slide */}
        {activeSlide && (
          <div 
            className="absolute inset-0 bg-cover bg-center filter blur-3xl opacity-20 scale-125 pointer-events-none transition-all duration-1000"
            style={{ backgroundImage: `url('${activeSlide.url}')` }}
          />
        )}

        {/* -------------------------------------------------------------
            ZONE A: TEXT ABOVE THE IMAGE
           ------------------------------------------------------------- */}
        <div className="relative z-10 flex flex-col items-center text-center space-y-2 pt-1 max-w-sm mx-auto">
          {/* Badge */}
          <div 
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full glass-panel-dark text-accent-gold border border-border-gold text-[0.62rem] uppercase tracking-widest font-medium"
            style={{ letterSpacing: '0.18em' }}
          >
            <ShieldCheck size={11} className="text-accent-gold" /> Best Rate Guaranteed
          </div>

          {/* Heading */}
          <h1 
            className="text-white text-2xl sm:text-3xl font-light tracking-wide leading-tight"
            style={{ 
              fontFamily: 'var(--font-display)',
              textShadow: '0 2px 10px rgba(0, 0, 0, 0.9)'
            }}
          >
            The Sanctuary at <span className="italic text-accent-gold">Peace at Peak</span>
          </h1>

          {/* Gold Divider */}
          <div className="gold-divider my-1" />

          {/* Description */}
          <p 
            className="text-text-light-secondary text-xs font-light leading-relaxed px-1"
            style={{ textShadow: '0 1px 6px rgba(0, 0, 0, 0.9)' }}
          >
            Discover silence, elegance, and pristine views of the Himalayan range at 8,500 feet.
          </p>
        </div>

        {/* -------------------------------------------------------------
            ZONE B: THE FULL UNZOOMED IMAGE STAGE (NO TEXT/BUTTONS OVERLAY)
           ------------------------------------------------------------- */}
        <div className="relative z-10 w-full my-auto py-2">
          <div className="hero-mobile-stage">
            {/* Smooth 2s Sliding Track for Mobile Stage */}
            <div
              className="absolute inset-0 flex"
              onTransitionEnd={handleTransitionEnd}
              style={{
                width: `${track.length * 100}%`,
                transform: `translate3d(-${(currentIndex * 100) / track.length}%, 0, 0)`,
                transition: isTransitioning
                  ? 'transform 1000ms cubic-bezier(0.25, 1, 0.5, 1)'
                  : 'none',
                willChange: 'transform',
              }}
            >
              {track.map((slide, idx) => (
                <div
                  key={idx}
                  className="relative h-full flex-shrink-0 flex items-center justify-center bg-black/40 overflow-hidden"
                  style={{ width: `${100 / track.length}%` }}
                >
                  {/* Subtle soft backdrop blur inside frame */}
                  <div 
                    className="absolute inset-0 bg-cover bg-center filter blur-lg opacity-40 scale-110 pointer-events-none"
                    style={{ backgroundImage: `url('${slide.url}')` }}
                  />
                  {/* Tack-sharp 100% full uncropped, unzoomed image */}
                  <img
                    src={slide.url}
                    alt={slide.caption || 'Peace at Peak Resort'}
                    className="relative z-10 w-full h-full object-contain"
                    style={{
                      imageRendering: 'high-quality',
                      filter: 'contrast(1.06) brightness(0.98) saturate(1.12)',
                    }}
                  />
                </div>
              ))}
            </div>

            {/* Slide Caption Pill (bottom-left) */}
            {activeSlide && (
              <div className="absolute bottom-2 left-2 z-20 px-2 py-0.5 rounded bg-black/70 backdrop-blur-md text-[0.62rem] text-white/95 font-medium tracking-wide border border-white/15 truncate max-w-[70%]">
                {activeSlide.caption || 'Peace at Peak Resort'}
              </div>
            )}

            {/* Slide Index Counter (bottom-right) */}
            {slides.length > 1 && (
              <div className="absolute bottom-2 right-2 z-20 px-2 py-0.5 rounded bg-black/70 backdrop-blur-md text-[0.6rem] text-accent-gold font-mono font-bold tracking-wider border border-white/15">
                {((currentIndex - 1 + slides.length) % slides.length) + 1} / {slides.length}
              </div>
            )}
          </div>
        </div>

        {/* -------------------------------------------------------------
            ZONE C: ACTION BUTTONS BELOW THE IMAGE
           ------------------------------------------------------------- */}
        <div className="relative z-10 flex flex-col gap-2.5 w-full max-w-sm mx-auto pt-1">
          <button 
            onClick={onBookClick}
            className="w-full btn btn-primary py-3.5 text-xs uppercase tracking-widest font-semibold shadow-xl active:scale-95"
            style={{ borderRadius: '4px' }}
          >
            Check Availability
          </button>
          
          <button 
            onClick={onExploreClick}
            className="w-full btn btn-secondary py-3.5 text-xs uppercase tracking-widest font-semibold border border-white/25 active:scale-95"
            style={{ borderRadius: '4px' }}
          >
            Explore Cottages
          </button>
        </div>

      </div>

    </section>
  );
}
