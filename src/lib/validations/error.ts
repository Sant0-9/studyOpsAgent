import { z } from 'zod'
import { ErrorType, HelpLevel } from '@prisma/client'

export const createErrorSchema = z.object({
  sessionId: z.string().uuid().optional(),
  assignmentId: z.string().uuid().optional(),
  errorType: z.nativeEnum(ErrorType).default('OTHER'),
  category: z.string().optional(),
  description: z.string().min(1, 'Description is required'),
  codeContext: z.string().optional(),
  fixApplied: z.string().optional(),
  fixDuration: z.number().int().positive().optional(),
  wasHelpful: z.boolean().optional(),
  helpLevel: z.nativeEnum(HelpLevel).optional(),
  metadata: z.record(z.any()).optional(),
})

export const updateErrorSchema = z.object({
  category: z.string().optional(),
  description: z.string().min(1).optional(),
  codeContext: z.string().optional(),
  fixApplied: z.string().optional(),
  fixDuration: z.number().int().positive().optional(),
  wasHelpful: z.boolean().optional(),
  helpLevel: z.nativeEnum(HelpLevel).optional(),
})

export type CreateErrorInput = z.infer<typeof createErrorSchema>
export type UpdateErrorInput = z.infer<typeof updateErrorSchema>
