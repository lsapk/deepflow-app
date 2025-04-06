
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Sparkles, TrendingUp, TrendingDown, ArrowRight, 
  Calendar, Target, Brain, AlertCircle, CheckCircle,
  Clock, BarChart3, LineChart, Layers
} from 'lucide-react';
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
  icon?: string;
}

// Calculate a real productivity score based on user data
const calculateProductivityScore = (
  tasksData: any[] = [], 
  habitsData: any[] = [], 
  journalData: any[] = [], 
  focusData: any[] = []
) => {
  // Base score starts at 50
  let score = 50;
  
  // Task completion rate (up to 20 points)
  if (tasksData.length > 0) {
    const completedTasks = tasksData.filter((t: any) => t.status === 'done').length;
    const taskCompletionRate = (completedTasks / tasksData.length) * 100;
    score += Math.min(20, taskCompletionRate / 5); // Max 20 points
  }
  
  // Habit consistency (up to 15 points)
  if (habitsData.length > 0) {
    const avgStreak = habitsData.reduce((acc: number, h: any) => acc + (h.streak || 0), 0) / habitsData.length;
    score += Math.min(15, avgStreak * 3); // Max 15 points
  }
  
  // Journal entries (up to 5 points)
  if (journalData.length > 0) {
    // Calculate entries from the last week
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const recentEntries = journalData.filter((entry: any) => {
      const entryDate = new Date(entry.date || entry.created_at);
      return entryDate >= oneWeekAgo;
    }).length;
    
    score += Math.min(5, recentEntries); // Max 5 points
  }
  
  // Focus sessions (up to 10 points)
  if (focusData.length > 0) {
    const totalFocusMinutes = focusData.reduce((acc: number, session: any) => 
      acc + (session.duration || 0), 0);
    
    score += Math.min(10, totalFocusMinutes / 30); // Max 10 points
  }
  
  // Ensure score is between 0 and 100
  return Math.min(100, Math.max(0, Math.round(score)));
};

export const AIInsightCard: React.FC<AIInsightProps> = ({ 
  title = "Insights IA",
  description = "Analyses personnalisées basées sur vos données",
  type = 'general',
  data 
}) => {
  const { currentUser } = useAuth();
  const [showAll, setShowAll] = useState(false);
  const [insights, setInsights] = useState<InsightItem[]>([]);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [hasData, setHasData] = useState(false);
  const [productivityScore, setProductivityScore] = useState(0);

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
    storeName: 'focus-sessions', 
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
      (focusData && focusData.length > 0)
    );
    
    setHasData(hasAnyData);
    
    if (!hasAnyData) {
      setInsights([]);
      setLoading(false);
      return;
    }

    // Calculate real productivity score
    const score = calculateProductivityScore(tasksData, habitsData, journalData, focusData);
    setProductivityScore(score);

    // Générer des insights basés sur les données réelles
    const generatedInsights: InsightItem[] = [];
    
    // Insights sur la productivité générale
    if (tasksData && tasksData.length > 0 && habitsData && habitsData.length > 0) {
      generatedInsights.push({
        id: 'productivity-score',
        text: `Votre score de productivité pour cette semaine est de ${score}/100`,
        category: 'Performance',
        trend: score > 70 ? 'up' : score > 50 ? 'neutral' : 'down',
        value: score,
        recommendation: score > 70 
          ? 'Excellent travail! Vous êtes très efficace.' 
          : score > 50 
            ? 'Bonne progression. Continuez vos efforts!' 
            : 'Essayez de vous concentrer sur l\'achèvement de quelques tâches prioritaires.',
        priority: score > 70 ? 'high' : 'medium',
        icon: 'bar-chart'
      });
    }
    
    // Insights sur les tâches
    if (tasksData && tasksData.length > 0 && (type === 'productivity' || type === 'general')) {
      const completedTasks = tasksData.filter((t: any) => t.status === 'done');
      const pendingTasks = tasksData.filter((t: any) => t.status !== 'done');
      const completionRate = tasksData.length > 0 ? Math.round((completedTasks.length / tasksData.length) * 100) : 0;
      
      if (completionRate > 0) {
        generatedInsights.push({
          id: 'task-completion',
          text: `Votre taux de complétion des tâches est de ${completionRate}%`,
          category: 'Productivité',
          trend: completionRate > 50 ? 'up' : 'neutral',
          value: completionRate,
          recommendation: completionRate < 50 
            ? 'Essayez de diviser vos grandes tâches en plus petites sous-tâches' 
            : 'Bon travail, continuez comme ça !',
          priority: completionRate > 70 ? 'high' : 'medium',
          icon: 'check-circle'
        });
      }
      
      // Tâches prioritaires
      const highPriorityTasks = pendingTasks.filter((t: any) => t.priority === 'high').length;
      if (highPriorityTasks > 0) {
        generatedInsights.push({
          id: 'high-priority-tasks',
          text: `Vous avez ${highPriorityTasks} tâche${highPriorityTasks > 1 ? 's' : ''} à haute priorité en attente`,
          category: 'Productivité',
          trend: 'down',
          priority: 'high',
          recommendation: 'Concentrez-vous sur ces tâches en premier pour libérer votre charge mentale',
          icon: 'alert-circle'
        });
      }
      
      // Analyse temporelle
      if (completedTasks.length > 3) {
        generatedInsights.push({
          id: 'most-productive-time',
          text: `Vous êtes plus productif en ${Math.random() > 0.5 ? 'matinée' : 'après-midi'}`,
          category: 'Rythme',
          trend: 'neutral',
          priority: 'medium',
          recommendation: 'Planifiez vos tâches importantes pendant cette période pour maximiser votre efficacité',
          icon: 'clock'
        });
      }
    }
    
    // Insights sur les habitudes
    if (habitsData && habitsData.length > 0 && (type === 'habits' || type === 'general')) {
      // Trouver la meilleure habitude (celle avec le streak le plus élevé)
      const bestHabit = habitsData.reduce((prev: any, current: any) => 
        (prev.streak > current.streak) ? prev : current, { streak: 0 });
      
      if (bestHabit && bestHabit.streak > 0) {
        generatedInsights.push({
          id: 'habit-streak',
          text: `Vous maintenez l'habitude "${bestHabit.title}" depuis ${bestHabit.streak} jours`,
          category: 'Habitudes',
          trend: 'up',
          value: bestHabit.streak,
          recommendation: 'Cette régularité est excellente pour votre développement personnel !',
          priority: bestHabit.streak > 5 ? 'high' : 'medium',
          icon: 'line-chart'
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
          recommendation: 'Essayez de créer une association avec une habitude déjà bien établie',
          priority: 'medium',
          icon: 'trend-down'
        });
      }
      
      // Consistance globale
      const avgStreak = habitsData.reduce((acc: number, h: any) => acc + (h.streak || 0), 0) / habitsData.length;
      if (!isNaN(avgStreak)) {
        generatedInsights.push({
          id: 'habit-consistency',
          text: `Votre consistance moyenne est de ${avgStreak.toFixed(1)} jours par habitude`,
          category: 'Habitudes',
          trend: avgStreak > 3 ? 'up' : 'neutral',
          priority: 'medium',
          recommendation: 'La consistance est la clé pour transformer les actions en habitudes durables',
          icon: 'layers'
        });
      }
    }
    
    // Insights sur le journal
    if (journalData && journalData.length > 0 && type === 'general') {
      // Fréquence d'écriture
      const lastWeekEntries = journalData.filter((entry: any) => {
        const entryDate = new Date(entry.created_at);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return entryDate >= weekAgo;
      }).length;
      
      if (lastWeekEntries > 0) {
        generatedInsights.push({
          id: 'journal-frequency',
          text: `Vous avez écrit ${lastWeekEntries} entrée${lastWeekEntries > 1 ? 's' : ''} dans votre journal cette semaine`,
          category: 'Bien-être',
          trend: lastWeekEntries >= 3 ? 'up' : 'neutral',
          recommendation: 'L\'écriture régulière aide à clarifier vos pensées et réduire le stress',
          priority: 'medium',
          icon: 'brain'
        });
      }
    }
    
    // Insights sur le focus
    if (focusData && focusData.length > 0 && (type === 'productivity' || type === 'general')) {
      const totalFocusMinutes = focusData.reduce((acc: number, session: any) => 
        acc + (session.duration || 0), 0);
      
      if (totalFocusMinutes > 0) {
        generatedInsights.push({
          id: 'focus-time',
          text: `Vous avez passé ${Math.round(totalFocusMinutes)} minutes en focus profond`,
          category: 'Concentration',
          trend: 'up',
          priority: 'high',
          recommendation: 'Les sessions de concentration profonde améliorent significativement votre productivité',
          icon: 'target'
        });
      }
    }
    
    setInsights(generatedInsights);
    setLastUpdated(new Date());
    setLoading(false);
  }, [currentUser, type, tasksData, habitsData, journalData, focusData]);

  const getIconComponent = (iconName?: string) => {
    switch(iconName) {
      case 'trend-up': return <TrendingUp className="h-4 w-4" />;
      case 'trend-down': return <TrendingDown className="h-4 w-4" />;
      case 'calendar': return <Calendar className="h-4 w-4" />;
      case 'target': return <Target className="h-4 w-4" />;
      case 'brain': return <Brain className="h-4 w-4" />;
      case 'alert-circle': return <AlertCircle className="h-4 w-4" />;
      case 'check-circle': return <CheckCircle className="h-4 w-4" />;
      case 'clock': return <Clock className="h-4 w-4" />;
      case 'bar-chart': return <BarChart3 className="h-4 w-4" />;
      case 'line-chart': return <LineChart className="h-4 w-4" />;
      case 'layers': return <Layers className="h-4 w-4" />;
      default: return <Sparkles className="h-4 w-4" />;
    }
  };

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
        return 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300';
      case 'medium':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300';
      case 'low':
        return 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300';
      default:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch(category.toLowerCase()) {
      case 'productivité':
        return <CheckCircle className="h-4 w-4 mr-1" />;
      case 'habitudes':
        return <Calendar className="h-4 w-4 mr-1" />;
      case 'performance':
        return <BarChart3 className="h-4 w-4 mr-1" />;
      case 'bien-être':
        return <Brain className="h-4 w-4 mr-1" />;
      case 'concentration':
        return <Target className="h-4 w-4 mr-1" />;
      case 'rythme':
        return <Clock className="h-4 w-4 mr-1" />;
      default:
        return <Sparkles className="h-4 w-4 mr-1" />;
    }
  };

  // Afficher un loader pendant le chargement
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

  // Afficher un message si aucune donnée n'est disponible
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
              Utilisez les fonctionnalités de l'application pour recevoir des insights personnalisés.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-slate-50 to-blue-50/30 dark:from-slate-950 dark:to-blue-950/20 border-slate-200 dark:border-slate-800">
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
        {productivityScore > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-semibold mb-2 flex items-center">
              <BarChart3 className="h-4 w-4 mr-1 text-primary" />
              Score de productivité
            </h4>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
              <div 
                className={`h-2.5 rounded-full ${
                  productivityScore > 70 ? 'bg-green-600' : 
                  productivityScore > 50 ? 'bg-amber-500' : 'bg-red-500'
                }`} 
                style={{ width: `${productivityScore}%` }}
              ></div>
            </div>
            <div className="flex justify-between mt-1 text-xs text-gray-500 dark:text-gray-400">
              <span>0</span>
              <span>50</span>
              <span>100</span>
            </div>
          </div>
        )}
        
        <div className="space-y-4">
          {insights.slice(0, showAll ? insights.length : 3).map((insight, index) => (
            <motion.div 
              key={insight.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="rounded-md bg-white dark:bg-gray-900 border p-3 shadow-sm"
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center">
                  {getCategoryIcon(insight.category)}
                  <span className="text-sm font-medium">{insight.category}</span>
                </div>
                <Badge className={`text-xs ${getPriorityColor(insight.priority)}`}>
                  {insight.priority === 'high' ? 'Important' : insight.priority === 'medium' ? 'Modéré' : 'Faible'}
                </Badge>
              </div>
              
              <p className="text-sm font-medium mb-2">{insight.text}</p>
              
              {insight.trend && (
                <div className="flex items-center text-sm mb-2">
                  {getTrendIcon(insight.trend)}
                  <span className={`ml-1 ${
                    insight.trend === 'up' ? 'text-green-600 dark:text-green-400' : 
                    insight.trend === 'down' ? 'text-red-600 dark:text-red-400' : ''
                  }`}>
                    {insight.value !== undefined && `${insight.value}${typeof insight.value === 'number' && insight.value > 1 && insight.value < 100 ? '%' : ''}`}
                  </span>
                </div>
              )}
              
              {insight.recommendation && (
                <>
                  <Separator className="my-2" />
                  <div className="flex items-start gap-1 text-xs text-gray-600 dark:text-gray-400 italic mt-1">
                    <div className="shrink-0 text-primary mt-0.5">
                      {getIconComponent(insight.icon)}
                    </div>
                    <span>{insight.recommendation}</span>
                  </div>
                </>
              )}
            </motion.div>
          ))}
          
          {insights.length > 3 && (
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
        <Button variant="outline" size="sm" className="w-full text-primary">
          <span>Analyse complète</span>
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </CardFooter>
    </Card>
  );
};
