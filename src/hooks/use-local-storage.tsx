
import { useState, useEffect } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] {
  // Fonction pour récupérer la valeur depuis localStorage
  const readValue = (): T => {
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch (error) {
      console.warn(`Erreur lors de la lecture de localStorage pour la clé "${key}":`, error);
      return initialValue;
    }
  };

  // État pour stocker notre valeur
  const [storedValue, setStoredValue] = useState<T>(readValue);

  // Fonction pour mettre à jour la valeur et l'enregistrer dans localStorage
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      // Permet de passer une fonction comme pour useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      
      // Enregistre dans l'état
      setStoredValue(valueToStore);
      
      // Enregistre dans localStorage
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.warn(`Erreur lors de l'enregistrement dans localStorage pour la clé "${key}":`, error);
    }
  };

  useEffect(() => {
    // Mettre à jour l'état si le localStorage est modifié dans un autre onglet/fenêtre
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === key && event.newValue) {
        setStoredValue(JSON.parse(event.newValue));
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key]);

  return [storedValue, setValue];
}
