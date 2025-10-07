'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ActivityType } from '@prisma/client';
import { Clock, ChevronDown, ChevronUp, Filter } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface WorkSession {
  id: string;
  startTime: string;
  endTime: string | null;
  duration: number | null;
  activityType: ActivityType;
  focusScore: number | null;
  notes: string | null;
  assignment: {
    id: string;
    title: string;
    course: string;
  } | null;
}

interface SessionHistoryProps {
  limit?: number;
}

export function SessionHistory({ limit }: SessionHistoryProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filterActivity, setFilterActivity] = useState<string>('all');
  const [page, setPage] = useState(1);
  const pageSize = limit || 10;

  const { data, isLoading } = useQuery<{ sessions: WorkSession[]; total: number }>({
    queryKey: ['sessions', page, pageSize, filterActivity],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pageSize.toString(),
        ...(filterActivity !== 'all' && { activityType: filterActivity }),
      });
      const res = await fetch(`/api/sessions?${params}`);
      if (!res.ok) throw new Error('Failed to fetch sessions');
      return res.json();
    },
  });

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const formatDuration = (minutes: number | null): string => {
    if (!minutes) return 'N/A';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const getActivityColor = (activity: ActivityType): string => {
    const colors = {
      [ActivityType.CODING]: 'bg-blue-500',
      [ActivityType.WRITING]: 'bg-purple-500',
      [ActivityType.READING]: 'bg-green-500',
      [ActivityType.RESEARCH]: 'bg-yellow-500',
      [ActivityType.PRACTICE]: 'bg-orange-500',
      [ActivityType.REVIEW]: 'bg-pink-500',
    };
    return colors[activity] || 'bg-gray-500';
  };

  const getFocusColor = (score: number): string => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">Loading session history...</p>
        </CardContent>
      </Card>
    );
  }

  const sessions = data?.sessions || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / pageSize);

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Session History
          </CardTitle>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={filterActivity} onValueChange={setFilterActivity}>
              <SelectTrigger className="w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Activities</SelectItem>
                <SelectItem value={ActivityType.CODING}>Coding</SelectItem>
                <SelectItem value={ActivityType.WRITING}>Writing</SelectItem>
                <SelectItem value={ActivityType.READING}>Reading</SelectItem>
                <SelectItem value={ActivityType.RESEARCH}>Research</SelectItem>
                <SelectItem value={ActivityType.PRACTICE}>Practice</SelectItem>
                <SelectItem value={ActivityType.REVIEW}>Review</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {sessions.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No sessions found</p>
        ) : (
          <>
            <div className="space-y-3">
              {sessions.map((session) => (
                <div key={session.id} className="border rounded-lg p-4 space-y-2">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge className={getActivityColor(session.activityType)}>
                          {session.activityType}
                        </Badge>
                        <span className="text-sm font-medium">
                          {formatDuration(session.duration)}
                        </span>
                        {session.focusScore && (
                          <span className={`text-sm font-medium ${getFocusColor(session.focusScore)}`}>
                            Focus: {session.focusScore}/100
                          </span>
                        )}
                      </div>
                      {session.assignment && (
                        <p className="text-sm text-muted-foreground">
                          {session.assignment.title} ({session.assignment.course})
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(session.startTime), { addSuffix: true })}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleExpand(session.id)}
                    >
                      {expandedId === session.id ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                  </div>

                  {expandedId === session.id && session.notes && (
                    <div className="mt-3 pt-3 border-t">
                      <p className="text-sm font-medium mb-1">Notes:</p>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {session.notes}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-4 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground">
                  Page {page} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
