# Real-Time Client Project Dashboard (AgencyFlow)

> Full-stack enterprise internal tool for managing client projects, assigning/tracking tasks, and monitoring team activity in real time with server-enforced role-based access control (RBAC).

---

## 1. Quick Start & Setup

### Prerequisites
- Node.js (v20+ or v24+) & npm (v10+)
- PostgreSQL 16+ database (Local PostgreSQL or Cloud PostgreSQL such as Neon)

---

### Installation & Launch Guide

```bash
# 1. Setup Backend
cd server
cp .env.example .env    # Configure DATABASE_URL (e.g. Neon PostgreSQL), PORT=5000, JWT secrets
npm install
npx prisma db push      # Synchronize PostgreSQL schema
npx tsx prisma/seed.ts  # Seed test users, projects, tasks, and activity logs
npm run dev             # Starts Express + Socket.io + Cron on http://localhost:5000

# 2. Setup Frontend (in a separate terminal)
cd ../client
cp .env.example .env    # Contains VITE_API_URL=http://localhost:5000 and VITE_SOCKET_URL=http://localhost:5000
npm install
npm run dev             # Starts Vite dev server on http://localhost:5173
```

- **Frontend Application:** `http://localhost:5173`
- **Backend API & WebSockets:** `http://localhost:5000`

---

## 2. Demo Persona Credentials

| Persona | Email | Password | Pre-configured Role |
|---|---|---|---|
| **Administrator** | `admin@agency.com` | `Password123!` | Full global access across clients, projects, users, and tasks |
| **Project Manager 1** | `sarah.pm@agency.com` | `Password123!` | Manages Fleet Telemetry & NovaPay Engine projects |
| **Project Manager 2** | `marcus.pm@agency.com` | `Password123!` | Manages HIPAA Patient Telehealth Portal project |
| **Developer 1** | `alex.dev@agency.com` | `Password123!` | Assigned tasks in Fleet Telemetry & HIPAA Portal |
| **Developer 2** | `elena.dev@agency.com` | `Password123!` | Assigned tasks in Fleet Telemetry & NovaPay Engine |
| **Developer 3** | `liam.dev@agency.com` | `Password123!` | Assigned tasks in NovaPay & HIPAA Portal |
| **Developer 4** | `maya.dev@agency.com` | `Password123!` | Assigned tasks across logistics and payments |

> 💡 *The login screen includes 1-Click Demo Persona buttons for instant credential population during evaluation.*

---

## 3. Database Schema & Indexing Justification

```
+---------------+        +---------------+        +------------------+
|     User      |1     * |    Project    |1     * |       Task       |
+---------------+--------+---------------+--------+------------------+
| id (PK)       |        | id (PK)       |        | id (PK)          |
| name          |        | name          |        | title            |
| email (UQ)    |        | clientId (FK) |        | description      |
| passwordHash  |        | managerId(FK) |        | projectId (FK)   |
| role (ENUM)   |        +---------------+        | assignedToId(FK) |
| createdAt     |                                 | status (ENUM)    |
+---------------+                                 | priority (ENUM)  |
        | 1                                       | dueDate          |
        |                                         | isOverdue (BOOL) |
        | *                                       +------------------+
+------------------+                                      | 1
| TaskActivityLog  |*                                     |
+------------------+--------------------------------------+
| id (PK)          |
| taskId (FK)      |
| userId (FK)      |
| fromStatus (ENUM)|
| toStatus (ENUM)  |
| timestamp (DT)   |
+------------------+
```

### Strategic Indexing Justifications:
1. `Task.assignedToId`: Essential for O(1) index scans on Developer task list queries (`WHERE assignedToId = req.user.id`).
2. `Task.projectId`: Powers fast retrieval of tasks when filtering or loading project Kanban boards.
3. `Task.status`: Optimizes status filtering (`status = 'IN_REVIEW'`) and Kanban column partitioning.
4. `Task.dueDate`: Used by the scheduled background cron job to quickly identify candidates (`dueDate < NOW() AND status != 'DONE'`).
5. `Project.managerId`: Essential for Project Manager query scoping (`WHERE managerId = req.user.id`).
6. `TaskActivityLog.taskId + timestamp` (Composite): Supports fast retrieval of recent activity timelines for specific tasks.
7. `Notification.userId + isRead` (Composite): Optimizes live unread notification badge counters and dropdown rendering.

---

## 4. Key Features & Architectural Decisions

### 1. Global Command Palette Search (`⌘K` / `Ctrl+K`)
- **Modern Search Shell:** Pill design with clear button (`X`), OS-aware shortcut badge (`⌘K` or `Ctrl+K`), and smooth focus glowing states.
- **RBAC-Enforced Backend Endpoint (`/api/search?q=...`):**
  - **Developers:** Scoped exclusively to their assigned tasks and associated projects.
  - **Project Managers:** Scoped to tasks in their projects, managed projects, and team members.
  - **Admins:** Global search across all tasks, projects, and users.
- **Instant Dropdown Palette:** Renders real-time results categorized into Tasks (with status pills), Projects, and Team members. Clicking any task opens its detail modal directly.
- **In-Page Live Filter Sync:** Synchronizes with active Kanban boards and directory tables via `useOutletContext`.

### 2. Real-Time Layer: Socket.io
- **Event Architecture:** Bidirectional low-latency events with automatic transport failover and room multiplexing (`project:<id>`, `role:admin`, `user:<id>`).
- **Multi-Role Notification Broadcasting:** When a task is updated or moved on the board, the assigned Developer, project Manager, and all Admins receive immediate socket notifications.
- **Catch-up Strategy:** Reconnection executes `GET /api/activity/feed?limit=20` querying the persistent `TaskActivityLog` table to guarantee zero lost events.

### 3. Notification Drawer & Dismissal Flow
- **"Mark all read":** Updates read state without removing cards from view.
- **Single-Card "X" Removal:** Individual notifications feature a dedicated `X` button on the right side of each card to permanently dismiss/remove items one by one.

### 4. Background Scheduler
- In-process `node-cron` running every 10 minutes scanning uncompleted tasks past `dueDate` and atomically flagging `isOverdue = true`.

### 5. Authentication & Token Security
- Short-lived JWT access tokens (~15 min) in memory + cryptographically hashed refresh tokens (~7 days) stored in `HttpOnly`, `SameSite=Strict` cookies.
- Real-time permission revocation broadcasts `force_permission_refresh` over WebSockets when roles are updated.

### 6. Default White (Light) Theme & Dark Mode
- Defaults to a clean, high-contrast **White Mode** (`:root` tokens in `index.css`).
- Full dark mode support toggleable via the header theme switch.

---

## 5. Project Directory Structure

```
Real-Time Client Project Dashboard/
├── README.md                      # Complete setup, architecture, and schema documentation
├── EXPLANATION.md                 # Technical architecture debrief
├── server/
│   ├── .env.example               # Backend configuration template
│   ├── prisma/
│   │   ├── schema.prisma          # PostgreSQL models & indexes
│   │   └── seed.ts                # Realistic seed data
│   ├── src/
│   │   ├── config/                # env.ts, db.ts (Prisma client)
│   │   ├── middleware/            # auth.ts, roleGuard.ts, validate.ts, errorHandler.ts
│   │   ├── controllers/           # auth, client, project, task, activity, notification, user, search
│   │   ├── services/              # tokenService, socketService, cronService
│   │   ├── routes/                # auth, client, project, task, activity, notification, user, search
│   │   └── index.ts               # Express + HTTP + Socket.io + Cron server
│   └── tests/
│       └── rbac.test.ts           # Integration tests proving cross-role access is blocked
└── client/
    ├── .env                       # Frontend environment variables
    ├── .env.example               # Frontend environment template
    ├── vercel.json                # Vercel deployment configuration
    ├── index.html
    └── src/
        ├── index.css              # Tailwind v4 theme, HSL variables, dark mode
        ├── App.tsx                # Role-scoped routes and guards
        ├── types/index.ts         # Shared TypeScript interfaces
        ├── services/
        │   ├── api.ts             # Fetch client with auto refresh token queue
        │   └── socket.ts          # Singleton Socket.io service with ready queue
        ├── context/
        │   ├── AuthContext.tsx    # Auth state, login/logout, session recovery
        │   └── ThemeContext.tsx   # Theme state (defaults to light mode)
        ├── layouts/
        │   ├── AdminLayout.tsx    # Executive navigation with search outlet
        │   ├── PMLayout.tsx       # Scoped to managed projects with search outlet
        │   ├── DeveloperLayout.tsx# Scoped to assigned tasks with search outlet
        │   └── BottomNavigation.tsx # Mobile bottom bar
        ├── routes/
        │   ├── ProtectedRoute.tsx # Redirects to /login
        │   ├── RoleRoute.tsx      # Evaluates allowed roles
        │   └── AccessDenied.tsx   # Access Denied screen
        └── components/shared/
            ├── TopNav.tsx         # Search bar, shortcuts, notifications, theme toggle
            ├── ActiveUsersIndicator.tsx # Presence pill + online users popup
            ├── NotificationBell.tsx     # Unread count badge + card removal ("X")
            ├── KanbanBoard.tsx          # 4-column drag-and-drop board
            ├── TaskCard.tsx             # Task card with overdue badge
            ├── TaskDetailModal.tsx      # Details, status editor, activity logs
            ├── ActivityFeedPanel.tsx    # Live relative timestamps stream
            └── FilterBar.tsx            # URL-synced filters
```

---

## 6. Server-Side RBAC Verification

Run the automated integration test suite to verify server-side role enforcement:

```bash
cd server
npm test
```

### Tested Security Guarantees:
- Unauthenticated requests rejected with `401 UNAUTHORIZED`.
- Developer fetching another developer's task directly by ID is blocked with `403 FORBIDDEN`.
- Developer cannot create or delete projects (`403 FORBIDDEN`).
- Developer cannot delete tasks (`403 FORBIDDEN`).
- Project Manager fetching another PM's project is blocked with `403 FORBIDDEN`.
- Project Manager only receives their managed projects in list queries.
- Admin receives full global visibility across all entities.

---

## 7. Known Limitations
- Background scheduler runs within the Express instance (`node-cron`). For horizontal scaling across multiple instances, an external scheduler or BullMQ with Redis locks would be recommended.
- WebSockets currently operate on a single Node server instance. For multi-node clustering, the `@socket.io/redis-adapter` would be required.
