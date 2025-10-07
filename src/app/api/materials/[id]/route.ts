import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { updateMaterialSchema } from '@/lib/validations/material'
import { success, error, notFound, badRequest } from '@/lib/utils/api-response'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const material = await prisma.studyMaterial.findUnique({
      where: { id },
      include: {
        assignment: {
          select: {
            id: true,
            title: true,
            course: true,
          },
        },
      },
    })

    if (!material) {
      return notFound('Material not found')
    }

    return success(material)
  } catch (err) {
    console.error('Error fetching material:', err)
    return error('Failed to fetch material')
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const validatedData = updateMaterialSchema.parse(body)

    const existing = await prisma.studyMaterial.findUnique({ where: { id } })
    if (!existing) {
      return notFound('Material not found')
    }

    const updateData: any = { ...validatedData }
    if (validatedData.metadata) {
      updateData.metadata = JSON.stringify(validatedData.metadata)
    }

    const material = await prisma.studyMaterial.update({
      where: { id },
      data: updateData,
    })

    return success(material)
  } catch (err: any) {
    console.error('Error updating material:', err)
    if (err.name === 'ZodError') {
      return badRequest('Validation error', err.errors)
    }
    return error('Failed to update material')
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const existing = await prisma.studyMaterial.findUnique({ where: { id } })
    if (!existing) {
      return notFound('Material not found')
    }

    await prisma.studyMaterial.delete({ where: { id } })

    return success({ message: 'Material deleted successfully' })
  } catch (err) {
    console.error('Error deleting material:', err)
    return error('Failed to delete material')
  }
}
