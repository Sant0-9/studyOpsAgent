import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SessionTimer } from '@/components/features/sessions/session-timer';
import { PomodoroTimer } from '@/components/features/sessions/pomodoro-timer';
import { SessionHistory } from '@/components/features/sessions/session-history';
import { SessionStats } from '@/components/features/sessions/session-stats';

export default function StudyPage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Study Session</h1>
      </div>

      <Tabs defaultValue="timer" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="timer">Timer</TabsTrigger>
          <TabsTrigger value="pomodoro">Pomodoro</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="stats">Statistics</TabsTrigger>
        </TabsList>

        <TabsContent value="timer" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <SessionTimer />
            </div>
            <div className="space-y-4">
              <div className="p-4 border rounded-lg bg-card">
                <h3 className="font-semibold mb-2">Study Tips</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>Take regular breaks every 25-30 minutes</li>
                  <li>Stay hydrated and maintain good posture</li>
                  <li>Eliminate distractions before starting</li>
                  <li>Set clear goals for each session</li>
                  <li>Review your notes after completing</li>
                </ul>
              </div>
            </div>
          </div>
          <SessionHistory limit={5} />
        </TabsContent>

        <TabsContent value="pomodoro" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <PomodoroTimer />
            </div>
            <div className="space-y-4">
              <div className="p-4 border rounded-lg bg-card">
                <h3 className="font-semibold mb-2">Pomodoro Technique</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>Work for 25 minutes focused</li>
                  <li>Take a 5 minute break</li>
                  <li>After 4 cycles, take a 15 minute break</li>
                  <li>Use breaks to rest and recharge</li>
                  <li>Track your productivity patterns</li>
                </ul>
              </div>
            </div>
          </div>
          <SessionHistory limit={5} />
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <SessionHistory />
        </TabsContent>

        <TabsContent value="stats" className="space-y-6">
          <SessionStats />
        </TabsContent>
      </Tabs>
    </div>
  );
}
