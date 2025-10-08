'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ConceptCard } from './concept-card';
import { Search, Filter } from 'lucide-react';

interface Concept {
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
}

interface ConceptListProps {
  onConceptClick?: (id: string) => void;
  onConceptReview?: (id: string) => void;
}

export function ConceptList({ onConceptClick, onConceptReview }: ConceptListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [masteryFilter, setMasteryFilter] = useState('all');

  const { data: concepts, isLoading } = useQuery<Concept[]>({
    queryKey: ['concepts', searchQuery, categoryFilter, masteryFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (categoryFilter !== 'all') params.append('category', categoryFilter);
      if (masteryFilter !== 'all') params.append('mastery', masteryFilter);

      const res = await fetch(`/api/concepts?${params}`);
      if (!res.ok) throw new Error('Failed to fetch concepts');
      return res.json();
    },
  });

  const categories = Array.from(new Set(concepts?.map((c) => c.category) || []));

  const filteredConcepts = concepts || [];

  const needsReviewCount = filteredConcepts.filter((c) => c.needsReview).length;
  const masteredCount = filteredConcepts.filter((c) => c.masteryLevel >= 0.8).length;
  const learningCount = filteredConcepts.filter(
    (c) => c.masteryLevel >= 0.3 && c.masteryLevel < 0.8
  ).length;
  const newCount = filteredConcepts.filter((c) => c.masteryLevel < 0.3).length;

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">Loading concepts...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search concepts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-40">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={masteryFilter} onValueChange={setMasteryFilter}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              <SelectItem value="mastered">Mastered (80%+)</SelectItem>
              <SelectItem value="learning">Learning (30-80%)</SelectItem>
              <SelectItem value="new">New (0-30%)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All ({filteredConcepts.length})</TabsTrigger>
          <TabsTrigger value="review">Review ({needsReviewCount})</TabsTrigger>
          <TabsTrigger value="mastered">Mastered ({masteredCount})</TabsTrigger>
          <TabsTrigger value="learning">Learning ({learningCount})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          {filteredConcepts.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <p className="text-muted-foreground">No concepts found. Add your first concept to get started!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredConcepts.map((concept) => (
                <ConceptCard
                  key={concept.id}
                  concept={concept}
                  onClick={() => onConceptClick?.(concept.id)}
                  onReview={() => onConceptReview?.(concept.id)}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="review" className="mt-6">
          {needsReviewCount === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <p className="text-muted-foreground">No concepts need review right now!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredConcepts
                .filter((c) => c.needsReview)
                .map((concept) => (
                  <ConceptCard
                    key={concept.id}
                    concept={concept}
                    onClick={() => onConceptClick?.(concept.id)}
                    onReview={() => onConceptReview?.(concept.id)}
                  />
                ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="mastered" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredConcepts
              .filter((c) => c.masteryLevel >= 0.8)
              .map((concept) => (
                <ConceptCard
                  key={concept.id}
                  concept={concept}
                  onClick={() => onConceptClick?.(concept.id)}
                />
              ))}
          </div>
        </TabsContent>

        <TabsContent value="learning" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredConcepts
              .filter((c) => c.masteryLevel >= 0.3 && c.masteryLevel < 0.8)
              .map((concept) => (
                <ConceptCard
                  key={concept.id}
                  concept={concept}
                  onClick={() => onConceptClick?.(concept.id)}
                  onReview={() => onConceptReview?.(concept.id)}
                />
              ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
