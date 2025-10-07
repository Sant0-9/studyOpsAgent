'use client';

import { useEffect, useState } from 'react';
import { useSessionStore } from '@/lib/store/session-store';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ActivityType } from '@prisma/client';
import { Play, Pause, Square, Clock } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

interface Assignment {
  id: string;
  title: string;
  course: string;
}

export function SessionTimer() {
  const {
    isActive,
    isPaused,
    elapsedSeconds,
    activityType,
    assignmentId,
    notes,
    focusScore,
    startSession,
    pauseSession,
    resumeSession,
    stopSession,
    updateElapsedTime,
    updateActivityType,
    updateAssignment,
    updateNotes,
    updateFocusScore,
    setLastSaveTime,
    lastSaveTime,
  } = useSessionStore();

  const [displayTime, setDisplayTime] = useState('00:00:00');

  const { data: assignments } = useQuery<Assignment[]>({
    queryKey: ['assignments'],
    queryFn: async () => {
      const res = await fetch('/api/assignments');
      if (!res.ok) throw new Error('Failed to fetch assignments');
      return res.json();
    },
  });

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isActive && !isPaused) {
      interval = setInterval(() => {
        updateElapsedTime(elapsedSeconds + 1);
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, isPaused, elapsedSeconds, updateElapsedTime]);

  useEffect(() => {
    const hours = Math.floor(elapsedSeconds / 3600);
    const minutes = Math.floor((elapsedSeconds % 3600) / 60);
    const seconds = elapsedSeconds % 60;
    setDisplayTime(
      `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    );
  }, [elapsedSeconds]);

  useEffect(() => {
    if (!isActive || isPaused) return;

    const autoSaveInterval = setInterval(async () => {
      try {
        await fetch('/api/sessions/autosave', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            elapsedSeconds,
            activityType,
            assignmentId,
            notes,
            focusScore,
          }),
        });
        setLastSaveTime(new Date());
      } catch (error) {
        console.error('Auto-save failed:', error);
      }
    }, 60000);

    return () => clearInterval(autoSaveInterval);
  }, [isActive, isPaused, elapsedSeconds, activityType, assignmentId, notes, focusScore, setLastSaveTime]);

  const handleStart = () => {
    startSession(assignmentId || undefined, activityType);
  };

  const handlePauseResume = () => {
    if (isPaused) {
      resumeSession();
    } else {
      pauseSession();
    }
  };

  const handleStop = async () => {
    await stopSession();
  };

  const progress = ((elapsedSeconds % 1500) / 1500) * 100;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Study Session Timer
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative w-48 h-48">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="96"
                cy="96"
                r="88"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                className="text-muted"
              />
              <circle
                cx="96"
                cy="96"
                r="88"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 88}`}
                strokeDashoffset={`${2 * Math.PI * 88 * (1 - progress / 100)}`}
                className="text-primary transition-all duration-1000"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-4xl font-bold">{displayTime}</span>
            </div>
          </div>

          <div className="flex gap-2">
            {!isActive ? (
              <Button onClick={handleStart} size="lg">
                <Play className="h-4 w-4 mr-2" />
                Start Session
              </Button>
            ) : (
              <>
                <Button onClick={handlePauseResume} variant="outline" size="lg">
                  {isPaused ? (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      Resume
                    </>
                  ) : (
                    <>
                      <Pause className="h-4 w-4 mr-2" />
                      Pause
                    </>
                  )}
                </Button>
                <Button onClick={handleStop} variant="destructive" size="lg">
                  <Square className="h-4 w-4 mr-2" />
                  Stop
                </Button>
              </>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="activity-type">Activity Type</Label>
            <Select
              value={activityType}
              onValueChange={(value) => updateActivityType(value as ActivityType)}
              disabled={!isActive}
            >
              <SelectTrigger id="activity-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ActivityType.CODING}>Coding</SelectItem>
                <SelectItem value={ActivityType.WRITING}>Writing</SelectItem>
                <SelectItem value={ActivityType.READING}>Reading</SelectItem>
                <SelectItem value={ActivityType.RESEARCH}>Research</SelectItem>
                <SelectItem value={ActivityType.PRACTICE}>Practice</SelectItem>
                <SelectItem value={ActivityType.REVIEW}>Review</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="assignment">Assignment (Optional)</Label>
            <Select
              value={assignmentId || 'none'}
              onValueChange={(value) => updateAssignment(value === 'none' ? null : value)}
              disabled={!isActive}
            >
              <SelectTrigger id="assignment">
                <SelectValue placeholder="Select an assignment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No assignment</SelectItem>
                {assignments?.map((assignment) => (
                  <SelectItem key={assignment.id} value={assignment.id}>
                    {assignment.title} ({assignment.course})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="focus-score">Focus Score (1-10)</Label>
            <div className="flex items-center gap-4">
              <Slider
                id="focus-score"
                min={1}
                max={10}
                step={1}
                value={[focusScore || 5]}
                onValueChange={([value]) => updateFocusScore(value)}
                disabled={!isActive}
                className="flex-1"
              />
              <span className="text-sm font-medium w-8">{focusScore || 5}</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Session Notes</Label>
            <Textarea
              id="notes"
              placeholder="What are you working on? Any challenges or insights?"
              value={notes}
              onChange={(e) => updateNotes(e.target.value)}
              disabled={!isActive}
              rows={4}
            />
          </div>
        </div>

        {lastSaveTime && isActive && (
          <p className="text-xs text-muted-foreground text-center">
            Last auto-saved: {new Date(lastSaveTime).toLocaleTimeString()}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
