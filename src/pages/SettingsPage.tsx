
import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '@/services/firebase';
import { toast } from 'sonner';
import { 
  AlertCircle,
  BellRing,
  Clock,
  Download,
  Languages,
  Loader2,
  Moon,
  Palette,
  RefreshCw,
  Save,
  ShieldCheck,
  Sun,
  UserCog,
  Volume2
} from 'lucide-react';

interface UserSettings {
  theme: string;
  language: string;
  notificationsEnabled: boolean;
  soundEnabled: boolean;
  focusMode: boolean;
  clockFormat: string;
  privacy: {
    shareActivity: boolean;
    publicProfile: boolean;
    dataCollection: boolean;
  };
}

const defaultSettings: UserSettings = {
  theme: 'system',
  language: 'fr',
  notificationsEnabled: true,
  soundEnabled: true,
  focusMode: false,
  clockFormat: '24h',
  privacy: {
    shareActivity: false,
    publicProfile: false,
    dataCollection: true,
  }
};

const SettingsPage = () => {
  const { currentUser } = useAuth();
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveChanges, setSaveChanges] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState('appearance');

  // Fetch user settings
  useEffect(() => {
    const fetchSettings = async () => {
      if (!currentUser) return;
      
      try {
        setLoading(true);
        setError(null);
        const userSettingsRef = doc(db, "userSettings", currentUser.uid);
        const userSettingsDoc = await getDoc(userSettingsRef);
        
        if (userSettingsDoc.exists()) {
          setSettings(userSettingsDoc.data() as UserSettings);
        } else {
          // Create default settings for new users
          await setDoc(userSettingsRef, defaultSettings);
        }
      } catch (error) {
        console.error("Error fetching settings:", error);
        setError("Erreur lors du chargement des paramètres");
        toast.error("Erreur lors du chargement des paramètres");
      } finally {
        setLoading(false);
      }
    };
    
    fetchSettings();
  }, [currentUser]);

  const handleThemeChange = (value: string) => {
    setSettings({...settings, theme: value});
    setSaveChanges(true);
    
    // Apply theme change immediately
    if (value === 'light') {
      document.documentElement.classList.remove('dark');
    } else if (value === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      // System - auto-detect
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  };

  const handleLanguageChange = (value: string) => {
    setSettings({...settings, language: value});
    setSaveChanges(true);
  };
  
  const handleNotificationsChange = (checked: boolean) => {
    setSettings({...settings, notificationsEnabled: checked});
    setSaveChanges(true);
  };
  
  const handleSoundChange = (checked: boolean) => {
    setSettings({...settings, soundEnabled: checked});
    setSaveChanges(true);
  };
  
  const handleFocusModeChange = (checked: boolean) => {
    setSettings({...settings, focusMode: checked});
    setSaveChanges(true);
  };
  
  const handleClockFormatChange = (value: string) => {
    setSettings({...settings, clockFormat: value});
    setSaveChanges(true);
  };
  
  const handlePrivacyChange = (setting: keyof typeof settings.privacy, checked: boolean) => {
    setSettings({
      ...settings, 
      privacy: {
        ...settings.privacy,
        [setting]: checked
      }
    });
    setSaveChanges(true);
  };

  const handleSaveSettings = async () => {
    if (!currentUser) return;
    
    try {
      setSaving(true);
      setError(null);
      const userSettingsRef = doc(db, "userSettings", currentUser.uid);
      await setDoc(userSettingsRef, settings);
      toast.success("Paramètres enregistrés avec succès");
      setSaveChanges(false);
    } catch (error) {
      console.error("Error saving settings:", error);
      setError("Erreur lors de l'enregistrement des paramètres");
      toast.error("Erreur lors de l'enregistrement des paramètres");
    } finally {
      setSaving(false);
    }
  };

  const handleResetSettings = async () => {
    if (!currentUser) return;
    
    try {
      setSaving(true);
      setError(null);
      setSettings(defaultSettings);
      
      // Also save the default settings to the database
      const userSettingsRef = doc(db, "userSettings", currentUser.uid);
      await setDoc(userSettingsRef, defaultSettings);
      
      toast.success("Paramètres réinitialisés");
      setSaveChanges(false);
      
      // Apply default theme
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } catch (error) {
      console.error("Error resetting settings:", error);
      setError("Erreur lors de la réinitialisation des paramètres");
      toast.error("Erreur lors de la réinitialisation des paramètres");
    } finally {
      setSaving(false);
    }
  };
  
  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="min-h-[60vh] flex flex-col items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-gray-500 dark:text-gray-400">Chargement de vos paramètres...</p>
        </div>
      </MainLayout>
    );
  }

  if (error && !currentUser) {
    return (
      <MainLayout>
        <div className="min-h-[60vh] flex flex-col items-center justify-center">
          <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
          <h2 className="text-xl font-semibold mb-2">Erreur de chargement</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()} variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Réessayer
          </Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Paramètres</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Personnalisez votre expérience DeepFlow
          </p>
        </div>

        {error && (
          <Card className="border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-900">
            <CardContent className="pt-6">
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 text-red-500 mr-3 mt-0.5" />
                <div>
                  <h3 className="font-medium text-red-800 dark:text-red-300">Une erreur est survenue</h3>
                  <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="md:col-span-1">
            <CardContent className="pt-6">
              <div className="space-y-2">
                <div 
                  className={`flex items-center p-2 rounded-md cursor-pointer ${activeTab === 'appearance' ? 'bg-gray-100 dark:bg-gray-800' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                  onClick={() => handleTabChange('appearance')}
                >
                  <Palette className={`mr-2 h-5 w-5 ${activeTab === 'appearance' ? 'text-primary' : 'text-gray-500'}`} />
                  <span className={activeTab === 'appearance' ? 'font-medium' : ''}>Apparence</span>
                </div>
                
                <div 
                  className={`flex items-center p-2 rounded-md cursor-pointer ${activeTab === 'notifications' ? 'bg-gray-100 dark:bg-gray-800' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                  onClick={() => handleTabChange('notifications')}
                >
                  <BellRing className={`mr-2 h-5 w-5 ${activeTab === 'notifications' ? 'text-primary' : 'text-gray-500'}`} />
                  <span className={activeTab === 'notifications' ? 'font-medium' : ''}>Notifications</span>
                </div>
                
                <div 
                  className={`flex items-center p-2 rounded-md cursor-pointer ${activeTab === 'language' ? 'bg-gray-100 dark:bg-gray-800' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                  onClick={() => handleTabChange('language')}
                >
                  <Languages className={`mr-2 h-5 w-5 ${activeTab === 'language' ? 'text-primary' : 'text-gray-500'}`} />
                  <span className={activeTab === 'language' ? 'font-medium' : ''}>Langue</span>
                </div>
                
                <div 
                  className={`flex items-center p-2 rounded-md cursor-pointer ${activeTab === 'interface' ? 'bg-gray-100 dark:bg-gray-800' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                  onClick={() => handleTabChange('interface')}
                >
                  <UserCog className={`mr-2 h-5 w-5 ${activeTab === 'interface' ? 'text-primary' : 'text-gray-500'}`} />
                  <span className={activeTab === 'interface' ? 'font-medium' : ''}>Interface</span>
                </div>
                
                <div 
                  className={`flex items-center p-2 rounded-md cursor-pointer ${activeTab === 'privacy' ? 'bg-gray-100 dark:bg-gray-800' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                  onClick={() => handleTabChange('privacy')}
                >
                  <ShieldCheck className={`mr-2 h-5 w-5 ${activeTab === 'privacy' ? 'text-primary' : 'text-gray-500'}`} />
                  <span className={activeTab === 'privacy' ? 'font-medium' : ''}>Confidentialité</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="md:col-span-3">
            <Tabs value={activeTab} onValueChange={handleTabChange}>
              <TabsList className="grid grid-cols-2 sm:grid-cols-5">
                <TabsTrigger value="appearance">Apparence</TabsTrigger>
                <TabsTrigger value="notifications">Notifications</TabsTrigger>
                <TabsTrigger value="language">Langue</TabsTrigger>
                <TabsTrigger value="interface">Interface</TabsTrigger>
                <TabsTrigger value="privacy">Confidentialité</TabsTrigger>
              </TabsList>
              
              <TabsContent value="appearance" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Thème</CardTitle>
                    <CardDescription>
                      Personnalisez l'apparence de DeepFlow
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="theme">Mode d'affichage</Label>
                      <div className="grid grid-cols-3 gap-4">
                        <div 
                          className={`flex flex-col items-center justify-center p-4 border rounded-md cursor-pointer transition-all ${
                            settings.theme === 'light' 
                              ? 'border-primary bg-primary/10' 
                              : 'border-gray-200 dark:border-gray-700 hover:border-primary/50'
                          }`}
                          onClick={() => handleThemeChange('light')}
                        >
                          <Sun className="h-6 w-6 mb-2" />
                          <span className="text-sm font-medium">Clair</span>
                        </div>
                        
                        <div 
                          className={`flex flex-col items-center justify-center p-4 border rounded-md cursor-pointer transition-all ${
                            settings.theme === 'dark' 
                              ? 'border-primary bg-primary/10' 
                              : 'border-gray-200 dark:border-gray-700 hover:border-primary/50'
                          }`}
                          onClick={() => handleThemeChange('dark')}
                        >
                          <Moon className="h-6 w-6 mb-2" />
                          <span className="text-sm font-medium">Sombre</span>
                        </div>
                        
                        <div 
                          className={`flex flex-col items-center justify-center p-4 border rounded-md cursor-pointer transition-all ${
                            settings.theme === 'system' 
                              ? 'border-primary bg-primary/10' 
                              : 'border-gray-200 dark:border-gray-700 hover:border-primary/50'
                          }`}
                          onClick={() => handleThemeChange('system')}
                        >
                          <div className="flex mb-2">
                            <Sun className="h-6 w-6" />
                            <Moon className="h-6 w-6 ml-1" />
                          </div>
                          <span className="text-sm font-medium">Système</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="notifications" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Notifications</CardTitle>
                    <CardDescription>
                      Gérez comment vous souhaitez recevoir les notifications
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="notifications">Notifications du navigateur</Label>
                        <p className="text-sm text-muted-foreground">
                          Recevoir des alertes pour les tâches à venir et événements importants
                        </p>
                      </div>
                      <Switch 
                        id="notifications" 
                        checked={settings.notificationsEnabled}
                        onCheckedChange={handleNotificationsChange}
                      />
                    </div>
                    
                    <Separator />
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="sound">Sons</Label>
                        <p className="text-sm text-muted-foreground">
                          Jouer des sons pour les notifications et actions
                        </p>
                      </div>
                      <Switch 
                        id="sound" 
                        checked={settings.soundEnabled}
                        onCheckedChange={handleSoundChange}
                      />
                    </div>
                    
                    <div className="space-y-4">
                      <Label>Notifier pour</Label>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="notify-tasks" className="cursor-pointer">Tâches à échéance</Label>
                          <Switch 
                            id="notify-tasks" 
                            defaultChecked 
                            onCheckedChange={() => setSaveChanges(true)}
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <Label htmlFor="notify-habits" className="cursor-pointer">Rappels d'habitudes</Label>
                          <Switch 
                            id="notify-habits" 
                            defaultChecked 
                            onCheckedChange={() => setSaveChanges(true)}
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <Label htmlFor="notify-events" className="cursor-pointer">Événements du calendrier</Label>
                          <Switch 
                            id="notify-events" 
                            defaultChecked 
                            onCheckedChange={() => setSaveChanges(true)}
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <Label htmlFor="notify-sessions" className="cursor-pointer">Sessions de focus</Label>
                          <Switch 
                            id="notify-sessions" 
                            defaultChecked 
                            onCheckedChange={() => setSaveChanges(true)}
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="language" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Langue</CardTitle>
                    <CardDescription>
                      Modifiez la langue de l'application
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Label htmlFor="language">Langue</Label>
                    <Select value={settings.language} onValueChange={handleLanguageChange}>
                      <SelectTrigger id="language">
                        <SelectValue placeholder="Sélectionner une langue" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fr">Français</SelectItem>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="es">Español</SelectItem>
                        <SelectItem value="de">Deutsch</SelectItem>
                      </SelectContent>
                    </Select>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="interface" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Préférences d'interface</CardTitle>
                    <CardDescription>
                      Personnalisez le comportement de l'application
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="focus-mode">Mode concentration</Label>
                        <p className="text-sm text-muted-foreground">
                          Masquer les éléments non essentiels pendant les sessions de focus
                        </p>
                      </div>
                      <Switch 
                        id="focus-mode" 
                        checked={settings.focusMode}
                        onCheckedChange={handleFocusModeChange}
                      />
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-2">
                      <Label htmlFor="clock-format">Format d'horloge</Label>
                      <Select 
                        value={settings.clockFormat} 
                        onValueChange={handleClockFormatChange}
                      >
                        <SelectTrigger id="clock-format">
                          <SelectValue placeholder="Sélectionner un format" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="12h">12 heures (AM/PM)</SelectItem>
                          <SelectItem value="24h">24 heures</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-2">
                      <Label htmlFor="sounds-volume">Volume des sons</Label>
                      <div className="flex items-center gap-2">
                        <Volume2 className="h-4 w-4" />
                        <input 
                          type="range" 
                          min="0" 
                          max="100" 
                          defaultValue="70" 
                          className="w-full" 
                          onChange={() => setSaveChanges(true)}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="privacy" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Confidentialité</CardTitle>
                    <CardDescription>
                      Gérez vos paramètres de confidentialité
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="share-activity">Partager mon activité</Label>
                        <p className="text-sm text-muted-foreground">
                          Permettre le partage de vos statistiques avec d'autres utilisateurs
                        </p>
                      </div>
                      <Switch 
                        id="share-activity" 
                        checked={settings.privacy.shareActivity}
                        onCheckedChange={(checked) => handlePrivacyChange('shareActivity', checked)}
                      />
                    </div>
                    
                    <Separator />
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="public-profile">Profil public</Label>
                        <p className="text-sm text-muted-foreground">
                          Rendre votre profil visible pour d'autres utilisateurs
                        </p>
                      </div>
                      <Switch 
                        id="public-profile" 
                        checked={settings.privacy.publicProfile}
                        onCheckedChange={(checked) => handlePrivacyChange('publicProfile', checked)}
                      />
                    </div>
                    
                    <Separator />
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="data-collection">Collecte de données</Label>
                        <p className="text-sm text-muted-foreground">
                          Autoriser la collecte anonyme de données pour améliorer l'application
                        </p>
                      </div>
                      <Switch 
                        id="data-collection" 
                        checked={settings.privacy.dataCollection}
                        onCheckedChange={(checked) => handlePrivacyChange('dataCollection', checked)}
                      />
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Exportation et réinitialisation</CardTitle>
                    <CardDescription>
                      Gérez vos données et réinitialisez les paramètres
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                      <Button 
                        variant="outline" 
                        onClick={() => toast.success("Données exportées")}
                        className="flex items-center"
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Exporter les données
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        onClick={handleResetSettings}
                        disabled={saving}
                        className="flex items-center"
                      >
                        {saving ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <RefreshCw className="mr-2 h-4 w-4" />
                        )}
                        Réinitialiser les paramètres
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
            
            {saveChanges && (
              <div className="mt-6 flex justify-end">
                <Button 
                  onClick={handleSaveSettings} 
                  disabled={saving}
                  className="flex items-center"
                >
                  {saving ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  Enregistrer les modifications
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default SettingsPage;
