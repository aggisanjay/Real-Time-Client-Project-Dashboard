import React from 'react';
import { ActivityFeedPanel } from '../../components/shared/ActivityFeedPanel.js';

export const PMActivityPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-extrabold tracking-tight text-foreground sm:text-2xl">
          Team Activity Stream
        </h1>
        <p className="text-xs text-muted-foreground">
          Live stream of updates, task transitions, and completions from your managed projects.
        </p>
      </div>

      <ActivityFeedPanel maxHeight="max-h-[750px]" />
    </div>
  );
};
