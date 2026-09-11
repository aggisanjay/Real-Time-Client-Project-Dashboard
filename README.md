# Real-Time Client Project Dashboard (AgencyFlow)

> Full-stack enterprise internal tool for managing client projects, assigning/tracking tasks, and monitoring team activity in real time with server-enforced role-based access control (RBAC), mirroring the patterns of `Talent-Portal-production`.

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
cp .env.example .env    # Ensure DATABASE_URL points to your PostgreSQL instance
npm install
npx prisma db push      # Synchronize PostgreSQL schema
npx tsx prisma/seed.ts  # Seed test users, projects, tasks, and activity logs
npm run dev             # Starts Express + Socket.io + Cron on http://localhost:5000

# 2. Setup Frontend (in a separate terminal)
cd ../client
cp .env.example .env    # Verify VITE_API_URL and VITE_SOCKET_URL
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

## 4. Architectural Decisions & Justifications

### 1. Real-Time Layer: Socket.io vs SSE vs Long-Polling
- **Decision:** Socket.io with a client singleton service (`services/socket.ts`) and feature-scoped listeners.
- **Justification:** Socket.io provides bidirectional low-latency events with automatic transport failover (WebSocket to long-polling fallback), heartbeat-based connection monitoring, and native room multiplexing (`project:<id>`, `role:admin`, `user:<id>`).
- **Catch-up Strategy:** Reconnection fires a role-scoped REST query (`GET /api/activity/feed?limit=20`) against the persistent PostgreSQL `TaskActivityLog` table. This guarantees zero lost events even across server restarts.

### 2. Background Job: node-cron vs BullMQ
- **Decision:** `node-cron` with in-process evaluation.
- **Justification:** Avoids requiring Redis infrastructure for an agency dashboard workload. A cron runs every 10 minutes scanning uncompleted tasks past `dueDate`, atomically marking `isOverdue = true`.

### 3. Authentication & Token Storage
- **Decision:** Short-lived JWT access tokens (~15 min) kept in-memory, paired with cryptographically hashed refresh tokens (~7 days) stored in an `HttpOnly`, `Secure`, `SameSite=Strict` cookie.
- **Justification:** Eliminates XSS token exfiltration risks inherent in `localStorage`. Rotation invalidates old tokens upon refresh.
- **Permission Revocation:** When an Admin alters a user's role, the server broadcasts a `force_permission_refresh` event to `user:<id>` over Socket.io, forcing an immediate token refresh and layout sync.

---

## 5. Design System & Reference Adaptations

Mirroring `Talent-Portal-production`:
1. **Verbatim Theme Tokens:** Tailwind CSS v4 `@theme` with custom HSL variables and a custom `@custom-variant dark (&:is(.dark *));`.
2. **Glassmorphic Navy Aesthetic:** Dark mode uses high-contrast navy/slate (`hsl(220 25% 8%)`), `.premium-card` gradient borders, and subtle blur headers.
3. **Role-Split Layouts:** `AdminLayout.tsx`, `PMLayout.tsx`, `DeveloperLayout.tsx`, and `BottomNavigation.tsx` ensure navigation reflects the security perimeter.
4. **Singleton Socket Service:** Connection lifecycle, ready queue (`onSocketReady`), feature-scoped attachments (`attachActivityFeedListeners`, `attachNotificationListeners`, `attachPresenceListeners`), and authentication failure backoff (`MAX_AUTH_FAILURES`).

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
