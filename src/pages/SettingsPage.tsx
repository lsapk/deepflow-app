
import React, { useEffect, useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useTheme } from '@/hooks/use-theme';
import { useAuth } from '@/contexts/AuthContext';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { AlertCircle, Bell, Clock, Globe, HelpCircle, Languages, Moon, PanelLeftClose, Sun, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useIndexedDB } from '@/hooks/use-indexed-db';

const SettingsPage = () => {
  const { theme, setTheme } = useTheme();
  const { currentUser, logout } = useAuth();
  
  // Load settings from IndexedDB
  const { data: settingsData, addItem, updateItem, loading } = useIndexedDB<{
    id: string;
    language: string;
    clockFormat: string;
    notificationsEnabled: boolean;
    soundEnabled: boolean;
  }>({
    storeName: 'settings',
    initialData: [{
      id: 'user-settings',
      language: 'fr',
      clockFormat: '24h',
      notificationsEnabled: true,
      soundEnabled: true,
    }]
  });
  
  // Use the first settings object or create default state
  const [settings, setSettings] = useState({
    language: 'fr',
    clockFormat: '24h',
    notificationsEnabled: true,
    soundEnabled: true,
  });
  
  // Load settings from IndexedDB
  useEffect(() => {
    if (!loading && settingsData.length > 0) {
      const userSettings = settingsData[0];
      setSettings({
        language: userSettings.language,
        clockFormat: userSettings.clockFormat,
        notificationsEnabled: userSettings.notificationsEnabled,
        soundEnabled: userSettings.soundEnabled,
      });
    } else if (!loading && settingsData.length === 0) {
      // Create initial settings
      addItem({
        id: 'user-settings',
        language: 'fr',
        clockFormat: '24h',
        notificationsEnabled: true,
        soundEnabled: true,
      });
    }
  }, [loading, settingsData, addItem]);
  
  // Update settings
  const updateSettings = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    
    if (settingsData.length > 0) {
      updateItem('user-settings', { [key]: value });
      toast.success(`Paramètre ${key} mis à jour`);
    } else {
      addItem({
        id: 'user-settings',
        ...settings,
        [key]: value
      });
      toast.success(`Paramètre ${key} mis à jour`);
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-1">Paramètres</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Personnalisez votre expérience DeepFlow
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Sun className="mr-2 h-5 w-5 text-yellow-500" />
                <Moon className="mr-2 h-5 w-5 text-blue-500" />
                Apparence
              </CardTitle>
              <CardDescription>
                Modifiez l'apparence de l'application
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-2">
                <Button 
                  variant={theme === 'light' ? 'default' : 'outline'} 
                  onClick={() => setTheme('light')}
                  className="flex flex-col items-center justify-center p-4 h-auto gap-2"
                >
                  <Sun className="h-6 w-6" />
                  <span>Clair</span>
                </Button>
                <Button 
                  variant={theme === 'dark' ? 'default' : 'outline'} 
                  onClick={() => setTheme('dark')}
                  className="flex flex-col items-center justify-center p-4 h-auto gap-2"
                >
                  <Moon className="h-6 w-6" />
                  <span>Sombre</span>
                </Button>
                <Button 
                  variant={theme === 'system' ? 'default' : 'outline'} 
                  onClick={() => setTheme('system')}
                  className="flex flex-col items-center justify-center p-4 h-auto gap-2"
                >
                  <PanelLeftClose className="h-6 w-6" />
                  <span>Système</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Languages className="mr-2 h-5 w-5 text-green-500" />
                Langue et format
              </CardTitle>
              <CardDescription>
                Personnalisez la langue et les formats d'affichage
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Globe className="mr-2 h-4 w-4 text-muted-foreground" />
                    <Label htmlFor="language">Langue</Label>
                  </div>
                  <Select 
                    value={settings.language} 
                    onValueChange={(value) => updateSettings('language', value)}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Langue" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fr">Français</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                    <Label htmlFor="clock-format">Format d'horloge</Label>
                  </div>
                  <Select 
                    value={settings.clockFormat}
                    onValueChange={(value) => updateSettings('clockFormat', value)}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="12h">12h (AM/PM)</SelectItem>
                      <SelectItem value="24h">24h</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bell className="mr-2 h-5 w-5 text-red-500" />
                Notifications
              </CardTitle>
              <CardDescription>
                Gérez les paramètres de notification
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-start gap-2">
                  <div className="flex items-center">
                    <Bell className="mr-2 h-4 w-4 text-muted-foreground" />
                    <Label htmlFor="notifications">Activer les notifications</Label>
                  </div>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-4 w-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Recevez des notifications pour les rappels et les événements</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <Switch 
                  id="notifications" 
                  checked={settings.notificationsEnabled}
                  onCheckedChange={(checked) => updateSettings('notificationsEnabled', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Volume2 className="mr-2 h-4 w-4 text-muted-foreground" />
                  <Label htmlFor="sounds">Sons de notification</Label>
                </div>
                <Switch 
                  id="sounds" 
                  checked={settings.soundEnabled}
                  onCheckedChange={(checked) => updateSettings('soundEnabled', checked)}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertCircle className="mr-2 h-5 w-5 text-orange-500" />
                Compte
              </CardTitle>
              <CardDescription>
                Gérez les paramètres de votre compte
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium mb-1">Email</p>
                  <p className="text-sm text-muted-foreground">{currentUser?.email || 'Non connecté'}</p>
                </div>

                <Button 
                  variant="destructive" 
                  onClick={logout}
                >
                  Se déconnecter
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default SettingsPage;
