
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import AssistantHeader from './ai-assistant/AssistantHeader';
import MessageList from './ai-assistant/MessageList';
import ThinkingView from './ai-assistant/ThinkingView';
import QueryForm from './ai-assistant/QueryForm';
import { useAssistantLogic } from './ai-assistant/useAssistantLogic';
import { AIAssistantProps } from './ai-assistant/types';

const AIAssistant: React.FC<AIAssistantProps> = ({ 
  initialMessage = "Bonjour! Je suis votre assistant IA personnel. Je peux vous aider à analyser vos données de productivité et répondre à vos questions. N'hésitez pas à me demander des conseils sur votre organisation, vos habitudes ou votre concentration.",
  maxHistory = 10 
}) => {
  const {
    query,
    setQuery,
    isLoading,
    isThinking,
    toggleThinking,
    messages,
    messagesEndRef,
    handleQuerySubmit
  } = useAssistantLogic(initialMessage, maxHistory);

  return (
    <Card className="flex flex-col bg-gradient-to-b from-blue-50/80 to-indigo-50/80 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200 dark:border-blue-800 shadow-xl rounded-xl h-full max-h-[600px]">
      <CardContent className="flex flex-col h-full p-4">
        <AssistantHeader 
          title="Assistant Analytique" 
          toggleThinking={toggleThinking}
          isThinking={isThinking}
        />
        
        {isThinking ? (
          <ThinkingView />
        ) : (
          <MessageList 
            messages={messages} 
            messagesEndRef={messagesEndRef} 
          />
        )}
        
        <Separator className="my-3 bg-blue-100 dark:bg-blue-900" />
        
        <QueryForm 
          query={query}
          setQuery={setQuery}
          handleQuerySubmit={handleQuerySubmit}
          isLoading={isLoading}
        />
      </CardContent>
    </Card>
  );
};

export default AIAssistant;
