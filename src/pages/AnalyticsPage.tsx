import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getAllTasks } from '@/services/taskService';
import { getAllHabits } from '@/services/habitService';
import { motion } from 'framer-motion';
import { AIInsightCard } from '@/components/analytics/AIInsightCard';
import { ChartContainer } from '@/components/ui/chart';
import { Calendar, CheckCheck, Clock, Filter, RefreshCw, Settings2, TrendingUp } from 'lucide-react';
import AIAssistant from '@/components/analytics/AIAssistant';
import { Skeleton } from '@/components/ui/skeleton';
import { format, subDays, isSameDay } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useAuth } from '@/contexts/AuthContext';
import {
  AreaChart as RechartAreaChart,
  BarChart as RechartBarChart,
  LineChart as RechartLineChart,
  PieChart as RechartPieChart,
  Area,
  Bar,
  Line,
  Pie,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from 'recharts';

interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  due_date?: string;
  priority: 'low' | 'medium' | 'high';
  status: 'todo' | 'done' | 'in-progress';
  created_at: string;
}

interface Habit {
  id: string;
  title: string;
  description?: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  streak: number;
  target_days?: number[];
  last_completed?: string;
  created_at?: string;
}

const AnalyticsPage = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [timeRange, setTimeRange] = useState('7days');
  const [chartType, setChartType] = useState('bar');
  const [isLoading, setIsLoading] = useState(true);
  const [refreshingData, setRefreshingData] = useState(false);
  const { currentUser } = useAuth();

  useEffect(() => {
    loadData();
    const refreshInterval = setInterval(() => {
      loadData(true);
    }, 5 * 60 * 1000);

    return () => clearInterval(refreshInterval);
  }, [currentUser]);

  const loadData = async (silent = false) => {
    if (!silent) setIsLoading(true);
    if (silent) setRefreshingData(true);
    
    try {
      const fetchedTasks = await getAllTasks();
      const adaptedTasks = fetchedTasks.map(task => ({
        ...task,
        status: task.status === 'in_progress' ? 'in-progress' : task.status as 'todo' | 'done' | 'in-progress'
      }));
      setTasks(adaptedTasks);

      const fetchedHabits = await getAllHabits();
      setHabits(fetchedHabits);
      
      if (silent) {
        setRefreshingData(false);
      } else {
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des données:", error);
      if (silent) {
        setRefreshingData(false);
      } else {
        setIsLoading(false);
      }
    }
  };

  const prepareTaskChartData = () => {
    const today = new Date();
    const dateLabels = [];
    const completedData = [];
    const todoData = [];
    
    let days = 7;
    if (timeRange === '30days') days = 30;
    if (timeRange === '90days') days = 90;
    
    for (let i = days - 1; i >= 0; i--) {
      const date = subDays(today, i);
      dateLabels.push(format(date, 'dd MMM', { locale: fr }));
      
      const dayTasks = tasks.filter(task => {
        if (!task.created_at) return false;
        return isSameDay(new Date(task.created_at), date);
      });
      
      const completedTasks = dayTasks.filter(task => task.completed).length;
      const pendingTasks = dayTasks.filter(task => !task.completed).length;
      
      completedData.push(completedTasks);
      todoData.push(pendingTasks);
    }
    
    return {
      labels: dateLabels,
      datasets: [
        {
          label: 'Tâches terminées',
          data: completedData,
          backgroundColor: 'rgba(34, 197, 94, 0.5)',
          borderColor: 'rgb(34, 197, 94)',
        },
        {
          label: 'Tâches en attente',
          data: todoData,
          backgroundColor: 'rgba(59, 130, 246, 0.5)',
          borderColor: 'rgb(59, 130, 246)',
        }
      ]
    };
  };

  const prepareHabitChartData = () => {
    const habitsByFrequency = {
      daily: habits.filter(h => h.frequency === 'daily').length,
      weekly: habits.filter(h => h.frequency === 'weekly').length,
      monthly: habits.filter(h => h.frequency === 'monthly').length,
    };
    
    return {
      labels: ['Quotidien', 'Hebdomadaire', 'Mensuel'],
      datasets: [
        {
          label: 'Habitudes par fréquence',
          data: [habitsByFrequency.daily, habitsByFrequency.weekly, habitsByFrequency.monthly],
          backgroundColor: [
            'rgba(255, 99, 132, 0.5)',
            'rgba(54, 162, 235, 0.5)',
            'rgba(255, 206, 86, 0.5)',
          ],
          borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
          ],
          borderWidth: 1,
        }
      ]
    };
  };

  const prepareStreakChartData = () => {
    const sortedHabits = [...habits].sort((a, b) => (b.streak || 0) - (a.streak || 0)).slice(0, 5);
    
    return {
      labels: sortedHabits.map(h => h.title),
      datasets: [
        {
          label: 'Streak (jours)',
          data: sortedHabits.map(h => h.streak || 0),
          backgroundColor: 'rgba(147, 51, 234, 0.5)',
          borderColor: 'rgb(147, 51, 234)',
        }
      ]
    };
  };

  const renderChart = (chartData: any) => {
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];
    
    switch (chartType) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <RechartBarChart data={chartData.labels.map((label: string, index: number) => {
              const dataPoint: any = { name: label };
              chartData.datasets.forEach((dataset: any, datasetIndex: number) => {
                dataPoint[dataset.label] = dataset.data[index];
              });
              return dataPoint;
            })} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              {chartData.datasets.map((dataset: any, index: number) => (
                <Bar 
                  key={dataset.label} 
                  dataKey={dataset.label} 
                  fill={dataset.backgroundColor.split(',')[0].replace('rgba(', 'rgb(').replace('0.5)', ')')} 
                />
              ))}
            </RechartBarChart>
          </ResponsiveContainer>
        );
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <RechartLineChart data={chartData.labels.map((label: string, index: number) => {
              const dataPoint: any = { name: label };
              chartData.datasets.forEach((dataset: any, datasetIndex: number) => {
                dataPoint[dataset.label] = dataset.data[index];
              });
              return dataPoint;
            })} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              {chartData.datasets.map((dataset: any, index: number) => (
                <Line 
                  key={dataset.label} 
                  type="monotone" 
                  dataKey={dataset.label} 
                  stroke={dataset.borderColor} 
                  activeDot={{ r: 8 }} 
                />
              ))}
            </RechartLineChart>
          </ResponsiveContainer>
        );
      case 'area':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <RechartAreaChart data={chartData.labels.map((label: string, index: number) => {
              const dataPoint: any = { name: label };
              chartData.datasets.forEach((dataset: any, datasetIndex: number) => {
                dataPoint[dataset.label] = dataset.data[index];
              });
              return dataPoint;
            })} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              {chartData.datasets.map((dataset: any, index: number) => (
                <Area 
                  key={dataset.label} 
                  type="monotone" 
                  dataKey={dataset.label} 
                  stroke={dataset.borderColor} 
                  fill={dataset.backgroundColor} 
                />
              ))}
            </RechartAreaChart>
          </ResponsiveContainer>
        );
      case 'pie':
        const pieData = chartData.labels.map((label: string, index: number) => ({
          name: label,
          value: chartData.datasets[0].data[index]
        }));
        
        return (
          <ResponsiveContainer width="100%" height={300}>
            <RechartPieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={true}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {pieData.map((entry: any, index: number) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={COLORS[index % COLORS.length]} 
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </RechartPieChart>
          </ResponsiveContainer>
        );
      default:
        return (
          <ResponsiveContainer width="100%" height={300}>
            <RechartBarChart data={chartData.labels.map((label: string, index: number) => {
              const dataPoint: any = { name: label };
              chartData.datasets.forEach((dataset: any, datasetIndex: number) => {
                dataPoint[dataset.label] = dataset.data[index];
              });
              return dataPoint;
            })} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              {chartData.datasets.map((dataset: any, index: number) => (
                <Bar 
                  key={dataset.label} 
                  dataKey={dataset.label} 
                  fill={dataset.backgroundColor.split(',')[0].replace('rgba(', 'rgb(').replace('0.5)', ')')} 
                />
              ))}
            </RechartBarChart>
          </ResponsiveContainer>
        );
    }
  };

  return (
    <MainLayout>
      <motion.div 
        className="space-y-6"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-1">Analyse & Statistiques</h1>
            <p className="text-muted-foreground">
              Visualisez l'évolution de votre productivité et de vos habitudes
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => loadData(true)}
              disabled={refreshingData}
              className="flex items-center gap-1"
            >
              <RefreshCw className={`h-4 w-4 ${refreshingData ? 'animate-spin' : ''}`} />
              Actualiser
            </Button>
            
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[120px]">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <SelectValue placeholder="Période" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7days">7 jours</SelectItem>
                <SelectItem value="30days">30 jours</SelectItem>
                <SelectItem value="90days">90 jours</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <div>
                <CardTitle>Tâches</CardTitle>
                <CardDescription>Tâches complétées vs. en attente</CardDescription>
              </div>
              <div className="bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 p-2 rounded-full">
                <CheckCheck className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="w-full h-[200px] rounded-md" />
              ) : (
                <>
                <div className="flex flex-wrap gap-2 mb-4">
                  <div className="text-sm border rounded-full px-3 py-1">
                    <span className="font-medium">{tasks.filter(t => t.completed).length}</span> terminées
                  </div>
                  <div className="text-sm border rounded-full px-3 py-1">
                    <span className="font-medium">{tasks.filter(t => !t.completed).length}</span> en attente
                  </div>
                </div>
                
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Évolution dans le temps</span>
                  <Select value={chartType} onValueChange={setChartType}>
                    <SelectTrigger className="w-[100px] h-7 text-xs">
                      <div className="flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />
                        <SelectValue placeholder="Type" />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bar">Histogramme</SelectItem>
                      <SelectItem value="line">Ligne</SelectItem>
                      <SelectItem value="area">Zone</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {renderChart(prepareTaskChartData())}
                </>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <div>
                <CardTitle>Habitudes</CardTitle>
                <CardDescription>Types d'habitudes et fréquence</CardDescription>
              </div>
              <div className="bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400 p-2 rounded-full">
                <Calendar className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="w-full h-[200px] rounded-md" />
              ) : (
                <>
                <div className="flex flex-wrap gap-2 mb-4">
                  <div className="text-sm border rounded-full px-3 py-1">
                    <span className="font-medium">{habits.length}</span> habitudes actives
                  </div>
                  <div className="text-sm border rounded-full px-3 py-1">
                    <span className="font-medium">{
                      habits.filter(h => {
                        if (!h.last_completed) return false;
                        const lastCompleted = new Date(h.last_completed);
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        lastCompleted.setHours(0, 0, 0, 0);
                        return lastCompleted.getTime() === today.getTime();
                      }).length
                    }</span> complétées aujourd'hui
                  </div>
                </div>
                
                <div className="mb-4">
                  <PieChart
                    data={prepareHabitChartData()}
                    className="aspect-[4/3] w-full"
                  />
                </div>
                </>
              )}
            </CardContent>
          </Card>
          
          <Card className="lg:col-span-1 md:col-span-2">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <div>
                <CardTitle>Streaks</CardTitle>
                <CardDescription>Top 5 des habitudes par streak</CardDescription>
              </div>
              <div className="bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400 p-2 rounded-full">
                <TrendingUp className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="w-full h-[200px] rounded-md" />
              ) : (
                <>
                <div className="flex justify-between items-center mb-4">
                  <div className="text-sm border rounded-full px-3 py-1">
                    <span className="font-medium">{
                      habits.length > 0 ? Math.max(...habits.map(h => h.streak || 0)) : 0
                    }</span> jours (max streak)
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Top 5 des habitudes
                  </div>
                </div>
                
                <BarChart
                  data={prepareStreakChartData()}
                  className="aspect-[4/3] w-full"
                />
                </>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <AIInsightCard type="productivity" />
          </div>
          <div className="md:col-span-2">
            <AIAssistant />
          </div>
        </div>
      </motion.div>
    </MainLayout>
  );
};

export default AnalyticsPage;
