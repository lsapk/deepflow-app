
// Calculate a real productivity score based on user data
export const calculateProductivityScore = (
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

// Generate insights based on real data
export const generateInsights = (
  tasksData: any[] = [],
  habitsData: any[] = [],
  journalData: any[] = [],
  focusData: any[] = [],
  productivityScore: number,
  type: 'productivity' | 'habits' | 'goals' | 'general' = 'general'
) => {
  const generatedInsights: InsightItem[] = [];
  
  // Insights sur la productivité générale
  if (tasksData && tasksData.length > 0 && habitsData && habitsData.length > 0) {
    generatedInsights.push({
      id: 'productivity-score',
      text: `Votre score de productivité pour cette semaine est de ${productivityScore}/100`,
      category: 'Performance',
      trend: productivityScore > 70 ? 'up' : productivityScore > 50 ? 'neutral' : 'down',
      value: productivityScore,
      recommendation: productivityScore > 70 
        ? 'Excellent travail! Vous êtes très efficace.' 
        : productivityScore > 50 
          ? 'Bonne progression. Continuez vos efforts!' 
          : 'Essayez de vous concentrer sur l\'achèvement de quelques tâches prioritaires.',
      priority: productivityScore > 70 ? 'high' : 'medium',
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
  
  return generatedInsights;
};

import { InsightItem } from './types';
