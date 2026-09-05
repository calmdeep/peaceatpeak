import React, { useState, useEffect } from 'react';
import { AppProvider, useAppContext } from './context/AppContext';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Rooms from './components/Rooms';
import BookingForm from './components/BookingForm';
import NearbyPlaces from './components/NearbyPlaces';
import Amenities from './components/Amenities';
import Footer from './components/Footer';
import Testimonials from './components/Testimonials';
import DiningAndReception from './components/DiningAndReception';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';
import { Compass, MapPin } from 'lucide-react';

function handleSocialRedirects() {
  const path = window.location.pathname.toLowerCase().replace(/\/$/, '');
  const hash = window.location.hash.toLowerCase().replace(/\/$/, '');
  if (path === '/facebook' || path === '/fb' || hash === '#facebook' || hash === '#fb') {
    window.location.href = 'https://www.facebook.com/peaceatpeak/';
    return true;
  }
  if (path === '/instagram' || path === '/insta' || hash === '#instagram' || hash === '#insta') {
    window.location.href = 'https://www.instagram.com/peaceatpeak_kanatal?igsi=emtwMWdlZHg5NGJs';
    return true;
  }
  return false;
}

function checkIsAdminRoute() {
  if (handleSocialRedirects()) return false;
  const path = window.location.pathname.toLowerCase();
  const hash = window.location.hash.toLowerCase();
  return path === '/admin' || path === '/admin/' || hash === '#admin' || hash === '#/admin';
}

function getInitialTab() {
  const path = window.location.pathname.toLowerCase().replace(/\/$/, '');
  const hash = window.location.hash.toLowerCase().replace(/\/$/, '');
  if (path === '/dining' || hash === '#dining' || hash === '#/dining') return 'dining';
  if (path === '/rooms' || hash === '#rooms' || hash === '#/rooms') return 'rooms';
  if (path === '/nearby' || hash === '#nearby' || hash === '#/nearby') return 'nearby';
  if (path === '/booking' || hash === '#booking' || hash === '#/booking') return 'booking';
  return 'home';
}

function MainApp() {
  const { adminAuth } = useAppContext();
  const [isAdminRoute, setIsAdminRoute] = useState(checkIsAdminRoute);
  const [activeTab, setActiveTab] = useState(getInitialTab);
  const [selectedRoomId, setSelectedRoomId] = useState('private_cottage');

  // Handle route and tab changes smoothly with history API
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    const targetPath = tabId === 'home' ? '/' : `/${tabId}`;
    if (window.location.pathname !== targetPath) {
      window.history.pushState({}, '', targetPath);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Listen to browser navigation (/admin vs /dining vs /rooms etc)
  useEffect(() => {
    const handleLocationChange = () => {
      if (handleSocialRedirects()) return;
      const isAdmin = checkIsAdminRoute();
      setIsAdminRoute(isAdmin);
      if (!isAdmin) {
        setActiveTab(getInitialTab());
      }
    };

    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, []);

  const navigateToSite = () => {
    window.history.pushState({}, '', '/');
    setIsAdminRoute(false);
    setActiveTab('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Dynamic document title
  useEffect(() => {
    if (isAdminRoute) {
      document.title = 'Admin Management Portal | Peace at Peak';
      return;
    }

    switch (activeTab) {
      case 'home':
        document.title = 'Peace at Peak Resort | Kanatal, Uttarakhand | Luxury Mountain Escape';
        break;
      case 'rooms':
        document.title = 'Luxury Wooden Cottages & Swiss Tents in Kanatal | Peace at Peak';
        break;
      case 'dining':
        document.title = 'Dining Hall & Sunset Lounge Gallery | Peace at Peak Resort Kanatal';
        break;
      case 'nearby':
        document.title = 'Sightseeing Near Kanatal | Places to Visit & Trek | Peace at Peak';
        break;
      case 'booking':
        document.title = 'Book Stays & Cottages in Kanatal | Peace at Peak Reservations';
        break;
      default:
        document.title = 'Peace at Peak Resort | Kanatal, Uttarakhand';
    }
  }, [activeTab, isAdminRoute]);

  // If visitor is accessing the /admin route
  if (isAdminRoute) {
    if (adminAuth.isAuthenticated) {
      return <AdminDashboard onBackToSite={navigateToSite} />;
    }
    return <AdminLogin onBackToSite={navigateToSite} />;
  }

  const handleSelectRoom = (roomId) => {
    setSelectedRoomId(roomId);
    handleTabChange('booking');
  };

  const handleBookNowCTA = () => {
    setSelectedRoomId('private_cottage');
    handleTabChange('booking');
  };

  const handleExploreRoomsCTA = () => {
    handleTabChange('rooms');
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#050d09]">
      {/* Header Navigation - No login option displayed */}
      <Navbar activeTab={activeTab} setActiveTab={handleTabChange} />

      {/* Main Content Area */}
      <main className="flex-grow">
        {activeTab === 'home' && (
          <div className="anim-fade">
            {/* Hero Banner with live slideshow */}
            <Hero 
              onBookClick={handleBookNowCTA} 
              onExploreClick={handleExploreRoomsCTA} 
            />

            {/* Quick Introduction */}
            <section className="py-20 bg-white border-b border-border-light text-center">
              <div className="container max-w-3xl">
                <span className="luxury-heading-badge">THE SANCTUARY HIDEAWAY</span>
                <h2 
                  className="text-3xl sm:text-4xl font-light text-primary-deep mt-3 mb-4"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  Silence, Elevated.
                </h2>
                <div className="gold-divider" />
                <p className="text-text-dark-secondary text-sm sm:text-base leading-relaxed">
                  Situated in Chopariyal Gaon near the tranquil heights of Churer Dhar, Peace at Peak represents quiet luxury in Kanatal. Wrapped in morning fog and dense pine canopies, we invite you to disconnect from the noise and sink into local mountain hospitality, starlit fire pits, and premium wooden cottage living.
                </p>
              </div>
            </section>

            {/* Amenities Grid */}
            <Amenities />

            {/* Rooms Section (Preview Mode) */}
            <div className="bg-bg-light border-b border-border-light">
              <Rooms onSelectRoom={handleSelectRoom} />
            </div>

            {/* Testimonials section */}
            <Testimonials />

            {/* Nearby Attraction Preview CTA Section */}
            <section className="py-24 bg-white">
              <div className="container">
                <div 
                  className="flex flex-col md:flex-row items-center justify-between gap-8 max-w-5xl mx-auto p-10 rounded-2xl bg-bg-light border border-border-gold shadow-sm"
                >
                  <div className="space-y-3 max-w-xl text-left">
                    <div className="flex items-center gap-1.5 text-accent-gold text-xs uppercase tracking-wider font-semibold">
                      <MapPin size={14} /> EXPLORE THE HIMALAYAN LOCALITY
                    </div>
                    <h3 
                      className="text-3xl font-light font-display text-primary-deep"
                    >
                      Explore Kanatal & Beyond
                    </h3>
                    <p className="text-text-dark-secondary text-xs leading-relaxed">
                      Plan your treks to the Surkanda Devi Temple (10,000 ft), walks in Kodia Forest, or speed boating in Tehri Dam. We have built an interactive local tourist guide to search nearby places right here.
                    </p>
                  </div>
                  
                  <button 
                    onClick={() => handleTabChange('nearby')}
                    className="btn btn-primary px-8 py-3.5 shrink-0 flex items-center gap-2 text-xs uppercase tracking-widest"
                    style={{ borderRadius: '0px' }}
                  >
                    <Compass size={16} /> Explore Local Sites
                  </button>
                </div>
              </div>
            </section>
          </div>
        )}

        {activeTab === 'rooms' && (
          <div className="pt-20 anim-fade">
            <Rooms onSelectRoom={handleSelectRoom} />
          </div>
        )}

        {/* Dining & Lounge Dedicated Page Route */}
        {activeTab === 'dining' && (
          <div className="pt-20 anim-fade">
            <DiningAndReception />
          </div>
        )}

        {activeTab === 'nearby' && (
          <div className="pt-20 anim-fade">
            <NearbyPlaces />
          </div>
        )}

        {activeTab === 'booking' && (
          <div className="pt-20 anim-fade">
            <BookingForm preselectedRoomId={selectedRoomId} />
          </div>
        )}
      </main>

      {/* Footer */}
      <Footer setActiveTab={handleTabChange} />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
}
