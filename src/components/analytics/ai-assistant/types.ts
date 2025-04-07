
import { HfInference } from '@huggingface/inference';

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface AIAssistantProps {
  initialMessage?: string;
  maxHistory?: number;
}

// Créer une instance du client Hugging Face pour réutilisation
export const hfInstance = new HfInference("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");
