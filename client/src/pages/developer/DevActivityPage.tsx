import React from 'react';
import { ActivityFeedPanel } from '../../components/shared/ActivityFeedPanel.js';

export const DevActivityPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-extrabold tracking-tight text-foreground sm:text-2xl">
          My Activity Stream
        </h1>
        <p className="text-xs text-muted-foreground">
          Historical log of status transitions and assignments for your tasks.
        </p>
      </div>

      <ActivityFeedPanel maxHeight="max-h-[750px]" />
    </div>
  );
};
