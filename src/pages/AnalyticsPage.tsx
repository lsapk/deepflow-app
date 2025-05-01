
import React, { useState, useEffect, useCallback } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, LineChart, Line } from 'recharts';
import AIAssistant from '@/components/analytics/AIAssistant';
import { useAuth } from '@/contexts/AuthContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { getAllTasks, Task } from '@/services/taskService';
import { getAllHabits, Habit } from '@/services/habitService';
import { getUserFocusData, getFocusSessions } from '@/services/focusService';
import { Skeleton } from '@/components/ui/skeleton';
import { RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

// Define internal types for the analytics page
interface AnalyticsTask {
  id: string;
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high';
  status: 'todo' | 'in-progress' | 'done';
  due_date?: string;
  created_at: string;
  tags?: string[];
}

interface AnalyticsHabit {
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
  const [taskTrendData, setTaskTrendData] = useState([]);
  const [insightMessage, setInsightMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [hasData, setHasData] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];
  
  const loadData = useCallback(async () => {
    if (!currentUser) {
      setLoading(false);
      return;
    }
    
    try {
      setRefreshing(true);
      
      const tasks = await getAllTasks();
      
      const habits = await getAllHabits();
      
      const focusData = await getUserFocusData(currentUser.uid);
      
      setHasData(tasks.length > 0 || habits.length > 0 || (focusData && focusData.completedSessions > 0));
      
      if (tasks.length > 0) {
        // Map service Task to AnalyticsTask, converting 'in_progress' to 'in-progress'
        const analyticsTasks: AnalyticsTask[] = tasks.map(task => ({
          id: task.id,
          title: task.title,
          description: task.description,
          priority: task.priority,
          status: task.status === 'in_progress' ? 'in-progress' : task.status as any,
          due_date: task.due_date,
          created_at: task.created_at,
        }));
        processTaskData(analyticsTasks);
      }
      
      if (habits.length > 0) {
        // Map service Habit to AnalyticsHabit with the additional properties needed
        const analyticsHabits: AnalyticsHabit[] = habits.map(habit => ({
          id: habit.id,
          name: habit.title,
          description: habit.description,
          frequency: [habit.frequency],
          streak: habit.streak,
          total_completions: habit.streak || 0,
          created_at: habit.created_at || '',
          completed_today: habit.last_completed ? new Date(habit.last_completed).toDateString() === new Date().toDateString() : false,
          last_completed: habit.last_completed,
          category: habit.category
        }));
        processHabitData(analyticsHabits);
      }
      
      if (focusData) {
        processFocusData(focusData);
      }
      
      generateInsightMessage(tasks, habits, focusData);
      
      // Generate task trend data (simulation for now)
      generateTaskTrendData();
      
      setLoading(false);
      setRefreshing(false);
    } catch (error) {
      console.error("Erreur lors du chargement des données d'analyse:", error);
      setLoading(false);
      setRefreshing(false);
      toast.error("Impossible de charger les données d'analyse");
    }
  }, [currentUser]);
  
  useEffect(() => {
    loadData();
    
    // Set up a refresh interval for real-time updates
    const refreshInterval = setInterval(() => {
      loadData();
    }, 60000); // Refresh every minute
    
    return () => clearInterval(refreshInterval);
  }, [loadData]);
  
  const processTaskData = (tasks: AnalyticsTask[]) => {
    const statusCounts = {
      'todo': 0,
      'in-progress': 0,
      'done': 0
    };
    
    const priorityCounts = {
      'low': 0,
      'medium': 0,
      'high': 0
    };
    
    const weekDays = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
    const weeklyData = weekDays.map(day => ({ name: day, tasks: 0 }));
    
    tasks.forEach(task => {
      statusCounts[task.status]++;
      
      priorityCounts[task.priority]++;
      
      if (task.due_date) {
        const dueDate = new Date(task.due_date);
        const dayIndex = (dueDate.getDay() + 6) % 7;
        weeklyData[dayIndex].tasks++;
      }
    });
    
    const statusDataForChart = [
      { name: 'À faire', value: statusCounts['todo'] },
      { name: 'En cours', value: statusCounts['in-progress'] },
      { name: 'Terminées', value: statusCounts['done'] }
    ];
    
    const priorityDataForChart = [
      { name: 'Basse', value: priorityCounts['low'] },
      { name: 'Moyenne', value: priorityCounts['medium'] },
      { name: 'Haute', value: priorityCounts['high'] }
    ];
    
    setWeeklyTaskData(weeklyData);
    setStatusData(statusDataForChart);
    setPriorityData(priorityDataForChart);
  };
  
  const processHabitData = (habits: AnalyticsHabit[]) => {
    const completionData = [
      { name: 'Complétées', value: habits.filter(h => h.completed_today).length },
      { name: 'Non complétées', value: habits.filter(h => !h.completed_today).length }
    ];
    
    setHabitCompletionData(completionData);
  };
  
  const processFocusData = (focusData: any) => {
    const focusTimeDataForChart = [
      { name: 'Sessions terminées', value: focusData.completedSessions },
      { name: 'Temps total (min)', value: focusData.totalTimeMinutes }
    ];
    
    setFocusTimeData(focusTimeDataForChart);
  };
  
  const generateTaskTrendData = () => {
    // This would ideally come from a real data source
    // For now, we'll simulate trend data for the last 7 days
    const trend = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      trend.push({
        date: date.toLocaleDateString('fr-FR', { weekday: 'short' }),
        completed: Math.floor(Math.random() * 5) + 1,
        created: Math.floor(Math.random() * 7) + 1
      });
    }
    
    setTaskTrendData(trend);
  };
  
  const generateInsightMessage = (tasks: Task[], habits: Habit[], focusData: any) => {
    // Convert the Task[] to match expected internal types first
    const analyzedTasks = tasks.map(task => ({
      ...task,
      status: task.status === 'in_progress' ? 'in-progress' : task.status
    } as unknown as AnalyticsTask));
    
    // Convert Habits to match expected internal types
    const analyzedHabits = habits.map(habit => ({
      ...habit,
      name: habit.title,
      total_completions: habit.streak || 0,
      completed_today: habit.last_completed ? new Date(habit.last_completed).toDateString() === new Date().toDateString() : false,
    } as unknown as AnalyticsHabit));
    
    if (analyzedTasks.length === 0 && analyzedHabits.length === 0 && (!focusData || focusData.completedSessions === 0)) {
      setInsightMessage("Commencez à utiliser les fonctionnalités de l'application pour obtenir des insights personnalisés sur votre productivité.");
      return;
    }
    
    let message = "";
    
    if (analyzedTasks.length > 0) {
      const completedTasks = analyzedTasks.filter(t => t.status === 'done').length;
      const completionRate = (completedTasks / analyzedTasks.length) * 100;
      
      if (completionRate >= 70) {
        message += "Excellent travail ! Vous avez complété plus de 70% de vos tâches. ";
      } else if (completionRate >= 30) {
        message += "Vous progressez bien avec vos tâches. Continuez sur cette lancée ! ";
      } else {
        message += "Vous avez quelques tâches en attente. Essayez de prioriser pour augmenter votre productivité. ";
      }
      
      const highPriorityTasks = analyzedTasks.filter(t => t.priority === 'high' && t.status !== 'done').length;
      if (highPriorityTasks > 0) {
        message += `Il vous reste ${highPriorityTasks} tâche(s) à haute priorité à compléter. `;
      }
    }
    
    if (analyzedHabits.length > 0) {
      const completedHabits = analyzedHabits.filter(h => h.completed_today).length;
      const habitCompletionRate = (completedHabits / analyzedHabits.length) * 100;
      
      if (habitCompletionRate >= 80) {
        message += "Vos habitudes sont bien maintenues, excellent travail ! ";
      } else if (habitCompletionRate >= 40) {
        message += "Vous êtes sur la bonne voie avec vos habitudes. ";
      } else {
        message += "N'oubliez pas de maintenir vos habitudes régulièrement pour progresser. ";
      }
      
      const highStreak = Math.max(...analyzedHabits.map(h => h.streak));
      if (highStreak >= 7) {
        message += `Votre plus longue série est de ${highStreak} jours, continuez ! `;
      }
    }
    
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
  
  const handleRefresh = () => {
    loadData();
    toast.success("Données d'analyse actualisées");
  };
  
  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold mb-2">Analytiques</h1>
            <p className="text-gray-500 dark:text-gray-400">
              Visualisez vos données et améliorez votre productivité
            </p>
          </div>
          <Button
            onClick={handleRefresh}
            variant="outline"
            size="sm"
            className="flex gap-2 items-center"
            disabled={refreshing || loading}
          >
            <RefreshCcw size={16} className={refreshing ? "animate-spin" : ""} />
            <span className="hidden md:inline">Actualiser</span>
          </Button>
        </div>

        <div>
          <AIAssistant message={insightMessage} />
        </div>

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
            <TabsList className="grid grid-cols-4 lg:w-[500px] w-full">
              <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
              <TabsTrigger value="tasks">Tâches</TabsTrigger>
              <TabsTrigger value="habits">Habitudes</TabsTrigger>
              <TabsTrigger value="focus">Focus</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <div>
                      <CardTitle>Évolution des tâches</CardTitle>
                      <CardDescription>
                        Progression sur les 7 derniers jours
                      </CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent className="h-[300px]">
                    {hasData && taskTrendData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={taskTrendData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Line type="monotone" dataKey="completed" stroke="#8884d8" name="Tâches terminées" />
                          <Line type="monotone" dataKey="created" stroke="#82ca9d" name="Tâches créées" />
                        </LineChart>
                      </ResponsiveContainer>
                    ) : renderNoDataMessage()}
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle>Statut des tâches</CardTitle>
                    <CardDescription>
                      Répartition par statut
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
                          <Legend layout={isMobile ? "horizontal" : "vertical"} verticalAlign="bottom" align="center" />
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
                  <CardHeader className="pb-2">
                    <CardTitle>Priorité des tâches</CardTitle>
                    <CardDescription>
                      Répartition par niveau de priorité
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="h-[300px]">
                    {hasData && priorityData.length > 0 && priorityData.some(item => item.value > 0) ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={priorityData}
                            cx="50%"
                            cy="50%"
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
                          <Legend layout="horizontal" verticalAlign="bottom" align="center" />
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : renderNoDataMessage()}
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle>Tâches par jour</CardTitle>
                    <CardDescription>
                      Répartition sur la semaine
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
                          <Bar dataKey="tasks" fill="#8884d8" name="Tâches" />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : renderNoDataMessage()}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="habits" className="space-y-4">
              <Card>
                <CardHeader className="pb-2">
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
                          cx="50%"
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
                        <Legend layout="horizontal" verticalAlign="bottom" align="center" />
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : renderNoDataMessage()}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="focus" className="space-y-4">
              <Card>
                <CardHeader className="pb-2">
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
                        layout="horizontal"
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="value" fill="#8884d8" name="Valeur" />
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
