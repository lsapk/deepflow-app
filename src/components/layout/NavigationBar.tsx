
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/common/Logo';
import { useAuth } from '@/contexts/AuthContext';
import { 
  BarChart3, 
  Calendar, 
  CheckSquare, 
  Clock, 
  File, 
  Home, 
  List, 
  LogOut, 
  Menu, 
  Moon, 
  Settings, 
  Sun, 
  Target, 
  User, 
  X 
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { motion, AnimatePresence } from 'framer-motion';
import { ScrollArea } from '@/components/ui/scroll-area';

interface NavItem {
  name: string;
  path: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  { name: 'Tableau de bord', path: '/dashboard', icon: <Home size={20} /> },
  { name: 'Tâches', path: '/tasks', icon: <CheckSquare size={20} /> },
  { name: 'Habitudes', path: '/habits', icon: <List size={20} /> },
  { name: 'Focus', path: '/focus', icon: <Clock size={20} /> },
  { name: 'Journal', path: '/journal', icon: <File size={20} /> },
  { name: 'Objectifs', path: '/goals', icon: <Target size={20} /> },
  { name: 'Planification', path: '/planning', icon: <Calendar size={20} /> },
  { name: 'Analyse', path: '/analytics', icon: <BarChart3 size={20} /> },
];

export const NavigationBar = () => {
  const { currentUser, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [scrollLocked, setScrollLocked] = useState(false);

  // Effect to handle body scroll lock when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
      setScrollLocked(true);
    } else {
      document.body.style.overflow = '';
      setScrollLocked(false);
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  const toggleDarkMode = () => {
    // Toggle dark mode
    setIsDarkMode(!isDarkMode);
    
    if (isDarkMode) {
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
    }
  };
  
  const initials = currentUser?.displayName
    ? currentUser.displayName
        .split(' ')
        .map(part => part.charAt(0))
        .join('')
        .toUpperCase()
    : 'U';

  const navigateToProfile = () => {
    navigate('/profile');
    setIsMobileMenuOpen(false);
  };

  const navigateToSettings = () => {
    navigate('/settings');
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* Desktop Navigation */}
      <div className="hidden lg:flex fixed top-0 left-0 right-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 h-16">
        <div className="container mx-auto px-4 flex items-center justify-between h-full">
          <div className="flex items-center">
            <Logo size="sm" className="mr-8" textColor="text-primary dark:text-white" />
            
            <nav className="flex space-x-1">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`px-3 py-2 rounded-md text-sm font-medium flex items-center ${
                      isActive
                        ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                        : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                    }`}
                  >
                    <span className="mr-2">{item.icon}</span>
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleDarkMode}
              className="text-gray-700 dark:text-gray-300"
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar>
                    <AvatarImage src={currentUser?.photoURL || undefined} alt={currentUser?.displayName || 'Utilisateur'} />
                    <AvatarFallback>{initials}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <DropdownMenuLabel>Mon compte</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={navigateToProfile}>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profil</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={navigateToSettings}>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Paramètres</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => logout()}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Déconnexion</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
      
      {/* Mobile Navigation */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 h-16">
        <div className="flex items-center justify-between px-4 h-full">
          <Logo size="sm" textColor="text-primary dark:text-white" />
          
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleDarkMode}
              className="text-gray-700 dark:text-gray-300"
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </Button>
            
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu size={24} />
            </Button>
          </div>
        </div>
      </div>
      
      {/* Mobile Menu with proper scroll handling */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/40"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="absolute right-0 top-0 h-full w-4/5 max-w-sm bg-white dark:bg-gray-900 shadow-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-800">
                <Logo size="sm" textColor="text-primary dark:text-white" />
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <X size={24} />
                </Button>
              </div>
              
              <ScrollArea className="h-[calc(100%-60px)]">
                <div className="p-4">
                  <div className="flex flex-col items-center mb-8">
                    <Avatar className="h-20 w-20 mb-4">
                      <AvatarImage src={currentUser?.photoURL || undefined} alt={currentUser?.displayName || 'Utilisateur'} />
                      <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>
                    <h2 className="text-xl font-bold">{currentUser?.displayName || 'Utilisateur'}</h2>
                    <p className="text-sm text-gray-500">{currentUser?.email}</p>
                  </div>
                  
                  <nav className="space-y-1 mb-6">
                    {navItems.map((item) => {
                      const isActive = location.pathname === item.path;
                      return (
                        <Link
                          key={item.path}
                          to={item.path}
                          className={`px-4 py-3 rounded-md text-sm font-medium flex items-center ${
                            isActive
                              ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                              : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                          }`}
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          <span className="mr-3">{item.icon}</span>
                          {item.name}
                        </Link>
                      );
                    })}
                  </nav>
                  
                  <div className="space-y-2">
                    <Button
                      variant="ghost"
                      className="w-full justify-start px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                      onClick={navigateToProfile}
                    >
                      <User className="mr-3 h-5 w-5" />
                      Profil
                    </Button>
                    
                    <Button
                      variant="ghost"
                      className="w-full justify-start px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                      onClick={navigateToSettings}
                    >
                      <Settings className="mr-3 h-5 w-5" />
                      Paramètres
                    </Button>
                  </div>
                  
                  <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-800">
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                      onClick={() => {
                        logout();
                        setIsMobileMenuOpen(false);
                      }}
                    >
                      <LogOut className="mr-3 h-5 w-5" />
                      Déconnexion
                    </Button>
                  </div>
                </div>
              </ScrollArea>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
