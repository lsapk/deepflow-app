
import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { Habit as HabitType, getHabits, createHabit, updateHabit, deleteHabit } from '@/services/supabase';
import { FilePlus, CheckCircle, CheckCircle2, MoreVertical, Trash2, Edit, AlertCircle } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { HabitsWidget } from '@/components/habits/HabitsWidget';

// Définir l'interface pour les valeurs du formulaire de nouvelle habitude
interface NewHabitFormValues {
  title: string;
  description: string;
  frequency: 'daily' | 'weekly';
  target: number;
  category: string;
}

const HabitsPage = () => {
  const { currentUser } = useAuth();
  const [habits, setHabits] = useState<HabitType[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentHabit, setCurrentHabit] = useState<HabitType | null>(null);
  
  const [formValues, setFormValues] = useState<NewHabitFormValues>({
    title: '',
    description: '',
    frequency: 'daily',
    target: 1,
    category: 'health'
  });

  useEffect(() => {
    if (currentUser) {
      fetchHabits();
    }
  }, [currentUser]);

  const fetchHabits = async () => {
    if (!currentUser) return;
    
    try {
      setLoading(true);
      const fetchedHabits = await getHabits(currentUser.uid);
      setHabits(fetchedHabits);
    } catch (error) {
      console.error("Error fetching habits:", error);
      // Pas de toast ici
    } finally {
      setLoading(false);
    }
  };

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
    if (!currentUser) return;
    
    try {
      if (!formValues.title.trim()) {
        // Pas de toast ici
        return;
      }
      
      if (isEditMode && currentHabit) {
        // Mise à jour d'une habitude existante
        const updatedHabit = await updateHabit(currentHabit.id, {
          ...formValues,
          user_id: currentUser.uid
        });
        
        setHabits(habits.map(h => h.id === updatedHabit.id ? updatedHabit : h));
      } else {
        // Création d'une nouvelle habitude
        const newHabit = await createHabit(currentUser.uid, {
          ...formValues,
          streak: 0
        });
        
        setHabits([newHabit, ...habits]);
      }
      
      resetForm();
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error saving habit:", error);
      // Pas de toast ici
    }
  };

  const handleEditHabit = (habit: HabitType) => {
    setCurrentHabit(habit);
    setFormValues({
      title: habit.title,
      description: habit.description || '',
      frequency: habit.frequency as 'daily' | 'weekly',
      target: habit.target,
      category: habit.category || 'health'
    });
    setIsEditMode(true);
    setIsDialogOpen(true);
  };

  const handleDeleteHabit = async (id: string) => {
    try {
      await deleteHabit(id);
      setHabits(habits.filter(habit => habit.id !== id));
      // Pas de toast ici
    } catch (error) {
      console.error("Error deleting habit:", error);
      // Pas de toast ici
    }
  };

  const updateHabitStreak = async (habit: HabitType) => {
    try {
      const updatedHabit = await updateHabit(habit.id, {
        streak: habit.streak + 1,
        last_completed_at: new Date().toISOString()
      });
      
      setHabits(habits.map(h => h.id === updatedHabit.id ? updatedHabit : h));
      // Pas de toast ici
    } catch (error) {
      console.error("Error updating habit streak:", error);
      // Pas de toast ici
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
            // États de chargement
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
                    {habit.frequency === 'daily' ? 'Quotidien' : 'Hebdomadaire'} • {habit.streak} jours
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
