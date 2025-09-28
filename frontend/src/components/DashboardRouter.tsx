import React from 'react';
import { FarmerDashboardPage } from '../pages/FarmerDashboardPage';
import { ResearcherDashboardPage } from '../pages/ResearcherDashboardPage';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'farmer' | 'researcher' | 'student' | 'consultant';
  [key: string]: any;
}

interface DashboardRouterProps {
  user: User;
}

export const DashboardRouter: React.FC<DashboardRouterProps> = ({ user }) => {
  // Determine which dashboard to show based on user role
  switch (user.role) {
    case 'farmer':
      return <FarmerDashboardPage />;
    case 'researcher':
    case 'student':
    case 'consultant':
      return <ResearcherDashboardPage />;
    default:
      // Default to farmer dashboard if no role specified
      return <FarmerDashboardPage />;
  }
};

export default DashboardRouter;