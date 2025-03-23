
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { logoutUser } from '@/services/firebase';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Bell, 
  Calendar, 
  CheckSquare, 
  ClipboardList, 
  Home, 
  LayoutDashboard, 
  LogOut, 
  Menu, 
  MessageCircle, 
  Moon, 
  Settings, 
  Sun, 
  Target, 
  User,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout = ({ children }: MainLayoutProps) => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);

  useEffect(() => {
    // Vérifier si l'utilisateur est authentifié
    if (!currentUser) {
      navigate('/signin');
    } else {
      setIsPageLoading(false);
    }

    // Vérifier si on est sur mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, [currentUser, navigate]);

  const handleLogout = async () => {
    try {
      await logoutUser();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  // Animation variants for sidebar items
  const sidebarItemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: (i: number) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: 0.1 * i,
      },
    }),
  };

  const menuItems = [
    { 
      icon: <LayoutDashboard size={20} />, 
      label: 'Tableau de bord', 
      path: '/dashboard' 
    },
    { 
      icon: <CheckSquare size={20} />, 
      label: 'Tâches', 
      path: '/tasks' 
    },
    { 
      icon: <Calendar size={20} />, 
      label: 'Habitudes', 
      path: '/habits' 
    },
    { 
      icon: <MessageCircle size={20} />, 
      label: 'Journal', 
      path: '/journal' 
    },
    { 
      icon: <Target size={20} />, 
      label: 'Objectifs', 
      path: '/goals' 
    },
    { 
      icon: <Zap size={20} />, 
      label: 'Focus', 
      path: '/focus' 
    },
    { 
      icon: <ClipboardList size={20} />, 
      label: 'Statistiques', 
      path: '/stats' 
    },
  ];

  if (isPageLoading) {
    return (
      <div className="page-loading">
        <div className="loader"></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex ${isDarkMode ? 'dark' : ''}`}>
      {/* Sidebar pour desktop */}
      <AnimatePresence>
        {!isMobile && (
          <motion.aside
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="hidden md:flex w-64 flex-col bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800"
          >
            <div className="p-6">
              <h1 className="text-2xl font-bold">DeepFlow</h1>
            </div>
            
            <nav className="flex-1 p-4 space-y-1">
              {menuItems.map((item, index) => (
                <motion.a
                  key={item.label}
                  href={item.path}
                  custom={index}
                  initial="hidden"
                  animate="visible"
                  variants={sidebarItemVariants}
                  className="flex items-center py-2 px-4 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <span className="mr-3">{item.icon}</span>
                  {item.label}
                </motion.a>
              ))}
            </nav>
            
            <div className="p-4 border-t border-gray-200 dark:border-gray-800">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleDarkMode}
                className="w-full justify-start mb-4"
              >
                {isDarkMode ? <Sun size={16} className="mr-2" /> : <Moon size={16} className="mr-2" />}
                {isDarkMode ? 'Mode clair' : 'Mode sombre'}
              </Button>
              
              <div className="flex items-center p-2">
                <Avatar className="h-9 w-9 mr-3">
                  <AvatarImage src="" />
                  <AvatarFallback>{currentUser?.displayName?.charAt(0) || 'U'}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate dark:text-gray-200">
                    {currentUser?.displayName || 'Utilisateur'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {currentUser?.email}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleLogout}
                  className="h-8 w-8 text-gray-600 dark:text-gray-400"
                >
                  <LogOut size={16} />
                </Button>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Mobile responsive layout */}
      <div className="flex-1 flex flex-col">
        <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 py-3 px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Mobile menu */}
              {isMobile && (
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <Menu size={20} />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-3/4 p-0">
                    <div className="p-6 border-b border-gray-200 dark:border-gray-800">
                      <h1 className="text-2xl font-bold">DeepFlow</h1>
                    </div>
                    
                    <nav className="p-4 space-y-1">
                      {menuItems.map((item) => (
                        <a
                          key={item.label}
                          href={item.path}
                          className="flex items-center py-2 px-4 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        >
                          <span className="mr-3">{item.icon}</span>
                          {item.label}
                        </a>
                      ))}
                    </nav>
                    
                    <div className="p-4 mt-auto border-t border-gray-200 dark:border-gray-800">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={toggleDarkMode}
                        className="w-full justify-start mb-4"
                      >
                        {isDarkMode ? <Sun size={16} className="mr-2" /> : <Moon size={16} className="mr-2" />}
                        {isDarkMode ? 'Mode clair' : 'Mode sombre'}
                      </Button>
                      
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={handleLogout}
                        className="w-full"
                      >
                        <LogOut size={16} className="mr-2" />
                        Déconnexion
                      </Button>
                    </div>
                  </SheetContent>
                </Sheet>
              )}
              
              {isMobile && <h1 className="text-xl font-bold">DeepFlow</h1>}
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-600 dark:text-gray-400"
              >
                <Bell size={20} />
              </Button>
              
              {isMobile && (
                <Avatar className="h-8 w-8">
                  <AvatarImage src="" />
                  <AvatarFallback>{currentUser?.displayName?.charAt(0) || 'U'}</AvatarFallback>
                </Avatar>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 overflow-auto bg-gray-50 dark:bg-gray-950">
          <AnimatePresence mode="wait">
            <motion.div
              key={window.location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};
