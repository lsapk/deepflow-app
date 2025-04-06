
import { useAssistantData } from './useAssistantData';

export const useSystemPrompt = () => {
  const { tasksData, habitsData, journalData, focusData } = useAssistantData();

  const prepareSystemPrompt = () => {
    // Create a data summary to provide context to the AI
    const tasksCount = tasksData?.length || 0;
    const habitsCount = habitsData?.length || 0;
    const journalCount = journalData?.length || 0;
    const focusSessionsCount = focusData?.length || 0;
    
    const completedTasks = tasksData?.filter((t: any) => t.status === 'done').length || 0;
    const pendingTasks = tasksData?.filter((t: any) => t.status !== 'done').length || 0;
    
    const maintainedHabits = habitsData?.filter((h: any) => h.streak > 3).length || 0;

    // Construire un résumé détaillé des données
    let tasksDetails = "Pas de tâches.";
    if (tasksData && tasksData.length > 0) {
      tasksDetails = tasksData.map((t: any) => 
        `- ${t.title} (Status: ${t.status}, Priorité: ${t.priority || 'normale'}, Date: ${t.dueDate || 'non définie'})`
      ).join('\n');
    }
    
    let habitsDetails = "Pas d'habitudes.";
    if (habitsData && habitsData.length > 0) {
      habitsDetails = habitsData.map((h: any) => 
        `- ${h.title} (Série actuelle: ${h.streak || 0}, Fréquence: ${h.frequency || 'quotidienne'})`
      ).join('\n');
    }
    
    let journalDetails = "Pas d'entrées de journal.";
    if (journalData && journalData.length > 0) {
      journalDetails = `${journalData.length} entrées de journal, la plus récente datant du ${new Date(journalData[0]?.date || Date.now()).toLocaleDateString('fr-FR')}`;
    }
    
    let focusDetails = "Pas de sessions de concentration.";
    if (focusData && focusData.length > 0) {
      const totalMinutes = focusData.reduce((acc: number, session: any) => acc + (session.duration || 0), 0);
      focusDetails = `${focusData.length} sessions de concentration totalisant ${totalMinutes} minutes`;
    }

    return `Tu es un assistant productivité professionnel dédié à aider l'utilisateur à analyser ses données et améliorer son organisation.
Date actuelle: ${new Date().toLocaleDateString('fr-FR')}

Voici une synthèse des données de l'utilisateur :
- Tâches: ${tasksCount} au total (${completedTasks} terminées, ${pendingTasks} en attente)
  ${tasksDetails}

- Habitudes: ${habitsCount} au total (${maintainedHabits} maintenues régulièrement)
  ${habitsDetails}

- Journal: ${journalCount} entrées
  ${journalDetails}

- Focus: ${focusSessionsCount} sessions
  ${focusDetails}

Ton objectif est de fournir des analyses pertinentes et des conseils adaptés aux données de l'utilisateur.
Réponds toujours en français de manière concise, professionnelle et encourageante.
Si tu n'as pas assez de données spécifiques, propose des suggestions générales pour améliorer la productivité ou demande plus de détails.`;
  };

  return { prepareSystemPrompt };
};
