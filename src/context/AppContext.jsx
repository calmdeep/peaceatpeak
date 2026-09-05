import React, { createContext, useContext, useState, useEffect } from 'react';

export const DEFAULT_ROOMS = [
  {
    id: 'private_cottage',
    name: 'COTTAGE WITH MOUNTAIN VIEW',
    totalUnits: 5, // 5 individual wooden cottages
    unitLabel: 'Wooden Cottages',
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
    discount: 15,
    offer: '15% MONSOON GETAWAY',
    available: true,
    status: 'available', // 'available' | 'reserved' | 'sold_out'
    currentGuest: null,
    tagline: 'Cozy and rustic charm, floating above the mountain mist.',
    description: 'Constructed from natural pine wood with a private glass window facing the snow-capped Himalayan peaks. Enjoy cozy fireplace evenings, fine organic bed linens, and a private balcony to sip hot local tea.',
    amenities: [
      'Private Wooden Balcony',
      'Electric Room Heater',
      'High-speed Wi-Fi',
      'Attached Luxury Bathroom',
      'Flat Screen TV & Kettle'
    ],
    tag: 'MOST POPULAR',
    tagColor: 'gold'
  },
  {
    id: 'swiss_tent',
    name: 'Swiss Tents',
    totalUnits: 5, // 5 luxury swiss glamping tents
    unitLabel: 'Swiss Tents',
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
    discount: 10,
    offer: '10% NATURE ESCAPE',
    available: true,
    status: 'available', // open for check-in
    currentGuest: null,
    tagline: 'An immersive forest glamping experience under the stars.',
    description: 'Nestled between cedar trees, our Swiss Camps represent luxury in the wilderness. Features standard wooden flooring, attached western bathrooms with running hot water, and a cozy veranda looking directly into the pine valley.',
    amenities: [
      'Forest View veranda',
      'Cozy Wooden Furniture',
      'High-speed Wi-Fi',
      'Attached Western Bathroom',
      'Bonfire & Music Access'
    ],
    tag: 'NATURE CAMP',
    tagColor: 'emerald'
  },
  {
    id: 'family_tent',
    name: 'Family Tents',
    totalUnits: 4, // 4 family spacious stays
    unitLabel: 'Family Suites',
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
    discount: 0,
    offer: '',
    available: true,
    status: 'available',
    currentGuest: null,
    tagline: 'Generous spaces designed for family reunions and groups.',
    description: 'A spacious dual-bed wooden cottage layout featuring a large private patio and comfortable seating arrangements. Perfect for families looking to experience the quiet mountain air together without compromising on comfort.',
    amenities: [
      'Large Private Wooden Patio',
      'Sitting Area with Fireplace',
      'High-speed Wi-Fi',
      'Attached Family Bathroom',
      'Room Heaters on Request'
    ],
    tag: 'FAMILY COZY',
    tagColor: 'blue'
  }
];

export const DEFAULT_PROPERTY_SPACES = [
  {
    id: 'dining_hall',
    name: 'Grand Mountain Dining Hall & Banquet',
    category: 'Dining & Gastronomy',
    badge: 'DINING & BUFFET',
    subtitle: 'Warm Pahadi flavours, daily buffet spreads, and sunset valley views.',
    description: 'Our spacious mountain dining pavilion accommodates hearty breakfast spreads, freshly prepared North Indian & authentic Garhwali recipes, and evening hot buffets. Flooded with golden sunset light across polished floors, it offers a welcoming gathering space for families, groups, and bonfire banquets.',
    timings: 'Breakfast: 7:30 AM – 10:30 AM | Dinner: 7:30 PM – 10:30 PM',
    features: [
      'Hot Buffet & Live Counters',
      'Panoramic Mountain View Windows',
      'Local Garhwali Specialty Dishes',
      'Tea & Bonfire Barbecue Evenings',
      'Indoor & Veranda Seating'
    ],
    image: '/images/dining_hall_buffet.jpg',
    images: [
      '/images/dining_hall_buffet.jpg',
      '/images/dining_reception_exterior.jpg'
    ]
  },
  {
    id: 'reception_lounge',
    name: 'Reception & Alpine Sunset Lounge',
    category: 'Welcome Lobby & Concierge',
    badge: '24/7 WELCOME LOBBY',
    subtitle: '24/7 Front desk assistance, comfortable armchairs, and breathtaking twilight vistas.',
    description: 'From your first warm cup of mountain tea upon arrival to 24/7 concierge assistance, our wooden reception pavilion is designed for calm check-ins and evening relaxation. Sit back in comfortable armchairs and watch the Himalayan dusk turn the sky into blazing shades of crimson through expansive windows.',
    timings: '24 Hours Front Desk & Concierge Assistance',
    features: [
      '24/7 Guest Check-In Desk',
      'Sunset Valley Observation Lounge',
      'Surkanda Devi & Kodia Trek Desk',
      'Complimentary Herbal Welcome Tea',
      'Board Games & Relaxed Seating'
    ],
    image: '/images/reception_lounge_sunset.jpg',
    images: [
      '/images/reception_lounge_sunset.jpg',
      '/images/dining_reception_exterior.jpg'
    ]
  }
];

export const DEFAULT_HERO_SLIDES = [
  { url: '/images/hero_slide_1.jpg', position: 'center 70%', caption: 'Giant Outdoor Chess Lawn & Evening Lights' },
  { url: '/images/hero_slide_2.jpg', position: 'center 45%', caption: 'Himalayan Twilight Horizon & Fairy Lights' },
  { url: '/images/hero_slide_3.jpg', position: 'center center', caption: 'Sunset Mountain Panorama at 8,500 Ft' },
  { url: '/images/hero_slide_4.jpg', position: 'center 60%', caption: 'Private Wooden Cottage Sanctuary' },
  { url: '/images/hero_slide_5.jpg', position: 'center center', caption: 'Crimson Dusk Skies Framed Through Pine Trees' }
];

// Clean real bookings initialization - no fake seeds
function getInitialBookings() {
  try {
    const saved = localStorage.getItem('pap_bookings_data');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        // Filter out any older mock/fake seeds
        return parsed.filter(b => 
          b && b.guestName &&
          !b.guestName.includes('Malhotra') && 
          !b.guestName.includes('Arjun Sen') &&
          !b.guestName.includes('Pooja Hegde') &&
          !b.guestName.includes('Devansh Kulkarni') &&
          !b.guestName.includes('Kapur') &&
          !b.guestName.includes('Siddharth Iyer') &&
          !b.guestName.includes('Deshmukh') &&
          !b.guestName.includes('Singhania') &&
          !b.guestName.includes('Aditya & Shalini') &&
          !b.guestName.includes('Oberoi') &&
          !b.guestName.includes('Sameer & Shalini') &&
          !b.guestName.includes('Alok Gupta') &&
          !b.guestName.includes('Deepak & Sunita') &&
          !b.guestName.includes('Ambani') &&
          !b.guestName.includes('Preeti Chandra') &&
          !b.guestName.includes('Goenka')
        );
      }
    }
  } catch (e) {
    console.warn('Failed to load bookings from localStorage', e);
  }
  return [];
}

const AppContext = createContext();

export function AppProvider({ children }) {
  // Rooms state with localStorage persistence
  const [rooms, setRooms] = useState(() => {
    try {
      const saved = localStorage.getItem('pap_rooms_data');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map(r => ({
            ...r,
            totalUnits: (r.id === 'private_cottage' || r.id === 'swiss_tent') && (r.totalUnits === 6 || !r.totalUnits) 
              ? 5 
              : (Number(r.totalUnits) || (r.id === 'family_tent' ? 4 : 5)),
            unitLabel: r.unitLabel || (r.id === 'private_cottage' ? 'Wooden Cottages' : r.id === 'swiss_tent' ? 'Swiss Tents' : 'Family Suites'),
            tagColor: r.tagColor || (r.id === 'private_cottage' ? 'gold' : r.id === 'swiss_tent' ? 'emerald' : 'blue'),
            currentGuest: r.currentGuest && r.currentGuest.name?.includes('Malhotra') ? null : r.currentGuest,
            status: r.status === 'reserved' && (!r.currentGuest || r.currentGuest.name?.includes('Malhotra')) ? 'available' : r.status
          }));
        }
      }
    } catch (e) {
      console.warn('Failed to load rooms from localStorage', e);
    }
    return DEFAULT_ROOMS;
  });

  // Property spaces (Dining Hall & Reception Lounge) with persistence
  const [propertySpaces, setPropertySpaces] = useState(() => {
    try {
      const saved = localStorage.getItem('pap_property_spaces');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map(sp => ({
            ...sp,
            image: sp.image && sp.image.includes('dining_hall_main') ? '/images/dining_hall_buffet.jpg' : sp.image,
            images: (sp.images || []).filter(img => !img.includes('dining_hall_main'))
          }));
        }
      }
    } catch (e) {
      console.warn('Failed to load property spaces from localStorage', e);
    }
    return DEFAULT_PROPERTY_SPACES;
  });

  // Hero slides state with localStorage persistence
  const [heroSlides, setHeroSlides] = useState(() => {
    try {
      const saved = localStorage.getItem('pap_hero_slides');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Failed to load hero slides from localStorage', e);
    }
    return DEFAULT_HERO_SLIDES;
  });

  // Bookings state with localStorage persistence (Clean real data only)
  const [bookings, setBookings] = useState(getInitialBookings);

  // Admin Auth state with localStorage and sessionStorage persistence
  const [adminAuth, setAdminAuth] = useState(() => {
    try {
      const token = localStorage.getItem('pap_admin_auth') || sessionStorage.getItem('pap_admin_auth');
      return { isAuthenticated: token === 'valid_session', user: 'admin' };
    } catch {
      return { isAuthenticated: false, user: null };
    }
  });

  // Save changes to localStorage and broadcast across open tabs & admin panels
  useEffect(() => {
    try {
      localStorage.setItem('pap_rooms_data', JSON.stringify(rooms));
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        const channel = new BroadcastChannel('pap_sync_bus');
        channel.postMessage({ type: 'ROOMS_SYNC', payload: rooms });
        channel.close();
      }
    } catch (e) {
      console.error('Error saving rooms to storage', e);
    }
  }, [rooms]);

  useEffect(() => {
    try {
      localStorage.setItem('pap_property_spaces', JSON.stringify(propertySpaces));
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        const channel = new BroadcastChannel('pap_sync_bus');
        channel.postMessage({ type: 'SPACES_SYNC', payload: propertySpaces });
        channel.close();
      }
    } catch (e) {
      console.error('Error saving property spaces to storage', e);
    }
  }, [propertySpaces]);

  useEffect(() => {
    try {
      localStorage.setItem('pap_hero_slides', JSON.stringify(heroSlides));
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        const channel = new BroadcastChannel('pap_sync_bus');
        channel.postMessage({ type: 'HERO_SLIDES_SYNC', payload: heroSlides });
        channel.close();
      }
    } catch (e) {
      console.warn('Direct storage write warning for hero slides, attempting recovery', e);
      try {
        const safeSlides = heroSlides.slice(-8);
        localStorage.setItem('pap_hero_slides', JSON.stringify(safeSlides));
      } catch (innerErr) {
        console.warn('Storage quota limit reached in browser', innerErr);
      }
    }
  }, [heroSlides]);

  // Real-time synchronization bus: Cross-Tab, Cross-Window & Cloud Sync
  useEffect(() => {
    let broadcastChannel;
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        broadcastChannel = new BroadcastChannel('pap_sync_bus');
        broadcastChannel.onmessage = (event) => {
          if (!event?.data) return;
          const { type, payload } = event.data;
          if (type === 'HERO_SLIDES_SYNC' && Array.isArray(payload) && payload.length > 0) {
            setHeroSlides(payload);
          } else if (type === 'ROOMS_SYNC' && Array.isArray(payload) && payload.length > 0) {
            setRooms(payload);
          } else if (type === 'SPACES_SYNC' && Array.isArray(payload) && payload.length > 0) {
            setPropertySpaces(payload);
          } else if (type === 'BOOKINGS_SYNC' && Array.isArray(payload)) {
            setBookings(payload);
          }
        };
      }
    } catch (e) {
      console.warn('BroadcastChannel sync init error', e);
    }

    // Storage event for other browser tabs / windows
    const handleStorageEvent = (e) => {
      try {
        if (!e.newValue) return;
        if (e.key === 'pap_hero_slides') {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed) && parsed.length > 0) setHeroSlides(parsed);
        } else if (e.key === 'pap_rooms_data') {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed) && parsed.length > 0) setRooms(parsed);
        } else if (e.key === 'pap_property_spaces') {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed) && parsed.length > 0) setPropertySpaces(parsed);
        } else if (e.key === 'pap_bookings_data') {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) setBookings(parsed);
        }
      } catch (err) {
        console.warn('Storage event sync parse error', err);
      }
    };

    window.addEventListener('storage', handleStorageEvent);

    // Cross-Device Cloud Sync check (e.g. Laptop Admin -> Mobile Phone Visitor/Admin)
    const checkCloudSync = async () => {
      try {
        const cloudUrl = 'https://kvdb.io/4y9K3mP8vWq6xT2nZb7L1e/pap_cloud_hero_sync';
        const res = await fetch(cloudUrl, { headers: { 'Cache-Control': 'no-cache' } });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data?.slides) && data.slides.length > 0) {
            const lastUpdated = Number(localStorage.getItem('pap_hero_slides_ts')) || 0;
            if (data.timestamp > lastUpdated) {
              setHeroSlides(data.slides);
              localStorage.setItem('pap_hero_slides', JSON.stringify(data.slides));
              localStorage.setItem('pap_hero_slides_ts', String(data.timestamp));
            }
          }
        }
      } catch {
        // Silent offline fallback
      }
    };

    checkCloudSync();
    const syncTimer = setInterval(checkCloudSync, 12000);

    return () => {
      if (broadcastChannel) broadcastChannel.close();
      window.removeEventListener('storage', handleStorageEvent);
      clearInterval(syncTimer);
    };
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('pap_bookings_data', JSON.stringify(bookings));
    } catch (e) {
      console.error('Error saving bookings to storage', e);
    }
  }, [bookings]);

  // Auth functions - robust and multi-credential friendly
  const login = (username, password) => {
    const trimmedUser = (username || '').trim().toLowerCase();
    const trimmedPass = (password || '').trim();

    const validUsers = ['admin', 'admin@peaceatpeak.com', 'peaceatpeak', 'peak', 'owner'];
    const validPasswords = ['admin', 'admin123', 'peakadmin@2026', 'peakadmin', '123456'];

    const isUserMatch = validUsers.includes(trimmedUser);
    const isPassMatch = validPasswords.includes(trimmedPass.toLowerCase()) || trimmedPass === 'PeakAdmin@2026';

    if (isUserMatch && isPassMatch) {
      try {
        localStorage.setItem('pap_admin_auth', 'valid_session');
        sessionStorage.setItem('pap_admin_auth', 'valid_session');
      } catch (e) {
        console.warn('Storage write failed', e);
      }
      setAdminAuth({ isAuthenticated: true, user: trimmedUser });
      return { success: true };
    }
    return { 
      success: false, 
      message: 'Invalid credentials. You can use Username: "admin" & Password: "admin" or "admin@peaceatpeak.com" & "PeakAdmin@2026".' 
    };
  };

  const logout = () => {
    try {
      localStorage.removeItem('pap_admin_auth');
      sessionStorage.removeItem('pap_admin_auth');
    } catch (e) {
      console.warn('Storage remove failed', e);
    }
    setAdminAuth({ isAuthenticated: false, user: null });
  };

  // Rooms Management
  const updateRoom = (roomId, updates) => {
    setRooms(prev => prev.map(room => (room.id === roomId ? { ...room, ...updates } : room)));
  };

  const addRoomImage = (roomId, imageUrl) => {
    if (!imageUrl) return;
    setRooms(prev =>
      prev.map(room => {
        if (room.id === roomId) {
          const updatedImages = [...(room.images || []), imageUrl];
          return {
            ...room,
            images: updatedImages,
            image: room.image || imageUrl
          };
        }
        return room;
      })
    );
  };

  const removeRoomImage = (roomId, imageIndex) => {
    setRooms(prev =>
      prev.map(room => {
        if (room.id === roomId && room.images) {
          const newImages = room.images.filter((_, idx) => idx !== imageIndex);
          return {
            ...room,
            images: newImages,
            image: newImages.length > 0 ? newImages[0] : ''
          };
        }
        return room;
      })
    );
  };

  const setRoomPrimaryImage = (roomId, imageIndex) => {
    setRooms(prev =>
      prev.map(room => {
        if (room.id === roomId && room.images && room.images[imageIndex]) {
          const selectedImg = room.images[imageIndex];
          const reordered = [selectedImg, ...room.images.filter((_, idx) => idx !== imageIndex)];
          return {
            ...room,
            image: selectedImg,
            images: reordered
          };
        }
        return room;
      })
    );
  };

  // Property Spaces Management (Dining Hall & Reception Lounge)
  const updatePropertySpace = (spaceId, updates) => {
    setPropertySpaces(prev =>
      prev.map(space => (space.id === spaceId ? { ...space, ...updates } : space))
    );
  };

  const addSpaceImage = (spaceId, imageUrl) => {
    if (!imageUrl) return;
    setPropertySpaces(prev =>
      prev.map(space => {
        if (space.id === spaceId) {
          const updatedImages = [...(space.images || []), imageUrl];
          return {
            ...space,
            images: updatedImages,
            image: space.image || imageUrl
          };
        }
        return space;
      })
    );
  };

  const removeSpaceImage = (spaceId, imageIndex) => {
    setPropertySpaces(prev =>
      prev.map(space => {
        if (space.id === spaceId && space.images) {
          const newImages = space.images.filter((_, idx) => idx !== imageIndex);
          return {
            ...space,
            images: newImages,
            image: newImages.length > 0 ? newImages[0] : ''
          };
        }
        return space;
      })
    );
  };

  const setSpacePrimaryImage = (spaceId, imageIndex) => {
    setPropertySpaces(prev =>
      prev.map(space => {
        if (space.id === spaceId && space.images && space.images[imageIndex]) {
          const selectedImg = space.images[imageIndex];
          const reordered = [selectedImg, ...space.images.filter((_, idx) => idx !== imageIndex)];
          return {
            ...space,
            image: selectedImg,
            images: reordered
          };
        }
        return space;
      })
    );
  };

  // Hero Slides Management
  const addHeroSlide = (slide) => {
    if (!slide || !slide.url) return;
    setHeroSlides(prev => [
      ...prev,
      {
        url: slide.url,
        position: slide.position || 'center center',
        caption: slide.caption || 'Peace at Peak Resort'
      }
    ]);
  };

  const removeHeroSlide = (index) => {
    if (heroSlides.length <= 1) {
      alert('At least one hero slide must remain active.');
      return;
    }
    setHeroSlides(prev => prev.filter((_, idx) => idx !== index));
  };

  const reorderHeroSlide = (index, direction) => {
    const newIdx = direction === 'up' ? index - 1 : index + 1;
    if (newIdx < 0 || newIdx >= heroSlides.length) return;
    setHeroSlides(prev => {
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[newIdx];
      copy[newIdx] = temp;
      return copy;
    });
  };

  const updateHeroSlide = (index, updates) => {
    setHeroSlides(prev =>
      prev.map((slide, idx) => (idx === index ? { ...slide, ...updates } : slide))
    );
  };

  // Publish hero slides across all admin panels, open tabs, and distinct devices
  const publishHeroSlides = async (slidesToPublish) => {
    const targetSlides = slidesToPublish || heroSlides;
    const timestamp = Date.now();
    try {
      localStorage.setItem('pap_hero_slides', JSON.stringify(targetSlides));
      localStorage.setItem('pap_hero_slides_ts', String(timestamp));

      // Broadcast immediately across all open tabs / panels
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        const channel = new BroadcastChannel('pap_sync_bus');
        channel.postMessage({ type: 'HERO_SLIDES_SYNC', payload: targetSlides });
        channel.close();
      }

      // Publish to cloud store for remote devices / mobile phones
      const cloudUrl = 'https://kvdb.io/4y9K3mP8vWq6xT2nZb7L1e/pap_cloud_hero_sync';
      await fetch(cloudUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slides: targetSlides, timestamp })
      }).catch(() => null);

      return true;
    } catch (e) {
      console.warn('Publish slides error', e);
      return true;
    }
  };

  // Bookings Management
  const addBooking = (newBooking) => {
    const bookingEntry = {
      id: newBooking.id || `PAP-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      guestName: newBooking.name || newBooking.guestName,
      email: newBooking.email,
      phone: newBooking.phone,
      roomId: newBooking.roomId,
      roomName: newBooking.roomName,
      checkIn: newBooking.checkIn,
      checkOut: newBooking.checkOut,
      nights: newBooking.nights || 1,
      amount: newBooking.total || newBooking.amount,
      status: 'active',
      daysAgo: 0
    };
    setBookings(prev => [bookingEntry, ...prev]);
    return bookingEntry;
  };

  // Helper calculation for effective room rate after discount
  const getEffectivePrice = (room) => {
    if (!room) return 0;
    const base = room.price || 0;
    const disc = room.discount || 0;
    if (disc <= 0) return base;
    return Math.round(base * (1 - disc / 100));
  };

  // Helper for multi-unit room inventory calculation across stay categories
  const getRoomInventory = (roomId, checkInDate, checkOutDate) => {
    const targetDate = checkInDate || new Date().toISOString().split('T')[0];
    const room = rooms.find(r => r.id === roomId);
    if (!room) {
      return {
        totalUnits: 0,
        occupiedUnits: 0,
        availableUnits: 0,
        isAvailable: false,
        status: 'sold_out',
        activeBookings: []
      };
    }

    const totalUnits = Number(room.totalUnits) || (room.id === 'family_tent' ? 4 : 5);

    if (room.available === false) {
      return {
        totalUnits,
        occupiedUnits: 0,
        availableUnits: 0,
        isAvailable: false,
        status: 'sold_out',
        activeBookings: []
      };
    }

    // Active overlapping bookings
    const activeBookings = bookings.filter(b => {
      if (b.roomId !== roomId || b.status === 'cancelled') return false;
      if (checkInDate && checkOutDate) {
        return b.checkIn < checkOutDate && b.checkOut > checkInDate;
      }
      return b.checkIn <= targetDate && b.checkOut >= targetDate;
    });

    const occupiedUnits = activeBookings.length;
    const availableUnits = Math.max(0, totalUnits - occupiedUnits);
    const isAvailable = availableUnits > 0;
    const status = !isAvailable ? 'sold_out' : (occupiedUnits > 0 ? 'partially_booked' : 'available');

    return {
      totalUnits,
      occupiedUnits,
      availableUnits,
      isAvailable,
      status,
      activeBookings
    };
  };

  // Booking Status and Removal
  const updateBookingStatus = (bookingId, newStatus) => {
    setBookings(prev =>
      prev.map(b => (b.id === bookingId ? { ...b, status: newStatus } : b))
    );
  };

  const removeBooking = (bookingId) => {
    setBookings(prev => prev.filter(b => b.id !== bookingId));
  };

  // Reset to Factory Defaults
  const resetAllToDefaults = () => {
    setRooms(DEFAULT_ROOMS);
    setPropertySpaces(DEFAULT_PROPERTY_SPACES);
    setHeroSlides(DEFAULT_HERO_SLIDES);
    setBookings([]);
    localStorage.removeItem('pap_rooms_data');
    localStorage.removeItem('pap_property_spaces');
    localStorage.removeItem('pap_hero_slides');
    localStorage.removeItem('pap_bookings_data');
  };

  return (
    <AppContext.Provider
      value={{
        rooms,
        setRooms,
        updateRoom,
        addRoomImage,
        removeRoomImage,
        setRoomPrimaryImage,
        getEffectivePrice,
        getRoomInventory,
        propertySpaces,
        setPropertySpaces,
        updatePropertySpace,
        addSpaceImage,
        removeSpaceImage,
        setSpacePrimaryImage,
        heroSlides,
        setHeroSlides,
        addHeroSlide,
        removeHeroSlide,
        reorderHeroSlide,
        updateHeroSlide,
        publishHeroSlides,
        bookings,
        setBookings,
        addBooking,
        updateBookingStatus,
        removeBooking,
        adminAuth,
        login,
        logout,
        resetAllToDefaults
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
