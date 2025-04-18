
import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import MessageItem from './MessageItem';
import { MessageListProps } from './types';

const MessageList: React.FC<MessageListProps> = ({ messages, messagesEndRef }) => {
  return (
    <ScrollArea className="flex-1 pr-2 mb-4">
      <div className="space-y-0.5">
        {messages.map((message, index) => (
          <MessageItem key={index} message={message} />
        ))}
        <div ref={messagesEndRef} />
      </div>
    </ScrollArea>
  );
};

export default MessageList;
