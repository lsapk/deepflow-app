
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/services/firebase';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { Loader2, Mic, MicOff, Send, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

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

const mockResponse = (query: string) => {
  // Simulation de réponses IA basées sur des mots-clés dans la requête
  if (query.toLowerCase().includes('tâche') || query.toLowerCase().includes('tache')) {
    return "Pour être plus productif avec vos tâches, essayez la technique Pomodoro : 25 minutes de travail, 5 minutes de pause. J'ai analysé vos habitudes et je vois que vous êtes plus efficace le matin. Essayez de planifier vos tâches importantes avant midi.";
  } else if (query.toLowerCase().includes('habitude')) {
    return "La clé pour maintenir une habitude est la constance. Selon vos données, vous avez tendance à abandonner après 5 jours. Essayez de vous fixer des objectifs plus petits et plus réalisables pour construire de l'élan.";
  } else if (query.toLowerCase().includes('sommeil') || query.toLowerCase().includes('dormir')) {
    return "Vos données montrent que vous vous couchez généralement tard. Essayez d'établir une routine de coucher constante et évitez les écrans au moins 1 heure avant de dormir pour améliorer la qualité de votre sommeil.";
  } else if (query.toLowerCase().includes('focus') || query.toLowerCase().includes('concentration')) {
    return "Pour améliorer votre concentration, essayez d'éliminer les distractions numériques. Le bloqueur de distractions dans les paramètres peut vous aider à rester concentré. Vos sessions de focus les plus productives durent environ 45 minutes selon vos données.";
  } else if (query.toLowerCase().includes('conseil') || query.toLowerCase().includes('conseille')) {
    return "En analysant vos habitudes, je vous conseille de planifier vos tâches importantes le matin, faire de l'exercice régulièrement et prendre des pauses courtes mais fréquentes pendant les longues sessions de travail.";
  } else {
    return "Je suis votre assistant IA DeepFlow. Je peux vous aider à améliorer votre productivité, gérer vos habitudes et atteindre vos objectifs. Que puis-je faire pour vous aujourd'hui ? Vous pouvez me demander des conseils sur votre productivité, vos habitudes ou votre planning.";
  }
};

const AIAssistant = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [isListening, setIsListening] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant', content: string }[]>([
    { role: 'assistant', content: "Bonjour ! Je suis votre assistant IA DeepFlow. Comment puis-je vous aider aujourd'hui ?" }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!currentUser) return;

      try {
        const userDoc = await getDoc(doc(db, `users/${currentUser.uid}`));
        if (userDoc.exists()) {
          setUserData(userDoc.data());
        }

        // Récupérer les tâches
        const tasksSnapshot = await getDocs(collection(db, `users/${currentUser.uid}/tasks`));
        const tasksData = tasksSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        // Récupérer les habitudes
        const habitsSnapshot = await getDocs(collection(db, `users/${currentUser.uid}/habits`));
        const habitsData = habitsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        setUserData(prev => ({
          ...prev,
          tasks: tasksData,
          habits: habitsData
        }));

      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, [currentUser]);

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
      // Simuler un délai pour donner l'impression d'une réponse IA
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Dans un cas réel, nous appellerions une API ici pour obtenir une réponse de l'IA
      // Mais pour cette démo, nous utilisons une fonction de simulation
      const aiResponse = mockResponse(inputMessage);
      
      setMessages(prev => [...prev, { role: 'assistant', content: aiResponse }]);
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Erreur lors de l'envoi du message");
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
      // Properly stop speech recognition
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        // This will be handled by the onend event
        setIsListening(false);
      }
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
          Je suis un assistant IA qui vous aide à atteindre vos objectifs de productivité
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
