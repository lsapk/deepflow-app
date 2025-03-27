
import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { CheckSquare, Clock, ListTodo, BookOpen, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';

interface ShortcutProps {
  title: string;
  icon: React.ComponentType<{ className: string }>;
  path: string;
  color: string;
}

export const DashboardShortcuts = () => {
  const navigate = useNavigate();
  
  const shortcuts: ShortcutProps[] = [
    {
      title: "Tâches",
      icon: CheckSquare,
      path: "/tasks",
      color: "bg-green-600 hover:bg-green-700 text-white"
    },
    {
      title: "Focus",
      icon: Clock,
      path: "/focus",
      color: "bg-purple-600 hover:bg-purple-700 text-white"
    },
    {
      title: "Habitudes",
      icon: ListTodo,
      path: "/habits",
      color: "bg-orange-600 hover:bg-orange-700 text-white"
    },
    {
      title: "Journal",
      icon: BookOpen,
      path: "/journal",
      color: "bg-pink-600 hover:bg-pink-700 text-white"
    },
    {
      title: "Calendrier",
      icon: Calendar,
      path: "/planning",
      color: "bg-indigo-600 hover:bg-indigo-700 text-white"
    }
  ];

  const itemVariants = {
    hidden: { y: 10, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { 
        type: "spring", 
        stiffness: 100 
      }
    },
    hover: { 
      scale: 1.05,
      boxShadow: "0 10px 15px rgba(0, 0, 0, 0.1)" 
    }
  };

  return (
    <div className="mt-6">
      <h2 className="text-xl font-semibold mb-4">Accès rapide</h2>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {shortcuts.map((shortcut, index) => (
          <motion.div
            key={shortcut.title}
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            whileHover="hover"
            transition={{ delay: index * 0.1 }}
          >
            <Button
              onClick={() => navigate(shortcut.path)}
              className={`h-24 w-full ${shortcut.color} flex flex-col items-center justify-center space-y-2 rounded-xl shadow-lg`}
            >
              <shortcut.icon className="h-8 w-8" />
              <span className="font-medium">{shortcut.title}</span>
            </Button>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
