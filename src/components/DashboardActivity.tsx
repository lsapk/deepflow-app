
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckSquare, Clock, ListTodo } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

interface ActivityCardProps {
  title: string;
  icon: React.ComponentType<{ className: string }>;
  value: string | number;
  subtext: string;
  path: string;
}

export const ActivityCard = ({ title, icon: Icon, value, subtext, path }: ActivityCardProps) => {
  const navigate = useNavigate();
  
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            {subtext}
          </p>
          <Button variant="ghost" size="sm" onClick={() => navigate(path)}>
            Voir
          </Button>
        </div>
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

export const DashboardActivity = () => {
  const cards = [
    {
      title: "Tâches en cours",
      icon: CheckSquare,
      value: 4,
      subtext: "2 tâches à faire aujourd'hui",
      path: "/tasks"
    },
    {
      title: "Habitudes complétées",
      icon: ListTodo,
      value: "3/5",
      subtext: "+20.1% par rapport à la semaine dernière",
      path: "/habits"
    },
    {
      title: "Focus aujourd'hui",
      icon: Clock,
      value: "1h 20m",
      subtext: "4 sessions de concentration",
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
        />
      ))}
    </motion.div>
  );
};
