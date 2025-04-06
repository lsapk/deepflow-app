
import { useState, useRef, useEffect } from 'react';
import { toast } from 'sonner';
import { Message } from './types';
import { useSystemPrompt } from './useSystemPrompt';
import { hfInstance } from './types';

export const useAssistantLogic = (initialMessage: string) => {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: initialMessage, timestamp: new Date() }
  ]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { prepareSystemPrompt } = useSystemPrompt();

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleQuerySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!query.trim()) return;
    
    // Add user message
    const userMessage: Message = { role: 'user', content: query, timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    setQuery('');
    setIsLoading(true);
    
    try {
      // Prepare conversation history
      const conversationHistory = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));
      
      // Add the system prompt and user query
      const fullConversation = [
        { role: 'system', content: prepareSystemPrompt() },
        ...conversationHistory,
        { role: 'user', content: query }
      ];
      
      // Call Hugging Face API with DeepSeek-R1 model
      const response = await hfInstance.textGeneration({
        model: "deepseek-ai/DeepSeek-R1",
        inputs: JSON.stringify(fullConversation),
        parameters: {
          max_new_tokens: 1024,
          temperature: 0.7,
          top_p: 0.95,
          return_full_text: false
        }
      });
      
      // Extract the AI response
      const aiResponse = response.generated_text || 
        "Désolé, je n'ai pas pu traiter votre demande. Veuillez réessayer.";
      
      // Add AI response
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: aiResponse, 
        timestamp: new Date() 
      }]);
    } catch (error) {
      console.error('Error querying AI assistant:', error);
      
      // Fallback for development/testing - create a simulated response
      const simulatedResponses = [
        "D'après vos données, vous avez une productivité plus élevée le matin. Essayez de planifier vos tâches importantes durant cette période.",
        "Je remarque que vous maintenez bien certaines habitudes. Continuez sur cette lancée, la constance est clé dans le développement personnel.",
        "Basé sur vos données de focus, vous pourriez améliorer votre concentration en utilisant la technique Pomodoro plus régulièrement.",
        "Votre taux de complétion des tâches est bon. Pour l'améliorer davantage, essayez de diviser les grandes tâches en plus petites étapes."
      ];
      
      const randomResponse = simulatedResponses[Math.floor(Math.random() * simulatedResponses.length)];
      
      toast.error('Problème de connexion avec l\'assistant IA. Mode hors ligne activé.');
      
      // Add simulated response
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: `Mode hors-ligne: ${randomResponse}`, 
        timestamp: new Date() 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    query,
    setQuery,
    isLoading,
    messages,
    messagesEndRef,
    handleQuerySubmit
  };
};
