import Link from 'next/link';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Clock } from 'lucide-react';
import { Assignment, AssignmentStatus } from '@prisma/client';
import { formatDistanceToNow, isToday, isTomorrow, isPast } from 'date-fns';

interface DeadlineAlertsProps {
  assignments: Assignment[];
}

export function DeadlineAlerts({ assignments }: DeadlineAlertsProps) {
  const now = new Date();

  const overdueAssignments = assignments.filter(
    (a) => isPast(a.dueDate) && a.status !== AssignmentStatus.COMPLETED
  );

  const dueTodayAssignments = assignments.filter(
    (a) => isToday(a.dueDate) && a.status !== AssignmentStatus.COMPLETED
  );

  const dueTomorrowAssignments = assignments.filter(
    (a) => isTomorrow(a.dueDate) && a.status !== AssignmentStatus.COMPLETED
  );

  if (overdueAssignments.length === 0 && dueTodayAssignments.length === 0 && dueTomorrowAssignments.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      {overdueAssignments.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Overdue Assignments</AlertTitle>
          <AlertDescription>
            <div className="mt-2 space-y-1">
              {overdueAssignments.slice(0, 3).map((assignment) => (
                <Link
                  key={assignment.id}
                  href={`/assignments/${assignment.id}`}
                  className="block hover:underline"
                >
                  <span className="font-medium">{assignment.title}</span>
                  <span className="text-xs ml-2">
                    ({formatDistanceToNow(assignment.dueDate, { addSuffix: true })})
                  </span>
                </Link>
              ))}
              {overdueAssignments.length > 3 && (
                <p className="text-xs mt-1">
                  And {overdueAssignments.length - 3} more overdue assignments
                </p>
              )}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {dueTodayAssignments.length > 0 && (
        <Alert>
          <Clock className="h-4 w-4" />
          <AlertTitle>Due Today</AlertTitle>
          <AlertDescription>
            <div className="mt-2 space-y-1">
              {dueTodayAssignments.map((assignment) => (
                <Link
                  key={assignment.id}
                  href={`/assignments/${assignment.id}`}
                  className="block hover:underline"
                >
                  <span className="font-medium">{assignment.title}</span>
                  <Badge variant="outline" className="ml-2 text-xs">
                    {assignment.course}
                  </Badge>
                </Link>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {dueTomorrowAssignments.length > 0 && (
        <Alert>
          <Clock className="h-4 w-4" />
          <AlertTitle>Due Tomorrow</AlertTitle>
          <AlertDescription>
            <div className="mt-2 space-y-1">
              {dueTomorrowAssignments.map((assignment) => (
                <Link
                  key={assignment.id}
                  href={`/assignments/${assignment.id}`}
                  className="block hover:underline"
                >
                  <span className="font-medium">{assignment.title}</span>
                  <Badge variant="outline" className="ml-2 text-xs">
                    {assignment.course}
                  </Badge>
                </Link>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
