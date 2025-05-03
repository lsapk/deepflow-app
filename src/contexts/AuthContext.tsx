
import * as React from 'react';
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

const AuthContext = React.createContext<AuthContextProps | undefined>(undefined);

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: React.ReactNode;
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

// Fonction pour récupérer les données du localStorage avec protection contre les exceptions
const getLocalData = (key: string): any => {
  try {
    const data = localStorage.getItem(key);
    if (!data) return null;
    
    // Validation basique pour éviter les injections JSON
    const parsed = JSON.parse(data);
    return parsed;
  } catch (error) {
    console.error(`Error retrieving ${key} from localStorage:`, error);
    // En cas d'erreur, supprimer la donnée corrompue
    localStorage.removeItem(key);
    return null;
  }
};

// Fonction pour sauvegarder les données dans le localStorage avec sanitization
const saveLocalData = (key: string, data: any): void => {
  try {
    // Vérification que les données sont sérialisables
    if (data === undefined || data === null || typeof data === 'function' || typeof data === 'symbol') {
      console.error(`Cannot save ${key} to localStorage: invalid data type`);
      return;
    }
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error saving ${key} to localStorage:`, error);
  }
};

// Nettoyage périodique des données de session expirées
const cleanupExpiredSessions = (): void => {
  try {
    const cachedSession = getLocalData('currentSession');
    if (cachedSession && cachedSession.expires_at) {
      const expiryDate = new Date(cachedSession.expires_at);
      if (expiryDate < new Date()) {
        localStorage.removeItem('currentSession');
        localStorage.removeItem('currentUser');
        localStorage.removeItem('userCredentials');
        console.log('Expired session data cleared');
      }
    }
  } catch (error) {
    console.error('Error cleaning expired sessions:', error);
  }
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = React.useState<ExtendedUser | null>(null);
  const [session, setSession] = React.useState<Session | null>(null);
  const [userProfile, setUserProfile] = React.useState<UserProfile | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [isOnline, setIsOnline] = React.useState(checkOnlineStatus());
  const [autoLoginAttempted, setAutoLoginAttempted] = React.useState(false);

  // Écouteur pour l'état de connexion
  React.useEffect(() => {
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
    
    // Nettoyage périodique des sessions expirées
    const cleanupInterval = setInterval(cleanupExpiredSessions, 60000); // Vérifier chaque minute
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(cleanupInterval);
    };
  }, []);

  // Effet pour gérer l'état d'authentification
  React.useEffect(() => {
    // Configuration du listener pour les changements d'état d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        // Éviter les mises à jour inutiles si la session n'a pas changé
        if (JSON.stringify(session) === JSON.stringify(newSession)) return;
        
        // Protection contre les injections de session
        if (newSession && (!newSession.access_token || !newSession.user)) {
          console.error("Session invalide détectée");
          return;
        }
        
        setSession(newSession);
        const adaptedUser = adaptUser(newSession?.user || null);
        setCurrentUser(adaptedUser);
        
        if (newSession?.user) {
          // Sauvegarder les données de session en local pour un accès hors ligne
          saveLocalData('currentSession', newSession);
          saveLocalData('currentUser', adaptedUser);
          
          // Différer le chargement du profil pour éviter de bloquer le changement d'état d'authentification
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

    // Vérification de session optimisée - ne s'exécute qu'une fois au démarrage
    const checkSession = async () => {
      try {
        // Nettoyer les sessions potentiellement expirées
        cleanupExpiredSessions();
        
        // Tenter d'abord de charger depuis le localStorage pour un accès immédiat
        const cachedSession = getLocalData('currentSession');
        const cachedUser = getLocalData('currentUser');
        const cachedProfile = getLocalData('userProfile');
        
        // Validation basique des données mises en cache
        const isValidCachedData = 
          cachedSession && 
          cachedUser && 
          typeof cachedSession === 'object' && 
          typeof cachedUser === 'object' &&
          cachedSession.user?.id === cachedUser.uid;
        
        if (isValidCachedData && !autoLoginAttempted) {
          setSession(cachedSession);
          setCurrentUser(cachedUser);
          if (cachedProfile && cachedProfile.id === cachedUser.uid) {
            setUserProfile(cachedProfile);
          }
          setAutoLoginAttempted(true);
          
          // Auto sign-in avec les identifiants stockés si disponibles
          const storedCredentials = getLocalData('userCredentials');
          if (storedCredentials && 
              typeof storedCredentials === 'object' && 
              storedCredentials.email && 
              typeof storedCredentials.email === 'string' &&
              storedCredentials.password && 
              typeof storedCredentials.password === 'string') {
            try {
              await loginUser(storedCredentials.email, storedCredentials.password);
              console.log("Auto-login successful");
            } catch (error) {
              console.error("Auto-login failed, but proceeding with cached data:", error);
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
              // Nous n'avons pas besoin d'attendre cela - il peut se charger en arrière-plan
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
      // Effacer le cache local
      localStorage.removeItem('currentSession');
      localStorage.removeItem('currentUser');
      localStorage.removeItem('userProfile');
      localStorage.removeItem('userCredentials'); 
      // Utiliser window.location.replace pour une redirection plus rapide
      window.location.replace('/signin');
      return Promise.resolve();
    } catch (error) {
      console.error("Logout error:", error);
      return Promise.reject(error);
    }
  };

  const signIn = async (email: string, password: string) => {
    // Validation des entrées
    if (!email || !password || typeof email !== 'string' || typeof password !== 'string') {
      throw new Error("Email et mot de passe requis");
    }
    
    try {
      setLoading(true);
      const user = await loginUser(email, password);
      
      // Stocker les identifiants pour l'auto-login
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
    // Validation des entrées
    if (!email || !password || !displayName) {
      throw new Error("Email, mot de passe et nom requis");
    }
    
    // Vérification de la force du mot de passe
    if (password.length < 8) {
      throw new Error("Le mot de passe doit contenir au moins 8 caractères");
    }
    
    try {
      setLoading(true);
      const user = await registerUser(email, password, displayName);
      
      // Stocker les identifiants pour l'auto-login après l'inscription
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
