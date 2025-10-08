'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Brain, Calendar, TrendingUp } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ConceptCardProps {
  concept: {
    id: string;
    name: string;
    category: string;
    masteryLevel: number;
    lastUsed: Date;
    timesEncountered: number;
    timesSucceeded: number;
    timesFailed: number;
    needsReview: boolean;
    nextReviewDate: Date | null;
  };
  onClick?: () => void;
  onReview?: () => void;
}

export function ConceptCard({ concept, onClick, onReview }: ConceptCardProps) {
  const masteryPercentage = Math.round(concept.masteryLevel * 100);
  const successRate =
    concept.timesEncountered > 0
      ? Math.round((concept.timesSucceeded / concept.timesEncountered) * 100)
      : 0;

  const getMasteryColor = (level: number): string => {
    if (level >= 0.8) return 'text-green-600';
    if (level >= 0.5) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getMasteryBadgeColor = (level: number): string => {
    if (level >= 0.8) return 'bg-green-100 text-green-800 border-green-200';
    if (level >= 0.5) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-red-100 text-red-800 border-red-200';
  };

  return (
    <Card
      className="cursor-pointer hover:shadow-lg transition-all duration-200"
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg flex items-center gap-2">
              <Brain className="h-4 w-4 text-purple-600" />
              {concept.name}
            </CardTitle>
            <Badge variant="outline" className="mt-2">
              {concept.category}
            </Badge>
          </div>
          {concept.needsReview && (
            <Badge className="bg-orange-100 text-orange-800 border-orange-200">
              Review Due
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Mastery Level</span>
            <span className={`font-bold ${getMasteryColor(concept.masteryLevel)}`}>
              {masteryPercentage}%
            </span>
          </div>
          <Progress value={masteryPercentage} className="h-2" />
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Success Rate</p>
            <p className="font-semibold">{successRate}%</p>
          </div>
          <div>
            <p className="text-muted-foreground">Practice Count</p>
            <p className="font-semibold">{concept.timesEncountered}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Calendar className="h-3 w-3" />
          <span>
            Last used {formatDistanceToNow(new Date(concept.lastUsed), { addSuffix: true })}
          </span>
        </div>

        {concept.nextReviewDate && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <TrendingUp className="h-3 w-3" />
            <span>
              Next review{' '}
              {formatDistanceToNow(new Date(concept.nextReviewDate), { addSuffix: true })}
            </span>
          </div>
        )}

        {onReview && concept.needsReview && (
          <Button
            size="sm"
            variant="outline"
            className="w-full"
            onClick={(e) => {
              e.stopPropagation();
              onReview();
            }}
          >
            Review Now
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
