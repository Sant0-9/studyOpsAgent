import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { subDays, subMonths, startOfDay, endOfDay, format } from 'date-fns';

export async function GET() {
  try {
    const now = new Date();
    const weekAgo = subDays(now, 7);
    const monthAgo = subMonths(now, 1);

    const [weekSessions, monthSessions, allSessions] = await Promise.all([
      prisma.workSession.findMany({
        where: {
          startTime: {
            gte: weekAgo,
          },
        },
        select: {
          duration: true,
        },
      }),
      prisma.workSession.findMany({
        where: {
          startTime: {
            gte: monthAgo,
          },
        },
        select: {
          duration: true,
        },
      }),
      prisma.workSession.findMany({
        where: {
          duration: {
            not: null,
          },
        },
        select: {
          duration: true,
          activityType: true,
          focusScore: true,
          startTime: true,
        },
      }),
    ]);

    const totalWeekMinutes = weekSessions.reduce((sum, s) => sum + (s.duration || 0), 0);
    const totalMonthMinutes = monthSessions.reduce((sum, s) => sum + (s.duration || 0), 0);
    const averageSessionMinutes =
      allSessions.length > 0
        ? Math.round(allSessions.reduce((sum, s) => sum + (s.duration || 0), 0) / allSessions.length)
        : 0;

    const activityBreakdown = allSessions.reduce((acc, session) => {
      const existing = acc.find((a) => a.activity === session.activityType);
      if (existing) {
        existing.minutes += session.duration || 0;
      } else {
        acc.push({
          activity: session.activityType,
          minutes: session.duration || 0,
        });
      }
      return acc;
    }, [] as Array<{ activity: string; minutes: number }>);

    const last30Days = subDays(now, 30);
    const recentSessions = allSessions.filter((s) => new Date(s.startTime) >= last30Days);

    const focusTrend = recentSessions.reduce((acc, session) => {
      const date = format(new Date(session.startTime), 'MM/dd');
      const existing = acc.find((a) => a.date === date);
      if (session.focusScore !== null) {
        if (existing) {
          existing.total += session.focusScore;
          existing.count += 1;
        } else {
          acc.push({
            date,
            total: session.focusScore,
            count: 1,
            averageFocus: 0,
          });
        }
      }
      return acc;
    }, [] as Array<{ date: string; total: number; count: number; averageFocus: number }>);

    focusTrend.forEach((day) => {
      day.averageFocus = Math.round(day.total / day.count);
    });

    const productiveHours = allSessions.reduce((acc, session) => {
      const hour = new Date(session.startTime).getHours();
      const existing = acc.find((a) => a.hour === hour);
      if (existing) {
        existing.sessions += 1;
      } else {
        acc.push({ hour, sessions: 1 });
      }
      return acc;
    }, [] as Array<{ hour: number; sessions: number }>);

    productiveHours.sort((a, b) => a.hour - b.hour);

    return NextResponse.json({
      totalWeekMinutes,
      totalMonthMinutes,
      averageSessionMinutes,
      activityBreakdown,
      focusTrend: focusTrend.map(({ date, averageFocus }) => ({ date, averageFocus })),
      productiveHours,
    });
  } catch (error) {
    console.error('Error fetching session stats:', error);
    return NextResponse.json({ error: 'Failed to fetch session stats' }, { status: 500 });
  }
}
