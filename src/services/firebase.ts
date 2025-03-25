
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
  getDocs,
  addDoc,
  updateDoc,
  serverTimestamp,
  Timestamp
} from "firebase/firestore";
import { 
  getStorage, 
  ref as storageRef, 
  uploadBytes, 
  getDownloadURL 
} from "firebase/storage";
import { toast } from "sonner";

// Configuration Firebase
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
      },
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };
    
    // Create default user profile
    const userProfile = {
      displayName,
      email,
      bio: '',
      photoURL: '',
      createdAt: Timestamp.now(),
      lastActive: Timestamp.now(),
    };

    // Créer les collections principales de l'utilisateur
    const collections = {
      tasks: [],
      habits: [],
      journals: [],
      goals: [],
      focusSessions: []
    };
    
    // Exécuter toutes les opérations d'écriture
    await setDoc(doc(db, "userSettings", userId), defaultSettings);
    await setDoc(doc(db, "userProfiles", userId), userProfile);
    await setDoc(doc(db, `users/${userId}`), {
      createdAt: Timestamp.now(),
      lastActive: Timestamp.now(),
      collections
    });

    console.log("User collections initialized successfully");
    toast.success("Compte initialisé avec succès");
  } catch (error) {
    console.error("Error initializing user collections:", error);
    toast.error("Erreur lors de l'initialisation du compte");
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
      
      try {
        const profileSnap = await getDoc(userProfileRef);
        if (profileSnap.exists()) {
          // Update existing profile
          await updateDoc(userProfileRef, { 
            lastActive: Timestamp.now() 
          });
        } else {
          // If profile doesn't exist, create it with basic info
          const displayName = userCredential.user.displayName || 'Utilisateur';
          await setDoc(userProfileRef, {
            displayName: displayName,
            email: userCredential.user.email,
            bio: '',
            photoURL: userCredential.user.photoURL || '',
            createdAt: Timestamp.now(),
            lastActive: Timestamp.now(),
          });
          
          // Also create default settings if they don't exist
          const userSettingsRef = doc(db, "userSettings", userCredential.user.uid);
          const settingsSnap = await getDoc(userSettingsRef);
          
          if (!settingsSnap.exists()) {
            await setDoc(userSettingsRef, {
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
              },
              createdAt: Timestamp.now(),
              updatedAt: Timestamp.now()
            });
          }
        }
      } catch (err) {
        console.error("Error updating user profile on login:", err);
      }
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
      await updateDoc(userProfileRef, { 
        lastActive: Timestamp.now() 
      });
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
    const updateData: any = { 
      ...updates,
      updatedAt: Timestamp.now() 
    };
    
    // Remove photoURL from updates if it's not changed to avoid overwriting
    if (updates.photoURL === undefined) {
      delete updateData.photoURL;
    }
    
    // Update auth profile if displayName or photoURL is provided
    if (updates.displayName || updates.photoURL) {
      const profileUpdates: { displayName?: string; photoURL?: string } = {};
      
      if (updates.displayName) {
        profileUpdates.displayName = updates.displayName;
      }
      
      if (updates.photoURL) {
        profileUpdates.photoURL = updates.photoURL;
      }
      
      await updateProfile(user, profileUpdates);
    }
    
    // Update Firestore profile
    const userProfileRef = doc(db, "userProfiles", user.uid);
    await updateDoc(userProfileRef, updateData);
    
    toast.success("Profil mis à jour avec succès");
    return true;
  } catch (error) {
    console.error("Error updating profile:", error);
    toast.error("Erreur lors de la mise à jour du profil");
    throw error;
  }
};

// File upload helpers
export const uploadProfileImage = async (user: User, file: File): Promise<string> => {
  try {
    // Create a reference to the user's profile image with a unique timestamp
    const fileRef = storageRef(storage, `profile_images/${user.uid}/${Date.now()}_${file.name}`);
    
    // Validate file type and size before upload
    if (!file.type.match('image.*')) {
      throw new Error('Le fichier doit être une image');
    }
    
    if (file.size > 5 * 1024 * 1024) { // 5MB max
      throw new Error('La taille de l\'image ne doit pas dépasser 5MB');
    }
    
    // Upload file
    const snapshot = await uploadBytes(fileRef, file);
    console.log('Image uploaded successfully:', snapshot);
    
    // Get download URL
    const downloadURL = await getDownloadURL(fileRef);
    console.log('Download URL:', downloadURL);
    
    // Update user profile with the new photo URL
    await updateProfile(user, {
      photoURL: downloadURL
    });
    
    // Update the Firestore profile as well
    const userProfileRef = doc(db, "userProfiles", user.uid);
    await updateDoc(userProfileRef, { 
      photoURL: downloadURL,
      updatedAt: Timestamp.now() 
    });
    
    toast.success("Photo de profil mise à jour avec succès");
    return downloadURL;
  } catch (error: any) {
    console.error("Error uploading image:", error);
    toast.error(error.message || "Erreur lors de l'upload de la photo de profil");
    throw error;
  }
};

// Firestore helpers for user data
export const saveUserData = async (userId: string, collectionName: string, data: any) => {
  try {
    // Vérifie si l'utilisateur existe pour éviter les erreurs
    const userRef = doc(db, `users/${userId}`);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      // Créer l'utilisateur s'il n'existe pas
      await setDoc(userRef, {
        createdAt: Timestamp.now()
      });
    }
    
    // Ajoute les timestamps
    const dataWithTimestamps = {
      ...data,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      userId
    };
    
    // Ajoute les données à la collection
    const docRef = await addDoc(collection(db, `users/${userId}/${collectionName}`), dataWithTimestamps);
    
    toast.success(`${collectionName} enregistré avec succès`);
    return {
      id: docRef.id,
      ...dataWithTimestamps
    };
  } catch (error) {
    console.error(`Error saving ${collectionName}:`, error);
    toast.error(`Erreur lors de l'enregistrement de ${collectionName}`);
    throw error;
  }
};

export const updateUserData = async (userId: string, collectionName: string, docId: string, data: any) => {
  try {
    const dataWithTimestamp = {
      ...data,
      updatedAt: Timestamp.now()
    };
    
    const docRef = doc(db, `users/${userId}/${collectionName}/${docId}`);
    await updateDoc(docRef, dataWithTimestamp);
    
    toast.success(`${collectionName} mis à jour avec succès`);
    return {
      id: docId,
      ...dataWithTimestamp
    };
  } catch (error) {
    console.error(`Error updating ${collectionName}:`, error);
    toast.error(`Erreur lors de la mise à jour de ${collectionName}`);
    throw error;
  }
};

export const getUserData = async (userId: string, collectionName: string) => {
  try {
    const q = query(collection(db, `users/${userId}/${collectionName}`));
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
