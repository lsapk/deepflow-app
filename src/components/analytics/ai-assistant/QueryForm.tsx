
import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send, RefreshCw } from 'lucide-react';
import { QueryFormProps } from './types';

const QueryForm: React.FC<QueryFormProps> = ({ 
  query, 
  setQuery, 
  handleQuerySubmit, 
  isLoading 
}) => {
  return (
    <form onSubmit={handleQuerySubmit} className="flex items-center gap-2 pt-2">
      <Input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
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
        {isLoading ? <RefreshCw size={18} className="animate-spin" /> : <Send size={18} />}
      </Button>
    </form>
  );
};

export default QueryForm;
