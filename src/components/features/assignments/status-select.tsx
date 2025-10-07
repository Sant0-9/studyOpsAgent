'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AssignmentStatus } from '@prisma/client';
import { toast } from 'sonner';

interface StatusSelectProps {
  assignmentId: string;
  currentStatus: AssignmentStatus;
}

const statusLabels = {
  PENDING: 'Pending',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
  OVERDUE: 'Overdue',
};

export function StatusSelect({ assignmentId, currentStatus }: StatusSelectProps) {
  const router = useRouter();
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStatusChange = async (newStatus: AssignmentStatus) => {
    if (newStatus === currentStatus) return;

    setIsUpdating(true);
    try {
      const response = await fetch(`/api/assignments/${assignmentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update status');
      }

      toast.success(`Status updated to ${statusLabels[newStatus]}`);
      router.refresh();
    } catch (error) {
      toast.error('Failed to update status');
      console.error(error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Select
      value={currentStatus}
      onValueChange={(value) => handleStatusChange(value as AssignmentStatus)}
      disabled={isUpdating}
    >
      <SelectTrigger className="w-[180px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={AssignmentStatus.PENDING}>Pending</SelectItem>
        <SelectItem value={AssignmentStatus.IN_PROGRESS}>In Progress</SelectItem>
        <SelectItem value={AssignmentStatus.COMPLETED}>Completed</SelectItem>
        <SelectItem value={AssignmentStatus.OVERDUE}>Overdue</SelectItem>
      </SelectContent>
    </Select>
  );
}
