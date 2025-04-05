
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Bot, Send, RefreshCw } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/contexts/AuthContext';
import { useIndexedDB } from '@/hooks/use-indexed-db';
import { Habit } from '@/services/habitService';

interface AIAssistantProps {
  message?: string;
}

// Clé API OpenRouter
const API_KEY = "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";

const AIAssistant: React.FC<AIAssistantProps> = ({ message = "Bonjour ! Je suis votre assistant IA. Posez-moi des questions sur vos habitudes, tâches ou sessions de focus." }) => {
  const [userQuery, setUserQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState(message);
  const [userDataContext, setUserDataContext] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const { currentUser } = useAuth();

  // Récupérer les données depuis IndexedDB
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
    storeName: 'focus', 
    initialData: [] 
  });

  // Préparer les données utilisateur pour le contexte de l'IA
  useEffect(() => {
    const prepareUserContext = () => {
      let context = "Voici les données de l'utilisateur:\n";
      
      // Ajouter les données des tâches
      if (tasksData && tasksData.length > 0) {
        context += "\nTÂCHES:\n";
        tasksData.forEach((task: any, index: number) => {
          context += `${index + 1}. "${task.title}" - Statut: ${task.status}, Priorité: ${task.priority}, Date limite: ${task.due_date || 'non définie'}\n`;
        });
      } else {
        context += "\nAucune tâche n'est enregistrée.\n";
      }
      
      // Ajouter les données des habitudes
      if (habitsData && habitsData.length > 0) {
        context += "\nHABITUDES:\n";
        habitsData.forEach((habit: Habit, index: number) => {
          context += `${index + 1}. "${habit.title}" - Fréquence: ${habit.frequency}, Streak actuel: ${habit.streak}, Dernière complétion: ${habit.last_completed || 'jamais'}\n`;
        });
      } else {
        context += "\nAucune habitude n'est enregistrée.\n";
      }
      
      // Ajouter les données du journal
      if (journalData && journalData.length > 0) {
        context += "\nJOURNAL:\n";
        context += `${journalData.length} entrées de journal au total.\n`;
        context += `Dernière entrée le: ${journalData[0]?.created_at || 'non disponible'}\n`;
      }
      
      // Ajouter les données de focus
      if (focusData && focusData.length > 0) {
        context += "\nSESSIONS DE FOCUS:\n";
        context += `${focusData.length} sessions de focus enregistrées.\n`;
        
        // Calculer la durée totale
        const totalMinutes = focusData.reduce((total: number, session: any) => total + (session.duration || 0), 0);
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        
        context += `Temps total de focus: ${hours}h ${minutes}m\n`;
      }
      
      setUserDataContext(context);
    };
    
    prepareUserContext();
  }, [tasksData, habitsData, journalData, focusData]);

  const handleQuerySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userQuery.trim()) return;
    
    setIsLoading(true);
    
    try {
      // Construction du message pour l'API
      const messages = [
        {
          role: "system",
          content: `Tu es un assistant IA spécialisé dans la productivité et la gestion des habitudes. 
                    Tu as accès aux données personnelles suivantes de l'utilisateur:
                    ${userDataContext}
                    
                    Analyse ces données et réponds aux questions de l'utilisateur en te basant sur ses informations personnelles.
                    Sois concis, précis et utile. Propose des suggestions basées sur les données disponibles.
                    Tu dois répondre en français.`
        },
        {
          role: "user",
          content: userQuery
        }
      ];

      // Appel à l'API OpenRouter
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${API_KEY}`,
          "HTTP-Referer": window.location.origin,
          "X-Title": "DeepFlow Assistant"
        },
        body: JSON.stringify({
          model: "gryphe/mythomax-l2-13b", // Modèle gratuit de bonne qualité
          messages: messages,
          temperature: 0.2,
          max_tokens: 1000
        })
      });

      if (!response.ok) {
        throw new Error(`Erreur API: ${response.status}`);
      }

      const data = await response.json();
      const generatedText = data.choices[0]?.message?.content || "Désolé, je n'ai pas pu analyser vos données correctement.";
      
      setAiResponse(generatedText);
      setUserQuery('');
    } catch (error) {
      console.error('Erreur lors de la communication avec l\'IA:', error);
      toast.error('Impossible de traiter votre demande pour le moment.');
      setAiResponse("Désolé, une erreur s'est produite lors de l'analyse. Veuillez réessayer plus tard.");
    } finally {
      setIsLoading(false);
    }
  };

  const refreshData = () => {
    setRefreshing(true);
    setTimeout(() => {
      setAiResponse("Données actualisées ! Je suis prêt à répondre à vos questions sur votre productivité et vos habitudes.");
      setRefreshing(false);
      toast.success("Données actualisées avec succès!");
    }, 1000);
  };

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 dark:from-blue-950/40 dark:to-indigo-950/40 dark:border-blue-800">
      <CardContent className="pt-6 space-y-4">
        <div className="flex items-start gap-4">
          <div className="bg-blue-600 text-white p-2 rounded-full shrink-0">
            <Bot size={20} />
          </div>
          <div className="flex-1">
            <div className="flex justify-between items-center mb-1">
              <h3 className="font-medium text-blue-700 dark:text-blue-400">
                Assistant IA
              </h3>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={refreshData} 
                disabled={refreshing}
                className="h-8 w-8 p-0 text-blue-600"
              >
                <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
              </Button>
            </div>
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-4/6" />
              </div>
            ) : (
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
                {aiResponse}
              </p>
            )}
          </div>
        </div>
        
        <form onSubmit={handleQuerySubmit} className="flex items-center gap-2 pt-2">
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
            className="shrink-0"
          >
            <Send size={18} />
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default AIAssistant;
