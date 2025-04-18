
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

// Helper function to generate UUID
function generateUUID() {
  // Simple UUID v4 implementation
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

interface UseIndexedDBOptions {
  storeName: string;
  initialData?: any[];
  autoSync?: boolean;
}

export function useIndexedDB<T extends { id: string }>({ 
  storeName, 
  initialData = [],
  autoSync = true 
}: UseIndexedDBOptions) {
  const [data, setData] = useState<T[]>(initialData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { currentUser } = useAuth();

  // Ensure unique store name per user
  const userStoreKey = `${storeName}_${currentUser?.uid || 'anonymous'}`;

  // Load data from localStorage (always do this first as a fallback)
  const loadFromLocalStorage = useCallback(() => {
    try {
      const storedData = localStorage.getItem(userStoreKey);
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        return parsedData;
      }
      return null;
    } catch (err) {
      console.error('Error loading from localStorage:', err);
      return null;
    }
  }, [userStoreKey]);

  // Save data to localStorage (always do this as a reliable fallback)
  const saveToLocalStorage = useCallback((newData: T[]) => {
    try {
      localStorage.setItem(userStoreKey, JSON.stringify(newData));
    } catch (err) {
      console.error('Error saving to localStorage:', err);
    }
  }, [userStoreKey]);

  // Send message to service worker
  const sendToServiceWorker = useCallback((message: any) => {
    if (navigator.serviceWorker && navigator.serviceWorker.controller) {
      try {
        navigator.serviceWorker.controller.postMessage(message);
        return true;
      } catch (err) {
        console.error('Error sending message to service worker:', err);
        return false;
      }
    }
    return false;
  }, []);

  // Load data
  const loadData = useCallback(async () => {
    setLoading(true);
    
    // First, always try to load from localStorage as a reliable source
    const localData = loadFromLocalStorage();
    if (localData) {
      setData(localData);
    }
    
    try {
      // Then try to get data from service worker/IndexedDB
      if (!navigator.serviceWorker || !navigator.serviceWorker.controller) {
        // If no service worker, we've already loaded from localStorage
        setLoading(false);
        return;
      }
      
      // Create a channel for the service worker to respond on
      const messageChannel = new MessageChannel();
      
      // Listen for response from service worker
      const messageHandler = (event: MessageEvent) => {
        if (event.data && event.data.type === 'DATA_RESPONSE' && event.data.storeName === userStoreKey) {
          const swData = event.data.data;
          // Only update if we got actual data and it's different from what we have
          if (swData && swData.length > 0 && JSON.stringify(swData) !== JSON.stringify(data)) {
            setData(swData);
            // Also update localStorage for consistency
            saveToLocalStorage(swData);
          }
          setLoading(false);
          navigator.serviceWorker.removeEventListener('message', messageHandler);
        }
      };
      
      navigator.serviceWorker.addEventListener('message', messageHandler);
      
      // Request data from service worker
      const clientId = Math.random().toString(36).substring(2, 15);
      sendToServiceWorker({
        type: 'GET_DATA',
        storeName: userStoreKey,
        clientId
      });
      
      // Fallback timeout - if service worker doesn't respond in 2 seconds
      // we'll consider localStorage data as authoritative
      setTimeout(() => {
        setLoading(false);
        navigator.serviceWorker.removeEventListener('message', messageHandler);
      }, 2000);
      
    } catch (err) {
      console.error('Error in loadData:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
      setLoading(false);
    }
  }, [data, userStoreKey, sendToServiceWorker, saveToLocalStorage, loadFromLocalStorage]);

  // Save data 
  const saveData = useCallback((newData: T[]) => {
    try {
      // Always update local state
      setData(newData);
      
      // Always save to localStorage as backup
      saveToLocalStorage(newData);
      
      // Try to save to IndexedDB via service worker
      if (navigator.serviceWorker && navigator.serviceWorker.controller) {
        sendToServiceWorker({
          type: 'SAVE_DATA',
          storeName: userStoreKey,
          data: newData
        });
      }
    } catch (err) {
      console.error('Error saving data:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
    }
  }, [userStoreKey, sendToServiceWorker, saveToLocalStorage]);

  // Add an item
  const addItem = useCallback((item: Omit<T, 'id'>) => {
    try {
      const newItem = { ...item, id: generateUUID() } as T;
      const newData = [...data, newItem];
      saveData(newData);
      return newItem;
    } catch (err) {
      console.error('Error adding item:', err);
      toast.error('Erreur lors de l\'ajout de l\'élément');
      return null;
    }
  }, [data, saveData]);

  // Update an item
  const updateItem = useCallback((id: string, updates: Partial<T>) => {
    try {
      const itemExists = data.some(item => item.id === id);
      if (!itemExists) {
        console.warn(`Attempted to update non-existent item with id: ${id}`);
        return null;
      }
      
      const newData = data.map(item => 
        item.id === id ? { ...item, ...updates } as T : item
      );
      saveData(newData);
      return newData.find(item => item.id === id);
    } catch (err) {
      console.error('Error updating item:', err);
      toast.error('Erreur lors de la mise à jour de l\'élément');
      return null;
    }
  }, [data, saveData]);

  // Delete an item
  const deleteItem = useCallback((id: string) => {
    try {
      const itemExists = data.some(item => item.id === id);
      if (!itemExists) {
        console.warn(`Attempted to delete non-existent item with id: ${id}`);
        return false;
      }
      
      const newData = data.filter(item => item.id !== id);
      saveData(newData);
      return true;
    } catch (err) {
      console.error('Error deleting item:', err);
      toast.error('Erreur lors de la suppression de l\'élément');
      return false;
    }
  }, [data, saveData]);

  // Initial load
  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto sync when coming back online
  useEffect(() => {
    if (!autoSync) return;
    
    const handleOnline = () => {
      toast.info("Connexion rétablie, synchronisation des données...");
      loadData();
      
      if (navigator.serviceWorker && navigator.serviceWorker.controller) {
        sendToServiceWorker({
          type: 'APP_ACTIVE'
        });
      }
    };
    
    window.addEventListener('online', handleOnline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
    };
  }, [autoSync, sendToServiceWorker, loadData]);

  return {
    data,
    loading,
    error,
    loadData,
    addItem,
    updateItem,
    deleteItem,
    saveData
  };
}
