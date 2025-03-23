
import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged, 
  User, 
  updateProfile,
  sendPasswordResetEmail
} from "firebase/auth";
import { toast } from "sonner";

// Votre configuration Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBt51Oj_RX-9gupLV90a_BXxxVSM8Xcy7k", // Ceci est une clé publique, pas d'inquiétude
  authDomain: "deepflow-app.firebaseapp.com",
  projectId: "deepflow-app",
  storageBucket: "deepflow-app.appspot.com",
  messagingSenderId: "862245633483",
  appId: "1:862245633483:web:80d3ebef4c2fa5c4faea01"
};

// Initialisation de Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Services d'authentification
export const registerUser = async (email: string, password: string, displayName: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // Mettre à jour le profil avec le nom d'utilisateur
    if (userCredential.user) {
      await updateProfile(userCredential.user, {
        displayName: displayName
      });
      
      toast.success("Compte créé avec succès!");
      return userCredential.user;
    }
  } catch (error: any) {
    let message = "Une erreur est survenue lors de l'inscription";
    
    if (error.code === 'auth/email-already-in-use') {
      message = "Cette adresse email est déjà utilisée";
    } else if (error.code === 'auth/invalid-email') {
      message = "Adresse email invalide";
    } else if (error.code === 'auth/weak-password') {
      message = "Le mot de passe est trop faible";
    }
    
    toast.error(message);
    throw new Error(message);
  }
};

export const loginUser = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    toast.success("Connexion réussie!");
    return userCredential.user;
  } catch (error: any) {
    let message = "Échec de la connexion";
    
    if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
      message = "Email ou mot de passe incorrect";
    } else if (error.code === 'auth/too-many-requests') {
      message = "Trop de tentatives échouées. Veuillez réessayer plus tard";
    }
    
    toast.error(message);
    throw new Error(message);
  }
};

export const logoutUser = async () => {
  try {
    await signOut(auth);
    toast.success("Déconnexion réussie");
    return true;
  } catch (error) {
    toast.error("Erreur lors de la déconnexion");
    throw error;
  }
};

export const resetPassword = async (email: string) => {
  try {
    await sendPasswordResetEmail(auth, email);
    toast.success("Email de réinitialisation envoyé!");
    return true;
  } catch (error: any) {
    let message = "Erreur lors de l'envoi de l'email de réinitialisation";
    
    if (error.code === 'auth/user-not-found') {
      message = "Aucun compte n'est associé à cet email";
    } else if (error.code === 'auth/invalid-email') {
      message = "Adresse email invalide";
    }
    
    toast.error(message);
    throw new Error(message);
  }
};

// Hook pour utiliser l'état de l'authentification
export const getCurrentUser = () => {
  return auth.currentUser;
};

export const authStateListener = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

export { auth };
