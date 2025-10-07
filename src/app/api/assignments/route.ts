import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { createAssignmentSchema } from '@/lib/validations/assignment'
import { success, error, badRequest } from '@/lib/utils/api-response'
import { AssignmentStatus } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status') as AssignmentStatus | null
    const course = searchParams.get('course')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    const where: any = {}
    if (status) where.status = status
    if (course) where.course = course

    const [assignments, total] = await Promise.all([
      prisma.assignment.findMany({
        where,
        orderBy: { dueDate: 'asc' },
        skip,
        take: limit,
        include: {
          _count: {
            select: {
              studyMaterials: true,
              workSessions: true,
              errors: true,
            },
          },
        },
      }),
      prisma.assignment.count({ where }),
    ])

    return success({
      assignments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (err) {
    console.error('Error fetching assignments:', err)
    return error('Failed to fetch assignments')
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = createAssignmentSchema.parse(body)

    const assignment = await prisma.assignment.create({
      data: {
        ...validatedData,
        requirements: validatedData.requirements
          ? JSON.stringify(validatedData.requirements)
          : null,
      },
    })

    return success(assignment, 201)
  } catch (err: any) {
    console.error('Error creating assignment:', err)
    if (err.name === 'ZodError') {
      return badRequest('Validation error', err.errors)
    }
    return error('Failed to create assignment')
  }
}
