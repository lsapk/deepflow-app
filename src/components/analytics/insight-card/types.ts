
export interface InsightItem {
  id: string;
  text: string;
  category: string;
  trend?: 'up' | 'down' | 'neutral';
  value?: number;
  recommendation?: string;
  priority: 'high' | 'medium' | 'low';
  icon?: string;
}

export interface AIInsightProps {
  title?: string;
  description?: string;
  type?: 'productivity' | 'habits' | 'goals' | 'general';
  data?: any;
}
