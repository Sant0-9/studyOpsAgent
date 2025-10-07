import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { subDays, format } from 'date-fns';

export async function GET() {
  try {
    const now = new Date();
    const thirtyDaysAgo = subDays(now, 30);

    const [allErrors, recentErrors] = await Promise.all([
      prisma.error.findMany({
        select: {
          id: true,
          errorType: true,
          category: true,
          fixApplied: true,
          fixDuration: true,
          timestamp: true,
        },
      }),
      prisma.error.findMany({
        where: {
          timestamp: {
            gte: thirtyDaysAgo,
          },
        },
        select: {
          timestamp: true,
        },
      }),
    ]);

    const totalErrors = allErrors.length;

    const errorsByType = allErrors.reduce((acc, error) => {
      const existing = acc.find((item) => item.type === error.errorType);
      if (existing) {
        existing.count += 1;
      } else {
        acc.push({ type: error.errorType, count: 1 });
      }
      return acc;
    }, [] as Array<{ type: string; count: number }>);

    const errorsByDay = recentErrors.reduce((acc, error) => {
      const date = format(new Date(error.timestamp), 'MM/dd');
      const existing = acc.find((item) => item.date === date);
      if (existing) {
        existing.count += 1;
      } else {
        acc.push({ date, count: 1 });
      }
      return acc;
    }, [] as Array<{ date: string; count: number }>);

    errorsByDay.sort((a, b) => {
      const [aMonth, aDay] = a.date.split('/').map(Number);
      const [bMonth, bDay] = b.date.split('/').map(Number);
      return aMonth === bMonth ? aDay - bDay : aMonth - bMonth;
    });

    const commonCategories = allErrors
      .filter((e) => e.category)
      .reduce((acc, error) => {
        const existing = acc.find((item) => item.category === error.category);
        if (existing) {
          existing.count += 1;
        } else {
          acc.push({ category: error.category!, count: 1 });
        }
        return acc;
      }, [] as Array<{ category: string; count: number }>)
      .sort((a, b) => b.count - a.count);

    const fixedErrors = allErrors.filter((e) => e.fixApplied);
    const fixedCount = fixedErrors.length;

    const totalFixTime = fixedErrors.reduce((sum, e) => sum + (e.fixDuration || 0), 0);
    const avgFixTime = fixedCount > 0 ? Math.round(totalFixTime / fixedCount) : 0;

    return NextResponse.json({
      totalErrors,
      errorsByType,
      errorTrend: errorsByDay,
      commonCategories,
      avgFixTime,
      fixedCount,
    });
  } catch (error) {
    console.error('Error fetching error stats:', error);
    return NextResponse.json({ error: 'Failed to fetch error stats' }, { status: 500 });
  }
}
