
import { useAssistantData } from './useAssistantData';
import { getAllHabits } from '@/utils/habitUtils';
import { useEffect, useState } from 'react';

export const useSystemPrompt = () => {
  const { tasksData, habitsData, journalData, focusData, stats } = useAssistantData();
  const [allHabits, setAllHabits] = useState<any[]>([]);
  
  // Récupérer toutes les habitudes
  useEffect(() => {
    const fetchHabits = async () => {
      try {
        const habits = await getAllHabits();
        setAllHabits(habits);
      } catch (error) {
        console.error("Erreur lors de la récupération des habitudes:", error);
      }
    };
    
    fetchHabits();
  }, []);

  const prepareSystemPrompt = () => {
    // Construire un résumé détaillé des données
    let tasksDetails = "Pas de tâches.";
    if (tasksData && tasksData.length > 0) {
      tasksDetails = tasksData.slice(0, 10).map((t: any) => 
        `- ${t.title} (Status: ${t.status}, Priorité: ${t.priority || 'normale'}, Date: ${t.dueDate || 'non définie'})`
      ).join('\n');
      
      if (tasksData.length > 10) {
        tasksDetails += `\n- ... et ${tasksData.length - 10} autres tâches`;
      }
    }
    
    // Ajouter les détails des habitudes à partir des deux sources
    let combinedHabitsData = [...(habitsData || []), ...(allHabits || [])];
    let uniqueHabits = Array.from(new Map(combinedHabitsData.map((h: any) => [h.id, h])).values());
    
    let habitsDetails = "Pas d'habitudes.";
    if (uniqueHabits.length > 0) {
      habitsDetails = uniqueHabits.map((h: any) => 
        `- ${h.title} (Série actuelle: ${h.streak || 0}, Fréquence: ${h.frequency || 'quotidienne'}, Description: ${h.description || 'Non définie'})`
      ).join('\n');
    }
    
    let journalDetails = "Pas d'entrées de journal.";
    if (journalData && journalData.length > 0) {
      // Ajouter les dernières entrées de journal pour plus de contexte
      journalDetails = `${journalData.length} entrées de journal, la plus récente datant du ${new Date(journalData[0]?.date || Date.now()).toLocaleDateString('fr-FR')}`;
      
      if (journalData.length > 0) {
        const recentEntries = journalData.slice(0, 3);
        journalDetails += '\nEntrées récentes:\n' + recentEntries.map((entry: any) => 
          `- ${new Date(entry.date).toLocaleDateString('fr-FR')}: ${entry.title} (Humeur: ${entry.mood || 'non précisée'})`
        ).join('\n');
      }
    }
    
    let focusDetails = "Pas de sessions de concentration.";
    if (focusData && focusData.length > 0) {
      focusDetails = `${focusData.length} sessions de concentration totalisant ${stats.totalFocusMinutes} minutes (${stats.totalFocusHours} heures)`;
      
      // Ajouter des détails sur les sessions récentes
      if (focusData.length > 0) {
        const recentSessions = focusData.slice(0, 3);
        focusDetails += '\nSessions récentes:\n' + recentSessions.map((session: any) => 
          `- ${new Date(session.date).toLocaleDateString('fr-FR')}: ${session.duration} minutes (${session.task || 'sans tâche'})`
        ).join('\n');
      }
    }

    return `Tu es un assistant productivité professionnel dédié à aider l'utilisateur à analyser ses données et améliorer son organisation.
Date actuelle: ${new Date().toLocaleDateString('fr-FR')}

Voici une synthèse des données de l'utilisateur:
• Tâches: ${stats.totalTasks} au total (${stats.completedTasks} terminées, ${stats.pendingTasks} en attente)
  Taux de complétion: ${stats.completionRate.toFixed(1)}%
  ${tasksDetails}

• Habitudes: ${uniqueHabits.length} au total (${stats.maintainedHabits} maintenues régulièrement)
  Taux de cohérence: ${stats.habitConsistency.toFixed(1)}%
  ${habitsDetails}

• Journal: ${stats.totalJournalEntries} entrées
  ${journalDetails}

• Focus: ${stats.totalFocusHours} heures (${stats.totalFocusMinutes} minutes)
  ${focusDetails}

Tes objectifs:
1. Fournir des analyses pertinentes basées sur ces données
2. Offrir des conseils personnalisés pour améliorer la productivité
3. Répondre aux questions de manière concise, professionnelle et encourageante
4. Toujours répondre en français avec un ton positif et motivant

Astuces importantes:
- Utilise les informations sur les habitudes pour donner des conseils personnalisés
- Quand tu analyses les données de focus, mentionne les tendances et propose des améliorations
- Si l'utilisateur n'a pas beaucoup de données, suggère-lui de nouvelles habitudes ou techniques
- Quand tu réponds, évite le format JSON ou les structures imbriquées - réponds en texte simple

Si tu n'as pas assez de données spécifiques, propose des suggestions générales pour améliorer la productivité ou demande plus de détails.`;
  };

  return { prepareSystemPrompt };
};
