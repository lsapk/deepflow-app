
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger, 
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuGroup
} from '@/components/ui/dropdown-menu';
import { 
  LogOut, Settings, User, Menu, Home, CheckSquare, BookOpen, 
  LineChart, Flame, Bell, Calendar, CheckCheck, Moon, Sun,
  HelpCircle 
} from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Logo } from '@/components/common/Logo';
import { useIsMobile } from '@/hooks/use-mobile';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from 'next-themes';
import { toast } from 'sonner';
import { getUserProfile } from '@/services/userService';

interface NavigationBarProps {
  userName?: string;
}

export const NavigationBar: React.FC<NavigationBarProps> = ({ userName = '' }) => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isMobile = useIsMobile();
  const { theme, setTheme } = useTheme();
  const [notifications, setNotifications] = useState<number>(0);
  const [userPhotoURL, setUserPhotoURL] = useState<string | null>(null);

  useEffect(() => {
    // Charger le profil utilisateur pour obtenir la photo de profil
    const loadUserProfile = async () => {
      if (currentUser?.uid) {
        try {
          const profile = await getUserProfile(currentUser.uid);
          if (profile?.photoURL) {
            setUserPhotoURL(profile.photoURL);
          }
        } catch (error) {
          console.error("Erreur lors du chargement du profil:", error);
        }
      }
    };

    loadUserProfile();
    
    // Simuler des notifications pour la démo
    setNotifications(Math.floor(Math.random() * 5));
  }, [currentUser]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/signin');
    } catch (error) {
      console.error('Erreur de déconnexion', error);
      toast.error("Erreur lors de la déconnexion");
    }
  };

  const getInitials = (name: string | null) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  const navigationItems = [
    { name: 'Accueil', path: '/dashboard', icon: <Home className="h-4 w-4" /> },
    { name: 'Tâches', path: '/tasks', icon: <CheckSquare className="h-4 w-4" /> },
    { name: 'Habitudes', path: '/habits', icon: <CheckCheck className="h-4 w-4" /> },
    { name: 'Focus', path: '/focus', icon: <Flame className="h-4 w-4" /> },
    { name: 'Journal', path: '/journal', icon: <BookOpen className="h-4 w-4" /> },
    { name: 'Planning', path: '/planning', icon: <Calendar className="h-4 w-4" /> },
    { name: 'Analytique', path: '/analytics', icon: <LineChart className="h-4 w-4" /> },
  ];

  const isActive = (path: string) => location.pathname === path;

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    toast.success(`Thème ${newTheme === 'light' ? 'clair' : 'sombre'} activé`);
  };

  return (
    <div className="border-b fixed w-full bg-background/95 backdrop-blur-sm z-20 shadow-sm">
      <div className="flex items-center justify-between h-16 px-4 md:px-6 max-w-7xl mx-auto">
        {/* Logo and brand */}
        <div className="flex items-center">
          <Link to="/dashboard" className="flex items-center gap-2 font-bold text-xl">
            <Logo withText={!isMobile} className="h-8 w-8" textColor="text-primary dark:text-primary" />
          </Link>
        </div>

        {/* Desktop navigation */}
        {!isMobile && (
          <nav className="hidden md:flex items-center space-x-1">
            <AnimatePresence>
              {navigationItems.map((item) => (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  transition={{ duration: 0.2 }}
                >
                  <Button
                    variant={isActive(item.path) ? 'default' : 'ghost'}
                    className={`text-sm ${isActive(item.path) ? 'bg-primary text-white' : ''}`}
                    onClick={() => navigate(item.path)}
                  >
                    {item.icon}
                    <span className="ml-2">{item.name}</span>
                  </Button>
                </motion.div>
              ))}
            </AnimatePresence>
          </nav>
        )}

        {/* User profile and mobile menu */}
        <div className="flex items-center gap-3">
          {/* Theme toggle */}
          <Button 
            variant="ghost" 
            size="icon"
            onClick={toggleTheme}
            className="rounded-full w-9 h-9"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>
          
          {/* Notifications */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-full w-9 h-9 relative"
            onClick={() => toast.success("Fonctionnalité de notifications à venir")}
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
            {notifications > 0 && (
              <span className="absolute top-0 right-0 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white dark:ring-slate-900" />
            )}
          </Button>

          {currentUser && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                  <Avatar className="h-9 w-9 border border-primary/10">
                    <AvatarImage src={userPhotoURL || currentUser.photoURL || undefined} alt="Profile" />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {getInitials(userName || currentUser.displayName)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="flex items-center justify-start gap-2 p-2">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={userPhotoURL || currentUser.photoURL || undefined} alt="Profile" />
                    <AvatarFallback>{getInitials(userName || currentUser.displayName)}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col space-y-0.5">
                    <p className="text-sm font-medium">{userName || currentUser.displayName}</p>
                    <p className="text-xs text-muted-foreground truncate max-w-[160px]">{currentUser.email}</p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem onClick={() => navigate('/profile')}>
                    <User className="h-4 w-4 mr-2" />
                    Profil
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/settings')}>
                    <Settings className="h-4 w-4 mr-2" />
                    Paramètres
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => window.open('https://docs.lovable.dev', '_blank')}>
                    <HelpCircle className="h-4 w-4 mr-2" />
                    Aide et support
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600 dark:text-red-400">
                  <LogOut className="h-4 w-4 mr-2" />
                  Déconnexion
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {isMobile && (
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[250px] sm:w-[300px]">
                <SheetHeader className="text-left mb-4">
                  <SheetTitle>
                    <div className="flex items-center gap-2">
                      <Logo className="h-6 w-6" textColor="text-primary dark:text-primary" />
                      DeepFlow
                    </div>
                  </SheetTitle>
                </SheetHeader>
                <div className="py-4">
                  <div className="space-y-1">
                    {navigationItems.map((item) => (
                      <Button
                        key={item.name}
                        variant={isActive(item.path) ? 'default' : 'ghost'}
                        className="w-full justify-start mb-1"
                        onClick={() => {
                          navigate(item.path);
                          setMobileMenuOpen(false);
                        }}
                      >
                        {item.icon}
                        <span className="ml-2">{item.name}</span>
                      </Button>
                    ))}
                    <div className="pt-4">
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-muted-foreground"
                        onClick={() => {
                          navigate('/settings');
                          setMobileMenuOpen(false);
                        }}
                      >
                        <Settings className="h-4 w-4 mr-2" />
                        Paramètres
                      </Button>
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-muted-foreground"
                        onClick={() => {
                          navigate('/profile');
                          setMobileMenuOpen(false);
                        }}
                      >
                        <User className="h-4 w-4 mr-2" />
                        Profil
                      </Button>
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-red-600 dark:text-red-400"
                        onClick={handleLogout}
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Déconnexion
                      </Button>
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          )}
        </div>
      </div>
    </div>
  );
};
