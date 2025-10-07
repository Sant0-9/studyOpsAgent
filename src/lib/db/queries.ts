import { prisma } from './prisma'

// Assignment queries
export async function getUpcomingAssignments(limit = 5) {
  return prisma.assignment.findMany({
    where: {
      status: {
        in: ['PENDING', 'IN_PROGRESS'],
      },
      dueDate: {
        gte: new Date(),
      },
    },
    orderBy: {
      dueDate: 'asc',
    },
    take: limit,
  })
}

export async function getOverdueAssignments() {
  return prisma.assignment.findMany({
    where: {
      status: {
        not: 'COMPLETED',
      },
      dueDate: {
        lt: new Date(),
      },
    },
    orderBy: {
      dueDate: 'asc',
    },
  })
}

export async function getAssignmentWithDetails(id: string) {
  return prisma.assignment.findUnique({
    where: { id },
    include: {
      studyMaterials: true,
      workSessions: {
        orderBy: { startTime: 'desc' },
      },
      errors: {
        orderBy: { timestamp: 'desc' },
      },
    },
  })
}

// Study session queries
export async function getActiveSession() {
  return prisma.workSession.findFirst({
    where: {
      endTime: null,
    },
    orderBy: {
      startTime: 'desc',
    },
    include: {
      assignment: true,
    },
  })
}

export async function getSessionsByDateRange(startDate: Date, endDate: Date) {
  return prisma.workSession.findMany({
    where: {
      startTime: {
        gte: startDate,
        lte: endDate,
      },
    },
    orderBy: {
      startTime: 'desc',
    },
    include: {
      assignment: {
        select: {
          title: true,
          course: true,
        },
      },
    },
  })
}

export async function getTotalStudyTimeByPeriod(startDate: Date, endDate: Date) {
  const sessions = await prisma.workSession.findMany({
    where: {
      startTime: {
        gte: startDate,
        lte: endDate,
      },
      duration: {
        not: null,
      },
    },
    select: {
      duration: true,
      activityType: true,
    },
  })

  const totalMinutes = sessions.reduce((sum, session) => sum + (session.duration || 0), 0)
  const byActivityType = sessions.reduce((acc, session) => {
    const type = session.activityType
    acc[type] = (acc[type] || 0) + (session.duration || 0)
    return acc
  }, {} as Record<string, number>)

  return {
    totalMinutes,
    totalHours: totalMinutes / 60,
    byActivityType,
  }
}

// Error queries
export async function getRecentErrors(limit = 10) {
  return prisma.error.findMany({
    orderBy: {
      timestamp: 'desc',
    },
    take: limit,
    include: {
      assignment: {
        select: {
          title: true,
          course: true,
        },
      },
    },
  })
}

export async function getErrorsByType() {
  const errors = await prisma.error.findMany({
    select: {
      errorType: true,
      fixDuration: true,
    },
  })

  return errors.reduce((acc, error) => {
    const type = error.errorType
    if (!acc[type]) {
      acc[type] = { count: 0, totalFixTime: 0 }
    }
    acc[type].count++
    if (error.fixDuration) {
      acc[type].totalFixTime += error.fixDuration
    }
    return acc
  }, {} as Record<string, { count: number; totalFixTime: number }>)
}

// Concept queries
export async function getConceptsByCategory() {
  return prisma.concept.groupBy({
    by: ['category'],
    _count: {
      id: true,
    },
    _avg: {
      masteryLevel: true,
    },
  })
}

export async function getWeakConcepts(threshold = 0.5) {
  return prisma.concept.findMany({
    where: {
      masteryLevel: {
        lt: threshold,
      },
    },
    orderBy: {
      masteryLevel: 'asc',
    },
  })
}

// Dashboard queries
export async function getDashboardStats() {
  const [
    totalAssignments,
    completedAssignments,
    overdueAssignments,
    upcomingAssignments,
    totalStudyHours,
    totalErrors,
    conceptsNeedingReview,
  ] = await Promise.all([
    prisma.assignment.count(),
    prisma.assignment.count({ where: { status: 'COMPLETED' } }),
    prisma.assignment.count({
      where: {
        status: { not: 'COMPLETED' },
        dueDate: { lt: new Date() },
      },
    }),
    prisma.assignment.count({
      where: {
        status: { in: ['PENDING', 'IN_PROGRESS'] },
        dueDate: { gte: new Date() },
      },
    }),
    prisma.workSession.aggregate({
      _sum: { duration: true },
    }),
    prisma.error.count(),
    prisma.concept.count({ where: { needsReview: true } }),
  ])

  return {
    assignments: {
      total: totalAssignments,
      completed: completedAssignments,
      overdue: overdueAssignments,
      upcoming: upcomingAssignments,
    },
    study: {
      totalHours: (totalStudyHours._sum.duration || 0) / 60,
    },
    errors: {
      total: totalErrors,
    },
    concepts: {
      needingReview: conceptsNeedingReview,
    },
  }
}
