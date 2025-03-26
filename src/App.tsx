
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { ThemeProvider } from "next-themes"; 
import LandingPage from "./pages/LandingPage";
import SignInPage from "./pages/SignInPage";
import SignUpPage from "./pages/SignUpPage";
import Dashboard from "./pages/Dashboard";
import TasksPage from "./pages/TasksPage";
import HabitsPage from "./pages/HabitsPage";
import FocusPage from "./pages/FocusPage";
import JournalPage from "./pages/JournalPage";
import GoalsPage from "./pages/GoalsPage";
import PlanningPage from "./pages/PlanningPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import ProfilePage from "./pages/ProfilePage";
import SettingsPage from "./pages/SettingsPage";
import NotFound from "./pages/NotFound";
import { useEffect } from "react";
import { MainLayout } from "./components/layout/MainLayout";

// Create a new QueryClient
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Component to protect authenticated routes
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { currentUser, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (!currentUser) {
    return <Navigate to="/signin" replace />;
  }
  
  return <>{children}</>;
};

// Component to redirect already logged in users
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { currentUser, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (currentUser) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
};

const AppRoutes = () => {
  // Apply mobile viewport height fix
  useEffect(() => {
    // Fix for mobile viewport height
    const setVh = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };

    setVh();
    window.addEventListener('resize', setVh);
    
    return () => {
      window.removeEventListener('resize', setVh);
    };
  }, []);

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      
      {/* Public routes (accessible only when not logged in) */}
      <Route path="/signin" element={
        <PublicRoute>
          <SignInPage />
        </PublicRoute>
      } />
      <Route path="/signup" element={
        <PublicRoute>
          <SignUpPage />
        </PublicRoute>
      } />
      
      {/* Protected routes (require authentication) */}
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <MainLayout>
            <Dashboard />
          </MainLayout>
        </ProtectedRoute>
      } />
      <Route path="/tasks" element={
        <ProtectedRoute>
          <MainLayout>
            <TasksPage />
          </MainLayout>
        </ProtectedRoute>
      } />
      <Route path="/habits" element={
        <ProtectedRoute>
          <MainLayout>
            <HabitsPage />
          </MainLayout>
        </ProtectedRoute>
      } />
      <Route path="/focus" element={
        <ProtectedRoute>
          <MainLayout>
            <FocusPage />
          </MainLayout>
        </ProtectedRoute>
      } />
      <Route path="/journal" element={
        <ProtectedRoute>
          <MainLayout>
            <JournalPage />
          </MainLayout>
        </ProtectedRoute>
      } />
      <Route path="/goals" element={
        <ProtectedRoute>
          <MainLayout>
            <GoalsPage />
          </MainLayout>
        </ProtectedRoute>
      } />
      <Route path="/planning" element={
        <ProtectedRoute>
          <MainLayout>
            <PlanningPage />
          </MainLayout>
        </ProtectedRoute>
      } />
      <Route path="/analytics" element={
        <ProtectedRoute>
          <MainLayout>
            <AnalyticsPage />
          </MainLayout>
        </ProtectedRoute>
      } />
      <Route path="/profile" element={
        <ProtectedRoute>
          <MainLayout>
            <ProfilePage />
          </MainLayout>
        </ProtectedRoute>
      } />
      <Route path="/settings" element={
        <ProtectedRoute>
          <MainLayout>
            <SettingsPage />
          </MainLayout>
        </ProtectedRoute>
      } />
      
      {/* Catch-all route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => {
  // Apply responsive styles
  useEffect(() => {
    // Add CSS variables to control responsive behavior
    const style = document.createElement('style');
    style.innerHTML = `
      :root {
        --vh: 1vh;
      }
      
      @media (max-width: 640px) {
        body {
          overscroll-behavior: none;
        }
        
        .min-h-screen {
          min-height: calc(var(--vh, 1vh) * 100);
        }
      }
      
      /* Improve mobile scrolling */
      .overflow-y-auto {
        -webkit-overflow-scrolling: touch;
      }
      
      /* Add responsive padding */
      @media (max-width: 640px) {
        .sm-p-responsive {
          padding: 1rem !important;
        }
        
        .card-mobile-compact {
          padding: 1rem !important;
        }
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <TooltipProvider>
          <BrowserRouter>
            <AuthProvider>
              <Toaster />
              <Sonner position="top-right" />
              <AppRoutes />
            </AuthProvider>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
