
import { useIndexedDB } from '@/hooks/use-indexed-db';

// Define the Habit type
export interface Habit {
  id: string;
  title: string;
  description?: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  target_days?: number[]; // For weekly habits: 0 = Sunday, 1 = Monday, etc.
  streak: number;
  longest_streak: number;
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

// Hook for accessing habits
export const useHabits = () => {
  return useIndexedDB<Habit>({
    storeName: 'habits',
    initialData: []
  });
};

// Get all habits from IndexedDB
export const getAllHabits = async (): Promise<Habit[]> => {
  // Access IndexedDB directly to get all habits
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('deepflow-db', 1);

    request.onerror = (event) => {
      console.error('Error opening IndexedDB:', event);
      resolve([]);
    };

    request.onsuccess = (event) => {
      const db = request.result;
      if (!db.objectStoreNames.contains('habits')) {
        resolve([]);
        return;
      }

      const transaction = db.transaction(['habits'], 'readonly');
      const store = transaction.objectStore('habits');
      const getAllRequest = store.getAll();

      getAllRequest.onsuccess = () => {
        resolve(getAllRequest.result || []);
      };

      getAllRequest.onerror = (event) => {
        console.error('Error getting habits:', event);
        resolve([]);
      };
    };
  });
};

// Check if a habit should be completed today
export const shouldCompleteToday = (habit: Habit) => {
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
  
  if (habit.frequency === 'daily') {
    return true;
  }
  
  if (habit.frequency === 'weekly' && habit.target_days) {
    return habit.target_days.includes(dayOfWeek);
  }
  
  if (habit.frequency === 'monthly') {
    const lastCompleted = habit.last_completed ? new Date(habit.last_completed) : null;
    if (!lastCompleted) return true;
    
    // Check if the habit was completed this month
    return lastCompleted.getMonth() !== today.getMonth() || 
           lastCompleted.getFullYear() !== today.getFullYear();
  }
  
  return true;
};

// Calculate streak
export const calculateStreak = (habit: Habit): number => {
  if (!habit.completions || habit.completions.length === 0) {
    return 0;
  }
  
  // Sort completions by date (newest first)
  const sortedCompletions = [...habit.completions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // For daily habits
  if (habit.frequency === 'daily') {
    for (let i = 0; i < sortedCompletions.length; i++) {
      const completion = sortedCompletions[i];
      const completionDate = new Date(completion.date);
      completionDate.setHours(0, 0, 0, 0);
      
      // Check if the completion is from today
      if (i === 0 && completionDate.getTime() === today.getTime() && completion.completed) {
        streak = 1;
        continue;
      }
      
      // For previous days, check if they are consecutive
      const expectedDate = new Date(today);
      expectedDate.setDate(today.getDate() - i);
      
      if (completionDate.getTime() === expectedDate.getTime() && completion.completed) {
        streak++;
      } else {
        break;
      }
    }
  }
  
  // For weekly habits
  if (habit.frequency === 'weekly') {
    // Implementation depends on your specific requirements
    // This is a simplified version
    const thisWeekCompletions = sortedCompletions.filter(completion => {
      const completionDate = new Date(completion.date);
      const daysDiff = Math.floor((today.getTime() - completionDate.getTime()) / (1000 * 60 * 60 * 24));
      return daysDiff < 7 && completion.completed;
    });
    
    if (thisWeekCompletions.length > 0) {
      streak = 1;
      
      // Count previous weeks
      for (let weekOffset = 1; weekOffset < 52; weekOffset++) {
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - (7 * weekOffset));
        
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        
        const weekCompletions = sortedCompletions.filter(completion => {
          const completionDate = new Date(completion.date);
          return completionDate >= weekStart && completionDate <= weekEnd && completion.completed;
        });
        
        if (weekCompletions.length > 0) {
          streak++;
        } else {
          break;
        }
      }
    }
  }
  
  // For monthly habits
  if (habit.frequency === 'monthly') {
    // This month
    const thisMonth = today.getMonth();
    const thisYear = today.getFullYear();
    
    const thisMonthCompletion = sortedCompletions.find(completion => {
      const completionDate = new Date(completion.date);
      return completionDate.getMonth() === thisMonth && 
             completionDate.getFullYear() === thisYear &&
             completion.completed;
    });
    
    if (thisMonthCompletion) {
      streak = 1;
      
      // Count previous months
      for (let monthOffset = 1; monthOffset < 24; monthOffset++) {
        const targetMonth = new Date(thisYear, thisMonth - monthOffset, 1);
        
        const monthCompletion = sortedCompletions.find(completion => {
          const completionDate = new Date(completion.date);
          return completionDate.getMonth() === targetMonth.getMonth() && 
                 completionDate.getFullYear() === targetMonth.getFullYear() &&
                 completion.completed;
        });
        
        if (monthCompletion) {
          streak++;
        } else {
          break;
        }
      }
    }
  }
  
  return streak;
};
