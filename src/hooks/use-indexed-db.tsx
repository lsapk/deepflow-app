
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';

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

  // Send message to service worker
  const sendToServiceWorker = useCallback((message: any) => {
    if (navigator.serviceWorker && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage(message);
      return true;
    }
    return false;
  }, []);

  // Load data from IndexedDB
  const loadData = useCallback(async () => {
    if (!navigator.serviceWorker) {
      // Fallback to localStorage
      try {
        const storedData = localStorage.getItem(`${storeName}_${currentUser?.uid || 'anonymous'}`);
        if (storedData) {
          setData(JSON.parse(storedData));
        }
        setLoading(false);
      } catch (err) {
        console.error('Error loading from localStorage:', err);
        setError(err instanceof Error ? err : new Error(String(err)));
        setLoading(false);
      }
      return;
    }

    try {
      setLoading(true);
      
      // Request data from service worker
      const messageChannel = new MessageChannel();
      
      // Create a promise that will resolve when we get the response
      const dataPromise = new Promise<T[]>((resolve) => {
        messageChannel.port1.onmessage = (event) => {
          if (event.data.type === 'DATA_RESPONSE' && event.data.storeName === storeName) {
            resolve(event.data.data);
          }
        };
      });
      
      // Register for messages
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data.type === 'DATA_RESPONSE' && event.data.storeName === storeName) {
          setData(event.data.data);
          setLoading(false);
        }
      }, { once: true });
      
      // Get our client ID for the response
      const clientId = await self.clients?.matchAll({ type: 'window' })
        .then(clients => clients[0]?.id);
      
      // Send the request
      sendToServiceWorker({
        type: 'GET_DATA',
        storeName: `${storeName}_${currentUser?.uid || 'anonymous'}`,
        clientId
      });
      
      // Fallback if service worker doesn't respond in 1 second
      setTimeout(() => {
        try {
          const storedData = localStorage.getItem(`${storeName}_${currentUser?.uid || 'anonymous'}`);
          if (storedData) {
            setData(JSON.parse(storedData));
          }
          setLoading(false);
        } catch (err) {
          console.error('Fallback to localStorage error:', err);
        }
      }, 1000);
      
    } catch (err) {
      console.error('Error in loadData:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
      setLoading(false);
      
      // Fallback to localStorage
      try {
        const storedData = localStorage.getItem(`${storeName}_${currentUser?.uid || 'anonymous'}`);
        if (storedData) {
          setData(JSON.parse(storedData));
        }
      } catch (err) {
        console.error('Error in localStorage fallback:', err);
      }
    }
  }, [storeName, sendToServiceWorker, currentUser?.uid]);

  // Save data to IndexedDB and localStorage (as backup)
  const saveData = useCallback((newData: T[]) => {
    try {
      // Always update local state
      setData(newData);
      
      // Always save to localStorage as backup
      localStorage.setItem(`${storeName}_${currentUser?.uid || 'anonymous'}`, JSON.stringify(newData));
      
      // Try to save to IndexedDB via service worker
      if (navigator.serviceWorker && navigator.serviceWorker.controller) {
        sendToServiceWorker({
          type: 'SAVE_DATA',
          storeName: `${storeName}_${currentUser?.uid || 'anonymous'}`,
          data: newData
        });
      }
    } catch (err) {
      console.error('Error saving data:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
    }
  }, [storeName, sendToServiceWorker, currentUser?.uid]);

  // Add an item
  const addItem = useCallback((item: Omit<T, 'id'>) => {
    const newItem = { ...item, id: generateUUID() } as T;
    const newData = [...data, newItem];
    saveData(newData);
    return newItem;
  }, [data, saveData]);

  // Update an item
  const updateItem = useCallback((id: string, updates: Partial<T>) => {
    const newData = data.map(item => 
      item.id === id ? { ...item, ...updates } as T : item
    );
    saveData(newData);
    return newData.find(item => item.id === id);
  }, [data, saveData]);

  // Delete an item
  const deleteItem = useCallback((id: string) => {
    const newData = data.filter(item => item.id !== id);
    saveData(newData);
  }, [data, saveData]);

  // Initial load
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Auto sync when coming back online
  useEffect(() => {
    if (!autoSync) return;
    
    const handleOnline = () => {
      if (navigator.serviceWorker && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: 'APP_ACTIVE'
        });
      }
    };
    
    window.addEventListener('online', handleOnline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
    };
  }, [autoSync, sendToServiceWorker]);

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
