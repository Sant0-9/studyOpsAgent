import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { success, error, badRequest } from '@/lib/utils/api-response'
import { z } from 'zod'

const createConceptSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  category: z.string().min(1, 'Category is required').max(255),
  description: z.string().optional(),
  masteryLevel: z.number().min(0).max(1).default(0),
  relatedConcepts: z.array(z.string().uuid()).optional(),
  prerequisites: z.array(z.string().uuid()).optional(),
})

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const category = searchParams.get('category')
    const needsReview = searchParams.get('needsReview')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const skip = (page - 1) * limit

    const where: any = {}
    if (category) where.category = category
    if (needsReview === 'true') where.needsReview = true

    const [concepts, total] = await Promise.all([
      prisma.concept.findMany({
        where,
        orderBy: { masteryLevel: 'asc' },
        skip,
        take: limit,
      }),
      prisma.concept.count({ where }),
    ])

    return success({
      concepts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (err) {
    console.error('Error fetching concepts:', err)
    return error('Failed to fetch concepts')
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = createConceptSchema.parse(body)

    const concept = await prisma.concept.create({
      data: {
        ...validatedData,
        relatedConcepts: validatedData.relatedConcepts
          ? JSON.stringify(validatedData.relatedConcepts)
          : null,
        prerequisites: validatedData.prerequisites
          ? JSON.stringify(validatedData.prerequisites)
          : null,
      },
    })

    return success(concept, 201)
  } catch (err: any) {
    console.error('Error creating concept:', err)
    if (err.name === 'ZodError') {
      return badRequest('Validation error', err.errors)
    }
    if (err.code === 'P2002') {
      return badRequest('A concept with this name already exists')
    }
    return error('Failed to create concept')
  }
}
