
import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { SelectValue, SelectTrigger, SelectContent, SelectItem, Select } from '@/components/ui/select';
import AIAssistant from '@/components/analytics/AIAssistant';
import { toast } from '@/hooks/use-toast';
import { defaultAIInsights } from '@/components/analytics/ChartData';
import { AIInsightsSection } from '@/components/analytics/AIInsightsSection';
import { OverviewTab } from '@/components/analytics/tabs/OverviewTab';
import { TasksTab } from '@/components/analytics/tabs/TasksTab';
import { HabitsTab } from '@/components/analytics/tabs/HabitsTab';
import { FocusTab } from '@/components/analytics/tabs/FocusTab';
import { JournalTab } from '@/components/analytics/tabs/JournalTab';

const AnalyticsPage = () => {
  const { currentUser, userProfile } = useAuth();
  const [timeFrame, setTimeFrame] = useState('week');
  const [dataLoaded, setDataLoaded] = useState(false);
  const [showAIInsights, setShowAIInsights] = useState(true);
  const [aiInsights, setAiInsights] = useState<{title: string, content: string}[]>(defaultAIInsights);

  useEffect(() => {
    const loadData = setTimeout(() => {
      setDataLoaded(true);
    }, 500);

    return () => clearTimeout(loadData);
  }, []);

  const displayName = userProfile?.display_name || currentUser?.displayName || 'Utilisateur';

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

        <AIInsightsSection 
          showAIInsights={showAIInsights} 
          setShowAIInsights={setShowAIInsights} 
          aiInsights={aiInsights} 
        />

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
            <OverviewTab dataLoaded={dataLoaded} />
          </TabsContent>
          
          <TabsContent value="tasks" className="space-y-4">
            <TasksTab dataLoaded={dataLoaded} />
          </TabsContent>
          
          <TabsContent value="habits" className="space-y-4">
            <HabitsTab dataLoaded={dataLoaded} />
          </TabsContent>
          
          <TabsContent value="focus" className="space-y-4">
            <FocusTab dataLoaded={dataLoaded} />
          </TabsContent>
          
          <TabsContent value="journal" className="space-y-4">
            <JournalTab dataLoaded={dataLoaded} />
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default AnalyticsPage;
