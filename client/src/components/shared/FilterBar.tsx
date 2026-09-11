import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, RotateCcw, AlertCircle } from 'lucide-react';
import { Button } from '../ui/button.js';
import { Badge } from '../ui/badge.js';

export const FilterBar: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const currentStatus = searchParams.get('status') || '';
  const currentPriority = searchParams.get('priority') || '';
  const isOverdue = searchParams.get('isOverdue') === 'true';

  const updateParam = (key: string, value: string | null) => {
    const next = new URLSearchParams(searchParams);
    if (!value) {
      next.delete(key);
    } else {
      next.set(key, value);
    }
    setSearchParams(next);
  };

  const clearAllFilters = () => {
    const next = new URLSearchParams();
    setSearchParams(next);
  };

  const hasActiveFilters = currentStatus || currentPriority || isOverdue;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card p-3 shadow-sm">
      <div className="flex flex-wrap items-center gap-2.5">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
          <Filter className="h-3.5 w-3.5 text-primary" /> Filters:
        </div>

        {/* Status Filter */}
        <select
          value={currentStatus}
          onChange={(e) => updateParam('status', e.target.value || null)}
          className="rounded-lg border border-border bg-card px-2.5 py-1 text-xs text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        >
          <option value="">All Statuses</option>
          <option value="TODO">To Do</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="IN_REVIEW">In Review</option>
          <option value="DONE">Done</option>
        </select>

        {/* Priority Filter */}
        <select
          value={currentPriority}
          onChange={(e) => updateParam('priority', e.target.value || null)}
          className="rounded-lg border border-border bg-card px-2.5 py-1 text-xs text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        >
          <option value="">All Priorities</option>
          <option value="URGENT">Urgent</option>
          <option value="HIGH">High</option>
          <option value="MEDIUM">Medium</option>
          <option value="LOW">Low</option>
        </select>

        {/* Overdue Quick Toggle */}
        <Button
          variant={isOverdue ? 'destructive' : 'outline'}
          size="sm"
          onClick={() => updateParam('isOverdue', isOverdue ? null : 'true')}
          className="h-7 text-xs gap-1.5"
        >
          <AlertCircle className="h-3 w-3" />
          Overdue Only
        </Button>
      </div>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={clearAllFilters}
          className="h-7 text-xs text-muted-foreground hover:text-destructive gap-1"
        >
          <RotateCcw className="h-3 w-3" /> Reset
        </Button>
      )}
    </div>
  );
};
