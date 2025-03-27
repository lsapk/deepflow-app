
import React, { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { CalendarClock, CheckSquare, Clock, ListTodo, Plus, Target, Sparkles, Calendar, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';
import { useIsMobile } from '@/hooks/use-mobile';
import { AIInsightCard } from '@/components/analytics/AIInsightCard';
import { useAuth } from '@/contexts/AuthContext';

const Index = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { currentUser } = useAuth();

  useEffect(() => {
    // Si l'utilisateur est connecté, le rediriger vers le tableau de bord
    if (currentUser) {
      navigate('/dashboard');
    }
  }, [currentUser, navigate]);

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

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  const featureButtons = [
    {
      title: "Tableau de bord",
      icon: Target,
      path: "/dashboard",
      color: "bg-blue-600 hover:bg-blue-700" 
    },
    {
      title: "Tâches",
      icon: CheckSquare,
      path: "/tasks",
      color: "bg-green-600 hover:bg-green-700"
    },
    {
      title: "Focus",
      icon: Clock,
      path: "/focus",
      color: "bg-purple-600 hover:bg-purple-700"
    },
    {
      title: "Habitudes",
      icon: ListTodo,
      path: "/habits",
      color: "bg-orange-600 hover:bg-orange-700"
    },
    {
      title: "Journal",
      icon: BookOpen,
      path: "/journal",
      color: "bg-pink-600 hover:bg-pink-700"
    },
    {
      title: "Calendrier",
      icon: Calendar,
      path: "/planning",
      color: "bg-indigo-600 hover:bg-indigo-700"
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col items-center justify-center text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Bienvenue sur DeepFlow</h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl">
          Votre assistant personnel pour améliorer votre productivité et votre bien-être
        </p>
        <div className="mt-8 flex gap-4">
          <Button 
            size="lg" 
            onClick={() => navigate('/signin')}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Se connecter
          </Button>
          <Button 
            size="lg" 
            variant="outline"
            onClick={() => navigate('/signup')}
          >
            S'inscrire
          </Button>
        </div>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-12"
      >
        {/* Raccourcis vers les fonctionnalités */}
        <motion.div variants={itemVariants} className="mt-8">
          <h2 className="text-3xl font-bold text-center mb-8">Accès rapide</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 max-w-4xl mx-auto">
            {featureButtons.map((feature) => (
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

        <motion.div variants={itemVariants}>
          <h2 className="text-3xl font-bold text-center mb-8">Fonctionnalités principales</h2>
          <div className={`grid ${isMobile ? 'grid-cols-1' : 'md:grid-cols-3'} gap-6`}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CheckSquare className="mr-2 h-5 w-5 text-blue-500" />
                  Gestion des tâches
                </CardTitle>
                <CardDescription>
                  Organisez et suivez vos tâches efficacement
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-400">
                  Créez des listes de tâches, définissez des priorités, et suivez votre progression pour rester organisé et productif.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <ListTodo className="mr-2 h-5 w-5 text-green-500" />
                  Suivi d'habitudes
                </CardTitle>
                <CardDescription>
                  Développez de bonnes habitudes jour après jour
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-400">
                  Suivez vos habitudes quotidiennes et hebdomadaires, maintenez des séries et restez motivé pour atteindre vos objectifs.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="mr-2 h-5 w-5 text-red-500" />
                  Sessions Focus
                </CardTitle>
                <CardDescription>
                  Améliorez votre concentration et productivité
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-400">
                  Utilisez la technique Pomodoro pour des sessions de travail concentrées, avec des pauses planifiées pour maximiser votre efficacité.
                </p>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        <motion.div variants={itemVariants}>
          <h2 className="text-3xl font-bold text-center mb-8 flex items-center justify-center">
            <Sparkles className="mr-2 h-6 w-6 text-yellow-500" />
            IA au service de votre productivité
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <AIInsightCard
              title="Analyses personnalisées"
              description="Notre IA analyse vos habitudes de travail et vous propose des insights pour améliorer votre productivité."
              type="productivity"
            />
            
            <AIInsightCard
              title="Suggestions intelligentes"
              description="Recevez des recommandations adaptées à votre rythme et à vos préférences de travail."
              type="habits"
            />
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="text-center pt-8">
          <h2 className="text-3xl font-bold mb-6">Prêt à commencer?</h2>
          <Button 
            size="lg" 
            onClick={() => navigate('/signup')}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Créer un compte gratuitement
          </Button>
          <p className="mt-4 text-gray-500 dark:text-gray-400">
            Rejoignez des milliers d'utilisateurs qui améliorent leur productivité chaque jour
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Index;
