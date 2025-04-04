
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, Mic, MicOff, Send, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import { useIndexedDB } from '@/hooks/use-indexed-db';
import { useIsMobile } from '@/hooks/use-mobile';

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

const AIAssistant: React.FC = () => {
  const { currentUser } = useAuth();
  const [isListening, setIsListening] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant', content: string }[]>([
    { role: 'assistant', content: "Bonjour ! Je suis votre assistant IA DeepFlow. Comment puis-je vous aider aujourd'hui ?" }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  
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

      // Générer une réponse automatisée intelligente basée sur les données
      let aiResponse = `Bonjour ${currentUser?.displayName || ''}! `;
      
      // Analyser le message de l'utilisateur pour déterminer le contexte
      const lowercaseMessage = inputMessage.toLowerCase();
      
      if (lowercaseMessage.includes('habitude') || lowercaseMessage.includes('habit')) {
        if (habitsData && habitsData.length > 0) {
          const bestHabit = habitsData.reduce((prev: any, current: any) => 
            (prev.streak > current.streak) ? prev : current, { streak: 0 });
          
          aiResponse += `Vos habitudes sont au nombre de ${userDataSummary.habits}. Votre meilleure habitude est "${bestHabit.title}" avec une série de ${bestHabit.streak} jours. `;
          
          if (bestHabit.streak > 5) {
            aiResponse += "Vous faites un excellent travail pour maintenir cette habitude! ";
          } else {
            aiResponse += "Continuez à maintenir cette habitude pour augmenter votre streak. ";
          }
          
          aiResponse += "Que voudriez-vous savoir d'autre sur vos habitudes?";
        } else {
          aiResponse += "Vous n'avez pas encore créé d'habitudes. Voulez-vous des conseils pour commencer à suivre de nouvelles habitudes?";
        }
      } else if (lowercaseMessage.includes('tâche') || lowercaseMessage.includes('tache')) {
        if (tasksData && tasksData.length > 0) {
          const completedTasks = tasksData.filter((t: any) => t.completed);
          const pendingTasks = tasksData.filter((t: any) => !t.completed);
          
          aiResponse += `Vous avez ${pendingTasks.length} tâches en attente et vous avez complété ${completedTasks.length} tâches au total. `;
          
          // Vérifier les tâches prioritaires
          const highPriorityTasks = pendingTasks.filter((t: any) => t.priority === 'high');
          if (highPriorityTasks.length > 0) {
            aiResponse += `Il y a ${highPriorityTasks.length} tâches de haute priorité qui nécessitent votre attention. `;
          }
          
          aiResponse += "Avez-vous besoin d'aide pour organiser vos tâches?";
        } else {
          aiResponse += "Vous n'avez pas encore créé de tâches. Souhaitez-vous des conseils pour organiser votre travail?";
        }
      } else if (lowercaseMessage.includes('journal') || lowercaseMessage.includes('humeur')) {
        if (journalData && journalData.length > 0) {
          const latestEntry = journalData[0];
          aiResponse += `Vous avez ${journalData.length} entrées dans votre journal. `;
          
          if (latestEntry.mood) {
            aiResponse += `Votre dernière entrée indique une humeur "${latestEntry.mood}". Comment vous sentez-vous aujourd'hui?`;
          } else {
            aiResponse += "Comment vous sentez-vous aujourd'hui par rapport à votre dernière entrée?";
          }
        } else {
          aiResponse += "Vous n'avez pas encore d'entrées de journal. Tenir un journal peut vous aider à suivre votre humeur et vos pensées. Souhaitez-vous commencer aujourd'hui?";
        }
      } else if (lowercaseMessage.includes('événement') || lowercaseMessage.includes('planning') || lowercaseMessage.includes('calendrier')) {
        if (planningData && planningData.length > 0) {
          const today = new Date();
          const upcomingEvents = planningData.filter((event: any) => {
            if (!event.date) return false;
            const eventDate = new Date(event.date);
            return eventDate > today;
          });
          
          if (upcomingEvents.length > 0) {
            aiResponse += `Vous avez ${upcomingEvents.length} événements à venir. `;
            
            // Trouver l'événement le plus proche
            const nextEvent = upcomingEvents.reduce((closest: any, current: any) => {
              if (!closest.date) return current;
              if (!current.date) return closest;
              
              const closestDate = new Date(closest.date);
              const currentDate = new Date(current.date);
              
              return currentDate < closestDate ? current : closest;
            });
            
            if (nextEvent && nextEvent.date) {
              const eventDate = new Date(nextEvent.date);
              const options: Intl.DateTimeFormatOptions = { 
                weekday: 'long', 
                day: 'numeric', 
                month: 'long', 
                hour: '2-digit', 
                minute: '2-digit' 
              };
              
              aiResponse += `Votre prochain événement est "${nextEvent.title}" le ${eventDate.toLocaleDateString('fr-FR', options)}. Souhaitez-vous que je vous rappelle d'autres événements?`;
            }
          } else {
            aiResponse += "Vous n'avez pas d'événements à venir dans votre calendrier. Souhaitez-vous planifier quelque chose?";
          }
        } else {
          aiResponse += "Vous n'avez pas encore d'événements dans votre calendrier. Avez-vous besoin d'aide pour planifier votre emploi du temps?";
        }
      } else if (lowercaseMessage.includes('focus') || lowercaseMessage.includes('concentr') || lowercaseMessage.includes('pomodoro')) {
        aiResponse += "La technique Pomodoro peut vous aider à améliorer votre concentration. Elle consiste à travailler pendant 25 minutes, puis prendre une pause de 5 minutes. Souhaitez-vous essayer cette technique maintenant?";
      } else {
        // Réponse générique basée sur les statistiques globales
        aiResponse += `Basé sur vos données, voici ce que je peux vous dire:
        
Vous avez ${userDataSummary.tasks} tâches dont ${userDataSummary.tasksCompleted} sont complétées.
Vos habitudes sont au nombre de ${userDataSummary.habits}, avec une série de ${userDataSummary.habitsStreak} jours pour votre meilleure habitude.
Vous avez ${userDataSummary.journal} entrées de journal, et ${userDataSummary.upcomingEvents} événements à venir.

Comment puis-je vous aider aujourd'hui?`;
      }
      
      setTimeout(() => {
        setMessages(prev => [...prev, { role: 'assistant', content: aiResponse }]);
        setIsLoading(false);
      }, 1000); // Simuler un temps de réponse pour plus de réalisme
      
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Erreur lors de l'envoi du message");
      // Fallback response
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "Désolé, je rencontre des difficultés à me connecter. Veuillez réessayer dans un moment." 
      }]);
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
      <CardHeader className="py-3 md:py-6">
        <CardTitle className="flex items-center text-lg md:text-xl">
          <MessageSquare className="mr-2 h-5 w-5 text-blue-500" />
          Assistant IA
        </CardTitle>
        {!isMobile && (
          <CardDescription>
            Je suis un assistant IA intelligent qui analyse vos données et vous aide à atteindre vos objectifs
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="flex-grow overflow-y-auto mb-4 p-3 md:p-4 space-y-3 md:space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`rounded-lg p-2 md:p-3 max-w-[85%] md:max-w-[80%] ${
                message.role === 'user'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted'
              }`}
            >
              <p className="text-sm md:text-base whitespace-pre-line">{message.content}</p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-muted rounded-lg p-3">
              <Loader2 className="h-5 w-4 animate-spin" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </CardContent>
      <CardFooter className="border-t p-3 md:p-4">
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
            className="flex-1 min-h-[40px] resize-none text-sm md:text-base"
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
