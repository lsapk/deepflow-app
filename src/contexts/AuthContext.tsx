
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
  const navigate = useNavigate();

  // Effet pour gérer l'état d'authentification
  useEffect(() => {
    // Configuration du listener pour les changements d'état d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log("Auth state changed:", event, newSession?.user ? "User logged in" : "User logged out");
        
        setSession(newSession);
        const adaptedUser = adaptUser(newSession?.user || null);
        setCurrentUser(adaptedUser);
        
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
        const adaptedUser = adaptUser(initialSession?.user || null);
        setCurrentUser(adaptedUser);
        
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
      // Redirection manuelle pour s'assurer que la navigation se produit
      window.location.href = '/signin';
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const user = await loginUser(email, password);
      return adaptUser(user);
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
      return adaptUser(user);
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
