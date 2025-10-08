'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ConceptForm } from '@/components/features/concepts/concept-form';
import { ConceptList } from '@/components/features/concepts/concept-list';
import { ConceptDetail } from '@/components/features/concepts/concept-detail';
import { MasteryDashboard } from '@/components/features/concepts/mastery-dashboard';
import { useQueryClient } from '@tanstack/react-query';

export default function ConceptsPage() {
  const [selectedConceptId, setSelectedConceptId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const handleConceptUpdate = () => {
    queryClient.invalidateQueries({ queryKey: ['concepts'] });
    queryClient.invalidateQueries({ queryKey: ['mastery-stats'] });
    queryClient.invalidateQueries({ queryKey: ['concept', selectedConceptId] });
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Concept Mastery</h1>
        <ConceptForm onSuccess={handleConceptUpdate} />
      </div>

      <Tabs defaultValue="list" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="list">Concept List</TabsTrigger>
          <TabsTrigger value="dashboard">Mastery Dashboard</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-6">
          <ConceptList
            onConceptClick={(id) => setSelectedConceptId(id)}
            onConceptReview={(id) => setSelectedConceptId(id)}
          />
        </TabsContent>

        <TabsContent value="dashboard" className="space-y-6">
          <MasteryDashboard />
        </TabsContent>
      </Tabs>

      {selectedConceptId && (
        <ConceptDetail
          conceptId={selectedConceptId}
          open={!!selectedConceptId}
          onOpenChange={(open) => !open && setSelectedConceptId(null)}
          onUpdate={handleConceptUpdate}
        />
      )}
    </div>
  );
}
