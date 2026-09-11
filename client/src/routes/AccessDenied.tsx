import React from 'react';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';

export const AccessDenied: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const getHomePath = () => {
    if (!user) return '/login';
    if (user.role === 'ADMIN') return '/admin';
    if (user.role === 'PROJECT_MANAGER') return '/pm';
    return '/dev';
  };

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center p-6 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-destructive/10 text-destructive mb-6 ring-8 ring-destructive/5">
        <ShieldAlert className="h-10 w-10" />
      </div>
      <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Access Denied</h1>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        You do not have the required permissions to access this screen. Your current role is{' '}
        <span className="font-semibold text-foreground uppercase tracking-wider">{user?.role}</span>.
      </p>
      <div className="mt-6 flex gap-3">
        <button
          onClick={() => navigate(getHomePath())}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <ArrowLeft className="h-4 w-4" /> Return to Dashboard
        </button>
      </div>
    </div>
  );
};
