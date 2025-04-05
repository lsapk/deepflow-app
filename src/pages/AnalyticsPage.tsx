
import React, { useState, useEffect, useCallback } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend, LineChart, Line, AreaChart, Area 
} from 'recharts';
import { Button } from '@/components/ui/button';
import { 
  RefreshCcw, BarChart3, PieChart as PieChartIcon, LineChart as LineChartIcon, 
  Calendar, CheckCircle2, Clock, BrainCircuit, HelpCircle, Lightbulb,
  ArrowUpRight, ArrowDownRight, Infinity, Target, List, FilterX,
  Layers, SlidersHorizontal
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { toast } from 'sonner';
import { format, startOfWeek, eachDayOfInterval, addDays, isToday, isYesterday } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useIndexedDB } from '@/hooks/use-indexed-db';
import { AIInsightCard } from '@/components/analytics/AIInsightCard';
import AIAssistant from '@/components/analytics/AIAssistant';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { motion } from 'framer-motion';

// Type definitions
interface AnalyticsProps {}
interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  loading?: boolean;
}

// Stats card component
const StatsCard: React.FC<StatsCardProps> = ({ 
  title, 
  value, 
  description, 
  icon, 
  trend,
  trendValue,
  loading = false
}) => {
  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <Skeleton className="h-8 w-32 mb-4" />
          <Skeleton className="h-12 w-full mb-3" />
          <Skeleton className="h-4 w-24" />
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</h3>
          <div className="text-primary bg-primary/10 p-2 rounded-full">
            {icon}
          </div>
        </div>
        <div className="space-y-2">
          <p className="text-2xl font-bold">{value}</p>
          {(trend || description) && (
            <div className="flex items-center space-x-2">
              {trend && (
                <span className={`flex items-center text-xs ${
                  trend === 'up' ? 'text-green-600 dark:text-green-500' : 
                  trend === 'down' ? 'text-red-600 dark:text-red-500' : 
                  'text-gray-500 dark:text-gray-400'
                }`}>
                  {trend === 'up' ? <ArrowUpRight className="w-3 h-3 mr-1" /> : 
                   trend === 'down' ? <ArrowDownRight className="w-3 h-3 mr-1" /> : 
                   <Infinity className="w-3 h-3 mr-1" />}
                  {trendValue}
                </span>
              )}
              {description && (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {description}
                </p>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const AnalyticsPage: React.FC<AnalyticsProps> = () => {
  const { currentUser } = useAuth();
  const isMobile = useIsMobile();
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [insightMessage, setInsightMessage] = useState("");
  const [chartTab, setChartTab] = useState("weekly");
  
  // Data states
  const [taskCompletionData, setTaskCompletionData] = useState<any[]>([]);
  const [habitConsistencyData, setHabitConsistencyData] = useState<any[]>([]);
  const [productivityData, setProductivityData] = useState<any[]>([]);
  const [focusDistributionData, setFocusDistributionData] = useState<any[]>([]);
  const [tasksByPriorityData, setTasksByPriorityData] = useState<any[]>([]);
  const [weeklyTaskData, setWeeklyTaskData] = useState<any[]>([]);
  const [taskStatsByCategory, setTaskStatsByCategory] = useState<any[]>([]);
  
  // Stats values
  const [completionRate, setCompletionRate] = useState(0);
  const [habitStreak, setHabitStreak] = useState(0);
  const [totalFocusTime, setTotalFocusTime] = useState(0);
  const [pendingTasks, setPendingTasks] = useState(0);
  
  // Get data from IndexedDB
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
  
  // Colors for charts
  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
  
  // Load and process data
  const loadData = useCallback(async () => {
    if (!currentUser) {
      setLoading(false);
      return;
    }
    
    try {
      setRefreshing(true);
      
      // Process tasks data
      if (tasksData && tasksData.length > 0) {
        processTasksData(tasksData);
      }
      
      // Process habits data
      if (habitsData && habitsData.length > 0) {
        processHabitsData(habitsData);
      }
      
      // Process focus sessions data
      if (focusData && focusData.length > 0) {
        processFocusData(focusData);
      }
      
      // Generate productivity data (for demonstration)
      generateProductivityData();
      
      // Generate message for AI assistant
      generateInsightMessage(tasksData, habitsData, journalData, focusData);
      
      setLoading(false);
      setRefreshing(false);
    } catch (error) {
      console.error("Erreur lors du chargement des données d'analyse:", error);
      setLoading(false);
      setRefreshing(false);
      toast.error("Impossible de charger les données d'analyse");
    }
  }, [currentUser, tasksData, habitsData, journalData, focusData]);
  
  useEffect(() => {
    loadData();
  }, [loadData]);
  
  // Process tasks data
  const processTasksData = (tasks: any[]) => {
    // Completed vs pending tasks
    const completedTasks = tasks.filter(t => t.status === 'done');
    const incompleteTasks = tasks.filter(t => t.status !== 'done');
    
    const taskCompletionRate = Math.round((completedTasks.length / tasks.length) * 100);
    setCompletionRate(taskCompletionRate);
    setPendingTasks(incompleteTasks.length);
    
    // Task completion by day of week
    const today = new Date();
    const startOfCurrentWeek = startOfWeek(today, { weekStartsOn: 1 });
    
    const weekDays = eachDayOfInterval({
      start: startOfCurrentWeek,
      end: addDays(startOfCurrentWeek, 6)
    });
    
    const weeklyData = weekDays.map(day => {
      const dayName = format(day, 'EEE', { locale: fr });
      const dayTasks = tasks.filter(task => {
        if (!task.due_date) return false;
        const taskDate = new Date(task.due_date);
        return taskDate.toDateString() === day.toDateString();
      });
      
      const completed = dayTasks.filter(t => t.status === 'done').length;
      const pending = dayTasks.filter(t => t.status !== 'done').length;
      
      return {
        name: dayName,
        completed,
        pending,
        total: completed + pending,
        isToday: isToday(day),
      };
    });
    
    setWeeklyTaskData(weeklyData);
    
    // Tasks by priority
    const priorityCounts = {
      high: tasks.filter(t => t.priority === 'high').length,
      medium: tasks.filter(t => t.priority === 'medium').length,
      low: tasks.filter(t => t.priority === 'low').length
    };
    
    const tasksByPriority = [
      { name: 'Haute', value: priorityCounts.high },
      { name: 'Moyenne', value: priorityCounts.medium },
      { name: 'Basse', value: priorityCounts.low }
    ];
    
    setTasksByPriorityData(tasksByPriority.filter(item => item.value > 0));
    
    // Task completion data (for line chart)
    const taskCompletionTrend = [
      { name: 'Lun', completion: 65 },
      { name: 'Mar', completion: 75 },
      { name: 'Mer', completion: 68 },
      { name: 'Jeu', completion: 82 },
      { name: 'Ven', completion: taskCompletionRate },
      { name: 'Sam', completion: 0 },
      { name: 'Dim', completion: 0 }
    ];
    
    setTaskCompletionData(taskCompletionTrend);
    
    // Tasks by category
    const taskCategories = [
      { name: 'Travail', value: Math.floor(tasks.length * 0.4) },
      { name: 'Personnel', value: Math.floor(tasks.length * 0.3) },
      { name: 'Projet', value: Math.floor(tasks.length * 0.2) },
      { name: 'Santé', value: Math.floor(tasks.length * 0.1) },
    ];
    
    setTaskStatsByCategory(taskCategories.filter(item => item.value > 0));
  };
  
  // Process habits data
  const processHabitsData = (habits: any[]) => {
    // Find best streak
    const bestStreak = habits.length > 0 
      ? Math.max(...habits.map(h => h.streak || 0))
      : 0;
    
    setHabitStreak(bestStreak);
    
    // Habit consistency data
    const habitWithStreaks = habits.map(habit => ({
      name: habit.title.length > 15 ? habit.title.substring(0, 15) + '...' : habit.title,
      streak: habit.streak || 0,
      target: habit.target_days?.length || 7,
      progress: habit.streak > 0 ? Math.min(Math.round((habit.streak / (habit.target_days?.length || 7)) * 100), 100) : 0
    }));
    
    // Sort by streak descending
    habitWithStreaks.sort((a, b) => b.streak - a.streak);
    
    setHabitConsistencyData(habitWithStreaks);
  };
  
  // Process focus data
  const processFocusData = (focusSessions: any[]) => {
    // Calculate total focus time
    const totalMinutes = focusSessions.reduce((acc, session) => 
      acc + (session.duration || 0), 0);
    
    setTotalFocusTime(totalMinutes);
    
    // Focus time distribution by time of day
    const focusDistribution = [
      { name: 'Matin', value: Math.round(totalMinutes * 0.4) },
      { name: 'Après-midi', value: Math.round(totalMinutes * 0.35) },
      { name: 'Soir', value: Math.round(totalMinutes * 0.25) }
    ];
    
    setFocusDistributionData(focusDistribution);
  };
  
  // Generate productivity data (simulation)
  const generateProductivityData = () => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      
      return {
        name: isToday(date) ? "Aujourd'hui" : 
              isYesterday(date) ? "Hier" : 
              format(date, 'EEE', { locale: fr }),
        productivité: Math.floor(Math.random() * 30) + 60,
        moyenne: 70
      };
    });
    
    setProductivityData(last7Days);
  };
  
  // Generate insight message for AI assistant
  const generateInsightMessage = (tasks: any[], habits: any[], journal: any[], focus: any[]) => {
    let message = "Je suis ici pour vous aider à analyser vos données de productivité. ";
    
    if (tasks.length === 0 && habits.length === 0) {
      message += "Commencez à utiliser les fonctionnalités de l'application pour obtenir des analyses personnalisées.";
      setInsightMessage(message);
      return;
    }
    
    if (tasks.length > 0) {
      const completedTasks = tasks.filter(t => t.status === 'done').length;
      const pendingTasks = tasks.length - completedTasks;
      const completionRate = Math.round((completedTasks / tasks.length) * 100);
      
      message += `Vous avez ${completedTasks} tâches terminées et ${pendingTasks} en attente. `;
      
      if (completionRate >= 70) {
        message += "Votre taux de complétion est excellent ! ";
      } else if (completionRate >= 50) {
        message += "Votre taux de complétion est bon. ";
      } else {
        message += "Vous pourriez améliorer votre taux de complétion. ";
      }
    }
    
    if (habits.length > 0) {
      const streakHabits = habits.filter(h => h.streak > 3).length;
      message += `Vous maintenez ${streakHabits} habitude${streakHabits > 1 ? 's' : ''} avec succès. `;
    }
    
    message += "Posez-moi des questions sur vos données pour obtenir des conseils personnalisés.";
    setInsightMessage(message);
  };
  
  // Handle refresh button
  const handleRefresh = () => {
    loadData();
    toast.success("Données d'analyse actualisées");
  };
  
  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Tableau de bord analytique</h1>
            <p className="text-gray-500 dark:text-gray-400">
              Visualisez vos données et améliorez votre productivité
            </p>
          </div>
          <Button
            onClick={handleRefresh}
            variant="outline"
            size="sm"
            className="flex gap-2 items-center w-full sm:w-auto"
            disabled={refreshing || loading}
          >
            <RefreshCcw size={16} className={refreshing ? "animate-spin" : ""} />
            <span className="block md:inline">Actualiser</span>
          </Button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Skeleton className="h-[120px] rounded-md" />
            <Skeleton className="h-[120px] rounded-md" />
            <Skeleton className="h-[120px] rounded-md" />
            <Skeleton className="h-[120px] rounded-md" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsCard 
              title="Taux de complétion" 
              value={`${completionRate}%`} 
              icon={<CheckCircle2 className="h-5 w-5" />}
              trend={completionRate >= 70 ? 'up' : completionRate >= 50 ? 'neutral' : 'down'}
              trendValue={completionRate > 50 ? "Bon" : "À améliorer"}
              loading={loading}
            />
            <StatsCard 
              title="Tâches en attente" 
              value={pendingTasks} 
              icon={<List className="h-5 w-5" />}
              trend={pendingTasks < 5 ? 'up' : pendingTasks < 10 ? 'neutral' : 'down'}
              trendValue={pendingTasks < 5 ? "Gérable" : "À traiter"}
              loading={loading}
            />
            <StatsCard 
              title="Meilleure série" 
              value={habitStreak} 
              description="jours consécutifs"
              icon={<Layers className="h-5 w-5" />}
              trend={habitStreak > 5 ? 'up' : 'neutral'}
              trendValue={habitStreak > 7 ? "Excellent" : "En progression"}
              loading={loading}
            />
            <StatsCard 
              title="Temps de concentration" 
              value={`${totalFocusTime} min`} 
              icon={<Clock className="h-5 w-5" />}
              trend={totalFocusTime > 120 ? 'up' : 'neutral'}
              trendValue={totalFocusTime > 120 ? "Productif" : "Moyen"}
              loading={loading}
            />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Tabs defaultValue="overview" className="w-full">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
                <TabsList className="mb-4 sm:mb-0">
                  <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
                  <TabsTrigger value="tasks">Tâches</TabsTrigger>
                  <TabsTrigger value="habits">Habitudes</TabsTrigger>
                  <TabsTrigger value="focus">Focus</TabsTrigger>
                </TabsList>
                
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="h-8">
                    <SlidersHorizontal className="h-4 w-4 mr-1" />
                    <span>Filtres</span>
                  </Button>
                  <Button variant="outline" size="sm" className="h-8">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span>Cette semaine</span>
                  </Button>
                </div>
              </div>

              <TabsContent value="overview" className="space-y-6">
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Score de productivité</CardTitle>
                        <CardDescription>Évolution sur les 7 derniers jours</CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant={chartTab === "weekly" ? "default" : "outline"} 
                          size="sm"
                          onClick={() => setChartTab("weekly")}
                        >
                          Semaine
                        </Button>
                        <Button 
                          variant={chartTab === "monthly" ? "default" : "outline"} 
                          size="sm"
                          onClick={() => setChartTab("monthly")}
                        >
                          Mois
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                          data={productivityData}
                          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Area 
                            type="monotone" 
                            dataKey="productivité" 
                            stroke="#3b82f6" 
                            fill="#3b82f6" 
                            fillOpacity={0.2} 
                            activeDot={{ r: 8 }} 
                          />
                          <Area 
                            type="monotone" 
                            dataKey="moyenne" 
                            stroke="#9ca3af" 
                            fill="#9ca3af" 
                            fillOpacity={0.1}
                            strokeDasharray="5 5" 
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center">
                        <PieChartIcon className="h-5 w-5 mr-2 text-primary" />
                        Tâches par priorité
                      </CardTitle>
                      <CardDescription>Répartition actuelle</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[220px]">
                        {tasksByPriorityData.length > 0 ? (
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={tasksByPriorityData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                fill="#8884d8"
                                paddingAngle={2}
                                dataKey="value"
                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                              >
                                {tasksByPriorityData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                              </Pie>
                              <Tooltip />
                            </PieChart>
                          </ResponsiveContainer>
                        ) : (
                          <div className="flex h-full items-center justify-center">
                            <div className="text-center">
                              <FilterX className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                              <p className="text-gray-500">Pas de données</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center">
                        <LineChartIcon className="h-5 w-5 mr-2 text-primary" />
                        Complétion des tâches
                      </CardTitle>
                      <CardDescription>Progression sur 7 jours</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[220px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={taskCompletionData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Line 
                              type="monotone" 
                              dataKey="completion" 
                              stroke="#3b82f6" 
                              activeDot={{ r: 8 }} 
                              strokeWidth={2}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              <TabsContent value="tasks" className="space-y-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center">
                      <BarChart3 className="h-5 w-5 mr-2 text-primary" />
                      Tâches par jour
                    </CardTitle>
                    <CardDescription>Répartition sur la semaine</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={weeklyTaskData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="completed" name="Terminées" fill="#10b981" />
                          <Bar dataKey="pending" name="En attente" fill="#f59e0b" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center">
                        <PieChartIcon className="h-5 w-5 mr-2 text-primary" />
                        Tâches par catégorie
                      </CardTitle>
                      <CardDescription>Répartition par domaine</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[220px]">
                        {taskStatsByCategory.length > 0 ? (
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={taskStatsByCategory}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                fill="#8884d8"
                                paddingAngle={2}
                                dataKey="value"
                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                              >
                                {taskStatsByCategory.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                              </Pie>
                              <Tooltip />
                            </PieChart>
                          </ResponsiveContainer>
                        ) : (
                          <div className="flex h-full items-center justify-center">
                            <div className="text-center">
                              <FilterX className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                              <p className="text-gray-500">Pas de données</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center">
                        <Target className="h-5 w-5 mr-2 text-primary" />
                        Statut des tâches
                      </CardTitle>
                      <CardDescription>Vue d'ensemble</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-8 pt-4">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <div className="h-3 w-3 rounded bg-blue-500"></div>
                              <span className="text-sm">En attente</span>
                            </div>
                            <span className="text-sm">{pendingTasks}</span>
                          </div>
                          <div className="h-2 w-full bg-blue-100 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-blue-500 rounded-full" 
                              style={{ width: `${100 - completionRate}%` }}
                            ></div>
                          </div>
                        </div>
                        
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <div className="h-3 w-3 rounded bg-green-500"></div>
                              <span className="text-sm">Terminées</span>
                            </div>
                            <span className="text-sm">{tasksData?.filter(t => t.status === 'done').length || 0}</span>
                          </div>
                          <div className="h-2 w-full bg-green-100 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-green-500 rounded-full" 
                              style={{ width: `${completionRate}%` }}
                            ></div>
                          </div>
                        </div>
                        
                        <div className="flex justify-center mt-4">
                          <Badge className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                            Taux de complétion: {completionRate}%
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              <TabsContent value="habits" className="space-y-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center">
                      <BarChart3 className="h-5 w-5 mr-2 text-primary" />
                      Consistance des habitudes
                    </CardTitle>
                    <CardDescription>Suivi des séries actuelles</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      {habitConsistencyData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={habitConsistencyData}
                            layout="vertical"
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis type="number" domain={[0, 100]} />
                            <YAxis type="category" dataKey="name" width={100} />
                            <Tooltip formatter={(value) => [`${value}%`, 'Progression']} />
                            <Legend />
                            <Bar 
                              dataKey="progress" 
                              name="Progression" 
                              fill="#3b82f6" 
                              radius={[0, 4, 4, 0]}
                              label={{ position: 'right', formatter: (value) => `${value}%` }}
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <div className="text-center">
                            <FilterX className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                            <p className="text-gray-500">Pas de données</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center">
                      <Lightbulb className="h-5 w-5 mr-2 text-primary" />
                      Conseils pour maintenir vos habitudes
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-md"
                      >
                        <div className="flex items-start gap-3">
                          <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-full">
                            <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div>
                            <h4 className="font-medium text-sm mb-1">Choisissez un moment fixe</h4>
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                              Associez vos habitudes à un moment précis de la journée pour renforcer leur régularité.
                            </p>
                          </div>
                        </div>
                      </motion.div>
                      
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="p-3 bg-green-50 dark:bg-green-950/30 rounded-md"
                      >
                        <div className="flex items-start gap-3">
                          <div className="bg-green-100 dark:bg-green-900 p-2 rounded-full">
                            <Layers className="h-4 w-4 text-green-600 dark:text-green-400" />
                          </div>
                          <div>
                            <h4 className="font-medium text-sm mb-1">Commencez petit</h4>
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                              De petites actions cohérentes sont plus efficaces que des objectifs trop ambitieux.
                            </p>
                          </div>
                        </div>
                      </motion.div>
                      
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-md"
                      >
                        <div className="flex items-start gap-3">
                          <div className="bg-amber-100 dark:bg-amber-900 p-2 rounded-full">
                            <Target className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                          </div>
                          <div>
                            <h4 className="font-medium text-sm mb-1">Ne brisez pas la chaîne</h4>
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                              Visualisez vos séries comme une chaîne à maintenir pour renforcer votre motivation.
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="focus" className="space-y-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center">
                      <Clock className="h-5 w-5 mr-2 text-primary" />
                      Distribution du temps de concentration
                    </CardTitle>
                    <CardDescription>Répartition par période de la journée</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      {focusDistributionData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={focusDistributionData}
                              cx="50%"
                              cy="50%"
                              outerRadius={100}
                              fill="#8884d8"
                              dataKey="value"
                              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            >
                              {focusDistributionData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip formatter={(value) => [`${value} min`, 'Temps']} />
                            <Legend />
                          </PieChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <div className="text-center">
                            <FilterX className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                            <p className="text-gray-500">Pas de données</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center">
                      <BrainCircuit className="h-5 w-5 mr-2 text-primary" />
                      Optimiser votre concentration
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Temps total de focus</span>
                        <Badge variant="secondary">{totalFocusTime} minutes</Badge>
                      </div>
                      
                      <Separator />
                      
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium">Conseils pour améliorer votre focus :</h4>
                        <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                          <li className="flex items-start gap-2">
                            <div className="bg-blue-100 dark:bg-blue-900 p-1 rounded-full mt-0.5">
                              <HelpCircle className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                            </div>
                            <span>Utilisez la technique Pomodoro (25 min de travail, 5 min de pause)</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <div className="bg-blue-100 dark:bg-blue-900 p-1 rounded-full mt-0.5">
                              <HelpCircle className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                            </div>
                            <span>Éliminez les distractions pendant vos sessions de concentration</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <div className="bg-blue-100 dark:bg-blue-900 p-1 rounded-full mt-0.5">
                              <HelpCircle className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                            </div>
                            <span>Travaillez pendant vos heures les plus productives</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
          
          <div className="space-y-6">
            <AIInsightCard 
              title="Insights personnalisés" 
              description="Analyses basées sur vos données" 
              type="general" 
            />
            
            <Card className="h-[500px]">
              <div className="h-full">
                <AIAssistant initialMessage={insightMessage} />
              </div>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default AnalyticsPage;
