
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
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

// Create a new QueryClient with better error handling
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 60000, // 1 minute
      gcTime: 5 * 60 * 1000, // 5 minutes
      onError: (error) => {
        console.error("Query error:", error);
      }
    },
    mutations: {
      onError: (error) => {
        console.error("Mutation error:", error);
      }
    }
  },
});

const App = () => {
  // Apply responsive styles
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
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <TooltipProvider>
          <BrowserRouter>
            <AuthProvider>
              <Toaster />
              <Sonner position="top-right" />
              <Routes>
                <Route path="/" element={<LandingPage />} />
                
                {/* Public routes */}
                <Route path="/signin" element={<SignInPage />} />
                <Route path="/signup" element={<SignUpPage />} />
                
                {/* Protected routes */}
                <Route path="/dashboard" element={
                  <MainLayout>
                    <Dashboard />
                  </MainLayout>
                } />
                <Route path="/tasks" element={
                  <MainLayout>
                    <TasksPage />
                  </MainLayout>
                } />
                <Route path="/habits" element={
                  <MainLayout>
                    <HabitsPage />
                  </MainLayout>
                } />
                <Route path="/focus" element={
                  <MainLayout>
                    <FocusPage />
                  </MainLayout>
                } />
                <Route path="/journal" element={
                  <MainLayout>
                    <JournalPage />
                  </MainLayout>
                } />
                <Route path="/goals" element={
                  <MainLayout>
                    <GoalsPage />
                  </MainLayout>
                } />
                <Route path="/planning" element={
                  <MainLayout>
                    <PlanningPage />
                  </MainLayout>
                } />
                <Route path="/analytics" element={
                  <MainLayout>
                    <AnalyticsPage />
                  </MainLayout>
                } />
                <Route path="/profile" element={
                  <MainLayout>
                    <ProfilePage />
                  </MainLayout>
                } />
                <Route path="/settings" element={
                  <MainLayout>
                    <SettingsPage />
                  </MainLayout>
                } />
                
                {/* Catch-all route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </AuthProvider>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
