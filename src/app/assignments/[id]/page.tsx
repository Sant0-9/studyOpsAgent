import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { prisma } from '@/lib/db/prisma';
import { format } from 'date-fns';
import { Calendar, Clock, ExternalLink, Edit } from 'lucide-react';

export default async function AssignmentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const assignment = await prisma.assignment.findUnique({
    where: { id },
    include: {
      studyMaterials: true,
      workSessions: true,
      errors: true,
    },
  });

  if (!assignment) {
    notFound();
  }

  const statusLabels = {
    PENDING: 'Pending',
    IN_PROGRESS: 'In Progress',
    COMPLETED: 'Completed',
    OVERDUE: 'Overdue',
  };

  const statusColors = {
    PENDING: 'bg-yellow-500',
    IN_PROGRESS: 'bg-blue-500',
    COMPLETED: 'bg-green-500',
    OVERDUE: 'bg-red-500',
  };

  return (
    <div className="flex flex-col gap-6 max-w-5xl">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">{assignment.title}</h1>
          <p className="text-muted-foreground mt-1">{assignment.course}</p>
        </div>
        <Link href={`/assignments/${id}/edit`}>
          <Button>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
        </Link>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <Badge className={statusColors[assignment.status]}>
          {statusLabels[assignment.status]}
        </Badge>
        {assignment.priority > 5 && (
          <Badge variant="outline">High Priority ({assignment.priority}/10)</Badge>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Assignment Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {assignment.description && (
              <div>
                <h3 className="font-semibold mb-1">Description</h3>
                <p className="text-sm text-muted-foreground">{assignment.description}</p>
              </div>
            )}

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Due:</span>
                <span>{format(assignment.dueDate, 'PPP p')}</span>
              </div>

              {assignment.estimatedHours && (
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Estimated:</span>
                  <span>{assignment.estimatedHours}h</span>
                </div>
              )}

              {assignment.sourceUrl && (
                <div className="flex items-center gap-2 text-sm">
                  <ExternalLink className="h-4 w-4 text-muted-foreground" />
                  <a
                    href={assignment.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    View Source
                  </a>
                </div>
              )}
            </div>

            {assignment.notes && (
              <div>
                <h3 className="font-semibold mb-1">Notes</h3>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {assignment.notes}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Progress</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Completion</span>
                <span className="font-medium">{assignment.completionPercentage}%</span>
              </div>
              <Progress value={assignment.completionPercentage} />
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Actual Hours</p>
                <p className="text-2xl font-bold">{assignment.actualHours}h</p>
              </div>
              {assignment.estimatedHours && (
                <div>
                  <p className="text-muted-foreground">Remaining</p>
                  <p className="text-2xl font-bold">
                    {Math.max(0, assignment.estimatedHours - assignment.actualHours)}h
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Study Materials</CardTitle>
            <CardDescription>{assignment.studyMaterials.length} items</CardDescription>
          </CardHeader>
          <CardContent>
            {assignment.studyMaterials.length === 0 ? (
              <p className="text-sm text-muted-foreground">No materials yet</p>
            ) : (
              <ul className="space-y-2">
                {assignment.studyMaterials.slice(0, 3).map((material) => (
                  <li key={material.id} className="text-sm">
                    {material.title}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Work Sessions</CardTitle>
            <CardDescription>{assignment.workSessions.length} sessions</CardDescription>
          </CardHeader>
          <CardContent>
            {assignment.workSessions.length === 0 ? (
              <p className="text-sm text-muted-foreground">No sessions yet</p>
            ) : (
              <p className="text-sm text-muted-foreground">
                {assignment.workSessions.length} study sessions logged
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Errors Logged</CardTitle>
            <CardDescription>{assignment.errors.length} errors</CardDescription>
          </CardHeader>
          <CardContent>
            {assignment.errors.length === 0 ? (
              <p className="text-sm text-muted-foreground">No errors logged</p>
            ) : (
              <p className="text-sm text-muted-foreground">
                {assignment.errors.length} errors to learn from
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
