
import { useState, useRef, useEffect } from 'react';
import { toast } from 'sonner';
import { Message } from './types';
import { useSystemPrompt } from './useSystemPrompt';
import { sendMessageToAI } from '@/services/aiService';
import { v4 as uuidv4 } from 'uuid';

export const useAssistantLogic = (initialMessage: string, maxHistory: number = 10) => {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { 
      id: uuidv4(),
      role: 'assistant', 
      content: initialMessage, 
      timestamp: new Date() 
    }
  ]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { prepareSystemPrompt } = useSystemPrompt();

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Limiter l'historique au nombre spécifié
  const limitMessageHistory = (msgs: Message[]): Message[] => {
    if (msgs.length <= maxHistory) return msgs;
    return msgs.slice(msgs.length - maxHistory);
  };

  const toggleThinking = () => {
    setIsThinking(!isThinking);
  };

  const handleQuerySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!query.trim()) return;
    
    // Add user message
    const userMessage: Message = { 
      id: uuidv4(),
      role: 'user', 
      content: query, 
      timestamp: new Date() 
    };
    
    setMessages(prev => limitMessageHistory([...prev, userMessage]));
    setQuery('');
    setIsLoading(true);
    
    try {
      // Prepare conversation history - limitée au maximum spécifié
      const conversationHistory = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));
      
      // Add the system prompt and user query
      const fullConversation = [
        { role: 'system' as const, content: prepareSystemPrompt() },
        ...conversationHistory,
        { role: 'user' as const, content: query }
      ];
      
      // Appeler notre service AI
      const aiResponse = await sendMessageToAI(fullConversation);
      
      // Add AI response and ensure history limit
      setMessages(prev => limitMessageHistory([...prev, { 
        id: uuidv4(),
        role: 'assistant', 
        content: aiResponse, 
        timestamp: new Date() 
      }]));
    } catch (error) {
      console.error('Error querying AI assistant:', error);
      
      toast.error('Problème de connexion avec l\'assistant IA');
      
      // Add error response
      setMessages(prev => limitMessageHistory([...prev, { 
        id: uuidv4(),
        role: 'assistant', 
        content: "Je suis désolé, mais j'ai rencontré un problème technique. Veuillez réessayer dans quelques instants.", 
        timestamp: new Date() 
      }]));
    } finally {
      setIsLoading(false);
    }
  };

  return {
    query,
    setQuery,
    isLoading,
    isThinking,
    toggleThinking,
    messages,
    messagesEndRef,
    handleQuerySubmit
  };
};
