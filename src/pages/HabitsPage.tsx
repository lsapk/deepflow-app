import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import {
  Calendar,
  Check,
  Filter,
  List,
  Plus,
  RotateCcw,
  Trash2,
  TrendingUp,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/services/firebase';
import { collection, addDoc, getDocs, query, where, doc, deleteDoc, updateDoc, Timestamp } from 'firebase/firestore';

interface Habit {
  id: string;
  name: string;
  description?: string;
  frequency: 'daily' | 'weekly';
  category: string;
  target: number;
  progress: number;
  streak: number;
  color: string;
  createdAt: Date;
  userId: string;
}

const categories = ['Santé', 'Bien-être', 'Personnel', 'Travail', 'Développement', 'Autre'];
const colors = ['blue', 'green', 'purple', 'orange', 'cyan', 'red', 'yellow', 'indigo', 'pink'];

const HabitsPage = () => {
  const { currentUser } = useAuth();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [newHabit, setNewHabit] = useState<Partial<Habit>>({
    name: '',
    description: '',
    frequency: 'daily',
    category: 'Santé',
    target: 7,
    progress: 0,
    streak: 0,
    color: 'blue',
  });
  const [activeTab, setActiveTab] = useState('all');
  const [showAddHabit, setShowAddHabit] = useState(false);

  useEffect(() => {
    if (currentUser) {
      fetchHabits();
    }
  }, [currentUser]);

  const fetchHabits = async () => {
    if (!currentUser) return;
    
    try {
      setLoading(true);
      const habitsQuery = query(
        collection(db, 'habits'),
        where('userId', '==', currentUser.uid)
      );
      
      const querySnapshot = await getDocs(habitsQuery);
      
      if (querySnapshot.empty) {
        setHabits([]);
        setLoading(false);
        return;
      }
      
      const fetchedHabits = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name,
          description: data.description || '',
          frequency: data.frequency,
          category: data.category,
          target: data.target,
          progress: data.progress || 0,
          streak: data.streak || 0,
          color: data.color || 'blue',
          createdAt: data.createdAt?.toDate() || new Date(),
          userId: data.userId
        } as Habit;
      });
      
      setHabits(fetchedHabits);
    } catch (error) {
      console.error("Error fetching habits:", error);
      toast.error("Erreur lors du chargement des habitudes");
    } finally {
      setLoading(false);
    }
  };

  const handleAddHabit = async () => {
    if (!currentUser) {
      toast.error("Vous devez être connecté pour ajouter une habitude");
      return;
    }
    
    if (!newHabit.name) {
      toast.error("Le nom de l'habitude est requis");
      return;
    }

    try {
      const habitData = {
        name: newHabit.name,
        description: newHabit.description || '',
        frequency: newHabit.frequency as 'daily' | 'weekly',
        category: newHabit.category || 'Autre',
        target: newHabit.target || 7,
        progress: 0,
        streak: 0,
        color: newHabit.color || 'blue',
        createdAt: Timestamp.now(),
        userId: currentUser.uid
      };
      
      const docRef = await addDoc(collection(db, 'habits'), habitData);
      
      const newHabitWithId = {
        id: docRef.id,
        ...habitData,
        createdAt: new Date()
      } as Habit;
      
      setHabits(prev => [newHabitWithId, ...prev]);
      
      setNewHabit({
        name: '',
        description: '',
        frequency: 'daily',
        category: 'Santé',
        target: 7,
        progress: 0,
        streak: 0,
        color: 'blue',
      });
      
      setShowAddHabit(false);
      toast.success("Habitude ajoutée avec succès");
    } catch (error) {
      console.error("Error adding habit:", error);
      toast.error("Erreur lors de l'ajout de l'habitude");
    }
  };

  const incrementProgress = async (id: string) => {
    try {
      const habitToUpdate = habits.find(h => h.id === id);
      if (!habitToUpdate) return;
      
      const newProgress = Math.min(habitToUpdate.progress + 1, habitToUpdate.target);
      const newStreak = newProgress >= habitToUpdate.target ? habitToUpdate.streak + 1 : habitToUpdate.streak;
      
      // Update Firestore
      await updateDoc(doc(db, 'habits', id), {
        progress: newProgress,
        streak: newStreak,
      });
      
      // Update local state
      setHabits(
        habits.map((habit) =>
          habit.id === id
            ? {
                ...habit,
                progress: newProgress,
                streak: newStreak,
              }
            : habit
        )
      );
      
      if (newProgress >= habitToUpdate.target) {
        // Jouer un son si disponible
        try {
          const audio = new Audio('/sounds/task-complete.mp3');
          audio.play();
        } catch (e) {
          console.log("Sound not available");
        }
      }
      
      toast.success(`Habitude "${habitToUpdate.name}" mise à jour`);
    } catch (error) {
      console.error("Error updating habit progress:", error);
      toast.error("Erreur lors de la mise à jour de l'habitude");
    }
  };

  const resetProgress = async (id: string) => {
    try {
      // Update Firestore
      await updateDoc(doc(db, 'habits', id), {
        progress: 0
      });
      
      // Update local state
      setHabits(
        habits.map((habit) =>
          habit.id === id ? { ...habit, progress: 0 } : habit
        )
      );
      
      const habitName = habits.find(h => h.id === id)?.name;
      toast.info(`Progression de "${habitName}" réinitialisée`);
    } catch (error) {
      console.error("Error resetting habit progress:", error);
      toast.error("Erreur lors de la réinitialisation de l'habitude");
    }
  };

  const deleteHabit = async (id: string) => {
    try {
      // Delete from Firestore
      await deleteDoc(doc(db, 'habits', id));
      
      // Update local state
      const habitName = habits.find(h => h.id === id)?.name;
      setHabits(habits.filter((habit) => habit.id !== id));
      
      toast.success(`Habitude "${habitName}" supprimée`);
    } catch (error) {
      console.error("Error deleting habit:", error);
      toast.error("Erreur lors de la suppression de l'habitude");
    }
  };

  const filteredHabits = habits.filter((habit) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'daily') return habit.frequency === 'daily';
    if (activeTab === 'weekly') return habit.frequency === 'weekly';
    if (activeTab === 'progress') return habit.progress > 0;
    return true;
  });

  const getColorClass = (color: string) => {
    switch (color) {
      case 'blue':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'green':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'purple':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
      case 'orange':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300';
      case 'cyan':
        return 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300';
      case 'red':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      case 'yellow':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'indigo':
        return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300';
      case 'pink':
        return 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const getProgressBarColor = (color: string) => {
    switch (color) {
      case 'blue':
        return 'bg-blue-600 dark:bg-blue-500';
      case 'green':
        return 'bg-green-600 dark:bg-green-500';
      case 'purple':
        return 'bg-purple-600 dark:bg-purple-500';
      case 'orange':
        return 'bg-orange-600 dark:bg-orange-500';
      case 'cyan':
        return 'bg-cyan-600 dark:bg-cyan-500';
      case 'red':
        return 'bg-red-600 dark:bg-red-500';
      case 'yellow':
        return 'bg-yellow-600 dark:bg-yellow-500';
      case 'indigo':
        return 'bg-indigo-600 dark:bg-indigo-500';
      case 'pink':
        return 'bg-pink-600 dark:bg-pink-500';
      default:
        return 'bg-blue-600 dark:bg-blue-500';
    }
  };

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
        className="space-y-6"
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <motion.div variants={itemVariants}>
            <h1 className="text-3xl font-bold flex items-center">
              <List className="mr-2 h-8 w-8 text-green-600" />
              Suivi d'habitudes
            </h1>
            <p className="text-muted-foreground mt-1">
              Construisez de bonnes habitudes et suivez votre progression
            </p>
          </motion.div>

          <motion.div variants={itemVariants} className="flex space-x-2">
            <Dialog open={showAddHabit} onOpenChange={setShowAddHabit}>
              <DialogTrigger asChild>
                <Button className="bg-green-600 hover:bg-green-700">
                  <Plus className="mr-2 h-4 w-4" />
                  Nouvelle habitude
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Ajouter une nouvelle habitude</DialogTitle>
                  <DialogDescription>
                    Créez une nouvelle habitude à suivre régulièrement.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <label htmlFor="name" className="text-sm font-medium">
                      Nom
                    </label>
                    <Input
                      id="name"
                      value={newHabit.name}
                      onChange={(e) =>
                        setNewHabit({ ...newHabit, name: e.target.value })
                      }
                      placeholder="Nom de l'habitude"
                    />
                  </div>
                  <div className="grid gap-2">
                    <label htmlFor="description" className="text-sm font-medium">
                      Description (optionnel)
                    </label>
                    <Input
                      id="description"
                      value={newHabit.description}
                      onChange={(e) =>
                        setNewHabit({ ...newHabit, description: e.target.value })
                      }
                      placeholder="Décrivez l'habitude"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <label htmlFor="frequency" className="text-sm font-medium">
                        Fréquence
                      </label>
                      <Select
                        value={newHabit.frequency}
                        onValueChange={(value) =>
                          setNewHabit({ ...newHabit, frequency: value as 'daily' | 'weekly' })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Fréquence" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="daily">Quotidienne</SelectItem>
                          <SelectItem value="weekly">Hebdomadaire</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <label htmlFor="target" className="text-sm font-medium">
                        Objectif
                      </label>
                      <Input
                        id="target"
                        type="number"
                        min="1"
                        max="7"
                        value={newHabit.target}
                        onChange={(e) =>
                          setNewHabit({
                            ...newHabit,
                            target: parseInt(e.target.value) || 7,
                          })
                        }
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <label htmlFor="category" className="text-sm font-medium">
                        Catégorie
                      </label>
                      <Select
                        value={newHabit.category}
                        onValueChange={(value) =>
                          setNewHabit({ ...newHabit, category: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Catégorie" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <label htmlFor="color" className="text-sm font-medium">
                        Couleur
                      </label>
                      <Select
                        value={newHabit.color}
                        onValueChange={(value) =>
                          setNewHabit({ ...newHabit, color: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Couleur" />
                        </SelectTrigger>
                        <SelectContent>
                          {colors.map((color) => (
                            <SelectItem key={color} value={color}>
                              <div className="flex items-center">
                                <div
                                  className={`w-4 h-4 rounded-full mr-2 ${getColorClass(
                                    color
                                  )}`}
                                ></div>
                                {color.charAt(0).toUpperCase() + color.slice(1)}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setShowAddHabit(false)}
                  >
                    Annuler
                  </Button>
                  <Button onClick={handleAddHabit}>Ajouter l'habitude</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              Filtrer
            </Button>
          </motion.div>
        </div>

        <motion.div variants={itemVariants}>
          <Tabs
            defaultValue="all"
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid grid-cols-4 w-full max-w-md mb-6">
              <TabsTrigger value="all">Toutes</TabsTrigger>
              <TabsTrigger value="daily">Quotidiennes</TabsTrigger>
              <TabsTrigger value="weekly">Hebdomadaires</TabsTrigger>
              <TabsTrigger value="progress">En cours</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-0">
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(3)].map((_, i) => (
                    <Card key={i} className="animate-pulse">
                      <div className="h-2 w-full bg-gray-200 dark:bg-gray-700"></div>
                      <CardHeader>
                        <div className="h-6 w-2/3 bg-gray-200 dark:bg-gray-700 rounded"></div>
                        <div className="h-4 w-1/3 bg-gray-200 dark:bg-gray-700 rounded mt-2"></div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <div className="h-4 w-1/4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                            <div className="h-4 w-1/6 bg-gray-200 dark:bg-gray-700 rounded"></div>
                          </div>
                          <div className="h-2 w-full bg-gray-200 dark:bg-gray-700 rounded"></div>
                        </div>
                        <div className="flex justify-between">
                          <div className="h-6 w-1/3 bg-gray-200 dark:bg-gray-700 rounded"></div>
                          <div className="flex space-x-2">
                            {[...Array(3)].map((_, j) => (
                              <div key={j} className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : filteredHabits.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredHabits.map((habit) => (
                    <motion.div key={habit.id} variants={itemVariants}>
                      <Card className="overflow-hidden h-full hover:shadow-md transition-shadow duration-300">
                        <div
                          className={`h-2 w-full ${getProgressBarColor(habit.color)}`}
                        ></div>
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-start">
                            <CardTitle className="text-lg">{habit.name}</CardTitle>
                            <span
                              className={`text-xs font-medium px-2 py-1 rounded-full ${getColorClass(
                                habit.color
                              )}`}
                            >
                              {habit.frequency === 'daily'
                                ? 'Quotidien'
                                : 'Hebdomadaire'}
                            </span>
                          </div>
                          {habit.description && (
                            <CardDescription>
                              {habit.description}
                            </CardDescription>
                          )}
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Progression</span>
                              <span>
                                {habit.progress}/{habit.target}
                              </span>
                            </div>
                            <Progress
                              value={(habit.progress / habit.target) * 100}
                              className={`h-2 ${getProgressBarColor(habit.color)}`}
                            />
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <div
                                className={`flex items-center space-x-1 text-xs font-medium px-2 py-1 rounded-full ${getColorClass(
                                  habit.color
                                )}`}
                              >
                                <TrendingUp size={12} />
                                <span>{habit.streak} séries</span>
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                                <Calendar size={12} className="mr-1" />
                                <span>
                                  {new Date(habit.createdAt).toLocaleDateString(
                                    'fr-FR',
                                    {
                                      month: 'short',
                                      day: 'numeric',
                                    }
                                  )}
                                </span>
                              </div>
                            </div>
                            <div className="flex space-x-2">
                              <Button
                                size="icon"
                                variant="outline"
                                className="h-8 w-8 text-green-600"
                                onClick={() => incrementProgress(habit.id)}
                                disabled={habit.progress >= habit.target}
                              >
                                <Check size={16} />
                                <span className="sr-only">Valider</span>
                              </Button>
                              <Button
                                size="icon"
                                variant="outline"
                                className="h-8 w-8 text-amber-600"
                                onClick={() => resetProgress(habit.id)}
                              >
                                <RotateCcw size={16} />
                                <span className="sr-only">Réinitialiser</span>
                              </Button>
                              <Button
                                size="icon"
                                variant="outline"
                                className="h-8 w-8 text-red-600"
                                onClick={() => deleteHabit(habit.id)}
                              >
                                <Trash2 size={16} />
                                <span className="sr-only">Supprimer</span>
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/30 rounded-lg">
                  <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium mb-2">Aucune habitude</h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-6">
                    Commencez à suivre vos habitudes quotidiennes
                  </p>
                  <Button onClick={() => setShowAddHabit(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Créer votre première habitude
                  </Button>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </motion.div>
      </motion.div>
    </MainLayout>
  );
};

export default HabitsPage;
