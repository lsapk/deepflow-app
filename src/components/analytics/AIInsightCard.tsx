
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BrainCircuit, Trophy, TrendingUp, AlertTriangle, Lightbulb, Star, ArrowUp, ArrowDown, Clock, Target, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';

interface AIInsightProps {
  type: 'success' | 'warning' | 'info' | 'improvement';
  title: string;
  description: string;
  icon?: React.ReactNode;
  data?: {
    label: string;
    value: string | number;
    trend?: 'up' | 'down' | 'neutral';
    trendValue?: string | number;
  }[];
  actionLabel?: string;
  onAction?: () => void;
}

const getTypeStyles = (type: AIInsightProps['type']) => {
  switch (type) {
    case 'success':
      return {
        bgColor: 'bg-green-50 dark:bg-green-950/30',
        borderColor: 'border-green-100 dark:border-green-900',
        textColor: 'text-green-800 dark:text-green-300',
        icon: <Trophy className="mr-2 h-5 w-5" />
      };
    case 'warning':
      return {
        bgColor: 'bg-amber-50 dark:bg-amber-950/30',
        borderColor: 'border-amber-100 dark:border-amber-900',
        textColor: 'text-amber-800 dark:text-amber-300',
        icon: <AlertTriangle className="mr-2 h-5 w-5" />
      };
    case 'improvement':
      return {
        bgColor: 'bg-blue-50 dark:bg-blue-950/30',
        borderColor: 'border-blue-100 dark:border-blue-900',
        textColor: 'text-blue-800 dark:text-blue-300',
        icon: <TrendingUp className="mr-2 h-5 w-5" />
      };
    case 'info':
    default:
      return {
        bgColor: 'bg-indigo-50 dark:bg-indigo-950/30',
        borderColor: 'border-indigo-100 dark:border-indigo-900',
        textColor: 'text-indigo-800 dark:text-indigo-300',
        icon: <Lightbulb className="mr-2 h-5 w-5" />
      };
  }
};

export const AIInsightCard = ({ type, title, description, icon, data, actionLabel, onAction }: AIInsightProps) => {
  const styles = getTypeStyles(type);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className={`${styles.bgColor} border ${styles.borderColor} overflow-hidden`}>
        <CardHeader className="pb-2">
          <CardTitle className={`text-lg flex items-center ${styles.textColor}`}>
            {icon || styles.icon}
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700 dark:text-gray-300 mb-3">{description}</p>
          
          {data && data.length > 0 && (
            <div className="mt-4 space-y-2">
              {data.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-white/40 dark:bg-gray-800/40 rounded-md">
                  <span className="text-sm font-medium">{item.label}</span>
                  <div className="flex items-center">
                    <span className="font-bold mr-2">{item.value}</span>
                    {item.trend && (
                      <span className={`flex items-center text-xs ${
                        item.trend === 'up' ? 'text-green-600 dark:text-green-400' : 
                        item.trend === 'down' ? 'text-red-600 dark:text-red-400' : 
                        'text-gray-500'
                      }`}>
                        {item.trend === 'up' && <ArrowUp className="h-3 w-3 mr-1" />}
                        {item.trend === 'down' && <ArrowDown className="h-3 w-3 mr-1" />}
                        {item.trendValue && item.trendValue}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {actionLabel && onAction && (
            <button 
              onClick={onAction}
              className={`mt-4 px-4 py-2 rounded-md text-sm font-medium text-white 
                ${type === 'success' ? 'bg-green-600 hover:bg-green-700' : 
                  type === 'warning' ? 'bg-amber-600 hover:bg-amber-700' : 
                  type === 'improvement' ? 'bg-blue-600 hover:bg-blue-700' : 
                  'bg-indigo-600 hover:bg-indigo-700'}`}
            >
              {actionLabel}
            </button>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export const AIAnalysisSection = () => {
  const currentDate = new Date();
  const formattedDate = new Intl.DateTimeFormat('fr-FR', { 
    weekday: 'long', 
    day: 'numeric',
    month: 'long'
  }).format(currentDate);
  
  // Capitalize first letter
  const capitalizedDate = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);
  
  return (
    <div className="space-y-4">
      <div className="flex flex-col space-y-2 mb-6">
        <div className="flex items-center space-x-2">
          <BrainCircuit className="h-6 w-6 text-purple-600" />
          <h2 className="text-2xl font-bold">Analyse IA de vos performances</h2>
        </div>
        <p className="text-muted-foreground">Analyse personnalisée pour {capitalizedDate}</p>
      </div>
      
      <AIInsightCard
        type="success"
        title="Performance optimale"
        description="Vos meilleures performances sont enregistrées le matin entre 9h et 11h. Essayez de planifier vos tâches les plus importantes durant cette période."
        data={[
          { label: "Productivité matinale", value: "87%", trend: "up", trendValue: "+12%" },
          { label: "Tâches complétées", value: "23", trend: "up", trendValue: "+5" }
        ]}
        actionLabel="Planifier demain"
        onAction={() => window.location.href = '/planning'}
      />
      
      <AIInsightCard
        type="improvement"
        title="Habitudes les plus constantes"
        description="Les habitudes liées à la santé montrent la meilleure progression. Vous avez maintenu une régularité de 87% ce mois-ci."
        icon={<Star className="mr-2 h-5 w-5" />}
        data={[
          { label: "Méditation quotidienne", value: "92%", trend: "up", trendValue: "+8%" },
          { label: "Exercice physique", value: "78%", trend: "up", trendValue: "+15%" }
        ]}
      />
      
      <AIInsightCard
        type="warning"
        title="Objectifs à risque"
        description="Deux de vos objectifs professionnels sont en retard par rapport au planning prévu. Envisagez de réajuster vos priorités cette semaine."
        icon={<Target className="mr-2 h-5 w-5" />}
        data={[
          { label: "Projet Alpha", value: "65%", trend: "down", trendValue: "-10%" },
          { label: "Apprentissage JS", value: "42%", trend: "down", trendValue: "-5%" }
        ]}
        actionLabel="Ajuster objectifs"
        onAction={() => window.location.href = '/goals'}
      />
      
      <AIInsightCard
        type="info"
        title="Suggestion d'organisation"
        description="Vous semblez plus productif lorsque vous regroupez des tâches similaires. Essayez la technique du 'time blocking' pour optimiser votre flux de travail."
        icon={<Clock className="mr-2 h-5 w-5" />}
        actionLabel="Appliquer à mon planning"
        onAction={() => window.location.href = '/planning'}
      />
      
      <AIInsightCard
        type="improvement"
        title="Évènements importants à venir"
        description="L'IA a identifié ces évènements comme prioritaires dans votre calendrier pour les 7 prochains jours."
        icon={<Calendar className="mr-2 h-5 w-5" />}
        data={[
          { label: "Réunion d'équipe", value: "Demain, 14h00" },
          { label: "Échéance rapport", value: "Vendredi, 18h00" }
        ]}
        actionLabel="Voir mon calendrier"
        onAction={() => window.location.href = '/planning'}
      />
    </div>
  );
};
