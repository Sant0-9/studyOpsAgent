import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function StudyPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold">Study Session</h1>
        <p className="text-muted-foreground">Track your study time and focus</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Session Timer</CardTitle>
            <CardDescription>Start tracking your study time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-muted-foreground">Timer will be implemented here</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Session History</CardTitle>
            <CardDescription>Your recent study sessions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-muted-foreground">No sessions yet</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
