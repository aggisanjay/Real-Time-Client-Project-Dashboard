import React, { useEffect, useState } from 'react';
import { apiFetch } from '../../services/api.js';
import { Project, Client, User } from '../../types/index.js';
import { ConfirmDialog } from '../../components/shared/ConfirmDialog.js';
import { Plus, FolderKanban, Trash2, Edit3, Building2, User as UserIcon } from 'lucide-react';

export const AdminProjectsPage: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [managers, setManagers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [deletingProjectId, setDeletingProjectId] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [clientId, setClientId] = useState('');
  const [managerId, setManagerId] = useState('');

  const fetchProjects = async () => {
    try {
      setIsLoading(true);
      const data = await apiFetch<{ projects: Project[] }>('/api/projects');
      if (data) setProjects(data.projects || []);
    } catch (err) {
      console.error('Failed to fetch projects:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();

    apiFetch<{ clients: Client[] }>('/api/clients').then((res) => {
      if (res && res.clients?.length > 0) {
        setClients(res.clients);
        setClientId(res.clients[0].id);
      }
    });

    apiFetch<{ users: User[] }>('/api/users?role=PROJECT_MANAGER').then((res) => {
      if (res && res.users?.length > 0) {
        setManagers(res.users);
        setManagerId(res.users[0].id);
      }
    });
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await apiFetch<{ project: Project }>('/api/projects', {
        method: 'POST',
        body: JSON.stringify({ name, clientId, managerId }),
      });
      if (res && res.project) {
        setProjects((prev) => [res.project, ...prev]);
        setIsCreateOpen(false);
        setName('');
      }
    } catch (err: any) {
      alert(err.message || 'Failed to create project.');
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject) return;

    try {
      const res = await apiFetch<{ project: Project }>(`/api/projects/${editingProject.id}`, {
        method: 'PUT',
        body: JSON.stringify({ name, clientId, managerId }),
      });
      if (res && res.project) {
        setProjects((prev) => prev.map((p) => (p.id === editingProject.id ? res.project : p)));
        setIsEditOpen(false);
        setEditingProject(null);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to update project.');
    }
  };

  const handleDelete = async () => {
    if (!deletingProjectId) return;
    try {
      await apiFetch(`/api/projects/${deletingProjectId}`, { method: 'DELETE' });
      setProjects((prev) => prev.filter((p) => p.id !== deletingProjectId));
      setDeletingProjectId(null);
    } catch (err: any) {
      alert(err.message || 'Failed to delete project.');
    }
  };

  const openEditModal = (p: Project) => {
    setEditingProject(p);
    setName(p.name);
    setClientId(p.clientId);
    setManagerId(p.managerId);
    setIsEditOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl font-extrabold tracking-tight text-foreground sm:text-2xl">
            Client Projects Management
          </h1>
          <p className="text-xs text-muted-foreground">
            Configure client engagements, assign Project Managers, and monitor status.
          </p>
        </div>

        <button
          onClick={() => {
            setName('');
            setIsCreateOpen(true);
          }}
          className="flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" /> Add Project
        </button>
      </div>

      {/* Projects Table */}
      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-border bg-muted/40 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-5 py-3">Project Title</th>
                <th className="px-5 py-3">Client</th>
                <th className="px-5 py-3">Assigned PM</th>
                <th className="px-5 py-3">Tasks</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-muted-foreground">
                    Loading projects...
                  </td>
                </tr>
              ) : projects.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-muted-foreground">
                    No projects found.
                  </td>
                </tr>
              ) : (
                projects.map((p) => (
                  <tr key={p.id} className="transition-colors hover:bg-secondary/30">
                    <td className="px-5 py-4 font-semibold text-foreground">
                      <div className="flex items-center gap-2">
                        <FolderKanban className="h-4 w-4 text-primary shrink-0" />
                        <span className="truncate max-w-[280px]">{p.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Building2 className="h-3.5 w-3.5" />
                        <span>{p.client?.name || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-foreground">
                      <div className="flex items-center gap-1.5">
                        <UserIcon className="h-3.5 w-3.5 text-primary" />
                        <span>{p.manager?.name || 'Unassigned'}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                        {p._count?.tasks || 0} tasks
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right space-x-1">
                      <button
                        onClick={() => openEditModal(p)}
                        className="rounded-lg p-1.5 text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
                        title="Edit Project"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => setDeletingProjectId(p.id)}
                        className="rounded-lg p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                        title="Delete Project"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Project Modal */}
      {(isCreateOpen || isEditOpen) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl backdrop-blur-xl">
            <h2 className="text-base font-bold text-foreground mb-4">
              {isEditOpen ? 'Edit Project' : 'Create New Project'}
            </h2>

            <form onSubmit={isEditOpen ? handleUpdate : handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Project Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Enterprise Data Platform"
                  className="w-full rounded-xl border border-border bg-background/50 px-3.5 py-2 text-xs text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Client</label>
                <select
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  className="w-full rounded-xl border border-border bg-card px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-none"
                >
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Assigned Project Manager</label>
                <select
                  value={managerId}
                  onChange={(e) => setManagerId(e.target.value)}
                  className="w-full rounded-xl border border-border bg-card px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-none"
                >
                  {managers.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="mt-6 flex justify-end gap-2.5 pt-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreateOpen(false);
                    setIsEditOpen(false);
                  }}
                  className="rounded-xl border border-border bg-card px-4 py-2 text-xs font-semibold text-foreground hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow-md shadow-primary/20 hover:bg-primary/90"
                >
                  {isEditOpen ? 'Save Changes' : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deletingProjectId}
        title="Delete Project?"
        message="Are you sure you want to delete this project? All associated tasks, activity logs, and notifications will be removed permanently."
        confirmLabel="Delete Project"
        onConfirm={handleDelete}
        onCancel={() => setDeletingProjectId(null)}
      />
    </div>
  );
};
