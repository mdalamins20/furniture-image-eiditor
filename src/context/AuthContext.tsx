import React, { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { 
  type User, 
  onAuthStateChanged, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updateProfile,
  signOut,
  sendPasswordResetEmail,
  sendEmailVerification
} from 'firebase/auth';
import { auth, googleProvider, isFirebaseConfigured } from '../services/firebase';
import { useToast } from '../components/Common/ToastContext';
import { syncUserProfileToFirestore } from '../services/showroomService';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isConfigured: boolean;
  signInWithGoogle: () => Promise<boolean>;
  resetPassword: (email: string) => Promise<boolean>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string, displayName?: string) => Promise<void>;
  signOutUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { error: toastError, success: toastSuccess } = useToast();
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
      toastError('Firebase credentials are not configured in .env yet.');
      return false;
    }
    try {
      await signInWithPopup(auth, googleProvider);
      return true;
    } catch (err: unknown) {
      const error = err as { code?: string; message?: string };
      console.error('Google Sign-in failed:', error);
      if (error?.code === 'auth/unauthorized-domain') {
        toastError('ডোমেন অনুমোদিত নয়। Firebase Console > Authentication > Authorized domains-এ এই ডোমেনটি যোগ করুন।');
      } else if (error?.code !== 'auth/popup-closed-by-user') {
        toastError(`গুগল সাইন-ইন ব্যর্থ হয়েছে: ${error?.message || 'অজানা ত্রুটি'}`);
      }
      return false;
    }
  };

  const signInWithEmail = async (email: string, pass: string) => {
    if (!isFirebaseConfigured) {
      toastError('Firebase credentials are not configured in .env yet.');
      return;
    }
    await signInWithEmailAndPassword(auth, email, pass);
  };

  const signUpWithEmail = async (email: string, pass: string, displayName?: string) => {
    if (!isFirebaseConfigured) {
      toastError('Firebase credentials are not configured in .env yet.');
      return;
    }
    const cred = await createUserWithEmailAndPassword(auth, email, pass);
    try {
      await sendEmailVerification(cred.user);
    } catch {
      // Signup succeeded; verification mail failure must not undo it.
      toastError('ভেরিফিকেশন ইমেইল পাঠানো যায়নি, পরে আবার চেষ্টা করুন।');
    }
    if (displayName && cred.user) {
      await updateProfile(cred.user, { displayName });
      setUser({ ...cred.user, displayName });
    }
  };

  const resetPassword = async (email: string): Promise<boolean> => {
    if (!isFirebaseConfigured) {
      toastError('Firebase credentials are not configured in .env yet.');
      return false;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      toastSuccess('পাসওয়ার্ড রিসেট লিংক আপনার ইমেইলে পাঠানো হয়েছে।');
      return true;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'অজানা ত্রুটি';
      toastError(`পাসওয়ার্ড রিসেট ব্যর্থ হয়েছে: ${msg}`);
      return false;
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
      resetPassword,
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

