'use client';

import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Clock, TrendingUp, Activity, Target } from 'lucide-react';

interface SessionStats {
  totalWeekMinutes: number;
  totalMonthMinutes: number;
  averageSessionMinutes: number;
  activityBreakdown: Array<{ activity: string; minutes: number }>;
  focusTrend: Array<{ date: string; averageFocus: number }>;
  productiveHours: Array<{ hour: number; sessions: number }>;
}

const ACTIVITY_COLORS: Record<string, string> = {
  CODING: '#3b82f6',
  WRITING: '#a855f7',
  READING: '#22c55e',
  RESEARCH: '#eab308',
  PRACTICE: '#f97316',
  REVIEW: '#ec4899',
};

export function SessionStats() {
  const { data: stats, isLoading } = useQuery<SessionStats>({
    queryKey: ['session-stats'],
    queryFn: async () => {
      const res = await fetch('/api/sessions/stats');
      if (!res.ok) throw new Error('Failed to fetch session stats');
      return res.json();
    },
  });

  const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">Loading statistics...</p>
        </CardContent>
      </Card>
    );
  }

  if (!stats) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">No data available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatTime(stats.totalWeekMinutes)}</div>
            <p className="text-xs text-muted-foreground">Total study time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatTime(stats.totalMonthMinutes)}</div>
            <p className="text-xs text-muted-foreground">Total study time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Session</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatTime(stats.averageSessionMinutes)}</div>
            <p className="text-xs text-muted-foreground">Per session</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Activity Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={stats.activityBreakdown}
                  dataKey="minutes"
                  nameKey="activity"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={(entry) => `${entry.activity}: ${formatTime(entry.minutes)}`}
                >
                  {stats.activityBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={ACTIVITY_COLORS[entry.activity] || '#6b7280'} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => formatTime(value)} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Productive Hours</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.productiveHours}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="hour"
                  tickFormatter={(hour) => `${hour}:00`}
                />
                <YAxis />
                <Tooltip
                  labelFormatter={(hour) => `${hour}:00 - ${hour + 1}:00`}
                  formatter={(value: number) => [`${value} sessions`, 'Sessions']}
                />
                <Bar dataKey="sessions" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {stats.focusTrend.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Focus Score Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={stats.focusTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="averageFocus"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  name="Average Focus"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
