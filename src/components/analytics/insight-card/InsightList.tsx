
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { InsightItem as InsightItemComponent } from './InsightItem';
import { InsightItem as InsightItemType } from './types';

interface InsightListProps {
  insights: InsightItemType[];
}

export const InsightList: React.FC<InsightListProps> = ({ insights }) => {
  const [showAll, setShowAll] = useState(false);
  
  return (
    <div className="space-y-4">
      {insights.slice(0, showAll ? insights.length : 3).map((insight, index) => (
        <InsightItemComponent key={insight.id} insight={insight} index={index} />
      ))}
      
      {insights.length > 3 && (
        <Button 
          variant="ghost" 
          size="sm" 
          className="w-full" 
          onClick={() => setShowAll(!showAll)}
        >
          {showAll ? "Afficher moins" : "Afficher plus"}
        </Button>
      )}
    </div>
  );
};
