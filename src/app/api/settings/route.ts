import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { success, error, badRequest } from '@/lib/utils/api-response'
import { z } from 'zod'

const createSettingSchema = z.object({
  key: z.string().min(1, 'Key is required').max(255),
  value: z.any(),
  description: z.string().optional(),
})

export async function GET(request: NextRequest) {
  try {
    const settings = await prisma.settings.findMany({
      orderBy: { key: 'asc' },
    })

    // Parse JSON values
    const parsedSettings = settings.map(setting => ({
      ...setting,
      value: JSON.parse(setting.value),
    }))

    return success(parsedSettings)
  } catch (err) {
    console.error('Error fetching settings:', err)
    return error('Failed to fetch settings')
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = createSettingSchema.parse(body)

    const setting = await prisma.settings.create({
      data: {
        ...validatedData,
        value: JSON.stringify(validatedData.value),
      },
    })

    return success({
      ...setting,
      value: JSON.parse(setting.value),
    }, 201)
  } catch (err: any) {
    console.error('Error creating setting:', err)
    if (err.name === 'ZodError') {
      return badRequest('Validation error', err.errors)
    }
    if (err.code === 'P2002') {
      return badRequest('A setting with this key already exists')
    }
    return error('Failed to create setting')
  }
}
