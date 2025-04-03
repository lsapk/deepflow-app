import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  CheckSquare,
  Filter,
  Plus,
  CalendarClock,
  ListFilter,
  MoreHorizontal,
  Star,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTasks, Task, createTask, updateTask } from '@/services/taskService';
import { useAuth } from '@/contexts/AuthContext';

const categories = ['Travail', 'Personnel', 'Études', 'Santé', 'Projets', 'Autre'];

const TasksPage = () => {
  const { currentUser } = useAuth();
  const { data: tasks, addItem, updateItem, deleteItem, loading } = useTasks();
  
  const [newTask, setNewTask] = useState<Partial<Task>>({
    title: '',
    description: '',
    completed: false,
    priority: 'medium',
    category: 'Personnel',
  });
  const [activeTab, setActiveTab] = useState('all');
  const [showAddTask, setShowAddTask] = useState(false);

  const handleAddTask = () => {
    if (!newTask.title) {
      toast.error('Le titre de la tâche est requis');
      return;
    }

    const taskToCreate = createTask({
      title: newTask.title,
      description: newTask.description || '',
      completed: false,
      status: 'todo',
      due_date: newTask.dueDate,
      priority: newTask.priority as 'low' | 'medium' | 'high',
      category: newTask.category,
      user_id: currentUser?.uid
    });

    addItem(taskToCreate);
    
    setNewTask({
      title: '',
      description: '',
      completed: false,
      priority: 'medium',
      category: 'Personnel',
    });
    setShowAddTask(false);
    toast.success('Tâche ajoutée avec succès');
  };

  const toggleTaskCompletion = (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (task) {
      const updatedTask = updateTask({
        id,
        completed: !task.completed
      });
      updateItem(id, updatedTask);
      
      if (!task.completed) {
        toast.success(`Tâche "${task.title}" terminée`);
      }
    }
  };

  const deleteTask = (id: string) => {
    const taskName = tasks.find(t => t.id === id)?.title;
    deleteItem(id);
    toast.success(`Tâche "${taskName}" supprimée`);
  };

  const filteredTasks = tasks.filter((task) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'completed') return task.completed;
    if (activeTab === 'active') return !task.completed;
    if (activeTab === 'high') return task.priority === 'high';
    return false;
  });

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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-600 bg-red-100 dark:bg-red-900/20 dark:text-red-400';
      case 'medium':
        return 'text-amber-600 bg-amber-100 dark:bg-amber-900/20 dark:text-amber-400';
      case 'low':
        return 'text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-400';
      default:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-800 dark:text-gray-400';
    }
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
              <CheckSquare className="mr-2 h-8 w-8 text-blue-600" />
              Gestion des tâches
            </h1>
            <p className="text-muted-foreground mt-1">
              Organisez vos tâches et suivez votre progression
            </p>
          </motion.div>

          <motion.div variants={itemVariants} className="flex space-x-2">
            <Dialog open={showAddTask} onOpenChange={setShowAddTask}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="mr-2 h-4 w-4" />
                  Nouvelle tâche
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Ajouter une nouvelle tâche</DialogTitle>
                  <DialogDescription>
                    Créez une nouvelle tâche avec tous les détails nécessaires.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <label htmlFor="title" className="text-sm font-medium">
                      Titre
                    </label>
                    <Input
                      id="title"
                      value={newTask.title}
                      onChange={(e) =>
                        setNewTask({ ...newTask, title: e.target.value })
                      }
                      placeholder="Entrez le titre de la tâche"
                    />
                  </div>
                  <div className="grid gap-2">
                    <label htmlFor="description" className="text-sm font-medium">
                      Description (optionnel)
                    </label>
                    <Input
                      id="description"
                      value={newTask.description}
                      onChange={(e) =>
                        setNewTask({ ...newTask, description: e.target.value })
                      }
                      placeholder="Décrivez la tâche"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <label htmlFor="dueDate" className="text-sm font-medium">
                        Échéance
                      </label>
                      <Input
                        id="dueDate"
                        type="date"
                        value={newTask.dueDate}
                        onChange={(e) =>
                          setNewTask({ ...newTask, dueDate: e.target.value })
                        }
                      />
                    </div>
                    <div className="grid gap-2">
                      <label htmlFor="priority" className="text-sm font-medium">
                        Priorité
                      </label>
                      <Select
                        value={newTask.priority}
                        onValueChange={(value) =>
                          setNewTask({ ...newTask, priority: value as 'low' | 'medium' | 'high' })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Priorité" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Basse</SelectItem>
                          <SelectItem value="medium">Moyenne</SelectItem>
                          <SelectItem value="high">Haute</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <label htmlFor="category" className="text-sm font-medium">
                      Catégorie
                    </label>
                    <Select
                      value={newTask.category}
                      onValueChange={(value) =>
                        setNewTask({ ...newTask, category: value })
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
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setShowAddTask(false)}
                  >
                    Annuler
                  </Button>
                  <Button onClick={handleAddTask}>Ajouter la tâche</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <Filter className="mr-2 h-4 w-4" />
                  Filtrer
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setActiveTab('all')}>
                  Toutes les tâches
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setActiveTab('active')}>
                  Tâches actives
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setActiveTab('completed')}>
                  Tâches terminées
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setActiveTab('high')}>
                  Priorité haute
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
              <TabsTrigger value="active">À faire</TabsTrigger>
              <TabsTrigger value="completed">Terminées</TabsTrigger>
              <TabsTrigger value="high">Prioritaires</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-0">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle>
                    {activeTab === 'all' && 'Toutes les tâches'}
                    {activeTab === 'active' && 'Tâches à faire'}
                    {activeTab === 'completed' && 'Tâches terminées'}
                    {activeTab === 'high' && 'Tâches prioritaires'}
                  </CardTitle>
                  <CardDescription>
                    {filteredTasks.length} tâche{filteredTasks.length !== 1 && 's'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-4">
                    {filteredTasks.length === 0 ? (
                      <li className="text-center py-8 text-muted-foreground">
                        Aucune tâche trouvée
                      </li>
                    ) : (
                      filteredTasks.map((task) => (
                        <motion.li
                          key={task.id}
                          variants={itemVariants}
                          className={`flex items-start p-3 rounded-lg border ${
                            task.completed
                              ? 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700'
                              : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                          }`}
                        >
                          <div className="flex-shrink-0 pt-1">
                            <Checkbox
                              checked={task.completed}
                              onCheckedChange={() => toggleTaskCompletion(task.id)}
                              className="data-[state=checked]:bg-blue-600"
                            />
                          </div>
                          <div className="ml-3 flex-grow">
                            <div className="flex items-center justify-between">
                              <h3
                                className={`font-medium ${
                                  task.completed
                                    ? 'line-through text-gray-500 dark:text-gray-400'
                                    : ''
                                }`}
                              >
                                {task.title}
                              </h3>
                              <div className="flex items-center space-x-2">
                                <span
                                  className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(
                                    task.priority
                                  )}`}
                                >
                                  {task.priority === 'high' && (
                                    <Star className="mr-1 h-3 w-3" />
                                  )}
                                  {task.priority === 'high' && 'Haute'}
                                  {task.priority === 'medium' && 'Moyenne'}
                                  {task.priority === 'low' && 'Basse'}
                                </span>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8"
                                    >
                                      <MoreHorizontal className="h-4 w-4" />
                                      <span className="sr-only">Options</span>
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem
                                      onClick={() => toggleTaskCompletion(task.id)}
                                    >
                                      {task.completed
                                        ? 'Marquer comme non terminée'
                                        : 'Marquer comme terminée'}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => deleteTask(task.id)}
                                      className="text-red-600 dark:text-red-400"
                                    >
                                      Supprimer
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </div>
                            {task.description && (
                              <p
                                className={`text-sm mt-1 ${
                                  task.completed
                                    ? 'text-gray-400 dark:text-gray-500'
                                    : 'text-gray-600 dark:text-gray-400'
                                }`}
                              >
                                {task.description}
                              </p>
                            )}
                            {task.dueDate && (
                              <div
                                className={`flex items-center text-xs mt-2 ${
                                  task.completed
                                    ? 'text-gray-400 dark:text-gray-500'
                                    : 'text-gray-500 dark:text-gray-400'
                                }`}
                              >
                                <CalendarClock className="h-3 w-3 mr-1" />
                                Échéance:{' '}
                                {new Date(task.dueDate).toLocaleDateString(
                                  'fr-FR',
                                  {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric',
                                  }
                                )}
                              </div>
                            )}
                            {task.category && (
                              <div className="mt-2">
                                <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                                  <ListFilter className="h-3 w-3 mr-1" />
                                  {task.category}
                                </span>
                              </div>
                            )}
                          </div>
                        </motion.li>
                      ))
                    )}
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </motion.div>
    </MainLayout>
  );
};

export default TasksPage;
