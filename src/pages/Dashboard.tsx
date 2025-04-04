
import React, { useEffect, useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { HabitsWidget } from '@/components/habits/HabitsWidget';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { CalendarClock, CheckSquare, Clock, ListTodo, BookOpen, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import { DashboardShortcuts } from '@/components/DashboardShortcuts';
import { DashboardActivity } from '@/components/DashboardActivity';
import { getDoc, doc, collection, query, where, limit, getDocs } from 'firebase/firestore';
import { db } from '@/services/firebase';
import { getAllTasks } from '@/services/taskService';
import { getAllHabits } from '@/services/habitService';
import { getFocusSessions } from '@/services/focusService';

const Dashboard = () => {
  const { currentUser, userProfile } = useAuth();
  const displayName = userProfile?.display_name || currentUser?.displayName || 'Utilisateur';
  const navigate = useNavigate();
  
  const [taskCount, setTaskCount] = useState(0);
  const [todayTaskCount, setTodayTaskCount] = useState(0);
  const [habitsStats, setHabitsStats] = useState({ completed: 0, total: 0 });
  const [focusStats, setFocusStats] = useState({ duration: '0h 0m', sessions: 0 });
  const [dataLoaded, setDataLoaded] = useState(false);
  
  useEffect(() => {
    // Charger les données réelles du tableau de bord
    const loadDashboardData = async () => {
      try {
        if (currentUser) {
          // Charger les tâches
          const tasks = await getAllTasks();
          setTaskCount(tasks.length);
          
          // Calculer les tâches pour aujourd'hui
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const todayTasks = tasks.filter(task => {
            if (!task.due_date) return false;
            const taskDate = new Date(task.due_date);
            taskDate.setHours(0, 0, 0, 0);
            return taskDate.getTime() === today.getTime();
          });
          setTodayTaskCount(todayTasks.length);
          
          // Charger les habitudes
          const habits = await getAllHabits();
          const completedHabits = habits.filter(habit => habit.completed_today).length;
          setHabitsStats({
            completed: completedHabits,
            total: habits.length
          });
          
          // Charger les sessions focus
          try {
            if (currentUser) {
              const userFocusRef = doc(db, "userFocus", currentUser.uid);
              const userFocusDoc = await getDoc(userFocusRef);
              
              if (userFocusDoc.exists()) {
                const focusData = userFocusDoc.data();
                const totalMinutes = focusData.totalTimeMinutes || 0;
                const hours = Math.floor(totalMinutes / 60);
                const minutes = totalMinutes % 60;
                
                setFocusStats({
                  duration: `${hours}h ${minutes}m`,
                  sessions: focusData.completedSessions || 0
                });
              }
              
              // Obtenir les sessions de focus pour aujourd'hui
              const todaySessions = await getFocusSessions(currentUser.uid, today);
              if (todaySessions) {
                setFocusStats(prev => ({
                  ...prev,
                  sessions: todaySessions.length
                }));
              }
            }
          } catch (error) {
            console.error("Erreur lors du chargement des données de focus :", error);
          }
          
          setDataLoaded(true);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
        setDataLoaded(true);
      }
    };
    
    loadDashboardData();
  }, [currentUser]);

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
        </motion.div>

        {/* Section d'accès rapide */}
        <DashboardShortcuts />

        {/* Section d'activité */}
        <DashboardActivity 
          taskCount={taskCount}
          todayTaskCount={todayTaskCount}
          habitsStats={habitsStats}
          focusStats={focusStats}
          dataLoaded={dataLoaded}
        />

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
