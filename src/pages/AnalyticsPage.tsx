
import React, { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { 
  BarChart, 
  LineChart, 
  Bar, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  DownloadCloud, 
  BarChart3, 
  PieChart as PieChartIcon, 
  LineChart as LineChartIcon,
  CalendarDays
} from 'lucide-react';
import { toast } from 'sonner';

const AnalyticsPage = () => {
  const [dateRange, setDateRange] = useState('week');
  const [currentPeriod, setCurrentPeriod] = useState<string>('Cette semaine');
  
  // Données fictives pour les graphiques
  const productivityData = [
    { day: 'Lun', productivity: 65, focus: 120, tasks: 8 },
    { day: 'Mar', productivity: 59, focus: 90, tasks: 5 },
    { day: 'Mer', productivity: 80, focus: 150, tasks: 10 },
    { day: 'Jeu', productivity: 81, focus: 140, tasks: 7 },
    { day: 'Ven', productivity: 56, focus: 100, tasks: 6 },
    { day: 'Sam', productivity: 55, focus: 80, tasks: 3 },
    { day: 'Dim', productivity: 40, focus: 60, tasks: 2 },
  ];

  const monthlyData = [
    { name: 'Jan', productivity: 60, focus: 1500, tasks: 45 },
    { name: 'Fév', productivity: 65, focus: 1600, tasks: 50 },
    { name: 'Mar', productivity: 68, focus: 1700, tasks: 52 },
    { name: 'Avr', productivity: 70, focus: 1800, tasks: 55 },
    { name: 'Mai', productivity: 72, focus: 1850, tasks: 56 },
    { name: 'Jun', productivity: 75, focus: 1900, tasks: 58 },
    { name: 'Jul', productivity: 68, focus: 1750, tasks: 53 },
    { name: 'Aoû', productivity: 62, focus: 1600, tasks: 48 },
    { name: 'Sep', productivity: 70, focus: 1800, tasks: 54 },
    { name: 'Oct', productivity: 75, focus: 1950, tasks: 59 },
    { name: 'Nov', productivity: 78, focus: 2000, tasks: 62 },
    { name: 'Déc', productivity: 80, focus: 2100, tasks: 65 },
  ];

  const taskDistributionData = [
    { name: 'Complétées', value: 63, color: '#3B82F6' },
    { name: 'En cours', value: 27, color: '#FBBF24' },
    { name: 'En retard', value: 10, color: '#EF4444' },
  ];

  const habitConsistencyData = [
    { name: 'Méditation', consistently: 80, inconsistently: 15, missed: 5 },
    { name: 'Lecture', consistently: 60, inconsistently: 30, missed: 10 },
    { name: 'Exercice', consistently: 70, inconsistently: 20, missed: 10 },
    { name: 'Étude', consistently: 50, inconsistently: 30, missed: 20 },
    { name: 'Journaling', consistently: 85, inconsistently: 10, missed: 5 },
  ];

  const timeDistributionData = [
    { name: 'Travail', value: 35, color: '#3B82F6' },
    { name: 'Étude', value: 20, color: '#8B5CF6' },
    { name: 'Loisirs', value: 15, color: '#EC4899' },
    { name: 'Repos', value: 25, color: '#10B981' },
    { name: 'Autres', value: 5, color: '#6B7280' },
  ];

  const handleDateRangeChange = (value: string) => {
    setDateRange(value);
    
    switch (value) {
      case 'week':
        setCurrentPeriod('Cette semaine');
        break;
      case 'month':
        setCurrentPeriod('Ce mois');
        break;
      case 'quarter':
        setCurrentPeriod('Ce trimestre');
        break;
      case 'year':
        setCurrentPeriod('Cette année');
        break;
      default:
        setCurrentPeriod('Cette semaine');
    }
  };

  const handleExportData = () => {
    toast.success("Données exportées avec succès");
  };

  const handlePreviousPeriod = () => {
    // Logique pour naviguer vers la période précédente
    toast.info(`Navigation vers la période précédente: ${currentPeriod}`);
  };

  const handleNextPeriod = () => {
    // Logique pour naviguer vers la période suivante
    toast.info(`Navigation vers la période suivante: ${currentPeriod}`);
  };

  // Données selon la période sélectionnée
  const chartData = dateRange === 'week' ? productivityData : monthlyData;

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Analyses</h1>
            <p className="text-gray-500 dark:text-gray-400">
              Visualisez vos données et suivez vos progrès au fil du temps
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <Select defaultValue="week" onValueChange={handleDateRangeChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Période" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">Semaine</SelectItem>
                <SelectItem value="month">Mois</SelectItem>
                <SelectItem value="quarter">Trimestre</SelectItem>
                <SelectItem value="year">Année</SelectItem>
              </SelectContent>
            </Select>
            
            <div className="flex items-center gap-1">
              <Button variant="outline" size="icon" onClick={handlePreviousPeriod}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              <span className="px-2 font-medium text-sm">{currentPeriod}</span>
              
              <Button variant="outline" size="icon" onClick={handleNextPeriod}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            
            <Button variant="outline" onClick={handleExportData}>
              <DownloadCloud className="mr-2 h-4 w-4" />
              Exporter
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium flex items-center">
                <BarChart3 size={18} className="mr-2 text-blue-500" />
                Score de productivité
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">78/100</div>
              <p className="text-sm text-muted-foreground">
                +12% par rapport à la période précédente
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium flex items-center">
                <Clock size={18} className="mr-2 text-purple-500" />
                Temps de focus
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">14h 30m</div>
              <p className="text-sm text-muted-foreground">
                2h 15m aujourd'hui
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium flex items-center">
                <CalendarDays size={18} className="mr-2 text-green-500" />
                Jours consécutifs actifs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">14 jours</div>
              <p className="text-sm text-muted-foreground">
                Meilleure série: 21 jours
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="productivity" className="space-y-6">
          <TabsList className="grid grid-cols-3 max-w-md">
            <TabsTrigger value="productivity" className="flex items-center justify-center">
              <LineChartIcon className="w-4 h-4 mr-2" />
              Productivité
            </TabsTrigger>
            <TabsTrigger value="tasks" className="flex items-center justify-center">
              <BarChart3 className="w-4 h-4 mr-2" />
              Tâches
            </TabsTrigger>
            <TabsTrigger value="habits" className="flex items-center justify-center">
              <Calendar className="w-4 h-4 mr-2" />
              Habitudes
            </TabsTrigger>
          </TabsList>

          <TabsContent value="productivity" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Productivité au fil du temps</CardTitle>
                <CardDescription>
                  Votre score de productivité quotidien
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey={dateRange === 'week' ? 'day' : 'name'} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="productivity" stroke="#3b82f6" strokeWidth={2} name="Score" />
                    <Line type="monotone" dataKey="focus" stroke="#8b5cf6" strokeWidth={2} name="Focus (min)" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <PieChartIcon className="mr-2 h-5 w-5" />
                    Répartition du temps
                  </CardTitle>
                  <CardDescription>
                    Comment vous utilisez votre temps
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={timeDistributionData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {timeDistributionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Tendances</CardTitle>
                  <CardDescription>
                    Vos métriques sur les 30 derniers jours
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Productivité moyenne</span>
                      <span className="text-sm font-medium">72/100</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full">
                      <div className="bg-blue-500 h-2 rounded-full" style={{ width: '72%' }}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Temps de focus quotidien</span>
                      <span className="text-sm font-medium">2h 10m</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full">
                      <div className="bg-purple-500 h-2 rounded-full" style={{ width: '60%' }}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Tâches complétées</span>
                      <span className="text-sm font-medium">85%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: '85%' }}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Régularité des habitudes</span>
                      <span className="text-sm font-medium">78%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full">
                      <div className="bg-amber-500 h-2 rounded-full" style={{ width: '78%' }}></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="tasks" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Tâches complétées</CardTitle>
                <CardDescription>
                  Nombre de tâches complétées par période
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey={dateRange === 'week' ? 'day' : 'name'} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="tasks" fill="#3b82f6" name="Tâches complétées" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Répartition des tâches</CardTitle>
                  <CardDescription>
                    État actuel de vos tâches
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={taskDistributionData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {taskDistributionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Statistiques des tâches</CardTitle>
                  <CardDescription>
                    Résumé de vos tâches
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total</h3>
                      <p className="text-2xl font-bold">124</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Complétées</h3>
                      <p className="text-2xl font-bold">78</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">En cours</h3>
                      <p className="text-2xl font-bold">33</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">En retard</h3>
                      <p className="text-2xl font-bold">13</p>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium mb-2">Performance</h3>
                    <div className="flex justify-between mb-1">
                      <span className="text-xs">Taux de complétion</span>
                      <span className="text-xs font-medium">63%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 h-1.5 rounded-full">
                      <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: '63%' }}></div>
                    </div>
                    
                    <div className="flex justify-between mb-1 mt-2">
                      <span className="text-xs">Tâches en retard</span>
                      <span className="text-xs font-medium">10%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 h-1.5 rounded-full">
                      <div className="bg-red-500 h-1.5 rounded-full" style={{ width: '10%' }}></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="habits" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Consistance des habitudes</CardTitle>
                <CardDescription>
                  Performance de vos habitudes
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={habitConsistencyData}
                    layout="vertical"
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="consistently" stackId="a" fill="#22c55e" name="Régulier" />
                    <Bar dataKey="inconsistently" stackId="a" fill="#facc15" name="Irrégulier" />
                    <Bar dataKey="missed" stackId="a" fill="#ef4444" name="Manqué" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Régularité par jour</CardTitle>
                  <CardDescription>
                    Jours où vous êtes le plus régulier
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={[
                      { day: 'Lun', completion: 90 },
                      { day: 'Mar', completion: 85 },
                      { day: 'Mer', completion: 75 },
                      { day: 'Jeu', completion: 80 },
                      { day: 'Ven', completion: 70 },
                      { day: 'Sam', completion: 60 },
                      { day: 'Dim', completion: 50 },
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="completion" fill="#3b82f6" name="Taux de complétion (%)" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Statistiques d'habitudes</CardTitle>
                  <CardDescription>
                    Résumé de vos habitudes
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total habitudes</h3>
                      <p className="text-2xl font-bold">8</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Habitudes actives</h3>
                      <p className="text-2xl font-bold">5</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Taux de complétion</h3>
                      <p className="text-2xl font-bold">78%</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Jours consécutifs</h3>
                      <p className="text-2xl font-bold">14</p>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium mb-2">Top habitudes</h3>
                    <ul className="space-y-2">
                      <li className="flex justify-between items-center">
                        <span className="text-sm">Méditation</span>
                        <span className="text-sm font-medium text-green-600 dark:text-green-400">92%</span>
                      </li>
                      <li className="flex justify-between items-center">
                        <span className="text-sm">Journaling</span>
                        <span className="text-sm font-medium text-green-600 dark:text-green-400">85%</span>
                      </li>
                      <li className="flex justify-between items-center">
                        <span className="text-sm">Exercice</span>
                        <span className="text-sm font-medium text-yellow-600 dark:text-yellow-400">70%</span>
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default AnalyticsPage;
