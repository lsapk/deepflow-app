
import React from 'react';
import { BarChart3 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface ProductivityScoreProps {
  score: number;
}

export const ProductivityScore: React.FC<ProductivityScoreProps> = ({ score }) => {
  return (
    <div className="mb-4">
      <h4 className="text-sm font-semibold mb-2 flex items-center">
        <BarChart3 className="h-4 w-4 mr-1 text-primary" />
        Score de productivité
      </h4>
      <Progress 
        value={score} 
        className="h-2.5 w-full" 
        indicatorClassName={`${
          score > 70 ? 'bg-green-600' : 
          score > 50 ? 'bg-amber-500' : 'bg-red-500'
        }`}
      />
      <div className="flex justify-between mt-1 text-xs text-gray-500 dark:text-gray-400">
        <span>0</span>
        <span>50</span>
        <span>100</span>
      </div>
    </div>
  );
};
