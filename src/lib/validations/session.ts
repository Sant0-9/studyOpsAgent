import { z } from 'zod'
import { ActivityType } from '@prisma/client'

export const createSessionSchema = z.object({
  id: z.string().uuid().optional(),
  assignmentId: z.string().uuid().nullable().optional(),
  startTime: z.string().or(z.date()).transform((val) => new Date(val)),
  endTime: z.string().or(z.date()).transform((val) => new Date(val)).optional(),
  duration: z.number().int().optional(),
  activityType: z.nativeEnum(ActivityType).default('CODING'),
  focusScore: z.number().int().min(0).max(100).nullable().optional(),
  notes: z.string().nullable().optional(),
})

export const updateSessionSchema = z.object({
  endTime: z.string().or(z.date()).transform((val) => new Date(val)).optional(),
  activityType: z.nativeEnum(ActivityType).optional(),
  focusScore: z.number().int().min(0).max(100).optional(),
  notes: z.string().optional(),
  filesWorkedOn: z.array(z.string()).optional(),
})

export type CreateSessionInput = z.infer<typeof createSessionSchema>
export type UpdateSessionInput = z.infer<typeof updateSessionSchema>
