
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Sparkles, TrendingUp, TrendingDown, ArrowRight, Calendar, Target, Brain, AlertCircle } from 'lucide-react';
import { motion } from "framer-motion";
import { useAuth } from '@/contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useIndexedDB } from '@/hooks/use-indexed-db';

interface AIInsightProps {
  title?: string;
  description?: string;
  type?: 'productivity' | 'habits' | 'goals' | 'general';
  data?: any;
}

interface InsightItem {
  id: string;
  text: string;
  category: string;
  trend?: 'up' | 'down' | 'neutral';
  value?: number;
  recommendation?: string;
  priority: 'high' | 'medium' | 'low';
}

export const AIInsightCard: React.FC<AIInsightProps> = ({ 
  title = "Analyse IA",
  description = "Voici quelques analyses basées sur vos données récentes",
  type = 'general',
  data 
}) => {
  const { currentUser } = useAuth();
  const [showAll, setShowAll] = useState(false);
  const [insights, setInsights] = useState<InsightItem[]>([]);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [hasData, setHasData] = useState(false);

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
  
  const { data: planningData } = useIndexedDB<any>({ 
    storeName: 'planning', 
    initialData: [] 
  });

  // Generate insights based on real data
  useEffect(() => {
    setLoading(true);
    
    // Vérifier si nous avons des données
    const hasAnyData = (
      (tasksData && tasksData.length > 0) || 
      (habitsData && habitsData.length > 0) || 
      (journalData && journalData.length > 0) || 
      (planningData && planningData.length > 0)
    );
    
    setHasData(hasAnyData);
    
    if (!hasAnyData) {
      setInsights([]);
      setLoading(false);
      return;
    }

    // Générer des insights basés sur les données réelles
    const generatedInsights: InsightItem[] = [];
    
    // Insights sur les habitudes
    if (habitsData && habitsData.length > 0 && (type === 'habits' || type === 'general')) {
      // Trouver la meilleure habitude (celle avec le streak le plus élevé)
      const bestHabit = habitsData.reduce((prev: any, current: any) => 
        (prev.streak > current.streak) ? prev : current, { streak: 0 });
      
      if (bestHabit && bestHabit.streak > 0) {
        generatedInsights.push({
          id: 'habit-streak',
          text: `Vous avez maintenu l'habitude "${bestHabit.title}" pendant ${bestHabit.streak} jours consécutifs`,
          category: 'Habitudes',
          trend: 'up',
          value: bestHabit.streak,
          recommendation: 'Continuez sur cette lancée pour atteindre votre objectif !',
          priority: bestHabit.streak > 5 ? 'high' : 'medium'
        });
      }
      
      // Habitude à améliorer
      const habitToImprove = habitsData.find((h: any) => h.streak === 0 || h.streak < 3);
      if (habitToImprove) {
        generatedInsights.push({
          id: 'habit-improve',
          text: `Votre habitude "${habitToImprove.title}" pourrait être renforcée`,
          category: 'Habitudes',
          trend: 'down',
          value: habitToImprove.streak,
          recommendation: 'Essayez de vous créer un rappel quotidien pour cette habitude',
          priority: 'medium'
        });
      }
      
      // Nombre total d'habitudes actives
      if (habitsData.length >= 3) {
        generatedInsights.push({
          id: 'habit-count',
          text: `Vous suivez actuellement ${habitsData.length} habitudes, c'est bien !`,
          category: 'Habitudes',
          trend: 'neutral',
          recommendation: 'Concentrez-vous sur celles qui sont les plus importantes pour vous',
          priority: 'low'
        });
      }
    }
    
    // Insights sur les tâches
    if (tasksData && tasksData.length > 0 && (type === 'productivity' || type === 'general')) {
      const completedTasks = tasksData.filter((t: any) => t.completed);
      const pendingTasks = tasksData.filter((t: any) => !t.completed);
      const completionRate = tasksData.length > 0 ? Math.round((completedTasks.length / tasksData.length) * 100) : 0;
      
      if (completionRate > 0) {
        generatedInsights.push({
          id: 'task-completion',
          text: `Votre taux de complétion des tâches est de ${completionRate}%`,
          category: 'Productivité',
          trend: completionRate > 50 ? 'up' : 'neutral',
          value: completionRate,
          recommendation: completionRate < 50 ? 'Essayez de diviser vos grandes tâches en plus petites sous-tâches' : 'Bon travail, continuez comme ça !',
          priority: completionRate > 70 ? 'high' : 'medium'
        });
      }
      
      // Tâches en retard
      const today = new Date();
      const overdueTasks = pendingTasks.filter((t: any) => {
        if (!t.due_date) return false;
        const dueDate = new Date(t.due_date);
        return dueDate < today;
      });
      
      if (overdueTasks.length > 0) {
        generatedInsights.push({
          id: 'overdue-tasks',
          text: `Vous avez ${overdueTasks.length} tâche${overdueTasks.length > 1 ? 's' : ''} en retard`,
          category: 'Productivité',
          trend: 'down',
          value: overdueTasks.length,
          recommendation: 'Réévaluez leur priorité ou programmez un moment dédié pour les terminer',
          priority: 'high'
        });
      }
    }
    
    // Insights sur le journal
    if (journalData && journalData.length > 0 && type === 'general') {
      // Fréquence d'écriture
      const writingFrequency = journalData.length;
      if (writingFrequency > 3) {
        generatedInsights.push({
          id: 'journal-frequency',
          text: `Vous avez écrit ${writingFrequency} entrées dans votre journal, bravo !`,
          category: 'Bien-être',
          trend: 'up',
          recommendation: 'La régularité dans la tenue de journal contribue à une meilleure clarté mentale',
          priority: 'medium'
        });
      }
    }
    
    // Insights sur le planning
    if (planningData && planningData.length > 0 && (type === 'goals' || type === 'general')) {
      const upcomingEvents = planningData.filter((event: any) => {
        if (!event.date) return false;
        const eventDate = new Date(event.date);
        const today = new Date();
        return eventDate > today;
      });
      
      if (upcomingEvents.length > 0) {
        generatedInsights.push({
          id: 'upcoming-events',
          text: `Vous avez ${upcomingEvents.length} événement${upcomingEvents.length > 1 ? 's' : ''} à venir`,
          category: 'Objectifs',
          trend: 'neutral',
          value: upcomingEvents.length,
          recommendation: 'Assurez-vous de prévoir du temps de préparation pour chaque événement',
          priority: 'medium'
        });
      }
    }
    
    setInsights(generatedInsights);
    setLastUpdated(new Date());
    setLoading(false);
  }, [currentUser, type, tasksData, habitsData, journalData, planningData]);

  const getTrendIcon = (trend?: 'up' | 'down' | 'neutral') => {
    switch(trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };
  
  const getPriorityColor = (priority: string) => {
    switch(priority) {
      case 'high':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'low':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      default:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch(category.toLowerCase()) {
      case 'productivité':
        return <Target className="h-4 w-4 mr-1" />;
      case 'habitudes':
        return <Calendar className="h-4 w-4 mr-1" />;
      case 'objectifs':
        return <Target className="h-4 w-4 mr-1" />;
      case 'bien-être':
        return <Brain className="h-4 w-4 mr-1" />;
      default:
        return <Sparkles className="h-4 w-4 mr-1" />;
    }
  };

  // Afficher un message lorsqu'il n'y a pas de données
  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xl flex items-center">
            <Sparkles className="h-5 w-5 mr-2 text-primary" />
            {title}
          </CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <div className="animate-spin h-8 w-8 border-t-2 border-b-2 border-primary rounded-full mb-3"></div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Analyse en cours...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Display placeholder for new users with no data
  if (!hasData || insights.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xl flex items-center">
            <Sparkles className="h-5 w-5 mr-2 text-primary" />
            {title}
          </CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <AlertCircle className="h-12 w-12 text-gray-300 dark:text-gray-600 mb-3" />
            <h3 className="text-lg font-medium mb-2">Pas encore de données disponibles</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs">
              Ajoutez des tâches, habitudes ou entrées de journal pour recevoir des analyses personnalisées.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-xl flex items-center">
          <Sparkles className="h-5 w-5 mr-2 text-primary" />
          {title}
        </CardTitle>
        <CardDescription className="flex justify-between items-center">
          <span>{description}</span>
          <Badge variant="outline" className="text-xs">
            Mis à jour {formatDistanceToNow(lastUpdated, { addSuffix: true, locale: fr })}
          </Badge>
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="space-y-4">
          {insights.slice(0, showAll ? insights.length : 2).map((insight, index) => (
            <motion.div 
              key={insight.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="rounded-md border p-3 shadow-sm"
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center">
                  {getCategoryIcon(insight.category)}
                  <span className="text-sm font-medium">{insight.category}</span>
                </div>
                <Badge className={`text-xs ${getPriorityColor(insight.priority)}`}>
                  {insight.priority === 'high' ? 'Haute' : insight.priority === 'medium' ? 'Moyenne' : 'Basse'}
                </Badge>
              </div>
              
              <p className="text-sm mb-2">{insight.text}</p>
              
              {insight.trend && (
                <div className="flex items-center text-sm mb-2">
                  {getTrendIcon(insight.trend)}
                  <span className={`ml-1 ${
                    insight.trend === 'up' ? 'text-green-600 dark:text-green-400' : 
                    insight.trend === 'down' ? 'text-red-600 dark:text-red-400' : ''
                  }`}>
                    {insight.value && `${insight.value}%`}
                  </span>
                </div>
              )}
              
              {insight.recommendation && (
                <>
                  <Separator className="my-2" />
                  <div className="text-xs text-gray-500 dark:text-gray-400 italic mt-1">
                    Conseil: {insight.recommendation}
                  </div>
                </>
              )}
            </motion.div>
          ))}
          
          {insights.length > 2 && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full" 
              onClick={() => setShowAll(!showAll)}
            >
              {showAll ? "Afficher moins" : "Afficher plus"}
            </Button>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="outline" size="sm" className="w-full">
          <span>Analyse complète</span>
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </CardFooter>
    </Card>
  );
};
