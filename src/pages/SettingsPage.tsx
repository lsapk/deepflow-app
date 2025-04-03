
import React, { useEffect, useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTheme } from '@/hooks/use-theme';
import { toast } from 'sonner';
import { Moon, Sun, Globe, Bell, Volume2, Clock } from 'lucide-react';
import { useIndexedDB } from '@/hooks/use-indexed-db';
import { useAuth } from '@/contexts/AuthContext';

const SettingsPage = () => {
  const { theme, setTheme } = useTheme();
  const { currentUser } = useAuth();
  const { data: settingsData, loading, updateItem, addItem } = useIndexedDB<{
    id: string;
    language: string;
    clockFormat: string;
    notificationsEnabled: boolean;
    soundEnabled: boolean;
  }>({
    storeName: 'settings',
    initialData: []
  });
  
  const [settings, setSettings] = useState({
    language: 'fr',
    clockFormat: '24h',
    notificationsEnabled: true,
    soundEnabled: true
  });
  
  useEffect(() => {
    if (!loading && settingsData.length > 0) {
      // Use the first settings object
      const userSettings = settingsData[0];
      setSettings({
        language: userSettings.language || 'fr',
        clockFormat: userSettings.clockFormat || '24h',
        notificationsEnabled: userSettings.notificationsEnabled !== false,
        soundEnabled: userSettings.soundEnabled !== false
      });
    }
  }, [settingsData, loading]);
  
  const handleSettingsChange = (key: keyof typeof settings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    
    // Save to IndexedDB
    if (settingsData.length > 0) {
      // Update existing settings
      updateItem(settingsData[0].id, { [key]: value });
    } else {
      // Create new settings
      addItem({
        language: settings.language,
        clockFormat: settings.clockFormat,
        notificationsEnabled: settings.notificationsEnabled,
        soundEnabled: settings.soundEnabled,
        [key]: value
      });
    }
    
    // Show toast notification
    toast.success("Paramètres mis à jour");
  };
  
  return (
    <MainLayout>
      <div className="flex flex-col space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-1">Paramètres</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Personnalisez votre expérience DeepFlow
          </p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Sun className="mr-2 h-5 w-5 text-yellow-500" />
              <Moon className="mr-2 h-5 w-5 text-blue-500" />
              Apparence
            </CardTitle>
            <CardDescription>
              Personnalisez l'apparence de l'application
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="theme">Thème</Label>
              <Select 
                value={theme}
                onValueChange={(value) => {
                  setTheme(value);
                  toast.success("Thème mis à jour");
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Sélectionnez un thème" />
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
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Globe className="mr-2 h-5 w-5 text-green-500" />
              Langue et région
            </CardTitle>
            <CardDescription>
              Choisissez votre langue et vos préférences régionales
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="language">Langue</Label>
              <Select 
                value={settings.language}
                onValueChange={(value) => handleSettingsChange('language', value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Sélectionnez une langue" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fr">Français</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Separator className="my-4" />
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-purple-500" />
                  <Label htmlFor="clock-format">Format d'horloge</Label>
                </div>
                <Select 
                  value={settings.clockFormat}
                  onValueChange={(value) => handleSettingsChange('clockFormat', value)}
                >
                  <SelectTrigger className="w-[100px]">
                    <SelectValue placeholder="Format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="12h">12h</SelectItem>
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
              <Bell className="mr-2 h-5 w-5 text-rose-500" />
              Notifications
            </CardTitle>
            <CardDescription>
              Configurez vos préférences de notification
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="notifications">Notifications</Label>
                <div className="text-sm text-muted-foreground">
                  Recevoir des rappels et des alertes
                </div>
              </div>
              <Switch 
                id="notifications" 
                checked={settings.notificationsEnabled}
                onCheckedChange={(checked) => handleSettingsChange('notificationsEnabled', checked)}
              />
            </div>
            
            <Separator className="my-4" />
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="flex items-center space-x-2">
                  <Volume2 className="h-5 w-5 text-orange-500" />
                  <Label htmlFor="sounds">Sons</Label>
                </div>
                <div className="text-sm text-muted-foreground">
                  Activer les sons de l'application
                </div>
              </div>
              <Switch 
                id="sounds" 
                checked={settings.soundEnabled}
                onCheckedChange={(checked) => handleSettingsChange('soundEnabled', checked)}
              />
            </div>
          </CardContent>
        </Card>
        
        {currentUser && (
          <Card>
            <CardHeader>
              <CardTitle className="text-red-500">Zone de danger</CardTitle>
              <CardDescription>
                Actions irréversibles qui affectent votre compte
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                variant="destructive"
                className="w-full sm:w-auto"
                onClick={() => {
                  if (confirm("Êtes-vous sûr de vouloir supprimer toutes vos données ? Cette action est irréversible.")) {
                    localStorage.clear();
                    toast.success("Toutes les données ont été supprimées");
                    setTimeout(() => window.location.reload(), 1500);
                  }
                }}
              >
                Supprimer toutes mes données
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  );
};

export default SettingsPage;
