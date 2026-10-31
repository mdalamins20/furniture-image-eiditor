import React, { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { 
  type User, 
  onAuthStateChanged, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updateProfile,
  signOut 
} from 'firebase/auth';
import { auth, googleProvider, isFirebaseConfigured } from '../services/firebase';
import { syncUserProfileToFirestore } from '../services/showroomService';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isConfigured: boolean;
  signInWithGoogle: () => Promise<boolean>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string, displayName?: string) => Promise<void>;
  signOutUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isFirebaseConfigured) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      if (currentUser) {
        syncUserProfileToFirestore(currentUser);
      }
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    if (!isFirebaseConfigured) {
      alert('Firebase credentials are not configured in .env yet.');
      return false;
    }
    try {
      await signInWithPopup(auth, googleProvider);
      return true;
    } catch (err: unknown) {
      const error = err as { code?: string; message?: string };
      console.error('Google Sign-in failed:', error);
      if (error?.code === 'auth/unauthorized-domain') {
        alert(
          '❌ ডোমেন অনুমোদিত নয় (Unauthorized Domain)!\n\n' +
          'Firebase Console-এ এই ডোমেনটি যোগ করতে হবে:\n' +
          '1. Firebase Console > Authentication > Settings > Authorized domains-এ যান।\n' +
          `2. "${window.location.hostname}" ডোমেনটি যুক্ত করুন।`
        );
      } else if (error?.code !== 'auth/popup-closed-by-user') {
        alert(`গুগল সাইন-ইন ব্যর্থ হয়েছে: ${error?.message || 'অজানা ত্রুটি'}`);
      }
      return false;
    }
  };

  const signInWithEmail = async (email: string, pass: string) => {
    if (!isFirebaseConfigured) {
      alert('Firebase credentials are not configured in .env yet.');
      return;
    }
    await signInWithEmailAndPassword(auth, email, pass);
  };

  const signUpWithEmail = async (email: string, pass: string, displayName?: string) => {
    if (!isFirebaseConfigured) {
      alert('Firebase credentials are not configured in .env yet.');
      return;
    }
    const cred = await createUserWithEmailAndPassword(auth, email, pass);
    if (displayName && cred.user) {
      await updateProfile(cred.user, { displayName });
      setUser({ ...cred.user, displayName });
    }
  };

  const signOutUser = async () => {
    if (isFirebaseConfigured) {
      await signOut(auth);
    }
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      isConfigured: isFirebaseConfigured,
      signInWithGoogle,
      signInWithEmail,
      signUpWithEmail,
      signOutUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

