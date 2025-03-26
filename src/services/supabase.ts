
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Json } from '@/integrations/supabase/types';

// Types pour notre application
export interface UserProfile {
  id: string;
  display_name?: string;
  email?: string;
  photo_url?: string;
  bio?: string;
  created_at?: string;
  updated_at?: string;
}

export interface UserSettings {
  id: string;
  theme?: string;
  language?: string;
  notifications_enabled?: boolean;
  sound_enabled?: boolean;
  focus_mode?: boolean;
  clock_format?: string;
  karma_points?: number;
  unlocked_features?: string[];
  created_at?: string;
  updated_at?: string;
}

export interface Habit {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  frequency: 'daily' | 'weekly';
  streak: number;
  target: number;
  category?: string;
  last_completed_at?: string;
  created_at?: string;
  updated_at?: string;
  color?: string; // Ajout de la propriété color utilisée dans HabitsPage
}

export interface JournalEntry {
  id: string;
  user_id: string;
  title: string;
  content: string;
  mood?: 'great' | 'good' | 'neutral' | 'bad' | 'terrible';
  tags?: string[] | null;
  created_at?: string;
  updated_at?: string;
}

// Authentification
export const registerUser = async (email: string, password: string, displayName: string) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: displayName
        }
      }
    });

    if (error) throw error;
    
    toast.success("Compte créé avec succès !");
    return data.user;
  } catch (error: any) {
    let message = "Une erreur est survenue lors de l'inscription";
    
    if (error.message.includes('email')) {
      message = "Cette adresse email est déjà utilisée ou invalide";
    } else if (error.message.includes('password')) {
      message = "Le mot de passe est trop faible";
    }
    
    toast.error(message);
    throw error;
  }
};

export const loginUser = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;
    
    toast.success("Connexion réussie !");
    return data.user;
  } catch (error: any) {
    let message = "Échec de la connexion";
    
    if (error.message.includes('Invalid login credentials')) {
      message = "Email ou mot de passe incorrect";
    } else if (error.message.includes('too many requests')) {
      message = "Trop de tentatives échouées. Veuillez réessayer plus tard";
    }
    
    toast.error(message);
    throw error;
  }
};

export const signInWithGoogle = async () => {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin + '/dashboard'
      }
    });

    if (error) throw error;
    
    // Note: avec OAuth, on ne reçoit pas immédiatement l'utilisateur
    // car il y a une redirection. Le succès sera géré au retour.
    return null;
  } catch (error: any) {
    toast.error("Erreur lors de la connexion avec Google");
    throw error;
  }
};

export const logoutUser = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    
    toast.success("Déconnexion réussie");
    return true;
  } catch (error) {
    toast.error("Erreur lors de la déconnexion");
    throw error;
  }
};

export const resetPassword = async (email: string) => {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + '/reset-password-confirmation',
    });
    
    if (error) throw error;
    
    toast.success("Email de réinitialisation envoyé !");
    return true;
  } catch (error: any) {
    let message = "Erreur lors de l'envoi de l'email de réinitialisation";
    toast.error(message);
    throw error;
  }
};

// Profil utilisateur
export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Erreur lors de la récupération du profil:', error);
    return null;
  }
};

export const updateUserProfile = async (userId: string, updates: Partial<UserProfile>) => {
  try {
    const { error } = await supabase
      .from('user_profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (error) throw error;
    
    toast.success("Profil mis à jour avec succès");
    return true;
  } catch (error) {
    console.error("Error updating profile:", error);
    toast.error("Erreur lors de la mise à jour du profil");
    throw error;
  }
};

// Upload d'avatar
export const uploadProfileImage = async (userId: string, file: File): Promise<string> => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}-${Date.now()}.${fileExt}`;
    const filePath = `avatars/${fileName}`;
    
    // Upload de l'image
    const { error: uploadError } = await supabase.storage
      .from('profile-images')
      .upload(filePath, file);
    
    if (uploadError) throw uploadError;
    
    // Récupérer l'URL publique
    const { data } = supabase.storage
      .from('profile-images')
      .getPublicUrl(filePath);
    
    // Mettre à jour le profil avec la nouvelle photo
    await updateUserProfile(userId, { 
      photo_url: data.publicUrl 
    });
    
    toast.success("Photo de profil mise à jour avec succès");
    return data.publicUrl;
  } catch (error: any) {
    console.error("Error uploading image:", error);
    toast.error("Erreur lors de l'upload de la photo de profil");
    throw error;
  }
};

// Gestion des paramètres utilisateur
export const getUserSettings = async (userId: string): Promise<UserSettings | null> => {
  try {
    const { data, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    
    // Convertir les unlocked_features de Json à string[]
    if (data) {
      return {
        ...data,
        unlocked_features: Array.isArray(data.unlocked_features) 
          ? data.unlocked_features 
          : []
      };
    }
    
    return null;
  } catch (error) {
    console.error('Erreur lors de la récupération des paramètres:', error);
    return null;
  }
};

export const updateUserSettings = async (userId: string, updates: Partial<UserSettings>) => {
  try {
    const { error } = await supabase
      .from('user_settings')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (error) throw error;
    
    toast.success("Paramètres mis à jour avec succès");
    return true;
  } catch (error) {
    console.error("Error updating settings:", error);
    toast.error("Erreur lors de la mise à jour des paramètres");
    throw error;
  }
};

// Habitudes
export const getHabits = async (userId: string): Promise<Habit[]> => {
  try {
    const { data, error } = await supabase
      .from('habits')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    // Assurer que frequency est bien typé
    return (data || []).map(habit => ({
      ...habit,
      frequency: habit.frequency as 'daily' | 'weekly'
    }));
  } catch (error) {
    console.error("Error fetching habits:", error);
    throw error;
  }
};

export const createHabit = async (
  userId: string, 
  habitData: Omit<Habit, 'id' | 'user_id' | 'created_at' | 'updated_at'>
): Promise<Habit> => {
  try {
    const { data, error } = await supabase
      .from('habits')
      .insert({
        ...habitData,
        user_id: userId,
        streak: habitData.streak || 0
      })
      .select()
      .single();

    if (error) throw error;
    
    toast.success("Habitude ajoutée avec succès");
    return {
      ...data,
      frequency: data.frequency as 'daily' | 'weekly'
    };
  } catch (error) {
    console.error("Error adding habit:", error);
    toast.error("Erreur lors de l'ajout de l'habitude");
    throw error;
  }
};

export const updateHabit = async (id: string, updates: Partial<Habit>): Promise<Habit> => {
  try {
    // Supprimer user_id des mises à jour si présent
    const { user_id, ...updatesWithoutUserId } = updates;
    
    const { data, error } = await supabase
      .from('habits')
      .update({
        ...updatesWithoutUserId,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    
    toast.success("Habitude mise à jour avec succès");
    return {
      ...data,
      frequency: data.frequency as 'daily' | 'weekly'
    };
  } catch (error) {
    console.error("Error updating habit:", error);
    toast.error("Erreur lors de la mise à jour de l'habitude");
    throw error;
  }
};

export const deleteHabit = async (id: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('habits')
      .delete()
      .eq('id', id);

    if (error) throw error;
    
    toast.success("Habitude supprimée avec succès");
  } catch (error) {
    console.error("Error deleting habit:", error);
    toast.error("Erreur lors de la suppression de l'habitude");
    throw error;
  }
};

// Journal
export const getJournalEntries = async (userId: string): Promise<JournalEntry[]> => {
  try {
    const { data, error } = await supabase
      .from('journal_entries')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    // Transformer les données pour assurer la compatibilité avec notre interface
    return (data || []).map(entry => ({
      ...entry,
      mood: (entry.mood as 'great' | 'good' | 'neutral' | 'bad' | 'terrible' | null) || undefined,
      tags: Array.isArray(entry.tags) ? entry.tags : []
    }));
  } catch (error) {
    console.error("Error fetching journal entries:", error);
    throw error;
  }
};

export const createJournalEntry = async (
  userId: string,
  entryData: Omit<JournalEntry, 'id' | 'user_id' | 'created_at' | 'updated_at'>
): Promise<JournalEntry> => {
  try {
    const { data, error } = await supabase
      .from('journal_entries')
      .insert({
        ...entryData,
        user_id: userId
      })
      .select()
      .single();

    if (error) throw error;
    
    toast.success("Entrée de journal créée avec succès");
    return {
      ...data,
      mood: data.mood as 'great' | 'good' | 'neutral' | 'bad' | 'terrible' | undefined,
      tags: Array.isArray(data.tags) ? data.tags : []
    };
  } catch (error) {
    console.error("Error creating journal entry:", error);
    toast.error("Erreur lors de la création de l'entrée de journal");
    throw error;
  }
};

export const updateJournalEntry = async (id: string, updates: Partial<JournalEntry>): Promise<JournalEntry> => {
  try {
    // Supprimer user_id des mises à jour si présent
    const { user_id, ...updatesWithoutUserId } = updates;
    
    const { data, error } = await supabase
      .from('journal_entries')
      .update({
        ...updatesWithoutUserId,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    
    toast.success("Entrée de journal mise à jour avec succès");
    return {
      ...data,
      mood: data.mood as 'great' | 'good' | 'neutral' | 'bad' | 'terrible' | undefined,
      tags: Array.isArray(data.tags) ? data.tags : []
    };
  } catch (error) {
    console.error("Error updating journal entry:", error);
    toast.error("Erreur lors de la mise à jour de l'entrée de journal");
    throw error;
  }
};

export const deleteJournalEntry = async (id: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('journal_entries')
      .delete()
      .eq('id', id);

    if (error) throw error;
    
    toast.success("Entrée de journal supprimée avec succès");
  } catch (error) {
    console.error("Error deleting journal entry:", error);
    toast.error("Erreur lors de la suppression de l'entrée de journal");
    throw error;
  }
};
