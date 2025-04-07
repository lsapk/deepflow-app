
import { HfInference } from '@huggingface/inference';

// Interface pour les messages
export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  id?: string;
}

// Interface pour le composant principal
export interface AIAssistantProps {
  initialMessage?: string;
  maxHistory?: number;
}

// Interface pour l'en-tête de l'assistant
export interface AssistantHeaderProps {
  title: string;
  toggleThinking?: () => void;
  isThinking?: boolean;
}

// Interface pour les éléments de message
export interface MessageItemProps {
  message: Message;
}

// Interface pour la liste des messages
export interface MessageListProps {
  messages: Message[];
  messagesEndRef: React.RefObject<HTMLDivElement>;
}

// Interface pour le formulaire de requête
export interface QueryFormProps {
  query: string;
  setQuery: (query: string) => void;
  handleQuerySubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
}

// Créer une instance du client Hugging Face pour réutilisation
export const hfInstance = new HfInference("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");
