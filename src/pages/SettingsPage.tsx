
import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { 
  BellRing,
  Clock,
  Languages,
  Moon,
  Palette,
  Save,
  ShieldCheck,
  Sun,
  UserCog,
  Volume2
} from 'lucide-react';

const SettingsPage = () => {
  const [theme, setTheme] = useState<string>('system');
  const [language, setLanguage] = useState<string>('fr');
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(true);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [focusMode, setFocusMode] = useState<boolean>(false);
  const [clockFormat, setClockFormat] = useState<string>('24h');
  const [saveChanges, setSaveChanges] = useState<boolean>(false);

  // Effet pour simuler le chargement des préférences
  useEffect(() => {
    const timeout = setTimeout(() => {
      // Normalement chargé depuis une API ou le localStorage
    }, 1000);
    
    return () => clearTimeout(timeout);
  }, []);

  const handleThemeChange = (value: string) => {
    setTheme(value);
    setSaveChanges(true);
    
    if (value === 'light') {
      document.documentElement.classList.remove('dark');
    } else if (value === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      // Système - détecter automatiquement
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  };

  const handleSaveSettings = () => {
    // Simuler une sauvegarde en base de données
    toast.success("Paramètres enregistrés avec succès");
    setSaveChanges(false);
  };

  const handleResetSettings = () => {
    // Réinitialiser tous les paramètres
    setTheme('system');
    setLanguage('fr');
    setNotificationsEnabled(true);
    setSoundEnabled(true);
    setFocusMode(false);
    setClockFormat('24h');
    
    toast.success("Paramètres réinitialisés");
    setSaveChanges(true);
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Paramètres</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Personnalisez votre expérience DeepFlow
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="md:col-span-1">
            <CardContent className="pt-6">
              <div className="space-y-2">
                <div className="flex items-center p-2 rounded-md bg-gray-100 dark:bg-gray-800">
                  <Palette className="mr-2 h-5 w-5 text-primary" />
                  <span className="font-medium">Apparence</span>
                </div>
                
                <div className="flex items-center p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800">
                  <BellRing className="mr-2 h-5 w-5 text-gray-500" />
                  <span>Notifications</span>
                </div>
                
                <div className="flex items-center p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800">
                  <Languages className="mr-2 h-5 w-5 text-gray-500" />
                  <span>Langue</span>
                </div>
                
                <div className="flex items-center p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800">
                  <UserCog className="mr-2 h-5 w-5 text-gray-500" />
                  <span>Interface</span>
                </div>
                
                <div className="flex items-center p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800">
                  <ShieldCheck className="mr-2 h-5 w-5 text-gray-500" />
                  <span>Confidentialité</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="md:col-span-3">
            <Tabs defaultValue="appearance">
              <TabsList className="grid grid-cols-3">
                <TabsTrigger value="appearance">Apparence</TabsTrigger>
                <TabsTrigger value="notifications">Notifications</TabsTrigger>
                <TabsTrigger value="interface">Interface</TabsTrigger>
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
                            theme === 'light' 
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
                            theme === 'dark' 
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
                            theme === 'system' 
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
                    
                    <Separator />
                    
                    <div className="space-y-2">
                      <Label htmlFor="language">Langue</Label>
                      <Select value={language} onValueChange={(value) => {
                        setLanguage(value);
                        setSaveChanges(true);
                      }}>
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
                        checked={notificationsEnabled}
                        onCheckedChange={(checked) => {
                          setNotificationsEnabled(checked);
                          setSaveChanges(true);
                        }}
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
                        checked={soundEnabled}
                        onCheckedChange={(checked) => {
                          setSoundEnabled(checked);
                          setSaveChanges(true);
                        }}
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
                        checked={focusMode}
                        onCheckedChange={(checked) => {
                          setFocusMode(checked);
                          setSaveChanges(true);
                        }}
                      />
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-2">
                      <Label htmlFor="clock-format">Format d'horloge</Label>
                      <Select 
                        value={clockFormat} 
                        onValueChange={(value) => {
                          setClockFormat(value);
                          setSaveChanges(true);
                        }}
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
                
                <Card>
                  <CardHeader>
                    <CardTitle>Exportation et réinitialisation</CardTitle>
                    <CardDescription>
                      Gérez vos données et réinitialisez les paramètres
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                      <Button variant="outline" onClick={() => toast.success("Données exportées")}>
                        Exporter les données
                      </Button>
                      
                      <Button variant="outline" onClick={handleResetSettings}>
                        Réinitialiser les paramètres
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
            
            {saveChanges && (
              <div className="mt-6 flex justify-end">
                <Button onClick={handleSaveSettings}>
                  <Save className="mr-2 h-4 w-4" />
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
