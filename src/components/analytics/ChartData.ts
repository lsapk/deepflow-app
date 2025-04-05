
// Mock data for analytics charts

export const productivityData = [
  { day: 'Lun', tasks: 4, focus: 120, score: 85 },
  { day: 'Mar', tasks: 6, focus: 90, score: 78 },
  { day: 'Mer', tasks: 5, focus: 150, score: 92 },
  { day: 'Jeu', tasks: 3, focus: 80, score: 71 },
  { day: 'Ven', tasks: 7, focus: 180, score: 95 },
  { day: 'Sam', tasks: 2, focus: 60, score: 65 },
  { day: 'Dim', tasks: 1, focus: 30, score: 58 },
];

export const habitsComplianceData = [
  { name: 'Complétées', value: 72, color: '#4ade80' },
  { name: 'Manquées', value: 28, color: '#f87171' },
];

export const focusSessionsData = [
  { name: 'Lun', sessions: 2, duration: 45 },
  { name: 'Mar', sessions: 3, duration: 75 },
  { name: 'Mer', sessions: 4, duration: 100 },
  { name: 'Jeu', sessions: 2, duration: 50 },
  { name: 'Ven', sessions: 5, duration: 125 },
  { name: 'Sam', sessions: 1, duration: 25 },
  { name: 'Dim', sessions: 0, duration: 0 },
];

export const taskCategoryData = [
  { name: 'Travail', value: 45, color: '#60a5fa' },
  { name: 'Personnel', value: 30, color: '#c084fc' },
  { name: 'Santé', value: 15, color: '#4ade80' },
  { name: 'Loisirs', value: 10, color: '#f97316' },
];

export const timeUsageData = [
  { name: 'Focus', value: 25, color: '#60a5fa' },
  { name: 'Tâches', value: 40, color: '#c084fc' },
  { name: 'Journal', value: 10, color: '#4ade80' },
  { name: 'Planification', value: 15, color: '#f97316' },
  { name: 'Autre', value: 10, color: '#a1a1aa' },
];

export const moodData = [
  { day: 'Lun', mood: 3 },
  { day: 'Mar', mood: 4 },
  { day: 'Mer', mood: 5 },
  { day: 'Jeu', mood: 2 },
  { day: 'Ven', mood: 4 },
  { day: 'Sam', mood: 5 },
  { day: 'Dim', mood: 4 },
];

export const defaultAIInsights = [
  {
    title: "Performance des habitudes",
    content: "Votre taux de réalisation de vos habitudes est de 72%, ce qui est excellent ! Vous êtes plus régulier les matins que les soirs."
  },
  {
    title: "Sessions de focus",
    content: "Votre productivité est maximale le vendredi, où vous avez réalisé 5 sessions de focus pour un total de 125 minutes. Essayez de reproduire ces conditions."
  },
  {
    title: "Gestion des tâches",
    content: "Vous avez tendance à compléter plus de tâches lorsque vous avez fait au moins 2 sessions de focus dans la journée."
  }
];
