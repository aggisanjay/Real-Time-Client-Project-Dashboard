import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext.js';
import { useTheme } from '../../context/ThemeContext.js';
import { Logo } from '../../components/shared/Logo.js';
import {
  Shield,
  Briefcase,
  Terminal,
  ArrowLeft,
  Radio,
  Layers,
  Activity,
  Sun,
  Moon,
  Zap,
  ChevronRight,
  TrendingUp,
  CheckCircle2
} from 'lucide-react';

const SHOWCASE_HIGHLIGHTS = [
  {
    icon: Radio,
    title: 'Bi-Directional WebSocket Sync',
    desc: 'Instant updates across all connected browsers using Socket.IO rooms and real-time event broadcasting.'
  },
  {
    icon: Shield,
    title: 'Role-Based Access Control',
    desc: 'Strict permission boundaries and server-enforced route guards for Admin, PM, and Developer accounts.'
  },
  {
    icon: Layers,
    title: 'Optimistic Sprint Board',
    desc: 'Interactive drag-and-drop Kanban built with @dnd-kit for fluid, low-latency task orchestration.'
  }
];

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('Password123!');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogin = async (e?: React.FormEvent, customEmail?: string, customPassword?: string) => {
    if (e) e.preventDefault();
    setError('');
    setLoading(true);

    const targetEmail = customEmail || email;
    const targetPassword = customPassword || password;

    try {
      const user = await login(targetEmail, targetPassword);
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

  const handleInstantPersonaLogin = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('Password123!');
    handleLogin(undefined, demoEmail, 'Password123!');
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-background px-4 py-6 sm:px-6">
      {/* Top Header Navigation */}
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between pb-6">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors group"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Landing Page</span>
        </Link>

        <button
          onClick={toggleTheme}
          aria-label="Toggle Theme"
          className="flex h-8 w-8 items-center justify-center rounded-xl border border-border/80 bg-card text-muted-foreground hover:text-foreground transition shadow-2xs"
        >
          {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>
      </div>

      {/* Main Container: Elegant Two-Column Layout */}
      <div className="mx-auto flex w-full max-w-5xl flex-1 items-center justify-center">
        <div className="grid w-full grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Column: Sign In Form & 1-Click Fast Pass */}
          <div className="lg:col-span-5 w-full max-w-md mx-auto space-y-6">
            {/* Brand Header */}
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-md shadow-primary/20">
                <Logo className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold tracking-tight text-foreground">
                  AgencyFlow
                </h2>
                <p className="text-xs text-muted-foreground">Sign in to your dashboard</p>
              </div>
            </div>

            {/* Login Form Card */}
            <form
              onSubmit={(e) => handleLogin(e)}
              className="w-full bg-card border border-border/80 rounded-2xl p-6 shadow-md space-y-4"
            >
              {error && (
                <div className="rounded-xl bg-destructive/10 border border-destructive/20 p-3 text-xs font-medium text-destructive text-left">
                  {error}
                </div>
              )}

              {/* Email Field */}
              <div className="space-y-1.5 text-left">
                <label className="text-xs font-medium text-foreground">Email</label>
                <input
                  type="email"
                  name="email"
                  placeholder="name@agency.com"
                  className="w-full h-11 rounded-xl bg-muted/40 border border-border/80 px-3.5 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              {/* Password Field */}
              <div className="space-y-1.5 text-left">
                <label className="text-xs font-medium text-foreground">Password</label>
                <input
                  type="password"
                  name="password"
                  placeholder="Password123!"
                  className="w-full h-11 rounded-xl bg-muted/40 border border-border/80 px-3.5 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 rounded-xl text-white font-semibold text-xs bg-primary hover:bg-primary/90 transition shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <span>{loading ? 'Signing in...' : 'Sign In'}</span>
                <ChevronRight className="h-4 w-4" />
              </button>

              {/* 1-Click Fast Pass Persona Launcher */}
              <div className="border-t border-border/60 pt-4 space-y-2.5 text-left">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Zap className="h-3 w-3 text-amber-500" />
                  <span>1-Click Persona Demo</span>
                </div>

                <div className="space-y-2">
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => handleInstantPersonaLogin('admin@agency.com')}
                    className="flex w-full items-center justify-between rounded-xl border border-border/70 bg-muted/20 px-3.5 py-2.5 text-xs text-foreground transition-all hover:bg-muted/50 hover:border-primary/50 group"
                  >
                    <div className="flex items-center gap-2.5">
                      <Shield className="h-4 w-4 text-rose-500" />
                      <div className="text-left">
                        <div className="font-semibold text-foreground group-hover:text-primary transition-colors">
                          Administrator
                        </div>
                        <div className="text-[10px] text-muted-foreground">admin@agency.com</div>
                      </div>
                    </div>
                    <span className="text-[11px] font-semibold text-primary">Login →</span>
                  </button>

                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => handleInstantPersonaLogin('sarah.pm@agency.com')}
                    className="flex w-full items-center justify-between rounded-xl border border-border/70 bg-muted/20 px-3.5 py-2.5 text-xs text-foreground transition-all hover:bg-muted/50 hover:border-primary/50 group"
                  >
                    <div className="flex items-center gap-2.5">
                      <Briefcase className="h-4 w-4 text-amber-500" />
                      <div className="text-left">
                        <div className="font-semibold text-foreground group-hover:text-primary transition-colors">
                          Project Manager
                        </div>
                        <div className="text-[10px] text-muted-foreground">sarah.pm@agency.com</div>
                      </div>
                    </div>
                    <span className="text-[11px] font-semibold text-primary">Login →</span>
                  </button>

                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => handleInstantPersonaLogin('alex.dev@agency.com')}
                    className="flex w-full items-center justify-between rounded-xl border border-border/70 bg-muted/20 px-3.5 py-2.5 text-xs text-foreground transition-all hover:bg-muted/50 hover:border-primary/50 group"
                  >
                    <div className="flex items-center gap-2.5">
                      <Terminal className="h-4 w-4 text-emerald-500" />
                      <div className="text-left">
                        <div className="font-semibold text-foreground group-hover:text-primary transition-colors">
                          Developer
                        </div>
                        <div className="text-[10px] text-muted-foreground">alex.dev@agency.com</div>
                      </div>
                    </div>
                    <span className="text-[11px] font-semibold text-primary">Login →</span>
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Right Column: Clean Architectural Showcase (Not Clumsy) */}
          <div className="lg:col-span-7 w-full space-y-6">
            <div className="rounded-3xl border border-border/80 bg-card p-7 sm:p-8 shadow-xl space-y-6">
              
              {/* Header */}
              <div className="space-y-1.5 border-b border-border/60 pb-5">
                <div className="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Real-Time Workspace</span>
                </div>
                <h3 className="text-xl font-bold tracking-tight text-foreground">
                  Engineered for Performance & Scale
                </h3>
                <p className="text-xs text-muted-foreground">
                  Experience instantaneous synchronization, strict RBAC, and responsive execution.
                </p>
              </div>

              {/* 3 Clean Highlight Cards */}
              <div className="space-y-3">
                {SHOWCASE_HIGHLIGHTS.map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={idx}
                      className="flex items-start gap-3.5 rounded-xl border border-border/60 bg-muted/20 p-3.5 hover:border-primary/40 transition-colors"
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="space-y-0.5">
                        <h4 className="text-xs font-bold text-foreground">{item.title}</h4>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Clean Preview Snippet */}
              <div className="rounded-xl border border-border/70 bg-muted/20 p-4 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-foreground">Live Telemetry Metrics</span>
                  <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                    Active Sync (50ms)
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded-lg bg-card p-2.5 border border-border/70 text-center">
                    <div className="text-[10px] text-muted-foreground">Active Sockets</div>
                    <div className="text-base font-bold text-foreground">Connected</div>
                  </div>
                  <div className="rounded-lg bg-card p-2.5 border border-border/70 text-center">
                    <div className="text-[10px] text-muted-foreground">Sprint Velocity</div>
                    <div className="text-base font-bold text-emerald-500">94.8%</div>
                  </div>
                  <div className="rounded-lg bg-card p-2.5 border border-border/70 text-center">
                    <div className="text-[10px] text-muted-foreground">Permission Tiers</div>
                    <div className="text-base font-bold text-primary">3 Isolated</div>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>

      {/* Clean Footer */}
      <div className="mx-auto w-full max-w-5xl pt-6 text-center text-xs text-muted-foreground">
        AgencyFlow • Real-Time Client Project Dashboard
      </div>
    </div>
  );
};
