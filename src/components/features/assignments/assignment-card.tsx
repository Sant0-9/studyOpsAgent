'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreVertical, Calendar } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { AssignmentStatus } from '@prisma/client';

interface Assignment {
  id: string;
  title: string;
  course: string;
  dueDate: Date;
  status: AssignmentStatus;
  completionPercentage: number;
  priority: number;
}

interface AssignmentCardProps {
  assignment: Assignment;
  onDelete?: (id: string) => void;
}

const statusColors = {
  PENDING: 'bg-yellow-500',
  IN_PROGRESS: 'bg-blue-500',
  COMPLETED: 'bg-green-500',
  OVERDUE: 'bg-red-500',
};

const statusLabels = {
  PENDING: 'Pending',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
  OVERDUE: 'Overdue',
};

export function AssignmentCard({ assignment, onDelete }: AssignmentCardProps) {
  const dueDate = new Date(assignment.dueDate);
  const isOverdue = dueDate < new Date() && assignment.status !== 'COMPLETED';

  return (
    <Link href={`/assignments/${assignment.id}`}>
      <Card className="hover:shadow-lg transition-shadow cursor-pointer">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-xl">{assignment.title}</CardTitle>
              <CardDescription className="mt-1">{assignment.course}</CardDescription>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.preventDefault()}>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href={`/assignments/${assignment.id}`}>View Details</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={`/assignments/${assignment.id}/edit`}>Edit</Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={(e) => {
                    e.preventDefault();
                    onDelete?.(assignment.id);
                  }}
                >
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge className={statusColors[assignment.status]}>
                {statusLabels[assignment.status]}
              </Badge>
              {assignment.priority > 5 && (
                <Badge variant="outline">High Priority</Badge>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-medium">{assignment.completionPercentage}%</span>
              </div>
              <Progress value={assignment.completionPercentage} />
            </div>

            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span className={isOverdue ? 'text-destructive font-medium' : ''}>
                  {formatDistanceToNow(dueDate, { addSuffix: true })}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
