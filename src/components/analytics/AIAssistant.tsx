
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Bot, Send, Loader2 } from 'lucide-react';
import { getGeminiResponse } from '@/services/geminiService';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

interface AIAssistantProps {
  initialPrompt?: string;
  contextData?: string;
}

const AIAssistant: React.FC<AIAssistantProps> = ({ 
  initialPrompt = "Bonjour, je suis votre assistant d'analyse de données. Comment puis-je vous aider aujourd'hui?",
  contextData = ""
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { currentUser } = useAuth();

  // Initialiser avec le message de bienvenue
  useEffect(() => {
    setMessages([{
      id: uuidv4(),
      content: initialPrompt,
      role: 'assistant',
      timestamp: new Date()
    }]);
  }, [initialPrompt]);

  // Faire défiler vers le bas quand de nouveaux messages arrivent
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Ajouter le message de l'utilisateur
    const userMessage = {
      id: uuidv4(),
      content: input,
      role: 'user' as const,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Préparer le contexte pour l'IA
      let prompt = input;
      if (contextData) {
        prompt = `Contexte des données: ${contextData}\n\nQuestion de l'utilisateur: ${input}`;
      }

      // Obtenir la réponse de Gemini
      const response = await getGeminiResponse(prompt);
      
      if (response.error) {
        toast.error("Erreur: Impossible d'obtenir une réponse de l'IA");
      }

      // Ajouter la réponse de l'IA
      const aiMessage = {
        id: uuidv4(),
        content: response.text,
        role: 'assistant' as const,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      toast.error("Une erreur s'est produite lors de la communication avec l'IA");
      console.error("Erreur:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Formater le texte simple en préservant les sauts de ligne
  const formatMessage = (text: string) => {
    return text.split('\n').map((line, i) => (
      <React.Fragment key={i}>
        {line}
        {i < text.split('\n').length - 1 && <br />}
      </React.Fragment>
    ));
  };

  return (
    <Card className="h-full flex flex-col bg-gradient-to-br from-violet-50 to-indigo-50 border-violet-200 dark:from-violet-950/40 dark:to-indigo-950/40 dark:border-violet-800">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2">
          <div className="bg-violet-600 text-white p-2 rounded-full">
            <Bot size={18} />
          </div>
          Assistant IA
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col overflow-hidden px-4 pb-4 pt-0">
        <div className="flex-1 overflow-y-auto mb-4 space-y-4">
          {messages.map((message) => (
            <div 
              key={message.id} 
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} mb-2`}
            >
              <div 
                className={`max-w-[80%] rounded-lg px-4 py-2 ${
                  message.role === 'user' 
                    ? 'bg-violet-600 text-white' 
                    : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
                }`}
              >
                <div className="text-sm">
                  {formatMessage(message.content)}
                </div>
                <div 
                  className={`text-xs mt-1 ${
                    message.role === 'user' ? 'text-violet-100' : 'text-gray-500'
                  }`}
                >
                  {message.timestamp.toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        <form onSubmit={handleSend} className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Posez une question..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button 
            type="submit" 
            size="icon" 
            disabled={isLoading}
            className="bg-violet-600 hover:bg-violet-700"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </form>
        {currentUser && (
          <p className="text-xs text-center mt-2 text-gray-500">
            Connecté en tant que {currentUser.displayName || currentUser.email}
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default AIAssistant;
