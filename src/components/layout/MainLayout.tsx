
import React, { ReactNode, useEffect, useState } from 'react';
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
  const { currentUser, loading, userProfile } = useAuth();
  const [displayName, setDisplayName] = useState<string>('');

  useEffect(() => {
    if (currentUser) {
      // Si nous avons déjà un profil d'utilisateur dans le contexte d'authentification
      if (userProfile) {
        setDisplayName(userProfile.display_name || currentUser.displayName || 'Utilisateur');
      } else {
        // Sinon, nous utilisons le displayName de l'utilisateur
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
    <div className="flex flex-col min-h-screen bg-background">
      <NavigationBar userName={displayName} />
      <FeaturePanel />
      
      <main className="flex-1 py-6 pt-20 px-4 md:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        {children}
      </main>
      
      <Toaster position="top-right" toastOptions={{ duration: 0 }} />
    </div>
  );
}
