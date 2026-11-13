import { 
  collection, doc, getDocs, setDoc, deleteDoc, 
  onSnapshot, query, orderBy, serverTimestamp 
} from 'firebase/firestore';
import type { User } from 'firebase/auth';
import { db, isFirebaseConfigured } from './firebase';
import { triggerInAppDialog } from '../context/DialogContext';
import { SHOWROOMS, type ShowroomItem } from '../types';
import { uploadToCloudinary, isCloudinaryConfigured } from './cloudinaryService';

/**
 * Synchronize Google authenticated user profile to Firestore `users/{uid}`
 */
export const syncUserProfileToFirestore = async (user: User): Promise<void> => {
  if (!isFirebaseConfigured || !user) return;
  try {
    const userDocRef = doc(db, 'users', user.uid);
    await setDoc(userDocRef, {
      uid: user.uid,
      displayName: user.displayName || '',
      email: user.email || '',
      photoURL: user.photoURL || '',
      lastLoginAt: serverTimestamp()
    }, { merge: true });
  } catch (err) {
    console.warn('Failed to sync user profile to Firestore:', err);
  }
};

/**
 * Helper: Compress and convert image file to high-clarity lightweight Base64 Data URL.
 * Automatically resizes to max 320x320px to keep size under ~25KB (100% Free inside Firestore & LocalStorage).
 */
export const fileToBase64 = (
  file: File,
  maxWidth = 320,
  maxHeight = 320,
  quality = 0.85
): Promise<string> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const rawResult = e.target?.result as string;
      if (typeof window === 'undefined') {
        resolve(rawResult);
        return;
      }
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(rawResult);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        // Preserve PNG transparency or use WebP
        const format = file.type === 'image/png' ? 'image/png' : 'image/webp';
        const compressedDataUrl = canvas.toDataURL(format, quality);
        resolve(compressedDataUrl);
      };
      img.onerror = () => resolve(rawResult);
      img.src = rawResult;
    };
    reader.onerror = () => resolve('');
    reader.readAsDataURL(file);
  });
};

const getStorageKey = (userId?: string | null) => {
  return userId ? `furniture_custom_showrooms_${userId}` : 'furniture_custom_showrooms_guest';
};

// Helper: Read custom showrooms from local storage (User-isolated)
export const getLocalCustomShowrooms = (userId?: string | null): ShowroomItem[] => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(getStorageKey(userId));
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
};

// Helper: Save custom showrooms to local storage (User-isolated)
export const setLocalCustomShowrooms = (items: ShowroomItem[], userId?: string | null): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(getStorageKey(userId), JSON.stringify(items));
  } catch (err) {
    console.error('Failed to save to local storage', err);
  }
};

// Combine system default showrooms with custom showrooms
export const combineShowrooms = (customShowrooms: ShowroomItem[]): ShowroomItem[] => {
  // Return custom showrooms first, then defaults
  return [...customShowrooms, ...SHOWROOMS];
};

/**
 * Upload logo file: 100% Free Zero-Cost Cloud Strategy
 * 1. Cloudinary CDN (Instant, global CDN, 25GB free monthly bandwidth, 6s strict timeout)
 * 2. Guaranteed Fallback: Browser compressed Base64 stored in Firestore & LocalStorage (100% free, 0 CORS issues, instant)
 */
export const uploadLogo = async (
  file: File, 
  _userId?: string | null
): Promise<string> => {
  // Strategy 1: Cloudinary CDN if accessible
  if (isCloudinaryConfigured) {
    try {
      const cdnUrl = await uploadToCloudinary(file);
      if (cdnUrl) return cdnUrl;
    } catch (err) {
      console.warn('Cloudinary upload skipped or timed out, falling back to compressed base64:', err);
    }
  }

  // Strategy 2: Guaranteed 100% Free Compressed WebP/PNG Base64 in Firestore / LocalStorage
  // Resizes to max 320x320, keeping size ~15-25KB. Works 100% offline, 0 CORS issues, instant save.
  return await fileToBase64(file);
};

/**
 * Load all showrooms:
 * - If user logged in and Firestore configured: merges Firestore showrooms with defaults.
 * - Otherwise: merges LocalStorage showrooms with defaults.
 */
export const loadShowrooms = async (userId?: string | null): Promise<ShowroomItem[]> => {
  if (isFirebaseConfigured && userId) {
    try {
      const showroomsRef = collection(db, `users/${userId}/showrooms`);
      const q = query(showroomsRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const remoteItems: ShowroomItem[] = [];
      snapshot.forEach(docSnap => {
        remoteItems.push({ id: docSnap.id, ...(docSnap.data() as Omit<ShowroomItem, 'id'>) });
      });
      // Also cache to local storage (user-isolated)
      setLocalCustomShowrooms(remoteItems, userId);
      return combineShowrooms(remoteItems);
    } catch (err) {
      console.warn('Failed to load from Firestore, falling back to local storage:', err);
    }
  }
  return combineShowrooms(getLocalCustomShowrooms(userId));
};

/**
 * Save new showroom:
 * - Saves to Firestore (if logged in)
 * - Always saves to LocalStorage
 */
export const saveCustomShowroom = async (
  data: { name: string; numbers: string; logoUrl?: string },
  logoFile?: File,
  userId?: string | null
): Promise<ShowroomItem> => {
  let logoUrl = data.logoUrl || '';

  if (logoFile) {
    logoUrl = await uploadLogo(logoFile, userId);
  }

  const id = 'custom-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7);
  const newShowroom: ShowroomItem = {
    id,
    name: data.name.trim(),
    numbers: data.numbers.trim(),
    logoUrl: logoUrl || undefined,
    isDefault: false,
    createdAt: Date.now(),
    updatedAt: Date.now()
  };

  // 1. Save to Local Storage (user-isolated)
  const localList = getLocalCustomShowrooms(userId);
  const updatedLocal = [newShowroom, ...localList.filter(s => s.id !== id)];
  setLocalCustomShowrooms(updatedLocal, userId);

  // 2. Save to Firestore if available
  if (isFirebaseConfigured && userId) {
    try {
      const docRef = doc(db, `users/${userId}/showrooms`, id);
      await setDoc(docRef, {
        name: newShowroom.name,
        numbers: newShowroom.numbers,
        logoUrl: newShowroom.logoUrl || '',
        isDefault: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    } catch (err: any) {
      console.error('Firestore save failed (Check Firebase Console Security Rules):', err);
      if (err?.code === 'permission-denied') {
        triggerInAppDialog({
          type: 'warning',
          title: 'ফায়ারবেস পারমিশন সতর্কবার্তা',
          message: 'ফায়ারবেস সিকিউরিটি রুলস পারমিশন না দেওয়ায় ক্লাউডে সেভ হয়নি। অনুগ্রহ করে Firebase Console-এ Rules আপডেট করুন।',
          confirmText: 'বুঝেছি'
        });
      }
    }
  }

  return newShowroom;
};

/**
 * Update existing showroom
 */
export const updateCustomShowroom = async (
  id: string,
  data: Partial<ShowroomItem>,
  logoFile?: File,
  userId?: string | null
): Promise<ShowroomItem | null> => {
  const localList = getLocalCustomShowrooms(userId);
  const index = localList.findIndex(s => s.id === id);
  if (index === -1) return null;

  let logoUrl = data.logoUrl ?? localList[index].logoUrl;
  if (logoFile) {
    logoUrl = await uploadLogo(logoFile, userId);
  }

  const updatedItem: ShowroomItem = {
    ...localList[index],
    ...data,
    logoUrl: logoUrl || undefined,
    updatedAt: Date.now()
  };

  localList[index] = updatedItem;
  setLocalCustomShowrooms(localList, userId);

  if (isFirebaseConfigured && userId) {
    try {
      const docRef = doc(db, `users/${userId}/showrooms`, id);
      await setDoc(docRef, {
        name: updatedItem.name,
        numbers: updatedItem.numbers,
        logoUrl: updatedItem.logoUrl || '',
        isDefault: false,
        updatedAt: serverTimestamp()
      }, { merge: true });
    } catch (err) {
      console.warn('Failed to update showroom in Firestore:', err);
    }
  }

  return updatedItem;
};

/**
 * Delete a custom showroom
 */
export const deleteCustomShowroom = async (
  id: string,
  userId?: string | null
): Promise<void> => {
  const localList = getLocalCustomShowrooms(userId);
  setLocalCustomShowrooms(localList.filter(s => s.id !== id), userId);

  if (isFirebaseConfigured && userId) {
    try {
      const docRef = doc(db, `users/${userId}/showrooms`, id);
      await deleteDoc(docRef);
    } catch (err) {
      console.warn('Failed to delete showroom from Firestore:', err);
    }
  }
};

/**
 * Real-time subscription to showroom changes
 */
export const subscribeShowrooms = (
  userId: string | null,
  onUpdate: (showrooms: ShowroomItem[]) => void
): (() => void) => {
  // Always emit initial local state immediately
  onUpdate(combineShowrooms(getLocalCustomShowrooms(userId)));

  if (!isFirebaseConfigured || !userId) {
    // Return dummy unsubscribe
    return () => {};
  }

  try {
    const showroomsRef = collection(db, `users/${userId}/showrooms`);
    const q = query(showroomsRef, orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const remoteItems: ShowroomItem[] = [];
      snapshot.forEach(docSnap => {
        remoteItems.push({ id: docSnap.id, ...(docSnap.data() as Omit<ShowroomItem, 'id'>) });
      });
      // Update local storage and UI
      setLocalCustomShowrooms(remoteItems, userId);
      onUpdate(combineShowrooms(remoteItems));
    }, (err) => {
      console.warn('Firestore subscription error (Rules may need to be published):', err);
      // Fallback: Keep local custom showrooms so UI never empties unexpectedly
      onUpdate(combineShowrooms(getLocalCustomShowrooms(userId)));
    });

    return unsubscribe;
  } catch (err) {
    console.warn('Could not set up Firestore subscription:', err);
    return () => {};
  }
};

