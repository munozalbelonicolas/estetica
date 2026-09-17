'use client';

import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import {
  User as FirebaseUser,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  sendEmailVerification,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { auth, googleProvider, isAdminEmail } from '@/lib/firebase';
import { getUserProfile, setUserProfile, getProfessionals, UserProfile } from '@/lib/firestore-service';

interface AuthContextType {
  user: FirebaseUser | null;
  userProfile: UserProfile | null;
  loading: boolean;
  roles: string[];
  isAdmin: boolean;
  isProfessional: boolean;
  isClient: boolean;
  loginWithEmail: (email: string, password: string) => Promise<UserProfile | null>;
  registerWithEmail: (
    email: string,
    password: string,
    profileData: { firstName: string; lastName: string; phone?: string; birthDate?: string }
  ) => Promise<UserProfile>;
  loginWithGoogle: () => Promise<UserProfile>;
  resetPassword: (email: string) => Promise<void>;
  resendVerificationEmail: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfileState] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const isRegisteringRef = useRef(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);

      if (isRegisteringRef.current) {
        return;
      }

      if (firebaseUser) {
        try {
          let profile = await getUserProfile(firebaseUser.uid, firebaseUser.email || undefined);
          const shouldBeAdmin = isAdminEmail(firebaseUser.email);
          const profs = await getProfessionals();
          const isRegisteredProf = profs.some(
            (p) => p.email && p.email.toLowerCase() === (firebaseUser.email || '').toLowerCase()
          );

          if (!profile) {
            // Split displayName or fallback
            const names = (firebaseUser.displayName || '').split(' ');
            const firstName = names[0] || 'Usuario';
            const lastName = names.slice(1).join(' ') || '';

            const initialRoles: string[] = ['client'];
            if (shouldBeAdmin) initialRoles.push('admin');
            if (isRegisteredProf) initialRoles.push('professional');

            profile = {
              uid: firebaseUser.uid,
              email: firebaseUser.email || '',
              firstName,
              lastName,
              avatarUrl: firebaseUser.photoURL || '',
              roles: initialRoles,
              emailVerified: firebaseUser.emailVerified,
            };
            try {
              await setUserProfile(firebaseUser.uid, profile);
            } catch (saveErr) {
              console.warn('Could not persist profile to Firestore:', saveErr);
            }
          } else {
            let rolesToUpdate = [...(profile.roles || [])];
            let changed = false;

            if (shouldBeAdmin && !rolesToUpdate.map((r) => r.toLowerCase()).includes('admin')) {
              rolesToUpdate.push('admin');
              changed = true;
            }
            if (isRegisteredProf && !rolesToUpdate.map((r) => r.toLowerCase()).includes('professional')) {
              rolesToUpdate.push('professional');
              changed = true;
            }

            if (changed) {
              profile.roles = Array.from(new Set(rolesToUpdate));
              try {
                await setUserProfile(firebaseUser.uid, { roles: profile.roles });
              } catch (saveErr) {
                console.warn('Could not persist updated roles to Firestore:', saveErr);
              }
            }
          }

          if (profile?.isBlocked) {
            setUser(null);
            setUserProfileState(null);
            await signOut(auth);
            setLoading(false);
            return;
          }

          setUserProfileState(profile);
        } catch (err) {
          console.error('Error fetching/setting user profile in Firestore:', err);
          const shouldBeAdmin = isAdminEmail(firebaseUser.email);
          setUserProfileState({
            uid: firebaseUser.uid,
            email: firebaseUser.email || '',
            firstName: firebaseUser.displayName || 'Usuario',
            lastName: '',
            roles: shouldBeAdmin ? ['admin', 'professional', 'client'] : ['client'],
            emailVerified: firebaseUser.emailVerified,
          });
        }
      } else {
        setUserProfileState(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithEmail = async (email: string, password: string): Promise<UserProfile | null> => {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    const shouldBeAdmin = isAdminEmail(cred.user.email);
    let profile: UserProfile | null = null;

    try {
      profile = await getUserProfile(cred.user.uid, cred.user.email || email);
    } catch (e) {
      console.warn('Could not fetch user profile from Firestore:', e);
    }

    if (profile?.isBlocked) {
      await signOut(auth);
      throw new Error('Esta cuenta se encuentra bloqueada/suspendida por la administración.');
    }

    if (!profile) {
      profile = {
        uid: cred.user.uid,
        email: cred.user.email || email,
        firstName: cred.user.displayName || 'Usuario',
        lastName: '',
        roles: shouldBeAdmin ? ['admin', 'client'] : ['client'],
        emailVerified: cred.user.emailVerified,
      };
      try {
        await setUserProfile(cred.user.uid, profile);
      } catch (saveErr) {
        console.warn('Could not persist profile to Firestore:', saveErr);
      }
    } else if (shouldBeAdmin && !profile.roles?.includes('admin')) {
      const updatedRoles = Array.from(new Set([...(profile.roles || []), 'admin']));
      profile.roles = updatedRoles;
      try {
        await setUserProfile(cred.user.uid, { roles: updatedRoles });
      } catch (saveErr) {
        console.warn('Could not persist admin role to Firestore:', saveErr);
      }
    }

    setUserProfileState(profile);
    return profile;
  };

  const registerWithEmail = async (
    email: string,
    password: string,
    profileData: { firstName: string; lastName: string; phone?: string; birthDate?: string }
  ): Promise<UserProfile> => {
    isRegisteringRef.current = true;
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      
      // Send email verification
      try {
        await sendEmailVerification(cred.user);
      } catch (e) {
        console.warn('Could not send verification email:', e);
      }

      const shouldBeAdmin = isAdminEmail(email);
      const profile: UserProfile = {
        uid: cred.user.uid,
        email: cred.user.email || email,
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        phone: profileData.phone || '',
        birthDate: profileData.birthDate || '',
        roles: shouldBeAdmin ? ['admin', 'client'] : ['client'],
        emailVerified: false,
      };

      try {
        await setUserProfile(cred.user.uid, profile);
      } catch (saveErr) {
        console.warn('Could not persist profile to Firestore:', saveErr);
      }

      setUserProfileState(profile);
      return profile;
    } finally {
      isRegisteringRef.current = false;
    }
  };

  const loginWithGoogle = async (): Promise<UserProfile> => {
    const cred = await signInWithPopup(auth, googleProvider);
    const shouldBeAdmin = isAdminEmail(cred.user.email);
    let profile: UserProfile | null = null;

    try {
      profile = await getUserProfile(cred.user.uid, cred.user.email || undefined);
    } catch (e) {
      console.warn('Could not fetch user profile from Firestore:', e);
    }

    if (profile?.isBlocked) {
      await signOut(auth);
      throw new Error('Esta cuenta se encuentra bloqueada/suspendida por la administración.');
    }

    if (!profile) {
      const names = (cred.user.displayName || '').split(' ');
      const firstName = names[0] || 'Usuario';
      const lastName = names.slice(1).join(' ') || '';

      profile = {
        uid: cred.user.uid,
        email: cred.user.email || '',
        firstName,
        lastName,
        avatarUrl: cred.user.photoURL || '',
        roles: shouldBeAdmin ? ['admin', 'client'] : ['client'],
        emailVerified: true, // Google accounts are verified
      };
      try {
        await setUserProfile(cred.user.uid, profile);
      } catch (saveErr) {
        console.warn('Could not persist profile to Firestore:', saveErr);
      }
    } else if (shouldBeAdmin && !profile.roles?.includes('admin')) {
      const updatedRoles = Array.from(new Set([...(profile.roles || []), 'admin']));
      profile.roles = updatedRoles;
      try {
        await setUserProfile(cred.user.uid, { roles: updatedRoles });
      } catch (saveErr) {
        console.warn('Could not persist admin role to Firestore:', saveErr);
      }
    }

    setUserProfileState(profile);
    return profile;
  };

  const resetPassword = async (email: string): Promise<void> => {
    await sendPasswordResetEmail(auth, email);
  };

  const resendVerificationEmail = async (): Promise<void> => {
    if (auth.currentUser) {
      await sendEmailVerification(auth.currentUser);
    }
  };

  const logout = async (): Promise<void> => {
    await signOut(auth);
    setUser(null);
    setUserProfileState(null);
  };

  const roles = userProfile?.roles || [];
  const normalizedRoles = roles.map((r) => r.toLowerCase());
  const isAdmin = normalizedRoles.includes('admin') || isAdminEmail(user?.email);
  const isProfessional = normalizedRoles.includes('professional') || isAdmin;
  const isClient = normalizedRoles.includes('client');

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        loading,
        roles,
        isAdmin,
        isProfessional,
        isClient,
        loginWithEmail,
        registerWithEmail,
        loginWithGoogle,
        resetPassword,
        resendVerificationEmail,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
