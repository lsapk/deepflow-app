
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { 
  loginUser, 
  logoutUser, 
  registerUser, 
  signInWithGoogle, 
  UserProfile,
  getUserProfile
} from '@/services/supabase';

// Étendre l'interface User de Supabase pour ajouter des propriétés compatibles avec Firebase
interface ExtendedUser extends User {
  uid: string; // Alias pour id
  displayName?: string; // Alias pour user_metadata.display_name
  photoURL?: string; // Alias pour user_metadata.avatar_url
}

interface AuthContextProps {
  currentUser: ExtendedUser | null;
  session: Session | null;
  userProfile: UserProfile | null;
  loading: boolean;
  logout: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<ExtendedUser | undefined>;
  signInWithGoogle: () => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<ExtendedUser | undefined>;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

// Fonction utilitaire pour adapter l'utilisateur Supabase à notre format étendu
const adaptUser = (user: User | null): ExtendedUser | null => {
  if (!user) return null;
  
  return {
    ...user,
    uid: user.id,
    displayName: user.user_metadata?.display_name || user.user_metadata?.name || '',
    photoURL: user.user_metadata?.avatar_url || '',
  };
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [currentUser, setCurrentUser] = useState<ExtendedUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Effet pour gérer l'état d'authentification
  useEffect(() => {
    // Configuration du listener pour les changements d'état d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        // Avoid unnecessary state updates if session hasn't changed
        if (JSON.stringify(session) === JSON.stringify(newSession)) return;
        
        setSession(newSession);
        const adaptedUser = adaptUser(newSession?.user || null);
        setCurrentUser(adaptedUser);
        
        if (newSession?.user) {
          // Defer profile loading to avoid blocking the auth state change
          setTimeout(() => {
            getUserProfile(newSession.user.id)
              .then(profile => {
                setUserProfile(profile);
              })
              .catch(error => {
                console.error("Error loading user profile:", error);
              });
          }, 0);
        } else {
          setUserProfile(null);
        }
        
        setLoading(false);
      }
    );

    // Optimized session check - only runs once at startup
    const checkSession = async () => {
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        
        setSession(initialSession);
        const adaptedUser = adaptUser(initialSession?.user || null);
        setCurrentUser(adaptedUser);
        
        if (initialSession?.user) {
          // We don't need to await this - it can load in the background
          getUserProfile(initialSession.user.id)
            .then(profile => {
              setUserProfile(profile);
            })
            .catch(error => {
              console.error("Error checking user profile:", error);
            });
        }
      } catch (error) {
        console.error("Error checking session:", error);
      } finally {
        setLoading(false);
      }
    };

    checkSession();
    
    // Nettoyage au démontage
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const logout = async () => {
    try {
      await logoutUser();
      // Using window.location.replace for a faster redirect
      window.location.replace('/signin');
      return Promise.resolve();
    } catch (error) {
      console.error("Logout error:", error);
      return Promise.reject(error);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const user = await loginUser(email, password);
      return adaptUser(user);
    } catch (error: any) {
      console.error("Sign in error:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      await signInWithGoogle();
      // Pas de redirection ici car OAuth gère sa propre redirection
    } catch (error: any) {
      console.error("Google sign in error:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, displayName: string) => {
    try {
      setLoading(true);
      const user = await registerUser(email, password, displayName);
      return adaptUser(user);
    } catch (error: any) {
      console.error("Sign up error:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    currentUser,
    session,
    userProfile,
    loading,
    logout,
    signIn,
    signInWithGoogle: handleGoogleSignIn,
    signUp
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
