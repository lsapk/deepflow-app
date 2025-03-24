import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/common/Logo';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from '@/components/ui/sheet';
import {
  Bell,
  Calendar,
  CheckSquare,
  Home,
  Menu,
  Settings,
  LogOut,
  User,
  BarChart2,
  BookOpen,
  Target,
  Clock,
  Search
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useIsMobile } from '@/hooks/use-mobile';

interface NavItem {
  name: string;
  path: string;
  icon: React.ReactNode;
  badge?: string | number;
}

export const NavigationBar = () => {
  const { currentUser, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [isScrolled, setIsScrolled] = useState(false);

  const navItems: NavItem[] = [
    { name: 'Tableau de bord', path: '/dashboard', icon: <Home className="h-5 w-5" /> },
    { name: 'Tâches', path: '/tasks', icon: <CheckSquare className="h-5 w-5" />, badge: 3 },
    { name: 'Habitudes', path: '/habits', icon: <CheckSquare className="h-5 w-5" /> },
    { name: 'Focus', path: '/focus', icon: <Clock className="h-5 w-5" /> },
    { name: 'Journal', path: '/journal', icon: <BookOpen className="h-5 w-5" /> },
    { name: 'Objectifs', path: '/goals', icon: <Target className="h-5 w-5" /> },
    { name: 'Planning', path: '/planning', icon: <Calendar className="h-5 w-5" /> },
    { name: 'Analyses', path: '/analytics', icon: <BarChart2 className="h-5 w-5" /> },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/signin');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((part) => part.charAt(0))
      .join('')
      .toUpperCase();
  };

  const MobileNav = () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="overflow-y-auto">
        <SheetHeader className="mb-4">
          <SheetTitle className="text-left">
            <Logo size="md" textColor="text-primary" />
          </SheetTitle>
        </SheetHeader>
        
        {currentUser && (
          <div className="flex items-center gap-3 mb-6 px-2">
            <Avatar className="h-10 w-10">
              <AvatarImage src={currentUser.photoURL || undefined} alt={currentUser.displayName || 'Utilisateur'} />
              <AvatarFallback>{getInitials(currentUser.displayName)}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="font-medium text-sm">{currentUser.displayName || 'Utilisateur'}</span>
              <span className="text-xs text-gray-500 truncate max-w-[180px]">{currentUser.email}</span>
            </div>
          </div>
        )}
        
        <nav className="space-y-1 mb-6">
          {navItems.map((item) => (
            <SheetClose asChild key={item.path}>
              <Link
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm ${
                  location.pathname === item.path
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                }`}
              >
                {item.icon}
                {item.name}
                {item.badge && (
                  <Badge variant="secondary" className="ml-auto">
                    {item.badge}
                  </Badge>
                )}
              </Link>
            </SheetClose>
          ))}
        </nav>
        
        <div className="space-y-1">
          <SheetClose asChild>
            <Link
              to="/profile"
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm ${
                location.pathname === '/profile'
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
              }`}
            >
              <User className="h-5 w-5" />
              Profil
            </Link>
          </SheetClose>
          
          <SheetClose asChild>
            <Link
              to="/settings"
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm ${
                location.pathname === '/settings'
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
              }`}
            >
              <Settings className="h-5 w-5" />
              Paramètres
            </Link>
          </SheetClose>
          
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 px-3 py-2 rounded-md text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
          >
            <LogOut className="h-5 w-5" />
            Déconnexion
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );

  const DesktopNav = () => (
    <div className="hidden md:flex items-center gap-1">
      {navItems.map((item) => (
        <Link
          key={item.path}
          to={item.path}
          className={`flex items-center px-3 py-2 rounded-md text-sm ${
            location.pathname === item.path
              ? 'bg-primary/10 text-primary font-medium'
              : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
          }`}
        >
          {item.icon}
          <span className="ml-2">{item.name}</span>
          {item.badge && (
            <Badge variant="secondary" className="ml-2">
              {item.badge}
            </Badge>
          )}
        </Link>
      ))}
    </div>
  );

  if (!currentUser) {
    return (
      <header className={`fixed top-0 left-0 right-0 z-40 py-3 px-4 transition-all ${isScrolled ? 'bg-white/90 dark:bg-gray-900/90 backdrop-blur-md shadow-sm' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Logo size="sm" textColor="text-primary" />
          
          <div className="flex items-center gap-2">
            <Link to="/signin">
              <Button variant="ghost" size="sm">
                Connexion
              </Button>
            </Link>
            <Link to="/signup">
              <Button size="sm">
                Inscription
              </Button>
            </Link>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className={`fixed top-0 left-0 right-0 z-40 py-2 px-4 transition-all ${isScrolled ? 'bg-white/90 dark:bg-gray-900/90 backdrop-blur-md shadow-sm' : 'bg-white dark:bg-gray-900'}`}>
      <div className="max-w-7xl mx-auto flex items-center justify-between h-14">
        <div className="flex items-center gap-4">
          <MobileNav />
          <Logo size="sm" textColor="text-primary" />
          {!isMobile && <DesktopNav />}
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="text-gray-600 dark:text-gray-400">
            <Search className="h-5 w-5" />
          </Button>
          
          <Button variant="ghost" size="icon" className="text-gray-600 dark:text-gray-400">
            <Bell className="h-5 w-5" />
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={currentUser.photoURL || undefined} alt={currentUser.displayName || 'Utilisateur'} />
                  <AvatarFallback className="text-xs">{getInitials(currentUser.displayName)}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>
                <div className="flex flex-col">
                  <span>{currentUser.displayName || 'Utilisateur'}</span>
                  <span className="text-xs text-gray-500 truncate max-w-[180px]">{currentUser.email}</span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/profile" className="cursor-pointer">
                  <User className="h-4 w-4 mr-2" />
                  Profil
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/settings" className="cursor-pointer">
                  <Settings className="h-4 w-4 mr-2" />
                  Paramètres
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-red-600 dark:text-red-400">
                <LogOut className="h-4 w-4 mr-2" />
                Déconnexion
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};
