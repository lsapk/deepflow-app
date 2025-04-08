
import { useState, useRef, useEffect } from 'react';
import { toast } from 'sonner';
import { Message } from './types';
import { useSystemPrompt } from './useSystemPrompt';
import { sendMessageToAI } from '@/services/aiService';
import { v4 as uuidv4 } from 'uuid';
import { useLocalStorage } from '@/hooks/use-local-storage';

export const useAssistantLogic = (initialMessage: string, maxHistory: number = 10) => {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [memoryMode, setMemoryMode] = useState(true);
  
  // Utiliser localStorage pour sauvegarder les messages
  const [savedMessages, setSavedMessages] = useLocalStorage<Message[]>('ai-assistant-messages', []);
  
  const [messages, setMessages] = useState<Message[]>(() => {
    // Si on a des messages sauvegardés et que le mode mémoire est activé, on les utilise
    if (savedMessages && savedMessages.length > 0 && memoryMode) {
      return savedMessages;
    } 
    // Sinon, on commence avec le message initial
    return [
      { 
        id: uuidv4(),
        role: 'assistant', 
        content: initialMessage, 
        timestamp: new Date() 
      }
    ];
  });
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { prepareSystemPrompt } = useSystemPrompt();

  // Mettre à jour le localStorage quand les messages changent
  useEffect(() => {
    if (memoryMode && messages.length > 0) {
      setSavedMessages(messages);
    }
  }, [messages, memoryMode, setSavedMessages]);

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
  
  const toggleMemoryMode = () => {
    setMemoryMode(!memoryMode);
    
    // Si on active la mémoire et qu'on a des messages sauvegardés, on les restaure
    if (!memoryMode && savedMessages && savedMessages.length > 0) {
      setMessages(savedMessages);
      toast.success('Mémoire des conversations restaurée');
    } 
    // Si on désactive la mémoire, on réinitialise la conversation
    else if (memoryMode) {
      setMessages([
        { 
          id: uuidv4(),
          role: 'assistant', 
          content: initialMessage, 
          timestamp: new Date() 
        }
      ]);
      toast.info('Mémoire désactivée, conversation réinitialisée');
    }
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
        role: msg.role as "user" | "assistant" | "system",
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
    handleQuerySubmit,
    memoryMode,
    toggleMemoryMode
  };
};
