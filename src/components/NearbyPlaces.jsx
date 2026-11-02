import React, { useState } from 'react';
import { Search, Compass, MapPin, Clock, Sparkles, X, Moon } from 'lucide-react';

const NEARBY_PLACES_DATA = [
  {
    id: 'surkanda_temple',
    name: 'Surkanda Devi Temple',
    image: '/images/surkanda_temple.jpg',
    category: 'Spiritual',
    distance: '10 km from resort',
    duration: '25 mins drive + 1.5 km trek',
    description: 'Dedicated to Goddess Sati, this historic shrine sits at an altitude of 10,000 feet atop Kaddukhal ridge, offering panoramic 360-degree views of the snow-clad Himalayan peaks.',
    tips: 'Best for: Scenic trekking, sunrise photography, spiritual retreat.'
  },
  {
    id: 'kodia_jungle',
    name: 'Kodia Jungle Path',
    image: '/images/kodia_forest.jpg',
    category: 'Nature',
    distance: '1.5 km from resort',
    duration: '5 mins drive or walk',
    description: 'A serene evergreen forest trail filled with natural mountain springs, deodar canopies, and vibrant bird species. Jeep safaris and peaceful forest walks are available.',
    tips: 'Best for: Forest walks, bird watching, peaceful picnics.'
  },
  {
    id: 'tehri_lake',
    name: 'Tehri Lake & Dam',
    image: '/images/tehri_lake.jpg',
    category: 'Adventure',
    distance: '35 km from resort',
    duration: '1 hour scenic drive',
    description: 'A massive turquoise reservoir surrounded by rolling green Garhwal hills. Experience high-thrill adventure sports like paragliding, jet-skiing, speed boating, and floating lake docks.',
    tips: 'Best for: Paragliding, jet-skiing, boat safaris, water sports.',
    imagePosition: 'center 40%'
  },
  {
    id: 'dobra_chanti',
    name: 'Dobra Chanti Bridge',
    image: '/images/dobra.webp',
    category: 'Adventure',
    distance: '42 km from resort',
    duration: '1 hr 15 mins scenic drive',
    description: "India's longest motorable single-lane suspension bridge spanning Tehri Lake. At night, it comes alive with a dazzling spectacle of multi-color LED architectural lights glowing across the dark waters.",
    tips: 'Best for: Night illumination, vibrant photography, lake drives.'
  },
  {
    id: 'dhanaulti',
    name: 'Dhanaulti Eco-Parks',
    image: '/images/dhanaulti_ecopark.jpg',
    category: 'Nature',
    distance: '15 km from resort',
    duration: '30 mins drive',
    description: 'Featuring the lush Amber and Dhara eco-parks. Stroll through mist-covered deodar forest trails, wooden walking bridges, and peaceful meadows surrounded by cedar trees.',
    tips: 'Best for: Pine forest trails, misty walks, family leisure.'
  },
  {
    id: 'chamba',
    name: 'Chamba Hamlet',
    image: '/images/chamba_hamlet.jpg',
    category: 'Spiritual',
    distance: '16 km from resort',
    duration: '30 mins drive',
    description: 'A scenic traditional mountain hamlet overlooking the terraced Bhagirathi valley and pine ridges. Known for historic stone shrines and authentic Garhwali mountain culture.',
    tips: 'Best for: Terraced valley views, Pahadi food, stone temples.'
  }
];

export default function NearbyPlaces() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const categories = ['All', 'Spiritual', 'Nature', 'Adventure'];

  const filteredPlaces = NEARBY_PLACES_DATA.filter(place => {
    const matchesSearch = place.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      place.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      place.tips.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = activeCategory === 'All' || place.category === activeCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <section className="py-20 sm:py-24 bg-bg-light" id="nearby">
      <div className="container">
        {/* Header - Centered & Balanced */}
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <span className="luxury-heading-badge">EXPLORATIONS</span>
          <h2
            className="text-4xl sm:text-5xl font-light text-primary-deep mt-3 mb-4 tracking-wide"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Sightseeing Near Kanatal
          </h2>
          <div className="gold-divider" />
          <p className="text-text-dark-secondary text-sm leading-relaxed max-w-lg mx-auto">
            From historic 10,000-ft mountain shrines to ancient deodar walking forests, illuminated night bridges, and turquoise adventure dams, explore authentic local attractions minutes from Peace at Peak.
          </p>
        </div>

        {/* Search & Filter Bar - Perfectly Aligned */}
        <div className="max-w-4xl mx-auto mb-12">
          <div className="bg-white p-3 sm:p-4 rounded-2xl border border-border-gold/30 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            {/* Search Input Box */}
            <div className="relative flex-grow">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-dark-secondary" size={17} />
              <input
                type="text"
                placeholder="Search attractions (e.g. dobra chanti, temple, lake, trek, forest)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-9 py-2.5 bg-bg-light/70 rounded-xl border border-border-light focus:border-accent-gold transition-all text-xs font-medium text-primary-deep placeholder:text-text-dark-secondary/60"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-dark-secondary hover:text-primary-deep"
                  aria-label="Clear search"
                >
                  <X size={15} />
                </button>
              )}
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-2 text-xs font-semibold tracking-wider uppercase rounded-xl transition-all ${activeCategory === cat
                      ? 'bg-primary-deep text-white shadow-sm'
                      : 'bg-bg-light/80 text-text-dark-secondary hover:text-primary-deep border border-border-light'
                    }`}
                  style={{
                    fontFamily: 'var(--font-display)',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Results Counter Sub-bar */}
          <div className="flex items-center justify-between px-2 pt-3 text-[0.7rem] uppercase tracking-wider text-text-dark-secondary">
            <span>
              Showing <strong className="text-primary-deep">{filteredPlaces.length}</strong> of {NEARBY_PLACES_DATA.length} attractions
            </span>
            {(searchTerm || activeCategory !== 'All') && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  setActiveCategory('All');
                }}
                className="text-accent-gold hover:underline font-semibold"
              >
                Reset Filters
              </button>
            )}
          </div>
        </div>

        {/* Places Grid - Symmetrical 3x2 Grid & Equal Card Heights */}
        {filteredPlaces.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
            {filteredPlaces.map((place) => (
              <div
                key={place.id}
                className="luxury-card flex flex-col h-full bg-white rounded-2xl overflow-hidden border border-border-gold/30 shadow-sm hover:shadow-lg transition-all duration-300"
              >
                {/* Image Visual with Standardized Fixed Height & Rich Overlay */}
                <div className="relative h-64 w-full overflow-hidden bg-slate-900 shrink-0">
                  <img
                    src={place.image}
                    alt={place.name}
                    className="w-full h-full object-cover transition-transform duration-700 ease-out hover:scale-105"
                    style={{ objectPosition: place.imagePosition || 'center center' }}
                    loading="lazy"
                  />
                  {/* Luxury Vignette Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent pointer-events-none" />

                  {/* Top Badges */}
                  <div className="absolute top-3.5 left-4 z-10 flex items-center gap-2">
                    <span className="bg-accent-gold text-primary-deep text-[0.62rem] tracking-widest font-bold py-1 px-2.5 uppercase rounded shadow-sm">
                      {place.category}
                    </span>
                    {place.id === 'dobra_chanti' && (
                      <span className="bg-indigo-600/90 text-white text-[0.6rem] tracking-wider font-semibold py-1 px-2 uppercase rounded backdrop-blur-sm flex items-center gap-1 shadow-sm">
                        <Moon size={10} /> Night View
                      </span>
                    )}
                  </div>

                  {/* Bottom Image Details Sitting on Image Horizon */}
                  <div className="absolute bottom-3.5 left-4 right-4 z-10 flex justify-between items-center">
                    <span className="text-white text-xs font-medium tracking-wide flex items-center gap-1.5 drop-shadow-md bg-black/45 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
                      <MapPin size={13} className="text-accent-gold shrink-0" />
                      {place.distance}
                    </span>
                  </div>
                </div>

                {/* Card Content - Flex column with aligned bottom info */}
                <div className="p-6 flex flex-col flex-1 justify-between gap-4">
                  {/* Top: Title & Description */}
                  <div>
                    <h3
                      className="text-2xl font-light text-primary-deep font-display leading-tight mb-2.5"
                    >
                      {place.name}
                    </h3>

                    <p className="text-text-dark-secondary text-xs leading-relaxed">
                      {place.description}
                    </p>
                  </div>

                  {/* Bottom: Travel Time & Best For (Pinned to bottom for equal alignment across all cards) */}
                  <div className="mt-auto pt-2">
                    <div className="bg-bg-light p-3.5 rounded-xl border border-border-light space-y-2 text-[0.7rem] text-text-dark-secondary">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-primary-deep uppercase tracking-wider flex items-center gap-1.5 text-[0.65rem]">
                          <Clock size={12} className="text-accent-gold shrink-0" /> Travel Time
                        </span>
                        <span className="font-medium text-primary-deep text-right">
                          {place.duration}
                        </span>
                      </div>
                      <div className="border-t border-border-light/80 pt-2 flex items-start gap-1.5 text-primary-light italic text-[0.68rem] leading-snug">
                        <Sparkles size={12} className="text-accent-gold shrink-0 mt-0.5" />
                        <span>{place.tips}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-2xl border border-border-light max-w-md mx-auto shadow-sm">
            <Compass size={44} className="text-accent-gold mx-auto mb-3 opacity-60" />
            <p className="text-primary-deep font-light text-2xl font-display mb-1">No Attractions Found</p>
            <p className="text-text-dark-secondary text-xs max-w-xs mx-auto mb-4">
              We couldn't find any attractions matching "{searchTerm}". Try another keyword or reset the filter.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchTerm('');
                setActiveCategory('All');
              }}
              className="btn btn-primary px-6 py-2 text-xs uppercase tracking-widest inline-flex items-center gap-1.5"
            >
              Reset Search
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
