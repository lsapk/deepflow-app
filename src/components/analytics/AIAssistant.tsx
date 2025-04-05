
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Bot, Send } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface AIAssistantProps {
  message: string;
}

const AIAssistant: React.FC<AIAssistantProps> = ({ message }) => {
  const [userQuery, setUserQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState(message);

  const handleQuerySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userQuery.trim()) return;
    
    setIsLoading(true);
    
    try {
      // In a real implementation, this would call your API with the OpenAI key
      // For now, we'll simulate a response
      setTimeout(() => {
        setAiResponse(`Basé sur votre question "${userQuery}": ${message}`);
        setUserQuery('');
        setIsLoading(false);
      }, 1000);
      
      // Example of how you would implement the real API call:
      /*
      const response = await fetch('/api/analytics/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: userQuery })
      });
      
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      
      setAiResponse(data.response);
      */
    } catch (error) {
      console.error('Error querying AI assistant:', error);
      toast.error('Impossible de traiter votre demande pour le moment.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 dark:from-blue-950/40 dark:to-indigo-950/40 dark:border-blue-800">
      <CardContent className="pt-6 space-y-4">
        <div className="flex items-start gap-4">
          <div className="bg-blue-600 text-white p-2 rounded-full shrink-0">
            <Bot size={20} />
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-blue-700 dark:text-blue-400 mb-1">
              Assistant IA
            </h3>
            <p className="text-gray-700 dark:text-gray-300">
              {aiResponse}
            </p>
          </div>
        </div>
        
        <form onSubmit={handleQuerySubmit} className="flex items-center gap-2 pt-2">
          <Input
            value={userQuery}
            onChange={(e) => setUserQuery(e.target.value)}
            placeholder="Posez une question sur vos données..."
            className="flex-1"
            disabled={isLoading}
          />
          <Button 
            type="submit" 
            size="icon" 
            disabled={isLoading}
            className="shrink-0"
          >
            <Send size={18} />
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default AIAssistant;
