import React from 'react';
import { ActivityFeedPanel } from '../../components/shared/ActivityFeedPanel.js';

export const AdminActivityPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-extrabold tracking-tight text-foreground sm:text-2xl">
          Global Live Activity Stream
        </h1>
        <p className="text-xs text-muted-foreground">
          Real-time event ledger tracking all task movements across all projects and clients.
        </p>
      </div>

      <ActivityFeedPanel maxHeight="max-h-[750px]" />
    </div>
  );
};
