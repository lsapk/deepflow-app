
import React, { ReactNode } from 'react';
import { NavigationBar } from './NavigationBar';

interface MainLayoutProps {
  children: ReactNode;
}

export const MainLayout = ({ children }: MainLayoutProps) => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <NavigationBar />
      
      <main className="pt-20 px-4 pb-8 max-w-7xl mx-auto">
        {children}
      </main>
    </div>
  );
};
