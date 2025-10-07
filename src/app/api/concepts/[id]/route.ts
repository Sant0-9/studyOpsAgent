import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { success, error, notFound, badRequest } from '@/lib/utils/api-response'
import { z } from 'zod'

const updateConceptSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  category: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  masteryLevel: z.number().min(0).max(1).optional(),
  needsReview: z.boolean().optional(),
  nextReviewDate: z.string().or(z.date()).transform((val) => new Date(val)).optional(),
  timesEncountered: z.number().int().nonnegative().optional(),
  timesSucceeded: z.number().int().nonnegative().optional(),
  timesFailed: z.number().int().nonnegative().optional(),
  relatedConcepts: z.array(z.string().uuid()).optional(),
  prerequisites: z.array(z.string().uuid()).optional(),
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const concept = await prisma.concept.findUnique({
      where: { id },
    })

    if (!concept) {
      return notFound('Concept not found')
    }

    return success(concept)
  } catch (err) {
    console.error('Error fetching concept:', err)
    return error('Failed to fetch concept')
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const validatedData = updateConceptSchema.parse(body)

    const existing = await prisma.concept.findUnique({ where: { id } })
    if (!existing) {
      return notFound('Concept not found')
    }

    const updateData: any = { ...validatedData, lastUsed: new Date() }

    if (validatedData.relatedConcepts) {
      updateData.relatedConcepts = JSON.stringify(validatedData.relatedConcepts)
    }
    if (validatedData.prerequisites) {
      updateData.prerequisites = JSON.stringify(validatedData.prerequisites)
    }

    const concept = await prisma.concept.update({
      where: { id },
      data: updateData,
    })

    return success(concept)
  } catch (err: any) {
    console.error('Error updating concept:', err)
    if (err.name === 'ZodError') {
      return badRequest('Validation error', err.errors)
    }
    return error('Failed to update concept')
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const existing = await prisma.concept.findUnique({ where: { id } })
    if (!existing) {
      return notFound('Concept not found')
    }

    await prisma.concept.delete({ where: { id } })

    return success({ message: 'Concept deleted successfully' })
  } catch (err) {
    console.error('Error deleting concept:', err)
    return error('Failed to delete concept')
  }
}
