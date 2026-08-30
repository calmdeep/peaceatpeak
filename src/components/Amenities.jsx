import React from 'react';
import { UtensilsCrossed, Flame, Footprints, Wifi, Car, Gamepad2, HeartHandshake, Zap } from 'lucide-react';

const AMENITIES_DATA = [
  {
    icon: UtensilsCrossed,
    title: 'Multi-Cuisine Dining',
    description: 'Fresh local Pahadi dishes and organic Indian specialties cooked to order.'
  },
  {
    icon: Flame,
    title: 'Misty Bonfires',
    description: 'Evenings centered around burning pine logs, quiet acoustic tunes, and mountain stars.'
  },
  {
    icon: Footprints,
    title: 'Guided Hikes',
    description: 'Hike through Kodia jungle or trek up to the peaks of Surkanda Devi with locals.'
  },
  {
    icon: Wifi,
    title: 'Premium Wi-Fi',
    description: 'High-speed internet available resort-wide so you can work from the mountains.'
  },
  {
    icon: Car,
    title: 'Secure Parking',
    description: 'Spacious and protected parking facilities for your cars and touring SUVs.'
  },
  {
    icon: Gamepad2,
    title: 'Indoor Activities',
    description: 'Chess, board games, and relaxing card matches in our cozy common room.'
  },
  {
    icon: HeartHandshake,
    title: 'Luggage Care',
    description: 'Warm and friendly caretakers to assist with luggage, queries, and arrangements.'
  },
  {
    icon: Zap,
    title: 'Power Backups',
    description: 'Full capacity backup units so your electrical devices and heaters run smoothly.'
  }
];

export default function Amenities() {
  return (
    <section className="py-24 bg-primary-deep text-white relative overflow-hidden" id="amenities">
      <div className="container relative z-10">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-20">
          <span className="luxury-heading-badge text-accent-gold">RESORT LIFE</span>
          <h2 
            className="text-4xl sm:text-5xl font-light mt-3 mb-4 text-white"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Amenities & Comforts
          </h2>
          <div className="gold-divider" />
          <p className="text-text-light-secondary text-sm leading-relaxed max-w-lg mx-auto">
            We integrate modern conveniences with mountain heights. Experience comfort in the wilderness at our Kanatal getaway.
          </p>
        </div>

        {/* Minimal grid with horizontal icon alignment */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-3 gap-8">
          {AMENITIES_DATA.map((item, index) => {
            const Icon = item.icon;
            return (
              <div 
                key={index} 
                className="flex items-start gap-4 p-5 rounded-lg transition-all duration-300"
                style={{
                  background: 'rgba(55, 70, 61, 0.25)',
                  border: '1px solid rgba(255, 255, 255, 0.03)'
                }}
              >
                {/* Mixed icon position: left circle */}
                <div 
                  className="w-10 h-10 flex items-center justify-center text-accent-gold border border-accent-gold/20 rounded-full shrink-0 mt-0.5"
                  style={{ background: 'rgba(195, 161, 117, 0.08)' }}
                >
                  <Icon size={16} />
                </div>
                <div className="space-y-1 text-left">
                  <h3 className="text-lg font-light font-display text-white">{item.title}</h3>
                  <p className="text-text-light-secondary text-xs leading-relaxed">{item.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
