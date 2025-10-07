import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const format = searchParams.get('format') || 'json';
    const errorType = searchParams.get('errorType');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const where: any = {};
    if (errorType) where.errorType = errorType;
    if (startDate || endDate) {
      where.timestamp = {};
      if (startDate) where.timestamp.gte = new Date(startDate);
      if (endDate) where.timestamp.lte = new Date(endDate);
    }

    const errors = await prisma.error.findMany({
      where,
      include: {
        session: {
          select: {
            activityType: true,
            startTime: true,
          },
        },
        assignment: {
          select: {
            title: true,
            course: true,
          },
        },
      },
      orderBy: {
        timestamp: 'desc',
      },
    });

    if (format === 'csv') {
      const csvHeaders = [
        'Timestamp',
        'Error Type',
        'Category',
        'Description',
        'Code Context',
        'Fix Applied',
        'Fix Duration (seconds)',
        'Help Level',
        'Assignment',
        'Session Activity',
      ];

      const csvRows = errors.map((error) => [
        new Date(error.timestamp).toISOString(),
        error.errorType,
        error.category || '',
        `"${(error.description || '').replace(/"/g, '""')}"`,
        `"${(error.codeContext || '').replace(/"/g, '""')}"`,
        `"${(error.fixApplied || '').replace(/"/g, '""')}"`,
        error.fixDuration?.toString() || '',
        error.helpLevel || '',
        error.assignment ? `${error.assignment.title} (${error.assignment.course})` : '',
        error.session?.activityType || '',
      ]);

      const csv = [
        csvHeaders.join(','),
        ...csvRows.map((row) => row.join(',')),
      ].join('\n');

      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="errors-export-${Date.now()}.csv"`,
        },
      });
    }

    const jsonData = errors.map((error) => ({
      timestamp: error.timestamp,
      errorType: error.errorType,
      category: error.category,
      description: error.description,
      codeContext: error.codeContext,
      fixApplied: error.fixApplied,
      fixDuration: error.fixDuration,
      helpLevel: error.helpLevel,
      assignment: error.assignment ? {
        title: error.assignment.title,
        course: error.assignment.course,
      } : null,
      session: error.session ? {
        activityType: error.session.activityType,
        startTime: error.session.startTime,
      } : null,
    }));

    return new NextResponse(JSON.stringify(jsonData, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="errors-export-${Date.now()}.json"`,
      },
    });
  } catch (error) {
    console.error('Error exporting errors:', error);
    return NextResponse.json({ error: 'Failed to export errors' }, { status: 500 });
  }
}
