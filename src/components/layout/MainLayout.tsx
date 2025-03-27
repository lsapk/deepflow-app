
import React, { ReactNode, useEffect, useState } from 'react';
import { NavigationBar } from './NavigationBar';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import { FeaturePanel } from './FeaturePanel';
import { toast } from 'sonner';
import { TooltipProvider } from '@/components/ui/tooltip';

interface MainLayoutProps {
  children: ReactNode;
  requireAuth?: boolean;
}

export const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  requireAuth = true,
}) => {
  const { currentUser, loading, userProfile, isOnline } = useAuth();
  const [displayName, setDisplayName] = useState<string>('');

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      const interval = setInterval(() => {
        if (navigator.serviceWorker.controller) {
          navigator.serviceWorker.controller.postMessage({
            type: 'APP_ACTIVE'
          });
        }
      }, 300000);

      return () => clearInterval(interval);
    }
  }, []);

  useEffect(() => {
    if (!isOnline) {
      toast.info(
        "Vous êtes en mode hors ligne. Les modifications seront synchronisées quand vous serez connecté.", 
        { duration: 5000 }
      );
    }
  }, [isOnline]);

  useEffect(() => {
    if (currentUser) {
      if (userProfile) {
        setDisplayName(userProfile.display_name || currentUser.displayName || 'Utilisateur');
      } else {
        setDisplayName(currentUser.displayName || 'Utilisateur');
      }
    }
  }, [currentUser, userProfile]);

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
    <TooltipProvider>
      <div className="flex flex-col min-h-screen bg-background">
        <NavigationBar userName={displayName} />
        <FeaturePanel />
        
        <main className="flex-1 py-6 pt-20 px-4 md:px-6 lg:px-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
        
        {!isOnline && (
          <div className="fixed bottom-0 left-0 right-0 bg-orange-500 text-white p-2 text-center text-sm">
            Mode hors ligne - Vos modifications seront synchronisées lorsque vous serez à nouveau connecté
          </div>
        )}
        
        <Toaster position="top-right" />
      </div>
    </TooltipProvider>
  );
}
