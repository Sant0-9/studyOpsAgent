import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function GET() {
  try {
    const concepts = await prisma.concept.findMany({
      select: {
        masteryLevel: true,
        category: true,
        needsReview: true,
      },
    });

    const totalConcepts = concepts.length;
    const masteredCount = concepts.filter((c) => c.masteryLevel >= 0.8).length;
    const learningCount = concepts.filter((c) => c.masteryLevel >= 0.3 && c.masteryLevel < 0.8).length;
    const newCount = concepts.filter((c) => c.masteryLevel < 0.3).length;
    const reviewDueCount = concepts.filter((c) => c.needsReview).length;

    const averageMastery =
      totalConcepts > 0
        ? concepts.reduce((sum, c) => sum + c.masteryLevel, 0) / totalConcepts
        : 0;

    const categoryMap = new Map<string, { count: number; totalMastery: number }>();
    concepts.forEach((c) => {
      if (!categoryMap.has(c.category)) {
        categoryMap.set(c.category, { count: 0, totalMastery: 0 });
      }
      const data = categoryMap.get(c.category)!;
      data.count += 1;
      data.totalMastery += c.masteryLevel;
    });

    const categoryBreakdown = Array.from(categoryMap.entries())
      .map(([category, data]) => ({
        category,
        count: data.count,
        avgMastery: data.totalMastery / data.count,
      }))
      .sort((a, b) => b.count - a.count);

    const masteryDistribution = [
      { range: '0-20%', count: concepts.filter((c) => c.masteryLevel < 0.2).length },
      { range: '20-40%', count: concepts.filter((c) => c.masteryLevel >= 0.2 && c.masteryLevel < 0.4).length },
      { range: '40-60%', count: concepts.filter((c) => c.masteryLevel >= 0.4 && c.masteryLevel < 0.6).length },
      { range: '60-80%', count: concepts.filter((c) => c.masteryLevel >= 0.6 && c.masteryLevel < 0.8).length },
      { range: '80-100%', count: concepts.filter((c) => c.masteryLevel >= 0.8).length },
    ];

    return NextResponse.json({
      totalConcepts,
      masteredCount,
      learningCount,
      newCount,
      averageMastery,
      reviewDueCount,
      categoryBreakdown,
      masteryDistribution,
    });
  } catch (error) {
    console.error('Error fetching mastery stats:', error);
    return NextResponse.json({ error: 'Failed to fetch mastery stats' }, { status: 500 });
  }
}
