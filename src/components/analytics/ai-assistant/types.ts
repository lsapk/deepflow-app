
import { HfInference } from '@huggingface/inference';

export interface Message {
  role: 'assistant' | 'user';
  content: string;
  timestamp: Date;
}

export interface AIAssistantProps {
  initialMessage?: string;
}

export interface MessageListProps {
  messages: Message[];
  messagesEndRef: React.RefObject<HTMLDivElement>;
}

export interface MessageItemProps {
  message: Message;
}

export interface AssistantHeaderProps {
  title: string;
}

export interface QueryFormProps {
  query: string;
  setQuery: (query: string) => void;
  handleQuerySubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
}

// Singleton pour l'instance HuggingFace
export const hfInstance = new HfInference("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");
