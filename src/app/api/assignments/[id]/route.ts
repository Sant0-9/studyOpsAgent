import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { updateAssignmentSchema } from '@/lib/validations/assignment'
import { success, error, notFound, badRequest } from '@/lib/utils/api-response'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const assignment = await prisma.assignment.findUnique({
      where: { id },
      include: {
        studyMaterials: true,
        workSessions: {
          orderBy: { startTime: 'desc' },
          take: 10,
        },
        errors: {
          orderBy: { timestamp: 'desc' },
          take: 10,
        },
      },
    })

    if (!assignment) {
      return notFound('Assignment not found')
    }

    return success(assignment)
  } catch (err) {
    console.error('Error fetching assignment:', err)
    return error('Failed to fetch assignment')
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const validatedData = updateAssignmentSchema.parse(body)

    const existing = await prisma.assignment.findUnique({ where: { id } })
    if (!existing) {
      return notFound('Assignment not found')
    }

    const updateData: any = { ...validatedData }
    if (validatedData.requirements) {
      updateData.requirements = JSON.stringify(validatedData.requirements)
    }

    const assignment = await prisma.assignment.update({
      where: { id },
      data: updateData,
    })

    return success(assignment)
  } catch (err: any) {
    console.error('Error updating assignment:', err)
    if (err.name === 'ZodError') {
      return badRequest('Validation error', err.errors)
    }
    return error('Failed to update assignment')
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const existing = await prisma.assignment.findUnique({ where: { id } })
    if (!existing) {
      return notFound('Assignment not found')
    }

    await prisma.assignment.delete({ where: { id } })

    return success({ message: 'Assignment deleted successfully' })
  } catch (err) {
    console.error('Error deleting assignment:', err)
    return error('Failed to delete assignment')
  }
}
