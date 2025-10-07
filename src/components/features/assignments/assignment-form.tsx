'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

const assignmentSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  course: z.string().min(1, 'Course is required'),
  description: z.string().optional(),
  dueDate: z.string().min(1, 'Due date is required'),
  estimatedHours: z.number().optional(),
  priority: z.number().min(0).max(10),
  sourceUrl: z.string().url().optional().or(z.literal('')),
  notes: z.string().optional(),
});

type AssignmentFormData = z.infer<typeof assignmentSchema>;

interface AssignmentFormProps {
  initialData?: Partial<AssignmentFormData>;
  assignmentId?: string;
}

export function AssignmentForm({ initialData, assignmentId }: AssignmentFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AssignmentFormData>({
    resolver: zodResolver(assignmentSchema),
    defaultValues: { priority: 0, ...initialData },
  });

  const onSubmit = async (data: AssignmentFormData) => {
    setIsLoading(true);
    try {
      const url = assignmentId ? `/api/assignments/${assignmentId}` : '/api/assignments';
      const method = assignmentId ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          dueDate: new Date(data.dueDate).toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save assignment');
      }

      const result = await response.json();
      toast.success(assignmentId ? 'Assignment updated!' : 'Assignment created!');
      router.push(`/assignments/${result.data.id}`);
      router.refresh();
    } catch (error) {
      toast.error('Failed to save assignment');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          placeholder="Assignment title"
          {...register('title')}
        />
        {errors.title && (
          <p className="text-sm text-destructive">{errors.title.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="course">Course</Label>
        <Input
          id="course"
          placeholder="Course name"
          {...register('course')}
        />
        {errors.course && (
          <p className="text-sm text-destructive">{errors.course.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          placeholder="Assignment description"
          rows={4}
          {...register('description')}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="dueDate">Due Date</Label>
          <Input
            id="dueDate"
            type="datetime-local"
            {...register('dueDate')}
          />
          {errors.dueDate && (
            <p className="text-sm text-destructive">{errors.dueDate.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="estimatedHours">Estimated Hours</Label>
          <Input
            id="estimatedHours"
            type="number"
            step="0.5"
            placeholder="0"
            {...register('estimatedHours', { valueAsNumber: true })}
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="priority">Priority (0-10)</Label>
          <Input
            id="priority"
            type="number"
            min="0"
            max="10"
            placeholder="0"
            {...register('priority', { valueAsNumber: true })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="sourceUrl">Source URL</Label>
          <Input
            id="sourceUrl"
            type="url"
            placeholder="https://..."
            {...register('sourceUrl')}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          placeholder="Additional notes"
          rows={3}
          {...register('notes')}
        />
      </div>

      <div className="flex gap-4">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : assignmentId ? 'Update Assignment' : 'Create Assignment'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isLoading}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
