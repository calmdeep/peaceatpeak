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

  return (
    <section className="relative min-h-screen h-[100dvh] flex items-center justify-center overflow-hidden">
      {/* Infinite Hardware-Accelerated Sliding Track (Smooth Rightward Slide) */}
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
            className="hero-slide-container"
            style={{
              width: `${100 / track.length}%`,
            }}
          >
            {/* Desktop Screen Presentation (>= 768px): Cinematic Full-Bleed Cover */}
            <div
              className="hero-slide-desktop-cover"
              style={{
                backgroundImage: `url('${slide.url}')`,
                backgroundPosition: slide.position || 'center center',
              }}
            />

            {/* Mobile & Android Presentation (< 768px): Show 100% Full Image with Zero Zoom + Ambient Glow */}
            <div className="hero-slide-mobile-wrapper">
              {/* Atmospheric ambient glow backdrop matching the exact colors of the slide */}
              <div
                className="hero-slide-ambient-blur"
                style={{
                  backgroundImage: `url('${slide.url}')`,
                }}
              />
              {/* Tack-sharp full-width uncropped photo */}
              <div
                className="hero-slide-full-image"
                style={{
                  backgroundImage: `url('${slide.url}')`,
                  backgroundPosition: slide.position || 'center center',
                }}
              />
            </div>
          </div>
        ))}
      </div>
      
      {/* Dark Ambient Overlay */}
      <div className="gradient-overlay" style={{ zIndex: 2 }} />

      {/* Content */}
      <div className="container relative text-center px-4 flex flex-col items-center pt-20 sm:pt-24" style={{ zIndex: 10 }}>
        {/* Subtle Luxury Badge */}
        <div 
          className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-1 rounded-full mb-4 sm:mb-6 glass-panel-dark text-accent-gold border border-border-gold text-[0.62rem] sm:text-[0.65rem] uppercase tracking-widest font-medium animate-fade"
          style={{ letterSpacing: '0.22em' }}
        >
          <ShieldCheck size={12} className="text-accent-gold" /> Best Rate Guaranteed
        </div>

        {/* Display Serif Title */}
        <h1 
          className="text-white text-3xl sm:text-5xl md:text-7xl font-light mb-3 sm:mb-4 max-w-4xl tracking-wide leading-[1.15] sm:leading-[1.1] animate-fade"
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
          className="text-text-light-secondary text-sm sm:text-lg md:text-xl mb-6 sm:mb-8 max-w-2xl font-light leading-relaxed tracking-wide px-2"
          style={{ textShadow: '0 2px 10px rgba(5, 13, 9, 0.7)' }}
        >
          Discover silence, elegance, and pristine views of the Himalayan range. Experience private wooden cottages and luxury Swiss glamping at 8,500 feet.
        </p>

        {/* Action CTAs */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto mb-8 sm:mb-10">
          <button 
            onClick={onBookClick}
            className="btn btn-primary px-8 sm:px-10 py-3.5 sm:py-4 text-xs uppercase tracking-widest"
            style={{ borderRadius: '0px' }}
          >
            Check Availability
          </button>
          
          <button 
            onClick={onExploreClick}
            className="btn btn-secondary px-8 sm:px-10 py-3.5 sm:py-4 text-xs uppercase tracking-widest"
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

      {/* Floating Indicators */}
      <div className="absolute bottom-6 left-10 hidden xl:flex flex-col gap-1 text-[0.7rem] uppercase tracking-widest text-white/50 select-none" style={{ zIndex: 10 }}>
        <p>ELEVATION: <span className="text-accent-gold">8,500 FT</span></p>
        <p>LOCATION: <span className="text-white">KANATAL, IN</span></p>
      </div>

      <div className="absolute bottom-6 right-10 hidden xl:flex flex-col gap-1 text-[0.7rem] uppercase tracking-widest text-white/50 text-right select-none" style={{ zIndex: 10 }}>
        <p>HIMALAYAN VIEW: <span className="text-accent-gold">360° RANGE</span></p>
        <p>SERVICE: <span className="text-white">LUXURY COTTAGE</span></p>
      </div>
    </section>
  );
}
