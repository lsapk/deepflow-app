
import { useIndexedDB } from '@/hooks/use-indexed-db';

// Define the Event type
export interface PlanningEvent {
  id: string;
  title: string;
  description?: string;
  date: string;
  time?: string;
  allDay: boolean;
  category?: string;
  color?: string;
  completed?: boolean;
  user_id?: string;
  created_at: string;
  updated_at: string;
}

// Hook for accessing planning events
export const usePlanningEvents = () => {
  return useIndexedDB<PlanningEvent>({
    storeName: 'planning',
    initialData: []
  });
};

// Format date for display, respecting user's clock format preference
export const formatEventTime = (date: string, time: string | undefined, clockFormat: string = '24h') => {
  if (!time) return 'Toute la journée';
  
  try {
    const [hours, minutes] = time.split(':').map(Number);
    
    if (clockFormat === '12h') {
      const period = hours >= 12 ? 'PM' : 'AM';
      const hours12 = hours % 12 || 12;
      return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`;
    } else {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    }
  } catch (error) {
    console.error('Error formatting time:', error);
    return time;
  }
};

// Create a new planning event with current timestamps
export const createPlanningEvent = (event: Omit<PlanningEvent, 'id' | 'created_at' | 'updated_at'>): Omit<PlanningEvent, 'id'> => {
  const now = new Date().toISOString();
  return {
    ...event,
    created_at: now,
    updated_at: now
  };
};

// Update a planning event with the current timestamp
export const updatePlanningEvent = (event: Partial<PlanningEvent> & { id: string }): Partial<PlanningEvent> => {
  return {
    ...event,
    updated_at: new Date().toISOString()
  };
};
