// Centralized Showcase & Recruiter Configuration
// Live real screenshots attached and displayed seamlessly across the landing page.

export interface ShowcaseTab {
  id: string;
  title: string;
  badge: string;
  description: string;
  highlights: string[];
  imagePath?: string;
  roleContext: 'ADMIN' | 'PROJECT_MANAGER' | 'DEVELOPER';
}

export interface PersonaItem {
  role: 'ADMIN' | 'PROJECT_MANAGER' | 'DEVELOPER';
  name: string;
  email: string;
  tagline: string;
  badgeColor: string;
  description: string;
  route: string;
  features: string[];
}

export const SHOWCASE_TABS: ShowcaseTab[] = [
  {
    id: 'overview',
    title: 'Executive Operations Overview',
    badge: 'Executive View',
    description: 'Cross-client metrics, live status transitions, real-time team presence, and active projects summary.',
    highlights: [
      'Real-time financial & project health metrics',
      'Multi-tenant enterprise client distribution',
      'Active team presence via Socket.IO',
      'Integrated live activity ledger stream'
    ],
    imagePath: '/screenshots/overview.png',
    roleContext: 'ADMIN'
  },
  {
    id: 'kanban',
    title: 'Master Task Board',
    badge: 'Kanban Board',
    description: 'Full cross-project Kanban orchestration with live socket updates, status filtering, and priority tags.',
    highlights: [
      '4-column workflow: To Do, In Progress, In Review, Done',
      'Optimistic state updates powered by @dnd-kit',
      'Overdue indicators, priority badges, and avatars',
      'Instant cross-client socket broadcast on drag'
    ],
    imagePath: '/screenshots/kanban.png',
    roleContext: 'PROJECT_MANAGER'
  },
  {
    id: 'activity',
    title: 'Global Live Activity Stream',
    badge: 'Activity Stream',
    description: 'Real-time event ledger tracking all task movements, status changes, and sprint updates across all projects.',
    highlights: [
      'Chronological immutable audit log',
      'Instant Socket.IO status transitions',
      'User attribution with role badges',
      'Zero-refresh live synchronized feed'
    ],
    imagePath: '/screenshots/activity.png',
    roleContext: 'ADMIN'
  },
  {
    id: 'rbac',
    title: 'Team & Role-Based Access Control',
    badge: 'RBAC Management',
    description: 'Manage agency permissions with server-enforced role assignments, presence monitoring, and live session refresh.',
    highlights: [
      'Dynamic role promotion: Admin, PM, Developer',
      'Live user presence indicator (Online / Offline)',
      'Automated task workload distribution metrics',
      'Token invalidation & view refresh on role change'
    ],
    imagePath: '/screenshots/rbac.png',
    roleContext: 'ADMIN'
  }
];

export const DEMO_PERSONAS: PersonaItem[] = [
  {
    role: 'ADMIN',
    name: 'Administrator',
    email: 'admin@agency.com',
    tagline: 'Full System Control & Management',
    badgeColor: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
    description: 'Full administrative access across all projects, client contracts, team allocations, and system-wide activity logs.',
    route: '/admin',
    features: [
      'Global project creation & budget oversight',
      'User management & dynamic role upgrades',
      'Client relationship & company directory',
      'Complete un-redacted real-time audit log'
    ]
  },
  {
    role: 'PROJECT_MANAGER',
    name: 'Project Manager',
    email: 'sarah.pm@agency.com',
    tagline: 'Sprint Orchestration & Delivery',
    badgeColor: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    description: 'Sprint coordination center to orchestrate boards, allocate tasks to developers, and review delivered milestone items.',
    route: '/pm',
    features: [
      'Interactive Kanban board with drag-and-drop',
      'Team task assignment & deadline tracking',
      'Project milestone health indicators',
      'Live team collaboration stream'
    ]
  },
  {
    role: 'DEVELOPER',
    name: 'Developer',
    email: 'alex.dev@agency.com',
    tagline: 'Execution & Milestone Delivery',
    badgeColor: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    description: 'Focused developer workflow to view assigned tasks, update completion states, and communicate progress instantly.',
    route: '/dev',
    features: [
      'Filtered personal workbench & priority queue',
      'Task progression (Backlog to In Review)',
      'Direct detail inspection & acceptance criteria',
      'Instant socket notifications on assignments'
    ]
  }
];

export const TECH_STACK = [
  {
    category: 'Frontend Core',
    items: ['React 19', 'TypeScript', 'Vite', 'Tailwind CSS v4']
  },
  {
    category: 'Interaction & UX',
    items: ['Framer Motion', '@dnd-kit Drag-and-Drop', 'Lucide Icons', 'Radix UI']
  },
  {
    category: 'Real-Time & State',
    items: ['Socket.IO Client', 'Optimistic UI', 'Context API', 'EventEmitters']
  },
  {
    category: 'Backend & Security',
    items: ['Node.js / Express', 'JWT + Refresh Cookies', 'Role-Based Access Control', 'Prisma ORM']
  }
];

export const RECRUITER_HIGHLIGHTS = [
  {
    title: 'Zero Page Reloads',
    desc: 'Live bi-directional WebSocket sync guarantees all connected sessions reflect changes in under 50ms.',
    metric: '< 50ms',
    metricLabel: 'Sync Latency'
  },
  {
    title: 'Strict RBAC Architecture',
    desc: 'Server-enforced and frontend-guarded role isolation across Admin, PM, and Developer personas.',
    metric: '3 Roles',
    metricLabel: 'Permission Tiers'
  },
  {
    title: 'Optimistic Drag-and-Drop',
    desc: 'Instant visual feedback on Kanban reordering with background reconciliation and error rollback.',
    metric: '60 FPS',
    metricLabel: 'Physics Animations'
  },
  {
    title: 'Production Design Tokens',
    desc: 'Bespoke dark/light theme tokens, accessible contrast, responsive breakpoints, and glass surfaces.',
    metric: '100%',
    metricLabel: 'Type-Safe Theme'
  }
];
