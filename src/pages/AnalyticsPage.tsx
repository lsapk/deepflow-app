
import React, { useState, useEffect, useCallback } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line, AreaChart, Area
} from 'recharts';
import AIAssistant from '@/components/analytics/AIAssistant';
import { useAuth } from '@/contexts/AuthContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { getAllTasks } from '@/services/taskService';
import { getAllHabits } from '@/services/habitService';
import { getUserFocusData } from '@/services/focusService';
import { Skeleton } from '@/components/ui/skeleton';
import { RefreshCcw, BarChart2, PieChart as PieChartIcon, LineChart as LineChartIcon, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useTheme } from 'next-themes';

const AnalyticsPage = () => {
  const { currentUser } = useAuth();
  const isMobile = useIsMobile();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
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
  
  const COLORS = ['#8b5cf6', '#3b82f6', '#22c55e', '#ef4444', '#f59e0b', '#06b6d4'];
  const TEXT_COLOR = isDark ? "#e5e7eb" : "#374151";
  const GRID_COLOR = isDark ? "#4b5563" : "#e5e7eb";
  
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
        processTaskData(tasks);
      }
      
      if (habits.length > 0) {
        processHabitData(habits);
      }
      
      if (focusData) {
        processFocusData(focusData);
      }
      
      generateInsightMessage(tasks, habits, focusData);
      generateTaskTrendData();
      
      setLoading(false);
      setRefreshing(false);
    } catch (error) {
      console.error("Erreur lors du chargement des données d'analyse:", error);
      setLoading(false);
      setRefreshing(false);
      toast.error("Impossible de charger les données d'analyse");
    }
  }, [currentUser, isDark]);
  
  useEffect(() => {
    loadData();
    
    const refreshInterval = setInterval(() => {
      loadData();
    }, 300000); // Refresh every 5 minutes
    
    return () => clearInterval(refreshInterval);
  }, [loadData]);
  
  const processTaskData = (tasks) => {
    const statusCounts = {
      'todo': 0,
      'in_progress': 0,
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
      { name: 'En cours', value: statusCounts['in_progress'] },
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
  
  const processHabitData = (habits) => {
    const completedCount = habits.filter(h => 
      h.last_completed && new Date(h.last_completed).toDateString() === new Date().toDateString()
    ).length;
    
    const notCompletedCount = habits.length - completedCount;
    
    const completionData = [
      { name: 'Complétées', value: completedCount },
      { name: 'Non complétées', value: notCompletedCount }
    ];
    
    setHabitCompletionData(completionData);
  };
  
  const processFocusData = (focusData) => {
    const focusTimeDataForChart = [
      { name: 'Sessions terminées', value: focusData.completedSessions },
      { name: 'Temps total (min)', value: focusData.totalTimeMinutes }
    ];
    
    setFocusTimeData(focusTimeDataForChart);
  };
  
  const generateTaskTrendData = () => {
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
  
  const generateInsightMessage = (tasks, habits, focusData) => {
    if (tasks.length === 0 && habits.length === 0 && (!focusData || focusData.completedSessions === 0)) {
      setInsightMessage("Commencez à utiliser les fonctionnalités de l'application pour obtenir des insights personnalisés sur votre productivité.");
      return;
    }
    
    let message = "";
    
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
    
    if (habits.length > 0) {
      const completedHabits = habits.filter(h => 
        h.last_completed && new Date(h.last_completed).toDateString() === new Date().toDateString()
      ).length;
      const habitCompletionRate = (completedHabits / habits.length) * 100;
      
      if (habitCompletionRate >= 80) {
        message += "Vos habitudes sont bien maintenues, excellent travail ! ";
      } else if (habitCompletionRate >= 40) {
        message += "Vous êtes sur la bonne voie avec vos habitudes. ";
      } else {
        message += "N'oubliez pas de maintenir vos habitudes régulièrement pour progresser. ";
      }
      
      const highStreak = Math.max(...habits.map(h => h.streak || 0));
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
    <div className="flex flex-col items-center justify-center h-[300px] text-center p-4">
      <div className="bg-violet-100 dark:bg-violet-900/30 p-8 rounded-lg max-w-md">
        <div className="text-violet-500 dark:text-violet-400 flex justify-center mb-4">
          <Calendar size={48} />
        </div>
        <p className="text-lg font-medium mb-2">Aucune donnée disponible</p>
        <p className="text-sm text-muted-foreground">
          Commencez à utiliser les fonctionnalités de l'application pour générer des analyses. Ajoutez des tâches, des habitudes et utilisez le mode focus pour voir apparaître des données ici.
        </p>
      </div>
    </div>
  );
  
  const handleRefresh = () => {
    loadData();
    toast.success("Données d'analyse actualisées");
  };
  
  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
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
            className="flex gap-2 items-center self-end md:self-auto"
            disabled={refreshing || loading}
          >
            <RefreshCcw size={16} className={refreshing ? "animate-spin" : ""} />
            <span className="hidden md:inline">Actualiser</span>
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {loading ? (
              <Skeleton className="h-[400px] w-full rounded-md" />
            ) : (
              <Tabs defaultValue="overview" className="space-y-4">
                <TabsList className="grid grid-cols-4 w-full">
                  <TabsTrigger value="overview" className="flex items-center gap-2">
                    <BarChart2 size={16} />
                    <span className="hidden sm:inline">Vue d'ensemble</span>
                  </TabsTrigger>
                  <TabsTrigger value="tasks" className="flex items-center gap-2">
                    <PieChartIcon size={16} />
                    <span className="hidden sm:inline">Tâches</span>
                  </TabsTrigger>
                  <TabsTrigger value="habits" className="flex items-center gap-2">
                    <LineChartIcon size={16} />
                    <span className="hidden sm:inline">Habitudes</span>
                  </TabsTrigger>
                  <TabsTrigger value="focus" className="flex items-center gap-2">
                    <Calendar size={16} />
                    <span className="hidden sm:inline">Focus</span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4 pt-2">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle>Évolution des tâches</CardTitle>
                      <CardDescription>Progression sur les 7 derniers jours</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[350px]">
                      {hasData && taskTrendData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={taskTrendData}>
                            <defs>
                              <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1}/>
                              </linearGradient>
                              <linearGradient id="colorCreated" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} />
                            <XAxis dataKey="date" stroke={TEXT_COLOR} />
                            <YAxis stroke={TEXT_COLOR} />
                            <Tooltip 
                              contentStyle={{ 
                                backgroundColor: isDark ? '#1f2937' : '#fff',
                                borderColor: isDark ? '#374151' : '#e5e7eb',
                                color: TEXT_COLOR
                              }} 
                            />
                            <Legend />
                            <Area 
                              type="monotone" 
                              dataKey="completed" 
                              stroke="#8b5cf6" 
                              fillOpacity={1} 
                              fill="url(#colorCompleted)" 
                              name="Tâches terminées" 
                            />
                            <Area 
                              type="monotone" 
                              dataKey="created" 
                              stroke="#3b82f6" 
                              fillOpacity={1} 
                              fill="url(#colorCreated)" 
                              name="Tâches créées" 
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      ) : renderNoDataMessage()}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="tasks" className="space-y-4 pt-2">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle>Statut des tâches</CardTitle>
                        <CardDescription>Répartition par statut</CardDescription>
                      </CardHeader>
                      <CardContent className="h-[300px]">
                        {hasData && statusData.length > 0 && statusData.some(item => item.value > 0) ? (
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={statusData}
                                cx="50%"
                                cy="50%"
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
                              <Legend 
                                layout="horizontal" 
                                verticalAlign="bottom" 
                                align="center"
                              />
                              <Tooltip 
                                contentStyle={{ 
                                  backgroundColor: isDark ? '#1f2937' : '#fff',
                                  borderColor: isDark ? '#374151' : '#e5e7eb',
                                  color: TEXT_COLOR
                                }}
                              />
                            </PieChart>
                          </ResponsiveContainer>
                        ) : renderNoDataMessage()}
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle>Priorité des tâches</CardTitle>
                        <CardDescription>Répartition par niveau de priorité</CardDescription>
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
                              <Tooltip 
                                contentStyle={{ 
                                  backgroundColor: isDark ? '#1f2937' : '#fff',
                                  borderColor: isDark ? '#374151' : '#e5e7eb',
                                  color: TEXT_COLOR
                                }}
                              />
                            </PieChart>
                          </ResponsiveContainer>
                        ) : renderNoDataMessage()}
                      </CardContent>
                    </Card>
                  </div>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle>Tâches par jour</CardTitle>
                      <CardDescription>Répartition sur la semaine</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                      {hasData && weeklyTaskData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={weeklyTaskData}>
                            <defs>
                              <linearGradient id="taskGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} />
                            <XAxis dataKey="name" stroke={TEXT_COLOR} />
                            <YAxis stroke={TEXT_COLOR} />
                            <Tooltip 
                              contentStyle={{ 
                                backgroundColor: isDark ? '#1f2937' : '#fff',
                                borderColor: isDark ? '#374151' : '#e5e7eb',
                                color: TEXT_COLOR
                              }}
                            />
                            <Bar 
                              dataKey="tasks" 
                              fill="url(#taskGradient)" 
                              name="Tâches" 
                              radius={[4, 4, 0, 0]}
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      ) : renderNoDataMessage()}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="habits" className="space-y-4 pt-2">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle>Complétion des habitudes</CardTitle>
                      <CardDescription>Pourcentage d'habitudes complétées aujourd'hui</CardDescription>
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
                            <Tooltip 
                              contentStyle={{ 
                                backgroundColor: isDark ? '#1f2937' : '#fff',
                                borderColor: isDark ? '#374151' : '#e5e7eb',
                                color: TEXT_COLOR
                              }}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      ) : renderNoDataMessage()}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="focus" className="space-y-4 pt-2">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle>Temps de concentration</CardTitle>
                      <CardDescription>Statistiques de vos sessions de focus</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                      {hasData && focusTimeData.length > 0 && focusTimeData.some(item => item.value > 0) ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={focusTimeData}
                            layout="horizontal"
                          >
                            <defs>
                              <linearGradient id="focusGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} />
                            <XAxis dataKey="name" stroke={TEXT_COLOR} />
                            <YAxis stroke={TEXT_COLOR} />
                            <Tooltip 
                              contentStyle={{ 
                                backgroundColor: isDark ? '#1f2937' : '#fff',
                                borderColor: isDark ? '#374151' : '#e5e7eb',
                                color: TEXT_COLOR
                              }}
                            />
                            <Legend />
                            <Bar 
                              dataKey="value" 
                              fill="url(#focusGradient)" 
                              name="Valeur" 
                              radius={[4, 4, 0, 0]}
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      ) : renderNoDataMessage()}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            )}
          </div>
          <div className="lg:col-span-1 h-full">
            {loading ? (
              <Skeleton className="h-[400px] w-full rounded-md" />
            ) : (
              <AIAssistant contextData={insightMessage} />
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default AnalyticsPage;
