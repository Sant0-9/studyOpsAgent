import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { updateSessionSchema } from '@/lib/validations/session'
import { success, error, notFound, badRequest } from '@/lib/utils/api-response'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await prisma.workSession.findUnique({
      where: { id },
      include: {
        assignment: {
          select: {
            id: true,
            title: true,
            course: true,
          },
        },
        errors: {
          orderBy: { timestamp: 'desc' },
        },
      },
    })

    if (!session) {
      return notFound('Session not found')
    }

    return success(session)
  } catch (err) {
    console.error('Error fetching session:', err)
    return error('Failed to fetch session')
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const validatedData = updateSessionSchema.parse(body)

    const existing = await prisma.workSession.findUnique({ where: { id } })
    if (!existing) {
      return notFound('Session not found')
    }

    const updateData: any = { ...validatedData }

    // Calculate duration if endTime is provided
    if (validatedData.endTime && existing.startTime) {
      const duration = Math.round(
        (new Date(validatedData.endTime).getTime() -
         new Date(existing.startTime).getTime()) / (1000 * 60)
      )
      updateData.duration = duration
    }

    if (validatedData.filesWorkedOn) {
      updateData.filesWorkedOn = JSON.stringify(validatedData.filesWorkedOn)
    }

    const session = await prisma.workSession.update({
      where: { id },
      data: updateData,
    })

    return success(session)
  } catch (err: any) {
    console.error('Error updating session:', err)
    if (err.name === 'ZodError') {
      return badRequest('Validation error', err.errors)
    }
    return error('Failed to update session')
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const existing = await prisma.workSession.findUnique({ where: { id } })
    if (!existing) {
      return notFound('Session not found')
    }

    await prisma.workSession.delete({ where: { id } })

    return success({ message: 'Session deleted successfully' })
  } catch (err) {
    console.error('Error deleting session:', err)
    return error('Failed to delete session')
  }
}
