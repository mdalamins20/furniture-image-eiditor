import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics, isSupported } from 'firebase/analytics';

// Firebase config.
// CRITICAL FIX (2026-10-31, blank Pages page): the Firebase SDK throws
// "auth/invalid-api-key" at import time if apiKey is an empty string, which
// crashed the whole app before it could render anything when no .env is
// present (GitHub Pages, local preview). So when the env keys are missing,
// use a clearly fake, non-empty placeholder ONLY so the SDK objects can be
// created. This is NOT a real project: isFirebaseConfigured is false in
// that case, and callers must not make Firebase calls (AuthContext returns
// early, showroomService falls back to localStorage). Real keys in .env
// always take precedence.
export const isFirebaseConfigured = Boolean(
  import.meta.env.VITE_FIREBASE_API_KEY &&
  import.meta.env.VITE_FIREBASE_PROJECT_ID
);

const firebaseConfig = isFirebaseConfigured
  ? {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: import.meta.env.VITE_FIREBASE_APP_ID,
      measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || undefined
    }
  : {
      apiKey: 'local-only-placeholder',
      authDomain: 'local-only',
      projectId: 'local-only',
      storageBucket: 'local-only',
      messagingSenderId: '0',
      appId: 'local-only'
    };

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
export const storage = getStorage(app);

// Safe Analytics Initialization
if (typeof window !== 'undefined' && isFirebaseConfigured) {
  isSupported().then((supported) => {
    if (supported) {
      getAnalytics(app);
    }
  }).catch(() => {});
}

// Enable offline persistence for Firestore if supported in browser
if (typeof window !== 'undefined' && isFirebaseConfigured) {
  try {
    enableIndexedDbPersistence(db).catch(() => {
      // Persistence can fail if multiple tabs are open; safely ignored
    });
  } catch {
    // Ignore offline persistence setup errors
  }
}

export default app;

