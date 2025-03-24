
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BrainCircuit, Trophy, TrendingUp, AlertTriangle, Lightbulb } from 'lucide-react';

interface AIInsightProps {
  type: 'success' | 'warning' | 'info' | 'improvement';
  title: string;
  description: string;
  icon?: React.ReactNode;
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

export const AIInsightCard = ({ type, title, description, icon }: AIInsightProps) => {
  const styles = getTypeStyles(type);
  
  return (
    <Card className={`${styles.bgColor} border ${styles.borderColor}`}>
      <CardHeader className="pb-2">
        <CardTitle className={`text-lg flex items-center ${styles.textColor}`}>
          {icon || styles.icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-700 dark:text-gray-300">{description}</p>
      </CardContent>
    </Card>
  );
};

export const AIAnalysisSection = () => {
  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2 mb-4">
        <BrainCircuit className="h-6 w-6 text-purple-600" />
        <h2 className="text-2xl font-bold">Analyse IA de vos performances</h2>
      </div>
      
      <AIInsightCard
        type="success"
        title="Performance optimale"
        description="Vos meilleures performances sont enregistrées le matin entre 9h et 11h. Essayez de planifier vos tâches les plus importantes durant cette période."
      />
      
      <AIInsightCard
        type="improvement"
        title="Habitudes les plus constantes"
        description="Les habitudes liées à la santé montrent la meilleure progression. Vous avez maintenu une régularité de 87% ce mois-ci."
      />
      
      <AIInsightCard
        type="warning"
        title="Objectifs à risque"
        description="Deux de vos objectifs professionnels sont en retard par rapport au planning prévu. Envisagez de réajuster vos priorités cette semaine."
      />
      
      <AIInsightCard
        type="info"
        title="Suggestion d'organisation"
        description="Vous semblez plus productif lorsque vous regroupez des tâches similaires. Essayez la technique du 'task batching' pour optimiser votre flux de travail."
      />
    </div>
  );
};
