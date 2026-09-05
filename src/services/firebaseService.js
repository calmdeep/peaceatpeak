import { 
  collection, 
  doc, 
  getDocs,
  setDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot,
  query,
  orderBy
} from 'firebase/firestore';
import { 
  ref as storageRef, 
  uploadBytes, 
  getDownloadURL 
} from 'firebase/storage';
import { db, storage, isFirebaseConfigured } from '../firebase';

/**
 * ============================================================================
 * FIRESTORE: ROOMS (Cottages, Swiss Tents, Family Suites)
 * ============================================================================
 */

/**
 * Real-time listener for Rooms data
 * Calls onUpdate whenever any admin updates prices, availability, or units
 */
export function subscribeToRooms(onUpdate, onError) {
  if (!isFirebaseConfigured() || !db) {
    return () => {};
  }

  try {
    const roomsCol = collection(db, 'rooms');
    return onSnapshot(roomsCol, (snapshot) => {
      if (snapshot.empty) {
        onUpdate([]);
        return;
      }
      const roomsData = snapshot.docs.map(d => ({
        id: d.id,
        ...d.data()
      }));
      onUpdate(roomsData);
    }, (err) => {
      console.warn('Firestore rooms listener warning:', err);
      onError?.(err);
    });
  } catch (err) {
    console.warn('Failed to attach rooms listener:', err);
    return () => {};
  }
}

/**
 * Updates or creates a room document in Firestore
 */
export async function syncRoomToFirestore(roomId, roomData) {
  if (!isFirebaseConfigured() || !db) return false;
  try {
    const roomDoc = doc(db, 'rooms', roomId);
    await setDoc(roomDoc, {
      ...roomData,
      updatedAt: new Date().toISOString()
    }, { merge: true });
    return true;
  } catch (err) {
    console.error(`Failed to sync room ${roomId} to Firestore:`, err);
    return false;
  }
}

/**
 * Batch seed default rooms if Firestore is empty on initial setup
 */
export async function seedInitialRoomsIfEmpty(defaultRooms) {
  if (!isFirebaseConfigured() || !db) return false;
  try {
    const roomsCol = collection(db, 'rooms');
    const existing = await getDocs(roomsCol);
    if (existing.empty && Array.isArray(defaultRooms)) {
      console.log('Seeding default rooms to Cloud Firestore...');
      for (const room of defaultRooms) {
        await setDoc(doc(db, 'rooms', room.id), room, { merge: true });
      }
    }
    return true;
  } catch (err) {
    console.warn('Initial rooms seed check warning:', err);
    return false;
  }
}

/**
 * ============================================================================
 * FIRESTORE: BOOKINGS / RESERVATIONS
 * ============================================================================
 */

/**
 * Real-time listener for Reservations & Bookings
 */
export function subscribeToBookings(onUpdate, onError) {
  if (!isFirebaseConfigured() || !db) {
    return () => {};
  }

  try {
    const bookingsCol = collection(db, 'bookings');
    return onSnapshot(bookingsCol, (snapshot) => {
      const bookingsData = snapshot.docs.map(d => ({
        id: d.id,
        ...d.data()
      }));
      // Sort newest first
      bookingsData.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
      onUpdate(bookingsData);
    }, (err) => {
      console.warn('Firestore bookings listener warning:', err);
      onError?.(err);
    });
  } catch (err) {
    console.warn('Failed to attach bookings listener:', err);
    return () => {};
  }
}

/**
 * Creates or updates a booking record in Firestore
 */
export async function syncBookingToFirestore(booking) {
  if (!isFirebaseConfigured() || !db) return false;
  try {
    const bookingId = booking.id || `PAP-${Date.now()}`;
    const bookingDoc = doc(db, 'bookings', String(bookingId));
    await setDoc(bookingDoc, {
      ...booking,
      id: bookingId,
      updatedAt: new Date().toISOString()
    }, { merge: true });
    return true;
  } catch (err) {
    console.error('Failed to sync booking to Firestore:', err);
    return false;
  }
}

/**
 * Updates booking status (confirmed, checked-in, cancelled)
 */
export async function updateBookingStatusInFirestore(bookingId, status) {
  if (!isFirebaseConfigured() || !db) return false;
  try {
    const bookingDoc = doc(db, 'bookings', String(bookingId));
    await updateDoc(bookingDoc, {
      status,
      updatedAt: new Date().toISOString()
    });
    return true;
  } catch (err) {
    console.error(`Failed to update booking ${bookingId} in Firestore:`, err);
    return false;
  }
}

/**
 * Deletes a booking from Firestore
 */
export async function deleteBookingFromFirestore(bookingId) {
  if (!isFirebaseConfigured() || !db) return false;
  try {
    const bookingDoc = doc(db, 'bookings', String(bookingId));
    await deleteDoc(bookingDoc);
    return true;
  } catch (err) {
    console.error(`Failed to delete booking ${bookingId} from Firestore:`, err);
    return false;
  }
}

/**
 * ============================================================================
 * FIRESTORE: PROPERTY SPACES (Dining Hall & Reception Lounge)
 * ============================================================================
 */

export function subscribeToPropertySpaces(onUpdate) {
  if (!isFirebaseConfigured() || !db) return () => {};
  try {
    const spacesCol = collection(db, 'property_spaces');
    return onSnapshot(spacesCol, (snapshot) => {
      if (snapshot.empty) return;
      const spaces = snapshot.docs.map(d => ({
        id: d.id,
        ...d.data()
      }));
      onUpdate(spaces);
    });
  } catch (err) {
    console.warn('Failed to subscribe to property spaces:', err);
    return () => {};
  }
}

export async function syncPropertySpaceToFirestore(spaceId, spaceData) {
  if (!isFirebaseConfigured() || !db) return false;
  try {
    const spaceDoc = doc(db, 'property_spaces', spaceId);
    await setDoc(spaceDoc, {
      ...spaceData,
      updatedAt: new Date().toISOString()
    }, { merge: true });
    return true;
  } catch (err) {
    console.error(`Failed to sync space ${spaceId} to Firestore:`, err);
    return false;
  }
}

/**
 * ============================================================================
 * FIRESTORE: HERO SLIDESHOW
 * ============================================================================
 */

export function subscribeToHeroSlides(onUpdate) {
  if (!isFirebaseConfigured() || !db) return () => {};
  try {
    const heroDoc = doc(db, 'site_content', 'hero_slides');
    return onSnapshot(heroDoc, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        if (Array.isArray(data.slides)) {
          onUpdate(data.slides);
        }
      }
    });
  } catch (err) {
    console.warn('Failed to subscribe to hero slides:', err);
    return () => {};
  }
}

export async function syncHeroSlidesToFirestore(slides) {
  if (!isFirebaseConfigured() || !db) return false;
  try {
    const heroDoc = doc(db, 'site_content', 'hero_slides');
    await setDoc(heroDoc, {
      slides,
      updatedAt: new Date().toISOString()
    }, { merge: true });
    return true;
  } catch (err) {
    console.error('Failed to sync hero slides to Firestore:', err);
    return false;
  }
}

/**
 * ============================================================================
 * FIREBASE STORAGE: HIGH-RES PHOTO UPLOADS
 * ============================================================================
 */

/**
 * Uploads an image file to Firebase Storage and returns permanent public CDN URL
 * @param {File|Blob} file - The file to upload
 * @param {string} folder - 'rooms' | 'spaces' | 'hero'
 * @returns {Promise<string>} - Permanent public download URL
 */
export async function uploadResortImageToStorage(file, folder = 'resort_images') {
  if (!isFirebaseConfigured() || !storage) {
    throw new Error('Firebase Storage is not configured yet. Add your Firebase keys to .env to enable cloud storage.');
  }

  const sanitizedName = (file.name || 'photo.jpg').replace(/[^a-zA-Z0-9._-]/g, '_');
  const timestamp = Date.now();
  const filePath = `${folder}/${timestamp}_${sanitizedName}`;
  const fileRef = storageRef(storage, filePath);

  // Upload file
  const snapshot = await uploadBytes(fileRef, file, {
    contentType: file.type || 'image/jpeg',
    cacheControl: 'public, max-age=31536000'
  });

  // Get download URL
  const downloadUrl = await getDownloadURL(snapshot.ref);
  return downloadUrl;
}
