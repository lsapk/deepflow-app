
import React, { useState, useEffect, useRef } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { CheckCircle2, Clock, Volume2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { doc, setDoc, increment, getDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/services/firebase';
import { useIsMobile } from '@/hooks/use-mobile';
import { PomodoroTimer } from '@/components/focus/PomodoroTimer';
import { FocusStats } from '@/components/focus/FocusStats';
import { FocusPreferences } from '@/components/focus/FocusPreferences';
import { FocusTips } from '@/components/focus/FocusTips';

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
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<Date | null>(null);
  const endTimeRef = useRef<Date | null>(null);
  const isMobile = useIsMobile();

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

  // Fixed timer implementation for accurate countdown
  useEffect(() => {
    if (isActive && !isPaused) {
      // Set end time when timer starts
      if (!endTimeRef.current) {
        const now = new Date();
        endTimeRef.current = new Date(now.getTime() + time * 1000);
      }
      
      intervalRef.current = setInterval(() => {
        const now = new Date();
        const endTime = endTimeRef.current as Date;
        
        if (now >= endTime) {
          // Timer complete
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
          }
          setTime(0);
          setIsActive(false);
          setIsPaused(false);
          sessionComplete();
          setTime(selectedTime * 60);
          endTimeRef.current = null;
        } else {
          // Calculate remaining time in seconds
          const remainingMs = endTime.getTime() - now.getTime();
          const remainingSeconds = Math.ceil(remainingMs / 1000);
          setTime(remainingSeconds);
        }
      }, 250); // Update more frequently for smoother countdown
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        
        // If paused, update end time for when we resume
        if (isPaused && endTimeRef.current) {
          const pauseTimeRemaining = time * 1000; // Convert seconds to ms
          endTimeRef.current = new Date(new Date().getTime() + pauseTimeRemaining);
        }
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
      try {
        await alarmSound.play();
      } catch (error) {
        console.error("Error playing sound:", error);
      }
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
    endTimeRef.current = new Date(new Date().getTime() + time * 1000);
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
    endTimeRef.current = null;
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
    endTimeRef.current = null;
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
              <PomodoroTimer 
                time={time}
                selectedTime={selectedTime}
                isActive={isActive}
                isPaused={isPaused}
                formatTime={formatTime}
                calculateProgress={calculateProgress}
                handleStart={handleStart}
                handlePause={handlePause}
                handleResume={handleResume}
                handleReset={handleReset}
                setTimePreset={setTimePreset}
              />
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
                <FocusPreferences
                  playSound={playSound}
                  setPlaySound={setPlaySound}
                  showNotification={showNotification}
                  setShowNotification={setShowNotification}
                  volume={volume}
                  setVolume={setVolume}
                  handleSavePreferences={handleSavePreferences}
                />
              </CardContent>
            </Card>
            
            {!isMobile && (
              <Card>
                <CardHeader>
                  <CardTitle>Conseils</CardTitle>
                </CardHeader>
                <CardContent>
                  <FocusTips />
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default FocusPage;
