
import React from 'react';
import { AIInsightCard } from './AIInsightCard';
import { defaultAIInsights } from './ChartData';
import { toast } from '@/hooks/use-toast';

interface AIInsightsSectionProps {
  showAIInsights: boolean;
  setShowAIInsights: (show: boolean) => void;
  aiInsights: {title: string, content: string}[];
}

export const AIInsightsSection: React.FC<AIInsightsSectionProps> = ({ 
  showAIInsights, 
  setShowAIInsights, 
  aiInsights 
}) => {
  
  const handleAIAssistantToggle = () => {
    setShowAIInsights(!showAIInsights);
    toast({
      title: showAIInsights ? "Assistant IA masqué" : "Assistant IA affiché",
      description: showAIInsights ? "L'assistant IA a été masqué" : "Vous pouvez maintenant interagir avec l'assistant IA",
    });
  };

  const handleInsightClick = (insight: {title: string, content: string}) => {
    toast({
      title: insight.title,
      description: "Détails de l'insight chargés",
    });
  };

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <AIInsightCard 
        title="IA Assistant" 
        description="Analysez vos données avec l'assistant IA"
        onClick={handleAIAssistantToggle}
      />
      
      {aiInsights.map((insight, index) => (
        <AIInsightCard 
          key={index}
          title={insight.title}
          description={insight.content}
          onClick={() => handleInsightClick(insight)}
        />
      ))}
    </div>
  );
};
