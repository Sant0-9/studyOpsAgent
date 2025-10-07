import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function NewAssignmentPage() {
  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold">Create Assignment</h1>
        <p className="text-muted-foreground">Add a new assignment to track</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Assignment Details</CardTitle>
          <CardDescription>Fill in the assignment information</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-muted-foreground">Assignment form will be implemented here</div>
        </CardContent>
      </Card>
    </div>
  );
}
