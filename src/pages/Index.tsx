
import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { CalendarClock, CheckSquare, Clock, ListTodo, Plus, Target, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { useIsMobile } from '@/hooks/use-mobile';
import { AIInsightCard } from '@/components/analytics/AIInsightCard';

const Index = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: 'beforeChildren',
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
    },
  };

  return (
    <MainLayout>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-8"
      >
        {/* Quick Actions */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle>Actions rapides</CardTitle>
              <CardDescription>
                Accédez rapidement aux fonctionnalités essentielles
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className={`grid ${isMobile ? 'grid-cols-2' : 'grid-cols-4'} gap-4`}>
                <Button
                  variant="outline"
                  className="flex-col h-auto p-4 space-y-2"
                  onClick={() => navigate('/tasks')}
                >
                  <Plus className="h-5 w-5" />
                  <span>Nouvelle tâche</span>
                </Button>
                <Button
                  variant="outline"
                  className="flex-col h-auto p-4 space-y-2"
                  onClick={() => navigate('/habits')}
                >
                  <Plus className="h-5 w-5" />
                  <span>Ajouter une habitude</span>
                </Button>
                <Button
                  variant="outline"
                  className="flex-col h-auto p-4 space-y-2"
                  onClick={() => navigate('/journal')}
                >
                  <Plus className="h-5 w-5" />
                  <span>Note rapide</span>
                </Button>
                <Button
                  variant="outline"
                  className="flex-col h-auto p-4 space-y-2"
                  onClick={() => navigate('/focus')}
                >
                  <Clock className="h-5 w-5" />
                  <span>Démarrer focus</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* IA Insights */}
        <motion.div variants={itemVariants}>
          <h2 className="text-2xl font-bold flex items-center mb-4">
            <Sparkles className="mr-2 h-5 w-5 text-yellow-500" />
            Insights IA
          </h2>
          <div className="grid gap-4">
            <AIInsightCard
              title="Productivité optimale"
              content="Vos sessions de travail sont plus efficaces le matin. Essayez de planifier vos tâches importantes avant midi."
              type="productivity"
            />
            
            <AIInsightCard
              title="Rappel d'habitude"
              content="Vous n'avez pas complété votre habitude 'Méditation' depuis 3 jours. Un petit moment de méditation aujourd'hui ?"
              type="reminder"
            />
          </div>
        </motion.div>

        {/* Main Sections */}
        <div className={`grid ${isMobile ? 'grid-cols-1' : 'md:grid-cols-3'} gap-6`}>
          {/* Tasks */}
          <motion.div variants={itemVariants}>
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CheckSquare className="mr-2 h-5 w-5 text-blue-500" />
                  Tâches
                </CardTitle>
                <CardDescription>
                  Gérez vos tâches et suivez votre progression
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">Pas encore de tâches</p>
                <Button onClick={() => navigate('/tasks')} variant="outline" className="w-full">
                  <Plus className="mr-2 h-4 w-4" />
                  Ajouter une tâche
                </Button>
              </CardContent>
              <CardFooter>
                <Button variant="ghost" className="w-full" onClick={() => navigate('/tasks')}>
                  Voir toutes les tâches
                </Button>
              </CardFooter>
            </Card>
          </motion.div>

          {/* Habits */}
          <motion.div variants={itemVariants}>
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <ListTodo className="mr-2 h-5 w-5 text-green-500" />
                  Habitudes
                </CardTitle>
                <CardDescription>
                  Suivez vos habitudes quotidiennes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">Pas encore d'habitudes</p>
                <Button onClick={() => navigate('/habits')} variant="outline" className="w-full">
                  <Plus className="mr-2 h-4 w-4" />
                  Créer une habitude
                </Button>
              </CardContent>
              <CardFooter>
                <Button variant="ghost" className="w-full" onClick={() => navigate('/habits')}>
                  Gérer les habitudes
                </Button>
              </CardFooter>
            </Card>
          </motion.div>

          {/* Goals */}
          <motion.div variants={itemVariants}>
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="mr-2 h-5 w-5 text-purple-500" />
                  Objectifs
                </CardTitle>
                <CardDescription>
                  Définissez et suivez vos objectifs
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">Pas encore d'objectifs</p>
                <Button onClick={() => navigate('/goals')} variant="outline" className="w-full">
                  <Plus className="mr-2 h-4 w-4" />
                  Créer un objectif
                </Button>
              </CardContent>
              <CardFooter>
                <Button variant="ghost" className="w-full" onClick={() => navigate('/goals')}>
                  Voir tous les objectifs
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        </div>

        {/* Recent Activity (only on desktop) */}
        {!isMobile && (
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CalendarClock className="mr-2 h-5 w-5 text-orange-500" />
                  Activité récente
                </CardTitle>
                <CardDescription>
                  Votre activité des derniers jours
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <p>Pas d'activité récente</p>
                  <p className="text-sm mt-2">Commencez à utiliser DeepFlow pour voir votre activité ici</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </motion.div>
    </MainLayout>
  );
};

export default Index;
