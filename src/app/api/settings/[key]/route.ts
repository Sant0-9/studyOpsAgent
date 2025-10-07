import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { success, error, notFound, badRequest } from '@/lib/utils/api-response'
import { z } from 'zod'

const updateSettingSchema = z.object({
  value: z.any(),
  description: z.string().optional(),
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  try {
    const { key } = await params
    const setting = await prisma.settings.findUnique({
      where: { key },
    })

    if (!setting) {
      return notFound('Setting not found')
    }

    return success({
      ...setting,
      value: JSON.parse(setting.value),
    })
  } catch (err) {
    console.error('Error fetching setting:', err)
    return error('Failed to fetch setting')
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  try {
    const { key } = await params
    const body = await request.json()
    const validatedData = updateSettingSchema.parse(body)

    const existing = await prisma.settings.findUnique({ where: { key } })
    if (!existing) {
      return notFound('Setting not found')
    }

    const setting = await prisma.settings.update({
      where: { key },
      data: {
        ...validatedData,
        value: JSON.stringify(validatedData.value),
      },
    })

    return success({
      ...setting,
      value: JSON.parse(setting.value),
    })
  } catch (err: any) {
    console.error('Error updating setting:', err)
    if (err.name === 'ZodError') {
      return badRequest('Validation error', err.errors)
    }
    return error('Failed to update setting')
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  try {
    const { key } = await params
    const existing = await prisma.settings.findUnique({ where: { key } })
    if (!existing) {
      return notFound('Setting not found')
    }

    await prisma.settings.delete({ where: { key } })

    return success({ message: 'Setting deleted successfully' })
  } catch (err) {
    console.error('Error deleting setting:', err)
    return error('Failed to delete setting')
  }
}
