import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { updateErrorSchema } from '@/lib/validations/error'
import { success, error, notFound, badRequest } from '@/lib/utils/api-response'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const errorRecord = await prisma.error.findUnique({
      where: { id },
      include: {
        session: true,
        assignment: true,
      },
    })

    if (!errorRecord) {
      return notFound('Error record not found')
    }

    return success(errorRecord)
  } catch (err) {
    console.error('Error fetching error record:', err)
    return error('Failed to fetch error record')
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const validatedData = updateErrorSchema.parse(body)

    const existing = await prisma.error.findUnique({ where: { id } })
    if (!existing) {
      return notFound('Error record not found')
    }

    const errorRecord = await prisma.error.update({
      where: { id },
      data: validatedData,
    })

    return success(errorRecord)
  } catch (err: any) {
    console.error('Error updating error record:', err)
    if (err.name === 'ZodError') {
      return badRequest('Validation error', err.errors)
    }
    return error('Failed to update error record')
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const existing = await prisma.error.findUnique({ where: { id } })
    if (!existing) {
      return notFound('Error record not found')
    }

    await prisma.error.delete({ where: { id } })

    return success({ message: 'Error record deleted successfully' })
  } catch (err) {
    console.error('Error deleting error record:', err)
    return error('Failed to delete error record')
  }
}
