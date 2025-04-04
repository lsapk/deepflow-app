
import React from 'react';
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const FocusTips: React.FC = () => {
  return (
    <>
      <CardHeader>
        <CardTitle>Conseils</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="text-sm text-gray-500 dark:text-gray-400 space-y-1">
          <li>• Éliminez les distractions pendant les sessions</li>
          <li>• Prenez une courte pause entre les sessions</li>
          <li>• Définissez un objectif clair pour chaque session</li>
          <li>• Alternez 25 minutes de travail et 5 minutes de pause</li>
          <li>• Après 4 sessions, prenez une pause plus longue</li>
        </ul>
      </CardContent>
    </>
  );
};
