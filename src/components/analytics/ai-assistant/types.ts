
import { HfInference } from '@huggingface/inference';

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

// Interface for the AIAssistant component
export interface AIAssistantProps {
  initialMessage?: string;
  maxHistory?: number;
}

// Interface for the AssistantHeader component
export interface AssistantHeaderProps {
  title: string;
}

// Interface for the MessageItem component
export interface MessageItemProps {
  message: Message;
}

// Interface for the MessageList component
export interface MessageListProps {
  messages: Message[];
  messagesEndRef: React.RefObject<HTMLDivElement>;
}

// Interface for the QueryForm component
export interface QueryFormProps {
  query: string;
  setQuery: (query: string) => void;
  handleQuerySubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
}

// Créer une instance du client Hugging Face pour réutilisation
export const hfInstance = new HfInference("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");
