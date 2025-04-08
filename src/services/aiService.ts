
import { Message } from '@/components/analytics/ai-assistant/types';

// Variable pour stocker la clé API
let currentApiKey = "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";

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

// Format de conversation pour Mistral
function formatConversation(messages: ChatMessage[]): string {
  let conversation = "";
  
  messages.forEach((message, index) => {
    if (message.role === "user") {
      conversation += `[INST] ${message.content} [/INST]\n`;
    } else if (message.role === "system") {
      // Inclure le message système au début
      if (index === 0) {
        conversation += `[INST] <system>\n${message.content}\n</system> [/INST]\n`;
      }
    } else {
      // Pour un message assistant, ajouter simplement son contenu
      conversation += `${message.content}\n`;
    }
  });
  
  return conversation.trim();
}

// Fonction pour envoyer des messages à l'API
export async function sendMessageToAI(
  messages: ChatMessage[],
): Promise<string> {
  try {
    console.log("Envoi de la requête à l'API Hugging Face");

    // Appel à l'API Hugging Face
    const response = await fetch("https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${currentApiKey}`,
      },
      body: JSON.stringify({
        inputs: formatConversation(messages),
        parameters: {
          max_new_tokens: 1000,
          temperature: 0.7,
          top_p: 0.95,
          return_full_text: false
        }
      }),
    });

    if (!response.ok) {
      throw new Error(`Erreur API: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    // Parse the response correctly - handle multiple formats
    try {
      let content = data[0]?.generated_text || "";
      
      // Check if the content is a JSON string that needs parsing
      if (content.includes('{"role":') || content.includes('"content":')) {
        try {
          // Extract valid JSON
          const jsonMatch = content.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const jsonString = jsonMatch[0];
            const parsed = JSON.parse(jsonString);
            return parsed.content || content;
          }
        } catch (parseError) {
          console.log("Erreur parsing JSON, utilisation du texte brut", parseError);
        }
      }
      
      return content;
    } catch (error) {
      console.error("Erreur lors du traitement de la réponse:", error);
      return data[0]?.generated_text || "Désolé, je n'ai pas pu traiter votre demande.";
    }
  } catch (error) {
    console.error("Erreur lors de l'appel à l'API:", error);
    return "Désolé, une erreur s'est produite lors de la communication avec l'assistant IA. Veuillez réessayer.";
  }
}

// Nouvelle fonction pour analyser les notes vocales
export async function analyzeNoteWithAI(noteText: string): Promise<string> {
  try {
    const messages = [
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

