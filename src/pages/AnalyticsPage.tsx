
import React, { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, Calendar, ArrowRight, Activity, 
  Target, Sparkles, BookOpen, BarChart2, Brain 
} from 'lucide-react';
import { AIInsightCard } from '@/components/analytics/AIInsightCard';
import AIAssistant from '@/components/analytics/AIAssistant';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const AnalyticsPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState("insights");

  // Current date for the "last updated" information
  const now = new Date();
  const formattedDate = format(now, "'Mis à jour il y a moins d'une minute'");

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Analyses</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Suivez vos tendances et découvrez des insights personnalisés
          </p>
        </div>

        <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-8 grid grid-cols-4 md:w-fit">
            <TabsTrigger value="insights" className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              <span>Insights IA</span>
            </TabsTrigger>
            <TabsTrigger value="productivity" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              <span>Productivité</span>
            </TabsTrigger>
            <TabsTrigger value="habits" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              <span>Habitudes</span>
            </TabsTrigger>
            <TabsTrigger value="assistant" className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              <span>Assistant IA</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="insights">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InsightCard 
                title="Productivité optimale"
                description="Vos sessions de travail sont plus efficaces le matin. Essayez de planifier vos tâches importantes avant midi."
                lastUpdated={formattedDate}
                category="Productivité"
                value="15%"
                valueLabel="Votre productivité a augmenté de 15% cette semaine"
                trend="up"
                icon={<Activity />}
                advice="Conseil: Continuez avec vos sessions de focus quotidiennes"
                badgeLabel="Haute"
                badgeColor="bg-red-100 text-red-700"
              />
              
              <InsightCard 
                title="Habitude en progression"
                description="Votre habitude 'Méditation' est en bonne voie ! Vous avez été constant les 5 derniers jours."
                lastUpdated={formattedDate}
                category="Habitudes"
                value="7%"
                valueLabel="Vous avez maintenu votre habitude de lecture pendant 7 jours consécutifs"
                trend="up"
                icon={<BookOpen />}
                advice="Conseil: Essayez d'augmenter légèrement votre durée de lecture"
                badgeLabel="Moyenne"
                badgeColor="bg-yellow-100 text-yellow-700"
              />
              
              <InsightCard 
                title="Objectif proche"
                description="Vous êtes à 80% de votre objectif 'Terminer le projet X'. Continuez, plus que quelques tâches !"
                lastUpdated={formattedDate}
                category="Objectifs"
                value="60%"
                valueLabel="Vous êtes à 60% de votre objectif mensuel principal"
                trend="neutral"
                icon={<Target />}
                advice="Conseil: Concentrez-vous sur les tâches à forte valeur pour progresser plus rapidement"
                badgeLabel="Haute"
                badgeColor="bg-red-100 text-red-700"
              />
              
              <InsightCard 
                title="Conseil de focus"
                description="Essayez la technique Pomodoro (25min de travail/5min de pause) pour améliorer votre concentration."
                lastUpdated={formattedDate}
                category="Productivité"
                value="15%"
                valueLabel="Votre productivité a augmenté de 15% cette semaine"
                trend="up"
                icon={<Activity />}
                advice="Conseil: Continuez avec vos sessions de focus quotidiennes"
                badgeLabel="Haute"
                badgeColor="bg-red-100 text-red-700"
                extraContent={
                  <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-md">
                    <h4 className="font-medium mb-2">Habitudes</h4>
                    <p className="text-sm">Vous avez maintenu votre habitude de lecture pendant 7 jours consécutifs</p>
                    <Badge className="mt-2" variant="outline">Moyenne</Badge>
                  </div>
                }
              />
            </div>
          </TabsContent>

          <TabsContent value="productivity">
            <div className="space-y-6">
              <AIInsightCard 
                title="Insights de productivité" 
                description="Analyses basées sur vos tâches complétées" 
                type="productivity" 
              />
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl flex items-center">
                    <BarChart2 className="h-5 w-5 mr-2 text-primary" />
                    Tendances de productivité
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="h-64 flex items-center justify-center">
                    <p className="text-gray-500">Des graphiques de productivité détaillés apparaîtront ici</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="habits">
            <div className="space-y-6">
              <AIInsightCard 
                title="Insights d'habitudes" 
                description="Analyses basées sur vos habitudes régulières" 
                type="habits" 
              />
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl flex items-center">
                    <BookOpen className="h-5 w-5 mr-2 text-primary" />
                    Suivi des habitudes
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="h-64 flex items-center justify-center">
                    <p className="text-gray-500">Le suivi détaillé de vos habitudes apparaîtra ici</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="assistant">
            <Card className="h-[600px]">
              <CardContent className="p-0 h-full">
                <AIAssistant 
                  initialMessage="Bonjour ! Je suis votre assistant IA personnel. Je peux vous aider à analyser vos données de productivité et répondre à vos questions. N'hésitez pas à me demander des conseils sur votre organisation, vos habitudes ou votre concentration."
                  maxHistory={10}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

// Composant pour les cartes d'insights
interface InsightCardProps {
  title: string;
  description: string;
  lastUpdated: string;
  category: string;
  value: string;
  valueLabel: string;
  trend: 'up' | 'down' | 'neutral';
  icon: React.ReactNode;
  advice: string;
  badgeLabel: string;
  badgeColor: string;
  extraContent?: React.ReactNode;
}

const InsightCard: React.FC<InsightCardProps> = ({
  title,
  description,
  lastUpdated,
  category,
  value,
  valueLabel,
  trend,
  icon,
  advice,
  badgeLabel,
  badgeColor,
  extraContent
}) => {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        <div className="flex justify-between mb-4">
          <div className="flex items-center space-x-2 text-primary">
            <Sparkles className="h-5 w-5" />
            <h3 className="font-semibold text-lg">{title}</h3>
          </div>
          <div className="text-xs text-gray-500">
            {lastUpdated}
          </div>
        </div>
        
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
          {description}
        </p>

        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-md">
          <div className="flex items-center gap-2 mb-2">
            {React.cloneElement(icon as React.ReactElement, { className: "h-4 w-4 text-primary" })}
            <h4 className="font-medium">{category}</h4>
            <div className={`ml-auto text-xs py-1 px-2 rounded-full ${badgeColor}`}>
              {badgeLabel}
            </div>
          </div>
          
          <p className="text-sm mb-2">{valueLabel}</p>
          
          <div className="flex items-center gap-2 text-sm font-medium">
            {trend === 'up' ? (
              <TrendingUp className="h-4 w-4 text-green-500" />
            ) : trend === 'down' ? (
              <TrendingUp className="h-4 w-4 text-red-500 transform rotate-180" />
            ) : (
              <span className="h-4 w-4 flex items-center justify-center">-</span>
            )}
            <span className={trend === 'up' ? 'text-green-500' : trend === 'down' ? 'text-red-500' : ''}>
              {value}
            </span>
          </div>
        </div>
        
        <p className="text-xs text-gray-500 mt-4 italic">
          {advice}
        </p>
        
        {extraContent}
        
        <Button 
          variant="link" 
          className="mt-4 pl-0 text-primary flex items-center"
          size="sm"
        >
          <span>Analyse complète</span>
          <ArrowRight className="h-4 w-4 ml-1" />
        </Button>
      </CardContent>
    </Card>
  );
};

export default AnalyticsPage;
