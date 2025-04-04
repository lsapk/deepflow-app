
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Bot } from 'lucide-react';

interface AIAssistantProps {
  message: string;
}

const AIAssistant: React.FC<AIAssistantProps> = ({ message }) => {
  return (
    <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 dark:from-blue-950/40 dark:to-indigo-950/40 dark:border-blue-800">
      <CardContent className="pt-6">
        <div className="flex items-start gap-4">
          <div className="bg-blue-600 text-white p-2 rounded-full">
            <Bot size={20} />
          </div>
          <div>
            <h3 className="font-medium text-blue-700 dark:text-blue-400 mb-1">
              Insight AI
            </h3>
            <p className="text-gray-700 dark:text-gray-300">
              {message}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AIAssistant;
