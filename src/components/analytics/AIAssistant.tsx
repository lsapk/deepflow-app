
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import AssistantHeader from './ai-assistant/AssistantHeader';
import MessageList from './ai-assistant/MessageList';
import QueryForm from './ai-assistant/QueryForm';
import { useAssistantLogic } from './ai-assistant/useAssistantLogic';
import { AIAssistantProps } from './ai-assistant/types';

const AIAssistant: React.FC<AIAssistantProps> = ({ 
  initialMessage = "Bonjour! Je suis votre assistant IA personnel. Je peux vous aider à analyser vos données de productivité et répondre à vos questions." 
}) => {
  const {
    query,
    setQuery,
    isLoading,
    messages,
    messagesEndRef,
    handleQuerySubmit
  } = useAssistantLogic(initialMessage);

  return (
    <Card className="flex flex-col bg-gradient-to-b from-blue-50/50 to-indigo-50/50 dark:from-blue-950/30 dark:to-indigo-950/30 border-blue-200 dark:border-blue-800 h-full max-h-[600px]">
      <CardContent className="flex flex-col h-full p-4">
        <AssistantHeader title="Assistant Analytique" />
        
        <MessageList 
          messages={messages} 
          messagesEndRef={messagesEndRef} 
        />
        
        <Separator className="my-2" />
        
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
