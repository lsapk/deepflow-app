
import React, { useState, useRef, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { User, updateEmail, updatePassword, sendEmailVerification } from 'firebase/auth';
import { db, uploadProfileImage, updateUserProfile } from '@/services/firebase';
import { Camera, CheckCircle, Key, User as UserIcon, Mail, Shield, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { useIsMobile } from '@/hooks/use-mobile';

const ProfilePage = () => {
  const { currentUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [photoURL, setPhotoURL] = useState<string | null>(currentUser?.photoURL || '');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileUploading, setFileUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isMobile = useIsMobile();
  
  const [profileData, setProfileData] = useState({
    displayName: currentUser?.displayName || '',
    email: currentUser?.email || '',
    bio: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    const loadUserProfile = async () => {
      if (!currentUser) return;
      
      try {
        setIsLoadingProfile(true);
        setError(null);
        
        const userProfileRef = doc(db, "userProfiles", currentUser.uid);
        const userProfileDoc = await getDoc(userProfileRef);
        
        if (userProfileDoc.exists()) {
          const profileData = userProfileDoc.data() as any;
          setProfileData(prev => ({
            ...prev,
            displayName: profileData.displayName || currentUser.displayName || '',
            email: profileData.email || currentUser.email || '',
            bio: profileData.bio || '',
          }));
          
          if (profileData.photoURL) {
            setPhotoURL(profileData.photoURL);
          } else if (currentUser.photoURL) {
            setPhotoURL(currentUser.photoURL);
          }
        }
      } catch (err) {
        console.error("Error loading profile:", err);
        setError("Erreur lors du chargement du profil");
        toast.error("Erreur lors du chargement du profil");
      } finally {
        setIsLoadingProfile(false);
      }
    };
    
    loadUserProfile();
  }, [currentUser]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      await updateUserProfile(currentUser, {
        displayName: profileData.displayName,
        bio: profileData.bio
      });
      
      toast.success("Profil mis à jour avec succès");
    } catch (error) {
      console.error("Error updating profile:", error);
      setError("Erreur lors de la mise à jour du profil");
      toast.error("Erreur lors de la mise à jour du profil");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      await updateEmail(currentUser, profileData.email);
      
      await updateUserProfile(currentUser, {
        email: profileData.email
      });
      
      // Envoyer un email de vérification
      await sendEmailVerification(currentUser);
      
      toast.success("Email mis à jour avec succès. Un email de vérification a été envoyé.");
    } catch (error: any) {
      console.error("Error updating email:", error);
      let errorMessage = "Erreur lors de la mise à jour de l'email";
      
      if (error.code === 'auth/requires-recent-login') {
        errorMessage = "Pour des raisons de sécurité, veuillez vous reconnecter avant de modifier votre email";
      } else if (error.code === 'auth/email-already-in-use') {
        errorMessage = "Cet email est déjà utilisé par un autre compte";
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = "L'email fourni n'est pas valide";
      }
      
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    
    if (profileData.newPassword !== profileData.confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas");
      setError("Les mots de passe ne correspondent pas");
      return;
    }
    
    if (profileData.newPassword.length < 6) {
      toast.error("Le mot de passe doit contenir au moins 6 caractères");
      setError("Le mot de passe doit contenir au moins 6 caractères");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      await updatePassword(currentUser, profileData.newPassword);
      setProfileData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      }));
      toast.success("Mot de passe mis à jour avec succès");
    } catch (error: any) {
      console.error("Error updating password:", error);
      let errorMessage = "Erreur lors de la mise à jour du mot de passe";
      
      if (error.code === 'auth/requires-recent-login') {
        errorMessage = "Pour des raisons de sécurité, veuillez vous reconnecter avant de modifier votre mot de passe";
      }
      
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentUser) return;

    setFileUploading(true);
    setError(null);
    
    try {
      console.log("Starting file upload...");
      const downloadURL = await uploadProfileImage(currentUser, file);
      console.log("File uploaded successfully, URL:", downloadURL);
      
      // Mettre à jour l'avatar dans l'interface immédiatement
      setPhotoURL(downloadURL);
      
      toast.success("Photo de profil mise à jour avec succès");
    } catch (error: any) {
      console.error("Error uploading profile photo:", error);
      setError(error.message || "Erreur lors de l'upload de la photo de profil");
      toast.error(error.message || "Erreur lors de l'upload de la photo de profil");
    } finally {
      setFileUploading(false);
      
      // Réinitialiser l'input file pour permettre de sélectionner à nouveau le même fichier
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleEmailVerification = async () => {
    if (!currentUser) return;
    
    try {
      setIsLoading(true);
      await sendEmailVerification(currentUser);
      toast.success("Un email de vérification a été envoyé à votre adresse email");
    } catch (error) {
      console.error("Error sending verification email:", error);
      toast.error("Erreur lors de l'envoi de l'email de vérification");
    } finally {
      setIsLoading(false);
    }
  };

  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase();
  };

  const renderAvatar = () => {
    return (
      <div className="relative">
        <Avatar 
          className="h-24 w-24 cursor-pointer" 
          onClick={handleAvatarClick}
        >
          {photoURL ? (
            <AvatarImage src={photoURL} alt="Profile" />
          ) : (
            <AvatarFallback className="text-xl bg-primary text-primary-foreground">
              {getInitials(profileData.displayName)}
            </AvatarFallback>
          )}
          
          <div className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-1 shadow-md">
            {fileUploading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Camera className="h-4 w-4" />
            )}
          </div>
        </Avatar>
        
        <input 
          type="file" 
          ref={fileInputRef} 
          accept="image/*" 
          className="hidden" 
          onChange={handleFileChange}
        />
      </div>
    );
  };

  if (isLoadingProfile) {
    return (
      <MainLayout>
        <div className="min-h-[60vh] flex flex-col items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-gray-500 dark:text-gray-400">Chargement du profil...</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Profil</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Gérez vos informations personnelles et vos paramètres
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

        <div className={`grid grid-cols-1 ${isMobile ? "" : "md:grid-cols-4"} gap-6`}>
          <Card className={`${isMobile ? "" : "md:col-span-1"}`}>
            <CardContent className="pt-6 flex flex-col items-center">
              {renderAvatar()}
              
              <h2 className="text-xl font-semibold mb-1">{profileData.displayName || 'Utilisateur'}</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{profileData.email}</p>
              
              {currentUser?.emailVerified ? (
                <div className="flex items-center text-green-600 text-sm mb-4">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Email vérifié
                </div>
              ) : (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mb-4 mt-2 text-xs" 
                  onClick={handleEmailVerification}
                >
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Vérifier email
                </Button>
              )}
              
              <Separator className="mb-6" />
              
              <div className="w-full space-y-2">
                <div className="flex items-center p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800">
                  <UserIcon className="mr-2 h-5 w-5 text-gray-500" />
                  <span>Profil</span>
                </div>
                <div className="flex items-center p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800">
                  <Shield className="mr-2 h-5 w-5 text-gray-500" />
                  <span>Sécurité</span>
                </div>
              </div>
              
              <Separator className="my-6" />
              
              <div className="w-full">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Membre depuis</p>
                <p className="text-sm">
                  {currentUser?.metadata.creationTime 
                    ? new Date(currentUser.metadata.creationTime).toLocaleDateString('fr-FR')
                    : 'Date inconnue'}
                </p>
              </div>
            </CardContent>
          </Card>
          
          <div className={`${isMobile ? "" : "md:col-span-3"}`}>
            <Tabs defaultValue="profile">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="profile" className="flex items-center justify-center">
                  <UserIcon className="mr-2 h-4 w-4" />
                  Profil
                </TabsTrigger>
                <TabsTrigger value="email" className="flex items-center justify-center">
                  <Mail className="mr-2 h-4 w-4" />
                  Email
                </TabsTrigger>
                <TabsTrigger value="password" className="flex items-center justify-center">
                  <Key className="mr-2 h-4 w-4" />
                  Mot de passe
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="profile">
                <Card>
                  <form onSubmit={handleProfileUpdate}>
                    <CardHeader>
                      <CardTitle>Informations personnelles</CardTitle>
                      <CardDescription>
                        Mettez à jour vos informations personnelles
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="displayName">Nom complet</Label>
                        <Input
                          id="displayName"
                          name="displayName"
                          value={profileData.displayName}
                          onChange={handleChange}
                          placeholder="Votre nom"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="bio">Bio</Label>
                        <Textarea
                          id="bio"
                          name="bio"
                          value={profileData.bio}
                          onChange={handleChange}
                          placeholder="Parlez-nous de vous"
                          rows={4}
                        />
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <Button type="button" variant="outline">Annuler</Button>
                      <Button type="submit" disabled={isLoading}>
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Enregistrement...
                          </>
                        ) : (
                          'Enregistrer les modifications'
                        )}
                      </Button>
                    </CardFooter>
                  </form>
                </Card>
              </TabsContent>
              
              <TabsContent value="email">
                <Card>
                  <form onSubmit={handleEmailUpdate}>
                    <CardHeader>
                      <CardTitle>Changer l'adresse email</CardTitle>
                      <CardDescription>
                        Mettez à jour votre adresse email
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">Adresse email</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={profileData.email}
                          onChange={handleChange}
                          placeholder="votre@email.com"
                        />
                      </div>
                      
                      <div className="bg-yellow-50 dark:bg-yellow-950 p-4 rounded-md">
                        <p className="text-sm text-yellow-800 dark:text-yellow-300">
                          <strong>Note:</strong> La modification de votre adresse email nécessitera une vérification.
                        </p>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <Button type="button" variant="outline">Annuler</Button>
                      <Button type="submit" disabled={isLoading}>
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Mise à jour...
                          </>
                        ) : (
                          'Mettre à jour l\'email'
                        )}
                      </Button>
                    </CardFooter>
                  </form>
                </Card>
              </TabsContent>
              
              <TabsContent value="password">
                <Card>
                  <form onSubmit={handlePasswordUpdate}>
                    <CardHeader>
                      <CardTitle>Changer le mot de passe</CardTitle>
                      <CardDescription>
                        Mettez à jour votre mot de passe pour sécuriser votre compte
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="currentPassword">Mot de passe actuel</Label>
                        <Input
                          id="currentPassword"
                          name="currentPassword"
                          type="password"
                          value={profileData.currentPassword}
                          onChange={handleChange}
                          placeholder="••••••••"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="newPassword">Nouveau mot de passe</Label>
                        <Input
                          id="newPassword"
                          name="newPassword"
                          type="password"
                          value={profileData.newPassword}
                          onChange={handleChange}
                          placeholder="••••••••"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                        <Input
                          id="confirmPassword"
                          name="confirmPassword"
                          type="password"
                          value={profileData.confirmPassword}
                          onChange={handleChange}
                          placeholder="••••••••"
                        />
                      </div>
                      
                      <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-md">
                        <p className="text-sm text-blue-800 dark:text-blue-300">
                          <CheckCircle className="inline-block h-4 w-4 mr-1" />
                          Utilisez au moins 8 caractères, incluant des lettres majuscules, minuscules, chiffres et symboles.
                        </p>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <Button type="button" variant="outline">Annuler</Button>
                      <Button type="submit" disabled={isLoading}>
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Mise à jour...
                          </>
                        ) : (
                          'Mettre à jour le mot de passe'
                        )}
                      </Button>
                    </CardFooter>
                  </form>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default ProfilePage;
