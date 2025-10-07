'use client';

import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingDown, TrendingUp, Minus } from 'lucide-react';

interface CommonMistake {
  category: string;
  count: number;
  errorType: string;
  recentCount: number;
  trend: 'up' | 'down' | 'stable';
}

export function CommonMistakes() {
  const { data: mistakes, isLoading } = useQuery<CommonMistake[]>({
    queryKey: ['common-mistakes'],
    queryFn: async () => {
      const res = await fetch('/api/errors/patterns');
      if (!res.ok) throw new Error('Failed to fetch common mistakes');
      return res.json();
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">Loading common mistakes...</p>
        </CardContent>
      </Card>
    );
  }

  if (!mistakes || mistakes.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Common Mistakes</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground">No errors logged yet</p>
        </CardContent>
      </Card>
    );
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-red-500" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-green-500" />;
      default:
        return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up':
        return 'text-red-600';
      case 'down':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Most Common Mistakes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {mistakes.map((mistake, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent transition-colors"
            >
              <div className="flex items-center gap-3 flex-1">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted text-sm font-semibold">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <p className="font-medium">{mistake.category}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Badge variant="outline" className="text-xs">
                      {mistake.errorType}
                    </Badge>
                    <span>{mistake.count} occurrences</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-sm font-medium ${getTrendColor(mistake.trend)}`}>
                  {mistake.recentCount} recent
                </span>
                {getTrendIcon(mistake.trend)}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 p-3 bg-blue-50 rounded-lg text-sm text-blue-800">
          <p className="font-semibold mb-1">Tips to improve:</p>
          <ul className="list-disc list-inside space-y-1 text-xs">
            <li>Review errors after each session</li>
            <li>Create notes for recurring mistakes</li>
            <li>Practice similar problems to build mastery</li>
            <li>Use debugging tools to prevent common errors</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
