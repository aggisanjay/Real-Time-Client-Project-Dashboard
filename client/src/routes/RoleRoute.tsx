import React from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import { Role } from '../types/index.js';
import { AccessDenied } from './AccessDenied.js';

interface RoleRouteProps {
  allowedRoles: Role[];
}

export const RoleRoute: React.FC<RoleRouteProps> = ({ allowedRoles }) => {
  const { user } = useAuth();

  if (!user || !allowedRoles.includes(user.role)) {
    return <AccessDenied />;
  }

  return <Outlet />;
};
