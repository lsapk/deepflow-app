
import React, { ReactNode } from 'react';
import { NavigationBar } from './NavigationBar';
import { cn } from "@/lib/utils";

interface MainLayoutProps {
  children: ReactNode;
  className?: string;
  fullWidth?: boolean;
}

export const MainLayout = ({ 
  children, 
  className, 
  fullWidth = false 
}: MainLayoutProps) => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <NavigationBar />
      
      <main className={cn(
        "pt-20 px-4 pb-8 mx-auto sm:px-6 lg:px-8 overflow-x-hidden", 
        fullWidth ? "w-full" : "max-w-7xl",
        className
      )}>
        {children}
      </main>
    </div>
  );
};
