import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus } from 'lucide-react';

export default function AssignmentsPage() {
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

      <Card>
        <CardHeader>
          <CardTitle>Your Assignments</CardTitle>
          <CardDescription>All your assignments in one place</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            No assignments yet. Create your first assignment to get started!
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
