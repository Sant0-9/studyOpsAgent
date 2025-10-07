'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/db/prisma'
import {
  createSessionSchema,
  updateSessionSchema,
  type CreateSessionInput,
  type UpdateSessionInput,
} from '@/lib/validations/session'

export async function createSession(data: CreateSessionInput) {
  try {
    const validatedData = createSessionSchema.parse(data)

    const session = await prisma.workSession.create({
      data: validatedData,
    })

    revalidatePath('/study')
    if (data.assignmentId) {
      revalidatePath(`/assignments/${data.assignmentId}`)
    }
    return { success: true, data: session }
  } catch (error: any) {
    console.error('Error creating session:', error)
    return { success: false, error: error.message }
  }
}

export async function endSession(id: string, data: UpdateSessionInput) {
  try {
    const session = await prisma.workSession.findUnique({ where: { id } })
    if (!session) {
      return { success: false, error: 'Session not found' }
    }

    const validatedData = updateSessionSchema.parse(data)
    const updateData: any = { ...validatedData }

    // Calculate duration
    if (validatedData.endTime) {
      const duration = Math.round(
        (new Date(validatedData.endTime).getTime() -
         new Date(session.startTime).getTime()) / (1000 * 60)
      )
      updateData.duration = duration

      // Update assignment actual hours if linked
      if (session.assignmentId) {
        await prisma.assignment.update({
          where: { id: session.assignmentId },
          data: {
            actualHours: {
              increment: duration / 60,
            },
          },
        })
      }
    }

    if (validatedData.filesWorkedOn) {
      updateData.filesWorkedOn = JSON.stringify(validatedData.filesWorkedOn)
    }

    const updatedSession = await prisma.workSession.update({
      where: { id },
      data: updateData,
    })

    revalidatePath('/study')
    if (session.assignmentId) {
      revalidatePath(`/assignments/${session.assignmentId}`)
    }
    return { success: true, data: updatedSession }
  } catch (error: any) {
    console.error('Error ending session:', error)
    return { success: false, error: error.message }
  }
}

export async function deleteSession(id: string) {
  try {
    await prisma.workSession.delete({ where: { id } })

    revalidatePath('/study')
    return { success: true }
  } catch (error: any) {
    console.error('Error deleting session:', error)
    return { success: false, error: error.message }
  }
}
