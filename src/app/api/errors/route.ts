import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { createErrorSchema } from '@/lib/validations/error'
import { success, error, badRequest } from '@/lib/utils/api-response'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const sessionId = searchParams.get('sessionId')
    const assignmentId = searchParams.get('assignmentId')
    const errorType = searchParams.get('errorType')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit

    const where: any = {}
    if (sessionId) where.sessionId = sessionId
    if (assignmentId) where.assignmentId = assignmentId
    if (errorType) where.errorType = errorType

    const [errors, total] = await Promise.all([
      prisma.error.findMany({
        where,
        orderBy: { timestamp: 'desc' },
        skip,
        take: limit,
        include: {
          session: {
            select: {
              id: true,
              activityType: true,
              startTime: true,
            },
          },
          assignment: {
            select: {
              id: true,
              title: true,
              course: true,
            },
          },
        },
      }),
      prisma.error.count({ where }),
    ])

    return success({
      errors,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (err) {
    console.error('Error fetching errors:', err)
    return error('Failed to fetch errors')
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = createErrorSchema.parse(body)

    const errorRecord = await prisma.error.create({
      data: {
        ...validatedData,
        metadata: validatedData.metadata
          ? JSON.stringify(validatedData.metadata)
          : null,
      },
    })

    return success(errorRecord, 201)
  } catch (err: any) {
    console.error('Error creating error record:', err)
    if (err.name === 'ZodError') {
      return badRequest('Validation error', err.errors)
    }
    return error('Failed to create error record')
  }
}
