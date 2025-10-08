'use client';

import { useQuery } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Brain, Calendar, TrendingUp, Check, X, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface ConceptDetailProps {
  conceptId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate?: () => void;
}

interface ConceptData {
  id: string;
  name: string;
  category: string;
  description: string | null;
  masteryLevel: number;
  firstEncountered: Date;
  lastUsed: Date;
  timesEncountered: number;
  timesSucceeded: number;
  timesFailed: number;
  needsReview: boolean;
  nextReviewDate: Date | null;
  relatedConcepts: string[];
  prerequisites: string[];
}

export function ConceptDetail({ conceptId, open, onOpenChange, onUpdate }: ConceptDetailProps) {
  const { data: concept, isLoading } = useQuery<ConceptData>({
    queryKey: ['concept', conceptId],
    queryFn: async () => {
      const res = await fetch(`/api/concepts/${conceptId}`);
      if (!res.ok) throw new Error('Failed to fetch concept');
      return res.json();
    },
    enabled: !!conceptId && open,
  });

  const handlePractice = async (success: boolean) => {
    try {
      const response = await fetch(`/api/concepts/${conceptId}/practice`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ success }),
      });

      if (!response.ok) throw new Error('Failed to record practice');

      toast.success(success ? 'Great job!' : 'Keep practicing!');
      onUpdate?.();
    } catch (error) {
      console.error('Error recording practice:', error);
      toast.error('Failed to record practice');
    }
  };

  if (isLoading || !concept) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <p className="text-center text-muted-foreground py-8">Loading concept details...</p>
        </DialogContent>
      </Dialog>
    );
  }

  const masteryPercentage = Math.round(concept.masteryLevel * 100);
  const successRate =
    concept.timesEncountered > 0
      ? Math.round((concept.timesSucceeded / concept.timesEncountered) * 100)
      : 0;

  const getMasteryColor = (level: number): string => {
    if (level >= 0.8) return 'bg-green-500';
    if (level >= 0.5) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Brain className="h-6 w-6 text-purple-600" />
            {concept.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className="text-sm">
              {concept.category}
            </Badge>
            {concept.needsReview && (
              <Badge className="bg-orange-100 text-orange-800 border-orange-200">
                Review Due
              </Badge>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Mastery Level</span>
              <span className="text-2xl font-bold">{masteryPercentage}%</span>
            </div>
            <Progress value={masteryPercentage} className="h-3" />
          </div>

          <Separator />

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Success Rate</p>
              <p className="text-2xl font-bold text-green-600">{successRate}%</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Practice Count</p>
              <p className="text-2xl font-bold">{concept.timesEncountered}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Succeeded</p>
              <p className="text-2xl font-bold flex items-center gap-1">
                <Check className="h-5 w-5 text-green-600" />
                {concept.timesSucceeded}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Failed</p>
              <p className="text-2xl font-bold flex items-center gap-1">
                <X className="h-5 w-5 text-red-600" />
                {concept.timesFailed}
              </p>
            </div>
          </div>

          <Separator />

          {concept.description && (
            <div className="space-y-2">
              <h3 className="font-semibold flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Description
              </h3>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {concept.description}
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">First encountered:</span>
              <span className="font-medium">
                {format(new Date(concept.firstEncountered), 'PP')}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Last used:</span>
              <span className="font-medium">{format(new Date(concept.lastUsed), 'PP')}</span>
            </div>
          </div>

          {concept.nextReviewDate && (
            <div className="flex items-center gap-2 text-sm bg-blue-50 p-3 rounded-lg">
              <TrendingUp className="h-4 w-4 text-blue-600" />
              <span className="text-blue-800">
                Next review scheduled for:{' '}
                <span className="font-semibold">
                  {format(new Date(concept.nextReviewDate), 'PPP')}
                </span>
              </span>
            </div>
          )}

          <Separator />

          <div className="space-y-3">
            <h3 className="font-semibold">Quick Practice</h3>
            <p className="text-sm text-muted-foreground">
              Did you successfully apply or understand this concept recently?
            </p>
            <div className="flex gap-2">
              <Button
                className="flex-1 bg-green-600 hover:bg-green-700"
                onClick={() => handlePractice(true)}
              >
                <Check className="h-4 w-4 mr-2" />
                Yes, I Got It!
              </Button>
              <Button
                className="flex-1 bg-red-600 hover:bg-red-700"
                onClick={() => handlePractice(false)}
              >
                <X className="h-4 w-4 mr-2" />
                No, Need More Practice
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
