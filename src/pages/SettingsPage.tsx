
import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { db } from '@/services/firebase';
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import { 
  Bell, 
  LanguagesIcon, 
  Palette, 
  Shield, 
  Loader2, 
  Moon, 
  Sun, 
  Monitor, 
  Clock, 
  AlertCircle 
} from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface UserSettings {
  theme: 'light' | 'dark' | 'system';
  language: 'fr' | 'en';
  notificationsEnabled: boolean;
  soundEnabled: boolean;
  focusMode: boolean;
  clockFormat: '12h' | '24h';
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
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  const [error, setError] = useState<string | null>(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    const fetchSettings = async () => {
      if (!currentUser) return;
      
      try {
        setIsLoading(true);
        setError(null);
        
        const settingsRef = doc(db, "userSettings", currentUser.uid);
        const settingsDoc = await getDoc(settingsRef);
        
        if (settingsDoc.exists()) {
          const userSettings = settingsDoc.data() as UserSettings;
          setSettings(userSettings);
        } else {
          // Create default settings if they don't exist
          await setDoc(settingsRef, defaultSettings);
        }
      } catch (err) {
        console.error("Error loading settings:", err);
        setError("Erreur lors du chargement des paramètres");
        toast.error("Erreur lors du chargement des paramètres");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSettings();
  }, [currentUser]);

  const handleSaveSettings = async () => {
    if (!currentUser) return;
    
    try {
      setIsSaving(true);
      setError(null);
      
      const settingsRef = doc(db, "userSettings", currentUser.uid);
      await updateDoc(settingsRef, {
        ...settings,
        updatedAt: new Date()
      });
      
      toast.success("Paramètres mis à jour avec succès");
    } catch (err) {
      console.error("Error saving settings:", err);
      setError("Erreur lors de la sauvegarde des paramètres");
      toast.error("Erreur lors de la sauvegarde des paramètres");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSwitchChange = (field: keyof UserSettings, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePrivacyChange = (field: keyof typeof settings.privacy, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      privacy: {
        ...prev.privacy,
        [field]: value
      }
    }));
  };

  const handleSelectChange = (field: keyof UserSettings, value: any) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="min-h-[60vh] flex flex-col items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-gray-500 dark:text-gray-400">Chargement des paramètres...</p>
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

        <Tabs defaultValue="interface">
          <TabsList className={`grid ${isMobile ? "grid-cols-2" : "w-full grid-cols-4"}`}>
            <TabsTrigger value="interface" className="flex items-center justify-center">
              <Palette className="mr-2 h-4 w-4" />
              Interface
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center justify-center">
              <Bell className="mr-2 h-4 w-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="language" className="flex items-center justify-center">
              <LanguagesIcon className="mr-2 h-4 w-4" />
              Langue
            </TabsTrigger>
            <TabsTrigger value="privacy" className="flex items-center justify-center">
              <Shield className="mr-2 h-4 w-4" />
              Confidentialité
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="interface" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Paramètres d'interface</CardTitle>
                <CardDescription>
                  Personnalisez l'apparence et le comportement de l'application
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Thème</Label>
                    <div className="flex flex-col sm:flex-row gap-4">
                      <Button
                        variant={settings.theme === 'light' ? 'default' : 'outline'}
                        className="flex items-center justify-start"
                        onClick={() => handleSelectChange('theme', 'light')}
                      >
                        <Sun className="mr-2 h-4 w-4" />
                        Clair
                      </Button>
                      <Button
                        variant={settings.theme === 'dark' ? 'default' : 'outline'}
                        className="flex items-center justify-start"
                        onClick={() => handleSelectChange('theme', 'dark')}
                      >
                        <Moon className="mr-2 h-4 w-4" />
                        Sombre
                      </Button>
                      <Button
                        variant={settings.theme === 'system' ? 'default' : 'outline'}
                        className="flex items-center justify-start"
                        onClick={() => handleSelectChange('theme', 'system')}
                      >
                        <Monitor className="mr-2 h-4 w-4" />
                        Système
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Format d'horloge</Label>
                    <div className="flex flex-col sm:flex-row gap-4">
                      <Button
                        variant={settings.clockFormat === '12h' ? 'default' : 'outline'}
                        className="flex items-center justify-start"
                        onClick={() => handleSelectChange('clockFormat', '12h')}
                      >
                        <Clock className="mr-2 h-4 w-4" />
                        12h (AM/PM)
                      </Button>
                      <Button
                        variant={settings.clockFormat === '24h' ? 'default' : 'outline'}
                        className="flex items-center justify-start"
                        onClick={() => handleSelectChange('clockFormat', '24h')}
                      >
                        <Clock className="mr-2 h-4 w-4" />
                        24h
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between space-x-2">
                    <Label htmlFor="focus-mode" className="flex flex-col space-y-1">
                      <span>Mode focus</span>
                      <span className="font-normal text-xs text-gray-500 dark:text-gray-400">
                        Réduit les distractions visuelles pendant l'utilisation
                      </span>
                    </Label>
                    <Switch
                      id="focus-mode"
                      checked={settings.focusMode}
                      onCheckedChange={(checked) => handleSwitchChange('focusMode', checked)}
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button onClick={handleSaveSettings} disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Enregistrement...
                    </>
                  ) : (
                    'Enregistrer les modifications'
                  )}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="notifications" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Paramètres de notifications</CardTitle>
                <CardDescription>
                  Configurez comment et quand vous souhaitez être notifié
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between space-x-2">
                  <Label htmlFor="notifications-enabled" className="flex flex-col space-y-1">
                    <span>Notifications</span>
                    <span className="font-normal text-xs text-gray-500 dark:text-gray-400">
                      Activer les notifications dans l'application
                    </span>
                  </Label>
                  <Switch
                    id="notifications-enabled"
                    checked={settings.notificationsEnabled}
                    onCheckedChange={(checked) => handleSwitchChange('notificationsEnabled', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between space-x-2">
                  <Label htmlFor="sound-enabled" className="flex flex-col space-y-1">
                    <span>Sons</span>
                    <span className="font-normal text-xs text-gray-500 dark:text-gray-400">
                      Activer les sons pour les notifications
                    </span>
                  </Label>
                  <Switch
                    id="sound-enabled"
                    checked={settings.soundEnabled}
                    onCheckedChange={(checked) => handleSwitchChange('soundEnabled', checked)}
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button onClick={handleSaveSettings} disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Enregistrement...
                    </>
                  ) : (
                    'Enregistrer les modifications'
                  )}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="language" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Paramètres de langue</CardTitle>
                <CardDescription>
                  Choisissez la langue de l'interface
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Langue de l'application</Label>
                  <Select
                    value={settings.language}
                    onValueChange={(value) => handleSelectChange('language', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez une langue" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fr">Français</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button onClick={handleSaveSettings} disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Enregistrement...
                    </>
                  ) : (
                    'Enregistrer les modifications'
                  )}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="privacy" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Paramètres de confidentialité</CardTitle>
                <CardDescription>
                  Gérez vos données et paramètres de confidentialité
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between space-x-2">
                  <Label htmlFor="share-activity" className="flex flex-col space-y-1">
                    <span>Partage d'activité</span>
                    <span className="font-normal text-xs text-gray-500 dark:text-gray-400">
                      Permettre le partage de votre activité avec d'autres utilisateurs
                    </span>
                  </Label>
                  <Switch
                    id="share-activity"
                    checked={settings.privacy.shareActivity}
                    onCheckedChange={(checked) => handlePrivacyChange('shareActivity', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between space-x-2">
                  <Label htmlFor="public-profile" className="flex flex-col space-y-1">
                    <span>Profil public</span>
                    <span className="font-normal text-xs text-gray-500 dark:text-gray-400">
                      Rendre votre profil visible publiquement
                    </span>
                  </Label>
                  <Switch
                    id="public-profile"
                    checked={settings.privacy.publicProfile}
                    onCheckedChange={(checked) => handlePrivacyChange('publicProfile', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between space-x-2">
                  <Label htmlFor="data-collection" className="flex flex-col space-y-1">
                    <span>Collecte de données</span>
                    <span className="font-normal text-xs text-gray-500 dark:text-gray-400">
                      Permettre la collecte de données anonymes pour améliorer l'application
                    </span>
                  </Label>
                  <Switch
                    id="data-collection"
                    checked={settings.privacy.dataCollection}
                    onCheckedChange={(checked) => handlePrivacyChange('dataCollection', checked)}
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button onClick={handleSaveSettings} disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Enregistrement...
                    </>
                  ) : (
                    'Enregistrer les modifications'
                  )}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default SettingsPage;
