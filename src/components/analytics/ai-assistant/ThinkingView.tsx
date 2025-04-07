
import React from 'react';
import { useSystemPrompt } from './useSystemPrompt';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Code } from 'lucide-react';

const ThinkingView: React.FC = () => {
  const { prepareSystemPrompt } = useSystemPrompt();
  const systemPrompt = prepareSystemPrompt();

  return (
    <ScrollArea className="flex-1 pr-2 mb-4">
      <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4 text-xs font-mono text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2 mb-3 text-indigo-600 dark:text-indigo-400">
          <Code size={16} />
          <span className="font-semibold">Données fournies à l'assistant</span>
        </div>
        <Separator className="mb-3" />
        <pre className="whitespace-pre-wrap">{systemPrompt}</pre>
      </div>
    </ScrollArea>
  );
};

export default ThinkingView;
