
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { 
  loginUser, 
  logoutUser, 
  registerUser, 
  signInWithGoogle, 
  UserProfile,
  getUserProfile
} from '@/services/supabase';

interface AuthContextProps {
  currentUser: User | null;
  session: Session | null;
  userProfile: UserProfile | null;
  loading: boolean;
  logout: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<User | undefined>;
  signInWithGoogle: () => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<User | undefined>;
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

export function AuthProvider({ children }: AuthProviderProps) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Effet pour gérer l'état d'authentification
  useEffect(() => {
    // Configuration du listener pour les changements d'état d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log("Auth state changed:", event, newSession?.user ? "User logged in" : "User logged out");
        
        setSession(newSession);
        setCurrentUser(newSession?.user || null);
        
        if (newSession?.user) {
          // Charger le profil de l'utilisateur
          const profile = await getUserProfile(newSession.user.id);
          setUserProfile(profile);
        } else {
          setUserProfile(null);
        }
        
        setLoading(false);
      }
    );

    // Vérification de la session existante
    const checkSession = async () => {
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        
        setSession(initialSession);
        setCurrentUser(initialSession?.user || null);
        
        if (initialSession?.user) {
          // Charger le profil de l'utilisateur
          const profile = await getUserProfile(initialSession.user.id);
          setUserProfile(profile);
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
      navigate('/signin');
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const user = await loginUser(email, password);
      return user;
    } catch (error: any) {
      console.error("Sign in error:", error);
      throw error;
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
      // Pas de redirection ici car OAuth gère sa propre redirection
    } catch (error: any) {
      console.error("Google sign in error:", error);
      throw error;
    }
  };

  const signUp = async (email: string, password: string, displayName: string) => {
    try {
      const user = await registerUser(email, password, displayName);
      return user;
    } catch (error: any) {
      console.error("Sign up error:", error);
      throw error;
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
