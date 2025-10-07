'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Play, Pause, SkipForward, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';

type PomodoroPhase = 'work' | 'shortBreak' | 'longBreak';

interface PomodoroSettings {
  workDuration: number;
  shortBreakDuration: number;
  longBreakDuration: number;
  intervalsUntilLongBreak: number;
}

const DEFAULT_SETTINGS: PomodoroSettings = {
  workDuration: 25 * 60,
  shortBreakDuration: 5 * 60,
  longBreakDuration: 15 * 60,
  intervalsUntilLongBreak: 4,
};

export function PomodoroTimer() {
  const [settings] = useState<PomodoroSettings>(DEFAULT_SETTINGS);
  const [phase, setPhase] = useState<PomodoroPhase>('work');
  const [isRunning, setIsRunning] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(settings.workDuration);
  const [completedIntervals, setCompletedIntervals] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isRunning && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining((prev) => prev - 1);
      }, 1000);
    } else if (timeRemaining === 0) {
      handlePhaseComplete();
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, timeRemaining]);

  const handlePhaseComplete = () => {
    setIsRunning(false);

    if (phase === 'work') {
      const newIntervals = completedIntervals + 1;
      setCompletedIntervals(newIntervals);

      if (newIntervals % settings.intervalsUntilLongBreak === 0) {
        setPhase('longBreak');
        setTimeRemaining(settings.longBreakDuration);
        toast.success('Work session complete! Time for a long break.');
      } else {
        setPhase('shortBreak');
        setTimeRemaining(settings.shortBreakDuration);
        toast.success('Work session complete! Time for a short break.');
      }
    } else {
      setPhase('work');
      setTimeRemaining(settings.workDuration);
      toast.info('Break complete! Ready for the next work session.');
    }

    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Pomodoro Timer', {
        body: phase === 'work' ? 'Time for a break!' : 'Time to work!',
      });
    }
  };

  const handleStartPause = () => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
    setIsRunning(!isRunning);
  };

  const handleSkip = () => {
    setTimeRemaining(0);
  };

  const handleReset = () => {
    setIsRunning(false);
    setPhase('work');
    setTimeRemaining(settings.workDuration);
    setCompletedIntervals(0);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getPhaseLabel = (): string => {
    switch (phase) {
      case 'work':
        return 'Work Session';
      case 'shortBreak':
        return 'Short Break';
      case 'longBreak':
        return 'Long Break';
    }
  };

  const getPhaseColor = (): string => {
    switch (phase) {
      case 'work':
        return 'text-red-500';
      case 'shortBreak':
        return 'text-green-500';
      case 'longBreak':
        return 'text-blue-500';
    }
  };

  const totalDuration =
    phase === 'work'
      ? settings.workDuration
      : phase === 'shortBreak'
      ? settings.shortBreakDuration
      : settings.longBreakDuration;

  const progress = ((totalDuration - timeRemaining) / totalDuration) * 100;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Pomodoro Timer</span>
          <span className="text-sm font-normal text-muted-foreground">
            {completedIntervals} / {settings.intervalsUntilLongBreak} intervals
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col items-center space-y-4">
          <div className={`text-2xl font-semibold ${getPhaseColor()}`}>{getPhaseLabel()}</div>

          <div className="relative w-56 h-56">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="112"
                cy="112"
                r="100"
                stroke="currentColor"
                strokeWidth="12"
                fill="none"
                className="text-muted"
              />
              <circle
                cx="112"
                cy="112"
                r="100"
                stroke="currentColor"
                strokeWidth="12"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 100}`}
                strokeDashoffset={`${2 * Math.PI * 100 * (1 - progress / 100)}`}
                className={`transition-all duration-1000 ${
                  phase === 'work'
                    ? 'text-red-500'
                    : phase === 'shortBreak'
                    ? 'text-green-500'
                    : 'text-blue-500'
                }`}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-5xl font-bold">{formatTime(timeRemaining)}</span>
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleStartPause} size="lg">
              {isRunning ? (
                <>
                  <Pause className="h-4 w-4 mr-2" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Start
                </>
              )}
            </Button>
            <Button onClick={handleSkip} variant="outline" size="lg" disabled={!isRunning}>
              <SkipForward className="h-4 w-4 mr-2" />
              Skip
            </Button>
            <Button onClick={handleReset} variant="outline" size="lg">
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 text-center text-sm">
          <div>
            <div className="font-semibold text-muted-foreground">Work</div>
            <div>{settings.workDuration / 60} min</div>
          </div>
          <div>
            <div className="font-semibold text-muted-foreground">Short Break</div>
            <div>{settings.shortBreakDuration / 60} min</div>
          </div>
          <div>
            <div className="font-semibold text-muted-foreground">Long Break</div>
            <div>{settings.longBreakDuration / 60} min</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
