import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { success } = await request.json();
    const conceptId = params.id;

    const concept = await prisma.concept.findUnique({
      where: { id: conceptId },
    });

    if (!concept) {
      return NextResponse.json({ error: 'Concept not found' }, { status: 404 });
    }

    const timesEncountered = concept.timesEncountered + 1;
    const timesSucceeded = success ? concept.timesSucceeded + 1 : concept.timesSucceeded;
    const timesFailed = success ? concept.timesFailed : concept.timesFailed + 1;

    const successRate = timesSucceeded / timesEncountered;

    let newMasteryLevel = concept.masteryLevel;
    if (success) {
      newMasteryLevel = Math.min(1.0, concept.masteryLevel + (1 - concept.masteryLevel) * 0.1);
    } else {
      newMasteryLevel = Math.max(0.0, concept.masteryLevel * 0.9);
    }

    const now = new Date();
    let nextReviewDate: Date | null = null;

    if (newMasteryLevel >= 0.8) {
      nextReviewDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    } else if (newMasteryLevel >= 0.5) {
      nextReviewDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    } else {
      nextReviewDate = new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000);
    }

    const updatedConcept = await prisma.concept.update({
      where: { id: conceptId },
      data: {
        lastUsed: now,
        timesEncountered,
        timesSucceeded,
        timesFailed,
        masteryLevel: newMasteryLevel,
        nextReviewDate,
        needsReview: false,
      },
    });

    return NextResponse.json(updatedConcept);
  } catch (error) {
    console.error('Error recording practice:', error);
    return NextResponse.json({ error: 'Failed to record practice' }, { status: 500 });
  }
}
