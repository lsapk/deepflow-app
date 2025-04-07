
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

type ChatMessage = {
  role: 'user' | 'assistant' | 'system';
  content: string;
};

function formatConversation(messages: ChatMessage[]): string {
  let conversation = "";
  
  messages.forEach((message, index) => {
    if (message.role === "user") {
      conversation += `[INST] ${message.content} [/INST]\n`;
    } else if (message.role === "system") {
      // Les messages système sont inclus au début de la conversation
      conversation = `[INST] ${message.content} [/INST]\n` + conversation;
    } else {
      // Pour le dernier message assistant, ne pas ajouter son contenu car c'est ce que l'IA va générer
      if (index !== messages.length - 1 || messages[messages.length - 1].role !== "assistant") {
        conversation += `${message.content}\n`;
      }
    }
  });
  
  return conversation.trim();
}

export async function sendMessageToAI(
  messages: ChatMessage[],
): Promise<string> {
  try {
    // Format des messages pour l'API Hugging Face
    const formattedMessages = messages.map(({ role, content }) => ({
      role,
      content,
    }));

    console.log("Envoi de la requête à l'API Hugging Face");

    // Appel à l'API Hugging Face
    const response = await fetch("https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${currentApiKey}`,
      },
      body: JSON.stringify({
        inputs: formatConversation(formattedMessages),
        parameters: {
          max_new_tokens: 1000,
          temperature: 0.7,
          top_p: 0.95,
          return_full_text: false
        }
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Erreur API: ${response.status} - ${JSON.stringify(errorData)}`);
    }

    const result = await response.json();
    return result.generated_text || "Désolé, je n'ai pas pu générer de réponse.";
  } catch (error) {
    console.error("Erreur lors de l'appel à l'API Hugging Face:", error);
    return "Une erreur s'est produite lors de la communication avec l'assistant IA. Veuillez réessayer plus tard.";
  }
}
