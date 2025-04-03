
import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { FilePlus, CheckCircle, CheckCircle2, MoreVertical, Trash2, Edit } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { useHabits } from '@/services/habitService';

// Définir l'interface pour les valeurs du formulaire de nouvelle habitude
interface NewHabitFormValues {
  title: string;
  description: string;
  frequency: 'daily' | 'weekly';
  target: number;
  category: string;
}

// Define the Habit interface
interface Habit {
  id: string;
  title: string;
  description?: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  target_days?: number[];
  streak: number;
  longest_streak?: number;
  category?: string;
  created_at?: string;
  updated_at?: string;
  last_completed?: string;
  completions?: {
    date: string;
    completed: boolean;
  }[];
  user_id?: string;
}

const HabitsPage = () => {
  const { currentUser } = useAuth();
  const { data: habits = [], addItem, updateItem, deleteItem, saveData } = useHabits();
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentHabit, setCurrentHabit] = useState<Habit | null>(null);
  
  const [formValues, setFormValues] = useState<NewHabitFormValues>({
    title: '',
    description: '',
    frequency: 'daily',
    target: 1,
    category: 'health'
  });

  useEffect(() => {
    // When habits are loaded from IndexedDB, set loading to false
    if (habits) {
      setLoading(false);
    }
  }, [habits]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormValues(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormValues(prev => ({ ...prev, [name]: value }));
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numValue = parseInt(value, 10);
    if (!isNaN(numValue) && numValue > 0) {
      setFormValues(prev => ({ ...prev, [name]: numValue }));
    }
  };

  const resetForm = () => {
    setFormValues({
      title: '',
      description: '',
      frequency: 'daily',
      target: 1,
      category: 'health'
    });
    setIsEditMode(false);
    setCurrentHabit(null);
  };

  const handleSubmit = async () => {
    try {
      if (!formValues.title.trim()) {
        toast.error("Le titre est requis");
        return;
      }
      
      if (isEditMode && currentHabit) {
        // Update an existing habit
        const updatedHabit = updateItem(currentHabit.id, {
          title: formValues.title,
          description: formValues.description,
          frequency: formValues.frequency,
          target: formValues.target,
          category: formValues.category
        });
        
        if (updatedHabit) {
          toast.success("Habitude mise à jour avec succès");
        }
      } else {
        // Create a new habit
        const newHabit = addItem({
          title: formValues.title,
          description: formValues.description,
          frequency: formValues.frequency,
          target_days: [1, 2, 3, 4, 5, 6, 7], // Default to all days
          streak: 0,
          longest_streak: 0,
          category: formValues.category,
          user_id: currentUser?.uid || 'anonymous',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
        
        if (newHabit) {
          toast.success("Nouvelle habitude créée avec succès");
        }
      }
      
      resetForm();
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error saving habit:", error);
      toast.error("Erreur lors de l'enregistrement de l'habitude");
    }
  };

  const handleEditHabit = (habit: Habit) => {
    setCurrentHabit(habit);
    setFormValues({
      title: habit.title,
      description: habit.description || '',
      frequency: habit.frequency as 'daily' | 'weekly',
      target: habit.target_days?.length || 7,
      category: habit.category || 'health'
    });
    setIsEditMode(true);
    setIsDialogOpen(true);
  };

  const handleDeleteHabit = async (id: string) => {
    try {
      deleteItem(id);
      toast.success("Habitude supprimée avec succès");
    } catch (error) {
      console.error("Error deleting habit:", error);
      toast.error("Erreur lors de la suppression de l'habitude");
    }
  };

  const updateHabitStreak = async (habit: Habit) => {
    try {
      const updatedHabit = updateItem(habit.id, {
        streak: (habit.streak || 0) + 1,
        last_completed: new Date().toISOString()
      });
      
      if (updatedHabit) {
        toast.success("Habitude complétée ! Streak mise à jour");
      }
    } catch (error) {
      console.error("Error updating habit streak:", error);
      toast.error("Erreur lors de la mise à jour du streak");
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Habitudes</h1>
            <p className="text-gray-500 dark:text-gray-400">
              Suivez et développez vos habitudes positives
            </p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => {
                resetForm();
                setIsDialogOpen(true);
              }}>
                <FilePlus className="mr-2 h-4 w-4" />
                Nouvelle habitude
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{isEditMode ? 'Modifier l\'habitude' : 'Ajouter une nouvelle habitude'}</DialogTitle>
                <DialogDescription>
                  {isEditMode 
                    ? 'Modifiez les détails de votre habitude.' 
                    : 'Créez une nouvelle habitude que vous souhaitez développer.'}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Titre</Label>
                  <Input
                    id="title"
                    name="title"
                    placeholder="Ex: Faire de l'exercice"
                    value={formValues.title}
                    onChange={handleChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description (optionnel)</Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Détails de l'habitude..."
                    value={formValues.description}
                    onChange={handleChange}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="frequency">Fréquence</Label>
                    <Select 
                      value={formValues.frequency}
                      onValueChange={(value) => handleSelectChange('frequency', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner la fréquence" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Quotidienne</SelectItem>
                        <SelectItem value="weekly">Hebdomadaire</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="target">Objectif (nombre de fois)</Label>
                    <Input
                      id="target"
                      name="target"
                      type="number"
                      min="1"
                      value={formValues.target}
                      onChange={handleNumberChange}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="category">Catégorie</Label>
                  <Select 
                    value={formValues.category}
                    onValueChange={(value) => handleSelectChange('category', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une catégorie" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="health">Santé</SelectItem>
                      <SelectItem value="productivity">Productivité</SelectItem>
                      <SelectItem value="education">Éducation</SelectItem>
                      <SelectItem value="finance">Finance</SelectItem>
                      <SelectItem value="social">Social</SelectItem>
                      <SelectItem value="other">Autre</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Annuler
                </Button>
                <Button type="submit" onClick={handleSubmit}>
                  {isEditMode ? 'Mettre à jour' : 'Créer'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading ? (
            // Loading states
            Array(3).fill(0).map((_, index) => (
              <Card key={index} className="animate-pulse">
                <CardHeader className="pb-2">
                  <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded w-1/3 mb-2"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/4"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-2/3"></div>
                </CardContent>
              </Card>
            ))
          ) : habits.length > 0 ? (
            habits.map((habit) => (
              <Card key={habit.id}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-xl">{habit.title}</CardTitle>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEditHabit(habit)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Modifier
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-red-600"
                          onClick={() => handleDeleteHabit(habit.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Supprimer
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <CardDescription>
                    {habit.frequency === 'daily' ? 'Quotidien' : 'Hebdomadaire'} • {habit.streak || 0} jours
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {habit.description ? (
                    <p className="text-sm text-gray-500 dark:text-gray-400">{habit.description}</p>
                  ) : (
                    <p className="text-sm text-gray-400 dark:text-gray-500 italic">Aucune description</p>
                  )}
                </CardContent>
                <CardFooter className="pt-1">
                  <Button
                    className="w-full"
                    variant="outline"
                    onClick={() => updateHabitStreak(habit)}
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Marquer comme complété
                  </Button>
                </CardFooter>
              </Card>
            ))
          ) : (
            <div className="col-span-1 md:col-span-2 lg:col-span-3 text-center py-12">
              <div className="mx-auto bg-gray-100 dark:bg-gray-800 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                <CheckCircle2 className="h-8 w-8 text-gray-500" />
              </div>
              <h3 className="text-lg font-medium mb-2">Aucune habitude</h3>
              <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-6">
                Vous n'avez pas encore créé d'habitudes. Commencez à suivre vos habitudes pour améliorer votre vie quotidienne.
              </p>
              <Button onClick={() => setIsDialogOpen(true)}>
                <FilePlus className="mr-2 h-4 w-4" />
                Ajouter une habitude
              </Button>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default HabitsPage;
