
import React from 'react';
import { Bot, Eye, EyeOff } from 'lucide-react';
import { AssistantHeaderProps } from './types';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const AssistantHeader: React.FC<AssistantHeaderProps> = ({ 
  title, 
  toggleThinking, 
  isThinking 
}) => {
  return (
    <div className="flex items-center justify-between mb-4 pb-3 border-b border-blue-100 dark:border-blue-900">
      <div className="flex items-center gap-2">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-2 rounded-xl shadow-md">
          <Bot size={18} />
        </div>
        <h3 className="font-semibold text-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-transparent bg-clip-text">
          {title}
        </h3>
      </div>
      
      {toggleThinking && (
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleThinking}
          className={cn(
            "text-xs gap-1.5 px-2 py-1 h-auto",
            isThinking ? "text-indigo-600 dark:text-indigo-400" : "text-slate-500 dark:text-slate-400"
          )}
        >
          {isThinking ? (
            <>
              <EyeOff size={14} />
              <span>Masquer les données</span>
            </>
          ) : (
            <>
              <Eye size={14} />
              <span>Voir les données</span>
            </>
          )}
        </Button>
      )}
    </div>
  );
};

export default AssistantHeader;
