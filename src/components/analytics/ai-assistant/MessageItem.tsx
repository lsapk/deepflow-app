
import React from 'react';
import { Bot, User } from 'lucide-react';
import { MessageItemProps } from './types';

const MessageItem: React.FC<MessageItemProps> = ({ message }) => {
  return (
    <div className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
      <div 
        className={`max-w-[80%] rounded-lg p-3 ${
          message.role === 'user' 
            ? 'bg-blue-600 text-white ml-8' 
            : 'bg-gray-100 dark:bg-gray-800 mr-8'
        }`}
      >
        <div className="flex items-center gap-2 mb-1">
          {message.role === 'assistant' ? (
            <Bot size={14} className="text-blue-600 dark:text-blue-400" />
          ) : (
            <User size={14} />
          )}
          <span className="text-xs opacity-70">
            {message.timestamp.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
      </div>
    </div>
  );
};

export default MessageItem;
