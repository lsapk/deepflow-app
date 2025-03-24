
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
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  collection,
  where, 
  query,
  getDocs
} from "firebase/firestore";
import { 
  getStorage, 
  ref as storageRef, 
  uploadBytes, 
  getDownloadURL 
} from "firebase/storage";
import { toast } from "sonner";

// Configuration Firebase - With updated API key and project ID
const firebaseConfig = {
  apiKey: "AIzaSyBWFY7Tg4-VOuUJP4qBKdR4I_BaJNM99AI",
  authDomain: "deep-flow-rkayer.firebaseapp.com",
  projectId: "deep-flow-rkayer",
  storageBucket: "deep-flow-rkayer.appspot.com",
  messagingSenderId: "862245633483",
  appId: "1:862245633483:web:80d3ebef4c2fa5c4faea01"
};

// Initialisation de Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Initialisation des collections par défaut pour un nouvel utilisateur
const initializeUserCollections = async (userId: string, displayName: string, email: string) => {
  try {
    // Create default settings
    const defaultSettings = {
      theme: 'system',
      language: 'fr',
      notificationsEnabled: true,
      soundEnabled: true,
      focusMode: false,
      clockFormat: '24h',
      privacy: {
        shareActivity: false,
        publicProfile: false,
        dataCollection: true,
      }
    };
    
    // Create default user profile
    const userProfile = {
      displayName,
      email,
      bio: '',
      createdAt: new Date().toISOString(),
      lastActive: new Date().toISOString(),
    };
    
    // Create batch writes for initial user data
    await setDoc(doc(db, "userSettings", userId), defaultSettings);
    await setDoc(doc(db, "userProfiles", userId), userProfile);
    
    // Create empty collections for user data
    const emptyCollections = [
      "tasks", 
      "habits", 
      "goals", 
      "journalEntries", 
      "focusSessions"
    ];
    
    for (const collectionName of emptyCollections) {
      // Just create a sample document that will be a placeholder
      // In a real app, you might want to create specific schemas for each collection
      await setDoc(doc(db, `users/${userId}/${collectionName}/placeholder`), {
        isPlaceholder: true,
        createdAt: new Date().toISOString()
      });
    }
    
    console.log("User collections initialized successfully");
  } catch (error) {
    console.error("Error initializing user collections:", error);
  }
};

// Services d'authentification
export const registerUser = async (email: string, password: string, displayName: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // Mettre à jour le profil avec le nom d'utilisateur
    if (userCredential.user) {
      await updateProfile(userCredential.user, {
        displayName: displayName
      });
      
      // Initialize collections for the new user
      await initializeUserCollections(userCredential.user.uid, displayName, email);
      
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
    
    // Update last active timestamp
    if (userCredential.user) {
      const userProfileRef = doc(db, "userProfiles", userCredential.user.uid);
      await setDoc(userProfileRef, { lastActive: new Date().toISOString() }, { merge: true });
    }
    
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
    // Update last active timestamp before logout
    if (auth.currentUser) {
      const userProfileRef = doc(db, "userProfiles", auth.currentUser.uid);
      await setDoc(userProfileRef, { lastActive: new Date().toISOString() }, { merge: true });
    }
    
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

// Profile management
export const updateUserProfile = async (user: User, updates: any) => {
  try {
    // Update auth profile
    await updateProfile(user, {
      displayName: updates.displayName || user.displayName,
      photoURL: updates.photoURL || user.photoURL
    });
    
    // Update Firestore profile
    const userProfileRef = doc(db, "userProfiles", user.uid);
    await setDoc(userProfileRef, { 
      ...updates,
      updatedAt: new Date().toISOString() 
    }, { merge: true });
    
    return true;
  } catch (error) {
    console.error("Error updating profile:", error);
    throw error;
  }
};

// File upload helpers
export const uploadProfileImage = async (user: User, file: File): Promise<string> => {
  try {
    // Create a reference to the user's profile image
    const fileRef = storageRef(storage, `profile_images/${user.uid}/${Date.now()}_${file.name}`);
    
    // Validate file type and size before upload
    if (!file.type.match('image.*')) {
      throw new Error('Le fichier doit être une image');
    }
    
    if (file.size > 5 * 1024 * 1024) { // 5MB max
      throw new Error('La taille de l\'image ne doit pas dépasser 5MB');
    }
    
    // Upload file
    await uploadBytes(fileRef, file);
    
    // Get download URL
    const downloadURL = await getDownloadURL(fileRef);
    
    // Update user profile with the new photo URL
    await updateProfile(user, {
      photoURL: downloadURL
    });
    
    // Update the Firestore profile as well
    const userProfileRef = doc(db, "userProfiles", user.uid);
    await setDoc(userProfileRef, { 
      photoURL: downloadURL,
      updatedAt: new Date().toISOString() 
    }, { merge: true });
    
    return downloadURL;
  } catch (error) {
    console.error("Error uploading image:", error);
    throw error;
  }
};

// Firestore helpers
export const getUserData = async (userId: string, collectionName: string) => {
  try {
    const q = query(collection(db, `users/${userId}/${collectionName}`), where("isPlaceholder", "!=", true));
    const querySnapshot = await getDocs(q);
    
    const data: any[] = [];
    querySnapshot.forEach((doc) => {
      data.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return data;
  } catch (error) {
    console.error(`Error getting ${collectionName}:`, error);
    throw error;
  }
};

// Hook pour utiliser l'état de l'authentification
export const getCurrentUser = () => {
  return auth.currentUser;
};

export const authStateListener = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

export { auth, db, storage };
