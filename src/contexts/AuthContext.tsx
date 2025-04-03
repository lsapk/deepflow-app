
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
import { toast } from 'sonner';

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
  isOnline: boolean;
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

// Fonction pour vérifier l'état de connexion
const checkOnlineStatus = (): boolean => {
  return typeof navigator !== 'undefined' ? navigator.onLine : true;
};

// Fonction pour récupérer les données du localStorage
const getLocalData = (key: string): any => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error(`Error retrieving ${key} from localStorage:`, error);
    return null;
  }
};

// Fonction pour sauvegarder les données dans le localStorage
const saveLocalData = (key: string, data: any): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error saving ${key} to localStorage:`, error);
  }
};

// Fix: Properly define AuthProvider as a React functional component
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<ExtendedUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(checkOnlineStatus());
  const [autoLoginAttempted, setAutoLoginAttempted] = useState(false);

  // Écouteur pour l'état de connexion
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Informer le service worker que nous sommes de retour en ligne
      if (navigator.serviceWorker && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: 'APP_ACTIVE'
        });
      }
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      toast.info("Vous êtes hors ligne. Les modifications seront synchronisées lorsque vous serez à nouveau connecté.");
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

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
          // Sauvegarder les données de session en local pour un accès hors ligne
          saveLocalData('currentSession', newSession);
          saveLocalData('currentUser', adaptedUser);
          
          // Defer profile loading to avoid blocking the auth state change
          setTimeout(() => {
            getUserProfile(newSession.user.id)
              .then(profile => {
                if (profile) {
                  setUserProfile(profile);
                  saveLocalData('userProfile', profile);
                }
              })
              .catch(error => {
                console.error("Error loading user profile:", error);
                // Essayer de charger depuis le localStorage en cas d'erreur
                const cachedProfile = getLocalData('userProfile');
                if (cachedProfile && cachedProfile.id === newSession.user.id) {
                  setUserProfile(cachedProfile);
                }
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
        // Tenter d'abord de charger depuis le localStorage pour un accès immédiat
        const cachedSession = getLocalData('currentSession');
        const cachedUser = getLocalData('currentUser');
        const cachedProfile = getLocalData('userProfile');
        
        if (cachedUser && cachedSession && !autoLoginAttempted) {
          setSession(cachedSession);
          setCurrentUser(cachedUser);
          setUserProfile(cachedProfile);
          setAutoLoginAttempted(true);
          
          // Auto sign-in with stored credentials if available
          const storedCredentials = getLocalData('userCredentials');
          if (storedCredentials && storedCredentials.email && storedCredentials.password) {
            try {
              await loginUser(storedCredentials.email, storedCredentials.password);
              // Successful silent login
              console.log("Auto-login successful");
            } catch (error) {
              console.error("Auto-login failed, but proceeding with cached data:", error);
              // Continue with cached data even if auto-login fails
            }
          }
        }
        
        if (isOnline) {
          const { data: { session: initialSession } } = await supabase.auth.getSession();
          
          if (initialSession) {
            setSession(initialSession);
            const adaptedUser = adaptUser(initialSession?.user || null);
            setCurrentUser(adaptedUser);
            saveLocalData('currentSession', initialSession);
            saveLocalData('currentUser', adaptedUser);
            
            if (initialSession?.user) {
              // We don't need to await this - it can load in the background
              getUserProfile(initialSession.user.id)
                .then(profile => {
                  if (profile) {
                    setUserProfile(profile);
                    saveLocalData('userProfile', profile);
                  }
                })
                .catch(error => {
                  console.error("Error checking user profile:", error);
                });
            }
          }
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
  }, [isOnline, autoLoginAttempted, session]);

  const logout = async () => {
    try {
      await logoutUser();
      // Clear local cache
      localStorage.removeItem('currentSession');
      localStorage.removeItem('currentUser');
      localStorage.removeItem('userProfile');
      localStorage.removeItem('userCredentials'); // Clear stored credentials
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
      
      // Store credentials for auto login
      saveLocalData('userCredentials', { email, password });
      
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
      
      // Store credentials for auto login after registration
      saveLocalData('userCredentials', { email, password });
      
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
    isOnline,
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
};
