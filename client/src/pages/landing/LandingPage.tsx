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
  Code2,
  Phone,
  Mail,
  MapPin,
  Check,
  Globe,
  Share2,
  Users
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
    <div className="min-h-screen bg-background text-foreground selection:bg-primary selection:text-white transition-colors duration-300 font-sans">
      
      {/* Top Utility Announcement Bar (Vibrant Blue matching reference) */}
      <div className="w-full bg-[#1865F2] text-white text-[11px] font-medium py-2 px-4 sm:px-8 border-b border-blue-600/30">
        <div className="mx-auto max-w-7xl flex flex-wrap items-center justify-between gap-3">
          {/* Left Contact Details */}
          <div className="flex flex-wrap items-center gap-6">
            <span className="flex items-center gap-1.5 hover:opacity-90 transition-opacity">
              <Phone className="h-3.5 w-3.5 opacity-90" />
              <span>+1-202-555-0185</span>
            </span>
            <span className="flex items-center gap-1.5 hover:opacity-90 transition-opacity">
              <Mail className="h-3.5 w-3.5 opacity-90" />
              <span>support@agencyflow.com</span>
            </span>
            <span className="hidden md:flex items-center gap-1.5 opacity-90">
              <MapPin className="h-3.5 w-3.5" />
              <span>1234 Enterprise Blvd, Suite 400</span>
            </span>
          </div>

          {/* Right Social Links & Presence */}
          <div className="flex items-center gap-4">
            <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-0.5 text-[10px] font-semibold">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Socket.IO Connected
            </span>
            <div className="flex items-center gap-3 text-white/90">
              <Globe className="h-3.5 w-3.5 hover:text-white cursor-pointer transition-colors" />
              <Share2 className="h-3.5 w-3.5 hover:text-white cursor-pointer transition-colors" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <header className="sticky top-0 z-50 w-full border-b border-border/70 bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-4 sm:px-8">
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center gap-3 transition hover:opacity-95">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1865F2] text-white shadow-md shadow-blue-500/20">
              <Logo className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-lg tracking-tight text-foreground">
                AgencyFlow
              </span>
              <span className="text-[10px] font-medium text-muted-foreground -mt-1">
                Client Project Intelligence
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-muted-foreground">
            <a href="#hero" className="hover:text-primary transition-colors">
              Home
            </a>
            <a href="#demo-preview" className="hover:text-primary transition-colors">
              Live Showcase
            </a>
            <a href="#features" className="hover:text-primary transition-colors">
              Capabilities
            </a>
            <a href="#personas" className="hover:text-primary transition-colors">
              Role Access
            </a>
            <a href="#architecture" className="hover:text-primary transition-colors">
              Tech Stack
            </a>
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-3.5">
            <button
              onClick={toggleTheme}
              aria-label="Toggle Theme"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-border/80 bg-card text-muted-foreground hover:text-foreground hover:bg-muted/50 transition shadow-2xs"
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>

            {user ? (
              <button
                onClick={() => navigate(getRoleDashboardPath(user.role))}
                className="inline-flex items-center gap-2 rounded-full bg-[#1865F2] hover:bg-blue-600 px-6 py-2.5 text-xs font-semibold text-white shadow-md shadow-blue-500/20 transition-all hover:scale-[1.02]"
              >
                <span>Dashboard</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            ) : (
              <Link
                to="/login"
                className="inline-flex items-center rounded-full bg-[#1865F2] hover:bg-blue-600 px-6 py-2.5 text-xs font-semibold text-white shadow-md shadow-blue-500/20 transition-all hover:scale-[1.02]"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section (Styled matching the reference dental/SaaS hero) */}
      <section id="hero" className="relative pt-14 pb-16 md:pt-20 md:pb-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 text-center space-y-7">
          
          {/* Social Proof Pill (Avatars + Trusted by) */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="inline-flex items-center gap-3 rounded-full border border-border/80 bg-card px-4 py-1.5 shadow-xs"
          >
            {/* 3 Avatar Circle Stack */}
            <div className="flex -space-x-2">
              <div className="h-6 w-6 rounded-full bg-blue-500 text-white font-bold text-[9px] flex items-center justify-center ring-2 ring-background">
                A
              </div>
              <div className="h-6 w-6 rounded-full bg-indigo-500 text-white font-bold text-[9px] flex items-center justify-center ring-2 ring-background">
                S
              </div>
              <div className="h-6 w-6 rounded-full bg-emerald-500 text-white font-bold text-[9px] flex items-center justify-center ring-2 ring-background">
                M
              </div>
            </div>
            <span className="text-xs font-semibold text-foreground">
              Trusted by 10,000+ Teams & Leaders
            </span>
          </motion.div>

          {/* Main Headline with Serif Accent word */}
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.1 }}
            className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-foreground leading-[1.12]"
          >
            Where Engineering Meets<br className="hidden sm:inline" /> Your{' '}
            <span className="font-serif italic font-normal text-[#1865F2]">
              Perfect Flow.
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.2 }}
            className="mx-auto max-w-2xl text-sm sm:text-base text-muted-foreground leading-relaxed font-normal"
          >
            Advanced, real-time client project intelligence delivered by bi-directional
            WebSocket state synchronicity and strict multi-tier RBAC you can trust.
          </motion.p>

          {/* Two Hero Pill Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.3 }}
            className="flex flex-wrap items-center justify-center gap-3 pt-2"
          >
            <Link
              to="/login"
              className="inline-flex items-center gap-2 rounded-full bg-[#1865F2] hover:bg-blue-600 px-8 py-3.5 text-xs font-semibold text-white shadow-lg shadow-blue-500/25 transition-all hover:scale-[1.02]"
            >
              <span>Get Started</span>
              <ArrowRight className="h-4 w-4" />
            </Link>

            <a
              href="#demo-preview"
              className="inline-flex items-center rounded-full border border-border bg-card px-7 py-3.5 text-xs font-semibold text-foreground hover:bg-muted/40 transition-all shadow-xs"
            >
              View Dashboards
            </a>
          </motion.div>

          {/* Three Trust Checkmarks */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.45, delay: 0.4 }}
            className="flex flex-wrap items-center justify-center gap-6 pt-3 text-xs text-muted-foreground font-medium"
          >
            <div className="flex items-center gap-1.5">
              <Check className="h-4 w-4 text-primary stroke-[2.5]" />
              <span>Zero-Refresh Sync</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Check className="h-4 w-4 text-primary stroke-[2.5]" />
              <span>Multi-Role RBAC</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Check className="h-4 w-4 text-primary stroke-[2.5]" />
              <span>Enterprise Telemetry</span>
            </div>
          </motion.div>

          {/* 1-Click Persona Fast Pass Bar */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.45 }}
            className="pt-6"
          >
            <div className="max-w-2xl mx-auto rounded-2xl border border-border/80 bg-card/90 p-4 shadow-sm space-y-3">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Zap className="h-3.5 w-3.5 text-amber-500" />
                  1-Click Interactive Persona Demo
                </span>
                <span className="text-[11px] text-primary font-medium">Instant Access</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {DEMO_PERSONAS.map((persona) => {
                  const isLoading = demoLoading === persona.role;
                  return (
                    <button
                      key={persona.role}
                      disabled={Boolean(demoLoading)}
                      onClick={() => handle1ClickLogin(persona)}
                      className="flex items-center justify-between rounded-xl border border-border/80 bg-muted/25 p-3 hover:bg-muted/60 hover:border-primary/50 transition-all text-left group disabled:opacity-50"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white dark:bg-muted text-primary shadow-xs">
                          {persona.role === 'ADMIN' && <Shield className="h-4 w-4 text-rose-500" />}
                          {persona.role === 'PROJECT_MANAGER' && <Briefcase className="h-4 w-4 text-amber-500" />}
                          {persona.role === 'DEVELOPER' && <Terminal className="h-4 w-4 text-emerald-500" />}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">
                            {persona.name}
                          </div>
                          <div className="text-[10px] text-muted-foreground">
                            {isLoading ? 'Loading...' : 'Test Drive'}
                          </div>
                        </div>
                      </div>
                      <ArrowRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>

        </div>
      </section>

      {/* Live Preview Viewports with Real Screenshots */}
      <section id="demo-preview" className="py-14 md:py-20 border-t border-border/70 bg-muted/20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 space-y-8">
          <div className="text-center space-y-2 max-w-xl mx-auto">
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-foreground">
              Explore Live Dashboard Views
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground font-normal">
              Switch between tabs below to inspect how the interface adapts per persona.
            </p>
          </div>

          {/* Minimal Tab Switcher with Pill styling */}
          <div className="flex flex-wrap items-center justify-center gap-2 max-w-2xl mx-auto">
            {SHOWCASE_TABS.map((tab) => {
              const isActive = tab.id === activeTabId;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTabId(tab.id)}
                  className={`rounded-full px-5 py-2.5 text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-[#1865F2] text-white shadow-md shadow-blue-500/20'
                      : 'bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-muted/40'
                  }`}
                >
                  {tab.title}
                </button>
              );
            })}
          </div>

          {/* High-Resolution Screenshot Frame */}
          <DashboardPreviewMockup tab={activeTab} />
        </div>
      </section>

      {/* Core Capabilities */}
      <section id="features" className="py-16 md:py-24 border-t border-border/70">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 space-y-12">
          <div className="text-center space-y-2 max-w-xl mx-auto">
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-foreground">
              Core Technical Capabilities
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground font-normal">
              High-performance full-stack engineering highlights built into the platform.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {RECRUITER_HIGHLIGHTS.map((hl, i) => (
              <div
                key={i}
                className="rounded-2xl border border-border/80 bg-card p-6 shadow-xs space-y-4 hover:border-primary/50 transition-all hover:shadow-md"
              >
                <div className="flex items-center justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950/40 text-primary">
                    {i === 0 && <Radio className="h-5 w-5" />}
                    {i === 1 && <Shield className="h-5 w-5" />}
                    {i === 2 && <Layers className="h-5 w-5" />}
                    {i === 3 && <Code2 className="h-5 w-5" />}
                  </div>
                  <span className="text-base font-extrabold text-foreground">{hl.metric}</span>
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

      {/* Role Personas (RBAC) */}
      <section id="personas" className="py-16 md:py-24 border-t border-border/70 bg-muted/20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 space-y-12">
          <div className="text-center space-y-2 max-w-xl mx-auto">
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-foreground">
              Three Distinct Roles (RBAC)
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground font-normal">
              Strict view isolation and permission boundaries enforced end-to-end.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {DEMO_PERSONAS.map((persona) => {
              const isLoading = demoLoading === persona.role;
              return (
                <div
                  key={persona.role}
                  className="rounded-2xl border border-border/80 bg-card p-7 shadow-xs flex flex-col justify-between space-y-6 hover:border-primary/50 transition-all hover:shadow-md"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-primary">{persona.name}</span>
                      <span className="text-[11px] text-muted-foreground font-mono">
                        {persona.email}
                      </span>
                    </div>

                    <p className="text-xs text-muted-foreground leading-relaxed font-normal">
                      {persona.description}
                    </p>

                    <div className="space-y-2 border-t border-border/60 pt-4">
                      <div className="text-[11px] font-bold text-foreground uppercase tracking-wider">
                        Included Features:
                      </div>
                      <ul className="space-y-1.5 text-xs text-muted-foreground">
                        {persona.features.map((feat, fIdx) => (
                          <li key={fIdx} className="flex items-start gap-2">
                            <Check className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <button
                    disabled={Boolean(demoLoading)}
                    onClick={() => handle1ClickLogin(persona)}
                    className="w-full h-11 rounded-full bg-[#1865F2] hover:bg-blue-600 text-white font-semibold text-xs transition shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <span>{isLoading ? 'Authenticating...' : `Explore as ${persona.name}`}</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Tech Stack Grid */}
      <section id="architecture" className="py-16 border-t border-border/70">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 space-y-8">
          <div className="text-center space-y-2 max-w-xl mx-auto">
            <h2 className="text-xl sm:text-3xl font-extrabold text-foreground">Technology Stack</h2>
            <p className="text-xs text-muted-foreground">
              Modern full-stack libraries powering the dashboard.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {TECH_STACK.map((group, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-border/80 bg-card p-5 space-y-3 shadow-xs"
              >
                <div className="text-xs font-bold text-foreground flex items-center gap-2">
                  <Code2 className="h-4 w-4 text-primary" />
                  {group.category}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {group.items.map((item, itemIdx) => (
                    <span
                      key={itemIdx}
                      className="rounded-md bg-muted/60 px-2.5 py-1 text-[11px] font-medium text-foreground"
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

      {/* Footer */}
      <footer className="border-t border-border/70 bg-card py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-muted-foreground">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#1865F2] text-white">
              <Logo className="h-4 w-4" />
            </div>
            <div>
              <span className="font-bold text-foreground">AgencyFlow Dashboard</span>
              <p className="text-[11px]">Real-time client project intelligence & telemetry.</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <Link to="/login" className="hover:text-foreground transition-colors font-medium">
              Demo Portal
            </Link>
            <a href="#demo-preview" className="hover:text-foreground transition-colors font-medium">
              Live Showcase
            </a>
            <button onClick={toggleTheme} className="hover:text-foreground transition-colors font-medium">
              {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
            </button>
          </div>
        </div>
      </footer>

    </div>
  );
};
