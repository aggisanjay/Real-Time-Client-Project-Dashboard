import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShowcaseTab } from '../../config/showcaseConfig.js';
import {
  Activity,
  CheckCircle2,
  Clock,
  Layers,
  Users,
  TrendingUp,
  FolderKanban,
  CheckSquare
} from 'lucide-react';

interface Props {
  tab: ShowcaseTab;
}

export const DashboardPreviewMockup: React.FC<Props> = ({ tab }) => {
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setImageError(false);
  }, [tab.id, tab.imagePath]);

  const hasImage = Boolean(tab.imagePath && !imageError);

  const getUrlPath = () => {
    switch (tab.id) {
      case 'overview':
        return 'app.agencyflow.com/admin/overview';
      case 'kanban':
        return 'app.agencyflow.com/admin/tasks';
      case 'activity':
        return 'app.agencyflow.com/admin/activity';
      case 'rbac':
        return 'app.agencyflow.com/admin/users';
      default:
        return 'app.agencyflow.com/dashboard';
    }
  };

  return (
    <div className="relative mx-auto w-full max-w-5xl rounded-2xl border border-border/80 bg-card shadow-2xl overflow-hidden transition-all duration-300">
      {/* Subtle Ambient Glow */}
      <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-primary/10 blur-3xl -z-10 pointer-events-none" />

      {/* Mac OS Window Bar */}
      <div className="flex items-center justify-between border-b border-border/70 bg-muted/40 px-5 py-3">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-[#ff5f56]" />
          <div className="h-3 w-3 rounded-full bg-[#ffbd2e]" />
          <div className="h-3 w-3 rounded-full bg-[#27c93f]" />
        </div>

        {/* Minimal Address Pill */}
        <div className="flex items-center gap-2 rounded-full border border-border/60 bg-background px-4 py-1 text-xs text-muted-foreground shadow-xs">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-mono text-[11px] select-none text-foreground/80 font-medium">
            https://{getUrlPath()}
          </span>
        </div>

        {/* Status indicator */}
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Live Sync
          </span>
        </div>
      </div>

      {/* Viewport Canvas */}
      <div className="relative bg-background/95 overflow-hidden">
        <AnimatePresence mode="wait">
          {hasImage ? (
            <motion.div
              key={`img-${tab.id}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="relative w-full"
            >
              <img
                src={tab.imagePath}
                alt={tab.title}
                onError={() => setImageError(true)}
                className="w-full h-auto block select-none"
                loading="eager"
              />
            </motion.div>
          ) : (
            <motion.div
              key={`mock-${tab.id}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
              className="p-6 md:p-8 space-y-6"
            >
              {tab.id === 'overview' && <OverviewMockup />}
              {tab.id === 'kanban' && <KanbanMockup />}
              {tab.id === 'activity' && <ActivityMockup />}
              {tab.id === 'rbac' && <RbacMockup />}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

// --- Beautiful, Clean Overview Fallback ---
const OverviewMockup: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-xl border border-border/80 bg-card p-4 space-y-1 shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground text-xs">
            <span>Portfolio Revenue</span>
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold tracking-tight text-foreground">$142,500</div>
          <div className="text-[11px] text-emerald-500 font-medium">+14.2% from last month</div>
        </div>

        <div className="rounded-xl border border-border/80 bg-card p-4 space-y-1 shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground text-xs">
            <span>Active Projects</span>
            <FolderKanban className="h-4 w-4 text-primary" />
          </div>
          <div className="text-2xl font-bold tracking-tight text-foreground">12 Active</div>
          <div className="text-[11px] text-muted-foreground">94% on track</div>
        </div>

        <div className="rounded-xl border border-border/80 bg-card p-4 space-y-1 shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground text-xs">
            <span>Sprint Velocity</span>
            <CheckSquare className="h-4 w-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-bold tracking-tight text-foreground">94.8%</div>
          <div className="text-[11px] text-emerald-500 font-medium">128 of 135 tasks closed</div>
        </div>

        <div className="rounded-xl border border-border/80 bg-card p-4 space-y-1 shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground text-xs">
            <span>Team Presence</span>
            <Users className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            8 Online
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <div className="text-11px text-muted-foreground">Across 3 departments</div>
        </div>
      </div>
    </div>
  );
};

// --- Clean Kanban Fallback ---
const KanbanMockup: React.FC = () => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold text-foreground">Master Task Board</span>
        </div>
        <span className="text-xs text-muted-foreground font-medium">
          Powered by <code className="text-primary font-mono">@dnd-kit</code>
        </span>
      </div>
    </div>
  );
};

// --- Clean Activity Stream Fallback ---
const ActivityMockup: React.FC = () => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-border/60 pb-3">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-emerald-500 animate-pulse" />
          <span className="text-sm font-semibold text-foreground">Global Live Activity Stream</span>
        </div>
        <span className="text-xs text-muted-foreground font-mono">Stream: Active</span>
      </div>
    </div>
  );
};

// --- Clean RBAC Fallback ---
const RbacMockup: React.FC = () => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-border/60 pb-3">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold text-foreground">Team & Role-Based Access Control</span>
        </div>
        <span className="text-xs text-muted-foreground">3 Roles Configured</span>
      </div>
    </div>
  );
};
