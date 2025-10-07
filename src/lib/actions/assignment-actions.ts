'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/db/prisma'
import {
  createAssignmentSchema,
  updateAssignmentSchema,
  type CreateAssignmentInput,
  type UpdateAssignmentInput,
} from '@/lib/validations/assignment'
import { AssignmentStatus } from '@prisma/client'

export async function createAssignment(data: CreateAssignmentInput) {
  try {
    const validatedData = createAssignmentSchema.parse(data)

    const assignment = await prisma.assignment.create({
      data: {
        ...validatedData,
        requirements: validatedData.requirements
          ? JSON.stringify(validatedData.requirements)
          : null,
      },
    })

    revalidatePath('/assignments')
    return { success: true, data: assignment }
  } catch (error: any) {
    console.error('Error creating assignment:', error)
    return { success: false, error: error.message }
  }
}

export async function updateAssignment(id: string, data: UpdateAssignmentInput) {
  try {
    const validatedData = updateAssignmentSchema.parse(data)

    const updateData: any = { ...validatedData }
    if (validatedData.requirements) {
      updateData.requirements = JSON.stringify(validatedData.requirements)
    }

    const assignment = await prisma.assignment.update({
      where: { id },
      data: updateData,
    })

    revalidatePath('/assignments')
    revalidatePath(`/assignments/${id}`)
    return { success: true, data: assignment }
  } catch (error: any) {
    console.error('Error updating assignment:', error)
    return { success: false, error: error.message }
  }
}

export async function deleteAssignment(id: string) {
  try {
    await prisma.assignment.delete({ where: { id } })

    revalidatePath('/assignments')
    return { success: true }
  } catch (error: any) {
    console.error('Error deleting assignment:', error)
    return { success: false, error: error.message }
  }
}

export async function updateAssignmentStatus(id: string, status: AssignmentStatus) {
  try {
    const assignment = await prisma.assignment.update({
      where: { id },
      data: { status },
    })

    revalidatePath('/assignments')
    revalidatePath(`/assignments/${id}`)
    return { success: true, data: assignment }
  } catch (error: any) {
    console.error('Error updating assignment status:', error)
    return { success: false, error: error.message }
  }
}

export async function updateAssignmentProgress(id: string, percentage: number) {
  try {
    const assignment = await prisma.assignment.update({
      where: { id },
      data: {
        completionPercentage: percentage,
        status: percentage === 100 ? 'COMPLETED' : 'IN_PROGRESS',
      },
    })

    revalidatePath('/assignments')
    revalidatePath(`/assignments/${id}`)
    return { success: true, data: assignment }
  } catch (error: any) {
    console.error('Error updating assignment progress:', error)
    return { success: false, error: error.message }
  }
}
