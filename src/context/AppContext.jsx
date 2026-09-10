import React, { createContext, useContext, useState, useEffect } from 'react';
import { isFirebaseConfigured } from '../firebase';
import {
  subscribeToRooms,
  syncRoomToFirestore,
  deleteRoomFromFirestore,
  seedInitialRoomsIfEmpty,
  fetchLatestRoomsFromFirestore,
  subscribeToBookings,
  syncBookingToFirestore,
  updateBookingStatusInFirestore,
  deleteBookingFromFirestore,
  subscribeToPropertySpaces,
  syncPropertySpaceToFirestore,
  seedInitialSpacesIfEmpty,
  fetchLatestSpacesFromFirestore,
  subscribeToHeroSlides,
  syncHeroSlidesToFirestore,
  seedInitialHeroIfEmpty,
  fetchLatestHeroFromFirestore
} from '../services/firebaseService';

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
    image: '/images/room_tent.jpg',
    images: [
      '/images/room_tent.jpg',
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
      '/images/dining_hall_interior.jpg',
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

function getInitialBookings() {
  try {
    const saved = localStorage.getItem('pap_bookings_data');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        return parsed.filter(b => b && b.guestName);
      }
    }
  } catch (e) {
    console.warn('Failed to load bookings from localStorage', e);
  }
  return [];
}

const AppContext = createContext();

export function AppProvider({ children }) {
  const [rooms, setRooms] = useState(() => {
    try {
      const saved = localStorage.getItem('pap_rooms_data');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map(r => ({
            ...r,
            price: Number(r.price) >= 0 ? Number(r.price) : 4500,
            originalPrice: Number(r.originalPrice) || Number(r.price) || 4500,
            totalUnits: Number(r.totalUnits) >= 1 ? Number(r.totalUnits) : 5,
            unitLabel: r.unitLabel || `${r.name || 'Sanctuary'} Units`,
            tagColor: r.tagColor || 'gold',
            amenities: Array.isArray(r.amenities) ? r.amenities : [],
            size: r.size || '224 sq. ft.',
            image: (r.image && !r.image.includes('swiss1.avif')) ? r.image : (r.id === 'swiss_tent' ? '/images/room_tent.jpg' : (r.image || '/images/hut1.webp')),
            images: (r.images || []).map(img => img.includes('swiss1.avif') ? '/images/room_tent.jpg' : img),
            currentGuest: r.currentGuest && r.currentGuest.name?.includes('Malhotra') ? null : r.currentGuest,
            available: r.available !== false
          }));
        }
      }
    } catch (e) {
      console.warn('Failed to load rooms from localStorage', e);
    }
    return DEFAULT_ROOMS;
  });

  const [propertySpaces, setPropertySpaces] = useState(() => {
    try {
      const aiCleaned = localStorage.getItem('pap_ai_cleanup_v3');
      if (!aiCleaned) {
        localStorage.setItem('pap_ai_cleanup_v3', 'true');
        localStorage.removeItem('pap_hero_slides');
        localStorage.removeItem('pap_property_spaces');
        return DEFAULT_PROPERTY_SPACES;
      }
      const saved = localStorage.getItem('pap_property_spaces');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Failed to load property spaces from localStorage', e);
    }
    return DEFAULT_PROPERTY_SPACES;
  });

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

  const [bookings, setBookings] = useState(getInitialBookings);

  const [adminAuth, setAdminAuth] = useState(() => {
    try {
      const token = localStorage.getItem('pap_admin_auth') || sessionStorage.getItem('pap_admin_auth');
      return { isAuthenticated: token === 'valid_session', user: 'admin' };
    } catch {
      return { isAuthenticated: false, user: null };
    }
  });

  // Live Cloud Firestore Real-Time Connectivity Status
  const [firestoreSyncStatus, setFirestoreSyncStatus] = useState(isFirebaseConfigured() ? 'connected' : 'offline');
  const [lastCloudSync, setLastCloudSync] = useState(() => new Date().toISOString());

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

  // Real-Time Firebase Cloud Firestore Synchronization
  useEffect(() => {
    if (!isFirebaseConfigured()) {
      setFirestoreSyncStatus('offline');
      return;
    }

    // Seed default collections if empty on brand-new cloud database
    seedInitialRoomsIfEmpty(DEFAULT_ROOMS);
    seedInitialSpacesIfEmpty(DEFAULT_PROPERTY_SPACES);
    seedInitialHeroIfEmpty(DEFAULT_HERO_SLIDES);

    setFirestoreSyncStatus('connected');
    setLastCloudSync(new Date().toISOString());

    // 1. Rooms Live Subscription: Firestore is the authoritative source of truth
    const unsubRooms = subscribeToRooms((cloudRooms) => {
      if (Array.isArray(cloudRooms) && cloudRooms.length > 0) {
        setRooms(cloudRooms);
        setFirestoreSyncStatus('connected');
        setLastCloudSync(new Date().toISOString());
      }
    }, (err) => {
      console.warn('Firestore rooms listener warning:', err);
      setFirestoreSyncStatus('offline');
    });

    // 2. Bookings Live Subscription
    const unsubBookings = subscribeToBookings((cloudBookings) => {
      if (Array.isArray(cloudBookings)) {
        setBookings(cloudBookings);
        setLastCloudSync(new Date().toISOString());
      }
    }, (err) => {
      console.warn('Firestore bookings listener warning:', err);
    });

    // 3. Property Spaces Live Subscription
    const unsubSpaces = subscribeToPropertySpaces((cloudSpaces) => {
      if (Array.isArray(cloudSpaces) && cloudSpaces.length > 0) {
        setPropertySpaces(cloudSpaces);
        setLastCloudSync(new Date().toISOString());
      }
    });

    // 4. Hero Slides Live Subscription
    const unsubHero = subscribeToHeroSlides((cloudSlides) => {
      if (Array.isArray(cloudSlides) && cloudSlides.length > 0) {
        setHeroSlides(cloudSlides);
        setLastCloudSync(new Date().toISOString());
      }
    });

    return () => {
      unsubRooms?.();
      unsubBookings?.();
      unsubSpaces?.();
      unsubHero?.();
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
  const addNewRoom = async (newRoomData) => {
    const now = new Date().toISOString();
    const id = newRoomData.id || `sanctuary_${Date.now()}`;
    const cleanRoom = {
      id,
      name: newRoomData.name || 'New Sanctuary Suite',
      totalUnits: Number(newRoomData.totalUnits) >= 1 ? Number(newRoomData.totalUnits) : 5,
      unitLabel: newRoomData.unitLabel || `${newRoomData.name || 'Room'} Units`,
      image: newRoomData.image || (Array.isArray(newRoomData.images) && newRoomData.images[0]) || '/images/hut1.webp',
      images: Array.isArray(newRoomData.images) && newRoomData.images.length > 0 ? newRoomData.images : ['/images/hut1.webp'],
      size: newRoomData.size || '224 sq. ft.',
      bed: newRoomData.bed || '1 King Bed',
      guests: newRoomData.guests || '2 Adults',
      view: newRoomData.view || 'Himalayan Mountain View',
      price: Number(newRoomData.price) >= 0 ? Number(newRoomData.price) : 4500,
      originalPrice: Number(newRoomData.originalPrice) || Number(newRoomData.price) || 4500,
      discount: Math.min(90, Math.max(0, Number(newRoomData.discount) || 0)),
      offer: newRoomData.offer || '',
      available: newRoomData.available !== false,
      status: 'available',
      currentGuest: null,
      tagline: newRoomData.tagline || 'Experience serene mountain luxury.',
      description: newRoomData.description || 'Constructed with natural pine wood and panoramic mountain vistas.',
      amenities: Array.isArray(newRoomData.amenities) && newRoomData.amenities.length > 0 
        ? newRoomData.amenities 
        : ['Mountain View Balcony', 'High-speed Wi-Fi', 'Electric Room Heater', 'Attached Luxury Bathroom'],
      tagColor: newRoomData.tagColor || 'gold',
      tag: newRoomData.tag || 'NEW SANCTUARY',
      updatedAt: now
    };

    setRooms(prev => [...prev, cleanRoom]);
    const ok = await syncRoomToFirestore(cleanRoom.id, cleanRoom);
    if (ok) setLastCloudSync(new Date().toISOString());
    return { success: ok, room: cleanRoom };
  };

  const deleteRoom = async (roomId) => {
    setRooms(prev => prev.filter(room => room.id !== roomId));
    const ok = await deleteRoomFromFirestore(roomId);
    if (ok) setLastCloudSync(new Date().toISOString());
    return { success: ok };
  };

  const updateRoom = async (roomId, updates) => {
    const now = new Date().toISOString();
    const currentRoom = rooms.find(r => r.id === roomId);
    if (!currentRoom) return { success: false, error: 'Room not found' };

    const updatedTarget = {
      ...currentRoom,
      ...updates,
      updatedAt: now
    };

    setRooms(prev => prev.map(room => room.id === roomId ? updatedTarget : room));
    try {
      const saved = JSON.parse(localStorage.getItem('pap_rooms_data') || '[]');
      const newSaved = saved.map(r => r.id === roomId ? updatedTarget : r);
      localStorage.setItem('pap_rooms_data', JSON.stringify(newSaved));
    } catch (e) {
      console.warn('Storage save warning:', e);
    }

    const ok = await syncRoomToFirestore(roomId, updatedTarget);
    if (ok) setLastCloudSync(new Date().toISOString());
    return { success: ok, room: updatedTarget };
  };

  const addRoomImage = async (roomId, imageUrl) => {
    if (!imageUrl) return { success: false };
    const now = new Date().toISOString();
    const currentRoom = rooms.find(r => r.id === roomId);
    if (!currentRoom) return { success: false };

    const updatedImages = [...(currentRoom.images || []), imageUrl];
    const updatedTarget = {
      ...currentRoom,
      images: updatedImages,
      image: currentRoom.image || imageUrl,
      updatedAt: now
    };

    setRooms(prev => prev.map(r => r.id === roomId ? updatedTarget : r));
    try {
      const saved = JSON.parse(localStorage.getItem('pap_rooms_data') || '[]');
      const newSaved = saved.map(r => r.id === roomId ? updatedTarget : r);
      localStorage.setItem('pap_rooms_data', JSON.stringify(newSaved));
    } catch {}

    const ok = await syncRoomToFirestore(roomId, updatedTarget);
    if (ok) setLastCloudSync(new Date().toISOString());
    return { success: ok, room: updatedTarget };
  };

  const replaceRoomImage = async (roomId, imageIndex, newImageUrl) => {
    if (!newImageUrl) return { success: false };
    const now = new Date().toISOString();
    const currentRoom = rooms.find(r => r.id === roomId);
    if (!currentRoom || !Array.isArray(currentRoom.images)) return { success: false };

    const updatedImages = [...currentRoom.images];
    const oldPrimary = currentRoom.image;
    const wasCover = oldPrimary === updatedImages[imageIndex] || imageIndex === 0;
    updatedImages[imageIndex] = newImageUrl;
    const updatedTarget = {
      ...currentRoom,
      images: updatedImages,
      image: wasCover ? newImageUrl : (currentRoom.image || newImageUrl),
      updatedAt: now
    };

    setRooms(prev => prev.map(r => r.id === roomId ? updatedTarget : r));
    try {
      const saved = JSON.parse(localStorage.getItem('pap_rooms_data') || '[]');
      const newSaved = saved.map(r => r.id === roomId ? updatedTarget : r);
      localStorage.setItem('pap_rooms_data', JSON.stringify(newSaved));
    } catch {}

    const ok = await syncRoomToFirestore(roomId, updatedTarget);
    if (ok) setLastCloudSync(new Date().toISOString());
    return { success: ok, room: updatedTarget };
  };

  const reorderRoomImages = async (roomId, fromIndex, toIndex) => {
    const now = new Date().toISOString();
    const currentRoom = rooms.find(r => r.id === roomId);
    if (!currentRoom || !Array.isArray(currentRoom.images)) return { success: false };
    if (fromIndex < 0 || fromIndex >= currentRoom.images.length || toIndex < 0 || toIndex >= currentRoom.images.length) {
      return { success: false };
    }

    const updatedImages = [...currentRoom.images];
    const [movedItem] = updatedImages.splice(fromIndex, 1);
    updatedImages.splice(toIndex, 0, movedItem);
    const updatedTarget = {
      ...currentRoom,
      images: updatedImages,
      image: updatedImages[0] || currentRoom.image || '',
      updatedAt: now
    };

    setRooms(prev => prev.map(r => r.id === roomId ? updatedTarget : r));
    try {
      const saved = JSON.parse(localStorage.getItem('pap_rooms_data') || '[]');
      const newSaved = saved.map(r => r.id === roomId ? updatedTarget : r);
      localStorage.setItem('pap_rooms_data', JSON.stringify(newSaved));
    } catch {}

    const ok = await syncRoomToFirestore(roomId, updatedTarget);
    if (ok) setLastCloudSync(new Date().toISOString());
    return { success: ok, room: updatedTarget };
  };

  const removeRoomImage = async (roomId, imageIndex) => {
    const now = new Date().toISOString();
    const currentRoom = rooms.find(r => r.id === roomId);
    if (!currentRoom || !Array.isArray(currentRoom.images)) return { success: false };

    const removedUrl = currentRoom.images[imageIndex];
    const updatedImages = currentRoom.images.filter((_, idx) => idx !== imageIndex);
    let newCover = currentRoom.image;
    if (currentRoom.image === removedUrl || !updatedImages.includes(currentRoom.image)) {
      newCover = updatedImages.length > 0 ? updatedImages[0] : '';
    }
    const updatedTarget = {
      ...currentRoom,
      images: updatedImages,
      image: newCover,
      updatedAt: now
    };

    setRooms(prev => prev.map(r => r.id === roomId ? updatedTarget : r));
    try {
      const saved = JSON.parse(localStorage.getItem('pap_rooms_data') || '[]');
      const newSaved = saved.map(r => r.id === roomId ? updatedTarget : r);
      localStorage.setItem('pap_rooms_data', JSON.stringify(newSaved));
    } catch {}

    const ok = await syncRoomToFirestore(roomId, updatedTarget);
    if (ok) setLastCloudSync(new Date().toISOString());
    return { success: ok, room: updatedTarget };
  };

  const setRoomPrimaryImage = async (roomId, imageIndex) => {
    const now = new Date().toISOString();
    const currentRoom = rooms.find(r => r.id === roomId);
    if (!currentRoom || !Array.isArray(currentRoom.images) || !currentRoom.images[imageIndex]) return { success: false };

    const selectedImg = currentRoom.images[imageIndex];
    const reordered = [selectedImg, ...currentRoom.images.filter((_, idx) => idx !== imageIndex)];
    const updatedTarget = {
      ...currentRoom,
      image: selectedImg,
      images: reordered,
      updatedAt: now
    };

    setRooms(prev => prev.map(r => r.id === roomId ? updatedTarget : r));
    try {
      const saved = JSON.parse(localStorage.getItem('pap_rooms_data') || '[]');
      const newSaved = saved.map(r => r.id === roomId ? updatedTarget : r);
      localStorage.setItem('pap_rooms_data', JSON.stringify(newSaved));
    } catch {}

    const ok = await syncRoomToFirestore(roomId, updatedTarget);
    if (ok) setLastCloudSync(new Date().toISOString());
    return { success: ok, room: updatedTarget };
  };

  // Property Spaces Management (Dining Hall & Reception Lounge)
  const updatePropertySpace = async (spaceId, updates) => {
    const now = new Date().toISOString();
    const currentSpace = (propertySpaces || []).find(s => s.id === spaceId);
    if (!currentSpace) return { success: false, error: 'Space not found' };

    const updatedTarget = {
      ...currentSpace,
      ...updates,
      updatedAt: now
    };

    setPropertySpaces(prev => prev.map(space => space.id === spaceId ? updatedTarget : space));
    try {
      const saved = JSON.parse(localStorage.getItem('pap_property_spaces') || '[]');
      const newSaved = saved.map(s => s.id === spaceId ? updatedTarget : s);
      localStorage.setItem('pap_property_spaces', JSON.stringify(newSaved));
    } catch {}

    const ok = await syncPropertySpaceToFirestore(spaceId, updatedTarget);
    if (ok) setLastCloudSync(new Date().toISOString());
    return { success: ok, space: updatedTarget };
  };

  const addSpaceImage = async (spaceId, imageUrl) => {
    if (!imageUrl) return { success: false };
    const now = new Date().toISOString();
    const currentSpace = (propertySpaces || []).find(s => s.id === spaceId);
    if (!currentSpace) return { success: false };

    const updatedImages = [...(currentSpace.images || []), imageUrl];
    const updatedTarget = {
      ...currentSpace,
      images: updatedImages,
      image: currentSpace.image || imageUrl,
      updatedAt: now
    };

    setPropertySpaces(prev => prev.map(space => space.id === spaceId ? updatedTarget : space));
    try {
      const saved = JSON.parse(localStorage.getItem('pap_property_spaces') || '[]');
      const newSaved = saved.map(s => s.id === spaceId ? updatedTarget : s);
      localStorage.setItem('pap_property_spaces', JSON.stringify(newSaved));
    } catch {}

    const ok = await syncPropertySpaceToFirestore(spaceId, updatedTarget);
    if (ok) setLastCloudSync(new Date().toISOString());
    return { success: ok, space: updatedTarget };
  };

  const replaceSpaceImage = async (spaceId, imageIndex, newImageUrl) => {
    if (!newImageUrl) return { success: false };
    const now = new Date().toISOString();
    const currentSpace = (propertySpaces || []).find(s => s.id === spaceId);
    if (!currentSpace || !Array.isArray(currentSpace.images)) return { success: false };

    const updatedImages = [...currentSpace.images];
    const wasCover = currentSpace.image === updatedImages[imageIndex] || imageIndex === 0;
    updatedImages[imageIndex] = newImageUrl;
    const updatedTarget = {
      ...currentSpace,
      images: updatedImages,
      image: wasCover ? newImageUrl : (currentSpace.image || newImageUrl),
      updatedAt: now
    };

    setPropertySpaces(prev => prev.map(space => space.id === spaceId ? updatedTarget : space));
    try {
      const saved = JSON.parse(localStorage.getItem('pap_property_spaces') || '[]');
      const newSaved = saved.map(s => s.id === spaceId ? updatedTarget : s);
      localStorage.setItem('pap_property_spaces', JSON.stringify(newSaved));
    } catch {}

    const ok = await syncPropertySpaceToFirestore(spaceId, updatedTarget);
    if (ok) setLastCloudSync(new Date().toISOString());
    return { success: ok, space: updatedTarget };
  };

  const reorderSpaceImages = async (spaceId, fromIndex, toIndex) => {
    const now = new Date().toISOString();
    const currentSpace = (propertySpaces || []).find(s => s.id === spaceId);
    if (!currentSpace || !Array.isArray(currentSpace.images)) return { success: false };
    if (fromIndex < 0 || fromIndex >= currentSpace.images.length || toIndex < 0 || toIndex >= currentSpace.images.length) {
      return { success: false };
    }

    const updatedImages = [...currentSpace.images];
    const [movedItem] = updatedImages.splice(fromIndex, 1);
    updatedImages.splice(toIndex, 0, movedItem);
    const updatedTarget = {
      ...currentSpace,
      images: updatedImages,
      image: updatedImages[0] || currentSpace.image || '',
      updatedAt: now
    };

    setPropertySpaces(prev => prev.map(space => space.id === spaceId ? updatedTarget : space));
    try {
      const saved = JSON.parse(localStorage.getItem('pap_property_spaces') || '[]');
      const newSaved = saved.map(s => s.id === spaceId ? updatedTarget : s);
      localStorage.setItem('pap_property_spaces', JSON.stringify(newSaved));
    } catch {}

    const ok = await syncPropertySpaceToFirestore(spaceId, updatedTarget);
    if (ok) setLastCloudSync(new Date().toISOString());
    return { success: ok, space: updatedTarget };
  };

  const removeSpaceImage = async (spaceId, imageIndex) => {
    const now = new Date().toISOString();
    const currentSpace = (propertySpaces || []).find(s => s.id === spaceId);
    if (!currentSpace || !Array.isArray(currentSpace.images)) return { success: false };

    const removedUrl = currentSpace.images[imageIndex];
    const newImages = currentSpace.images.filter((_, idx) => idx !== imageIndex);
    let newCover = currentSpace.image;
    if (currentSpace.image === removedUrl || !newImages.includes(currentSpace.image)) {
      newCover = newImages.length > 0 ? newImages[0] : '';
    }
    const updatedTarget = {
      ...currentSpace,
      images: newImages,
      image: newCover,
      updatedAt: now
    };

    setPropertySpaces(prev => prev.map(space => space.id === spaceId ? updatedTarget : space));
    try {
      const saved = JSON.parse(localStorage.getItem('pap_property_spaces') || '[]');
      const newSaved = saved.map(s => s.id === spaceId ? updatedTarget : s);
      localStorage.setItem('pap_property_spaces', JSON.stringify(newSaved));
    } catch {}

    const ok = await syncPropertySpaceToFirestore(spaceId, updatedTarget);
    if (ok) setLastCloudSync(new Date().toISOString());
    return { success: ok, space: updatedTarget };
  };

  const setSpacePrimaryImage = async (spaceId, imageIndex) => {
    const now = new Date().toISOString();
    const currentSpace = (propertySpaces || []).find(s => s.id === spaceId);
    if (!currentSpace || !Array.isArray(currentSpace.images) || !currentSpace.images[imageIndex]) return { success: false };

    const selectedImg = currentSpace.images[imageIndex];
    const reordered = [selectedImg, ...currentSpace.images.filter((_, idx) => idx !== imageIndex)];
    const updatedTarget = {
      ...currentSpace,
      image: selectedImg,
      images: reordered,
      updatedAt: now
    };

    setPropertySpaces(prev => prev.map(space => space.id === spaceId ? updatedTarget : space));
    try {
      const saved = JSON.parse(localStorage.getItem('pap_property_spaces') || '[]');
      const newSaved = saved.map(s => s.id === spaceId ? updatedTarget : s);
      localStorage.setItem('pap_property_spaces', JSON.stringify(newSaved));
    } catch {}

    const ok = await syncPropertySpaceToFirestore(spaceId, updatedTarget);
    if (ok) setLastCloudSync(new Date().toISOString());
    return { success: ok, space: updatedTarget };
  };

  // Hero Slides Management
  const addHeroSlide = (slide) => {
    if (!slide || !slide.url) return;
    setHeroSlides(prev => [
      ...prev,
      {
        url: slide.url,
        position: slide.position || 'center center',
        caption: slide.caption || ''
      }
    ]);
  };

  const removeHeroSlide = (index) => {
    setHeroSlides(prev => prev.filter((_, idx) => idx !== index));
  };

  const reorderHeroSlide = (index, direction) => {
    setHeroSlides(prev => {
      const copy = [...prev];
      const newIdx = direction === 'up' ? index - 1 : index + 1;
      if (newIdx < 0 || newIdx >= copy.length) return prev;
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

      // Sync to Firebase Cloud Firestore
      const ok = await syncHeroSlidesToFirestore(targetSlides);
      if (ok) setLastCloudSync(new Date().toISOString());

      // Publish to cloud store fallback for remote devices / mobile phones
      const cloudUrl = 'https://kvdb.io/4y9K3mP8vWq6xT2nZb7L1e/pap_cloud_hero_sync';
      fetch(cloudUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slides: targetSlides, timestamp })
      }).catch(() => null);

      return { success: ok };
    } catch (e) {
      console.warn('Publish slides error', e);
      return { success: false, error: e.message };
    }
  };

  // One-click Force Cloud Re-synchronization from Firestore
  const forceCloudResync = async () => {
    setFirestoreSyncStatus('syncing');
    try {
      const [cloudRooms, cloudSpaces, cloudHero] = await Promise.all([
        fetchLatestRoomsFromFirestore(),
        fetchLatestSpacesFromFirestore(),
        fetchLatestHeroFromFirestore()
      ]);

      if (Array.isArray(cloudRooms) && cloudRooms.length > 0) {
        setRooms(cloudRooms);
      }
      if (Array.isArray(cloudSpaces) && cloudSpaces.length > 0) {
        setPropertySpaces(cloudSpaces);
      }
      if (Array.isArray(cloudHero) && cloudHero.length > 0) {
        setHeroSlides(cloudHero);
      }
      setFirestoreSyncStatus('connected');
      setLastCloudSync(new Date().toISOString());
      return { success: true };
    } catch (err) {
      console.error('forceCloudResync error:', err);
      setFirestoreSyncStatus('offline');
      return { success: false, error: err.message };
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
      daysAgo: 0,
      createdAt: new Date().toISOString()
    };
    setBookings(prev => [bookingEntry, ...prev]);
    syncBookingToFirestore(bookingEntry);
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

    const totalUnits = Number(room.totalUnits) >= 1 ? Number(room.totalUnits) : 5;

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
    updateBookingStatusInFirestore(bookingId, newStatus);
  };

  const removeBooking = (bookingId) => {
    setBookings(prev => prev.filter(b => b.id !== bookingId));
    deleteBookingFromFirestore(bookingId);
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
        isFirebaseActive: isFirebaseConfigured(),
        firestoreSyncStatus,
        lastCloudSync,
        forceCloudResync,
        rooms,
        setRooms,
        addNewRoom,
        deleteRoom,
        updateRoom,
        addRoomImage,
        replaceRoomImage,
        reorderRoomImages,
        removeRoomImage,
        setRoomPrimaryImage,
        getEffectivePrice,
        getRoomInventory,
        propertySpaces,
        setPropertySpaces,
        updatePropertySpace,
        addSpaceImage,
        replaceSpaceImage,
        reorderSpaceImages,
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
