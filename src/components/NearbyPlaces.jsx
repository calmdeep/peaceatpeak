import React, { useState } from 'react';
import { Search, Compass, MapPin, Tag } from 'lucide-react';

const NEARBY_PLACES_DATA = [
  {
    id: 'surkanda_temple',
    name: 'Surkanda Devi Temple',
    image: '/images/Surkanda-Devi-Temple-22-1024x718.webp',
    category: 'Spiritual',
    distance: '10 km from resort',
    duration: '25 mins drive + 1.5 km trek',
    description: 'Dedicated to Goddess Sati, this historic shrine sits at an altitude of 10,000 feet, offering panoramic 360-degree views of the higher Himalayan range.',
    tips: 'Best for: Scenic trekking, photography, spiritual retreat.'
  },
  {
    id: 'kodia_jungle',
    name: 'Kodia Jungle Path',
    image: '/images/place_jungle.jpg',
    category: 'Nature',
    distance: '1.5 km from resort',
    duration: '5 mins drive or walk',
    description: 'A quiet forest sanctuary filled with natural water springs, tall cedar trees, and local birds. Jeep safaris are available to explore the wildlife.',
    tips: 'Best for: Forest walks, bird watching, picnics.'
  },
  {
    id: 'tehri_lake',
    name: 'Tehri Lake & Dam',
    image: '/images/place_lake.jpg',
    category: 'Adventure',
    distance: '35 km from resort',
    duration: '1 hour drive',
    description: 'A massive turquoise reservoir surrounded by rolling green hills. Experience high-thrill water activities like jet-skiing, boating, and parasailing.',
    tips: 'Best for: Jet-skiing, boat safaris, valley sightseeing.'
  },
  {
    id: 'dhanaulti',
    name: 'Dhanaulti Eco-Parks',
    image: '/images/place_jungle.jpg',
    category: 'Nature',
    distance: '15 km from resort',
    duration: '30 mins drive',
    description: 'Featuring Amber and Dhara eco-parks. Thick pine and deodar walks, children playground spaces, and quiet, relaxing meadows to sit in the shade.',
    tips: 'Best for: Forest walk paths, relaxing, families.'
  },
  {
    id: 'chamba',
    name: 'Chamba Hamlet',
    image: '/images/hero_background.jpg',
    category: 'Spiritual',
    distance: '16 km from resort',
    duration: '30 mins drive',
    description: 'A quiet, traditional mountain village overlooking the Bhagirathi River. Known for historic local temples and slow-paced local village lifestyle.',
    tips: 'Best for: Pahadi food, stone temples, local crafts.'
  }
];

export default function NearbyPlaces() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const categories = ['All', 'Spiritual', 'Nature', 'Adventure'];

  const filteredPlaces = NEARBY_PLACES_DATA.filter(place => {
    const matchesSearch = place.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      place.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = activeCategory === 'All' || place.category === activeCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <section className="py-24 bg-bg-light" id="nearby">
      <div className="container">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="luxury-heading-badge">EXPLORATIONS</span>
          <h2
            className="text-4xl sm:text-5xl font-light text-primary-deep mt-3 mb-4"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Sightseeing Near Kanatal
          </h2>
          <div className="gold-divider" />
          <p className="text-text-dark-secondary text-sm leading-relaxed max-w-lg mx-auto">
            From historic mountain shrines to silent walking forests and water adventure dams, explore local treasures within short drives of Peace at Peak.
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div className="max-w-4xl mx-auto mb-16 space-y-4">
          <div className="flex flex-col sm:flex-row gap-6 items-center">
            {/* Search Input (Minimal luxury layout) */}
            <div className="relative w-full sm:flex-grow">
              <Search className="absolute left-1 top-1/2 transform -translate-y-1/2 text-text-dark-secondary" size={16} />
              <input
                type="text"
                placeholder="Search local attractions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-4 py-3.5 border-0 border-b border-border-light focus:border-accent-gold bg-transparent transition-all text-xs font-semibold uppercase tracking-wider"
              />
            </div>

            {/* Category Tabs */}
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 w-full sm:w-auto">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-2.5 text-xs font-semibold tracking-widest uppercase transition-all ${activeCategory === cat
                    ? 'text-accent-gold border-b border-accent-gold'
                    : 'text-text-dark-secondary hover:text-primary-deep'
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
        </div>

        {/* Places Grid */}
        {filteredPlaces.length > 0 ? (
          <div className="grid grid-2 lg:grid-3 gap-8">
            {filteredPlaces.map((place) => (
              <div
                key={place.id}
                className="luxury-card flex flex-col h-full bg-white relative rounded-2xl"
                style={{ border: '1px solid rgba(223, 184, 108, 0.15)' }}
              >
                {/* Image visual with Overlay Text */}
                <div className="relative h-60 overflow-hidden">
                  <img
                    src={place.image}
                    alt={place.name}
                    className="w-full h-full object-cover"
                  />
                  {/* Luxury overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-bg-dark/90 via-bg-dark/20 to-transparent pointer-events-none" />

                  {/* Details sitting on Image bottom */}
                  <div className="absolute bottom-4 left-4 right-4 z-10 flex justify-between items-end">
                    <span
                      className="bg-accent-gold text-primary-deep text-[0.55rem] tracking-widest font-bold py-1 px-2.5 uppercase"
                    >
                      {place.category}
                    </span>
                    <span className="text-white text-xs font-medium tracking-wide flex items-center gap-1">
                      <MapPin size={12} className="text-accent-gold" />
                      {place.distance}
                    </span>
                  </div>
                </div>

                {/* Content Details */}
                <div className="p-6 flex flex-col flex-grow space-y-4">
                  <h3
                    className="text-2xl font-light text-primary-deep font-display leading-tight"
                  >
                    {place.name}
                  </h3>

                  <p className="text-text-dark-secondary text-xs leading-relaxed flex-grow">
                    {place.description}
                  </p>

                  <div className="bg-bg-light p-3.5 rounded border border-border-light space-y-1 text-[0.65rem] text-text-dark-secondary">
                    <p>
                      <span className="font-semibold text-primary-deep uppercase tracking-wider">TRAVEL TIME:</span> {place.duration}
                    </p>
                    <p className="text-primary-light font-medium italic mt-1">
                      {place.tips}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-2xl border border-border-light max-w-md mx-auto">
            <Compass size={40} className="text-accent-gold mx-auto mb-3 opacity-60" />
            <p className="text-primary-deep font-light text-xl font-display mb-1">No Attractions Match</p>
            <p className="text-text-dark-secondary text-xs">
              Try modifying your search keywords or choosing a different category filter.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
