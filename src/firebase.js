import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAuth } from 'firebase/auth';

/**
 * Peace at Peak - Firebase Client Configuration
 * Keys are loaded securely from Vite environment variables (import.meta.env)
 */
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
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
