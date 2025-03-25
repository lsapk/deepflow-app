
import { db } from './firebase';
import { collection, addDoc, getDocs, doc, getDoc, updateDoc, deleteDoc, query, where, orderBy, Timestamp, serverTimestamp } from 'firebase/firestore';
import { toast } from 'sonner';

export interface JournalEntry {
  id: string;
  title: string;
  content: string;
  mood?: 'great' | 'good' | 'neutral' | 'bad' | 'terrible';
  tags?: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
  userId: string;
}

export const addJournalEntry = async (userId: string, entry: Omit<JournalEntry, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => {
  try {
    const entryData = {
      ...entry,
      userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    const docRef = await addDoc(collection(db, 'journalEntries'), entryData);
    return {
      id: docRef.id,
      ...entryData
    };
  } catch (error) {
    console.error("Erreur lors de l'ajout d'une entrée de journal:", error);
    toast.error("Erreur lors de l'ajout de l'entrée de journal");
    throw error;
  }
};

export const getJournalEntries = async (userId: string) => {
  try {
    const q = query(
      collection(db, 'journalEntries'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as JournalEntry[];
  } catch (error) {
    console.error("Erreur lors de la récupération des entrées de journal:", error);
    toast.error("Erreur lors du chargement des entrées du journal");
    throw error;
  }
};

export const getJournalEntry = async (entryId: string) => {
  try {
    const docRef = doc(db, 'journalEntries', entryId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data()
      } as JournalEntry;
    } else {
      throw new Error("Entrée de journal non trouvée");
    }
  } catch (error) {
    console.error("Erreur lors de la récupération de l'entrée de journal:", error);
    toast.error("Erreur lors du chargement de l'entrée de journal");
    throw error;
  }
};

export const updateJournalEntry = async (entryId: string, updates: Partial<Omit<JournalEntry, 'id' | 'createdAt' | 'userId'>>) => {
  try {
    const entryRef = doc(db, 'journalEntries', entryId);
    await updateDoc(entryRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
    
    return {
      id: entryId,
      ...updates
    };
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'entrée de journal:", error);
    toast.error("Erreur lors de la mise à jour de l'entrée de journal");
    throw error;
  }
};

export const deleteJournalEntry = async (entryId: string) => {
  try {
    const entryRef = doc(db, 'journalEntries', entryId);
    await deleteDoc(entryRef);
    return true;
  } catch (error) {
    console.error("Erreur lors de la suppression de l'entrée de journal:", error);
    toast.error("Erreur lors de la suppression de l'entrée de journal");
    throw error;
  }
};
