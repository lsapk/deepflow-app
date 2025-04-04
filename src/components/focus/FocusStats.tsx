
import React from 'react';
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, Clock } from 'lucide-react';

interface FocusStatsProps {
  completedSessions: number;
  isActive: boolean;
  time: number;
  formatTime: (time: number) => string;
  totalFocusTime: number;
}

export const FocusStats: React.FC<FocusStatsProps> = ({
  completedSessions,
  isActive,
  time,
  formatTime,
  totalFocusTime,
}) => {
  return (
    <>
      <CardHeader>
        <CardTitle>Statistiques</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Sessions terminées aujourd'hui</span>
              <span className="text-sm font-medium">{completedSessions}</span>
            </div>
            <Progress value={completedSessions * 25} className="h-2" />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="flex items-center">
                <CheckCircle2 size={16} className="mr-2 text-green-500" />
                Session en cours
              </span>
              <span>{isActive ? formatTime(time) : "Inactif"}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center">
                <Clock size={16} className="mr-2 text-blue-500" />
                Temps de focus total
              </span>
              <span>{`${totalFocusTime} min`}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </>
  );
};
