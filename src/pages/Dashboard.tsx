
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  Calendar, 
  CheckSquare, 
  Clock, 
  ListTodo, 
  MessageCircle, 
  Rocket, 
  Target, 
  Trophy, 
  Zap 
} from 'lucide-react';

const mockChartData = [
  { day: 'Lun', productivity: 65 },
  { day: 'Mar', productivity: 59 },
  { day: 'Mer', productivity: 80 },
  { day: 'Jeu', productivity: 81 },
  { day: 'Ven', productivity: 56 },
  { day: 'Sam', productivity: 55 },
  { day: 'Dim', productivity: 40 },
];

const quickActions = [
  { 
    icon: <ListTodo size={18} />,
    label: 'Nouvelle tâche',
    action: () => toast.success('Nouvelle tâche créée!')
  },
  { 
    icon: <Calendar size={18} />,
    label: 'Ajouter une habitude',
    action: () => toast.success('Nouvelle habitude ajoutée!')
  },
  { 
    icon: <MessageCircle size={18} />,
    label: 'Note rapide',
    action: () => toast.success('Note enregistrée!')
  },
  { 
    icon: <Zap size={18} />,
    label: 'Démarrer focus',
    action: () => toast.success('Session focus démarrée!')
  },
];

const Dashboard = () => {
  const [tasks] = useState([
    { id: 1, text: 'Préparer la présentation', completed: false },
    { id: 2, text: 'Appeler le client', completed: true },
    { id: 3, text: 'Réviser le document', completed: false },
  ]);

  const [habits] = useState([
    { id: 1, name: 'Méditation', progress: 5, target: 7 },
    { id: 2, name: 'Lecture', progress: 3, target: 5 },
    { id: 3, name: 'Exercice', progress: 2, target: 4 },
  ]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase();
  };

  return (
    <MainLayout>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        <motion.div variants={itemVariants}>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-1">Bonjour, Nicolas</h1>
              <p className="text-gray-500 dark:text-gray-400">
                Voici votre résumé pour aujourd'hui
              </p>
            </div>
            <div className="mt-4 md:mt-0 flex flex-wrap gap-2">
              {quickActions.map((action, index) => (
                <Button
                  key={action.label}
                  variant="outline"
                  size="sm"
                  onClick={action.action}
                  className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
                >
                  {action.icon}
                  <span className="ml-2">{action.label}</span>
                </Button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Overview Cards */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="feature-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium flex items-center">
                <CheckSquare size={18} className="mr-2 text-blue-500" />
                Tâches
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3/8</div>
              <p className="text-sm text-muted-foreground">
                3 tâches terminées aujourd'hui
              </p>
            </CardContent>
          </Card>
          
          <Card className="feature-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium flex items-center">
                <Calendar size={18} className="mr-2 text-green-500" />
                Habitudes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">4/5</div>
              <p className="text-sm text-muted-foreground">
                4 habitudes réalisées aujourd'hui
              </p>
            </CardContent>
          </Card>
          
          <Card className="feature-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium flex items-center">
                <Clock size={18} className="mr-2 text-purple-500" />
                Focus
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2h 15m</div>
              <p className="text-sm text-muted-foreground">
                Temps de focus aujourd'hui
              </p>
            </CardContent>
          </Card>
          
          <Card className="feature-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium flex items-center">
                <Trophy size={18} className="mr-2 text-amber-500" />
                Points
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">287</div>
              <p className="text-sm text-muted-foreground">
                +45 points aujourd'hui
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Tâches récentes */}
          <motion.div variants={itemVariants} className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Tâches récentes</CardTitle>
                <CardDescription>
                  Vos tâches à accomplir aujourd'hui
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {tasks.map(task => (
                    <li key={task.id} className="flex items-start p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <div className={`flex-shrink-0 h-5 w-5 rounded border mr-3 mt-0.5 flex items-center justify-center ${task.completed ? 'bg-blue-500 border-blue-500' : 'border-gray-300 dark:border-gray-600'}`}>
                        {task.completed && (
                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                        )}
                      </div>
                      <span className={task.completed ? 'line-through text-gray-500' : ''}>
                        {task.text}
                      </span>
                    </li>
                  ))}
                </ul>
                
                <Button variant="ghost" size="sm" className="w-full mt-4">
                  Voir toutes les tâches
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Suivi d'habitudes */}
          <motion.div variants={itemVariants} className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Suivi d'habitudes</CardTitle>
                <CardDescription>
                  Votre progression cette semaine
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4">
                  {habits.map(habit => (
                    <li key={habit.id} className="space-y-1">
                      <div className="flex justify-between items-center">
                        <span>{habit.name}</span>
                        <span className="text-sm text-gray-500">
                          {habit.progress}/{habit.target}
                        </span>
                      </div>
                      <Progress value={(habit.progress / habit.target) * 100} className="h-2" />
                    </li>
                  ))}
                </ul>
                
                <Button variant="ghost" size="sm" className="w-full mt-4">
                  Gérer les habitudes
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Statistiques de productivité */}
          <motion.div variants={itemVariants} className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-xl">
                  <BarChart3 size={18} className="mr-2" />
                  Productivité
                </CardTitle>
                <CardDescription>
                  Vue d'ensemble de cette semaine
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[240px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={mockChartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="productivity" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Objectifs */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-xl">
                <Target size={18} className="mr-2" />
                Objectifs en cours
              </CardTitle>
              <CardDescription>
                Votre progression vers vos objectifs à long terme
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center mr-3">
                        <Rocket size={20} className="text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <h4 className="font-medium">Lancer mon site web personnel</h4>
                        <p className="text-sm text-gray-500">Échéance: dans 2 semaines</p>
                      </div>
                    </div>
                    <span className="text-sm font-medium">65%</span>
                  </div>
                  <Progress value={65} className="h-2" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center mr-3">
                        <BookOpen size={20} className="text-purple-600 dark:text-purple-400" />
                      </div>
                      <div>
                        <h4 className="font-medium">Lire 20 livres cette année</h4>
                        <p className="text-sm text-gray-500">8/20 livres lus</p>
                      </div>
                    </div>
                    <span className="text-sm font-medium">40%</span>
                  </div>
                  <Progress value={40} className="h-2" />
                </div>
              </div>
              
              <Button variant="outline" size="sm" className="mt-6">
                Voir tous les objectifs
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </MainLayout>
  );
};

// Composant BookOpen pour l'icône manquante
const BookOpen = ({ size = 24, className = "" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
  </svg>
);

export default Dashboard;
