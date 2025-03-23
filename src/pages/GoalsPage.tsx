
import React, { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckCircle2, Edit, Plus, Save, SortDesc, Star, Tag, Target, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

interface Goal {
  id: string;
  title: string;
  description: string;
  progress: number;
  dueDate: string;
  category: string;
  priority: 'high' | 'medium' | 'low';
  completedSteps: string[];
  totalSteps: string[];
}

const GoalsPage = () => {
  const [goals, setGoals] = useState<Goal[]>([
    {
      id: '1',
      title: 'Lancer mon site web personnel',
      description: 'Créer et lancer mon portfolio en ligne pour présenter mes projets et mes compétences.',
      progress: 65,
      dueDate: '2025-04-15',
      category: 'Professionnel',
      priority: 'high',
      completedSteps: ['Design UI/UX', 'Développement frontend'],
      totalSteps: ['Design UI/UX', 'Développement frontend', 'Développement backend', 'Tests', 'Déploiement']
    },
    {
      id: '2',
      title: 'Lire 20 livres cette année',
      description: 'Développer une habitude de lecture régulière pour atteindre mon objectif de 20 livres en un an.',
      progress: 40,
      dueDate: '2025-12-31',
      category: 'Personnel',
      priority: 'medium',
      completedSteps: ['Livre 1: L\'Alchimiste', 'Livre 2: Sapiens', 'Livre 3: Atomic Habits', 'Livre 4: Deep Work'],
      totalSteps: Array.from({ length: 10 }, (_, i) => `Livre ${i + 1}`)
    }
  ]);

  const [newGoal, setNewGoal] = useState<Omit<Goal, 'id' | 'progress'>>({
    title: '',
    description: '',
    dueDate: '',
    category: 'Personnel',
    priority: 'medium',
    completedSteps: [],
    totalSteps: []
  });
  
  const [newStep, setNewStep] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const [sort, setSort] = useState<string>('dueDate');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleNewGoalChange = (field: keyof Omit<Goal, 'id' | 'progress'>, value: any) => {
    setNewGoal({ ...newGoal, [field]: value });
  };

  const handleAddStep = () => {
    if (!newStep.trim()) return;
    
    setNewGoal({
      ...newGoal,
      totalSteps: [...newGoal.totalSteps, newStep]
    });
    
    setNewStep('');
  };

  const handleRemoveStep = (index: number) => {
    const updatedSteps = [...newGoal.totalSteps];
    updatedSteps.splice(index, 1);
    setNewGoal({
      ...newGoal,
      totalSteps: updatedSteps,
      completedSteps: newGoal.completedSteps.filter(step => updatedSteps.includes(step))
    });
  };

  const calculateProgress = (goal: Goal) => {
    return goal.totalSteps.length > 0 
      ? Math.round((goal.completedSteps.length / goal.totalSteps.length) * 100) 
      : 0;
  };

  const handleSaveGoal = () => {
    if (!newGoal.title || !newGoal.dueDate) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    if (isEditing && editingGoalId) {
      // Mise à jour d'un objectif existant
      const updatedGoals = goals.map(goal => 
        goal.id === editingGoalId 
          ? { 
              ...goal, 
              ...newGoal, 
              progress: calculateProgress({ ...goal, ...newGoal })
            } 
          : goal
      );
      setGoals(updatedGoals);
      toast.success("Objectif mis à jour avec succès");
    } else {
      // Ajout d'un nouvel objectif
      const goal: Goal = {
        id: Date.now().toString(),
        ...newGoal,
        progress: 0
      };
      setGoals([...goals, goal]);
      toast.success("Nouvel objectif ajouté");
    }

    // Réinitialiser le formulaire
    setNewGoal({
      title: '',
      description: '',
      dueDate: '',
      category: 'Personnel',
      priority: 'medium',
      completedSteps: [],
      totalSteps: []
    });
    setIsEditing(false);
    setEditingGoalId(null);
    setIsDialogOpen(false);
  };

  const handleEditGoal = (goal: Goal) => {
    setNewGoal({
      title: goal.title,
      description: goal.description,
      dueDate: goal.dueDate,
      category: goal.category,
      priority: goal.priority,
      completedSteps: goal.completedSteps,
      totalSteps: goal.totalSteps
    });
    setIsEditing(true);
    setEditingGoalId(goal.id);
    setIsDialogOpen(true);
  };

  const handleDeleteGoal = (id: string) => {
    setGoals(goals.filter(goal => goal.id !== id));
    toast.success("Objectif supprimé");
  };

  const handleToggleStep = (goalId: string, step: string) => {
    setGoals(goals.map(goal => {
      if (goal.id === goalId) {
        const completedSteps = goal.completedSteps.includes(step)
          ? goal.completedSteps.filter(s => s !== step)
          : [...goal.completedSteps, step];
        
        return {
          ...goal,
          completedSteps,
          progress: Math.round((completedSteps.length / goal.totalSteps.length) * 100)
        };
      }
      return goal;
    }));
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-500';
      case 'medium': return 'text-orange-500';
      case 'low': return 'text-green-500';
      default: return 'text-blue-500';
    }
  };

  const filteredGoals = goals
    .filter(goal => {
      if (filter === 'all') return true;
      if (filter === 'completed') return goal.progress === 100;
      if (filter === 'in-progress') return goal.progress > 0 && goal.progress < 100;
      if (filter === 'not-started') return goal.progress === 0;
      return goal.category.toLowerCase() === filter.toLowerCase();
    })
    .sort((a, b) => {
      if (sort === 'dueDate') {
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }
      if (sort === 'priority') {
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      if (sort === 'progress') {
        return b.progress - a.progress;
      }
      return 0;
    });

  const categories = [...new Set(goals.map(goal => goal.category))];

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Objectifs</h1>
            <p className="text-gray-500 dark:text-gray-400">
              Définissez et suivez vos objectifs à court et long terme
            </p>
          </div>
          <Button className="mt-4 md:mt-0" onClick={() => {
            setIsEditing(false);
            setEditingGoalId(null);
            setNewGoal({
              title: '',
              description: '',
              dueDate: '',
              category: 'Personnel',
              priority: 'medium',
              completedSteps: [],
              totalSteps: []
            });
            setIsDialogOpen(true);
          }}>
            <Plus className="mr-2 h-4 w-4" />
            Ajouter un objectif
          </Button>
        </div>

        <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
          <div className="flex items-center space-x-2">
            <Tag className="h-4 w-4 text-muted-foreground" />
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filtrer par" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les objectifs</SelectItem>
                <SelectItem value="completed">Terminés</SelectItem>
                <SelectItem value="in-progress">En cours</SelectItem>
                <SelectItem value="not-started">Non commencés</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category.toLowerCase()}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center space-x-2">
            <SortDesc className="h-4 w-4 text-muted-foreground" />
            <Select value={sort} onValueChange={setSort}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Trier par" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dueDate">Date d'échéance</SelectItem>
                <SelectItem value="priority">Priorité</SelectItem>
                <SelectItem value="progress">Progression</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ staggerChildren: 0.1 }}
        >
          {filteredGoals.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center py-12 px-4">
              <Target className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-xl font-medium">Aucun objectif trouvé</h3>
              <p className="text-sm text-muted-foreground text-center mt-2 mb-6">
                {filter !== 'all' 
                  ? 'Essayez un autre filtre ou créez un nouvel objectif'
                  : 'Commencez par créer votre premier objectif'}
              </p>
              <Button onClick={() => {
                setIsEditing(false);
                setEditingGoalId(null);
                setIsDialogOpen(true);
              }}>
                <Plus className="mr-2 h-4 w-4" />
                Ajouter un objectif
              </Button>
            </div>
          ) : (
            filteredGoals.map(goal => (
              <motion.div 
                key={goal.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between">
                      <div>
                        <CardTitle>{goal.title}</CardTitle>
                        <CardDescription className="flex items-center mt-1">
                          <span className={`mr-2 flex items-center ${getPriorityColor(goal.priority)}`}>
                            <Star className="h-3 w-3 mr-1" />
                            {goal.priority.charAt(0).toUpperCase() + goal.priority.slice(1)} 
                          </span>
                          <span>· {goal.category}</span>
                        </CardDescription>
                      </div>
                      <div className="flex space-x-1">
                        <Button variant="ghost" size="icon" onClick={() => handleEditGoal(goal)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteGoal(goal.id)}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progression</span>
                        <span className="font-medium">{goal.progress}%</span>
                      </div>
                      <Progress value={goal.progress} className="h-2" />
                    </div>
                    
                    {goal.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">{goal.description}</p>
                    )}
                    
                    <div className="space-y-1">
                      <h4 className="text-sm font-medium">Date d'échéance</h4>
                      <p className="text-sm">
                        {new Date(goal.dueDate).toLocaleDateString('fr-FR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                    
                    {goal.totalSteps.length > 0 && (
                      <div className="space-y-1">
                        <h4 className="text-sm font-medium">Étapes ({goal.completedSteps.length}/{goal.totalSteps.length})</h4>
                        <ul className="space-y-1">
                          {goal.totalSteps.map((step, index) => (
                            <li key={index} className="flex items-start">
                              <button
                                className={`flex-shrink-0 h-5 w-5 rounded border mr-2 mt-0.5 flex items-center justify-center ${
                                  goal.completedSteps.includes(step) 
                                    ? 'bg-primary border-primary' 
                                    : 'border-gray-300 dark:border-gray-600'
                                }`}
                                onClick={() => handleToggleStep(goal.id, step)}
                              >
                                {goal.completedSteps.includes(step) && (
                                  <CheckCircle2 className="h-3 w-3 text-white" />
                                )}
                              </button>
                              <span className={`text-sm ${goal.completedSteps.includes(step) ? 'line-through text-gray-500' : ''}`}>
                                {step}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </motion.div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Modifier l\'objectif' : 'Ajouter un nouvel objectif'}</DialogTitle>
            <DialogDescription>
              {isEditing 
                ? 'Modifiez les détails de votre objectif' 
                : 'Définissez un nouvel objectif avec des étapes claires'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium">Titre</label>
              <Input
                id="title"
                placeholder="Titre de l'objectif"
                value={newGoal.title}
                onChange={(e) => handleNewGoalChange('title', e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium">Description</label>
              <Textarea
                id="description"
                placeholder="Description de l'objectif"
                value={newGoal.description}
                onChange={(e) => handleNewGoalChange('description', e.target.value)}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="dueDate" className="text-sm font-medium">Date d'échéance</label>
                <Input
                  id="dueDate"
                  type="date"
                  value={newGoal.dueDate}
                  onChange={(e) => handleNewGoalChange('dueDate', e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="category" className="text-sm font-medium">Catégorie</label>
                <Select
                  value={newGoal.category}
                  onValueChange={(value) => handleNewGoalChange('category', value)}
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Personnel">Personnel</SelectItem>
                    <SelectItem value="Professionnel">Professionnel</SelectItem>
                    <SelectItem value="Santé">Santé</SelectItem>
                    <SelectItem value="Finance">Finance</SelectItem>
                    <SelectItem value="Éducation">Éducation</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="priority" className="text-sm font-medium">Priorité</label>
              <Select
                value={newGoal.priority}
                onValueChange={(value: 'high' | 'medium' | 'low') => handleNewGoalChange('priority', value)}
              >
                <SelectTrigger id="priority">
                  <SelectValue placeholder="Sélectionner" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">Haute</SelectItem>
                  <SelectItem value="medium">Moyenne</SelectItem>
                  <SelectItem value="low">Basse</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Étapes</label>
              <div className="flex space-x-2">
                <Input
                  placeholder="Ajouter une étape"
                  value={newStep}
                  onChange={(e) => setNewStep(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddStep();
                    }
                  }}
                />
                <Button type="button" onClick={handleAddStep} size="sm">
                  Ajouter
                </Button>
              </div>
              
              {newGoal.totalSteps.length > 0 && (
                <ul className="space-y-2 mt-4">
                  {newGoal.totalSteps.map((step, index) => (
                    <li key={index} className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 p-2 rounded">
                      <span className="text-sm">{step}</span>
                      <Button variant="ghost" size="icon" onClick={() => handleRemoveStep(index)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleSaveGoal}>
              <Save className="mr-2 h-4 w-4" />
              {isEditing ? 'Mettre à jour' : 'Ajouter'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default GoalsPage;
