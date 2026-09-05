import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, X, Maximize2 } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

export default function DiningAndReception() {
  const { propertySpaces } = useAppContext();
  const [selectedImageIndex, setSelectedImageIndex] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'dining' | 'lounge'

  // Gather all provided authentic images from propertySpaces
  const diningSpace = (propertySpaces || []).find(s => s.id === 'dining_hall');
  const loungeSpace = (propertySpaces || []).find(s => s.id === 'reception_lounge');

  // Defined list of photos with clean, minimal labels
  const rawPhotos = [
    {
      src: '/images/dining_hall_buffet.jpg',
      title: 'Mountain Dining Hall & Buffet',
      category: 'dining'
    },
    {
      src: '/images/dining_hall_interior.jpg',
      title: 'Dining Pavilion Interior & Banquet',
      category: 'dining'
    },
    {
      src: '/images/reception_lounge_sunset.jpg',
      title: 'Sunset Lounge & Reception Area',
      category: 'lounge'
    },
    {
      src: '/images/dining_reception_exterior.jpg',
      title: 'Wooden Pavilion Exterior & Entrance',
      category: 'dining'
    }
  ];

  // Also include any extra custom photos uploaded by the admin from propertySpaces (ignoring any AI photo)
  const extraDiningImages = (diningSpace?.images || []).filter(
    url => !url.includes('dining_hall_main') && !rawPhotos.some(p => p.src === url)
  ).map(url => ({
    src: url,
    title: 'Dining Hall Space',
    category: 'dining'
  }));

  const extraLoungeImages = (loungeSpace?.images || []).filter(
    url => !url.includes('dining_hall_main') && !rawPhotos.some(p => p.src === url)
  ).map(url => ({
    src: url,
    title: 'Sunset Lounge Space',
    category: 'lounge'
  }));

  const allPhotos = [...rawPhotos, ...extraDiningImages, ...extraLoungeImages];

  const filteredPhotos = activeFilter === 'all'
    ? allPhotos
    : allPhotos.filter(p => p.category === activeFilter);

  const openLightbox = (index) => {
    setSelectedImageIndex(index);
  };

  const closeLightbox = () => {
    setSelectedImageIndex(null);
  };

  const handlePrev = (e) => {
    e.stopPropagation();
    setSelectedImageIndex(prev => (prev === 0 ? filteredPhotos.length - 1 : prev - 1));
  };

  const handleNext = (e) => {
    e.stopPropagation();
    setSelectedImageIndex(prev => (prev === filteredPhotos.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="py-16 sm:py-20 bg-bg-light min-h-[80vh]">
      <div className="container max-w-6xl">

        {/* Minimal, Elegant Header */}
        <div className="text-center mb-10">
          <span className="luxury-heading-badge">GALLERY</span>
          <h1
            className="text-3xl sm:text-4xl lg:text-5xl font-light text-primary-deep mt-2 mb-3 tracking-wide"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Dining & Lounge
          </h1>
          <div className="gold-divider mb-6" />

          {/* Clean Category Filter */}
          <div className="flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => setActiveFilter('all')}
              className={`px-5 py-1.5 text-xs uppercase tracking-widest transition-all ${activeFilter === 'all'
                  ? 'bg-primary-deep text-white shadow-sm'
                  : 'bg-white text-text-dark-secondary hover:text-primary-deep border border-border-light'
                }`}
            >
              All Photos ({allPhotos.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter('dining')}
              className={`px-5 py-1.5 text-xs uppercase tracking-widest transition-all ${activeFilter === 'dining'
                  ? 'bg-primary-deep text-white shadow-sm'
                  : 'bg-white text-text-dark-secondary hover:text-primary-deep border border-border-light'
                }`}
            >
              Dining Hall
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter('lounge')}
              className={`px-5 py-1.5 text-xs uppercase tracking-widest transition-all ${activeFilter === 'lounge'
                  ? 'bg-primary-deep text-white shadow-sm'
                  : 'bg-white text-text-dark-secondary hover:text-primary-deep border border-border-light'
                }`}
            >
              Sunset Lounge
            </button>
          </div>
        </div>

        {/* Visual Photos Showcase Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {filteredPhotos.map((photo, index) => (
            <div
              key={index}
              onClick={() => openLightbox(index)}
              className="group relative cursor-pointer overflow-hidden rounded-xl bg-black shadow-md transition-all duration-300 hover:shadow-xl aspect-[16/10]"
            >
              <img
                src={photo.src}
                alt={photo.title}
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />

              {/* Subtle hover overlay with expand icon and minimal title */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-5">
                <div className="flex justify-end">
                  <span className="w-9 h-9 rounded-full bg-black/40 backdrop-blur-md text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Maximize2 size={16} />
                  </span>
                </div>
                <div>
                  <p className="text-white text-base sm:text-lg font-light tracking-wide drop-shadow" style={{ fontFamily: 'var(--font-display)' }}>
                    {photo.title}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Fullscreen Lightbox Modal */}
      {selectedImageIndex !== null && filteredPhotos[selectedImageIndex] && (
        <div
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4 sm:p-8"
          onClick={closeLightbox}
        >
          {/* Close Button */}
          <button
            onClick={closeLightbox}
            className="absolute top-5 right-5 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-2.5 rounded-full transition-all z-50"
            aria-label="Close fullscreen"
          >
            <X size={24} />
          </button>

          {/* Left Arrow */}
          {filteredPhotos.length > 1 && (
            <button
              onClick={handlePrev}
              className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 text-white bg-black/50 hover:bg-black/80 border border-white/20 p-3 rounded-full transition-all z-50"
              aria-label="Previous image"
            >
              <ChevronLeft size={24} />
            </button>
          )}

          {/* Active Image */}
          <div
            className="max-w-5xl max-h-[85vh] flex flex-col items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={filteredPhotos[selectedImageIndex].src}
              alt={filteredPhotos[selectedImageIndex].title}
              className="max-w-full max-h-[75vh] object-contain rounded-lg shadow-2xl"
            />
            <div className="mt-4 text-center">
              <p className="text-white text-lg font-light tracking-wider" style={{ fontFamily: 'var(--font-display)' }}>
                {filteredPhotos[selectedImageIndex].title}
              </p>
              <p className="text-accent-gold text-xs tracking-widest mt-1">
                {selectedImageIndex + 1} / {filteredPhotos.length}
              </p>
            </div>
          </div>

          {/* Right Arrow */}
          {filteredPhotos.length > 1 && (
            <button
              onClick={handleNext}
              className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 text-white bg-black/50 hover:bg-black/80 border border-white/20 p-3 rounded-full transition-all z-50"
              aria-label="Next image"
            >
              <ChevronRight size={24} />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
