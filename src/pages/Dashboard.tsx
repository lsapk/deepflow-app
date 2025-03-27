
import React, { useEffect, useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { HabitsWidget } from '@/components/habits/HabitsWidget';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CalendarClock, CheckSquare, Clock, ListTodo, Plus, BookOpen, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

const Dashboard = () => {
  const { currentUser, userProfile, isOnline } = useAuth();
  const displayName = userProfile?.display_name || currentUser?.displayName || 'Utilisateur';
  const navigate = useNavigate();
  
  const [taskCount, setTaskCount] = useState(4);
  const [todayTaskCount, setTodayTaskCount] = useState(2);
  const [habitsStats, setHabitsStats] = useState({ completed: 3, total: 5 });
  const [focusStats, setFocusStats] = useState({ duration: '1h 20m', sessions: 4 });
  
  useEffect(() => {
    // Simuler le chargement des données pour cette démonstration
    const loadDashboardData = async () => {
      try {
        // En production, nous chargerions les données réelles depuis Supabase ou le stockage local
        console.log('Chargement des données du tableau de bord...');
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
      }
    };
    
    loadDashboardData();
  }, [currentUser]);

  const mainFeatures = [
    {
      title: "Tâches",
      icon: CheckSquare,
      path: "/tasks",
      color: "bg-green-600 hover:bg-green-700 text-white"
    },
    {
      title: "Focus",
      icon: Clock,
      path: "/focus",
      color: "bg-purple-600 hover:bg-purple-700 text-white"
    },
    {
      title: "Habitudes",
      icon: ListTodo,
      path: "/habits",
      color: "bg-orange-600 hover:bg-orange-700 text-white"
    },
    {
      title: "Journal",
      icon: BookOpen,
      path: "/journal",
      color: "bg-pink-600 hover:bg-pink-700 text-white"
    },
    {
      title: "Calendrier",
      icon: Calendar,
      path: "/planning",
      color: "bg-indigo-600 hover:bg-indigo-700 text-white"
    }
  ];

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

  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <MainLayout>
      <motion.div 
        className="space-y-6"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Bonjour, {displayName}</h1>
            <p className="text-muted-foreground">
              Voici le résumé de vos activités et tâches pour aujourd'hui
            </p>
          </div>
          
          <Button 
            onClick={() => navigate('/tasks')} 
            className="mt-4 md:mt-0 bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="mr-2 h-4 w-4" /> Nouvelle tâche
          </Button>
        </motion.div>

        {/* Section d'accès rapide */}
        <motion.div variants={itemVariants} className="mt-6">
          <h2 className="text-xl font-semibold mb-4">Accès rapide</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {mainFeatures.map((feature) => (
              <Button
                key={feature.title}
                onClick={() => navigate(feature.path)}
                className={`h-24 ${feature.color} flex flex-col items-center justify-center space-y-2 rounded-xl shadow-lg`}
              >
                <feature.icon className="h-8 w-8" />
                <span className="font-medium">{feature.title}</span>
              </Button>
            ))}
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tâches en cours</CardTitle>
              <CheckSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{taskCount}</div>
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  {todayTaskCount} tâches à faire aujourd'hui
                </p>
                <Button variant="ghost" size="sm" onClick={() => navigate('/tasks')}>
                  Voir
                </Button>
              </div>
            </CardContent>
          </Card>
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Habitudes complétées</CardTitle>
              <ListTodo className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{habitsStats.completed}/{habitsStats.total}</div>
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  +20.1% par rapport à la semaine dernière
                </p>
                <Button variant="ghost" size="sm" onClick={() => navigate('/habits')}>
                  Voir
                </Button>
              </div>
            </CardContent>
          </Card>
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Focus aujourd'hui</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{focusStats.duration}</div>
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  {focusStats.sessions} sessions de concentration
                </p>
                <Button variant="ghost" size="sm" onClick={() => navigate('/focus')}>
                  Voir
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants} className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-4 hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle>Aperçu de la semaine</CardTitle>
              <CardDescription>
                Visualisez la répartition de vos tâches et focus
              </CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
              <div className="h-[200px] flex flex-col items-center justify-center bg-muted rounded-md text-muted-foreground">
                <p className="mb-4">Graphique hebdomadaire (Fonctionnalité en développement)</p>
                <Button variant="outline" onClick={() => navigate('/planning')}>
                  <CalendarClock className="mr-2 h-4 w-4" />
                  Voir planning complet
                </Button>
              </div>
            </CardContent>
          </Card>
          <Card className="col-span-3 hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle>Vos habitudes</CardTitle>
              <CardDescription>
                Progression des habitudes régulières
              </CardDescription>
            </CardHeader>
            <CardContent>
              <HabitsWidget />
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </MainLayout>
  );
};

export default Dashboard;
