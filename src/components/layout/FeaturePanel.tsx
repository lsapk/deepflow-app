
import React from 'react';
import { motion } from 'framer-motion';
import { X, Info, Star, Zap, Clock, Calendar, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from '@/components/ui/sheet';
import { Card, CardContent } from '@/components/ui/card';

export const FeaturePanel = () => {
  const navigate = useNavigate();
  
  const features = [
    {
      title: "Tableau de bord",
      description: "Visualisez vos tâches, habitudes et objectifs en un seul endroit",
      icon: Star,
      path: "/dashboard",
      color: "bg-purple-100 text-purple-600 dark:bg-purple-950 dark:text-purple-300"
    },
    {
      title: "Focus",
      description: "Utilisez la technique Pomodoro pour améliorer votre productivité",
      icon: Clock,
      path: "/focus",
      color: "bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-300"
    },
    {
      title: "Habitudes",
      description: "Créez et suivez vos habitudes quotidiennes pour progresser",
      icon: CheckCircle,
      path: "/habits",
      color: "bg-green-100 text-green-600 dark:bg-green-950 dark:text-green-300"
    },
    {
      title: "Journal",
      description: "Notez vos pensées et réflexions quotidiennes",
      icon: Calendar,
      path: "/journal",
      color: "bg-orange-100 text-orange-600 dark:bg-orange-950 dark:text-orange-300"
    }
  ];

  const handleNavigate = (path: string) => {
    navigate(path);
  };

  return (
    <div className="fixed right-4 top-20 z-10">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="sm" className="rounded-full w-10 h-10 p-0 shadow-md">
            <Zap className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-[350px] sm:w-[450px] p-6">
          <SheetHeader className="mb-6">
            <SheetTitle className="text-2xl flex items-center gap-2">
              <Zap className="h-6 w-6 text-primary" />
              Fonctionnalités
            </SheetTitle>
          </SheetHeader>
          
          <div className="space-y-4">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.3 }}
              >
                <div 
                  onClick={() => handleNavigate(feature.path)}
                  className="cursor-pointer"
                >
                  <Card className="hover:bg-muted/50 transition-colors">
                    <CardContent className="p-4 flex items-start gap-4">
                      <div className={`p-2 rounded-lg ${feature.color}`}>
                        <feature.icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-medium">{feature.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{feature.description}</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </motion.div>
            ))}
          </div>
          
          <div className="mt-8 p-4 rounded-lg bg-primary/10 border border-primary/20 text-sm">
            <p className="flex items-start gap-2">
              <Info className="h-5 w-5 mt-0.5 text-primary shrink-0" />
              <span>Découvrez toutes les fonctionnalités de DeepFlow pour améliorer votre productivité et votre bien-être.</span>
            </p>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};
