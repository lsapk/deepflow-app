
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckSquare, Clock, ListTodo } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';

interface ActivityCardProps {
  title: string;
  icon: React.ComponentType<{ className: string }>;
  value: string | number;
  subtext: string;
  path: string;
  isLoading?: boolean;
}

const ActivityCard = ({ title, icon: Icon, value, subtext, path, isLoading = false }: ActivityCardProps) => {
  const navigate = useNavigate();
  
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <>
            <Skeleton className="h-8 w-16 mb-2" />
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-12" />
            </div>
          </>
        ) : (
          <>
            <div className="text-2xl font-bold">{value}</div>
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                {subtext}
              </p>
              <Button variant="ghost" size="sm" onClick={() => navigate(path)}>
                Voir
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
  },
};

interface DashboardActivityProps {
  taskCount: number;
  todayTaskCount: number;
  habitsStats: { completed: number; total: number };
  focusStats: { duration: string; sessions: number };
  dataLoaded: boolean;
}

export const DashboardActivity = ({ 
  taskCount, 
  todayTaskCount, 
  habitsStats, 
  focusStats,
  dataLoaded
}: DashboardActivityProps) => {
  const cards = [
    {
      title: "Tâches en cours",
      icon: CheckSquare,
      value: taskCount || 0,
      subtext: `${todayTaskCount} tâche${todayTaskCount !== 1 ? 's' : ''} à faire aujourd'hui`,
      path: "/tasks"
    },
    {
      title: "Habitudes complétées",
      icon: ListTodo,
      value: habitsStats.total > 0 ? `${habitsStats.completed}/${habitsStats.total}` : "0/0",
      subtext: habitsStats.total > 0 
        ? `${Math.round((habitsStats.completed / habitsStats.total) * 100)}% complété aujourd'hui` 
        : "Aucune habitude configurée",
      path: "/habits"
    },
    {
      title: "Focus aujourd'hui",
      icon: Clock,
      value: focusStats.duration,
      subtext: `${focusStats.sessions} session${focusStats.sessions !== 1 ? 's' : ''} de concentration`,
      path: "/focus"
    }
  ];

  return (
    <motion.div variants={itemVariants} className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {cards.map((card, index) => (
        <ActivityCard 
          key={index}
          title={card.title}
          icon={card.icon}
          value={card.value}
          subtext={card.subtext}
          path={card.path}
          isLoading={!dataLoaded}
        />
      ))}
    </motion.div>
  );
};
