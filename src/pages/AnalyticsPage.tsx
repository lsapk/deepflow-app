
import React, { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { AIInsightCard } from '@/components/analytics/AIInsightCard';
import AIAssistant from '@/components/analytics/AIAssistant';
import { useIsMobile } from '@/hooks/use-mobile';
import { 
  Activity, 
  BarChart as BarChartIcon,
  Calendar, 
  Clock, 
  PieChart as PieChartIcon, 
  Target, 
  TrendingUp, 
  MessageSquare, 
  Sparkles 
} from 'lucide-react';

// Exemple de données pour les graphiques
const productivityData = [
  { day: 'Lun', score: 67 },
  { day: 'Mar', score: 88 },
  { day: 'Mer', score: 72 },
  { day: 'Jeu', score: 94 },
  { day: 'Ven', score: 82 },
  { day: 'Sam', score: 55 },
  { day: 'Dim', score: 40 },
];

const habitData = [
  { name: 'Méditation', completed: 5, missed: 2 },
  { name: 'Lecture', completed: 7, missed: 0 },
  { name: 'Exercice', completed: 4, missed: 3 },
  { name: 'Eau', completed: 6, missed: 1 },
];

const focusData = [
  { hour: '8:00', focus: 75 },
  { hour: '10:00', focus: 92 },
  { hour: '12:00', focus: 60 },
  { hour: '14:00', focus: 65 },
  { hour: '16:00', focus: 84 },
  { hour: '18:00', focus: 72 },
  { hour: '20:00', focus: 55 },
];

const categoryData = [
  { name: 'Travail', value: 40 },
  { name: 'Études', value: 30 },
  { name: 'Personnel', value: 20 },
  { name: 'Autre', value: 10 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const AnalyticsPage = () => {
  const [activeTab, setActiveTab] = useState('insights');
  const isMobile = useIsMobile();

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
              Insights IA
            </TabsTrigger>
            <TabsTrigger value="productivity" className="flex items-center justify-center">
              <Activity className="mr-2 h-4 w-4" />
              Productivité
            </TabsTrigger>
            <TabsTrigger value="habits" className="flex items-center justify-center">
              <Target className="mr-2 h-4 w-4" />
              Habitudes
            </TabsTrigger>
            <TabsTrigger value="ai" className="flex items-center justify-center">
              <MessageSquare className="mr-2 h-4 w-4" />
              Assistant IA
            </TabsTrigger>
          </TabsList>

          <TabsContent value="insights" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <AIInsightCard
                title="Productivité optimale"
                description="Vos sessions de travail sont plus efficaces le matin. Essayez de planifier vos tâches importantes avant midi."
                type="productivity"
              />
              
              <AIInsightCard
                title="Habitude en progression"
                description="Votre habitude 'Méditation' est en bonne voie ! Vous avez été constant les 5 derniers jours."
                type="habits"
              />
              
              <AIInsightCard
                title="Objectif proche"
                description="Vous êtes à 80% de votre objectif 'Terminer le projet X'. Continuez, plus que quelques tâches !"
                type="goals"
              />
              
              <AIInsightCard
                title="Conseil de focus"
                description="Essayez la technique Pomodoro (25min de travail/5min de pause) pour améliorer votre concentration."
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
                </CardContent>
              </Card>

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
                </CardContent>
              </Card>
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
                  <div className="h-[300px] flex items-center justify-center">
                    <p className="text-muted-foreground">Commencez à suivre vos habitudes pour voir votre progression</p>
                  </div>
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
                  <div className="h-[300px] flex items-center justify-center">
                    <p className="text-muted-foreground">Complétez des habitudes pour générer des statistiques</p>
                  </div>
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
                  <p className="text-sm">Vous n'avez pas encore assez de données pour générer des insights personnalisés. Voici quelques conseils généraux :</p>
                  
                  <ul className="list-disc pl-5 space-y-2 text-sm">
                    <li>Commencez par des habitudes simples et faciles à maintenir</li>
                    <li>Associez de nouvelles habitudes à des habitudes existantes</li>
                    <li>Suivez votre progression quotidiennement</li>
                    <li>Célébrez vos petites victoires</li>
                  </ul>
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
