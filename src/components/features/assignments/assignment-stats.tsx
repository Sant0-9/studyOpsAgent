import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Assignment, AssignmentStatus } from '@prisma/client';
import { formatDistanceToNow } from 'date-fns';

interface AssignmentStatsProps {
  assignments: Assignment[];
}

export function AssignmentStats({ assignments }: AssignmentStatsProps) {
  const total = assignments.length;
  const pending = assignments.filter((a) => a.status === AssignmentStatus.PENDING).length;
  const inProgress = assignments.filter((a) => a.status === AssignmentStatus.IN_PROGRESS).length;
  const completed = assignments.filter((a) => a.status === AssignmentStatus.COMPLETED).length;
  const overdue = assignments.filter((a) => a.status === AssignmentStatus.OVERDUE).length;

  const avgCompletion =
    total > 0
      ? Math.round(
          assignments.reduce((sum, a) => sum + a.completionPercentage, 0) / total
        )
      : 0;

  const upcomingAssignments = assignments
    .filter((a) => a.status !== AssignmentStatus.COMPLETED)
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

  const nextDeadline = upcomingAssignments[0];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Assignments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{total}</div>
          <div className="flex gap-2 mt-2 flex-wrap">
            {pending > 0 && (
              <Badge variant="outline" className="text-xs">
                {pending} Pending
              </Badge>
            )}
            {inProgress > 0 && (
              <Badge variant="outline" className="text-xs">
                {inProgress} In Progress
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Completed</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{completed}</div>
          <p className="text-xs text-muted-foreground">
            {total > 0 ? Math.round((completed / total) * 100) : 0}% completion rate
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Overdue</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-destructive">{overdue}</div>
          <p className="text-xs text-muted-foreground">Needs immediate attention</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Next Deadline</CardTitle>
        </CardHeader>
        <CardContent>
          {nextDeadline ? (
            <>
              <div className="text-sm font-bold truncate">{nextDeadline.title}</div>
              <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(nextDeadline.dueDate, { addSuffix: true })}
              </p>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">No upcoming deadlines</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
