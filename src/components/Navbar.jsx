import React, { useState, useEffect } from 'react';
import { Menu, X, Compass, Calendar, Home, Bed, Utensils } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { id: 'home', label: 'THE SANCTUARY', icon: Home },
    { id: 'rooms', label: 'ACCOMMODATIONS', icon: Bed },
    { id: 'dining', label: 'DINING & LOUNGE', icon: Utensils },
    { id: 'nearby', label: 'EXPLORE KANATAL', icon: Compass },
    { id: 'booking', label: 'RESERVATIONS', icon: Calendar },
  ];

  const handleNavClick = (tabId) => {
    setActiveTab(tabId);
    setIsOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isLightBg = activeTab !== 'home' && !isScrolled;

  return (
    <nav 
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${
        isScrolled 
          ? 'bg-bg-dark/95 backdrop-blur-md shadow-md border-b border-white/5' 
          : isLightBg
            ? 'navbar-light-bg'
            : 'bg-transparent'
      }`}
      style={{
        paddingTop: isScrolled ? 'calc(1.1rem + env(safe-area-inset-top, 0px))' : 'calc(1.8rem + env(safe-area-inset-top, 0px))',
        paddingBottom: isScrolled ? '1.1rem' : '1.8rem',
      }}
    >
      <div className="container flex justify-between items-center">
        {/* Logo */}
        <div 
          onClick={() => handleNavClick('home')}
          className="flex flex-col cursor-pointer group select-none"
        >
          <h1 
            className={`text-xl sm:text-2xl font-light tracking-widest leading-none mb-1 text-center transition-colors duration-300 ${
              isLightBg ? 'text-primary-deep' : 'text-white'
            }`}
            style={{ 
              fontFamily: 'var(--font-display)',
              letterSpacing: '0.18em'
            }}
          >
            PEACE AT PEAK
          </h1>
          <div className="flex items-center justify-between w-full">
            <span className={`h-[0.5px] flex-grow transition-colors duration-300 ${
              isLightBg ? 'bg-primary-deep/20' : 'bg-accent-gold/40'
            }`} />
            <p 
              className={`font-light tracking-widest text-center px-2 transition-colors duration-300 ${
                isLightBg ? 'text-primary-deep/80' : 'text-accent-gold'
              }`}
              style={{ 
                fontSize: '0.55rem',
                letterSpacing: '0.3em'
              }}
            >
              KANATAL
            </p>
            <span className={`h-[0.5px] flex-grow transition-colors duration-300 ${
              isLightBg ? 'bg-primary-deep/20' : 'bg-accent-gold/40'
            }`} />
          </div>
        </div>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-10">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`font-body text-[0.75rem] tracking-widest font-medium transition-all relative py-1.5 ${
                  isActive 
                    ? 'text-accent-gold' 
                    : isLightBg
                      ? 'text-primary-deep/70 hover:text-primary-deep'
                      : 'text-white/70 hover:text-white'
                }`}
              >
                {item.label}
                {isActive && (
                  <span 
                    className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-[1px] bg-accent-gold"
                  />
                )}
              </button>
            );
          })}
          
          <button 
            onClick={() => handleNavClick('booking')}
            className="btn btn-primary"
            style={{ 
              padding: '0.65rem 1.6rem', 
              fontSize: '0.75rem',
              letterSpacing: '0.15em',
              borderRadius: '0px'
            }}
          >
            RESERVE
          </button>
        </div>

        {/* Mobile Menu Icon */}
        <div className="md:hidden flex items-center gap-4">
          <button 
            onClick={() => handleNavClick('booking')}
            className="btn btn-primary"
            style={{ 
              padding: '0.5rem 1.1rem', 
              fontSize: '0.7rem',
              letterSpacing: '0.1em',
              borderRadius: '0px'
            }}
          >
            BOOK
          </button>
          
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`transition-colors focus:outline-none p-1 ${
              isLightBg ? 'text-primary-deep hover:text-accent-gold' : 'text-white hover:text-accent-gold'
            }`}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer (Luxury Editorial Overlay) */}
      <div 
        className={`fixed top-0 left-0 w-full h-screen bg-bg-dark transition-all duration-500 z-40 md:hidden flex flex-col justify-center items-center ${
          isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'
        }`}
        style={{
          background: 'radial-gradient(circle at center, #0c1f15 0%, #050d09 100%)'
        }}
      >
        <button
          onClick={() => setIsOpen(false)}
          className="absolute top-6 right-6 text-white/80 hover:text-white"
        >
          <X size={26} />
        </button>

        <div className="flex flex-col gap-6 text-center w-full max-w-xs px-6">
          <div className="mb-8">
            <span className="text-3xl block mb-2 opacity-80">🏔️</span>
            <h2 
              className="text-white text-2xl tracking-widest font-light"
              style={{ fontFamily: 'var(--font-display)', letterSpacing: '0.15em' }}
            >
              PEACE AT PEAK
            </h2>
            <p className="text-accent-gold text-[0.6rem] tracking-widest uppercase mt-1">HIMALAYAN RETREAT</p>
          </div>

          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`py-3 text-sm font-body font-medium tracking-widest transition-all ${
                  isActive 
                    ? 'text-accent-gold border-b border-accent-gold/20' 
                    : 'text-white/60 hover:text-white'
                }`}
              >
                {item.label}
              </button>
            );
          })}

          <button 
            onClick={() => handleNavClick('booking')}
            className="btn btn-primary w-full py-4 text-xs tracking-widest mt-6"
            style={{ borderRadius: '0px' }}
          >
            CHECK AVAILABILITY
          </button>
        </div>
      </div>
    </nav>
  );
}
