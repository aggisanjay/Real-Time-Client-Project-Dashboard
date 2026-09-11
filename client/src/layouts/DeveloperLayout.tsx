import React, { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { TopNav } from '../components/shared/TopNav.js';
import { BottomNavigation } from './BottomNavigation.js';
import { CheckSquare, Activity, Terminal } from 'lucide-react';

export const DeveloperLayout: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const navItems = [
    { to: '/dev', label: 'My Assigned Tasks', icon: <CheckSquare className="h-4 w-4" />, end: true },
    { to: '/dev/activity', label: 'My Activity Stream', icon: <Activity className="h-4 w-4" /> },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <TopNav onSearchChange={setSearchTerm} />

      <div className="flex flex-1">
        {/* Desktop Dev Sidebar: Flush with page background, border-r hairline */}
        <aside className="hidden w-64 shrink-0 border-r border-border bg-background p-4 md:block">
          <div className="mb-4 flex items-center gap-2 px-3 py-2 rounded-xl bg-secondary border border-border text-foreground">
            <Terminal className="h-4 w-4 shrink-0 text-primary" />
            <span className="text-xs font-bold uppercase tracking-wider">Dev Workspace</span>
          </div>

          <nav className="space-y-1.5">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold transition-colors ${
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-none'
                      : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                  }`
                }
              >
                {item.icon}
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 p-4 pb-20 sm:p-6 md:pb-6 overflow-x-hidden bg-background">
          <Outlet context={{ searchTerm }} />
        </main>
      </div>

      <BottomNavigation />
    </div>
  );
};
