import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, Plus, Trophy, TrendingUp, Calendar, CheckCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { useHabits, Habit, shouldCompleteToday } from '@/services/habitService';

export const HabitsWidget = () => {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { data: storedHabits, updateItem } = useHabits();
  
  useEffect(() => {
    const fetchHabits = async () => {
      try {
        setLoading(true);
        
        if (storedHabits && storedHabits.length > 0) {
          setHabits(storedHabits);
        }
      } catch (error) {
        console.error("Erreur lors du chargement des habitudes:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchHabits();
  }, [storedHabits]);
  
  const completeHabit = async (habit: Habit) => {
    try {
      const today = new Date();
      const updatedHabit = {
        ...habit,
        streak: (habit.streak || 0) + 1,
        last_completed: today.toISOString()
      };

      updateItem(habit.id, updatedHabit);
      
      toast({
        title: "Habitude complétée !",
        description: "Votre habitude a été marquée comme complétée.",
        variant: "default"
      });
    } catch (error) {
      console.error("Erreur lors de la complétion de l'habitude:", error);
      toast({
        title: "Erreur",
        description: "Erreur lors de la mise à jour de l'habitude",
        variant: "destructive"
      });
    }
  };
  
  const isHabitCompletedToday = (habit: Habit): boolean => {
    if (!habit.last_completed) return false;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const lastCompleted = new Date(habit.last_completed);
    lastCompleted.setHours(0, 0, 0, 0);
    
    return lastCompleted.getTime() === today.getTime();
  };
  
  const filterHabitsForToday = (habits: Habit[]): Habit[] => {
    return habits.filter(habit => shouldCompleteToday(habit))
      .slice(0, 3); // Limiter à 3 habitudes pour le widget
  };
  
  const habitsToShow = filterHabitsForToday(habits);
  const maxStreak = habits.length > 0 ? Math.max(...habits.map(h => h.streak || 0)) : 0;
  
  return (
    <Card className="shadow-md">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCheck className="h-5 w-5 text-green-500" />
            <CardTitle>Mes habitudes</CardTitle>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-green-600 hover:text-green-700 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-900/20"
            onClick={() => navigate('/habits')}
          >
            Voir tout
          </Button>
        </div>
        <CardDescription>Suivez vos habitudes quotidiennes</CardDescription>
      </CardHeader>
      
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-4/5" />
                </div>
              </div>
            ))}
          </div>
        ) : habitsToShow.length > 0 ? (
          <ul className="space-y-3">
            <AnimatePresence>
              {habitsToShow.map(habit => {
                const isCompleted = isHabitCompletedToday(habit);
                const target = habit.target_days?.length || 7;
                return (
                  <motion.li 
                    key={habit.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="rounded-lg border p-3 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className={`h-5 w-5 ${isCompleted ? 'text-green-500' : 'text-muted-foreground'}`} />
                          <span className="font-medium">{habit.title}</span>
                        </div>
                        
                        <div className="mt-2">
                          <Progress 
                            value={Math.min(100, ((habit.streak || 0) / target) * 100)} 
                            className="h-2"
                          />
                          <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                            <span>Streak: {habit.streak || 0} jours</span>
                            <span>Objectif: {target} jours</span>
                          </div>
                        </div>
                      </div>
                      
                      <Button 
                        size="sm" 
                        variant={isCompleted ? "outline" : "default"}
                        className={isCompleted ? "bg-green-100 text-green-700 border-green-200 hover:bg-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800" : ""}
                        onClick={() => !isCompleted && completeHabit(habit)}
                        disabled={isCompleted}
                      >
                        {isCompleted ? 'Fait ✓' : 'Compléter'}
                      </Button>
                    </div>
                  </motion.li>
                );
              })}
            </AnimatePresence>
          </ul>
        ) : (
          <div className="text-center py-6">
            <div className="bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-full p-3 w-14 h-14 mx-auto mb-4 flex items-center justify-center">
              <Calendar className="h-7 w-7" />
            </div>
            <h3 className="font-medium mb-1">Aucune habitude</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Créez des habitudes pour suivre votre progression quotidienne
            </p>
            <Button
              onClick={() => navigate('/habits')}
              className="bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800"
            >
              <Plus className="h-4 w-4 mr-2" />
              Ajouter une habitude
            </Button>
          </div>
        )}
      </CardContent>
      
      {habits.length > 0 && (
        <CardFooter className="border-t pt-4 flex justify-between bg-muted/40">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Trophy className="h-4 w-4 text-amber-500" />
            <span>Meilleur streak: {maxStreak} jours</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <TrendingUp className="h-4 w-4 text-blue-500" />
            <span>{habits.length} habitudes actives</span>
          </div>
        </CardFooter>
      )}
    </Card>
  );
};
