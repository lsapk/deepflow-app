import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { SelectValue, SelectTrigger, SelectContent, SelectItem, Select } from '@/components/ui/select';
import { AreaChart, BarChart, LineChart, PieChart, Pie, Area, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import AIAssistant from '@/components/analytics/AIAssistant';
import { AIInsightCard } from '@/components/analytics/AIInsightCard';
import { toast } from '@/hooks/use-toast';

const productivityData = [
  { day: 'Lun', tasks: 4, focus: 120, score: 85 },
  { day: 'Mar', tasks: 6, focus: 90, score: 78 },
  { day: 'Mer', tasks: 5, focus: 150, score: 92 },
  { day: 'Jeu', tasks: 3, focus: 80, score: 71 },
  { day: 'Ven', tasks: 7, focus: 180, score: 95 },
  { day: 'Sam', tasks: 2, focus: 60, score: 65 },
  { day: 'Dim', tasks: 1, focus: 30, score: 58 },
];

const habitsComplianceData = [
  { name: 'Complétées', value: 72, color: '#4ade80' },
  { name: 'Manquées', value: 28, color: '#f87171' },
];

const focusSessionsData = [
  { name: 'Lun', sessions: 2, duration: 45 },
  { name: 'Mar', sessions: 3, duration: 75 },
  { name: 'Mer', sessions: 4, duration: 100 },
  { name: 'Jeu', sessions: 2, duration: 50 },
  { name: 'Ven', sessions: 5, duration: 125 },
  { name: 'Sam', sessions: 1, duration: 25 },
  { name: 'Dim', sessions: 0, duration: 0 },
];

const taskCategoryData = [
  { name: 'Travail', value: 45, color: '#60a5fa' },
  { name: 'Personnel', value: 30, color: '#c084fc' },
  { name: 'Santé', value: 15, color: '#4ade80' },
  { name: 'Loisirs', value: 10, color: '#f97316' },
];

const timeUsageData = [
  { name: 'Focus', value: 25, color: '#60a5fa' },
  { name: 'Tâches', value: 40, color: '#c084fc' },
  { name: 'Journal', value: 10, color: '#4ade80' },
  { name: 'Planification', value: 15, color: '#f97316' },
  { name: 'Autre', value: 10, color: '#a1a1aa' },
];

const moodData = [
  { day: 'Lun', mood: 3 },
  { day: 'Mar', mood: 4 },
  { day: 'Mer', mood: 5 },
  { day: 'Jeu', mood: 2 },
  { day: 'Ven', mood: 4 },
  { day: 'Sam', mood: 5 },
  { day: 'Dim', mood: 4 },
];

const getMoodText = (mood: number) => {
  switch (mood) {
    case 1: return 'Terrible';
    case 2: return 'Mauvais';
    case 3: return 'Neutre';
    case 4: return 'Bien';
    case 5: return 'Excellent';
    default: return 'Inconnu';
  }
};

const getMoodColor = (mood: number) => {
  switch (mood) {
    case 1: return '#ef4444';
    case 2: return '#f97316';
    case 3: return '#facc15';
    case 4: return '#84cc16';
    case 5: return '#10b981';
    default: return '#a1a1aa';
  }
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background border border-border p-2 rounded-md shadow-md">
        <p className="font-medium">{`${label}`}</p>
        {payload.map((entry: any, index: number) => (
          <p key={`item-${index}`} style={{ color: entry.color || entry.fill }}>
            {`${entry.name}: ${entry.value}`}
          </p>
        ))}
      </div>
    );
  }

  return null;
};

const MoodTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const mood = payload[0].value;
    return (
      <div className="bg-background border border-border p-2 rounded-md shadow-md">
        <p className="font-medium">{`${label}`}</p>
        <p style={{ color: getMoodColor(mood) }}>
          {`Humeur: ${getMoodText(mood)}`}
        </p>
      </div>
    );
  }

  return null;
};

const RenderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name }: any) => {
  const RADIAN = Math.PI / 180;
  const radius = 25 + innerRadius + (outerRadius - innerRadius);
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text x={x} y={y} fill="#888888" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
      {`${name} (${(percent * 100).toFixed(0)}%)`}
    </text>
  );
};

const AnalyticsPage = () => {
  const { currentUser, userProfile } = useAuth();
  const [timeFrame, setTimeFrame] = useState('week');
  const [dataLoaded, setDataLoaded] = useState(false);
  const [showAIInsights, setShowAIInsights] = useState(true);
  const [aiInsights, setAiInsights] = useState<{title: string, content: string}[]>([
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
  ]);

  useEffect(() => {
    const loadData = setTimeout(() => {
      setDataLoaded(true);
    }, 500);

    return () => clearTimeout(loadData);
  }, []);

  const displayName = userProfile?.display_name || currentUser?.displayName || 'Utilisateur';

  const handleAIAssistantToggle = () => {
    setShowAIInsights(!showAIInsights);
    toast({
      title: showAIInsights ? "Assistant IA masqué" : "Assistant IA affiché",
      description: showAIInsights ? "L'assistant IA a été masqué" : "Vous pouvez maintenant interagir avec l'assistant IA",
    });
  };

  const handleInsightClick = (insight: {title: string, content: string}) => {
    toast({
      title: insight.title,
      description: "Détails de l'insight chargés",
    });
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Analytics et Insights</h1>
            <p className="text-muted-foreground">
              Visualisez et comprenez vos données pour optimiser votre productivité
            </p>
          </div>
          <div className="flex items-center mt-4 md:mt-0 space-x-4">
            <Select value={timeFrame} onValueChange={setTimeFrame}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Période" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="day">Aujourd'hui</SelectItem>
                <SelectItem value="week">Cette semaine</SelectItem>
                <SelectItem value="month">Ce mois</SelectItem>
                <SelectItem value="year">Cette année</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <AIInsightCard 
            title="IA Assistant" 
            description="Analysez vos données avec l'assistant IA"
            onClick={handleAIAssistantToggle}
          />
          
          {aiInsights.map((insight, index) => (
            <AIInsightCard 
              key={index}
              title={insight.title}
              description={insight.content}
              onClick={() => handleInsightClick(insight)}
            />
          ))}
        </div>

        {showAIInsights && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Assistant IA</CardTitle>
              <CardDescription>
                Posez des questions sur vos données et obtenez des insights personnalisés
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AIAssistant />
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Vue générale</TabsTrigger>
            <TabsTrigger value="tasks">Tâches</TabsTrigger>
            <TabsTrigger value="habits">Habitudes</TabsTrigger>
            <TabsTrigger value="focus">Focus</TabsTrigger>
            <TabsTrigger value="journal">Journal</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Score de Productivité</CardTitle>
                  <CardDescription>
                    Évolution de votre productivité au fil du temps
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {dataLoaded ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart
                        data={productivityData}
                        margin={{
                          top: 5,
                          right: 30,
                          left: 20,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="day" />
                        <YAxis />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        <Line type="monotone" dataKey="score" stroke="#8884d8" activeDot={{ r: 8 }} name="Score" />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[300px] flex items-center justify-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Utilisation du Temps</CardTitle>
                  <CardDescription>
                    Répartition de votre temps entre les différentes activités
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {dataLoaded ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={timeUsageData}
                          cx="50%"
                          cy="50%"
                          labelLine={true}
                          label={RenderCustomizedLabel}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {timeUsageData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[300px] flex items-center justify-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Activités Hebdomadaires</CardTitle>
                <CardDescription>
                  Tâches complétées et minutes de focus par jour
                </CardDescription>
              </CardHeader>
              <CardContent>
                {dataLoaded ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                      data={productivityData}
                      margin={{
                        top: 20,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                      <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Bar yAxisId="left" dataKey="tasks" name="Tâches" fill="#8884d8" />
                      <Bar yAxisId="right" dataKey="focus" name="Focus (min)" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[300px] flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="tasks" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Catégories de Tâches</CardTitle>
                  <CardDescription>
                    Répartition de vos tâches par catégorie
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {dataLoaded ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={taskCategoryData}
                          cx="50%"
                          cy="50%"
                          labelLine={true}
                          label={RenderCustomizedLabel}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {taskCategoryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[300px] flex items-center justify-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Tâches par Jour</CardTitle>
                  <CardDescription>
                    Nombre de tâches complétées chaque jour
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {dataLoaded ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart
                        data={productivityData}
                        margin={{
                          top: 5,
                          right: 30,
                          left: 20,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="day" />
                        <YAxis />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        <Bar dataKey="tasks" name="Tâches complétées" fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[300px] flex items-center justify-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="habits" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Suivi des Habitudes</CardTitle>
                  <CardDescription>
                    Taux de complétion des habitudes
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {dataLoaded ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={habitsComplianceData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {habitsComplianceData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[300px] flex items-center justify-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Progrès des Habitudes</CardTitle>
                  <CardDescription>
                    Évolution du taux de complétion au fil du temps
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {dataLoaded ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart
                        data={[
                          { day: 'Semaine 1', rate: 65 },
                          { day: 'Semaine 2', rate: 68 },
                          { day: 'Semaine 3', rate: 70 },
                          { day: 'Semaine 4', rate: 72 },
                        ]}
                        margin={{
                          top: 10,
                          right: 30,
                          left: 0,
                          bottom: 0,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="day" />
                        <YAxis />
                        <Tooltip content={<CustomTooltip />} />
                        <Area type="monotone" dataKey="rate" stroke="#4ade80" fill="#4ade8080" name="Taux de complétion (%)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[300px] flex items-center justify-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="focus" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Sessions de Focus</CardTitle>
                  <CardDescription>
                    Nombre de sessions par jour
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {dataLoaded ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart
                        data={focusSessionsData}
                        margin={{
                          top: 5,
                          right: 30,
                          left: 20,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        <Bar dataKey="sessions" name="Sessions" fill="#60a5fa" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[300px] flex items-center justify-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Durée de Focus</CardTitle>
                  <CardDescription>
                    Minutes de focus par jour
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {dataLoaded ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart
                        data={focusSessionsData}
                        margin={{
                          top: 10,
                          right: 30,
                          left: 0,
                          bottom: 0,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip content={<CustomTooltip />} />
                        <Area type="monotone" dataKey="duration" stroke="#60a5fa" fill="#60a5fa80" name="Minutes" />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[300px] flex items-center justify-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="journal" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Suivi de l'Humeur</CardTitle>
                <CardDescription>
                  Évolution de votre humeur au fil du temps
                </CardDescription>
              </CardHeader>
              <CardContent>
                {dataLoaded ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart
                      data={moodData}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis domain={[1, 5]} ticks={[1, 2, 3, 4, 5]} />
                      <Tooltip content={<MoodTooltip />} />
                      <Line 
                        type="monotone" 
                        dataKey="mood" 
                        stroke="#10b981" 
                        activeDot={{ r: 8 }} 
                        name="Humeur" 
                        dot={{ stroke: '#10b981', strokeWidth: 2, r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[300px] flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default AnalyticsPage;
