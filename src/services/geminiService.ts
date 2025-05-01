// Clé API pour Gemini AI
const GEMINI_API_KEY = "AIzaSyAdOinCnHfqjOyk6XBbTzQkR_IOdRvlliU";

interface GeminiMessage {
  role: "user" | "model";
  parts: { text: string }[];
}

// Type pour les réponses de Gemini
interface GeminiResponse {
  candidates: {
    content: {
      parts: { text: string }[];
    };
  }[];
}

// Fonction pour envoyer des messages à l'API Gemini
export const sendMessageToGemini = async (
  messages: { role: "user" | "system" | "assistant"; content: string }[]
): Promise<string> => {
  try {
    // Conversion des messages au format attendu par Gemini
    const geminiMessages: GeminiMessage[] = messages
      .filter(msg => msg.role !== "system") // Gemini ne supporte pas le rôle "system"
      .map(msg => ({
        role: msg.role === "assistant" ? "model" : "user",
        parts: [{ text: msg.content }]
      }));

    // Si un message système existe, l'ajouter au premier message utilisateur
    const systemMessage = messages.find(msg => msg.role === "system");
    if (systemMessage && geminiMessages.length > 0) {
      const firstUserMsg = geminiMessages.find(msg => msg.role === "user");
      if (firstUserMsg) {
        firstUserMsg.parts = [{ 
          text: `${systemMessage.content}\n\nUtilisateur: ${firstUserMsg.parts[0].text}` 
        }];
      }
    }

    // Appel à l'API Gemini
    const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=" + GEMINI_API_KEY, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: geminiMessages,
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_ONLY_HIGH"
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_ONLY_HIGH"
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_ONLY_HIGH"
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_ONLY_HIGH"
          }
        ]
      }),
    });

    if (!response.ok) {
      throw new Error(`Erreur API Gemini: ${response.status} ${response.statusText}`);
    }

    const data: GeminiResponse = await response.json();
    
    if (!data.candidates || data.candidates.length === 0) {
      throw new Error("Pas de réponse générée par Gemini AI");
    }

    return data.candidates[0].content.parts[0].text || "Désolé, je n'ai pas pu générer une réponse.";
  } catch (error) {
    console.error("Erreur lors de l'appel à Gemini AI:", error);
    return "Désolé, une erreur s'est produite lors de la communication avec Gemini AI. Veuillez réessayer.";
  }
};

// Fonction pour analyser les notes vocales avec Gemini
export async function analyzeNoteWithGemini(noteText: string): Promise<string> {
  try {
    const messages = [
      {
        role: "system" as const,
        content: "Tu es un assistant spécialisé dans l'analyse de notes vocales. Ton objectif est de résumer, structurer et extraire les points clés et idées importantes de la transcription fournie. Format ta réponse en sections claires avec des puces pour les points clés."
      },
      {
        role: "user" as const,
        content: `Analyse la note suivante et extrais-en les points clés, les idées principales et fournis un résumé structuré :\n\n${noteText}`
      }
    ];

    return await sendMessageToGemini(messages);
  } catch (error) {
    console.error("Erreur lors de l'analyse de la note:", error);
    return "Désolé, je n'ai pas pu analyser cette note. Veuillez réessayer.";
  }
}
