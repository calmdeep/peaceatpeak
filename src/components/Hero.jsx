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

  const activeIndex = slides.length > 0 ? (currentIndex - 1 + slides.length) % slides.length : 0;

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
             - Harmonious centered luxury flow with perfect balanced spacing
             - ZONE A: High-visibility badge, title, and crisp off-white subtitle
             - ZONE B: Crisp 16:10 photo card with subtle gold border & shadow (NO overlay)
             - ZONE C: High-visibility Gold Primary & Frosted Secondary buttons
         ========================================================================= */}
      <div className="hero-mobile-wrapper">
        
        {/* -------------------------------------------------------------
            ZONE A: TEXT ABOVE THE IMAGE (High Visibility & Perfect Spacing)
           ------------------------------------------------------------- */}
        <div className="flex flex-col items-center text-center space-y-1.5 w-full max-w-[380px] mx-auto">
          {/* Subtle Luxury Badge */}
          <div 
            className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-[0.62rem] uppercase font-semibold"
            style={{
              color: '#f3d375',
              border: '1px solid rgba(243, 211, 117, 0.45)',
              background: 'rgba(243, 211, 117, 0.1)',
              letterSpacing: '0.2em',
              textShadow: '0 1px 2px rgba(0,0,0,0.6)'
            }}
          >
            <ShieldCheck size={12} color="#f3d375" /> Best Rate Guaranteed
          </div>

          {/* Main Title */}
          <h1 
            className="text-white text-2xl sm:text-3xl font-light tracking-wide leading-tight mt-1"
            style={{ fontFamily: 'var(--font-display)', textShadow: '0 2px 10px rgba(0,0,0,0.8)' }}
          >
            The Sanctuary at <span className="italic font-normal" style={{ color: '#f3d375' }}>Peace at Peak</span>
          </h1>

          {/* Gold Divider */}
          <div 
            className="my-1"
            style={{
              width: '40px',
              height: '1px',
              background: 'linear-gradient(90deg, transparent, #f3d375, transparent)'
            }}
          />

          {/* Description (Crisp Off-White Slate-200 with High Contrast) */}
          <p 
            className="font-light leading-relaxed max-w-[340px] mx-auto px-1"
            style={{ 
              color: '#f1f5f9', 
              fontSize: '0.8rem',
              textShadow: '0 1px 4px rgba(0,0,0,0.95)'
            }}
          >
            Discover silence, elegance, and pristine views of the Himalayan range at 8,500 feet.
          </p>
        </div>

        {/* -------------------------------------------------------------
            ZONE B: THE FULL UNZOOMED IMAGE STAGE (NO OVERLAPS)
           ------------------------------------------------------------- */}
        <div className="w-full max-w-[380px] mx-auto">
          {/* Main Photo Frame */}
          <div className="hero-mobile-stage">
            {/* Smooth 2s Sliding Track for Mobile Stage */}
            <div
              className="absolute inset-0 flex h-full"
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
                  className="relative h-full overflow-hidden"
                  style={{ 
                    flex: `0 0 ${100 / track.length}%`,
                    width: `${100 / track.length}%`,
                    maxWidth: `${100 / track.length}%`
                  }}
                >
                  <img
                    src={slide.url}
                    alt={slide.caption || 'Peace at Peak Resort'}
                    className="w-full h-full object-cover"
                    style={{
                      imageRendering: 'high-quality',
                      filter: 'contrast(1.06) brightness(0.98) saturate(1.1)',
                    }}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Minimalist Luxury Pagination Dots (Below Image) */}
          {slides.length > 1 && (
            <div className="flex items-center justify-center gap-1.5 mt-2.5">
              {slides.map((_, i) => (
                <span
                  key={i}
                  className="h-1 rounded-full transition-all duration-300"
                  style={{
                    width: i === activeIndex ? '20px' : '6px',
                    backgroundColor: i === activeIndex ? '#f3d375' : 'rgba(255, 255, 255, 0.35)',
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* -------------------------------------------------------------
            ZONE C: ACTION BUTTONS BELOW THE IMAGE (High Visibility & Perfect Spacing)
           ------------------------------------------------------------- */}
        <div className="hero-mobile-actions">
          <button 
            type="button"
            onClick={onBookClick}
            className="hero-mobile-btn-primary"
            style={{ marginBottom: '0.75rem' }}
          >
            <Calendar size={15} /> CHECK AVAILABILITY
          </button>
          
          <button 
            type="button"
            onClick={onExploreClick}
            className="hero-mobile-btn-secondary"
          >
            EXPLORE COTTAGES
          </button>
        </div>

      </div>

    </section>
  );
}
