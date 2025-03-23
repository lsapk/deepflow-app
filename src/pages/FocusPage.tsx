
import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Clock, Play, Pause, RotateCcw, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

const FocusPage = () => {
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [time, setTime] = useState(25 * 60); // 25 minutes in seconds
  const [selectedTime, setSelectedTime] = useState(25);
  const [completedSessions, setCompletedSessions] = useState(0);

  useEffect(() => {
    let interval: number | null = null;

    if (isActive && !isPaused) {
      interval = window.setInterval(() => {
        setTime((time) => {
          if (time <= 1) {
            clearInterval(interval as number);
            setIsActive(false);
            setIsPaused(false);
            setCompletedSessions(prev => prev + 1);
            toast.success("Session terminée !");
            return selectedTime * 60;
          }
          return time - 1;
        });
      }, 1000);
    } else {
      clearInterval(interval as number);
    }

    return () => {
      clearInterval(interval as number);
    };
  }, [isActive, isPaused, selectedTime]);

  const handleStart = () => {
    setIsActive(true);
    setIsPaused(false);
  };

  const handlePause = () => {
    setIsPaused(true);
  };

  const handleResume = () => {
    setIsPaused(false);
  };

  const handleReset = () => {
    setIsActive(false);
    setIsPaused(false);
    setTime(selectedTime * 60);
  };

  const setTimePreset = (minutes: number) => {
    setSelectedTime(minutes);
    setTime(minutes * 60);
    setIsActive(false);
    setIsPaused(false);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const calculateProgress = () => {
    return 100 - (time / (selectedTime * 60)) * 100;
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Focus</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Utilisez la technique Pomodoro pour rester concentré
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="mr-2" size={20} />
                Minuteur Pomodoro
              </CardTitle>
              <CardDescription>
                Travaillez pendant des périodes concentrées pour améliorer votre productivité
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center mb-8">
                <motion.div 
                  className="w-64 h-64 relative flex items-center justify-center rounded-full border-8 border-gray-100 dark:border-gray-800"
                  animate={{ rotate: isActive && !isPaused ? 360 : 0 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                >
                  <div className="absolute inset-0 flex items-center justify-center">
                    <h2 className="text-5xl font-bold">{formatTime(time)}</h2>
                  </div>
                  <div className="absolute inset-0">
                    <svg width="100%" height="100%" viewBox="0 0 100 100">
                      <circle
                        cx="50"
                        cy="50"
                        r="45"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="8"
                        strokeLinecap="round"
                        strokeDasharray={`${calculateProgress() * 2.83}, 283`}
                        transform="rotate(-90 50 50)"
                        className="text-primary"
                      />
                    </svg>
                  </div>
                </motion.div>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-6">
                <Button 
                  variant={selectedTime === 25 ? "default" : "outline"}
                  onClick={() => setTimePreset(25)}
                  className="w-full"
                >
                  25 min
                </Button>
                <Button 
                  variant={selectedTime === 15 ? "default" : "outline"}
                  onClick={() => setTimePreset(15)}
                  className="w-full"
                >
                  15 min
                </Button>
                <Button 
                  variant={selectedTime === 5 ? "default" : "outline"}
                  onClick={() => setTimePreset(5)}
                  className="w-full"
                >
                  5 min
                </Button>
              </div>

              <div className="flex justify-center space-x-4">
                {!isActive ? (
                  <Button onClick={handleStart} size="lg" className="px-8">
                    <Play size={16} className="mr-2" />
                    Démarrer
                  </Button>
                ) : (
                  <>
                    {isPaused ? (
                      <Button onClick={handleResume} size="lg" variant="outline" className="px-8">
                        <Play size={16} className="mr-2" />
                        Continuer
                      </Button>
                    ) : (
                      <Button onClick={handlePause} size="lg" variant="outline" className="px-8">
                        <Pause size={16} className="mr-2" />
                        Pause
                      </Button>
                    )}
                    <Button onClick={handleReset} size="lg" variant="outline" className="px-8">
                      <RotateCcw size={16} className="mr-2" />
                      Réinitialiser
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Statistiques</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Sessions terminées aujourd'hui</span>
                    <span className="text-sm font-medium">{completedSessions}</span>
                  </div>
                  <Progress value={completedSessions * 25} max={100} className="h-2" />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center">
                      <CheckCircle2 size={16} className="mr-2 text-green-500" />
                      Session en cours
                    </span>
                    <span>{isActive ? formatTime(time) : "Inactif"}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center">
                      <Clock size={16} className="mr-2 text-blue-500" />
                      Temps de focus total
                    </span>
                    <span>{`${completedSessions * selectedTime} min`}</span>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-2">Conseils</h4>
                  <ul className="text-sm text-gray-500 dark:text-gray-400 space-y-1">
                    <li>• Éliminez les distractions pendant les sessions</li>
                    <li>• Prenez une courte pause entre les sessions</li>
                    <li>• Définissez un objectif clair pour chaque session</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default FocusPage;
