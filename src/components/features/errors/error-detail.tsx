'use client';

import { useQuery } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { AlertTriangle, Clock, Code2, FileText, Trash2, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import { ErrorType, HelpLevel } from '@prisma/client';
import Link from 'next/link';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface ErrorDetailProps {
  errorId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate?: () => void;
}

interface ErrorData {
  id: string;
  errorType: ErrorType;
  category: string;
  description: string;
  codeContext: string | null;
  fixApplied: string | null;
  fixDuration: number | null;
  helpLevel: HelpLevel | null;
  timestamp: string;
  session: {
    id: string;
    activityType: string;
    startTime: string;
  } | null;
  assignment: {
    id: string;
    title: string;
    course: string;
  } | null;
}

export function ErrorDetail({ errorId, open, onOpenChange, onUpdate }: ErrorDetailProps) {
  const { data: error, isLoading } = useQuery<ErrorData>({
    queryKey: ['error', errorId],
    queryFn: async () => {
      const res = await fetch(`/api/errors/${errorId}`);
      if (!res.ok) throw new Error('Failed to fetch error');
      return res.json();
    },
    enabled: !!errorId,
  });

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/errors/${errorId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete error');

      toast.success('Error deleted successfully');
      onOpenChange(false);
      onUpdate?.();
    } catch (error) {
      console.error('Error deleting error:', error);
      toast.error('Failed to delete error');
    }
  };

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

  const getHelpLevelBadge = (level: HelpLevel | null) => {
    if (!level) return null;
    const colors = {
      [HelpLevel.NONE]: 'bg-green-100 text-green-800',
      [HelpLevel.HINT]: 'bg-blue-100 text-blue-800',
      [HelpLevel.EXPLANATION]: 'bg-yellow-100 text-yellow-800',
      [HelpLevel.SOLUTION]: 'bg-red-100 text-red-800',
    };
    return <Badge className={colors[level]}>{level}</Badge>;
  };

  if (isLoading || !error) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <p className="text-center text-muted-foreground py-8">Loading error details...</p>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Error Details
            </DialogTitle>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Error</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete this error? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge className={getErrorTypeColor(error.errorType)}>{error.errorType}</Badge>
            <Badge variant="outline">{error.category}</Badge>
            {getHelpLevelBadge(error.helpLevel)}
            {error.fixApplied && (
              <Badge className="bg-green-100 text-green-800">Fixed</Badge>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>{format(new Date(error.timestamp), 'PPpp')}</span>
            </div>
            {error.fixDuration && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>Fixed in {Math.floor(error.fixDuration / 60)} minutes</span>
              </div>
            )}
          </div>

          <Separator />

          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Description
              </h3>
              <p className="text-sm whitespace-pre-wrap">{error.description}</p>
            </div>

            {error.codeContext && (
              <div>
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <Code2 className="h-4 w-4" />
                  Code Context
                </h3>
                <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                  <code>{error.codeContext}</code>
                </pre>
              </div>
            )}

            {error.fixApplied && (
              <div>
                <h3 className="font-semibold mb-2 text-green-700">Fix Applied</h3>
                <p className="text-sm whitespace-pre-wrap bg-green-50 p-3 rounded-lg">
                  {error.fixApplied}
                </p>
              </div>
            )}
          </div>

          <Separator />

          <div className="space-y-2">
            {error.assignment && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Assignment:</span>
                <Link href={`/assignments/${error.assignment.id}`}>
                  <Button variant="link" size="sm" className="h-auto p-0">
                    {error.assignment.title}
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </Button>
                </Link>
              </div>
            )}
            {error.session && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Session:</span>
                <span className="text-sm">
                  {error.session.activityType} - {format(new Date(error.session.startTime), 'PPp')}
                </span>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
