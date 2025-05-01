
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Maximize2, Minimize2, Sparkles } from 'lucide-react';
import AssistantHeader from './ai-assistant/AssistantHeader';
import MessageList from './ai-assistant/MessageList';
import ThinkingView from './ai-assistant/ThinkingView';
import QueryForm from './ai-assistant/QueryForm';
import { useAssistantLogic } from './ai-assistant/useAssistantLogic';
import { AIAssistantProps } from './ai-assistant/types';
import { motion, AnimatePresence } from 'framer-motion';

const AIAssistant: React.FC<AIAssistantProps> = ({ 
  initialMessage = "Bonjour! Je suis votre assistant IA personnel propulsé par Gemini. Je peux vous aider à analyser vos données de productivité et répondre à vos questions. N'hésitez pas à me demander des conseils sur votre organisation, vos habitudes ou votre concentration.",
  maxHistory = 10 
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const {
    query,
    setQuery,
    isLoading,
    isThinking,
    toggleThinking,
    messages,
    messagesEndRef,
    handleQuerySubmit,
    memoryMode,
    toggleMemoryMode
  } = useAssistantLogic(initialMessage, maxHistory);

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // Effet pour gérer la classe du body quand on est en plein écran
  useEffect(() => {
    if (isFullscreen) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }
    
    return () => {
      document.body.classList.remove('overflow-hidden');
    };
  }, [isFullscreen]);

  return (
    <AnimatePresence>
      <motion.div 
        className={`transition-all duration-300 z-50 ${isFullscreen ? 'fixed inset-0 bg-black/50 flex items-center justify-center p-4' : ''}`}
        initial={false}
        animate={isFullscreen ? { opacity: 1 } : { opacity: 1 }}
      >
        <motion.div 
          className="w-full h-full"
          initial={false}
          animate={isFullscreen ? { scale: 1 } : { scale: 1 }}
        >
          <Card className={`flex flex-col bg-gradient-to-b from-blue-50/80 to-indigo-50/80 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200 dark:border-blue-800 shadow-xl rounded-xl ${isFullscreen ? 'h-full max-h-full' : 'h-full max-h-[600px]'}`}>
            <CardContent className="flex flex-col h-full p-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Sparkles size={18} className="text-blue-500" />
                  <AssistantHeader 
                    title="Assistant Gemini" 
                    toggleThinking={toggleThinking}
                    isThinking={isThinking}
                    toggleMemoryMode={toggleMemoryMode}
                    memoryMode={memoryMode}
                  />
                </div>
                
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleFullscreen}
                  className="ml-auto"
                >
                  {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                </Button>
              </div>
              
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
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AIAssistant;
