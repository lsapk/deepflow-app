
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize the Gemini API with your API key
const genAI = new GoogleGenerativeAI("AIzaSyAdOinCnHfqjOyk6XBbTzQkR_IOdRvlliU");
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

export interface GeminiResponse {
  text: string;
  error?: string;
}

export async function getGeminiResponse(prompt: string): Promise<GeminiResponse> {
  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    return { text };
  } catch (error) {
    console.error("Error with Gemini API:", error);
    return { 
      text: "Je ne peux pas répondre pour le moment. Veuillez réessayer plus tard.",
      error: error instanceof Error ? error.message : String(error)
    };
  }
}
