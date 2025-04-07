
import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send, Sparkles, RefreshCw } from 'lucide-react';
import { QueryFormProps } from './types';

const QueryForm: React.FC<QueryFormProps> = ({ 
  query, 
  setQuery, 
  handleQuerySubmit, 
  isLoading 
}) => {
  const quickQuestions = [
    "Comment améliorer ma productivité ?",
    "Analyse mes habitudes",
    "Suggère-moi un plan d'action",
    "Analyse mes tendances de concentration"
  ];

  const handleQuickQuestion = (question: string) => {
    setQuery(question);
  };

  return (
    <div className="space-y-3 pt-2">
      <div className="flex flex-wrap gap-2">
        {quickQuestions.map((question, index) => (
          <Button
            key={index}
            variant="outline"
            size="sm"
            onClick={() => handleQuickQuestion(question)}
            disabled={isLoading}
            className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 text-xs px-2 py-1 h-auto rounded-full border-blue-100 dark:border-blue-800 hover:border-blue-300 dark:hover:border-blue-700"
          >
            <Sparkles size={12} className="mr-1.5 text-indigo-500" />
            {question}
          </Button>
        ))}
      </div>
      
      <form onSubmit={handleQuerySubmit} className="flex items-center gap-2">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Posez une question sur vos données..."
          className="flex-1 border-blue-200 dark:border-blue-800 rounded-full bg-white dark:bg-slate-900"
          disabled={isLoading}
        />
        <Button 
          type="submit" 
          size="icon" 
          disabled={isLoading || !query.trim()}
          className="rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md"
        >
          {isLoading ? <RefreshCw size={18} className="animate-spin" /> : <Send size={18} />}
        </Button>
      </form>
    </div>
  );
};

export default QueryForm;
