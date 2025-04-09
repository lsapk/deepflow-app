
import { getApiKey } from '@/services/aiService';

// Fonction pour obtenir toutes les habitudes (stub pour l'instant)
export const getAllHabits = async (): Promise<any[]> => {
  // Cette fonction devrait récupérer les habitudes depuis une base de données
  try {
    // Access IndexedDB directly to get all habits
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('deepflow-db', 1);

      request.onerror = (event) => {
        console.error('Error opening IndexedDB:', event);
        resolve([]);
      };

      request.onsuccess = (event) => {
        const db = request.result;
        if (!db.objectStoreNames.contains('habits')) {
          resolve([]);
          return;
        }

        const transaction = db.transaction(['habits'], 'readonly');
        const store = transaction.objectStore('habits');
        const getAllRequest = store.getAll();

        getAllRequest.onsuccess = () => {
          resolve(getAllRequest.result || []);
        };

        getAllRequest.onerror = (event) => {
          console.error('Error getting habits:', event);
          resolve([]);
        };
      };
    });
  } catch (error) {
    console.error("Error fetching habits:", error);
    return [];
  }
};

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
