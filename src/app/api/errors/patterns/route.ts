import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { subDays } from 'date-fns';

export async function GET() {
  try {
    const now = new Date();
    const sevenDaysAgo = subDays(now, 7);

    const allErrors = await prisma.error.findMany({
      select: {
        category: true,
        errorType: true,
        timestamp: true,
      },
      where: {
        category: {
          not: null,
        },
      },
    });

    const categoryMap = new Map<string, {
      count: number;
      errorType: string;
      recentCount: number;
      oldCount: number;
    }>();

    allErrors.forEach((error) => {
      const category = error.category!;
      const isRecent = new Date(error.timestamp) >= sevenDaysAgo;

      if (!categoryMap.has(category)) {
        categoryMap.set(category, {
          count: 0,
          errorType: error.errorType,
          recentCount: 0,
          oldCount: 0,
        });
      }

      const data = categoryMap.get(category)!;
      data.count += 1;
      if (isRecent) {
        data.recentCount += 1;
      } else {
        data.oldCount += 1;
      }
    });

    const commonMistakes = Array.from(categoryMap.entries())
      .map(([category, data]) => {
        let trend: 'up' | 'down' | 'stable' = 'stable';

        if (data.oldCount > 0) {
          const changeRate = (data.recentCount - data.oldCount) / data.oldCount;
          if (changeRate > 0.2) trend = 'up';
          else if (changeRate < -0.2) trend = 'down';
        } else if (data.recentCount > 0) {
          trend = 'up';
        }

        return {
          category,
          count: data.count,
          errorType: data.errorType,
          recentCount: data.recentCount,
          trend,
        };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return NextResponse.json(commonMistakes);
  } catch (error) {
    console.error('Error fetching error patterns:', error);
    return NextResponse.json({ error: 'Failed to fetch error patterns' }, { status: 500 });
  }
}
