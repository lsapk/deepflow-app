
import React, { ReactNode, useEffect, useState } from 'react';
import { NavigationBar } from './NavigationBar';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import { FeaturePanel } from './FeaturePanel';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/services/firebase';

interface MainLayoutProps {
  children: ReactNode;
  requireAuth?: boolean;
}

export const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  requireAuth = true,
}) => {
  const { currentUser, loading } = useAuth();
  const [displayName, setDisplayName] = useState<string>('');

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (currentUser?.uid) {
        try {
          const userProfileRef = doc(db, "userProfiles", currentUser.uid);
          const userProfileSnap = await getDoc(userProfileRef);
          
          if (userProfileSnap.exists()) {
            const data = userProfileSnap.data();
            setDisplayName(data.displayName || currentUser.displayName || 'Utilisateur');
          } else {
            // Créer un profil s'il n'existe pas encore
            const defaultName = currentUser.displayName || 'Utilisateur';
            await setDoc(userProfileRef, {
              displayName: defaultName,
              email: currentUser.email,
              bio: '',
              photoURL: currentUser.photoURL || '',
              createdAt: new Date(),
              lastActive: new Date(),
            });
            setDisplayName(defaultName);
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
          setDisplayName(currentUser.displayName || 'Utilisateur');
        }
      }
    };

    if (currentUser) {
      fetchUserProfile();
    }
  }, [currentUser]);

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
        {!loading && currentUser && (
          <div className="mb-6">
            <h2 className="text-2xl font-bold">Bonjour, {displayName}</h2>
          </div>
        )}
        {children}
      </main>
      
      <Toaster position="top-right" />
    </div>
  );
};
