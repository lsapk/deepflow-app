
import { db, auth, storage } from './firebase';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { updateProfile } from 'firebase/auth';
import { toast } from 'sonner';

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  bio?: string;
  theme?: 'light' | 'dark' | 'system';
  language?: 'fr' | 'en';
  createdAt?: any;
  lastActive?: any;
  notifications?: {
    email: boolean;
    push: boolean;
    tasks: boolean;
    habits: boolean;
  };
}

export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    const userRef = doc(db, 'userProfiles', userId);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      return {
        uid: userId,
        ...userSnap.data()
      } as UserProfile;
    } else {
      // Créer un profil s'il n'existe pas
      const user = auth.currentUser;
      if (user) {
        const newProfile: Omit<UserProfile, 'uid'> = {
          displayName: user.displayName || 'Utilisateur',
          email: user.email || '',
          photoURL: user.photoURL || '',
          theme: 'system',
          language: 'fr',
          createdAt: serverTimestamp(),
          lastActive: serverTimestamp(),
          notifications: {
            email: true,
            push: true,
            tasks: true,
            habits: true
          }
        };
        
        await setDoc(userRef, newProfile);
        
        return {
          uid: userId,
          ...newProfile
        };
      }
      return null;
    }
  } catch (error) {
    console.error("Erreur lors de la récupération du profil utilisateur:", error);
    // Utilisation silencieuse pour éviter les notifications excessives
    return null;
  }
};

export const updateUserProfile = async (userId: string, updates: Partial<Omit<UserProfile, 'uid' | 'email' | 'createdAt'>>) => {
  try {
    const userRef = doc(db, 'userProfiles', userId);
    const user = auth.currentUser;
    
    if (!user) {
      throw new Error("Utilisateur non connecté");
    }
    
    // Mettre à jour le profil dans Firestore
    await updateDoc(userRef, {
      ...updates,
      lastActive: serverTimestamp()
    });
    
    // Mettre à jour le profil dans Firebase Auth si nécessaire
    if (updates.displayName || updates.photoURL) {
      await updateProfile(user, {
        displayName: updates.displayName || user.displayName,
        photoURL: updates.photoURL || user.photoURL
      });
    }
    
    toast.success("Profil mis à jour avec succès");
    
    return {
      uid: userId,
      ...updates
    };
  } catch (error) {
    console.error("Erreur lors de la mise à jour du profil:", error);
    toast.error("Erreur lors de la mise à jour du profil");
    throw error;
  }
};

export const uploadProfileImage = async (userId: string, file: File): Promise<string> => {
  try {
    const storageRef = ref(storage, `profile_images/${userId}/${Date.now()}_${file.name}`);
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);
    
    // Mettre à jour l'URL de la photo de profil
    await updateUserProfile(userId, { photoURL: downloadURL });
    
    return downloadURL;
  } catch (error) {
    console.error("Erreur lors du téléchargement de l'image de profil:", error);
    toast.error("Erreur lors du téléchargement de l'image");
    throw error;
  }
};

export const updateUserSettings = async (userId: string, settings: { theme?: 'light' | 'dark' | 'system', language?: 'fr' | 'en', notifications?: { email: boolean, push: boolean, tasks: boolean, habits: boolean } }) => {
  try {
    const userRef = doc(db, 'userProfiles', userId);
    
    await updateDoc(userRef, {
      ...settings,
      lastActive: serverTimestamp()
    });
    
    toast.success("Paramètres mis à jour avec succès");
    
    return settings;
  } catch (error) {
    console.error("Erreur lors de la mise à jour des paramètres:", error);
    toast.error("Erreur lors de la sauvegarde des paramètres");
    throw error;
  }
};
