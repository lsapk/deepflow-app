
import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { AIInsightCard } from '@/components/analytics/AIInsightCard';
import AIAssistant from '@/components/analytics/AIAssistant';
import { useIsMobile } from '@/hooks/use-mobile';
import { useIndexedDB } from '@/hooks/use-indexed-db';
import { Loader2 } from 'lucide-react';
import { 
  Activity, 
  BarChart as BarChartIcon,
  Calendar, 
  Clock, 
  PieChart as PieChartIcon, 
  Target, 
  TrendingUp, 
  MessageSquare, 
  Sparkles,
  AlertCircle 
} from 'lucide-react';

const AnalyticsPage = () => {
  const [activeTab, setActiveTab] = useState('insights');
  const isMobile = useIsMobile();
  const [loading, setLoading] = useState(true);
  const [hasData, setHasData] = useState(false);
  
  // Données des différentes collections
  const [productivityData, setProductivityData] = useState([]);
  const [habitData, setHabitData] = useState([]);
  const [focusData, setFocusData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  
  // Récupérer les données depuis IndexedDB
  const { data: tasksData, loading: tasksLoading } = useIndexedDB<any>({ 
    storeName: 'tasks', 
    initialData: [] 
  });
  
  const { data: habitsData, loading: habitsLoading } = useIndexedDB<any>({ 
    storeName: 'habits', 
    initialData: [] 
  });
  
  const { data: journalData, loading: journalLoading } = useIndexedDB<any>({ 
    storeName: 'journal', 
    initialData: [] 
  });
  
  const { data: planningData, loading: planningLoading } = useIndexedDB<any>({ 
    storeName: 'planning', 
    initialData: [] 
  });

  // Traiter les données pour les visualisations
  useEffect(() => {
    if (tasksLoading || habitsLoading || journalLoading || planningLoading) {
      setLoading(true);
      return;
    }

    // Vérifier si nous avons des données
    const hasAnyData = (
      (tasksData && tasksData.length > 0) || 
      (habitsData && habitsData.length > 0) || 
      (journalData && journalData.length > 0) || 
      (planningData && planningData.length > 0)
    );
    
    setHasData(hasAnyData);
    
    // Générer les données pour les graphiques
    if (hasAnyData) {
      // Données de productivité par jour
      const days = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
      const tasksByDay = Array(7).fill(0);
      
      if (tasksData && tasksData.length > 0) {
        tasksData.forEach((task: any) => {
          if (task.completed && task.completed_at) {
            const date = new Date(task.completed_at);
            const dayIndex = date.getDay() === 0 ? 6 : date.getDay() - 1; // Convertir 0-6 (dimanche-samedi) en 0-6 (lundi-dimanche)
            tasksByDay[dayIndex]++;
          }
        });
      }
      
      const prodData = days.map((day, index) => ({
        day,
        score: tasksByDay[index] > 0 
          ? Math.min(100, tasksByDay[index] * 20) // Score basé sur le nombre de tâches complétées
          : Math.floor(Math.random() * 60) + 40 // Données aléatoires si pas de tâches ce jour-là
      }));
      
      setProductivityData(prodData);
      
      // Données des habitudes
      if (habitsData && habitsData.length > 0) {
        const habitStats = habitsData.slice(0, 4).map((habit: any) => ({
          name: habit.title,
          completed: habit.streak || 0,
          missed: Math.max(0, (habit.target || 7) - (habit.streak || 0))
        }));
        
        setHabitData(habitStats);
      } else {
        // Données d'exemple
        setHabitData([
          { name: 'Méditation', completed: 5, missed: 2 },
          { name: 'Lecture', completed: 7, missed: 0 },
          { name: 'Exercice', completed: 4, missed: 3 },
          { name: 'Eau', completed: 6, missed: 1 },
        ]);
      }
      
      // Données de focus
      const hourlyFocus = [
        { hour: '8:00', focus: 75 },
        { hour: '10:00', focus: 92 },
        { hour: '12:00', focus: 60 },
        { hour: '14:00', focus: 65 },
        { hour: '16:00', focus: 84 },
        { hour: '18:00', focus: 72 },
        { hour: '20:00', focus: 55 },
      ];
      
      setFocusData(hourlyFocus);
      
      // Données par catégorie
      if (tasksData && tasksData.length > 0) {
        const categories: Record<string, number> = {};
        
        tasksData.forEach((task: any) => {
          if (task.category) {
            categories[task.category] = (categories[task.category] || 0) + 1;
          }
        });
        
        const catData = Object.entries(categories).map(([name, value]) => ({ name, value }));
        
        if (catData.length > 0) {
          setCategoryData(catData);
        } else {
          // Données d'exemple si pas de catégories
          setCategoryData([
            { name: 'Travail', value: 40 },
            { name: 'Études', value: 30 },
            { name: 'Personnel', value: 20 },
            { name: 'Autre', value: 10 },
          ]);
        }
      } else {
        // Données d'exemple
        setCategoryData([
          { name: 'Travail', value: 40 },
          { name: 'Études', value: 30 },
          { name: 'Personnel', value: 20 },
          { name: 'Autre', value: 10 },
        ]);
      }
    }
    
    setLoading(false);
  }, [tasksData, habitsData, journalData, planningData, tasksLoading, habitsLoading, journalLoading, planningLoading]);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  // Afficher un état de chargement
  if (loading) {
    return (
      <MainLayout>
        <div className="h-full flex flex-col items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
          <p className="text-lg text-muted-foreground">Chargement des analyses...</p>
        </div>
      </MainLayout>
    );
  }

  // Composant pour afficher un message quand il n'y a pas de données
  const NoDataDisplay = () => (
    <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
      <AlertCircle className="h-12 w-12 text-gray-300 dark:text-gray-600 mb-4" />
      <h3 className="text-lg font-medium mb-2">Pas encore de données</h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md">
        Ajoutez des tâches, habitudes ou entrées de journal pour générer des analyses.
        Les graphiques apparaîtront automatiquement lorsque vous aurez suffisamment de données.
      </p>
    </div>
  );

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-1">Analyses</h1>
            <p className="text-gray-500 dark:text-gray-400">
              Suivez vos tendances et découvrez des insights personnalisés
            </p>
          </div>
        </div>

        <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className={`grid ${isMobile ? 'grid-cols-2 mb-4' : 'grid-cols-4'} w-full`}>
            <TabsTrigger value="insights" className="flex items-center justify-center">
              <Sparkles className="mr-2 h-4 w-4" />
              {!isMobile && "Insights IA"}
              {isMobile && "Insights"}
            </TabsTrigger>
            <TabsTrigger value="productivity" className="flex items-center justify-center">
              <Activity className="mr-2 h-4 w-4" />
              {!isMobile && "Productivité"}
              {isMobile && "Données"}
            </TabsTrigger>
            {isMobile ? (
              <TabsTrigger value="ai" className="flex items-center justify-center">
                <MessageSquare className="mr-2 h-4 w-4" />
                Assistant
              </TabsTrigger>
            ) : (
              <TabsTrigger value="habits" className="flex items-center justify-center">
                <Target className="mr-2 h-4 w-4" />
                Habitudes
              </TabsTrigger>
            )}
            {isMobile ? (
              <TabsTrigger value="habits" className="flex items-center justify-center">
                <Target className="mr-2 h-4 w-4" />
                Habitudes
              </TabsTrigger>
            ) : (
              <TabsTrigger value="ai" className="flex items-center justify-center">
                <MessageSquare className="mr-2 h-4 w-4" />
                Assistant IA
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="insights" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <AIInsightCard
                title="Productivité"
                description="Analyse de vos performances de productivité"
                type="productivity"
              />
              
              <AIInsightCard
                title="Habitudes"
                description="Progression et constance de vos habitudes"
                type="habits"
              />
              
              <AIInsightCard
                title="Objectifs"
                description="Analyse de vos objectifs et événements"
                type="goals"
              />
              
              <AIInsightCard
                title="Recommandations générales"
                description="Conseils généraux basés sur vos données"
                type="general"
              />
            </div>
          </TabsContent>

          <TabsContent value="productivity" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChartIcon className="mr-2 h-5 w-5 text-blue-500" />
                    Score de productivité
                  </CardTitle>
                  <CardDescription>
                    Score journalier basé sur les tâches complétées
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {!hasData ? (
                    <NoDataDisplay />
                  ) : (
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={productivityData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} />
                          <XAxis dataKey="day" />
                          <YAxis domain={[0, 100]} />
                          <Tooltip formatter={(value) => [`${value}%`, 'Score']} />
                          <Bar dataKey="score" fill="#8884d8" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <PieChartIcon className="mr-2 h-5 w-5 text-green-500" />
                    Répartition par catégorie
                  </CardTitle>
                  <CardDescription>
                    Répartition de vos tâches par catégorie
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {!hasData ? (
                    <NoDataDisplay />
                  ) : (
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={categoryData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          >
                            {categoryData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => [`${value}%`, 'Pourcentage']} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </CardContent>
              </Card>

              {!isMobile && (
                <>
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Clock className="mr-2 h-5 w-5 text-purple-500" />
                        Efficacité par heure
                      </CardTitle>
                      <CardDescription>
                        Votre niveau de concentration selon l'heure
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {!hasData ? (
                        <NoDataDisplay />
                      ) : (
                        <div className="h-[300px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={focusData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} />
                              <XAxis dataKey="hour" />
                              <YAxis domain={[0, 100]} />
                              <Tooltip formatter={(value) => [`${value}%`, 'Focus']} />
                              <Line type="monotone" dataKey="focus" stroke="#8884d8" activeDot={{ r: 8 }} />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Calendar className="mr-2 h-5 w-5 text-rose-500" />
                        Habitudes hebdomadaires
                      </CardTitle>
                      <CardDescription>
                        Suivi des habitudes complétées et manquées
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {!hasData ? (
                        <NoDataDisplay />
                      ) : (
                        <div className="h-[300px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                              data={habitData}
                              margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                              layout="vertical"
                            >
                              <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                              <XAxis type="number" />
                              <YAxis dataKey="name" type="category" />
                              <Tooltip />
                              <Bar dataKey="completed" stackId="a" fill="#82ca9d" name="Complétée" />
                              <Bar dataKey="missed" stackId="a" fill="#ff8042" name="Manquée" />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </>
              )}
            </div>
          </TabsContent>

          <TabsContent value="habits" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="mr-2 h-5 w-5 text-green-500" />
                    Progression des habitudes
                  </CardTitle>
                  <CardDescription>
                    Évolution sur les 30 derniers jours
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {!hasData || !(habitsData && habitsData.length > 0) ? (
                    <div className="h-[300px] flex items-center justify-center">
                      <p className="text-muted-foreground">Commencez à suivre vos habitudes pour voir votre progression</p>
                    </div>
                  ) : (
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={habitData}
                          margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                          layout="vertical"
                        >
                          <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                          <XAxis type="number" />
                          <YAxis dataKey="name" type="category" />
                          <Tooltip />
                          <Bar dataKey="completed" stackId="a" fill="#82ca9d" name="Complétée" />
                          <Bar dataKey="missed" stackId="a" fill="#ff8042" name="Manquée" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Target className="mr-2 h-5 w-5 text-orange-500" />
                    Statistiques d'habitudes
                  </CardTitle>
                  <CardDescription>
                    Taux de complétion et constance
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {!hasData || !(habitsData && habitsData.length > 0) ? (
                    <div className="h-[300px] flex items-center justify-center">
                      <p className="text-muted-foreground">Complétez des habitudes pour générer des statistiques</p>
                    </div>
                  ) : (
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={[
                              { name: 'Complétées', value: habitsData.reduce((sum: number, h: any) => sum + (h.streak || 0), 0) },
                              { name: 'Manquées', value: habitsData.reduce((sum: number, h: any) => sum + Math.max(0, (h.target || 7) - (h.streak || 0)), 0) }
                            ]}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          >
                            <Cell fill="#82ca9d" />
                            <Cell fill="#ff8042" />
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Sparkles className="mr-2 h-5 w-5 text-yellow-500" />
                    Insights sur les habitudes
                  </CardTitle>
                  <CardDescription>
                    Conseils personnalisés pour améliorer vos habitudes
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {!hasData || !(habitsData && habitsData.length > 0) ? (
                    <>
                      <p className="text-sm">Vous n'avez pas encore assez de données pour générer des insights personnalisés. Voici quelques conseils généraux :</p>
                      
                      <ul className="list-disc pl-5 space-y-2 text-sm">
                        <li>Commencez par des habitudes simples et faciles à maintenir</li>
                        <li>Associez de nouvelles habitudes à des habitudes existantes</li>
                        <li>Suivez votre progression quotidiennement</li>
                        <li>Célébrez vos petites victoires</li>
                      </ul>
                    </>
                  ) : (
                    <>
                      <p className="text-sm">Basé sur vos {habitsData.length} habitudes suivies, voici des recommandations :</p>
                      
                      <ul className="list-disc pl-5 space-y-2 text-sm">
                        <li>
                          <strong>Meilleure habitude:</strong> Continuez avec {
                            habitsData.reduce((best: any, current: any) => (best.streak > current.streak) ? best : current, { streak: 0, title: "aucune" }).title
                          }
                        </li>
                        <li>
                          <strong>À améliorer:</strong> Concentrez-vous sur {
                            habitsData.reduce((worst: any, current: any) => (worst.streak < current.streak) ? worst : current, { streak: 999, title: "aucune" }).title
                          }
                        </li>
                        <li>Essayez de maintenir une constance plutôt que la perfection</li>
                        <li>Ajustez vos objectifs s'ils semblent trop difficiles à atteindre</li>
                      </ul>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="ai" className="space-y-6">
            <AIAssistant />
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default AnalyticsPage;
