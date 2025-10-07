import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function AnalyticsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold">Analytics</h1>
        <p className="text-muted-foreground">Track your progress and insights</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Study Time</CardTitle>
            <CardDescription>Time spent studying</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0h</div>
            <p className="text-xs text-muted-foreground">This week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Assignments Completed</CardTitle>
            <CardDescription>Completed vs total</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0/0</div>
            <p className="text-xs text-muted-foreground">0% completion rate</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Focus Score</CardTitle>
            <CardDescription>Average focus level</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">N/A</div>
            <p className="text-xs text-muted-foreground">No sessions yet</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Progress Charts</CardTitle>
          <CardDescription>Visualize your study patterns</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-muted-foreground">Charts will be displayed here</div>
        </CardContent>
      </Card>
    </div>
  );
}
