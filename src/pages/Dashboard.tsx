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
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format, subDays, addDays, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay } from 'date-fns';
import { fr } from 'date-fns/locale';

const Dashboard = () => {
  const { currentUser, userProfile } = useAuth();
  const displayName = userProfile?.display_name || currentUser?.displayName || 'Utilisateur';
  const navigate = useNavigate();
  
  const [taskCount, setTaskCount] = useState(0);
  const [todayTaskCount, setTodayTaskCount] = useState(0);
  const [habitsStats, setHabitsStats] = useState({ completed: 0, total: 0 });
  const [focusStats, setFocusStats] = useState({ duration: '0h 0m', sessions: 0 });
  const [dataLoaded, setDataLoaded] = useState(false);
  const [weeklyData, setWeeklyData] = useState<any[]>([]);
  
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        if (currentUser) {
          const tasks = await getAllTasks();
          setTaskCount(tasks.length);
          
          const today = new Date();
          const todayTasks = tasks.filter(task => {
            if (!task.due_date) return false;
            const taskDate = new Date(task.due_date);
            taskDate.setHours(0, 0, 0, 0);
            return taskDate.getTime() === today.getTime();
          });
          setTodayTaskCount(todayTasks.length);
          
          const habits = await getAllHabits();
          const completedHabits = habits.filter(habit => {
            if (!habit.last_completed) return false;
            const completedDate = new Date(habit.last_completed);
            completedDate.setHours(0, 0, 0, 0);
            return completedDate.getTime() === today.getTime();
          }).length;
          
          setHabitsStats({
            completed: completedHabits,
            total: habits.length
          });
          
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
    
    const loadWeeklyData = async () => {
      if (currentUser) {
        try {
          const today = new Date();
          const startOfCurrentWeek = startOfWeek(today, { weekStartsOn: 1 });
          const endOfCurrentWeek = endOfWeek(today, { weekStartsOn: 1 });
          
          const daysOfWeek = eachDayOfInterval({
            start: startOfCurrentWeek,
            end: endOfCurrentWeek
          });
          
          const tasks = await getAllTasks();
          const focusSessions = await getFocusSessions(currentUser.uid);
          
          const data = daysOfWeek.map(day => {
            const tasksForDay = tasks.filter(task => {
              if (!task.due_date) return false;
              return isSameDay(new Date(task.due_date), day);
            });
            
            const completedTasks = tasksForDay.filter(task => task.completed).length;
            
            const sessionsForDay = focusSessions ? focusSessions.filter(session => {
              if (!session.date) return false;
              return isSameDay(new Date(session.date), day);
            }) : [];
            
            const focusMinutes = sessionsForDay.reduce((total, session) => {
              return total + (session.duration_minutes || 0);
            }, 0);
            
            return {
              name: format(day, 'EEE', { locale: fr }),
              tasks: tasksForDay.length,
              completed: completedTasks,
              focus: focusMinutes
            };
          });
          
          setWeeklyData(data);
          
        } catch (error) {
          console.error('Error loading weekly data:', error);
        }
      }
    };
    
    loadDashboardData();
    loadWeeklyData();
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

        <DashboardShortcuts />

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
              {dataLoaded && weeklyData.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart
                    data={weeklyData}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 0,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="tasks" name="Tâches" fill="#8884d8" />
                    <Bar dataKey="completed" name="Terminées" fill="#82ca9d" />
                    <Bar dataKey="focus" name="Focus (min)" fill="#ffc658" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[200px] flex flex-col items-center justify-center bg-muted rounded-md text-muted-foreground">
                  <p className="mb-4">Chargement des données...</p>
                </div>
              )}
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
