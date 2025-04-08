
import { HfInference } from '@huggingface/inference';
import { getApiKey } from '@/services/aiService';

// Fonction pour obtenir toutes les habitudes
export const getAllHabits = async (): Promise<any[]> => {
  try {
    // Récupération des habitudes depuis IndexedDB
    const dbRequest = window.indexedDB.open("app-database", 1);
    
    return new Promise((resolve, reject) => {
      dbRequest.onerror = () => {
        console.error("Erreur lors de l'ouverture de la base de données");
        resolve([]); // En cas d'erreur, retourner un tableau vide
      };
      
      dbRequest.onsuccess = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        try {
          // Vérifier si le store "habits" existe
          if (!db.objectStoreNames.contains("habits")) {
            resolve([]);
            return;
          }
          
          const transaction = db.transaction(["habits"], "readonly");
          const store = transaction.objectStore("habits");
          const request = store.getAll();
          
          request.onsuccess = () => {
            resolve(request.result || []);
          };
          
          request.onerror = () => {
            console.error("Erreur lors de la récupération des habitudes");
            resolve([]);
          };
        } catch (error) {
          console.error("Erreur lors de l'accès au store habits:", error);
          resolve([]);
        }
      };
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des habitudes:", error);
    return [];
  }
};

// Instance HuggingFace pour la transcription
export const hfInstance = new HfInference(getApiKey());

// Fonction pour transcrire l'audio
export const transcribeAudio = async (audioBlob: Blob): Promise<string> => {
  try {
    // Prepare the FormData with the audio file
    const formData = new FormData();
    formData.append('file', audioBlob, 'audio.webm');
    formData.append('model', 'openai/whisper-large-v3');

    // Make the API request
    const response = await fetch('https://api-inference.huggingface.co/models/openai/whisper-large-v3', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getApiKey()}`
      },
      body: formData
    });

    if (!response.ok) {
      throw new Error(`Erreur API: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    return result.text || '';
  } catch (error) {
    console.error('Error transcribing audio:', error);
    throw error;
  }
};
