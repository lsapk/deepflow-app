
import React, { useState } from 'react';
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
  createdAt: string;
}

const demoHabits: Habit[] = [
  {
    id: '1',
    name: 'Méditation matinale',
    description: '10 minutes de méditation chaque matin',
    frequency: 'daily',
    category: 'Bien-être',
    target: 7,
    progress: 5,
    streak: 5,
    color: 'purple',
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Lecture',
    description: 'Lire pendant 30 minutes',
    frequency: 'daily',
    category: 'Personnel',
    target: 7,
    progress: 3,
    streak: 2,
    color: 'blue',
    createdAt: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'Exercice physique',
    description: '30 minutes d\'activité physique',
    frequency: 'daily',
    category: 'Santé',
    target: 5,
    progress: 2,
    streak: 0,
    color: 'green',
    createdAt: new Date().toISOString(),
  },
  {
    id: '4',
    name: 'Boire 2L d\'eau',
    frequency: 'daily',
    category: 'Santé',
    target: 7,
    progress: 6,
    streak: 6,
    color: 'cyan',
    createdAt: new Date().toISOString(),
  },
  {
    id: '5',
    name: 'Apprendre une nouvelle compétence',
    description: 'Passer 1 heure sur un cours en ligne',
    frequency: 'weekly',
    category: 'Développement',
    target: 3,
    progress: 1,
    streak: 2,
    color: 'orange',
    createdAt: new Date().toISOString(),
  },
];

const categories = ['Santé', 'Bien-être', 'Personnel', 'Travail', 'Développement', 'Autre'];
const colors = ['blue', 'green', 'purple', 'orange', 'cyan', 'red', 'yellow', 'indigo', 'pink'];

const HabitsPage = () => {
  const [habits, setHabits] = useState<Habit[]>(demoHabits);
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

  const handleAddHabit = () => {
    if (!newHabit.name) {
      toast.error('Le nom de l\'habitude est requis');
      return;
    }

    const habit: Habit = {
      id: Date.now().toString(),
      name: newHabit.name,
      description: newHabit.description,
      frequency: newHabit.frequency as 'daily' | 'weekly',
      category: newHabit.category || 'Autre',
      target: newHabit.target || 7,
      progress: 0,
      streak: 0,
      color: newHabit.color || 'blue',
      createdAt: new Date().toISOString(),
    };

    setHabits([habit, ...habits]);
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
    toast.success('Habitude ajoutée avec succès');
  };

  const incrementProgress = (id: string) => {
    setHabits(
      habits.map((habit) =>
        habit.id === id
          ? {
              ...habit,
              progress: Math.min(habit.progress + 1, habit.target),
              streak:
                habit.progress + 1 >= habit.target
                  ? habit.streak + 1
                  : habit.streak,
            }
          : habit
      )
    );
    
    const habitName = habits.find(h => h.id === id)?.name;
    toast.success(`Habitude "${habitName}" mise à jour`);
  };

  const resetProgress = (id: string) => {
    setHabits(
      habits.map((habit) =>
        habit.id === id ? { ...habit, progress: 0 } : habit
      )
    );
    
    const habitName = habits.find(h => h.id === id)?.name;
    toast.info(`Progression de "${habitName}" réinitialisée`);
  };

  const deleteHabit = (id: string) => {
    const habitName = habits.find(h => h.id === id)?.name;
    setHabits(habits.filter((habit) => habit.id !== id));
    toast.success(`Habitude "${habitName}" supprimée`);
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredHabits.map((habit) => (
                  <motion.div key={habit.id} variants={itemVariants}>
                    <Card className="overflow-hidden h-full">
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
            </TabsContent>
          </Tabs>
        </motion.div>
      </motion.div>
    </MainLayout>
  );
};

export default HabitsPage;
