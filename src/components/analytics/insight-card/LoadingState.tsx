
import React from 'react';

export const LoadingState: React.FC = () => (
  <div className="flex flex-col items-center justify-center py-6 text-center">
    <div className="animate-spin h-8 w-8 border-t-2 border-b-2 border-primary rounded-full mb-3"></div>
    <p className="text-sm text-gray-500 dark:text-gray-400">Analyse en cours...</p>
  </div>
);
