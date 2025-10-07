'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/db/prisma'

export async function updateConceptMastery(
  id: string,
  wasSuccessful: boolean
) {
  try {
    const concept = await prisma.concept.findUnique({ where: { id } })
    if (!concept) {
      return { success: false, error: 'Concept not found' }
    }

    const timesEncountered = concept.timesEncountered + 1
    const timesSucceeded = wasSuccessful
      ? concept.timesSucceeded + 1
      : concept.timesSucceeded
    const timesFailed = wasSuccessful
      ? concept.timesFailed
      : concept.timesFailed + 1

    // Calculate new mastery level (simple success rate)
    const masteryLevel = timesSucceeded / timesEncountered

    // Determine if review is needed
    const needsReview = masteryLevel < 0.7

    // Calculate next review date using spaced repetition
    let nextReviewDate: Date | null = null
    if (needsReview) {
      const daysUntilReview = Math.max(1, Math.floor(masteryLevel * 14))
      nextReviewDate = new Date(Date.now() + daysUntilReview * 24 * 60 * 60 * 1000)
    }

    const updatedConcept = await prisma.concept.update({
      where: { id },
      data: {
        timesEncountered,
        timesSucceeded,
        timesFailed,
        masteryLevel,
        needsReview,
        nextReviewDate,
        lastUsed: new Date(),
      },
    })

    revalidatePath('/concepts')
    return { success: true, data: updatedConcept }
  } catch (error: any) {
    console.error('Error updating concept mastery:', error)
    return { success: false, error: error.message }
  }
}

export async function markConceptForReview(id: string) {
  try {
    const concept = await prisma.concept.update({
      where: { id },
      data: {
        needsReview: true,
        nextReviewDate: new Date(),
      },
    })

    revalidatePath('/concepts')
    return { success: true, data: concept }
  } catch (error: any) {
    console.error('Error marking concept for review:', error)
    return { success: false, error: error.message }
  }
}

export async function getConceptsNeedingReview() {
  try {
    const concepts = await prisma.concept.findMany({
      where: {
        OR: [
          { needsReview: true },
          {
            nextReviewDate: {
              lte: new Date(),
            },
          },
        ],
      },
      orderBy: {
        masteryLevel: 'asc',
      },
    })

    return { success: true, data: concepts }
  } catch (error: any) {
    console.error('Error fetching concepts needing review:', error)
    return { success: false, error: error.message }
  }
}
