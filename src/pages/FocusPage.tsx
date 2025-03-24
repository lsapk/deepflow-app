
import React, { useState, useEffect, useRef } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Clock, Play, Pause, RotateCcw, CheckCircle2, BellRing, Volume2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { doc, setDoc, increment, getDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/services/firebase';

const alarmSound = new Audio('/alarm.mp3');

const FocusPage = () => {
  const { currentUser } = useAuth();
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [time, setTime] = useState(25 * 60); // 25 minutes in seconds
  const [selectedTime, setSelectedTime] = useState(25);
  const [completedSessions, setCompletedSessions] = useState(0);
  const [totalFocusTime, setTotalFocusTime] = useState(0);
  const [playSound, setPlaySound] = useState(true);
  const [showNotification, setShowNotification] = useState(true);
  const [volume, setVolume] = useState(70);
  const intervalRef = useRef<number | null>(null);
  const startTimeRef = useRef<Date | null>(null);

  useEffect(() => {
    // Load user preferences and stats
    const loadUserData = async () => {
      if (!currentUser) return;
      
      try {
        const userFocusRef = doc(db, "userFocus", currentUser.uid);
        const userFocusDoc = await getDoc(userFocusRef);
        
        if (userFocusDoc.exists()) {
          const data = userFocusDoc.data();
          setCompletedSessions(data.completedSessions || 0);
          setTotalFocusTime(data.totalTimeMinutes || 0);
          setPlaySound(data.playSound !== undefined ? data.playSound : true);
          setShowNotification(data.showNotification !== undefined ? data.showNotification : true);
          setVolume(data.volume || 70);
        }
      } catch (error) {
        console.error("Error loading focus data:", error);
      }
    };
    
    loadUserData();
    
    // Set volume for the alarm sound
    alarmSound.volume = volume / 100;
    
    // Request notification permission
    if (showNotification && "Notification" in window) {
      Notification.requestPermission();
    }
    
    // Cleanup on component unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [currentUser, volume]);

  useEffect(() => {
    alarmSound.volume = volume / 100;
  }, [volume]);

  useEffect(() => {
    if (isActive && !isPaused) {
      startTimeRef.current = new Date();
      intervalRef.current = window.setInterval(() => {
        setTime((time) => {
          if (time <= 1) {
            clearInterval(intervalRef.current as number);
            setIsActive(false);
            setIsPaused(false);
            sessionComplete();
            return selectedTime * 60;
          }
          return time - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, isPaused, selectedTime]);

  const sessionComplete = async () => {
    // Play sound if enabled
    if (playSound) {
      alarmSound.play();
    }
    
    // Show notification if enabled
    if (showNotification && "Notification" in window && Notification.permission === "granted") {
      new Notification("Session Pomodoro terminée", {
        body: `Votre session de ${selectedTime} minutes est terminée!`,
        icon: "/favicon.svg"
      });
    }
    
    // Update the session count and log in database
    setCompletedSessions(prev => prev + 1);
    setTotalFocusTime(prev => prev + selectedTime);
    
    toast.success(`Session de ${selectedTime} minutes terminée !`);
    
    // Save the session to the database
    if (currentUser) {
      try {
        const userFocusRef = doc(db, "userFocus", currentUser.uid);
        await setDoc(userFocusRef, {
          completedSessions: increment(1),
          totalTimeMinutes: increment(selectedTime),
          lastSessionAt: Timestamp.now(),
          playSound,
          showNotification,
          volume
        }, { merge: true });
        
        // Log individual session
        const sessionId = Date.now().toString();
        const sessionRef = doc(db, "focusSessions", sessionId);
        await setDoc(sessionRef, {
          userId: currentUser.uid,
          duration: selectedTime,
          completedAt: Timestamp.now()
        });
        
      } catch (error) {
        console.error("Error saving focus session:", error);
      }
    }
  };

  const handleStart = () => {
    setIsActive(true);
    setIsPaused(false);
    startTimeRef.current = new Date();
  };

  const handlePause = () => {
    setIsPaused(true);
  };

  const handleResume = () => {
    setIsPaused(false);
  };

  const handleReset = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsActive(false);
    setIsPaused(false);
    setTime(selectedTime * 60);
    startTimeRef.current = null;
  };

  const setTimePreset = (minutes: number) => {
    setSelectedTime(minutes);
    setTime(minutes * 60);
    setIsActive(false);
    setIsPaused(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    startTimeRef.current = null;
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const calculateProgress = () => {
    return 100 - (time / (selectedTime * 60)) * 100;
  };

  const handleSavePreferences = async () => {
    if (!currentUser) return;
    
    try {
      const userFocusRef = doc(db, "userFocus", currentUser.uid);
      await setDoc(userFocusRef, {
        playSound,
        showNotification,
        volume
      }, { merge: true });
      
      toast.success("Préférences enregistrées");
    } catch (error) {
      console.error("Error saving preferences:", error);
      toast.error("Erreur lors de l'enregistrement des préférences");
    }
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
            <CardContent className="flex flex-col items-center">
              <div className="flex justify-center mb-8 w-full max-w-xs">
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

              <div className="grid grid-cols-3 gap-3 mb-6 w-full max-w-md">
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

              <div className="flex flex-wrap justify-center gap-4 w-full">
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

          <div className="space-y-6">
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
                    <Progress value={completedSessions * 25} className="h-2" />
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
                      <span>{`${totalFocusTime} min`}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Préférences</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="sound">Sons</Label>
                      <p className="text-xs text-muted-foreground">
                        Jouer un son à la fin de la session
                      </p>
                    </div>
                    <Switch 
                      id="sound"
                      checked={playSound}
                      onCheckedChange={setPlaySound}
                    />
                  </div>
                  
                  {playSound && (
                    <div className="space-y-2">
                      <Label htmlFor="volume">Volume</Label>
                      <div className="flex items-center gap-2">
                        <Volume2 className="h-4 w-4" />
                        <Slider
                          id="volume"
                          defaultValue={[volume]}
                          max={100}
                          step={1}
                          onValueChange={(value) => setVolume(value[0])}
                        />
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="notifications">Notifications</Label>
                      <p className="text-xs text-muted-foreground">
                        Recevoir une notification à la fin de la session
                      </p>
                    </div>
                    <Switch 
                      id="notifications"
                      checked={showNotification}
                      onCheckedChange={setShowNotification}
                    />
                  </div>
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full mt-2"
                    onClick={handleSavePreferences}
                  >
                    Enregistrer les préférences
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Conseils</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-gray-500 dark:text-gray-400 space-y-1">
                  <li>• Éliminez les distractions pendant les sessions</li>
                  <li>• Prenez une courte pause entre les sessions</li>
                  <li>• Définissez un objectif clair pour chaque session</li>
                  <li>• Alternez 25 minutes de travail et 5 minutes de pause</li>
                  <li>• Après 4 sessions, prenez une pause plus longue</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default FocusPage;
