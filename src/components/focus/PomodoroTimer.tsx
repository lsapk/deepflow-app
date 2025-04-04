
import React from 'react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

interface PomodoroTimerProps {
  time: number;
  selectedTime: number;
  isActive: boolean;
  isPaused: boolean;
  formatTime: (time: number) => string;
  calculateProgress: () => number;
  handleStart: () => void;
  handlePause: () => void;
  handleResume: () => void;
  handleReset: () => void;
  setTimePreset: (minutes: number) => void;
}

export const PomodoroTimer: React.FC<PomodoroTimerProps> = ({
  time,
  selectedTime,
  isActive,
  isPaused,
  formatTime,
  calculateProgress,
  handleStart,
  handlePause,
  handleResume,
  handleReset,
  setTimePreset,
}) => {
  return (
    <div className="flex flex-col items-center">
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

      <ToggleGroup type="single" value={String(selectedTime)} onValueChange={(value) => {
        if (value) setTimePreset(Number(value));
      }} className="mb-6 w-full max-w-md">
        <ToggleGroupItem value="25" className="flex-1">25 min</ToggleGroupItem>
        <ToggleGroupItem value="15" className="flex-1">15 min</ToggleGroupItem>
        <ToggleGroupItem value="5" className="flex-1">5 min</ToggleGroupItem>
      </ToggleGroup>

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
    </div>
  );
};
