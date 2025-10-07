import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default async function AssignmentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold">Assignment Details</h1>
        <p className="text-muted-foreground">View and manage assignment</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Assignment Information</CardTitle>
          <CardDescription>Assignment ID: {id}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-muted-foreground">Assignment details will be displayed here</div>
        </CardContent>
      </Card>
    </div>
  );
}
