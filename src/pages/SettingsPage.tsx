import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { db, toggleDistractionBlocker, updateBlockedSites, syncGoogleCalendar } from '@/services/firebase';
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
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
  AlertCircle,
  Calendar,
  Mail,
  Sparkles,
  ShieldAlert,
  MessageSquare
} from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

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
  karmaPoints: number;
  unlockedFeatures: string[];
  distraction_blocker: {
    enabled: boolean;
    blockedSites: string[];
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
  },
  karmaPoints: 0,
  unlockedFeatures: [],
  distraction_blocker: {
    enabled: false,
    blockedSites: []
  }
};

const SettingsPage = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate(); // Add this line for proper navigation
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  const [error, setError] = useState<string | null>(null);
  const [newBlockedSite, setNewBlockedSite] = useState('');
  const [googleAuthCode, setGoogleAuthCode] = useState('');
  const [isSyncingCalendar, setIsSyncingCalendar] = useState(false);
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
          
          // Assurez-vous que toutes les propriétés existent
          setSettings({
            ...defaultSettings,
            ...userSettings,
            distraction_blocker: {
              enabled: userSettings.distraction_blocker?.enabled || false,
              blockedSites: userSettings.distraction_blocker?.blockedSites || []
            }
          });
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

  const handleToggleDistractionBlocker = async () => {
    if (!currentUser) return;
    
    try {
      setIsSaving(true);
      const newValue = !settings.distraction_blocker.enabled;
      
      await toggleDistractionBlocker(currentUser.uid, newValue);
      
      setSettings(prev => ({
        ...prev,
        distraction_blocker: {
          ...prev.distraction_blocker,
          enabled: newValue
        }
      }));
    } catch (err) {
      console.error("Error toggling distraction blocker:", err);
      toast.error("Erreur lors de la modification du bloqueur de distractions");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddBlockedSite = async () => {
    if (!currentUser || !newBlockedSite) return;
    
    try {
      setIsSaving(true);
      const blockedSites = [...settings.distraction_blocker.blockedSites, newBlockedSite];
      
      await updateBlockedSites(currentUser.uid, blockedSites);
      
      setSettings(prev => ({
        ...prev,
        distraction_blocker: {
          ...prev.distraction_blocker,
          blockedSites
        }
      }));
      
      setNewBlockedSite('');
    } catch (err) {
      console.error("Error adding blocked site:", err);
      toast.error("Erreur lors de l'ajout du site bloqué");
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemoveBlockedSite = async (site: string) => {
    if (!currentUser) return;
    
    try {
      setIsSaving(true);
      const blockedSites = settings.distraction_blocker.blockedSites.filter(s => s !== site);
      
      await updateBlockedSites(currentUser.uid, blockedSites);
      
      setSettings(prev => ({
        ...prev,
        distraction_blocker: {
          ...prev.distraction_blocker,
          blockedSites
        }
      }));
    } catch (err) {
      console.error("Error removing blocked site:", err);
      toast.error("Erreur lors de la suppression du site bloqué");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSyncGoogleCalendar = async () => {
    if (!currentUser || !googleAuthCode) return;
    
    try {
      setIsSyncingCalendar(true);
      await syncGoogleCalendar(currentUser.uid, googleAuthCode);
      toast.success("Synchronisation avec Google Calendar réussie");
      setGoogleAuthCode('');
    } catch (err) {
      console.error("Error syncing Google Calendar:", err);
      toast.error("Erreur lors de la synchronisation avec Google Calendar");
    } finally {
      setIsSyncingCalendar(false);
    }
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
          <TabsList className={`grid ${isMobile ? "grid-cols-2 mb-4" : "w-full grid-cols-5"}`}>
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
            <TabsTrigger value="integrations" className="flex items-center justify-center">
              <Calendar className="mr-2 h-4 w-4" />
              Intégrations
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

                <div className="flex items-center justify-between space-x-2">
                  <Label htmlFor="productivity-asmr" className="flex flex-col space-y-1">
                    <span>Productivity ASMR</span>
                    <span className="font-normal text-xs text-gray-500 dark:text-gray-400">
                      Sons satisfaisants quand vous cochez des tâches
                    </span>
                  </Label>
                  <Switch
                    id="productivity-asmr"
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

                <div className="p-4 border rounded-md space-y-4">
                  <div className="flex items-start">
                    <div className="mr-3">
                      <ShieldAlert className="h-5 w-5 text-orange-500" />
                    </div>
                    <div>
                      <h3 className="font-medium">Bloqueur de distractions</h3>
                      <p className="text-sm text-gray-500 mb-2">Bloquez les sites web qui vous distraient</p>
                      
                      <div className="flex items-center mb-4">
                        <Switch
                          id="distraction-blocker"
                          checked={settings.distraction_blocker.enabled}
                          onCheckedChange={handleToggleDistractionBlocker}
                          className="mr-2"
                        />
                        <Label htmlFor="distraction-blocker">
                          {settings.distraction_blocker.enabled ? 'Activé' : 'Désactivé'}
                        </Label>
                      </div>
                      
                      {settings.distraction_blocker.enabled && (
                        <div className="space-y-3">
                          <div className="flex gap-2">
                            <Input
                              placeholder="Ajouter un site (ex: instagram.com)"
                              value={newBlockedSite}
                              onChange={(e) => setNewBlockedSite(e.target.value)}
                            />
                            <Button 
                              onClick={handleAddBlockedSite} 
                              disabled={!newBlockedSite || isSaving}
                            >
                              Ajouter
                            </Button>
                          </div>
                          
                          <div className="flex flex-wrap gap-2">
                            {settings.distraction_blocker.blockedSites.map((site) => (
                              <Badge 
                                key={site} 
                                variant="secondary"
                                className="flex items-center gap-1 py-1.5"
                              >
                                {site}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-4 w-4 p-0 ml-1 hover:bg-transparent"
                                  onClick={() => handleRemoveBlockedSite(site)}
                                >
                                  ×
                                </Button>
                              </Badge>
                            ))}
                            {settings.distraction_blocker.blockedSites.length === 0 && (
                              <p className="text-sm text-gray-500">Aucun site bloqué</p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
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

          <TabsContent value="integrations" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Intégrations</CardTitle>
                <CardDescription>
                  Connectez-vous avec d'autres services
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-4 border rounded-md space-y-3">
                  <div className="flex items-start">
                    <div className="mr-3">
                      <Calendar className="h-5 w-5 text-blue-500" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium">Google Calendar</h3>
                      <p className="text-sm text-gray-500 mb-3">Synchronisez vos tâches et plannings avec Google Calendar</p>
                      
                      <div className="flex flex-col space-y-3">
                        <Input
                          placeholder="Code d'autorisation Google"
                          value={googleAuthCode}
                          onChange={(e) => setGoogleAuthCode(e.target.value)}
                        />
                        <Button 
                          onClick={handleSyncGoogleCalendar} 
                          disabled={!googleAuthCode || isSyncingCalendar}
                        >
                          {isSyncingCalendar ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Synchronisation...
                            </>
                          ) : (
                            'Synchroniser avec Google Calendar'
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 border rounded-md space-y-3">
                  <div className="flex items-start">
                    <div className="mr-3">
                      <Sparkles className="h-5 w-5 text-yellow-500" />
                    </div>
                    <div>
                      <h3 className="font-medium">Karma Productif</h3>
                      <p className="text-sm text-gray-500 mb-2">Plus vous êtes productif, plus vous débloquez des fonctionnalités</p>
                      
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-bold">{settings.karmaPoints || 0}</span>
                        <span className="text-sm">points Karma</span>
                      </div>
                      
                      <div className="space-y-1 mb-4">
                        <p className="text-sm font-medium">Fonctionnalités débloquées :</p>
                        <div className="flex flex-wrap gap-2">
                          {settings.unlockedFeatures && settings.unlockedFeatures.length > 0 ? 
                            settings.unlockedFeatures.map((feature) => (
                              <Badge key={feature} variant="outline">{feature}</Badge>
                            )) : 
                            <p className="text-sm text-gray-500">Aucune fonctionnalité débloquée pour l'instant</p>
                          }
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-500">
                        Continuez à utiliser DeepFlow régulièrement pour débloquer plus de fonctionnalités !
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 border rounded-md space-y-3">
                  <div className="flex items-start">
                    <div className="mr-3">
                      <MessageSquare className="h-5 w-5 text-green-500" />
                    </div>
                    <div>
                      <h3 className="font-medium">Assistant IA</h3>
                      <p className="text-sm text-gray-500 mb-2">L'assistant IA utilise vos données pour vous offrir des conseils personnalisés</p>
                      
                      <Button onClick={() => navigate('/analytics')}>
                        Accéder à l'assistant IA
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="p-4 border rounded-md space-y-3">
                  <div className="flex items-start">
                    <div className="mr-3">
                      <Mail className="h-5 w-5 text-purple-500" />
                    </div>
                    <div>
                      <h3 className="font-medium">Contactez-nous</h3>
                      <p className="text-sm text-gray-500 mb-3">Vous avez des questions ou des suggestions ?</p>
                      
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button>Nous contacter</Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                          <DialogHeader>
                            <DialogTitle>Contactez-nous</DialogTitle>
                            <DialogDescription>
                              Envoyez-nous un message et nous vous répondrons dès que possible.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div className="space-y-2">
                              <Label htmlFor="message">Message</Label>
                              <Textarea
                                id="message"
                                placeholder="Votre message..."
                                rows={5}
                              />
                            </div>
                          </div>
                          <DialogFooter>
                            <Button type="submit" onClick={() => toast.success("Message envoyé avec succès!")}>Envoyer</Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default SettingsPage;
