import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { apiFetch } from '../../services/api.js';
import { socketService } from '../../services/socket.js';
import { User, OnlineUser, Role } from '../../types/index.js';
import { Users, Shield, Circle, RefreshCw, CheckCircle } from 'lucide-react';
import { getAvatarColor } from '../../lib/avatar.js';

export const AdminUsersPage: React.FC = () => {
  const { searchTerm = '' } = useOutletContext<{ searchTerm?: string }>() || {};
  const [users, setUsers] = useState<User[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const filteredUsers = users.filter((u) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      u.name.toLowerCase().includes(term) ||
      u.email.toLowerCase().includes(term) ||
      u.role.toLowerCase().includes(term)
    );
  });

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [usersData, presenceData] = await Promise.all([
        apiFetch<{ users: User[] }>('/api/users'),
        apiFetch<{ onlineCount: number; users: OnlineUser[] }>('/api/users/presence').catch(() => null),
      ]);
      if (usersData) setUsers(usersData.users || []);
      if (presenceData) setOnlineUsers(presenceData.users || []);
    } catch (err) {
      console.error('Failed to load users data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    const unsubscribePresence = socketService.subscribeToPresence((data) => {
      setOnlineUsers(data.users);
    });

    return () => unsubscribePresence();
  }, []);

  const handleRoleChange = async (userId: string, newRole: Role) => {
    setUpdatingId(userId);
    setSuccessMessage(null);
    try {
      const res = await apiFetch<{ user: User; message: string }>(`/api/users/${userId}/role`, {
        method: 'PATCH',
        body: JSON.stringify({ role: newRole }),
      });

      if (res && res.user) {
        setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u)));
        setSuccessMessage(`Role updated for ${res.user.name}. Real-time force_permission_refresh pushed!`);
        setTimeout(() => setSuccessMessage(null), 5000);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to update user role.');
    } finally {
      setUpdatingId(null);
    }
  };

  const isUserOnline = (id: string) => {
    return onlineUsers.some((o) => o.userId === id);
  };

  const getRoleBadge = (role: Role) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-primary/20 text-primary border-primary/30';
      case 'PROJECT_MANAGER':
        return 'bg-secondary text-secondary-foreground border-border';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl font-extrabold tracking-tight text-foreground sm:text-2xl">
            Team & Role-Based Access Control
          </h1>
          <p className="text-xs text-muted-foreground">
            Manage agency permissions with server-enforced role assignments and live socket session refresh.
          </p>
        </div>

        <button
          onClick={fetchData}
          className="flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-2 text-xs font-semibold text-foreground hover:bg-secondary transition-colors self-start sm:self-auto"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} /> Refresh Presence
        </button>
      </div>

      {/* Success alert on role change */}
      {successMessage && (
        <div className="flex items-center gap-2 rounded-xl bg-success/15 border border-success/30 p-3 text-xs font-semibold text-success animate-in fade-in">
          <CheckCircle className="h-4 w-4 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Users Table */}
      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-border bg-muted/40 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-5 py-3">Team Member</th>
                <th className="px-5 py-3">Email Address</th>
                <th className="px-5 py-3">Presence Status</th>
                <th className="px-5 py-3">Assigned Tasks</th>
                <th className="px-5 py-3">Assigned Role (Live Update)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-muted-foreground">
                    Loading team directory...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-muted-foreground">
                    {searchTerm ? `No team members matching "${searchTerm}".` : 'No team members found.'}
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const online = isUserOnline(u.id);

                  return (
                    <tr key={u.id} className="transition-colors hover:bg-secondary/30">
                      <td className="px-5 py-4 font-semibold text-foreground">
                        <div className="flex items-center gap-3">
                          <div
                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                            style={{ backgroundColor: getAvatarColor(u.name) }}
                          >
                            {u.name.charAt(0)}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-foreground">{u.name}</p>
                            <p className="text-[10px] text-muted-foreground">ID: {u.id.substring(0, 8)}...</p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4 text-muted-foreground">{u.email}</td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5">
                          <Circle
                            className={`h-2.5 w-2.5 fill-current ${
                              online ? 'text-success' : 'text-muted-foreground/40'
                            }`}
                          />
                          <span className={`font-semibold ${online ? 'text-success' : 'text-muted-foreground'}`}>
                            {online ? 'Online now' : 'Offline'}
                          </span>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                          {u._count?.assignedTasks || 0} tasks
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <select
                            value={u.role}
                            disabled={updatingId === u.id}
                            onChange={(e) => handleRoleChange(u.id, e.target.value as Role)}
                            className={`rounded-lg border px-2.5 py-1 text-xs font-bold uppercase focus:outline-none focus:ring-1 focus:ring-primary ${getRoleBadge(
                              u.role
                            )}`}
                          >
                            <option value="ADMIN">ADMIN</option>
                            <option value="PROJECT_MANAGER">PROJECT_MANAGER</option>
                            <option value="DEVELOPER">DEVELOPER</option>
                          </select>

                          {updatingId === u.id && (
                            <RefreshCw className="h-3.5 w-3.5 animate-spin text-primary" />
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
