import { z } from 'zod'
import { ActivityType } from '@prisma/client'

export const createSessionSchema = z.object({
  assignmentId: z.string().uuid().optional(),
  startTime: z.string().or(z.date()).transform((val) => new Date(val)),
  activityType: z.nativeEnum(ActivityType).default('CODING'),
  notes: z.string().optional(),
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
