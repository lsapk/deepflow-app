
import { useState, useEffect } from 'react';
import { useAssistantData } from '../ai-assistant/useAssistantData';
import { calculateProductivityScore, generateInsights } from './utils';
import { InsightItem } from './types';

export const useInsightData = (type: 'productivity' | 'habits' | 'goals' | 'general' = 'general') => {
  const { tasksData, habitsData, journalData, focusData } = useAssistantData();
  const [loading, setLoading] = useState(true);
  const [insights, setInsights] = useState<InsightItem[]>([]);
  const [productivityScore, setProductivityScore] = useState(0);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [hasData, setHasData] = useState(false);

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

    // Generate insights based on the data
    const generatedInsights = generateInsights(
      tasksData, 
      habitsData, 
      journalData, 
      focusData, 
      score, 
      type
    );
    
    setInsights(generatedInsights);
    setLastUpdated(new Date());
    setLoading(false);
  }, [tasksData, habitsData, journalData, focusData, type]);

  return {
    loading,
    insights,
    productivityScore,
    lastUpdated,
    hasData,
  };
};
