
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, Mic, MicOff, Send, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import { useIndexedDB } from '@/hooks/use-indexed-db';

// Add SpeechRecognition interface for TypeScript
interface SpeechRecognitionEvent extends Event {
  results: {
    [index: number]: {
      [index: number]: {
        transcript: string;
        confidence: number;
      };
    };
  };
}

// Define the SpeechRecognition interface
interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: Event) => void) | null;
  onend: ((event: Event) => void) | null;
}

// Declare the SpeechRecognition constructor
interface SpeechRecognitionConstructor {
  new (): SpeechRecognition;
}

// Make TypeScript aware of these browser APIs
declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

// OpenRouter API key for testing purposes - in a real app, use environment variables
const OPENROUTER_API_KEY = "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";

const AIAssistant = () => {
  const { currentUser } = useAuth();
  const [isListening, setIsListening] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant', content: string }[]>([
    { role: 'assistant', content: "Bonjour ! Je suis votre assistant IA DeepFlow. Comment puis-je vous aider aujourd'hui ?" }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Load data from IndexedDB
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
  
  const { data: planningData } = useIndexedDB<any>({ 
    storeName: 'planning', 
    initialData: [] 
  });
  
  const { data: settingsData } = useIndexedDB<any>({ 
    storeName: 'settings', 
    initialData: [] 
  });

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = { role: 'user' as const, content: inputMessage };
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Prepare user data summary for context
      const userDataSummary = {
        tasks: tasksData?.length || 0,
        habits: habitsData?.length || 0,
        journal: journalData?.length || 0,
        planning: planningData?.length || 0,
        tasksCompleted: tasksData?.filter((task: any) => task.completed)?.length || 0,
        habitsStreak: habitsData?.reduce((max: number, habit: any) => Math.max(max, habit?.streak || 0), 0),
        recentJournalMood: journalData?.length > 0 ? journalData[0]?.mood : null,
        upcomingEvents: planningData?.filter((event: any) => {
          const eventDate = new Date(event.date);
          const now = new Date();
          return eventDate > now;
        })?.length || 0
      };

      // Fetch without using OpenRouter API - using a proxy or mock for demo purposes
      const mockResponse = {
        choices: [
          {
            message: {
              content: `Bonjour ${currentUser?.displayName || ''}! Basé sur vos données, voici mon analyse:
              
              Vous avez ${userDataSummary.tasks} tâches dont ${userDataSummary.tasksCompleted} sont complétées.
              Vos habitudes sont au nombre de ${userDataSummary.habits}, avec une série de ${userDataSummary.habitsStreak} jours pour votre meilleure habitude.
              Vous avez ${userDataSummary.journal} entrées de journal, et ${userDataSummary.upcomingEvents} événements à venir.
              
              Que puis-je faire pour vous aider aujourd'hui?`
            }
          }
        ]
      };
      
      // Use the mock response instead of fetching from API during development
      const aiResponse = mockResponse.choices[0].message.content;
      
      setMessages(prev => [...prev, { role: 'assistant', content: aiResponse }]);
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Erreur lors de l'envoi du message");
      // Fallback response
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "Désolé, je rencontre des difficultés à me connecter. Veuillez réessayer dans un moment." 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleListening = () => {
    if (!isListening) {
      // Properly check and access the speech recognition API
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.lang = 'fr-FR';
        recognition.continuous = false;
        recognition.interimResults = false;

        recognition.onresult = (event) => {
          const transcript = event.results[0][0].transcript;
          setInputMessage(transcript);
          setIsListening(false);
        };

        recognition.onerror = (event) => {
          console.error('Speech recognition error', event);
          toast.error("Erreur de reconnaissance vocale");
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognition.start();
        setIsListening(true);
      } else {
        toast.error("Votre navigateur ne prend pas en charge la reconnaissance vocale");
      }
    } else {
      setIsListening(false);
    }
  };

  return (
    <Card className="flex flex-col h-[600px] md:h-[700px]">
      <CardHeader>
        <CardTitle className="flex items-center">
          <MessageSquare className="mr-2 h-5 w-5 text-blue-500" />
          Assistant IA
        </CardTitle>
        <CardDescription>
          Je suis un assistant IA intelligent qui analyse vos données et vous aide à atteindre vos objectifs
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow overflow-y-auto mb-4 p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`rounded-lg p-3 max-w-[80%] ${
                message.role === 'user'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted'
              }`}
            >
              {message.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-muted rounded-lg p-3">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </CardContent>
      <CardFooter className="border-t p-4">
        <div className="flex w-full items-center space-x-2">
          <Button
            variant="outline"
            size="icon"
            onClick={toggleListening}
            className={isListening ? 'bg-red-100 text-red-500 animate-pulse' : ''}
          >
            {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
          </Button>
          <Textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Tapez votre message ici..."
            className="flex-1 min-h-[40px] resize-none"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isLoading}
          >
            {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default AIAssistant;
