
import React, { ReactNode } from 'react';
import { NavigationBar } from './NavigationBar';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import { FeaturePanel } from './FeaturePanel';

interface MainLayoutProps {
  children: ReactNode;
  requireAuth?: boolean;
}

export const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  requireAuth = true,
}) => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (requireAuth && !currentUser) {
    return <Navigate to="/signin" />;
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <NavigationBar />
      <FeaturePanel />
      
      <main className="flex-1 py-6 px-4 md:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        {children}
      </main>
      
      <Toaster position="top-right" />
    </div>
  );
};
