import React, { useEffect, useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { doc, getDoc, setDoc, collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from '@/services/firebase';
import { 
  BarChart3, CheckSquare, BrainCircuit, Calendar, CheckCheck, ListTodo, Target, Clock, Plus, Edit3, FileText 
} from 'lucide-react';
import { HabitsWidget } from '@/components/habits/HabitsWidget';

interface Task {
  id: string;
  title: string;
  completed: boolean;
  dueDate?: string;
  priority: string;
}

interface Habit {
  id: string;
  title: string;
  streak: number;
  target: number;
  icon?: string;
}

interface Goal {
  id: string;
  title: string;
  progress: number;
  deadline?: string;
}

const Dashboard = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const getGreeting = () => {
      const hour = new Date().getHours();
      if (hour < 12) return 'Bonjour';
      if (hour < 18) return 'Bon après-midi';
      return 'Bonsoir';
    };

    setGreeting(getGreeting());
    
    const fetchDashboardData = async () => {
      if (!currentUser) return;
      
      try {
        setLoading(true);
        
        // Fetch tasks
        const tasksQuery = query(
          collection(db, 'tasks'), 
          where('userId', '==', currentUser.uid),
          where('completed', '==', false),
          orderBy('priority', 'desc'),
          limit(3)
        );
        
        const tasksSnapshot = await getDocs(tasksQuery);
        const tasksData = tasksSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Task[];
        
        setTasks(tasksData);
        
        // Fetch habits
        const habitsQuery = query(
          collection(db, 'habits'),
          where('userId', '==', currentUser.uid),
          orderBy('streak', 'desc'),
          limit(3)
        );
        
        const habitsSnapshot = await getDocs(habitsQuery);
        const habitsData = habitsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Habit[];
        
        setHabits(habitsData);
        
        // Fetch goals
        const goalsQuery = query(
          collection(db, 'goals'),
          where('userId', '==', currentUser.uid),
          orderBy('progress', 'asc'),
          limit(3)
        );
        
        const goalsSnapshot = await getDocs(goalsQuery);
        const goalsData = goalsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Goal[];
        
        setGoals(goalsData);
        
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [currentUser]);

  const handleNewTask = () => {
    navigate('/tasks');
    // Open task dialog after navigation
    setTimeout(() => {
      const addButton = document.querySelector('[data-testid="add-task-button"]');
      if (addButton instanceof HTMLElement) {
        addButton.click();
      } else {
        toast.success("Redirigé vers la page des tâches");
      }
    }, 100);
  };

  const handleNewHabit = () => {
    navigate('/habits');
    // Open habit dialog after navigation
    setTimeout(() => {
      const addButton = document.querySelector('[data-testid="add-habit-button"]');
      if (addButton instanceof HTMLElement) {
        addButton.click();
      } else {
        toast.success("Redirigé vers la page des habitudes");
      }
    }, 100);
  };

  const handleQuickNote = () => {
    navigate('/journal');
    setTimeout(() => {
      const addButton = document.querySelector('[data-testid="new-note-button"]');
      if (addButton instanceof HTMLElement) {
        addButton.click();
      } else {
        toast.success("Redirigé vers le journal");
      }
    }, 100);
  };

  const handleStartFocus = () => {
    navigate('/focus');
    toast.success("Prêt à commencer une session focus");
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">
            {greeting}, {currentUser?.displayName || 'Utilisateur'}
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Bienvenue sur votre tableau de bord personnel
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border-blue-100 dark:border-blue-900">
            <CardContent className="p-4 flex flex-col items-center text-center">
              <Button 
                onClick={handleNewTask} 
                variant="default" 
                className="w-full py-8 h-auto flex flex-col items-center bg-blue-600 hover:bg-blue-700"
              >
                <CheckSquare size={36} className="mb-2" />
                <span className="text-lg font-medium">Nouvelle tâche</span>
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 border-green-100 dark:border-green-900">
            <CardContent className="p-4 flex flex-col items-center text-center">
              <Button 
                onClick={handleNewHabit} 
                variant="default" 
                className="w-full py-8 h-auto flex flex-col items-center bg-green-600 hover:bg-green-700"
              >
                <CheckCheck size={36} className="mb-2" />
                <span className="text-lg font-medium">Ajouter une habitude</span>
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-950 dark:to-violet-950 border-purple-100 dark:border-purple-900">
            <CardContent className="p-4 flex flex-col items-center text-center">
              <Button 
                onClick={handleQuickNote} 
                variant="default" 
                className="w-full py-8 h-auto flex flex-col items-center bg-purple-600 hover:bg-purple-700"
              >
                <Edit3 size={36} className="mb-2" />
                <span className="text-lg font-medium">Note rapide</span>
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950 dark:to-orange-950 border-red-100 dark:border-red-900">
            <CardContent className="p-4 flex flex-col items-center text-center">
              <Button 
                onClick={handleStartFocus}
                variant="default" 
                className="w-full py-8 h-auto flex flex-col items-center bg-red-600 hover:bg-red-700"
              >
                <BrainCircuit size={36} className="mb-2" />
                <span className="text-lg font-medium">Démarrer Focus</span>
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-xl flex items-center">
                  <CheckSquare className="mr-2 h-5 w-5 text-blue-600" />
                  Tâches à faire
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={() => navigate('/tasks')} className="text-blue-600 dark:text-blue-400">
                  Voir tout
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="animate-pulse space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-12 bg-gray-200 dark:bg-gray-800 rounded"></div>
                  ))}
                </div>
              ) : tasks.length > 0 ? (
                <ul className="space-y-2">
                  {tasks.map(task => (
                    <li key={task.id} className="flex items-start p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                      <div className="w-full">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{task.title}</span>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            task.priority === 'high' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                            task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                            'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                          }`}>
                            {task.priority === 'high' ? 'Haute' : task.priority === 'medium' ? 'Moyenne' : 'Basse'}
                          </span>
                        </div>
                        {task.dueDate && (
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Échéance: {new Date(task.dueDate).toLocaleDateString('fr-FR')}
                          </div>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                  <ListTodo className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                  <p>Aucune tâche en cours</p>
                  <Button 
                    onClick={handleNewTask} 
                    size="sm" 
                    variant="outline" 
                    className="mt-2"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Ajouter une tâche
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-xl flex items-center">
                  <CheckCheck className="mr-2 h-5 w-5 text-green-600" />
                  Habitudes
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={() => navigate('/habits')} className="text-green-600 dark:text-green-400">
                  Gérer
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <HabitsWidget />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-xl flex items-center">
                  <Target className="mr-2 h-5 w-5 text-indigo-600" />
                  Objectifs
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={() => navigate('/goals')} className="text-indigo-600 dark:text-indigo-400">
                  Voir tout
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="animate-pulse space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-12 bg-gray-200 dark:bg-gray-800 rounded"></div>
                  ))}
                </div>
              ) : goals.length > 0 ? (
                <ul className="space-y-3">
                  {goals.map(goal => (
                    <li key={goal.id} className="p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{goal.title}</span>
                        <span className="text-xs font-medium">{goal.progress}%</span>
                      </div>
                      <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                        <div 
                          className="bg-indigo-600 h-2.5 rounded-full" 
                          style={{ width: `${goal.progress}%` }}
                        ></div>
                      </div>
                      {goal.deadline && (
                        <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                          Échéance: {new Date(goal.deadline).toLocaleDateString('fr-FR')}
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                  <Target className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                  <p>Aucun objectif défini</p>
                  <Button 
                    onClick={() => navigate('/goals')} 
                    size="sm" 
                    variant="outline" 
                    className="mt-2"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Définir un objectif
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-xl flex items-center">
                  <BarChart3 className="mr-2 h-5 w-5 text-purple-600" />
                  Analyse IA de votre productivité
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={() => navigate('/analytics')} className="text-purple-600 dark:text-purple-400">
                  Analyse détaillée
                </Button>
              </div>
              <CardDescription>Insights basés sur vos habitudes et données</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border rounded-lg bg-purple-50 dark:bg-purple-950/30 border-purple-100 dark:border-purple-900">
                  <h3 className="font-medium text-purple-800 dark:text-purple-300 mb-2 flex items-center">
                    <BrainCircuit className="mr-2 h-4 w-4" />
                    Analyse de vos sessions Focus
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Vos sessions les plus productives ont lieu entre 9h et 11h du matin. 
                    Essayez de planifier vos tâches importantes durant cette période pour maximiser votre efficacité.
                  </p>
                </div>
                
                <div className="p-4 border rounded-lg bg-blue-50 dark:bg-blue-950/30 border-blue-100 dark:border-blue-900">
                  <h3 className="font-medium text-blue-800 dark:text-blue-300 mb-2 flex items-center">
                    <CheckSquare className="mr-2 h-4 w-4" />
                    Patterns de tâches complétées
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Vous complétez davantage de tâches en début de semaine. 
                    Considérez réorganiser votre planning pour équilibrer votre charge de travail sur l'ensemble de la semaine.
                  </p>
                </div>
                
                <div className="p-4 border rounded-lg bg-green-50 dark:bg-green-950/30 border-green-100 dark:border-green-900">
                  <h3 className="font-medium text-green-800 dark:text-green-300 mb-2 flex items-center">
                    <CheckCheck className="mr-2 h-4 w-4" />
                    Développement d'habitudes
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Vos habitudes liées à la santé montrent la meilleure progression. 
                    Félicitations! Pour les autres catégories, essayez de vous rappeler vos motivations initiales.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-xl flex items-center">
                  <Calendar className="mr-2 h-5 w-5 text-orange-600" />
                  Votre journée
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={() => navigate('/planning')} className="text-orange-600 dark:text-orange-400">
                  Planning
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {loading ? (
                  <div className="animate-pulse space-y-3">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="h-12 bg-gray-200 dark:bg-gray-800 rounded"></div>
                    ))}
                  </div>
                ) : (
                  <>
                    <div className="flex flex-col gap-1">
                      <div className="text-sm font-medium">Aujourd'hui, {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {tasks.length} tâches, {habits.length} habitudes à suivre
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 dark:text-red-400">
                          <Clock className="h-6 w-6" />
                        </div>
                        <Button onClick={handleStartFocus} variant="outline" className="flex-1 justify-start font-normal text-left">
                          <div>
                            <div className="font-medium">Session Focus</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">25 minutes</div>
                          </div>
                        </Button>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                          <CheckSquare className="h-6 w-6" />
                        </div>
                        <Button onClick={handleNewTask} variant="outline" className="flex-1 justify-start font-normal text-left">
                          <div>
                            <div className="font-medium">Gérer les tâches</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">Planifiez votre journée</div>
                          </div>
                        </Button>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <div className="h-12 w-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400">
                          <FileText className="h-6 w-6" />
                        </div>
                        <Button onClick={handleQuickNote} variant="outline" className="flex-1 justify-start font-normal text-left">
                          <div>
                            <div className="font-medium">Journal</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">Noter vos pensées</div>
                          </div>
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
            <CardFooter className="pt-0">
              <Button variant="outline" className="w-full" onClick={() => navigate('/planning')}>
                <Calendar className="mr-2 h-4 w-4" />
                Voir votre planning complet
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default Dashboard;
