import { AppLayout } from '@/components/layout/app-layout'
import { StatsCard } from '@/components/features/dashboard/stats-card'
import { getDashboardStats } from '@/lib/db/queries'
import { BookOpen, Clock, Bug, Brain } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default async function DashboardPage() {
  const stats = await getDashboardStats()

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">
            Your study overview and recent activity
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Total Assignments"
            value={stats.assignments.total}
            description={`${stats.assignments.completed} completed`}
            icon={BookOpen}
          />
          <StatsCard
            title="Study Hours"
            value={stats.study.totalHours.toFixed(1)}
            description="Total hours logged"
            icon={Clock}
          />
          <StatsCard
            title="Errors Logged"
            value={stats.errors.total}
            description="Track and learn from mistakes"
            icon={Bug}
          />
          <StatsCard
            title="Concepts to Review"
            value={stats.concepts.needingReview}
            description="Concepts needing attention"
            icon={Brain}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Upcoming Assignments</CardTitle>
              <CardDescription>
                {stats.assignments.upcoming} assignments due soon
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                No upcoming assignments to display. Add your first assignment to get started!
              </div>
            </CardContent>
          </Card>

          <Card className="col-span-3">
            <CardHeader>
              <CardTitle>Quick Stats</CardTitle>
              <CardDescription>At a glance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Overdue</span>
                <span className="text-sm font-bold text-red-600">
                  {stats.assignments.overdue}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">In Progress</span>
                <span className="text-sm font-bold text-yellow-600">
                  {stats.assignments.upcoming}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Completed</span>
                <span className="text-sm font-bold text-green-600">
                  {stats.assignments.completed}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  )
}
