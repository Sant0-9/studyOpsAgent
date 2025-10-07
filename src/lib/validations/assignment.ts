import { z } from 'zod'
import { AssignmentStatus } from '@prisma/client'

export const createAssignmentSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
  course: z.string().min(1, 'Course is required').max(255),
  description: z.string().optional(),
  dueDate: z.string().or(z.date()).transform((val) => new Date(val)),
  priority: z.number().int().min(0).max(10).default(0),
  estimatedHours: z.number().positive().optional(),
  requirements: z.array(z.string()).optional(),
  rubric: z.string().optional(),
  sourceUrl: z.string().url().optional().or(z.literal('')),
  notes: z.string().optional(),
})

export const updateAssignmentSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  course: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  dueDate: z.string().or(z.date()).transform((val) => new Date(val)).optional(),
  status: z.nativeEnum(AssignmentStatus).optional(),
  priority: z.number().int().min(0).max(10).optional(),
  estimatedHours: z.number().positive().optional(),
  actualHours: z.number().nonnegative().optional(),
  completionPercentage: z.number().int().min(0).max(100).optional(),
  requirements: z.array(z.string()).optional(),
  rubric: z.string().optional(),
  sourceUrl: z.string().url().optional().or(z.literal('')),
  notes: z.string().optional(),
})

export type CreateAssignmentInput = z.infer<typeof createAssignmentSchema>
export type UpdateAssignmentInput = z.infer<typeof updateAssignmentSchema>
