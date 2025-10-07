'use client';

import { useState, useMemo } from 'react';
import { MaterialCard } from './material-card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { StudyMaterial, MaterialType } from '@prisma/client';

interface MaterialsListProps {
  materials: (StudyMaterial & { assignment?: { title: string; id: string } | null })[];
}

export function MaterialsList({ materials }: MaterialsListProps) {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [assignmentFilter, setAssignmentFilter] = useState<string>('all');

  const assignments = useMemo(() => {
    const uniqueAssignments = new Map();
    materials.forEach((m) => {
      if (m.assignment) {
        uniqueAssignments.set(m.assignment.id, m.assignment);
      }
    });
    return Array.from(uniqueAssignments.values());
  }, [materials]);

  const filteredMaterials = useMemo(() => {
    return materials.filter((material) => {
      const matchesSearch =
        search === '' ||
        material.title.toLowerCase().includes(search.toLowerCase()) ||
        material.content?.toLowerCase().includes(search.toLowerCase());

      const matchesType = typeFilter === 'all' || material.type === typeFilter;

      const matchesAssignment =
        assignmentFilter === 'all' ||
        (assignmentFilter === 'unlinked' && !material.assignmentId) ||
        material.assignmentId === assignmentFilter;

      return matchesSearch && matchesType && matchesAssignment;
    });
  }, [materials, search, typeFilter, assignmentFilter]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="search">Search</Label>
          <Input
            id="search"
            placeholder="Search materials..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="type">Type</Label>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger id="type">
              <SelectValue placeholder="All types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value={MaterialType.PDF}>PDF</SelectItem>
              <SelectItem value={MaterialType.IMAGE}>Image</SelectItem>
              <SelectItem value={MaterialType.TEXT}>Text</SelectItem>
              <SelectItem value={MaterialType.LINK}>Link</SelectItem>
              <SelectItem value={MaterialType.OTHER}>Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="assignment">Assignment</Label>
          <Select value={assignmentFilter} onValueChange={setAssignmentFilter}>
            <SelectTrigger id="assignment">
              <SelectValue placeholder="All assignments" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Assignments</SelectItem>
              <SelectItem value="unlinked">Unlinked</SelectItem>
              {assignments.map((assignment) => (
                <SelectItem key={assignment.id} value={assignment.id}>
                  {assignment.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {filteredMaterials.length} of {materials.length} materials
        </p>
      </div>

      {filteredMaterials.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No materials match your filters</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredMaterials.map((material) => (
            <MaterialCard key={material.id} material={material} />
          ))}
        </div>
      )}
    </div>
  );
}
