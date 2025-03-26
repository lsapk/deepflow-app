
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { GoogleAuthProvider, signInWithPopup, getAuth } from 'firebase/auth';
import { authStateListener, logoutUser, loginUser, registerUser } from '../services/firebase';

interface AuthContextProps {
  currentUser: User | null;
  loading: boolean;
  logout: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<User | undefined>;
  signInWithGoogle: () => Promise<User | undefined>;
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
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = authStateListener((user) => {
      console.log("Auth state changed:", user ? "User logged in" : "User logged out");
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const logout = async () => {
    try {
      await logoutUser();
      toast.success("Déconnexion réussie");
      navigate('/signin');
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Erreur lors de la déconnexion");
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const user = await loginUser(email, password);
      toast.success("Connexion réussie");
      return user;
    } catch (error: any) {
      console.error("Sign in error:", error);
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        toast.error("Email ou mot de passe incorrect");
      } else if (error.code === 'auth/too-many-requests') {
        toast.error("Trop de tentatives. Veuillez réessayer plus tard");
      } else {
        toast.error("Erreur de connexion. Veuillez réessayer");
      }
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    try {
      const auth = getAuth();
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      toast.success("Connexion avec Google réussie");
      return result.user;
    } catch (error: any) {
      console.error("Google sign in error:", error);
      if (error.code === 'auth/popup-closed-by-user') {
        toast.error("Connexion annulée");
      } else {
        toast.error("Erreur lors de la connexion avec Google");
      }
      throw error;
    }
  };

  const signUp = async (email: string, password: string, displayName: string) => {
    try {
      const user = await registerUser(email, password, displayName);
      toast.success("Inscription réussie");
      return user;
    } catch (error: any) {
      console.error("Sign up error:", error);
      if (error.code === 'auth/email-already-in-use') {
        toast.error("Cet email est déjà utilisé");
      } else if (error.code === 'auth/weak-password') {
        toast.error("Le mot de passe est trop faible");
      } else if (error.code === 'auth/invalid-email') {
        toast.error("L'adresse email est invalide");
      } else {
        toast.error("Erreur lors de l'inscription");
      }
      throw error;
    }
  };

  const value = {
    currentUser,
    loading,
    logout,
    signIn,
    signInWithGoogle,
    signUp
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
