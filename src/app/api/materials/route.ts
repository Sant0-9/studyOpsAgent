import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { createMaterialSchema } from '@/lib/validations/material'
import { success, error, badRequest } from '@/lib/utils/api-response'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const assignmentId = searchParams.get('assignmentId')
    const type = searchParams.get('type')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit

    const where: any = {}
    if (assignmentId) where.assignmentId = assignmentId
    if (type) where.type = type

    const [materials, total] = await Promise.all([
      prisma.studyMaterial.findMany({
        where,
        orderBy: { uploadedAt: 'desc' },
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
        },
      }),
      prisma.studyMaterial.count({ where }),
    ])

    return success({
      materials,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (err) {
    console.error('Error fetching materials:', err)
    return error('Failed to fetch materials')
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = createMaterialSchema.parse(body)

    const material = await prisma.studyMaterial.create({
      data: {
        ...validatedData,
        metadata: validatedData.metadata
          ? JSON.stringify(validatedData.metadata)
          : null,
      },
    })

    return success(material, 201)
  } catch (err: any) {
    console.error('Error creating material:', err)
    if (err.name === 'ZodError') {
      return badRequest('Validation error', err.errors)
    }
    return error('Failed to create material')
  }
}
