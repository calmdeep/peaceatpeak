import React, { useState } from 'react';
import { Bed, Users, Square, Compass, Check, CalendarCheck, ChevronLeft, ChevronRight, XCircle } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

export { DEFAULT_ROOMS as ROOMS_DATA } from '../context/AppContext';

function RoomImageSlider({ images, name }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const safeImages = images && images.length > 0 ? images : ['/images/hut1.webp'];

  const handlePrev = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? safeImages.length - 1 : prev - 1));
  };

  const handleNext = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === safeImages.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="relative w-full h-full group/slider overflow-hidden">
      {/* Images container */}
      <div className="w-full h-full relative">
        {safeImages.map((img, idx) => (
          <img
            key={idx}
            src={img}
            alt={`${name} view ${idx + 1}`}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ease-in-out ${
              idx === currentIndex ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
          />
        ))}
      </div>

      {/* Navigation Arrows */}
      {safeImages.length > 1 && (
        <>
          <button
            onClick={handlePrev}
            className="slider-arrow left"
            aria-label="Previous image"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={handleNext}
            className="slider-arrow right"
            aria-label="Next image"
          >
            <ChevronRight size={18} />
          </button>

          {/* Slide Indicators */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
            {safeImages.map((_, idx) => (
              <span
                key={idx}
                className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                  idx === currentIndex ? 'bg-accent-gold w-4' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function Rooms({ onSelectRoom }) {
  const { rooms, getEffectivePrice, getRoomInventory } = useAppContext();

  return (
    <section className="py-24 bg-bg-light" id="rooms">
      <div className="container">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-20">
          <span className="luxury-heading-badge">OUR SANCTUARIES</span>
          <h2 
            className="text-4xl sm:text-5xl font-light text-primary-deep mt-3 mb-4"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Refined Living Spaces
          </h2>
          <div className="gold-divider" />
          <p className="text-text-dark-secondary text-sm leading-relaxed max-w-lg mx-auto">
            Choose between private wooden cottages and luxury Swiss glamping spots. Each designed to provide silence, warmth, and stunning mountain views.
          </p>
        </div>

        {/* Editorial Showcase */}
        <div className="space-y-24">
          {rooms.map((room, index) => {
            const isEven = index % 2 === 0;
            const inv = getRoomInventory ? getRoomInventory(room.id) : { totalUnits: 6, availableUnits: 6, occupiedUnits: 0 };
            const isAvailable = room.available !== false && inv.availableUnits > 0;
            return (
              <div 
                key={room.id} 
                className={`editorial-row ${isEven ? '' : 'reverse'}`}
              >
                {/* Visual Half */}
                <div 
                  className={`relative overflow-hidden rounded-md shadow-sm group ${
                    isEven ? 'lg:order-1' : 'lg:order-2'
                  }`}
                  style={{ border: '1px solid var(--border-light)' }}
                >
                  {/* Tag & Multi-unit Availability Badges */}
                  <div className="absolute top-4 left-4 z-10 flex flex-col gap-2 items-start">
                    {room.tag && (
                      <span 
                        className={`room-feature-tag tag-${room.tagColor || 'gold'}`}
                      >
                        ★ {room.tag}
                      </span>
                    )}
                    {!isAvailable ? (
                      <span className="room-status-badge status-soldout">
                        ● SOLD OUT
                      </span>
                    ) : inv.occupiedUnits > 0 ? (
                      <span className="room-status-badge status-partial">
                        ● {inv.availableUnits} OF {inv.totalUnits} AVAILABLE
                      </span>
                    ) : (
                      <span className="room-status-badge status-all-available">
                        ● ALL {inv.totalUnits} AVAILABLE
                      </span>
                    )}
                  </div>
                  
                  <div className="h-[280px] sm:h-[350px] md:h-[400px]">
                    <RoomImageSlider images={room.images} name={room.name} />
                  </div>
                </div>

                {/* Text Half */}
                <div 
                  className={`space-y-6 text-left ${
                    isEven ? 'lg:order-2' : 'lg:order-1'
                  }`}
                >
                  <div className="flex justify-between items-baseline border-b border-border-light pb-4">
                    <h3 
                      className="text-2xl sm:text-3xl font-light text-primary-deep"
                      style={{ fontFamily: 'var(--font-display)' }}
                    >
                      {room.name}
                    </h3>
                    <div className="text-right">
                      {room.discount > 0 ? (
                        <div>
                          <div className="flex items-center gap-2 justify-end">
                            <span className="text-text-dark-secondary/50 line-through text-sm font-semibold">
                              ₹{room.price?.toLocaleString()}
                            </span>
                            <span className="text-accent-gold text-2xl font-bold font-display">
                              ₹{getEffectivePrice(room).toLocaleString()}
                            </span>
                          </div>
                          {room.offer && (
                            <span className="room-offer-badge mt-1">
                              ⚡ {room.offer}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-accent-gold text-2xl font-bold font-display">₹{room.price?.toLocaleString()}</span>
                      )}
                      <span className="text-text-dark-secondary text-[0.65rem] uppercase tracking-wider block mt-0.5">/ Night + Tax</span>
                    </div>
                  </div>

                  <p className="text-primary-light text-sm italic font-medium">
                    "{room.tagline}"
                  </p>

                  <p className="text-text-dark-secondary text-sm leading-relaxed">
                    {room.description}
                  </p>

                  {/* Mixed Layout: Dot-Separated Specifications Line (Editorial Style) */}
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 py-3 border-t border-b border-border-light text-[0.7rem] uppercase tracking-widest text-primary-deep/80 font-medium">
                    <span>{room.size}</span>
                    <span className="text-accent-gold/40">•</span>
                    <span>{room.bed}</span>
                    <span className="text-accent-gold/40">•</span>
                    <span>{room.guests}</span>
                    <span className="text-accent-gold/40">•</span>
                    <span>{room.view}</span>
                  </div>

                  {/* Key Highlights */}
                  <div className="space-y-2.5 pt-1">
                    <h4 className="text-[0.65rem] uppercase tracking-widest text-text-dark-primary font-bold">Room Credentials</h4>
                    <div className="flex flex-wrap gap-2">
                      {room.amenities?.map((item, idx) => (
                        <span key={idx} className="room-tag">
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Action */}
                  <div className="pt-2 space-y-2">
                    {isAvailable && inv.occupiedUnits > 0 && (
                      <p className="text-[0.7rem] text-amber-800 font-semibold tracking-wider uppercase flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-amber-500 inline-block animate-pulse" />
                        High Demand: {inv.availableUnits} of {inv.totalUnits} {room.unitLabel || 'units'} available
                      </p>
                    )}
                    {isAvailable ? (
                      <button 
                        onClick={() => onSelectRoom(room.id)}
                        className="btn btn-primary px-8 py-3.5 text-xs uppercase tracking-widest flex items-center gap-2"
                        style={{ borderRadius: '0px' }}
                      >
                        <CalendarCheck size={14} /> RESERVE THIS SPACE
                      </button>
                    ) : (
                      <button 
                        disabled
                        className="btn px-8 py-3.5 text-xs uppercase tracking-widest flex items-center gap-2 bg-gray-400/30 text-gray-500 cursor-not-allowed border border-gray-400/20"
                        style={{ borderRadius: '0px' }}
                      >
                        <XCircle size={14} /> CURRENTLY SOLD OUT
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
