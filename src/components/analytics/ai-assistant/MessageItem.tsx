
import React from 'react';
import { Bot, User } from 'lucide-react';
import { MessageItemProps } from './types';
import { cn } from '@/lib/utils';

const MessageItem: React.FC<MessageItemProps> = ({ message }) => {
  const isAssistant = message.role === 'assistant';
  
  return (
    <div className={`flex ${isAssistant ? 'justify-start' : 'justify-end'} mb-4`}>
      {isAssistant && (
        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white mr-2 shadow-md">
          <Bot size={16} />
        </div>
      )}
      
      <div 
        className={cn(
          "max-w-[80%] rounded-2xl p-3.5 shadow-sm",
          isAssistant 
            ? "bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/60 dark:to-indigo-950/60 text-slate-700 dark:text-slate-200" 
            : "bg-gradient-to-r from-blue-500 to-indigo-600 text-white"
        )}
      >
        <div className="text-sm whitespace-pre-wrap leading-relaxed">
          {message.content}
        </div>
        <div className="mt-1.5 text-xs opacity-70 text-right">
          {message.timestamp.toLocaleTimeString('fr-FR', { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </div>
      </div>
      
      {!isAssistant && (
        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white ml-2 shadow-md">
          <User size={16} />
        </div>
      )}
    </div>
  );
};

export default MessageItem;
