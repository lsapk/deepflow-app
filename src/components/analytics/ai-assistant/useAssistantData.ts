
import { useIndexedDB } from '@/hooks/use-indexed-db';

export const useAssistantData = () => {
  // Récupérer les données utilisateur depuis IndexedDB
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

  // Calculer des statistiques pour permettre l'assistant d'avoir du contexte
  const calculateStats = () => {
    const completedTasks = tasksData?.filter((t: any) => t.status === 'done')?.length || 0;
    const pendingTasks = tasksData?.filter((t: any) => t.status !== 'done')?.length || 0;
    const totalTasks = tasksData?.length || 0;
    
    const maintainedHabits = habitsData?.filter((h: any) => h.streak > 3)?.length || 0;
    const totalHabits = habitsData?.length || 0;
    
    const totalFocusMinutes = focusData?.reduce((acc: number, session: any) => 
      acc + (session.duration || 0), 0) || 0;
    
    const totalJournalEntries = journalData?.length || 0;
    
    return {
      completedTasks,
      pendingTasks,
      totalTasks,
      completionRate: totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0,
      maintainedHabits,
      totalHabits,
      habitConsistency: totalHabits > 0 ? (maintainedHabits / totalHabits) * 100 : 0,
      totalFocusMinutes,
      totalFocusHours: Math.floor(totalFocusMinutes / 60),
      totalJournalEntries
    };
  };

  return {
    tasksData,
    habitsData,
    journalData,
    focusData,
    stats: calculateStats()
  };
};
