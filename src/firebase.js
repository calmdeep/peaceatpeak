import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAuth } from 'firebase/auth';

/**
 * Peace at Peak - Firebase Client Configuration
 * Keys are loaded securely from Vite environment variables (import.meta.env)
 */
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBGZrfipxfd8hckQRruTzgyg3Ct0Tj7RmU",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "peace-at-peak.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "peace-at-peak",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "peace-at-peak.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "519458890753",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:519458890753:web:e0ed0a259ac5037f604c00",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-DTKBXVR709"
};

/**
 * Checks whether valid Firebase credentials have been configured in .env / Vercel
 */
export const isFirebaseConfigured = () => {
  return Boolean(
    firebaseConfig.apiKey &&
    firebaseConfig.projectId &&
    !String(firebaseConfig.apiKey).includes('YOUR_') &&
    String(firebaseConfig.apiKey).length > 10
  );
};

let app = null;
let db = null;
let storage = null;
let auth = null;

if (isFirebaseConfigured()) {
  try {
    app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    db = getFirestore(app);
    storage = getStorage(app);
    auth = getAuth(app);
    console.log('🔥 [Peace at Peak] Firebase connected successfully (Firestore & Storage active).');
  } catch (err) {
    console.warn('⚠️ [Peace at Peak] Firebase initialization warning, running with local offline fallback:', err);
  }
} else {
  console.info('ℹ️ [Peace at Peak] Firebase credentials not yet configured. Operating in high-speed local storage mode.');
}

export { app, db, storage, auth };
export default app;
