import React from 'react';
import { Star } from 'lucide-react';

const REVIEWS_DATA = [
  {
    id: 1,
    name: 'Aditya Sharma',
    platform: 'Google Verified Review',
    rating: 5,
    title: 'Breathtaking Himalayan views',
    text: 'Peace at Peak is situated in an absolutely gorgeous location. The panoramic views of the snow-capped Himalayan peaks right from the cottage balcony are breathtaking. Surrounded by apple orchards and pine trees. The caretakers were extremely friendly and arranged a wonderful bonfire in the evening.'
  },
  {
    id: 2,
    name: 'Sneha Patel',
    platform: 'MakeMyTrip Traveler',
    rating: 4,
    title: 'Peaceful weekend getaway',
    text: 'A perfect getaway if you want to escape the city noise. The wooden cottages have a beautiful rustic charm. Quiet and serene atmosphere. We spent hours just sitting on the private veranda taking in the fresh mountain air.'
  },
  {
    id: 3,
    name: 'Rajiv Malhotra',
    platform: 'Google Verified Review',
    rating: 5,
    title: 'Excellent cottage stay',
    text: 'Had an amazing family stay. The location is excellent, right along the Chamba-Mussoorie road but tucked away in silence. Highly recommend the private cottages. Walking in the nearby Kodia forest trail was a highlight of our trip.'
  }
];

export default function Testimonials() {
  return (
    <section className="py-24 bg-white border-b border-border-light text-center" id="testimonials">
      <div className="container">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-20">
          <span className="luxury-heading-badge">GUEST REVIEWS</span>
          <h2 
            className="text-4xl sm:text-5xl font-light text-primary-deep mt-3 mb-4"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Verified Guest Experiences
          </h2>
          <div className="gold-divider" />
          <p className="text-text-dark-secondary text-sm leading-relaxed max-w-lg mx-auto">
            Read what our visitors say about their serene wooden cottage stays and local trekking adventures in Kanatal.
          </p>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-3 gap-8 max-w-5xl mx-auto">
          {REVIEWS_DATA.map((review) => (
            <div 
              key={review.id}
              className="luxury-card p-6 flex flex-col justify-between text-left space-y-6"
              style={{ border: '1px solid rgba(195, 161, 117, 0.15)' }}
            >
              <div className="space-y-3">
                {/* Star rating */}
                <div className="flex gap-0.5 text-accent-gold">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      size={14} 
                      fill={i < review.rating ? 'currentColor' : 'transparent'} 
                      strokeWidth={1.5}
                    />
                  ))}
                </div>

                <h3 className="text-lg font-light font-display text-primary-deep italic">
                  "{review.title}"
                </h3>
                
                <p className="text-text-dark-secondary text-xs leading-relaxed">
                  {review.text}
                </p>
              </div>

              <div className="pt-4 border-t border-border-light flex justify-between items-center text-[0.65rem] tracking-wider uppercase font-semibold">
                <span className="text-primary-deep">{review.name}</span>
                <span className="text-accent-gold font-body font-medium">{review.platform}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
