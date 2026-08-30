import React, { useState } from 'react';
import { Bed, Users, Square, Compass, Check, CalendarCheck, ChevronLeft, ChevronRight } from 'lucide-react';

export const ROOMS_DATA = [
  {
    id: 'private_cottage',
    name: 'COTTAGE WITH MOUNTAIN VIEW',
    image: '/images/hut1.webp',
    images: [
      '/images/hut1.webp',
      '/images/room_cottage_2.jpg',
      '/images/room_cottage_3.jpg'
    ],
    size: '224 sq. ft.',
    bed: '1 King Bed',
    guests: '2 Adults',
    view: 'Himalayan Mountain Range',
    price: 4500,
    tagline: 'Cozy and rustic charm, floating above the mountain mist.',
    description: 'Constructed from natural pine wood with a private glass window facing the snow-capped Himalayan peaks. Enjoy cozy fireplace evenings, fine organic bed linens, and a private balcony to sip hot local tea.',
    amenities: [
      'Private Wooden Balcony',
      'Electric Room Heater',
      'High-speed Wi-Fi',
      'Attached Luxury Bathroom',
      'Flat Screen TV & Kettle'
    ],
    tag: 'MOST POPULAR'
  },
  {
    id: 'swiss_tent',
    name: 'Swiss Tents',
    image: '/images/swiss1.avif',
    images: [
      '/images/swiss1.avif',
      '/images/room_tent_2.jpg',
      '/images/room_tent_3.jpg'
    ],
    size: '350 sq. ft.',
    bed: '1 Queen Bed',
    guests: '2 Adults',
    view: 'Misty Pine Forest',
    price: 3500,
    tagline: 'An immersive forest glamping experience under the stars.',
    description: 'Nestled between cedar trees, our Swiss Camps represent luxury in the wilderness. Features standard wooden flooring, attached western bathrooms with running hot water, and a cozy veranda looking directly into the pine valley.',
    amenities: [
      'Forest View veranda',
      'Cozy Wooden Furniture',
      'High-speed Wi-Fi',
      'Attached Western Bathroom',
      'Bonfire & Music Access'
    ],
    tag: 'NATURE CAMP'
  },
  {
    id: 'family_tent',
    name: 'Family Tents',
    image: '/images/room_family.jpg',
    images: [
      '/images/room_family.jpg',
      '/images/room_family_2.jpg',
      '/images/room_family_3.jpg'
    ],
    size: '450 sq. ft.',
    bed: '2 Double Beds',
    guests: '4 Adults',
    view: 'Valley & Pine Forest',
    price: 6000,
    tagline: 'Generous spaces designed for family reunions and groups.',
    description: 'A spacious dual-bed wooden cottage layout featuring a large private patio and comfortable seating arrangements. Perfect for families looking to experience the quiet mountain air together without compromising on comfort.',
    amenities: [
      'Large Private Wooden Patio',
      'Sitting Area with Fireplace',
      'High-speed Wi-Fi',
      'Attached Family Bathroom',
      'Room Heaters on Request'
    ],
    tag: 'FAMILY COZY'
  }
];

function RoomImageSlider({ images, name }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handlePrev = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="relative w-full h-full group/slider overflow-hidden">
      {/* Images container */}
      <div className="w-full h-full relative">
        {images.map((img, idx) => (
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
        {images.map((_, idx) => (
          <span
            key={idx}
            className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
              idx === currentIndex ? 'bg-accent-gold w-4' : 'bg-white/50'
            }`}
          />
        ))}
      </div>
    </div>
  );
}

export default function Rooms({ onSelectRoom }) {
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
          {ROOMS_DATA.map((room, index) => {
            const isEven = index % 2 === 0;
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
                  {/* Tag */}
                  {room.tag && (
                    <span 
                      className="absolute top-4 left-4 bg-bg-dark text-accent-gold text-[0.55rem] tracking-widest font-semibold py-1.5 px-3 rounded-sm border border-border-gold z-10"
                    >
                      {room.tag}
                    </span>
                  )}
                  
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
                      <span className="text-accent-gold text-2xl font-bold font-display">₹{room.price}</span>
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
                      {room.amenities.map((item, idx) => (
                        <span key={idx} className="room-tag">
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Action */}
                  <div className="pt-2">
                    <button 
                      onClick={() => onSelectRoom(room.id)}
                      className="btn btn-primary px-8 py-3.5 text-xs uppercase tracking-widest flex items-center gap-2"
                      style={{ borderRadius: '0px' }}
                    >
                      <CalendarCheck size={14} /> RESERVE THIS SPACE
                    </button>
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
