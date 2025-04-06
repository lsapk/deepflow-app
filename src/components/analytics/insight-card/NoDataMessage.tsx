
import React from 'react';
import { AlertCircle } from 'lucide-react';

export const NoDataMessage: React.FC = () => (
  <div className="flex flex-col items-center justify-center py-6 text-center">
    <AlertCircle className="h-12 w-12 text-gray-300 dark:text-gray-600 mb-3" />
    <h3 className="text-lg font-medium mb-2">Pas encore de données disponibles</h3>
    <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs">
      Utilisez les fonctionnalités de l'application pour recevoir des insights personnalisés.
    </p>
  </div>
);
