import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext.js';
import { useTheme } from '../../context/ThemeContext.js';
import { Logo } from '../../components/shared/Logo.js';
import { DashboardPreviewMockup } from '../../components/landing/DashboardPreviewMockup.js';
import {
  SHOWCASE_TABS,
  DEMO_PERSONAS,
  TECH_STACK,
  RECRUITER_HIGHLIGHTS,
  PersonaItem,
  ShowcaseTab
} from '../../config/showcaseConfig.js';
import {
  Shield,
  Briefcase,
  Terminal,
  ArrowRight,
  Radio,
  CheckCircle2,
  Layers,
  Activity,
  Sun,
  Moon,
  Zap,
  Cpu,
  Code2,
  ChevronRight,
  Database
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { user, login } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [activeTabId, setActiveTabId] = useState<string>('overview');
  const [demoLoading, setDemoLoading] = useState<string | null>(null);

  const activeTab: ShowcaseTab =
    SHOWCASE_TABS.find((t) => t.id === activeTabId) || SHOWCASE_TABS[0];

  const handle1ClickLogin = async (persona: PersonaItem) => {
    setDemoLoading(persona.role);
    try {
      const loggedUser = await login(persona.email, 'Password123!');
      if (loggedUser.role === 'ADMIN') navigate('/admin');
      else if (loggedUser.role === 'PROJECT_MANAGER') navigate('/pm');
      else navigate('/dev');
    } catch (err) {
      console.error('Demo login failed:', err);
      navigate('/login');
    } finally {
      setDemoLoading(null);
    }
  };

  const getRoleDashboardPath = (role?: string) => {
    if (role === 'ADMIN') return '/admin';
    if (role === 'PROJECT_MANAGER') return '/pm';
    return '/dev';
  };

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary selection:text-white transition-colors duration-300">
      {/* Background Soft Glow */}
      <div className="fixed inset-0 -z-20 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-primary/10 rounded-full blur-3xl opacity-50 dark:opacity-25" />
      </div>

      {/* Clean Modern Navbar */}
      <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center gap-3 transition hover:opacity-90">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
              <Logo className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-base tracking-tight text-foreground">
                AgencyFlow
              </span>
              <span className="text-[10px] text-muted-foreground -mt-0.5">
                Real-Time Client Dashboard
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-medium text-muted-foreground">
            <a href="#demo-preview" className="hover:text-foreground transition-colors">
              Live Preview
            </a>
            <a href="#features" className="hover:text-foreground transition-colors">
              Capabilities
            </a>
            <a href="#personas" className="hover:text-foreground transition-colors">
              Role Access
            </a>
            <a href="#architecture" className="hover:text-foreground transition-colors">
              Tech Stack
            </a>
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              aria-label="Toggle Theme"
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-border/80 bg-card text-muted-foreground hover:text-foreground hover:bg-muted/40 transition shadow-2xs"
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>

            {user ? (
              <button
                onClick={() => navigate(getRoleDashboardPath(user.role))}
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-primary/90 transition"
              >
                <span>Dashboard</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            ) : (
              <Link
                to="/login"
                className="rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-primary/90 transition"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-16 pb-16 md:pt-24 md:pb-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 text-center space-y-8">
          
          {/* Eyebrow */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-muted/30 px-4 py-1.5 text-xs text-muted-foreground"
          >
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-medium text-foreground">Socket.IO Real-Time Engine</span>
            <span>•</span>
            <span>Multi-Role RBAC</span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-foreground leading-[1.12]"
          >
            Real-Time Client Dashboard{' '}
            <span className="text-primary">Engineered for Scale</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="mx-auto max-w-2xl text-sm sm:text-base text-muted-foreground leading-relaxed"
          >
            A high-performance workspace featuring bi-directional WebSocket state sync,
            drag-and-drop Kanban execution, and strict role-based access control for Admins,
            Project Managers, and Developers.
          </motion.p>

          {/* Clean 1-Click Persona Quick Launch (Not Clumsy) */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="pt-2 space-y-3"
          >
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center justify-center gap-1.5">
              <Zap className="h-3.5 w-3.5 text-amber-500" />
              <span>1-Click Interactive Demo</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl mx-auto">
              {DEMO_PERSONAS.map((persona) => {
                const isLoading = demoLoading === persona.role;
                return (
                  <button
                    key={persona.role}
                    disabled={Boolean(demoLoading)}
                    onClick={() => handle1ClickLogin(persona)}
                    className="flex items-center justify-between rounded-xl border border-border/80 bg-card p-3.5 shadow-xs hover:border-primary/60 hover:shadow-md transition-all text-left group disabled:opacity-50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted/60 text-foreground group-hover:text-primary transition-colors">
                        {persona.role === 'ADMIN' && <Shield className="h-4 w-4" />}
                        {persona.role === 'PROJECT_MANAGER' && <Briefcase className="h-4 w-4" />}
                        {persona.role === 'DEVELOPER' && <Terminal className="h-4 w-4" />}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">
                          {persona.name}
                        </div>
                        <div className="text-[11px] text-muted-foreground">
                          {isLoading ? 'Connecting...' : 'Explore Role'}
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-transform" />
                  </button>
                );
              })}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Live Preview Viewports */}
      <section id="demo-preview" className="py-12 md:py-16 border-t border-border/60 bg-muted/20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 space-y-8">
          <div className="text-center space-y-2 max-w-xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Explore Dashboard Viewports
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Select a view to inspect how the interface adapts per persona.
            </p>
          </div>

          {/* Minimal Tab Switcher */}
          <div className="flex flex-wrap items-center justify-center gap-2 max-w-xl mx-auto">
            {SHOWCASE_TABS.map((tab) => {
              const isActive = tab.id === activeTabId;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTabId(tab.id)}
                  className={`rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-xs'
                      : 'bg-card border border-border/80 text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {tab.title}
                </button>
              );
            })}
          </div>

          {/* Preview Window Component */}
          <DashboardPreviewMockup tab={activeTab} />
        </div>
      </section>

      {/* Engineering Capabilities Grid */}
      <section id="features" className="py-16 md:py-20 border-t border-border/60">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 space-y-12">
          <div className="text-center space-y-2 max-w-xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Core Technical Capabilities
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Production software engineering highlights built into the platform.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {RECRUITER_HIGHLIGHTS.map((hl, i) => (
              <div
                key={i}
                className="rounded-2xl border border-border/80 bg-card p-6 shadow-xs space-y-4 hover:border-primary/50 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    {i === 0 && <Radio className="h-5 w-5" />}
                    {i === 1 && <Shield className="h-5 w-5" />}
                    {i === 2 && <Layers className="h-5 w-5" />}
                    {i === 3 && <Code2 className="h-5 w-5" />}
                  </div>
                  <span className="text-base font-bold text-foreground">{hl.metric}</span>
                </div>

                <div className="space-y-1">
                  <h3 className="font-bold text-sm text-foreground">{hl.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{hl.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Clean Role Personas Grid */}
      <section id="personas" className="py-16 md:py-20 border-t border-border/60 bg-muted/20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 space-y-12">
          <div className="text-center space-y-2 max-w-xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Three Distinct Roles (RBAC)
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Strict view isolation and permission boundaries enforced end-to-end.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {DEMO_PERSONAS.map((persona) => {
              const isLoading = demoLoading === persona.role;
              return (
                <div
                  key={persona.role}
                  className="rounded-2xl border border-border/80 bg-card p-6 shadow-xs flex flex-col justify-between space-y-6 hover:border-primary/50 transition-all"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-primary">{persona.name}</span>
                      <span className="text-[11px] text-muted-foreground font-mono">
                        {persona.email}
                      </span>
                    </div>

                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {persona.description}
                    </p>

                    <div className="space-y-2 border-t border-border/50 pt-4">
                      <div className="text-[11px] font-semibold text-foreground">Included:</div>
                      <ul className="space-y-1.5 text-xs text-muted-foreground">
                        {persona.features.map((feat, fIdx) => (
                          <li key={fIdx} className="flex items-start gap-2">
                            <span className="text-primary font-bold">•</span>
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <button
                    disabled={Boolean(demoLoading)}
                    onClick={() => handle1ClickLogin(persona)}
                    className="w-full h-10 rounded-xl bg-primary text-white font-semibold text-xs hover:bg-primary/90 transition shadow-xs flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <span>{isLoading ? 'Connecting...' : `Test as ${persona.name}`}</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Tech Stack Grid */}
      <section id="architecture" className="py-16 border-t border-border/60">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 space-y-8">
          <div className="text-center space-y-2 max-w-xl mx-auto">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground">Technology Stack</h2>
            <p className="text-xs text-muted-foreground">
              Modern full-stack libraries powering the dashboard.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {TECH_STACK.map((group, idx) => (
              <div
                key={idx}
                className="rounded-xl border border-border/80 bg-card p-5 space-y-3 shadow-xs"
              >
                <div className="text-xs font-bold text-foreground flex items-center gap-2">
                  <Code2 className="h-4 w-4 text-primary" />
                  {group.category}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {group.items.map((item, itemIdx) => (
                    <span
                      key={itemIdx}
                      className="rounded-md bg-muted/60 px-2 py-1 text-[11px] font-medium text-foreground"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Clean Footer */}
      <footer className="border-t border-border/60 bg-card py-10">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-white">
              <Logo className="h-4 w-4" />
            </div>
            <span className="font-semibold text-foreground">AgencyFlow Dashboard</span>
          </div>

          <div className="flex items-center gap-6">
            <Link to="/login" className="hover:text-foreground transition-colors">
              Sign In
            </Link>
            <a href="#demo-preview" className="hover:text-foreground transition-colors">
              Preview
            </a>
            <button onClick={toggleTheme} className="hover:text-foreground transition-colors">
              {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
