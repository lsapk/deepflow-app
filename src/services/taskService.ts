
import { useIndexedDB } from '@/hooks/use-indexed-db';

// Define the Task type
export interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'todo' | 'in_progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  due_date?: string;
  category?: string;
  completed: boolean;
  created_at?: string;
  updated_at?: string;
  user_id?: string;
}

// Hook for accessing tasks
export const useTasks = () => {
  return useIndexedDB<Task>({
    storeName: 'tasks',
    initialData: []
  });
};

// Format date for display
export const formatDueDate = (date: string | undefined) => {
  if (!date) return '';
  
  const dueDate = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  if (dueDate.getTime() === today.getTime()) {
    return "Aujourd'hui";
  } else if (dueDate.getTime() === tomorrow.getTime()) {
    return "Demain";
  } else if (dueDate.getTime() === yesterday.getTime()) {
    return "Hier";
  }
  
  return dueDate.toLocaleDateString('fr-FR', { 
    day: 'numeric', 
    month: 'short', 
    year: 'numeric' 
  });
};
