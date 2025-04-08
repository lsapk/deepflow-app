
import { HfInference } from '@huggingface/inference';

// Fonction pour obtenir toutes les habitudes (stub pour l'instant)
export const getAllHabits = async (): Promise<any[]> => {
  // Cette fonction devrait récupérer les habitudes depuis une base de données
  // Pour l'instant, on retourne juste un tableau vide
  return [];
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

// Importe la fonction getApiKey depuis aiService
function getApiKey(): string {
  // Import dynamique pour éviter les cycles d'importation
  const aiService = require('@/services/aiService');
  return aiService.getApiKey();
}
