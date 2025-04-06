
import React from 'react';
import { Bot } from 'lucide-react';
import { AssistantHeaderProps } from './types';

const AssistantHeader: React.FC<AssistantHeaderProps> = ({ title }) => {
  return (
    <div className="flex items-center gap-2 mb-4">
      <div className="bg-blue-600 text-white p-1.5 rounded-full">
        <Bot size={18} />
      </div>
      <h3 className="font-medium text-lg text-blue-700 dark:text-blue-400">
        {title}
      </h3>
    </div>
  );
};

export default AssistantHeader;
