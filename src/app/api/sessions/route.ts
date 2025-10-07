import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { createSessionSchema } from '@/lib/validations/session'
import { success, error, badRequest } from '@/lib/utils/api-response'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const assignmentId = searchParams.get('assignmentId')
    const activityType = searchParams.get('activityType')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit

    const where: any = {}
    if (assignmentId) where.assignmentId = assignmentId
    if (activityType) where.activityType = activityType

    const [sessions, total] = await Promise.all([
      prisma.workSession.findMany({
        where,
        orderBy: { startTime: 'desc' },
        skip,
        take: limit,
        include: {
          assignment: {
            select: {
              id: true,
              title: true,
              course: true,
            },
          },
          _count: {
            select: {
              errors: true,
            },
          },
        },
      }),
      prisma.workSession.count({ where }),
    ])

    return success({
      sessions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (err) {
    console.error('Error fetching sessions:', err)
    return error('Failed to fetch sessions')
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = createSessionSchema.parse(body)

    const session = await prisma.workSession.create({
      data: validatedData,
    })

    return success(session, 201)
  } catch (err: any) {
    console.error('Error creating session:', err)
    if (err.name === 'ZodError') {
      return badRequest('Validation error', err.errors)
    }
    return error('Failed to create session')
  }
}
