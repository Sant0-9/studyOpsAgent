'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Brain, Plus } from 'lucide-react';
import { toast } from 'sonner';

const conceptSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  category: z.string().min(2, 'Category is required'),
  description: z.string().optional(),
  masteryLevel: z.number().min(0).max(1).optional(),
});

type ConceptFormData = z.infer<typeof conceptSchema>;

const COMMON_CATEGORIES = [
  'Algorithms',
  'Data Structures',
  'Programming Syntax',
  'Design Patterns',
  'Mathematics',
  'Statistics',
  'Calculus',
  'Algebra',
  'Computer Science',
  'Web Development',
  'Database',
  'Networking',
  'Security',
  'Other',
];

interface ConceptFormProps {
  onSuccess?: () => void;
}

export function ConceptForm({ onSuccess }: ConceptFormProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<ConceptFormData>({
    resolver: zodResolver(conceptSchema),
    defaultValues: {
      masteryLevel: 0,
    },
  });

  const category = watch('category');

  const onSubmit = async (data: ConceptFormData) => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/concepts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error('Failed to create concept');

      toast.success('Concept created successfully');
      reset();
      setOpen(false);
      onSuccess?.();
    } catch (error) {
      console.error('Error creating concept:', error);
      toast.error('Failed to create concept');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Concept
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Add New Concept
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Concept Name</Label>
            <Input
              id="name"
              placeholder="e.g., Binary Search, Recursion, React Hooks"
              {...register('name')}
            />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={(value) => setValue('category', value)}>
              <SelectTrigger id="category">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {COMMON_CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category && <p className="text-sm text-destructive">{errors.category.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Explain what this concept is about and key points to remember..."
              rows={4}
              {...register('description')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="masteryLevel">Initial Mastery Level (0-100%)</Label>
            <Input
              id="masteryLevel"
              type="number"
              min="0"
              max="100"
              placeholder="0"
              {...register('masteryLevel', {
                setValueAs: (v) => (v === '' ? 0 : parseFloat(v) / 100),
              })}
            />
            <p className="text-xs text-muted-foreground">
              Set your current understanding level. Defaults to 0% (not yet learned).
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Concept'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
