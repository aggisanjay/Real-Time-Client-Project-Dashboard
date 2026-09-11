import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.js';
import { Logo } from '../../components/shared/Logo.js';
import { Shield, Briefcase, Terminal } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('Password123!');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login(email, password);
      if (user.role === 'ADMIN') {
        navigate('/admin');
      } else if (user.role === 'PROJECT_MANAGER') {
        navigate('/pm');
      } else {
        navigate('/dev');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const setTestAccount = (testEmail: string) => {
    setEmail(testEmail);
    setPassword('Password123!');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md space-y-5">
        {/* Brand Logo & Title */}
        <div className="text-center space-y-2">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
            <Logo className="h-6 w-6" />
          </div>
          <h2 className="text-lg font-bold tracking-tight text-foreground">
            AgencyFlow
          </h2>
        </div>

        {/* Login Card - Pill Design */}
        <form
          onSubmit={handleLogin}
          className="w-full text-center bg-card border border-border rounded-2xl px-8 py-9 shadow-2xl"
        >
          <h1 className="text-foreground text-3xl font-medium">
            Login
          </h1>

          <p className="text-muted-foreground text-xs mt-2">
            Please sign in to continue
          </p>

          {error && (
            <div className="mt-4 rounded-xl bg-destructive/15 border border-destructive/30 p-2.5 text-xs font-medium text-destructive text-left">
              {error}
            </div>
          )}

          {/* Email Pill Input */}
          <div className="flex items-center w-full mt-6 bg-muted/60 border border-border h-12 rounded-full overflow-hidden pl-5 pr-4 gap-2.5 focus-within:border-primary transition-colors">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              className="text-muted-foreground shrink-0"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7" />
              <rect x="2" y="4" width="20" height="16" rx="2" />
            </svg>
            <input
              type="email"
              name="email"
              placeholder="Email id"
              className="w-full bg-transparent text-foreground placeholder:text-muted-foreground border-none outline-none text-xs"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* Password Pill Input */}
          <div className="flex items-center mt-4 w-full bg-muted/60 border border-border h-12 rounded-full overflow-hidden pl-5 pr-4 gap-2.5 focus-within:border-primary transition-colors">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              className="text-muted-foreground shrink-0"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <input
              type="password"
              name="password"
              placeholder="Password"
              className="w-full bg-transparent text-foreground placeholder:text-muted-foreground border-none outline-none text-xs"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="mt-6 w-full h-11 rounded-full text-white font-semibold text-xs bg-primary hover:bg-primary/90 transition shadow-sm disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Login'}
          </button>

          {/* 1-Click Demo Personas */}
          <div className="mt-6 border-t border-border pt-5 text-left">
            <p className="text-center text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              1-Click Demo Personas
            </p>

            <div className="space-y-2">
              <button
                type="button"
                onClick={() => setTestAccount('admin@agency.com')}
                className="flex w-full items-center justify-between rounded-xl border border-border bg-muted/40 px-3.5 py-2 text-xs text-foreground transition-colors hover:bg-secondary"
              >
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-primary" />
                  <span className="font-semibold">Administrator</span>
                </div>
                <span className="text-[11px] text-muted-foreground">admin@agency.com</span>
              </button>

              <button
                type="button"
                onClick={() => setTestAccount('sarah.pm@agency.com')}
                className="flex w-full items-center justify-between rounded-xl border border-border bg-muted/40 px-3.5 py-2 text-xs text-foreground transition-colors hover:bg-secondary"
              >
                <div className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-primary" />
                  <span className="font-semibold">Project Manager</span>
                </div>
                <span className="text-[11px] text-muted-foreground">sarah.pm@agency.com</span>
              </button>

              <button
                type="button"
                onClick={() => setTestAccount('alex.dev@agency.com')}
                className="flex w-full items-center justify-between rounded-xl border border-border bg-muted/40 px-3.5 py-2 text-xs text-foreground transition-colors hover:bg-secondary"
              >
                <div className="flex items-center gap-2">
                  <Terminal className="h-4 w-4 text-primary" />
                  <span className="font-semibold">Developer</span>
                </div>
                <span className="text-[11px] text-muted-foreground">alex.dev@agency.com</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
