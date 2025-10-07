import { z } from 'zod'
import { MaterialType } from '@prisma/client'

export const createMaterialSchema = z.object({
  assignmentId: z.string().uuid().optional(),
  title: z.string().min(1, 'Title is required').max(255),
  type: z.nativeEnum(MaterialType),
  content: z.string().optional(),
  fileUrl: z.string().optional(),
  fileSize: z.number().int().positive().optional(),
  metadata: z.record(z.any()).optional(),
})

export const updateMaterialSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  assignmentId: z.string().uuid().optional().nullable(),
  content: z.string().optional(),
  metadata: z.record(z.any()).optional(),
})

export type CreateMaterialInput = z.infer<typeof createMaterialSchema>
export type UpdateMaterialInput = z.infer<typeof updateMaterialSchema>
