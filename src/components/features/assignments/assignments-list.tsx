'use client';

import { useState, useMemo } from 'react';
import { AssignmentCard } from './assignment-card';
import { AssignmentFilters } from './assignment-filters';
import { Button } from '@/components/ui/button';
import { LayoutGrid, List } from 'lucide-react';
import { Assignment } from '@prisma/client';

interface FilterState {
  search: string;
  status: string;
  course: string;
  sortBy: string;
}

interface AssignmentsListProps {
  assignments: Assignment[];
}

export function AssignmentsList({ assignments }: AssignmentsListProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    status: 'all',
    course: 'all',
    sortBy: 'dueDate',
  });

  const courses = useMemo(() => {
    const uniqueCourses = new Set(assignments.map((a) => a.course));
    return Array.from(uniqueCourses).sort();
  }, [assignments]);

  const filteredAndSortedAssignments = useMemo(() => {
    let filtered = [...assignments];

    // Apply search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        (a) =>
          a.title.toLowerCase().includes(searchLower) ||
          a.course.toLowerCase().includes(searchLower) ||
          a.description?.toLowerCase().includes(searchLower)
      );
    }

    // Apply status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter((a) => a.status === filters.status);
    }

    // Apply course filter
    if (filters.course !== 'all') {
      filtered = filtered.filter((a) => a.course === filters.course);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case 'dueDate':
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        case 'priority':
          return b.priority - a.priority;
        case 'createdAt':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'title':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

    return filtered;
  }, [assignments, filters]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {filteredAndSortedAssignments.length} of {assignments.length} assignments
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="icon"
            onClick={() => setViewMode('grid')}
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="icon"
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <AssignmentFilters filters={filters} onFilterChange={setFilters} courses={courses} />

      <div
        className={
          viewMode === 'grid'
            ? 'grid gap-4 md:grid-cols-2 lg:grid-cols-3'
            : 'flex flex-col gap-4'
        }
      >
        {filteredAndSortedAssignments.map((assignment) => (
          <AssignmentCard key={assignment.id} assignment={assignment} />
        ))}
      </div>

      {filteredAndSortedAssignments.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No assignments match your filters</p>
        </div>
      )}
    </div>
  );
}
