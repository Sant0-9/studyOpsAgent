'use client';

import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Brain, TrendingUp, Target, Award } from 'lucide-react';

interface MasteryStats {
  totalConcepts: number;
  masteredCount: number;
  learningCount: number;
  newCount: number;
  averageMastery: number;
  reviewDueCount: number;
  categoryBreakdown: Array<{ category: string; count: number; avgMastery: number }>;
  masteryDistribution: Array<{ range: string; count: number }>;
}

const MASTERY_COLORS = ['#ef4444', '#f97316', '#eab308', '#84cc16', '#22c55e'];

export function MasteryDashboard() {
  const { data: stats, isLoading } = useQuery<MasteryStats>({
    queryKey: ['mastery-stats'],
    queryFn: async () => {
      const res = await fetch('/api/concepts/stats');
      if (!res.ok) throw new Error('Failed to fetch mastery stats');
      return res.json();
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">Loading mastery statistics...</p>
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

  const overallMastery = Math.round(stats.averageMastery * 100);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Concepts</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalConcepts}</div>
            <p className="text-xs text-muted-foreground">Tracked concepts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall Mastery</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallMastery}%</div>
            <p className="text-xs text-muted-foreground">Average mastery level</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mastered</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.masteredCount}</div>
            <p className="text-xs text-muted-foreground">80%+ mastery</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Need Review</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.reviewDueCount}</div>
            <p className="text-xs text-muted-foreground">Due for review</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Mastery Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={stats.masteryDistribution}
                  dataKey="count"
                  nameKey="range"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={(entry) => `${entry.range}: ${entry.count}`}
                >
                  {stats.masteryDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={MASTERY_COLORS[index % MASTERY_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Mastery by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.categoryBreakdown}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="category"
                  angle={-45}
                  textAnchor="end"
                  height={100}
                  interval={0}
                />
                <YAxis domain={[0, 100]} />
                <Tooltip formatter={(value: number) => `${Math.round(value * 100)}%`} />
                <Legend />
                <Bar dataKey="avgMastery" fill="#8b5cf6" name="Avg Mastery" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Learning Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium">Mastered Concepts</p>
                <p className="text-xs text-muted-foreground">80% or higher mastery</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-green-600">{stats.masteredCount}</p>
                <p className="text-xs text-muted-foreground">
                  {stats.totalConcepts > 0
                    ? Math.round((stats.masteredCount / stats.totalConcepts) * 100)
                    : 0}
                  % of total
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium">Learning in Progress</p>
                <p className="text-xs text-muted-foreground">30-80% mastery</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-yellow-600">{stats.learningCount}</p>
                <p className="text-xs text-muted-foreground">
                  {stats.totalConcepts > 0
                    ? Math.round((stats.learningCount / stats.totalConcepts) * 100)
                    : 0}
                  % of total
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium">New Concepts</p>
                <p className="text-xs text-muted-foreground">Below 30% mastery</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-red-600">{stats.newCount}</p>
                <p className="text-xs text-muted-foreground">
                  {stats.totalConcepts > 0
                    ? Math.round((stats.newCount / stats.totalConcepts) * 100)
                    : 0}
                  % of total
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
