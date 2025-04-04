
import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import AIAssistant from '@/components/analytics/AIAssistant';
import { useAuth } from '@/contexts/AuthContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { getAllTasks } from '@/services/taskService';
import { getAllHabits } from '@/services/habitService';
import { getUserFocusData, getFocusSessions } from '@/services/focusService';
import { Skeleton } from '@/components/ui/skeleton';

interface Task {
  id: string;
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high';
  status: 'todo' | 'in-progress' | 'done';
  due_date?: string;
  created_at: string;
  tags?: string[];
}

interface Habit {
  id: string;
  name: string;
  description?: string;
  frequency: string[];
  streak: number;
  total_completions: number;
  created_at: string;
  completed_today: boolean;
  last_completed?: string;
  color?: string;
  category?: string;
}

const AnalyticsPage = () => {
  const { currentUser } = useAuth();
  const isMobile = useIsMobile();
  
  const [weeklyTaskData, setWeeklyTaskData] = useState([]);
  const [habitCompletionData, setHabitCompletionData] = useState([]);
  const [statusData, setStatusData] = useState([]);
  const [focusTimeData, setFocusTimeData] = useState([]);
  const [priorityData, setPriorityData] = useState([]);
  const [insightMessage, setInsightMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [hasData, setHasData] = useState(false);
  
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];
  
  useEffect(() => {
    const loadData = async () => {
      if (!currentUser) {
        setLoading(false);
        return;
      }
      
      try {
        // Récupérer les tâches
        const tasks = await getAllTasks();
        
        // Récupérer les habitudes
        const habits = await getAllHabits();
        
        // Récupérer les données de focus
        const focusData = await getUserFocusData(currentUser.uid);
        
        setHasData(tasks.length > 0 || habits.length > 0 || (focusData && focusData.completedSessions > 0));
        
        if (tasks.length > 0) {
          processTaskData(tasks);
        }
        
        if (habits.length > 0) {
          processHabitData(habits);
        }
        
        if (focusData) {
          processFocusData(focusData);
        }
        
        // Générer un message d'insight basé sur les données
        generateInsightMessage(tasks, habits, focusData);
        
        setLoading(false);
      } catch (error) {
        console.error("Erreur lors du chargement des données d'analyse:", error);
        setLoading(false);
      }
    };
    
    loadData();
  }, [currentUser]);
  
  const processTaskData = (tasks: Task[]) => {
    // Données par statut
    const statusCounts = {
      'todo': 0,
      'in-progress': 0,
      'done': 0
    };
    
    // Données par priorité
    const priorityCounts = {
      'low': 0,
      'medium': 0,
      'high': 0
    };
    
    // Données par jour de la semaine
    const weekDays = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
    const weeklyData = weekDays.map(day => ({ name: day, tasks: 0 }));
    
    tasks.forEach(task => {
      // Compter par statut
      statusCounts[task.status]++;
      
      // Compter par priorité
      priorityCounts[task.priority]++;
      
      // Compter par jour de la semaine
      if (task.due_date) {
        const dueDate = new Date(task.due_date);
        const dayIndex = (dueDate.getDay() + 6) % 7; // Convertir 0=Dimanche à 0=Lundi
        weeklyData[dayIndex].tasks++;
      }
    });
    
    // Convertir les données de statut pour le graphique
    const statusDataForChart = [
      { name: 'À faire', value: statusCounts['todo'] },
      { name: 'En cours', value: statusCounts['in-progress'] },
      { name: 'Terminées', value: statusCounts['done'] }
    ];
    
    // Convertir les données de priorité pour le graphique
    const priorityDataForChart = [
      { name: 'Basse', value: priorityCounts['low'] },
      { name: 'Moyenne', value: priorityCounts['medium'] },
      { name: 'Haute', value: priorityCounts['high'] }
    ];
    
    setWeeklyTaskData(weeklyData);
    setStatusData(statusDataForChart);
    setPriorityData(priorityDataForChart);
  };
  
  const processHabitData = (habits: Habit[]) => {
    // Données de complétion des habitudes
    const completionData = [
      { name: 'Complétées', value: habits.filter(h => h.completed_today).length },
      { name: 'Non complétées', value: habits.filter(h => !h.completed_today).length }
    ];
    
    setHabitCompletionData(completionData);
  };
  
  const processFocusData = (focusData: any) => {
    // Données de temps de focus
    const focusTimeDataForChart = [
      { name: 'Sessions terminées', value: focusData.completedSessions },
      { name: 'Temps total (min)', value: focusData.totalTimeMinutes }
    ];
    
    setFocusTimeData(focusTimeDataForChart);
  };
  
  const generateInsightMessage = (tasks: Task[], habits: Habit[], focusData: any) => {
    if (tasks.length === 0 && habits.length === 0 && (!focusData || focusData.completedSessions === 0)) {
      setInsightMessage("Commencez à utiliser les fonctionnalités de l'application pour obtenir des insights personnalisés sur votre productivité.");
      return;
    }
    
    let message = "";
    
    // Insights basés sur les tâches
    if (tasks.length > 0) {
      const completedTasks = tasks.filter(t => t.status === 'done').length;
      const completionRate = (completedTasks / tasks.length) * 100;
      
      if (completionRate >= 70) {
        message += "Excellent travail ! Vous avez complété plus de 70% de vos tâches. ";
      } else if (completionRate >= 30) {
        message += "Vous progressez bien avec vos tâches. Continuez sur cette lancée ! ";
      } else {
        message += "Vous avez quelques tâches en attente. Essayez de prioriser pour augmenter votre productivité. ";
      }
      
      const highPriorityTasks = tasks.filter(t => t.priority === 'high' && t.status !== 'done').length;
      if (highPriorityTasks > 0) {
        message += `Il vous reste ${highPriorityTasks} tâche(s) à haute priorité à compléter. `;
      }
    }
    
    // Insights basés sur les habitudes
    if (habits.length > 0) {
      const completedHabits = habits.filter(h => h.completed_today).length;
      const habitCompletionRate = (completedHabits / habits.length) * 100;
      
      if (habitCompletionRate >= 80) {
        message += "Vos habitudes sont bien maintenues, excellent travail ! ";
      } else if (habitCompletionRate >= 40) {
        message += "Vous êtes sur la bonne voie avec vos habitudes. ";
      } else {
        message += "N'oubliez pas de maintenir vos habitudes régulièrement pour progresser. ";
      }
      
      const highStreak = Math.max(...habits.map(h => h.streak));
      if (highStreak >= 7) {
        message += `Votre plus longue série est de ${highStreak} jours, continuez ! `;
      }
    }
    
    // Insights basés sur focus
    if (focusData && focusData.completedSessions > 0) {
      message += `Vous avez complété ${focusData.completedSessions} session(s) de focus, pour un total de ${focusData.totalTimeMinutes} minutes. `;
      
      if (focusData.totalTimeMinutes > 120) {
        message += "Excellent travail en matière de concentration ! ";
      } else if (focusData.totalTimeMinutes > 60) {
        message += "Bonne utilisation du mode focus. ";
      } else {
        message += "Essayez d'augmenter vos sessions de focus pour améliorer votre productivité. ";
      }
    }
    
    setInsightMessage(message || "Utilisez davantage les fonctionnalités pour obtenir des insights personnalisés.");
  };

  const renderNoDataMessage = () => (
    <div className="flex flex-col items-center justify-center h-[300px] text-center">
      <p className="text-lg text-muted-foreground mb-2">Aucune donnée disponible</p>
      <p className="text-sm text-muted-foreground">
        Commencez à utiliser les fonctionnalités de l'application pour générer des analyses.
      </p>
    </div>
  );
  
  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Analytiques</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Visualisez vos données et améliorez votre productivité
          </p>
        </div>

        <AIAssistant message={insightMessage} />

        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-[300px] w-full rounded-md" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Skeleton className="h-[250px] rounded-md" />
              <Skeleton className="h-[250px] rounded-md" />
            </div>
          </div>
        ) : (
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList className="grid grid-cols-3 md:grid-cols-4 lg:w-[400px]">
              <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
              <TabsTrigger value="tasks">Tâches</TabsTrigger>
              <TabsTrigger value="habits">Habitudes</TabsTrigger>
              <TabsTrigger value="focus">Focus</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Tâches par jour</CardTitle>
                    <CardDescription>
                      Répartition de vos tâches sur la semaine
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="h-[300px]">
                    {hasData && weeklyTaskData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={weeklyTaskData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="tasks" fill="#8884d8" />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : renderNoDataMessage()}
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Statut des tâches</CardTitle>
                    <CardDescription>
                      Répartition de vos tâches par statut
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="h-[300px]">
                    {hasData && statusData.length > 0 && statusData.some(item => item.value > 0) ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={statusData}
                            cx={isMobile ? "50%" : "50%"}
                            cy={isMobile ? "40%" : "50%"}
                            outerRadius={isMobile ? 80 : 100}
                            fill="#8884d8"
                            dataKey="value"
                            nameKey="name"
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          >
                            {statusData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Legend layout={isMobile ? "horizontal" : "vertical"} verticalAlign={isMobile ? "bottom" : "middle"} align={isMobile ? "center" : "right"} />
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : renderNoDataMessage()}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="tasks" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Priorité des tâches</CardTitle>
                    <CardDescription>
                      Répartition de vos tâches par niveau de priorité
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="h-[300px]">
                    {hasData && priorityData.length > 0 && priorityData.some(item => item.value > 0) ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={priorityData}
                            cx={isMobile ? "50%" : "50%"}
                            cy={isMobile ? "40%" : "50%"}
                            outerRadius={isMobile ? 80 : 100}
                            fill="#8884d8"
                            dataKey="value"
                            nameKey="name"
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          >
                            {priorityData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Legend layout={isMobile ? "horizontal" : "vertical"} verticalAlign={isMobile ? "bottom" : "middle"} align={isMobile ? "center" : "right"} />
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : renderNoDataMessage()}
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Progression des tâches</CardTitle>
                    <CardDescription>
                      Taux de complétion de vos tâches
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="h-[300px]">
                    {hasData && statusData.length > 0 && statusData.some(item => item.value > 0) ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={statusData}
                          layout="vertical"
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis type="number" />
                          <YAxis dataKey="name" type="category" />
                          <Tooltip />
                          <Bar dataKey="value" fill="#82ca9d" />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : renderNoDataMessage()}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="habits" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Complétion des habitudes</CardTitle>
                  <CardDescription>
                    Pourcentage d'habitudes complétées aujourd'hui
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                  {hasData && habitCompletionData.length > 0 && habitCompletionData.some(item => item.value > 0) ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={habitCompletionData}
                          cx={isMobile ? "50%" : "50%"}
                          cy="50%"
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                          nameKey="name"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {habitCompletionData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Legend />
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : renderNoDataMessage()}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="focus" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Temps de concentration</CardTitle>
                  <CardDescription>
                    Statistiques de vos sessions de focus
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                  {hasData && focusTimeData.length > 0 && focusTimeData.some(item => item.value > 0) ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={focusTimeData}
                        layout={isMobile ? "vertical" : "horizontal"}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        {isMobile ? (
                          <>
                            <XAxis type="number" />
                            <YAxis dataKey="name" type="category" width={150} />
                          </>
                        ) : (
                          <>
                            <XAxis dataKey="name" />
                            <YAxis />
                          </>
                        )}
                        <Tooltip />
                        <Bar dataKey="value" fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : renderNoDataMessage()}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </MainLayout>
  );
};

export default AnalyticsPage;
