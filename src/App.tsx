
import React from "react";
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
import ProfilePage from "./pages/ProfilePage";
import SettingsPage from "./pages/SettingsPage";
import NotFound from "./pages/NotFound";
import { useEffect } from "react";

// Create a new QueryClient with better error handling
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 60000, // 1 minute
      gcTime: 5 * 60 * 1000, // 5 minutes
      meta: {
        errorHandler: (error: Error) => {
          console.error("Query error:", error);
        }
      }
    },
    mutations: {
      meta: {
        errorHandler: (error: Error) => {
          console.error("Mutation error:", error);
        }
      }
    }
  },
});

const App: React.FC = () => {
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
    <BrowserRouter>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              
              {/* Public routes */}
              <Route path="/signin" element={<SignInPage />} />
              <Route path="/signup" element={<SignUpPage />} />
              
              {/* Protected routes */}
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/tasks" element={<TasksPage />} />
              <Route path="/habits" element={<HabitsPage />} />
              <Route path="/focus" element={<FocusPage />} />
              <Route path="/journal" element={<JournalPage />} />
              <Route path="/goals" element={<GoalsPage />} />
              <Route path="/planning" element={<PlanningPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/settings" element={<SettingsPage />} />
              
              {/* Redirection pour l'ancienne route analytics */}
              <Route path="/analytics" element={<Navigate to="/dashboard" replace />} />
              
              {/* Catch-all route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
};

export default App;
