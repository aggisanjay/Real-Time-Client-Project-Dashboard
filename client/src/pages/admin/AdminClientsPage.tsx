import React, { useEffect, useState } from 'react';
import { apiFetch } from '../../services/api.js';
import { Client } from '../../types/index.js';
import { ConfirmDialog } from '../../components/shared/ConfirmDialog.js';
import { Plus, Building2, Trash2, Edit3, Mail } from 'lucide-react';

export const AdminClientsPage: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [deletingClientId, setDeletingClientId] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [contactInfo, setContactInfo] = useState('');

  const fetchClients = async () => {
    try {
      setIsLoading(true);
      const data = await apiFetch<{ clients: Client[] }>('/api/clients');
      if (data) setClients(data.clients || []);
    } catch (err) {
      console.error('Failed to load clients:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await apiFetch<{ client: Client }>('/api/clients', {
        method: 'POST',
        body: JSON.stringify({ name, contactInfo }),
      });
      if (res && res.client) {
        setClients((prev) => [...prev, res.client]);
        setIsCreateOpen(false);
        setName('');
        setContactInfo('');
      }
    } catch (err: any) {
      alert(err.message || 'Failed to create client.');
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClient) return;

    try {
      const res = await apiFetch<{ client: Client }>(`/api/clients/${editingClient.id}`, {
        method: 'PUT',
        body: JSON.stringify({ name, contactInfo }),
      });
      if (res && res.client) {
        setClients((prev) => prev.map((c) => (c.id === editingClient.id ? res.client : c)));
        setIsEditOpen(false);
        setEditingClient(null);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to update client.');
    }
  };

  const handleDelete = async () => {
    if (!deletingClientId) return;
    try {
      await apiFetch(`/api/clients/${deletingClientId}`, { method: 'DELETE' });
      setClients((prev) => prev.filter((c) => c.id !== deletingClientId));
      setDeletingClientId(null);
    } catch (err: any) {
      alert(err.message || 'Failed to delete client.');
    }
  };

  const openEditModal = (c: Client) => {
    setEditingClient(c);
    setName(c.name);
    setContactInfo(c.contactInfo);
    setIsEditOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl font-extrabold tracking-tight text-foreground sm:text-2xl">
            Client Directory
          </h1>
          <p className="text-xs text-muted-foreground">
            Manage agency clients, primary stakeholder contacts, and contracted projects.
          </p>
        </div>

        <button
          onClick={() => {
            setName('');
            setContactInfo('');
            setIsCreateOpen(true);
          }}
          className="flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" /> Add Client
        </button>
      </div>

      {/* Clients Table */}
      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-border bg-muted/40 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-5 py-3">Client Name</th>
                <th className="px-5 py-3">Contact Information</th>
                <th className="px-5 py-3">Active Projects</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-muted-foreground">
                    Loading clients...
                  </td>
                </tr>
              ) : clients.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-muted-foreground">
                    No clients found.
                  </td>
                </tr>
              ) : (
                clients.map((c) => (
                  <tr key={c.id} className="transition-colors hover:bg-secondary/30">
                    <td className="px-5 py-4 font-semibold text-foreground">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-primary shrink-0" />
                        <span>{c.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                        <span>{c.contactInfo}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-bold text-primary">
                        {c._count?.projects || 0} projects
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right space-x-1">
                      <button
                        onClick={() => openEditModal(c)}
                        className="rounded-lg p-1.5 text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
                        title="Edit Client"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => setDeletingClientId(c.id)}
                        className="rounded-lg p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                        title="Delete Client"
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

      {/* Create / Edit Modal */}
      {(isCreateOpen || isEditOpen) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl backdrop-blur-xl">
            <h2 className="text-base font-bold text-foreground mb-4">
              {isEditOpen ? 'Edit Client' : 'Add New Client'}
            </h2>

            <form onSubmit={isEditOpen ? handleUpdate : handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Company / Organization Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., NovaPay Financial Services"
                  className="w-full rounded-xl border border-border bg-background/50 px-3.5 py-2 text-xs text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Contact Details & Location</label>
                <input
                  type="text"
                  required
                  value={contactInfo}
                  onChange={(e) => setContactInfo(e.target.value)}
                  placeholder="e.g., ops@novapay.io | +1 555-0192"
                  className="w-full rounded-xl border border-border bg-background/50 px-3.5 py-2 text-xs text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
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
                  {isEditOpen ? 'Save Changes' : 'Create Client'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deletingClientId}
        title="Delete Client?"
        message="Are you sure you want to remove this client? All connected projects and tasks will also be removed."
        confirmLabel="Delete Client"
        onConfirm={handleDelete}
        onCancel={() => setDeletingClientId(null)}
      />
    </div>
  );
};
