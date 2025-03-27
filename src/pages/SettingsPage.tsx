
import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { getUserSettings, updateUserSettings } from '@/services/supabase';
import { Settings, Bell, Moon, Languages, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { useTheme } from '@/hooks/use-theme';
import { useLocalStorage } from '@/hooks/use-local-storage';

const SettingsPage = () => {
  const { currentUser } = useAuth();
  const { theme, setTheme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useLocalStorage('user-settings', {
    theme: 'system',
    language: 'fr',
    notificationsEnabled: true,
    soundEnabled: true,
    focusMode: false,
    clockFormat: '24h'
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (currentUser) {
      fetchUserSettings();
    } else {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    // Synchroniser le thème avec les paramètres locaux
    setTheme(settings.theme as any);
  }, [settings.theme, setTheme]);

  const fetchUserSettings = async () => {
    if (!currentUser) return;
    
    try {
      setLoading(true);
      const userSettings = await getUserSettings(currentUser.uid);
      
      if (userSettings) {
        setSettings({
          theme: userSettings.theme || 'system',
          language: userSettings.language || 'fr',
          notificationsEnabled: userSettings.notifications_enabled !== false,
          soundEnabled: userSettings.sound_enabled !== false,
          focusMode: userSettings.focus_mode || false,
          clockFormat: userSettings.clock_format || '24h'
        });
      }
    } catch (error) {
      console.error("Error fetching user settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      setIsSaving(true);
      
      if (currentUser) {
        await updateUserSettings(currentUser.uid, {
          theme: settings.theme,
          language: settings.language,
          notifications_enabled: settings.notificationsEnabled,
          sound_enabled: settings.soundEnabled,
          focus_mode: settings.focusMode,
          clock_format: settings.clockFormat
        });
      }
      
      // Appliquer les paramètres localement même sans connexion
      setTheme(settings.theme as any);
      
      // Stocker les préférences dans localStorage pour les utiliser hors ligne
      localStorage.setItem('app-language', settings.language);
      localStorage.setItem('clock-format', settings.clockFormat);
      
      toast.success("Paramètres enregistrés avec succès");
    } catch (error) {
      console.error("Error updating settings:", error);
      toast.error("Erreur lors de l'enregistrement des paramètres");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSwitchChange = (field: string) => (checked: boolean) => {
    setSettings(prev => ({ ...prev, [field]: checked }));
  };

  const handleSelectChange = (field: string) => (value: string) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="space-y-6">
          <h1 className="text-3xl font-bold">Paramètres</h1>
          <div className="grid gap-6">
            <Card className="animate-pulse">
              <CardHeader className="pb-4">
                <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded w-1/4 mb-2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/3"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="flex justify-between items-center">
                      <div className="space-y-1">
                        <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-24"></div>
                        <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-40"></div>
                      </div>
                      <div className="h-6 w-10 bg-gray-200 dark:bg-gray-800 rounded"></div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Paramètres</h1>
        
        <Tabs defaultValue="general">
          <TabsList className="mb-6">
            <TabsTrigger value="general">
              <Settings className="mr-2 h-4 w-4" />
              Général
            </TabsTrigger>
            <TabsTrigger value="notifications">
              <Bell className="mr-2 h-4 w-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="appearance">
              <Moon className="mr-2 h-4 w-4" />
              Apparence
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="general" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Paramètres Généraux</CardTitle>
                <CardDescription>
                  Configurez les paramètres généraux de l'application
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="language">Langue</Label>
                  <Select 
                    value={settings.language} 
                    onValueChange={handleSelectChange('language')}
                  >
                    <SelectTrigger id="language" className="w-full">
                      <Languages className="mr-2 h-4 w-4" />
                      <SelectValue placeholder="Sélectionner une langue" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fr">Français</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Español</SelectItem>
                      <SelectItem value="de">Deutsch</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="clockFormat">Format d'horloge</Label>
                  <Select 
                    value={settings.clockFormat} 
                    onValueChange={handleSelectChange('clockFormat')}
                  >
                    <SelectTrigger id="clockFormat" className="w-full">
                      <Clock className="mr-2 h-4 w-4" />
                      <SelectValue placeholder="Sélectionner un format d'horloge" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="12h">12 heures (AM/PM)</SelectItem>
                      <SelectItem value="24h">24 heures</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="focusMode">Mode Focus</Label>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Minimise les distractions pendant les sessions de travail
                    </p>
                  </div>
                  <Switch
                    id="focusMode"
                    checked={settings.focusMode}
                    onCheckedChange={handleSwitchChange('focusMode')}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Notifications</CardTitle>
                <CardDescription>
                  Gérez les paramètres de notification de l'application
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="notificationsEnabled">Notifications</Label>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Activer les notifications dans l'application
                    </p>
                  </div>
                  <Switch
                    id="notificationsEnabled"
                    checked={settings.notificationsEnabled}
                    onCheckedChange={handleSwitchChange('notificationsEnabled')}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="soundEnabled">Sons</Label>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Activer les sons pour les notifications
                    </p>
                  </div>
                  <Switch
                    id="soundEnabled"
                    checked={settings.soundEnabled}
                    onCheckedChange={handleSwitchChange('soundEnabled')}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="appearance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Apparence</CardTitle>
                <CardDescription>
                  Personnalisez l'apparence de l'application
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="theme">Thème</Label>
                  <Select 
                    value={settings.theme} 
                    onValueChange={handleSelectChange('theme')}
                  >
                    <SelectTrigger id="theme" className="w-full">
                      <Moon className="mr-2 h-4 w-4" />
                      <SelectValue placeholder="Sélectionner un thème" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Clair</SelectItem>
                      <SelectItem value="dark">Sombre</SelectItem>
                      <SelectItem value="system">Système</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        <div className="flex justify-end">
          <Button onClick={saveSettings} disabled={isSaving}>
            {isSaving ? 'Enregistrement...' : 'Enregistrer les paramètres'}
          </Button>
        </div>
      </div>
    </MainLayout>
  );
};

export default SettingsPage;
