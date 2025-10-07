'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { ErrorType, HelpLevel } from '@prisma/client';
import { AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useSessionStore } from '@/lib/store/session-store';

const errorLogSchema = z.object({
  errorType: z.nativeEnum(ErrorType),
  category: z.string().min(1, 'Category is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  codeContext: z.string().optional(),
  fixApplied: z.string().optional(),
  fixDuration: z.number().optional(),
  helpLevel: z.nativeEnum(HelpLevel).default(HelpLevel.NONE),
});

type ErrorLogFormData = z.infer<typeof errorLogSchema>;

interface ErrorLogFormProps {
  assignmentId?: string | null;
  onSuccess?: () => void;
}

export function ErrorLogForm({ assignmentId, onSuccess }: ErrorLogFormProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { sessionId, isActive } = useSessionStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<ErrorLogFormData>({
    resolver: zodResolver(errorLogSchema),
    defaultValues: {
      errorType: ErrorType.OTHER,
      helpLevel: HelpLevel.NONE,
    },
  });

  const errorType = watch('errorType');
  const helpLevel = watch('helpLevel');

  const onSubmit = async (data: ErrorLogFormData) => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/errors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          sessionId: isActive ? sessionId : null,
          assignmentId: assignmentId || null,
          fixDuration: data.fixDuration ? data.fixDuration * 60 : null,
        }),
      });

      if (!response.ok) throw new Error('Failed to log error');

      toast.success('Error logged successfully');
      reset();
      setOpen(false);
      onSuccess?.();
    } catch (error) {
      console.error('Error logging error:', error);
      toast.error('Failed to log error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <AlertCircle className="h-4 w-4 mr-2" />
          Log Error
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Log an Error</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="errorType">Error Type</Label>
            <Select value={errorType} onValueChange={(value) => setValue('errorType', value as ErrorType)}>
              <SelectTrigger id="errorType">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ErrorType.SYNTAX}>Syntax Error</SelectItem>
                <SelectItem value={ErrorType.LOGIC}>Logic Error</SelectItem>
                <SelectItem value={ErrorType.STYLE}>Style/Convention Error</SelectItem>
                <SelectItem value={ErrorType.TEST}>Test Failure</SelectItem>
                <SelectItem value={ErrorType.RUNTIME}>Runtime Error</SelectItem>
                <SelectItem value={ErrorType.OTHER}>Other</SelectItem>
              </SelectContent>
            </Select>
            {errors.errorType && <p className="text-sm text-destructive">{errors.errorType.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Input
              id="category"
              placeholder="e.g., Array Indexing, Null Pointer, Type Mismatch"
              {...register('category')}
            />
            {errors.category && <p className="text-sm text-destructive">{errors.category.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe what went wrong and what you were trying to do..."
              rows={4}
              {...register('description')}
            />
            {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="codeContext">Code Context (Optional)</Label>
            <Textarea
              id="codeContext"
              placeholder="Paste the relevant code snippet here..."
              rows={6}
              className="font-mono text-sm"
              {...register('codeContext')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="fixApplied">Fix Applied (Optional)</Label>
            <Textarea
              id="fixApplied"
              placeholder="How did you fix it? What did you learn?"
              rows={3}
              {...register('fixApplied')}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fixDuration">Time to Fix (minutes)</Label>
              <Input
                id="fixDuration"
                type="number"
                min="0"
                placeholder="0"
                {...register('fixDuration', { valueAsNumber: true })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="helpLevel">Help Level Used</Label>
              <Select value={helpLevel} onValueChange={(value) => setValue('helpLevel', value as HelpLevel)}>
                <SelectTrigger id="helpLevel">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={HelpLevel.NONE}>No Help</SelectItem>
                  <SelectItem value={HelpLevel.HINT}>Hint</SelectItem>
                  <SelectItem value={HelpLevel.EXPLANATION}>Explanation</SelectItem>
                  <SelectItem value={HelpLevel.SOLUTION}>Full Solution</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Logging...' : 'Log Error'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
