# Technical Explanation Write-Up

### Hardest Problem Solved
The most intricate challenge was preventing stale authorization state in open WebSocket sessions while preserving zero-trust security. Frontend guards can be bypassed; therefore, role scoping was enforced exclusively in database query predicates (`WHERE managerId = req.user.id` or `assignedToId = req.user.id`). When an administrator modifies a user's role, the server broadcasts an immediate `force_permission_refresh` event to that user's private socket room (`user:<id>`), forcing an automated credential rotation and layout resynchronization without requiring manual logouts.

### How the Real-Time Role-Filtered Feed Works
Rather than broadcasting all state transitions indiscriminately and relying on client-side filtering, our real-time feed multiplexes events across targeted server-side rooms:
1. When a task status changes, the controller writes a persistent `TaskActivityLog` row.
2. The server dispatches the transition payload directly to `role:admin` (global stream), `project:<id>` (active project board), `user:<managerId>` (owning PM), and `user:<assigneeId>` (assigned developer).
3. On reconnect or initial load, clients execute `GET /api/activity/feed?limit=20`, executing a role-scoped database query to guarantee complete event recovery without volatile in-memory buffers.

### What I Would Do Differently
In a horizontally scaled deployment with multiple backend instances, I would replace the single-node Socket.io server with `@socket.io/redis-adapter` and migrate `node-cron` to BullMQ backed by a distributed Redis queue. This would guarantee idempotent background task evaluation and seamless pub/sub distribution across auto-scaling containers.
