
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Sparkles, TrendingUp, TrendingDown, ArrowRight, Calendar, Target, Brain } from 'lucide-react';
import { motion } from "framer-motion";
import { useAuth } from '@/contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

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

  // Generate insights based on type and user data
  useEffect(() => {
    if (!currentUser) return;

    // In a real app, this would come from an API call or database
    // For now, we'll use mock data based on the insight type
    generateInsights();
    
    // Set last updated to current time
    setLastUpdated(new Date());
  }, [currentUser, type, data]);

  const generateInsights = () => {
    // Simulate loading insights from user data
    // In a real implementation, this would come from analyzing user data
    
    const mockInsights: InsightItem[] = [];
    
    if (type === 'productivity' || type === 'general') {
      mockInsights.push({
        id: '1',
        text: 'Votre productivité a augmenté de 15% cette semaine',
        category: 'Productivité',
        trend: 'up',
        value: 15,
        recommendation: 'Continuez avec vos sessions de focus quotidiennes',
        priority: 'high'
      });
    }
    
    if (type === 'habits' || type === 'general') {
      mockInsights.push({
        id: '2',
        text: 'Vous avez maintenu votre habitude de lecture pendant 7 jours consécutifs',
        category: 'Habitudes',
        trend: 'up',
        value: 7,
        recommendation: 'Essayez d\'augmenter légèrement votre durée de lecture',
        priority: 'medium'
      });
    }
    
    if (type === 'goals' || type === 'general') {
      mockInsights.push({
        id: '3',
        text: 'Vous êtes à 60% de votre objectif mensuel principal',
        category: 'Objectifs',
        trend: 'neutral',
        value: 60,
        recommendation: 'Concentrez-vous sur les tâches à forte valeur pour progresser plus rapidement',
        priority: 'high'
      });
    }
    
    if (type === 'general') {
      mockInsights.push({
        id: '4',
        text: 'Votre temps de sommeil moyen a diminué de 30 minutes',
        category: 'Bien-être',
        trend: 'down',
        value: 30,
        recommendation: 'Essayez de vous coucher 30 minutes plus tôt',
        priority: 'medium'
      });
    }
    
    setInsights(mockInsights);
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

  // Display placeholder for new users with no data
  if (insights.length === 0) {
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
            <Brain className="h-12 w-12 text-gray-300 dark:text-gray-600 mb-3" />
            <h3 className="text-lg font-medium mb-2">Pas encore d'analyses disponibles</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs">
              Continuez à utiliser DeepFlow pour recevoir des analyses personnalisées et des recommandations basées sur vos données.
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
