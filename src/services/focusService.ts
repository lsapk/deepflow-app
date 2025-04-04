
import { collection, query, where, getDocs, Timestamp, doc, getDoc } from 'firebase/firestore';
import { db } from './firebase';

export interface FocusSession {
  id: string;
  userId: string;
  duration: number;
  completedAt: Timestamp;
}

export interface UserFocusData {
  completedSessions: number;
  totalTimeMinutes: number;
  lastSessionAt: Timestamp;
  playSound: boolean;
  showNotification: boolean;
  volume: number;
}

/**
 * Récupère les sessions de focus pour un utilisateur et une date spécifique
 */
export const getFocusSessions = async (userId: string, date: Date): Promise<FocusSession[]> => {
  try {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    
    const startTimestamp = Timestamp.fromDate(startOfDay);
    const endTimestamp = Timestamp.fromDate(endOfDay);
    
    const sessionsRef = collection(db, 'focusSessions');
    const q = query(
      sessionsRef,
      where('userId', '==', userId),
      where('completedAt', '>=', startTimestamp),
      where('completedAt', '<=', endTimestamp)
    );
    
    const snapshot = await getDocs(q);
    const sessions: FocusSession[] = [];
    
    snapshot.forEach(doc => {
      sessions.push({
        id: doc.id,
        ...doc.data()
      } as FocusSession);
    });
    
    return sessions;
  } catch (error) {
    console.error('Erreur lors de la récupération des sessions focus:', error);
    return [];
  }
};

/**
 * Récupère les données de focus d'un utilisateur
 */
export const getUserFocusData = async (userId: string): Promise<UserFocusData | null> => {
  try {
    const userFocusRef = doc(db, 'userFocus', userId);
    const userFocusDoc = await getDoc(userFocusRef);
    
    if (userFocusDoc.exists()) {
      return userFocusDoc.data() as UserFocusData;
    }
    
    return null;
  } catch (error) {
    console.error('Erreur lors de la récupération des données focus de l\'utilisateur:', error);
    return null;
  }
};
