'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { ErrorType } from '@prisma/client';
import { AlertTriangle, Search } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ErrorDetail } from './error-detail';

interface Error {
  id: string;
  errorType: ErrorType;
  category: string;
  description: string;
  timestamp: string;
  fixApplied: string | null;
  helpLevel: string | null;
  session: {
    id: string;
    activityType: string;
  } | null;
  assignment: {
    id: string;
    title: string;
    course: string;
  } | null;
}

interface ErrorListProps {
  limit?: number;
  assignmentId?: string;
}

export function ErrorList({ limit, assignmentId }: ErrorListProps) {
  const [selectedErrorId, setSelectedErrorId] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = limit || 10;

  const { data, isLoading, refetch } = useQuery<{ errors: Error[]; total: number }>({
    queryKey: ['errors', page, pageSize, filterType, assignmentId, searchQuery],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pageSize.toString(),
        ...(filterType !== 'all' && { errorType: filterType }),
        ...(assignmentId && { assignmentId }),
        ...(searchQuery && { search: searchQuery }),
      });
      const res = await fetch(`/api/errors?${params}`);
      if (!res.ok) throw new Error('Failed to fetch errors');
      return res.json();
    },
  });

  const errors = data?.errors || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / pageSize);

  const getErrorTypeColor = (type: ErrorType): string => {
    const colors = {
      [ErrorType.SYNTAX]: 'bg-red-500',
      [ErrorType.LOGIC]: 'bg-orange-500',
      [ErrorType.STYLE]: 'bg-yellow-500',
      [ErrorType.TEST]: 'bg-blue-500',
      [ErrorType.RUNTIME]: 'bg-purple-500',
      [ErrorType.OTHER]: 'bg-gray-500',
    };
    return colors[type] || 'bg-gray-500';
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">Loading errors...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="w-full">
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Error Log
            </CardTitle>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-initial">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search errors..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 w-full sm:w-64"
                />
              </div>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-full sm:w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value={ErrorType.SYNTAX}>Syntax</SelectItem>
                  <SelectItem value={ErrorType.LOGIC}>Logic</SelectItem>
                  <SelectItem value={ErrorType.STYLE}>Style</SelectItem>
                  <SelectItem value={ErrorType.TEST}>Test</SelectItem>
                  <SelectItem value={ErrorType.RUNTIME}>Runtime</SelectItem>
                  <SelectItem value={ErrorType.OTHER}>Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {errors.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No errors found</p>
          ) : (
            <>
              <div className="space-y-3">
                {errors.map((error) => (
                  <div
                    key={error.id}
                    className="border rounded-lg p-4 space-y-2 cursor-pointer hover:bg-accent transition-colors"
                    onClick={() => setSelectedErrorId(error.id)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge className={getErrorTypeColor(error.errorType)}>
                            {error.errorType}
                          </Badge>
                          <span className="text-sm font-medium">{error.category}</span>
                          {error.fixApplied && (
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                              Fixed
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {error.description}
                        </p>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                          <span>{formatDistanceToNow(new Date(error.timestamp), { addSuffix: true })}</span>
                          {error.assignment && (
                            <span>
                              {error.assignment.title}
                            </span>
                          )}
                          {error.session && (
                            <span>
                              {error.session.activityType}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
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

      {selectedErrorId && (
        <ErrorDetail
          errorId={selectedErrorId}
          open={!!selectedErrorId}
          onOpenChange={(open) => !open && setSelectedErrorId(null)}
          onUpdate={refetch}
        />
      )}
    </>
  );
}
