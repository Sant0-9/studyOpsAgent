import { notFound } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AssignmentForm } from '@/components/features/assignments/assignment-form';
import { prisma } from '@/lib/db/prisma';
import { format } from 'date-fns';

export default async function EditAssignmentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const assignment = await prisma.assignment.findUnique({
    where: { id },
  });

  if (!assignment) {
    notFound();
  }

  const formattedAssignment = {
    title: assignment.title,
    course: assignment.course,
    description: assignment.description || '',
    dueDate: format(assignment.dueDate, "yyyy-MM-dd'T'HH:mm"),
    estimatedHours: assignment.estimatedHours || undefined,
    priority: assignment.priority,
    sourceUrl: assignment.sourceUrl || '',
    notes: assignment.notes || '',
  };

  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold">Edit Assignment</h1>
        <p className="text-muted-foreground">Update assignment details</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Assignment Details</CardTitle>
          <CardDescription>Modify the assignment information</CardDescription>
        </CardHeader>
        <CardContent>
          <AssignmentForm initialData={formattedAssignment} assignmentId={id} />
        </CardContent>
      </Card>
    </div>
  );
}
