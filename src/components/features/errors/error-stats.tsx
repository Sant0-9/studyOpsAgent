'use client';

import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { AlertTriangle, TrendingDown, Clock, Target } from 'lucide-react';

interface ErrorStats {
  totalErrors: number;
  errorsByType: Array<{ type: string; count: number }>;
  errorTrend: Array<{ date: string; count: number }>;
  commonCategories: Array<{ category: string; count: number }>;
  avgFixTime: number;
  fixedCount: number;
}

const ERROR_TYPE_COLORS: Record<string, string> = {
  SYNTAX: '#ef4444',
  LOGIC: '#f97316',
  STYLE: '#eab308',
  TEST: '#3b82f6',
  RUNTIME: '#a855f7',
  OTHER: '#6b7280',
};

export function ErrorStats() {
  const { data: stats, isLoading } = useQuery<ErrorStats>({
    queryKey: ['error-stats'],
    queryFn: async () => {
      const res = await fetch('/api/errors/stats');
      if (!res.ok) throw new Error('Failed to fetch error stats');
      return res.json();
    },
  });

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

  const resolutionRate = stats.totalErrors > 0
    ? Math.round((stats.fixedCount / stats.totalErrors) * 100)
    : 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Errors</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalErrors}</div>
            <p className="text-xs text-muted-foreground">Logged errors</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolved</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.fixedCount}</div>
            <p className="text-xs text-muted-foreground">{resolutionRate}% resolution rate</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Fix Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(stats.avgFixTime / 60)}m</div>
            <p className="text-xs text-muted-foreground">Per error</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Improvement</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.errorTrend.length > 7 && stats.errorTrend[stats.errorTrend.length - 1].count < stats.errorTrend[0].count ? '↓' : '→'}
            </div>
            <p className="text-xs text-muted-foreground">Recent trend</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Errors by Type</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={stats.errorsByType}
                  dataKey="count"
                  nameKey="type"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={(entry) => `${entry.type}: ${entry.count}`}
                >
                  {stats.errorsByType.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={ERROR_TYPE_COLORS[entry.type] || '#6b7280'} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Common Error Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.commonCategories.slice(0, 8)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="category"
                  angle={-45}
                  textAnchor="end"
                  height={100}
                  interval={0}
                />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {stats.errorTrend.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Error Trend Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={stats.errorTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#ef4444"
                  strokeWidth={2}
                  name="Errors"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
