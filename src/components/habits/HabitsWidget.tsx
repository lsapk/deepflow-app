
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, Plus, Trophy, TrendingUp, Calendar, CheckCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { collection, query, where, orderBy, limit, getDocs, doc, updateDoc, increment, serverTimestamp } from 'firebase/firestore';
import { db } from '@/services/firebase';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';

interface Habit {
  id: string;
  title: string;
  description?: string;
  frequency: 'daily' | 'weekly';
  streak: number;
  target: number;
  lastCompletedAt?: any;
  category?: string;
  completed?: boolean;
  userId: string;
}

export const HabitsWidget = () => {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchHabits = async () => {
      if (!currentUser) return;
      
      try {
        setLoading(true);
        
        const habitsQuery = query(
          collection(db, 'habits'),
          where('userId', '==', currentUser.uid),
          orderBy('streak', 'desc'),
          limit(4)
        );
        
        const snapshot = await getDocs(habitsQuery);
        const habitsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          completed: false // Initialiser l'état de complétion
        })) as Habit[];
        
        setHabits(habitsData);
      } catch (error) {
        console.error("Erreur lors du chargement des habitudes:", error);
        toast.error("Erreur lors du chargement des habitudes");
      } finally {
        setLoading(false);
      }
    };
    
    fetchHabits();
  }, [currentUser]);
  
  const completeHabit = async (habitId: string) => {
    if (!currentUser) return;
    
    try {
      const habitRef = doc(db, 'habits', habitId);
      const now = new Date();
      
      // Mettre à jour le streak et la date de dernière complétion
      await updateDoc(habitRef, {
        streak: increment(1),
        lastCompletedAt: serverTimestamp()
      });
      
      // Mettre à jour l'état local
      setHabits(prevHabits => 
        prevHabits.map(habit => 
          habit.id === habitId ? { ...habit, streak: habit.streak + 1, completed: true } : habit
        )
      );
      
      toast.success("Habitude complétée !");
    } catch (error) {
      console.error("Erreur lors de la complétion de l'habitude:", error);
      toast.error("Erreur lors de la mise à jour de l'habitude");
    }
  };
  
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
        ) : habits.length > 0 ? (
          <ul className="space-y-3">
            <AnimatePresence>
              {habits.map(habit => (
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
                        <CheckCircle2 className={`h-5 w-5 ${habit.completed ? 'text-green-500' : 'text-muted-foreground'}`} />
                        <span className="font-medium">{habit.title}</span>
                      </div>
                      
                      <div className="mt-2">
                        <Progress 
                          value={Math.min(100, (habit.streak / habit.target) * 100)} 
                          className="h-2"
                        />
                        <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                          <span>Streak: {habit.streak} jours</span>
                          <span>Objectif: {habit.target} jours</span>
                        </div>
                      </div>
                    </div>
                    
                    <Button 
                      size="sm" 
                      variant={habit.completed ? "outline" : "default"}
                      className={habit.completed ? "bg-green-100 text-green-700 border-green-200 hover:bg-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800" : ""}
                      onClick={() => completeHabit(habit.id)}
                      disabled={habit.completed}
                    >
                      {habit.completed ? 'Fait ✓' : 'Compléter'}
                    </Button>
                  </div>
                </motion.li>
              ))}
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
            <span>Meilleur streak: {Math.max(...habits.map(h => h.streak), 0)} jours</span>
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
