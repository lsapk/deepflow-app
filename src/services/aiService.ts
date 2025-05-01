
import { Message } from '@/components/analytics/ai-assistant/types';
import { v4 as uuidv4 } from 'uuid';
import { sendMessageToGemini } from './geminiService';

// Variable pour stocker la clé API
let currentApiKey = "AIzaSyAdOinCnHfqjOyk6XBbTzQkR_IOdRvlliU";

// Fonction pour définir une nouvelle clé API
export const setApiKey = (apiKey: string): void => {
  currentApiKey = apiKey;
};

// Fonction pour obtenir la clé API actuelle
export const getApiKey = (): string => {
  return currentApiKey;
};

// Type pour les messages du chat
interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

// Fonction pour envoyer des messages à l'API
export async function sendMessageToAI(
  messages: ChatMessage[],
): Promise<string> {
  try {
    // Utiliser Gemini AI
    return await sendMessageToGemini(messages);
  } catch (error) {
    console.error("Erreur lors de l'appel à l'API:", error);
    return "Désolé, une erreur s'est produite lors de la communication avec l'assistant IA. Veuillez réessayer.";
  }
}

// Fonction pour analyser les notes vocales
export async function analyzeNoteWithAI(noteText: string): Promise<string> {
  try {
    const messages: ChatMessage[] = [
      {
        role: "system",
        content: "Tu es un assistant spécialisé dans l'analyse de notes vocales. Ton objectif est de résumer, structurer et extraire les points clés et idées importantes de la transcription fournie. Format ta réponse en sections claires avec des puces pour les points clés."
      },
      {
        role: "user",
        content: `Analyse la note suivante et extrais-en les points clés, les idées principales et fournis un résumé structuré :\n\n${noteText}`
      }
    ];

    return await sendMessageToAI(messages);
  } catch (error) {
    console.error("Erreur lors de l'analyse de la note:", error);
    return "Désolé, je n'ai pas pu analyser cette note. Veuillez réessayer.";
  }
}
