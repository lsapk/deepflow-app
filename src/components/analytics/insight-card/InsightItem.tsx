
import React from 'react';
import { InsightItem as InsightItemType } from './types';
import { Separator } from '@/components/ui/separator';
import { 
  TrendingUp, TrendingDown, Calendar, Target, Brain, 
  AlertCircle, CheckCircle, Clock, BarChart3, LineChart, 
  Layers, Sparkles, HelpCircle
} from 'lucide-react';
import { motion } from "framer-motion";

interface InsightItemProps {
  insight: InsightItemType;
  index: number;
}

export const InsightItem: React.FC<InsightItemProps> = ({ insight, index }) => {
  const getPriorityColor = (priority: string) => {
    switch(priority) {
      case 'high':
        return 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300';
      case 'medium':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300';
      case 'low':
        return 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300';
      default:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch(category.toLowerCase()) {
      case 'productivité':
        return <CheckCircle className="h-4 w-4 mr-1" />;
      case 'habitudes':
        return <Calendar className="h-4 w-4 mr-1" />;
      case 'performance':
        return <BarChart3 className="h-4 w-4 mr-1" />;
      case 'bien-être':
        return <Brain className="h-4 w-4 mr-1" />;
      case 'concentration':
        return <Target className="h-4 w-4 mr-1" />;
      case 'rythme':
        return <Clock className="h-4 w-4 mr-1" />;
      default:
        return <Sparkles className="h-4 w-4 mr-1" />;
    }
  };
  
  const getTrendIcon = (trend?: 'up' | 'down' | 'neutral') => {
    switch(trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };
  
  const getIconComponent = (iconName?: string) => {
    switch(iconName) {
      case 'trend-up': return <TrendingUp className="h-4 w-4" />;
      case 'trend-down': return <TrendingDown className="h-4 w-4" />;
      case 'calendar': return <Calendar className="h-4 w-4" />;
      case 'target': return <Target className="h-4 w-4" />;
      case 'brain': return <Brain className="h-4 w-4" />;
      case 'alert-circle': return <AlertCircle className="h-4 w-4" />;
      case 'check-circle': return <CheckCircle className="h-4 w-4" />;
      case 'clock': return <Clock className="h-4 w-4" />;
      case 'bar-chart': return <BarChart3 className="h-4 w-4" />;
      case 'line-chart': return <LineChart className="h-4 w-4" />;
      case 'layers': return <Layers className="h-4 w-4" />;
      default: return <Sparkles className="h-4 w-4" />;
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="rounded-md bg-white dark:bg-gray-900 border p-3 shadow-sm"
    >
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center">
          {getCategoryIcon(insight.category)}
          <span className="text-sm font-medium">{insight.category}</span>
        </div>
        <div className={`text-xs rounded-full px-2 py-0.5 ${getPriorityColor(insight.priority)}`}>
          {insight.priority === 'high' ? 'Important' : insight.priority === 'medium' ? 'Modéré' : 'Faible'}
        </div>
      </div>
      
      <p className="text-sm font-medium mb-2">{insight.text}</p>
      
      {insight.trend && (
        <div className="flex items-center text-sm mb-2">
          {getTrendIcon(insight.trend)}
          <span className={`ml-1 ${
            insight.trend === 'up' ? 'text-green-600 dark:text-green-400' : 
            insight.trend === 'down' ? 'text-red-600 dark:text-red-400' : ''
          }`}>
            {insight.value !== undefined && `${insight.value}${typeof insight.value === 'number' && insight.value > 1 && insight.value < 100 ? '%' : ''}`}
          </span>
        </div>
      )}
      
      {insight.recommendation && (
        <>
          <Separator className="my-2" />
          <div className="flex items-start gap-1 text-xs text-gray-600 dark:text-gray-400 italic mt-1">
            <div className="shrink-0 text-primary mt-0.5">
              {getIconComponent(insight.icon)}
            </div>
            <span>{insight.recommendation}</span>
          </div>
        </>
      )}
    </motion.div>
  );
};
