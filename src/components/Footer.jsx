import React from 'react';
import { Mail, Phone, MapPin, Clock, Facebook, Instagram, ShieldCheck } from 'lucide-react';

export default function Footer({ setActiveTab }) {
  const currentYear = new Date().getFullYear();

  const handleLinkClick = (tabId) => {
    setActiveTab(tabId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer
      className="bg-bg-dark text-white border-t border-border-gold/10 pt-20 pb-8"
      style={{
        background: 'linear-gradient(180deg, #050d09 0%, #020704 100%)'
      }}
    >
      <div className="container">
        <div className="grid grid-2 lg:grid-3 gap-12 mb-16">
          {/* Brand */}
          <div className="space-y-4 text-left">
            <h3
              className="font-light text-2xl tracking-widest font-display text-white"
              style={{ letterSpacing: '0.12em' }}
            >
              PEACE AT PEAK
            </h3>
            <p className="text-accent-gold text-[0.6rem] uppercase tracking-widest font-bold">RESORT & COTTAGES</p>

            <p className="text-text-light-secondary text-xs leading-relaxed max-w-sm">
              An elegant mountain hideaway along the Chamba-Mussoorie range, offering quiet stays, bonfire nights, and high-altitude Himalayan serenity.
            </p>

            <div className="flex items-center gap-3 pt-2">
              <a href="#" className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-text-light-secondary hover:text-accent-gold transition-all border border-white/10">
                <Facebook size={14} />
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-text-light-secondary hover:text-accent-gold transition-all border border-white/10">
                <Instagram size={14} />
              </a>
            </div>
          </div>

          {/* Links */}
          <div className="space-y-4 text-left">
            <p className="text-accent-gold text-[0.6rem] uppercase tracking-widest font-bold">NAVIGATION</p>
            <div className="grid grid-cols-2 gap-2 text-xs text-text-light-secondary">
              <button onClick={() => handleLinkClick('home')} className="text-left hover:text-white transition-colors py-1">
                Sanctuary Hub
              </button>
              <button onClick={() => handleLinkClick('rooms')} className="text-left hover:text-white transition-colors py-1">
                Accommodations
              </button>
              <button onClick={() => handleLinkClick('dining')} className="text-left hover:text-white transition-colors py-1">
                Dining & Lounge
              </button>
              <button onClick={() => handleLinkClick('nearby')} className="text-left hover:text-white transition-colors py-1">
                Explore Kanatal
              </button>
              <button onClick={() => handleLinkClick('booking')} className="text-left hover:text-white transition-colors py-1">
                Reservations
              </button>
            </div>

            <div className="pt-4 border-t border-white/5 flex items-center gap-2 text-[0.65rem] text-text-light-secondary">
              <Clock size={12} className="text-accent-gold shrink-0" />
              <span>Check-in: 12:00 PM | Check-out: 10:00 AM</span>
            </div>
          </div>

          {/* Contact */}
          <div className="space-y-4 text-left">
            <p className="text-accent-gold text-[0.6rem] uppercase tracking-widest font-bold">LOCALE & CONTACT</p>

            <div className="space-y-3 text-xs text-text-light-secondary">
              <p className="flex items-start gap-2.5">
                <MapPin size={14} className="text-accent-gold shrink-0 mt-0.5" />
                <span>Chopariyal Gaon, Churer Dhar, Kanatal, Tehri Garhwal, Uttarakhand, India - 249145</span>
              </p>

              <p className="flex items-center gap-2.5">
                <Phone size={14} className="text-accent-gold shrink-0" />
                <span>+91 99887 76655</span>
              </p>

              <p className="flex items-center gap-2.5">
                <Mail size={14} className="text-accent-gold shrink-0" />
                <span>info@peaceatpeakkanatal.com</span>
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-[0.65rem] text-text-light-secondary">
          <p>© {currentYear} Peace at Peak Kanatal. All rights reserved.</p>
          <div className="flex items-center gap-1.5">
          </div>
        </div>
      </div>
    </footer>
  );
}
