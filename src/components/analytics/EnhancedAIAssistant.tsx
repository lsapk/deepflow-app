
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Bot, Send, Loader2, Sparkles } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { getGeminiResponse } from '@/services/geminiService';
import ReactMarkdown from 'react-markdown';
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from '@/contexts/AuthContext';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface EnhancedAIAssistantProps {
  initialMessage?: string;
  insightData?: string;
}

const EnhancedAIAssistant: React.FC<EnhancedAIAssistantProps> = ({ 
  initialMessage = "Bonjour ! Je suis votre assistant d'analyse de données. Comment puis-je vous aider aujourd'hui ?",
  insightData = ""
}) => {
  const { toast } = useToast();
  const { currentUser } = useAuth();
  const [userQuery, setUserQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize with welcome message
  useEffect(() => {
    setMessages([{
      id: uuidv4(),
      text: initialMessage,
      isUser: false,
      timestamp: new Date()
    }]);
  }, [initialMessage]);

  // Auto-scroll to the bottom when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleQuerySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userQuery.trim()) return;
    
    const userMessage: Message = {
      id: uuidv4(),
      text: userQuery,
      isUser: true,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    
    try {
      let contextPrompt = "Tu es un assistant d'analyse de données professionnel qui aide à interpréter les données et les tendances. ";
      
      if (insightData) {
        contextPrompt += `Voici des informations sur les données de l'utilisateur: ${insightData}. `;
      }
      
      contextPrompt += "Réponds à cette question de l'utilisateur: " + userQuery;
      
      const response = await getGeminiResponse(contextPrompt);
      
      if (response.error) {
        toast({
          title: "Erreur",
          description: "Impossible de générer une réponse. Veuillez réessayer.",
          variant: "destructive",
        });
      }
      
      const aiMessage: Message = {
        id: uuidv4(),
        text: response.text,
        isUser: false,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiMessage]);
      setUserQuery('');
    } catch (error) {
      console.error('Error querying AI assistant:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la communication avec l'assistant IA.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Function to render markdown content with safe fallback
  const renderMarkdown = (text: string) => {
    try {
      return <ReactMarkdown>{text}</ReactMarkdown>;
    } catch (error) {
      console.error('Error rendering markdown:', error);
      return (
        <div className="whitespace-pre-wrap">{text}</div>
      );
    }
  };

  return (
    <Card className="bg-gradient-to-br from-violet-50 to-indigo-50 border-violet-200 dark:from-violet-950/40 dark:to-indigo-950/40 dark:border-violet-800 h-full flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <div className="bg-violet-600 text-white p-2 rounded-full">
            <Sparkles size={18} />
          </div>
          <div>
            <CardTitle className="text-violet-700 dark:text-violet-300">
              Assistant Analytique IA
            </CardTitle>
            <CardDescription>
              Posez des questions sur vos données et obtenez des insights
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 overflow-y-auto space-y-4 pt-0">
        <div className="space-y-4 max-h-[350px] overflow-y-auto p-1">
          {messages.map((message) => (
            <div 
              key={message.id} 
              className={`flex items-start gap-3 ${message.isUser ? 'flex-row-reverse' : ''}`}
            >
              {!message.isUser && (
                <div className="bg-violet-600 text-white p-2 rounded-full shrink-0">
                  <Bot size={18} />
                </div>
              )}
              
              <div className={`max-w-[80%] rounded-lg px-4 py-2 ${
                message.isUser 
                  ? 'bg-violet-600 text-white ml-auto' 
                  : 'bg-white dark:bg-gray-800 shadow'
              }`}>
                <div className="prose dark:prose-invert prose-sm max-w-none">
                  {renderMarkdown(message.text)}
                </div>
                <div className={`text-xs mt-1 ${
                  message.isUser ? 'text-violet-100' : 'text-gray-500'
                }`}>
                  {message.timestamp.toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </CardContent>
      
      <div className="p-4 border-t border-violet-100 dark:border-violet-800">
        <form onSubmit={handleQuerySubmit} className="flex items-center gap-2">
          <Input
            value={userQuery}
            onChange={(e) => setUserQuery(e.target.value)}
            placeholder="Posez une question sur vos données..."
            className="flex-1"
            disabled={isLoading}
          />
          <Button 
            type="submit" 
            size="icon" 
            disabled={isLoading}
            className="shrink-0 bg-violet-600 hover:bg-violet-700"
          >
            {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
          </Button>
        </form>
        <p className="text-xs text-center text-gray-500 mt-2">
          {currentUser ? "Connecté en tant que " + (currentUser.displayName || currentUser.email) : "Connectez-vous pour sauvegarder vos conversations"}
        </p>
      </div>
    </Card>
  );
};

export default EnhancedAIAssistant;
