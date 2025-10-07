import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { prisma } from '@/lib/db/prisma';
import { AssignmentsList } from '@/components/features/assignments/assignments-list';
import { DeadlineAlerts } from '@/components/features/assignments/deadline-alerts';

export default async function AssignmentsPage() {
  const assignments = await prisma.assignment.findMany({
    orderBy: { dueDate: 'asc' },
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Assignments</h1>
          <p className="text-muted-foreground">Manage your assignments and deadlines</p>
        </div>
        <Link href="/assignments/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Assignment
          </Button>
        </Link>
      </div>

      <DeadlineAlerts assignments={assignments} />

      {assignments.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-muted-foreground mb-4">
            No assignments yet. Create your first assignment to get started!
          </p>
          <Link href="/assignments/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Assignment
            </Button>
          </Link>
        </div>
      ) : (
        <AssignmentsList assignments={assignments} />
      )}
    </div>
  );
}
