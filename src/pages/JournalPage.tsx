
import React, { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { BookOpen, Calendar, Edit, Plus, Save, Search, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

// Types pour les entries du journal
interface JournalEntry {
  id: string;
  title: string;
  content: string;
  date: string;
  mood?: 'happy' | 'neutral' | 'sad';
}

const JournalPage = () => {
  const [activeTab, setActiveTab] = useState("write");
  const [entries, setEntries] = useState<JournalEntry[]>([
    {
      id: '1',
      title: 'Première journée de travail',
      content: 'Aujourd\'hui était ma première journée au nouveau bureau. L\'équipe semble sympa et les projets sont intéressants.',
      date: '2025-03-22',
      mood: 'happy'
    },
    {
      id: '2',
      title: 'Réflexions sur le projet',
      content: 'J\'ai des doutes sur la direction que prend le projet. Je dois en parler avec l\'équipe demain.',
      date: '2025-03-21',
      mood: 'neutral'
    }
  ]);
  
  const [currentEntry, setCurrentEntry] = useState<JournalEntry>({
    id: '',
    title: '',
    content: '',
    date: new Date().toISOString().slice(0, 10),
    mood: 'neutral'
  });
  
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleSaveEntry = () => {
    if (!currentEntry.title || !currentEntry.content) {
      toast.error("Veuillez remplir tous les champs requis");
      return;
    }
    
    if (editingId) {
      // Mettre à jour une entrée existante
      setEntries(entries.map(entry => 
        entry.id === editingId ? {...currentEntry, id: editingId} : entry
      ));
      setEditingId(null);
      toast.success("Journal mis à jour avec succès");
    } else {
      // Créer une nouvelle entrée
      const newEntry = {
        ...currentEntry,
        id: Date.now().toString(),
        date: new Date().toISOString().slice(0, 10)
      };
      setEntries([newEntry, ...entries]);
      toast.success("Journal enregistré avec succès");
    }
    
    // Réinitialiser le formulaire
    setCurrentEntry({
      id: '',
      title: '',
      content: '',
      date: new Date().toISOString().slice(0, 10),
      mood: 'neutral'
    });
  };

  const handleEditEntry = (entry: JournalEntry) => {
    setCurrentEntry(entry);
    setEditingId(entry.id);
    setActiveTab("write");
  };

  const handleDeleteEntry = (id: string) => {
    setEntries(entries.filter(entry => entry.id !== id));
    toast.success("Journal supprimé");
    
    if (editingId === id) {
      setEditingId(null);
      setCurrentEntry({
        id: '',
        title: '',
        content: '',
        date: new Date().toISOString().slice(0, 10),
        mood: 'neutral'
      });
    }
  };

  const filteredEntries = entries.filter(entry => 
    entry.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    entry.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getMoodEmoji = (mood?: 'happy' | 'neutral' | 'sad') => {
    switch (mood) {
      case 'happy': return '😊';
      case 'sad': return '😔';
      default: return '😐';
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Journal</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Notez vos réflexions quotidiennes et suivez votre progression
          </p>
        </div>

        <Tabs defaultValue="write" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="write" className="flex items-center">
                <Edit className="mr-2 h-4 w-4" />
                Écrire
              </TabsTrigger>
              <TabsTrigger value="entries" className="flex items-center">
                <BookOpen className="mr-2 h-4 w-4" />
                Mes entrées
              </TabsTrigger>
            </TabsList>
            {activeTab === "entries" && (
              <div className="relative w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher dans le journal..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            )}
            {activeTab === "write" && !editingId && (
              <Button variant="outline" onClick={() => {
                setCurrentEntry({
                  id: '',
                  title: '',
                  content: '',
                  date: new Date().toISOString().slice(0, 10),
                  mood: 'neutral'
                });
              }}>
                <Plus className="mr-2 h-4 w-4" />
                Nouvelle entrée
              </Button>
            )}
          </div>

          <TabsContent value="write" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{editingId ? 'Modifier l\'entrée' : 'Nouvelle entrée'}</CardTitle>
                <CardDescription>
                  {editingId 
                    ? 'Modifiez votre entrée de journal' 
                    : 'Écrivez vos pensées et sentiments pour aujourd\'hui'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1">
                  <label htmlFor="title" className="text-sm font-medium">
                    Titre
                  </label>
                  <Input
                    id="title"
                    placeholder="Titre de votre entrée"
                    value={currentEntry.title}
                    onChange={(e) => setCurrentEntry({...currentEntry, title: e.target.value})}
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="content" className="text-sm font-medium">
                    Contenu
                  </label>
                  <Textarea
                    id="content"
                    placeholder="Qu'avez-vous en tête aujourd'hui?"
                    className="min-h-32"
                    value={currentEntry.content}
                    onChange={(e) => setCurrentEntry({...currentEntry, content: e.target.value})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium">
                    Humeur
                  </label>
                  <div className="flex space-x-4">
                    <Button
                      type="button"
                      variant={currentEntry.mood === 'happy' ? 'default' : 'outline'}
                      className="w-full"
                      onClick={() => setCurrentEntry({...currentEntry, mood: 'happy'})}
                    >
                      😊 Bonne
                    </Button>
                    <Button
                      type="button"
                      variant={currentEntry.mood === 'neutral' ? 'default' : 'outline'}
                      className="w-full"
                      onClick={() => setCurrentEntry({...currentEntry, mood: 'neutral'})}
                    >
                      😐 Neutre
                    </Button>
                    <Button
                      type="button"
                      variant={currentEntry.mood === 'sad' ? 'default' : 'outline'}
                      className="w-full"
                      onClick={() => setCurrentEntry({...currentEntry, mood: 'sad'})}
                    >
                      😔 Mauvaise
                    </Button>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => {
                  setActiveTab("entries");
                  if (editingId) {
                    setEditingId(null);
                    setCurrentEntry({
                      id: '',
                      title: '',
                      content: '',
                      date: new Date().toISOString().slice(0, 10),
                      mood: 'neutral'
                    });
                  }
                }}>
                  Annuler
                </Button>
                <Button onClick={handleSaveEntry}>
                  <Save className="mr-2 h-4 w-4" />
                  {editingId ? 'Mettre à jour' : 'Enregistrer'}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="entries" className="space-y-4">
            {filteredEntries.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-10">
                  <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-lg font-medium text-center">Aucune entrée trouvée</p>
                  <p className="text-sm text-muted-foreground text-center mt-1">
                    {searchTerm 
                      ? 'Essayez avec un autre terme de recherche'
                      : 'Commencez à écrire votre première entrée de journal'}
                  </p>
                  {!searchTerm && (
                    <Button className="mt-4" onClick={() => setActiveTab("write")}>
                      <Plus className="mr-2 h-4 w-4" />
                      Créer une entrée
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <>
                {filteredEntries.map((entry) => (
                  <Card key={entry.id}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="flex items-center">
                            {entry.title}
                            <span className="ml-2 text-lg">{getMoodEmoji(entry.mood)}</span>
                          </CardTitle>
                          <CardDescription>
                            <Calendar className="inline h-3 w-3 mr-1" />
                            {new Date(entry.date).toLocaleDateString('fr-FR', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </CardDescription>
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="ghost" size="icon" onClick={() => handleEditEntry(entry)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteEntry(entry.id)}>
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="whitespace-pre-line">{entry.content}</p>
                    </CardContent>
                  </Card>
                ))}
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default JournalPage;
