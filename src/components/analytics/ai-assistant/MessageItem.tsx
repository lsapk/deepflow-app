
import * as React from 'react';
import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Message } from './types';
import ReactMarkdown from 'react-markdown';
import { Bot, Copy, User, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface MessageItemProps {
  message: Message;
  isFirst?: boolean;
}

export const MessageItem: React.FC<MessageItemProps> = ({ message, isFirst }) => {
  const [isCopied, setIsCopied] = useState(false);
  const isUser = message.role === 'user';
  const isAI = message.role === 'assistant';

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setIsCopied(true);
    toast.success('Message copié');
    setTimeout(() => setIsCopied(false), 2000);
  };

  // Format the timestamp
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div
      className={cn(
        "flex w-full gap-3 py-3",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      {!isUser && (
        <Avatar className="h-8 w-8 bg-primary/10">
          <AvatarFallback className="bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200">
            <Bot size={16} />
          </AvatarFallback>
        </Avatar>
      )}

      <div
        className={cn(
          "flex flex-col space-y-1 max-w-[80%]",
          isUser ? "items-end" : "items-start"
        )}
      >
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">
            {isUser ? 'Vous' : 'Gemini AI'}
          </span>
          <span className="text-xs text-muted-foreground/60">
            {message.timestamp ? formatTime(message.timestamp) : ''}
          </span>
        </div>

        <div
          className={cn(
            "rounded-lg px-4 py-3 text-sm",
            isUser
              ? "bg-primary text-primary-foreground"
              : "bg-muted"
          )}
        >
          <div className="prose prose-sm dark:prose-invert max-w-none overflow-auto">
            <ReactMarkdown>{message.content}</ReactMarkdown>
          </div>
        </div>

        {isAI && (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 rounded-full"
            onClick={handleCopy}
          >
            {isCopied ? <Check size={12} /> : <Copy size={12} />}
          </Button>
        )}
      </div>

      {isUser && (
        <Avatar className="h-8 w-8">
          <AvatarFallback className="bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200">
            <User size={16} />
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
};

export default MessageItem;
