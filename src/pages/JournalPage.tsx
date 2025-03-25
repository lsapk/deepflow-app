
import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { db } from '@/services/firebase';
import { collection, addDoc, getDocs, query, where, orderBy, deleteDoc, doc, Timestamp, getDoc, setDoc } from 'firebase/firestore';
import { FilePlus, FileText, Trash2, Calendar, Tag, Search, Edit } from 'lucide-react';

interface JournalEntry {
  id: string;
  title: string;
  content: string;
  mood?: string;
  tags?: string[];
  createdAt: Date;
}

const JournalPage = () => {
  const { currentUser } = useAuth();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [newEntry, setNewEntry] = useState({
    title: '',
    content: '',
    mood: 'neutral',
    tags: ''
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (currentUser) {
      fetchEntries();
    }
  }, [currentUser]);

  const fetchEntries = async () => {
    if (!currentUser) return;
    
    try {
      setLoading(true);
      
      // Vérifier si la collection journalEntries existe pour l'utilisateur
      const userJournalRef = collection(db, 'journalEntries');
      const entriesQuery = query(
        userJournalRef,
        where('userId', '==', currentUser.uid),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(entriesQuery);
      
      if (querySnapshot.empty) {
        setEntries([]);
        setLoading(false);
        return;
      }
      
      const fetchedEntries = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          title: data.title,
          content: data.content,
          mood: data.mood,
          tags: data.tags,
          createdAt: data.createdAt.toDate()
        } as JournalEntry;
      });
      
      setEntries(fetchedEntries);
    } catch (error) {
      console.error("Error fetching journal entries:", error);
      // Vérifier si l'erreur est liée aux permissions Firebase
      if (error instanceof Error && error.message.includes("permission-denied")) {
        toast.error("Permissions insuffisantes. Reconnectez-vous");
      } else {
        toast.error("Erreur lors du chargement des entrées de journal");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewEntry(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!currentUser) return;
    
    if (!newEntry.title.trim() || !newEntry.content.trim()) {
      toast.error("Le titre et le contenu sont requis");
      return;
    }
    
    try {
      const tags = newEntry.tags
        ? newEntry.tags.split(',').map(tag => tag.trim())
        : [];
      
      // Créer un document avec un ID spécifique pour éviter les problèmes de permission
      const entryData = {
        userId: currentUser.uid,
        title: newEntry.title,
        content: newEntry.content,
        mood: newEntry.mood,
        tags,
        createdAt: Timestamp.now(),
      };
      
      const docRef = await addDoc(collection(db, 'journalEntries'), entryData);
      
      setNewEntry({
        title: '',
        content: '',
        mood: 'neutral',
        tags: ''
      });
      
      setIsDialogOpen(false);
      toast.success("Entrée de journal ajoutée avec succès");
      
      // Ajouter la nouvelle entrée à l'état local sans recharger
      setEntries(prev => [{
        id: docRef.id,
        title: entryData.title,
        content: entryData.content,
        mood: entryData.mood,
        tags: entryData.tags,
        createdAt: new Date()
      }, ...prev]);
      
    } catch (error) {
      console.error("Error adding journal entry:", error);
      toast.error("Erreur lors de l'ajout de l'entrée de journal");
    }
  };

  const deleteEntry = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'journalEntries', id));
      setEntries(entries.filter(entry => entry.id !== id));
      toast.success("Entrée supprimée avec succès");
    } catch (error) {
      console.error("Error deleting journal entry:", error);
      toast.error("Erreur lors de la suppression de l'entrée");
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredEntries = searchTerm
    ? entries.filter(entry =>
        entry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (entry.tags && entry.tags.some(tag => 
          tag.toLowerCase().includes(searchTerm.toLowerCase())
        ))
      )
    : entries;

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Journal</h1>
            <p className="text-gray-500 dark:text-gray-400">
              Notez vos pensées, réflexions et idées
            </p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button data-testid="new-note-button" className="sm:self-start">
                <FilePlus className="mr-2 h-4 w-4" />
                Nouvelle note
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[550px]">
              <DialogHeader>
                <DialogTitle>Ajouter une nouvelle entrée</DialogTitle>
                <DialogDescription>
                  Notez vos pensées, idées ou réflexions du jour.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Input
                    name="title"
                    placeholder="Titre"
                    value={newEntry.title}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Textarea
                    name="content"
                    placeholder="Contenu de votre note..."
                    value={newEntry.content}
                    onChange={handleChange}
                    rows={8}
                  />
                </div>
                <div className="space-y-2">
                  <Input
                    name="tags"
                    placeholder="Tags (séparés par des virgules)"
                    value={newEntry.tags}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Annuler
                </Button>
                <Button onClick={handleSubmit}>Enregistrer</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input
            className="pl-10"
            placeholder="Rechercher dans votre journal..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="space-y-4">
          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, index) => (
                <Card key={index} className="animate-pulse">
                  <CardHeader className="pb-2">
                    <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded w-1/3 mb-2"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/4"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded"></div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded"></div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-2/3"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredEntries.length > 0 ? (
            filteredEntries.map(entry => (
              <Card key={entry.id}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle>{entry.title}</CardTitle>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => deleteEntry(entry.id)}
                      className="h-8 w-8 text-gray-500 hover:text-red-500"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                  <CardDescription className="flex items-center">
                    <Calendar className="mr-1 h-3 w-3" />
                    {formatDate(entry.createdAt)}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-line">{entry.content}</p>
                </CardContent>
                {entry.tags && entry.tags.length > 0 && (
                  <CardFooter className="pt-0 flex flex-wrap gap-1">
                    {entry.tags.map((tag, index) => (
                      <div 
                        key={index} 
                        className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-2 py-1 rounded-full flex items-center"
                      >
                        <Tag className="mr-1 h-3 w-3" />
                        {tag}
                      </div>
                    ))}
                  </CardFooter>
                )}
              </Card>
            ))
          ) : (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium mb-2">Votre journal est vide</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                Commencez à écrire vos pensées et réflexions
              </p>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Edit className="mr-2 h-4 w-4" />
                Créer une première note
              </Button>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default JournalPage;
