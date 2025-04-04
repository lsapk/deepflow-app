
import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useTheme } from '@/hooks/use-theme';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { getUserSettings, updateUserSettings, getUserProfile, updateUserProfile } from '@/services/supabase';
import { getUserProfile as getFirebaseUserProfile, updateUserProfile as updateFirebaseUserProfile } from '@/services/userService';
import { ArrowLeft, ArrowRight, Bell, Clock, Ear, Globe, Moon, Palette, Sun, User, Volume2 } from 'lucide-react';

interface UserSettings {
  theme?: 'dark' | 'light' | 'system';
  language?: string;
  notifications_enabled?: boolean;
  sound_enabled?: boolean;
  focus_mode?: boolean;
  clock_format?: string;
}

const SettingsPage = () => {
  const { currentUser } = useAuth();
  const { setTheme, theme } = useTheme();
  const [settings, setSettings] = useState<UserSettings>({
    theme: 'system',
    language: 'fr',
    notifications_enabled: true,
    sound_enabled: true,
    focus_mode: false,
    clock_format: '24h'
  });
  
  const [userProfile, setUserProfile] = useState({
    displayName: '',
    email: '',
    bio: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [bioUpdating, setBioUpdating] = useState(false);

  // Local storage fallback for offline functionality
  const [localSettings, setLocalSettings] = useLocalStorage<UserSettings>('user_settings', {
    theme: 'system',
    language: 'fr',
    notifications_enabled: true,
    sound_enabled: true,
    focus_mode: false,
    clock_format: '24h'
  });

  // Load settings from database or fallback to local storage
  useEffect(() => {
    const loadSettings = async () => {
      setLoading(true);
      try {
        if (currentUser) {
          const userSettings = await getUserSettings(currentUser.uid);
          if (userSettings) {
            const loadedSettings = {
              theme: userSettings.theme as 'dark' | 'light' | 'system',
              language: userSettings.language,
              notifications_enabled: userSettings.notifications_enabled,
              sound_enabled: userSettings.sound_enabled,
              focus_mode: userSettings.focus_mode,
              clock_format: userSettings.clock_format
            };
            setSettings(loadedSettings);
            setLocalSettings(loadedSettings);
            
            // Apply theme immediately
            if (loadedSettings.theme) {
              setTheme(loadedSettings.theme);
            }
            
            // Load user profile
            const profile = await getFirebaseUserProfile(currentUser.uid);
            if (profile) {
              setUserProfile({
                displayName: profile.displayName || '',
                email: profile.email || '',
                bio: profile.bio || ''
              });
            }
          } else {
            // No settings found in DB, use local storage
            setSettings(localSettings);
          }
        }
      } catch (error) {
        console.error("Error loading settings:", error);
        // Fall back to local storage on error
        setSettings(localSettings);
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, [currentUser, setTheme, localSettings, setLocalSettings]);

  // Save settings to both database and local storage
  const saveSettings = async (newSettings: Partial<UserSettings>) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);
    setLocalSettings(updatedSettings);
    
    // Apply theme change immediately
    if (newSettings.theme) {
      setTheme(newSettings.theme);
    }
    
    // Apply language change immediately
    if (newSettings.language && newSettings.language !== settings.language) {
      toast.success(`Langue changée en ${newSettings.language === 'fr' ? 'Français' : 
                                         newSettings.language === 'en' ? 'Anglais' : 
                                         newSettings.language === 'es' ? 'Espagnol' : 
                                         newSettings.language === 'de' ? 'Allemand' : 
                                         newSettings.language}`);
      
      // In a real application, this would trigger a language change
      // For demo purposes, we'll just show a toast
    }
    
    // Apply focus mode immediately
    if (newSettings.focus_mode !== undefined && newSettings.focus_mode !== settings.focus_mode) {
      if (newSettings.focus_mode) {
        document.body.classList.add('focus-mode');
        toast.success("Mode focus activé");
      } else {
        document.body.classList.remove('focus-mode');
        toast.success("Mode focus désactivé");
      }
    }
    
    // Save to database if online
    if (currentUser) {
      try {
        await updateUserSettings(currentUser.uid, updatedSettings);
        toast.success("Paramètres mis à jour");
      } catch (error) {
        console.error("Error saving settings:", error);
        toast.error("Erreur lors de la sauvegarde des paramètres en ligne");
      }
    }
  };
  
  const updateBio = async () => {
    if (!currentUser) return;
    
    setBioUpdating(true);
    try {
      await updateFirebaseUserProfile(currentUser.uid, {
        bio: userProfile.bio
      });
      toast.success("Biographie mise à jour avec succès");
    } catch (error) {
      console.error("Error updating bio:", error);
      toast.error("Erreur lors de la mise à jour de la biographie");
    } finally {
      setBioUpdating(false);
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-1">Paramètres</h1>
          <p className="text-muted-foreground">
            Personnalisez votre expérience DeepFlow
          </p>
        </div>

        <Tabs defaultValue="appearance">
          <TabsList className="grid grid-cols-3 md:grid-cols-5 mb-4">
            <TabsTrigger value="appearance" className="flex items-center">
              <Palette className="mr-2 h-4 w-4" />
              <span className="hidden md:inline">Apparence</span>
            </TabsTrigger>
            <TabsTrigger value="preferences" className="flex items-center">
              <Clock className="mr-2 h-4 w-4" />
              <span className="hidden md:inline">Préférences</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center">
              <Bell className="mr-2 h-4 w-4" />
              <span className="hidden md:inline">Notifications</span>
            </TabsTrigger>
            <TabsTrigger value="languages" className="flex items-center">
              <Globe className="mr-2 h-4 w-4" />
              <span className="hidden md:inline">Langue</span>
            </TabsTrigger>
            <TabsTrigger value="account" className="flex items-center">
              <User className="mr-2 h-4 w-4" />
              <span className="hidden md:inline">Compte</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="appearance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Thème</CardTitle>
                <CardDescription>
                  Personnalisez l'apparence de l'application
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <RadioGroup 
                  value={settings.theme}
                  onValueChange={(value) => saveSettings({ theme: value as 'dark' | 'light' | 'system' })}
                  className="flex flex-col space-y-3"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="light" id="light" />
                    <Label htmlFor="light" className="flex items-center cursor-pointer">
                      <Sun className="mr-2 h-4 w-4" />
                      Clair
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="dark" id="dark" />
                    <Label htmlFor="dark" className="flex items-center cursor-pointer">
                      <Moon className="mr-2 h-4 w-4" />
                      Sombre
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="system" id="system" />
                    <Label htmlFor="system" className="flex items-center cursor-pointer">
                      <Palette className="mr-2 h-4 w-4" />
                      Système
                    </Label>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preferences" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Format d'horloge</CardTitle>
                <CardDescription>
                  Choisissez le format d'affichage de l'heure
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <RadioGroup 
                  value={settings.clock_format} 
                  onValueChange={(value) => saveSettings({ clock_format: value })}
                  className="flex flex-col space-y-3"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="12h" id="12h" />
                    <Label htmlFor="12h" className="cursor-pointer">12 heures (AM/PM)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="24h" id="24h" />
                    <Label htmlFor="24h" className="cursor-pointer">24 heures</Label>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Mode focus</CardTitle>
                <CardDescription>
                  Activez le mode focus pour limiter les distractions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="focus-mode"
                    checked={settings.focus_mode}
                    onCheckedChange={(checked) => saveSettings({ focus_mode: checked })}
                  />
                  <Label htmlFor="focus-mode">Activer le mode focus</Label>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Notifications</CardTitle>
                <CardDescription>
                  Configurez vos préférences de notification
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="notifications-enabled"
                    checked={settings.notifications_enabled}
                    onCheckedChange={(checked) => saveSettings({ notifications_enabled: checked })}
                  />
                  <Label htmlFor="notifications-enabled">Activer les notifications</Label>
                </div>
                
                {settings.notifications_enabled && (
                  <div className="pl-6 pt-2 space-y-3 border-l-2 border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-muted-foreground">
                      Vous recevrez des notifications pour:
                    </p>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center">
                        <span className="bg-primary/20 text-primary rounded-full p-1 mr-2">
                          <Bell size={12} />
                        </span>
                        Fin de session Pomodoro
                      </li>
                      <li className="flex items-center">
                        <span className="bg-primary/20 text-primary rounded-full p-1 mr-2">
                          <Bell size={12} />
                        </span>
                        Rappels de tâches
                      </li>
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Sons</CardTitle>
                <CardDescription>
                  Configurez vos préférences de son
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="sound-enabled"
                    checked={settings.sound_enabled}
                    onCheckedChange={(checked) => saveSettings({ sound_enabled: checked })}
                  />
                  <Label htmlFor="sound-enabled" className="flex items-center">
                    <Volume2 className="mr-2 h-4 w-4" />
                    Activer les sons
                  </Label>
                </div>
                
                {settings.sound_enabled && (
                  <div className="pl-6 pt-2 space-y-3 border-l-2 border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-muted-foreground">
                      Sons disponibles:
                    </p>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center">
                        <span className="bg-primary/20 text-primary rounded-full p-1 mr-2">
                          <Ear size={12} />
                        </span>
                        Son de fin de session
                        <Button variant="ghost" size="icon" className="ml-2 h-6 w-6" 
                                onClick={() => {
                                  const sound = new Audio('/alarm.mp3');
                                  sound.volume = 0.5;
                                  sound.play();
                                }}>
                          <Volume2 size={12} />
                        </Button>
                      </li>
                      <li className="flex items-center">
                        <span className="bg-primary/20 text-primary rounded-full p-1 mr-2">
                          <Ear size={12} />
                        </span>
                        Son de notification
                        <Button variant="ghost" size="icon" className="ml-2 h-6 w-6"
                                onClick={() => {
                                  const sound = new Audio('/notification.mp3');
                                  sound.volume = 0.5;
                                  sound.play();
                                }}>
                          <Volume2 size={12} />
                        </Button>
                      </li>
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="languages" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Langue</CardTitle>
                <CardDescription>
                  Choisissez la langue de l'application
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Select
                  value={settings.language}
                  onValueChange={(value) => saveSettings({ language: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez une langue" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fr">Français</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Español</SelectItem>
                    <SelectItem value="de">Deutsch</SelectItem>
                  </SelectContent>
                </Select>
                
                <div className="mt-4 p-3 bg-muted rounded-md">
                  <p className="text-sm">
                    Cette option change la langue de l'interface utilisateur. Tous les textes de l'application seront traduits dans la langue sélectionnée.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="account" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Informations personnelles</CardTitle>
                <CardDescription>
                  Mettez à jour vos informations de profil
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nom d'utilisateur</Label>
                  <Input id="name" value={currentUser?.displayName || ''} readOnly />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" value={currentUser?.email || ''} readOnly />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bio">Biographie</Label>
                  <Textarea 
                    id="bio"
                    value={userProfile.bio}
                    onChange={(e) => setUserProfile({...userProfile, bio: e.target.value})}
                    placeholder="Parlez un peu de vous..."
                    className="resize-none h-24"
                  />
                  <Button 
                    onClick={updateBio}
                    variant="outline"
                    disabled={bioUpdating}
                    className="mt-2"
                  >
                    {bioUpdating ? "Mise à jour..." : "Mettre à jour la bio"}
                  </Button>
                </div>
                <Button variant="outline" asChild>
                  <a href="/profile">
                    Gérer le profil <ArrowRight className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Sécurité</CardTitle>
                <CardDescription>
                  Gérez la sécurité de votre compte
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button variant="outline" asChild>
                  <a href="/change-password">
                    Changer de mot de passe <ArrowRight className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default SettingsPage;
