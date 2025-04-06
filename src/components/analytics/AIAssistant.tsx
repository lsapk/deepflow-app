
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Bot, Send, RefreshCw, User } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { useIndexedDB } from '@/hooks/use-indexed-db';

interface Message {
  role: 'assistant' | 'user';
  content: string;
  timestamp: Date;
}

interface AIAssistantProps {
  initialMessage?: string;
}

const AIAssistant: React.FC<AIAssistantProps> = ({ initialMessage = "Bonjour! Je suis votre assistant IA personnel. Je peux vous aider à analyser vos données de productivité et répondre à vos questions." }) => {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: initialMessage, timestamp: new Date() }
  ]);
  const { currentUser } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Get user data from IndexedDB
  const { data: tasksData } = useIndexedDB<any>({ 
    storeName: 'tasks', 
    initialData: [] 
  });
  
  const { data: habitsData } = useIndexedDB<any>({ 
    storeName: 'habits', 
    initialData: [] 
  });
  
  const { data: journalData } = useIndexedDB<any>({ 
    storeName: 'journal', 
    initialData: [] 
  });
  
  const { data: focusData } = useIndexedDB<any>({ 
    storeName: 'focus-sessions', 
    initialData: [] 
  });

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const prepareSystemPrompt = () => {
    // Create a data summary to provide context to the AI
    const tasksCount = tasksData?.length || 0;
    const habitsCount = habitsData?.length || 0;
    const journalCount = journalData?.length || 0;
    const focusSessionsCount = focusData?.length || 0;
    
    const completedTasks = tasksData?.filter((t: any) => t.status === 'done').length || 0;
    const pendingTasks = tasksData?.filter((t: any) => t.status !== 'done').length || 0;
    
    const maintainedHabits = habitsData?.filter((h: any) => h.streak > 3).length || 0;

    // Construire un résumé détaillé des données
    let tasksDetails = "Pas de tâches.";
    if (tasksData && tasksData.length > 0) {
      tasksDetails = tasksData.map((t: any) => 
        `- ${t.title} (Status: ${t.status}, Priorité: ${t.priority || 'normale'}, Date: ${t.dueDate || 'non définie'})`
      ).join('\n');
    }
    
    let habitsDetails = "Pas d'habitudes.";
    if (habitsData && habitsData.length > 0) {
      habitsDetails = habitsData.map((h: any) => 
        `- ${h.title} (Série actuelle: ${h.streak || 0}, Fréquence: ${h.frequency || 'quotidienne'})`
      ).join('\n');
    }
    
    let journalDetails = "Pas d'entrées de journal.";
    if (journalData && journalData.length > 0) {
      journalDetails = `${journalData.length} entrées de journal, la plus récente datant du ${new Date(journalData[0]?.date || Date.now()).toLocaleDateString('fr-FR')}`;
    }
    
    let focusDetails = "Pas de sessions de concentration.";
    if (focusData && focusData.length > 0) {
      const totalMinutes = focusData.reduce((acc: number, session: any) => acc + (session.duration || 0), 0);
      focusDetails = `${focusData.length} sessions de concentration totalisant ${totalMinutes} minutes`;
    }

    return `Tu es un assistant productivité professionnel dédié à aider l'utilisateur à analyser ses données et améliorer son organisation.
Date actuelle: ${new Date().toLocaleDateString('fr-FR')}

Voici une synthèse des données de l'utilisateur :
- Tâches: ${tasksCount} au total (${completedTasks} terminées, ${pendingTasks} en attente)
  ${tasksDetails}

- Habitudes: ${habitsCount} au total (${maintainedHabits} maintenues régulièrement)
  ${habitsDetails}

- Journal: ${journalCount} entrées
  ${journalDetails}

- Focus: ${focusSessionsCount} sessions
  ${focusDetails}

Ton objectif est de fournir des analyses pertinentes et des conseils adaptés aux données de l'utilisateur.
Réponds toujours en français de manière concise, professionnelle et encourageante.
Si tu n'as pas assez de données spécifiques, propose des suggestions générales pour améliorer la productivité ou demande plus de détails.`;
  };

  const handleQuerySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!query.trim()) return;
    
    // Add user message
    const userMessage: Message = { role: 'user', content: query, timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    setQuery('');
    setIsLoading(true);
    
    try {
      // Deepseek API call
      const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer sk-1faa52f853a844d3aa842ef3d9fa61eb`
        },
        body: JSON.stringify({
          model: 'deepseek-chat', // Using Deepseek's base model
          messages: [
            {
              role: 'system',
              content: prepareSystemPrompt()
            },
            ...messages.map(msg => ({
              role: msg.role,
              content: msg.content
            })),
            {
              role: 'user',
              content: query
            }
          ],
          temperature: 0.7,
          max_tokens: 1024
        })
      });
      
      if (!response.ok) {
        throw new Error(`API responded with status: ${response.status}`);
      }
      
      const data = await response.json();
      const aiResponse = data.choices?.[0]?.message?.content || 
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

  return (
    <Card className="flex flex-col bg-gradient-to-b from-blue-50/50 to-indigo-50/50 dark:from-blue-950/30 dark:to-indigo-950/30 border-blue-200 dark:border-blue-800 h-full max-h-[600px]">
      <CardContent className="flex flex-col h-full p-4">
        <div className="flex items-center gap-2 mb-4">
          <div className="bg-blue-600 text-white p-1.5 rounded-full">
            <Bot size={18} />
          </div>
          <h3 className="font-medium text-lg text-blue-700 dark:text-blue-400">
            Assistant Analytique
          </h3>
        </div>
        
        <ScrollArea className="flex-1 pr-4 mb-4">
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div 
                key={index} 
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.role === 'user' 
                      ? 'bg-blue-600 text-white ml-8' 
                      : 'bg-gray-100 dark:bg-gray-800 mr-8'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    {message.role === 'assistant' ? (
                      <Bot size={14} className="text-blue-600 dark:text-blue-400" />
                    ) : (
                      <User size={14} />
                    )}
                    <span className="text-xs opacity-70">
                      {message.timestamp.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
        
        <Separator className="my-2" />
        
        <form onSubmit={handleQuerySubmit} className="flex items-center gap-2 pt-2">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Posez une question sur vos données..."
            className="flex-1"
            disabled={isLoading}
          />
          <Button 
            type="submit" 
            size="icon" 
            disabled={isLoading}
            className="shrink-0"
          >
            {isLoading ? <RefreshCw size={18} className="animate-spin" /> : <Send size={18} />}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default AIAssistant;
