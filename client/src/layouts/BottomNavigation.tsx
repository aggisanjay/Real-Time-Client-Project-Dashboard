import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FolderKanban, CheckSquare, Users, Activity } from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';

export const BottomNavigation: React.FC = () => {
  const { user } = useAuth();
  if (!user) return null;

  const role = user.role;

  const getLinks = () => {
    if (role === 'ADMIN') {
      return [
        { to: '/admin', label: 'Overview', icon: <LayoutDashboard className="h-5 w-5" /> },
        { to: '/admin/projects', label: 'Projects', icon: <FolderKanban className="h-5 w-5" /> },
        { to: '/admin/tasks', label: 'Kanban', icon: <CheckSquare className="h-5 w-5" /> },
        { to: '/admin/users', label: 'Users', icon: <Users className="h-5 w-5" /> },
      ];
    }
    if (role === 'PROJECT_MANAGER') {
      return [
        { to: '/pm', label: 'My Projects', icon: <FolderKanban className="h-5 w-5" /> },
        { to: '/pm/board', label: 'Team Board', icon: <CheckSquare className="h-5 w-5" /> },
        { to: '/pm/activity', label: 'Feed', icon: <Activity className="h-5 w-5" /> },
      ];
    }
    return [
      { to: '/dev', label: 'My Tasks', icon: <CheckSquare className="h-5 w-5" /> },
      { to: '/dev/activity', label: 'My Feed', icon: <Activity className="h-5 w-5" /> },
    ];
  };

  const links = getLinks();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 flex h-16 items-center justify-around border-t border-border/80 bg-card/90 backdrop-blur-xl md:hidden">
      {links.map((link) => (
        <NavLink
          key={link.to}
          to={link.to}
          end
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 text-[10px] font-medium transition-colors ${
              isActive ? 'text-primary font-bold' : 'text-muted-foreground hover:text-foreground'
            }`
          }
        >
          {link.icon}
          <span>{link.label}</span>
        </NavLink>
      ))}
    </nav>
  );
};
