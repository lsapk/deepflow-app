
import React, { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { CheckSquare, Clock, Plus, Save, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Event {
  id: string;
  title: string;
  description: string;
  date: Date;
  startTime: string;
  endTime: string;
  type: 'meeting' | 'personal' | 'task' | 'reminder';
}

const PlanningPage = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [events, setEvents] = useState<Event[]>([
    {
      id: '1',
      title: 'Réunion d\'équipe',
      description: 'Revue de projet hebdomadaire avec l\'équipe',
      date: new Date(2025, 2, 25),
      startTime: '10:00',
      endTime: '11:00',
      type: 'meeting'
    },
    {
      id: '2',
      title: 'Déjeuner avec Jean',
      description: 'Restaurant Le Bistrot',
      date: new Date(2025, 2, 25),
      startTime: '12:30',
      endTime: '14:00',
      type: 'personal'
    },
    {
      id: '3',
      title: 'Finaliser la présentation',
      description: 'Préparer les slides pour la réunion de demain',
      date: new Date(2025, 2, 26),
      startTime: '15:00',
      endTime: '17:00',
      type: 'task'
    }
  ]);

  const [newEvent, setNewEvent] = useState<Omit<Event, 'id'>>({
    title: '',
    description: '',
    date: selectedDate,
    startTime: '',
    endTime: '',
    type: 'meeting'
  });

  const [isCreatingEvent, setIsCreatingEvent] = useState(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);

  // Jours avec événements pour le calendrier
  const daysWithEvents = events.map(event => new Date(event.date));

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
    }
  };

  const handleCreateEvent = () => {
    setNewEvent({
      title: '',
      description: '',
      date: selectedDate,
      startTime: '',
      endTime: '',
      type: 'meeting'
    });
    setEditingEventId(null);
    setIsCreatingEvent(true);
  };

  const handleEventChange = (field: keyof Omit<Event, 'id'>, value: any) => {
    setNewEvent({ ...newEvent, [field]: value });
  };

  const handleSaveEvent = () => {
    if (!newEvent.title || !newEvent.startTime) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    if (editingEventId) {
      // Mettre à jour un événement existant
      setEvents(events.map(event => 
        event.id === editingEventId 
          ? { ...newEvent, id: editingEventId } 
          : event
      ));
      toast.success("Événement mis à jour");
    } else {
      // Créer un nouvel événement
      const event: Event = {
        id: Date.now().toString(),
        ...newEvent
      };
      setEvents([...events, event]);
      toast.success("Événement ajouté");
    }

    setIsCreatingEvent(false);
    setEditingEventId(null);
  };

  const handleEditEvent = (event: Event) => {
    setNewEvent({
      title: event.title,
      description: event.description,
      date: event.date,
      startTime: event.startTime,
      endTime: event.endTime,
      type: event.type
    });
    setEditingEventId(event.id);
    setIsCreatingEvent(true);
  };

  const handleDeleteEvent = (id: string) => {
    setEvents(events.filter(event => event.id !== id));
    toast.success("Événement supprimé");
  };

  // Filtrer les événements pour la date sélectionnée
  const eventsForSelectedDate = events.filter(
    event => format(event.date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')
  ).sort((a, b) => a.startTime.localeCompare(b.startTime));

  // Obtenir les événements pour chaque jour du mois courant
  const eventsByDay = events.reduce((acc: {[key: string]: Event[]}, event) => {
    const dateKey = format(event.date, 'yyyy-MM-dd');
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(event);
    return acc;
  }, {});

  // Fonction pour obtenir la classe CSS du type d'événement
  const getEventTypeClass = (type: string) => {
    switch (type) {
      case 'meeting': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'personal': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      case 'task': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'reminder': return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  // Fonction pour obtenir le label du type d'événement
  const getEventTypeLabel = (type: string) => {
    switch (type) {
      case 'meeting': return 'Réunion';
      case 'personal': return 'Personnel';
      case 'task': return 'Tâche';
      case 'reminder': return 'Rappel';
      default: return 'Autre';
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Planification</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Gérez votre emploi du temps et vos événements
          </p>
        </div>

        <Tabs defaultValue="day" className="space-y-6">
          <div className="flex justify-between items-center">
            <TabsList>
              <TabsTrigger value="day">Jour</TabsTrigger>
              <TabsTrigger value="month">Mois</TabsTrigger>
            </TabsList>
            <Button onClick={handleCreateEvent}>
              <Plus className="mr-2 h-4 w-4" />
              Nouvel événement
            </Button>
          </div>

          <TabsContent value="day" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="md:col-span-1">
                <CardHeader>
                  <CardTitle>Calendrier</CardTitle>
                </CardHeader>
                <CardContent>
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={handleDateSelect}
                    className="rounded-md border"
                    modifiers={{
                      hasEvents: daysWithEvents
                    }}
                    modifiersClassNames={{
                      hasEvents: "font-bold bg-blue-50 dark:bg-blue-950"
                    }}
                    locale={fr}
                  />
                </CardContent>
              </Card>

              <Card className="md:col-span-2">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>
                    {format(selectedDate, 'EEEE d MMMM yyyy', { locale: fr })}
                  </CardTitle>
                  {eventsForSelectedDate.length === 0 && (
                    <Button variant="ghost" size="sm" onClick={handleCreateEvent}>
                      Ajouter
                    </Button>
                  )}
                </CardHeader>
                <CardContent>
                  {eventsForSelectedDate.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 text-center">
                      <Clock className="h-10 w-10 text-gray-400 mb-3" />
                      <h3 className="text-lg font-medium mb-1">Aucun événement prévu</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                        Vous n'avez aucun événement programmé pour cette journée
                      </p>
                      <Button onClick={handleCreateEvent}>
                        <Plus className="mr-2 h-4 w-4" />
                        Ajouter un événement
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {eventsForSelectedDate.map(event => (
                        <div 
                          key={event.id} 
                          className="flex flex-col sm:flex-row sm:items-start border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        >
                          <div className="sm:w-32 flex-shrink-0 text-sm font-medium mb-2 sm:mb-0">
                            {event.startTime} - {event.endTime}
                          </div>
                          <div className="flex-grow">
                            <div className="flex flex-wrap gap-2 justify-between">
                              <div>
                                <h3 className="font-medium">{event.title}</h3>
                                <span className={`inline-block px-2 py-1 text-xs rounded-full mt-1 ${getEventTypeClass(event.type)}`}>
                                  {getEventTypeLabel(event.type)}
                                </span>
                              </div>
                              <div className="flex space-x-1">
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  onClick={() => handleEditEvent(event)}
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                  </svg>
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  onClick={() => handleDeleteEvent(event.id)}
                                >
                                  <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                              </div>
                            </div>
                            {event.description && (
                              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                {event.description}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="month">
            <Card>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-1">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={handleDateSelect}
                      className="rounded-md border"
                      modifiers={{
                        hasEvents: daysWithEvents
                      }}
                      modifiersClassNames={{
                        hasEvents: "font-bold bg-blue-50 dark:bg-blue-950"
                      }}
                      locale={fr}
                    />

                    <div className="mt-6">
                      <h3 className="text-lg font-medium mb-3">Légende</h3>
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <div className="w-4 h-4 rounded-full bg-blue-500 mr-2"></div>
                          <span>Réunion</span>
                        </div>
                        <div className="flex items-center">
                          <div className="w-4 h-4 rounded-full bg-purple-500 mr-2"></div>
                          <span>Personnel</span>
                        </div>
                        <div className="flex items-center">
                          <div className="w-4 h-4 rounded-full bg-green-500 mr-2"></div>
                          <span>Tâche</span>
                        </div>
                        <div className="flex items-center">
                          <div className="w-4 h-4 rounded-full bg-amber-500 mr-2"></div>
                          <span>Rappel</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <div className="space-y-4">
                      <h3 className="text-xl font-bold">
                        {format(selectedDate, 'MMMM yyyy', { locale: fr })}
                      </h3>
                      
                      {Object.keys(eventsByDay).length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-10 text-center">
                          <Calendar className="h-10 w-10 text-gray-400 mb-3" />
                          <h3 className="text-lg font-medium mb-1">Aucun événement prévu</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                            Vous n'avez aucun événement programmé pour ce mois
                          </p>
                          <Button onClick={handleCreateEvent}>
                            <Plus className="mr-2 h-4 w-4" />
                            Ajouter un événement
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-6">
                          {Object.entries(eventsByDay)
                            .sort(([dateA], [dateB]) => new Date(dateA).getTime() - new Date(dateB).getTime())
                            .map(([dateKey, dayEvents]) => {
                              const eventDate = new Date(dateKey);
                              const isCurrentMonth = eventDate.getMonth() === selectedDate.getMonth() && 
                                                   eventDate.getFullYear() === selectedDate.getFullYear();
                              
                              if (!isCurrentMonth) return null;
                              
                              return (
                                <div key={dateKey} className="border rounded-lg p-4">
                                  <h4 className="font-medium mb-3">
                                    {format(eventDate, 'EEEE d MMMM', { locale: fr })}
                                  </h4>
                                  <div className="space-y-3">
                                    {dayEvents.sort((a, b) => a.startTime.localeCompare(b.startTime)).map(event => (
                                      <div key={event.id} className="flex items-start space-x-3">
                                        <div className="text-sm font-medium whitespace-nowrap">
                                          {event.startTime}
                                        </div>
                                        <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                                          event.type === 'meeting' ? 'bg-blue-500' :
                                          event.type === 'personal' ? 'bg-purple-500' :
                                          event.type === 'task' ? 'bg-green-500' : 
                                          'bg-amber-500'
                                        }`}></div>
                                        <div className="flex-grow">
                                          <h5 className="font-medium">{event.title}</h5>
                                          {event.description && (
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                              {event.description}
                                            </p>
                                          )}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              );
                            })}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={isCreatingEvent} onOpenChange={setIsCreatingEvent}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingEventId ? 'Modifier l\'événement' : 'Nouvel événement'}</DialogTitle>
            <DialogDescription>
              {editingEventId ? 'Modifiez les détails de l\'événement' : 'Ajoutez un nouvel événement à votre calendrier'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Titre</Label>
              <Input
                id="title"
                placeholder="Titre de l'événement"
                value={newEvent.title}
                onChange={(e) => handleEventChange('title', e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description (optionnel)</Label>
              <Textarea
                id="description"
                placeholder="Ajoutez des détails..."
                value={newEvent.description}
                onChange={(e) => handleEventChange('description', e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={format(newEvent.date, 'yyyy-MM-dd')}
                onChange={(e) => handleEventChange('date', new Date(e.target.value))}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startTime">Heure de début</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={newEvent.startTime}
                  onChange={(e) => handleEventChange('startTime', e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="endTime">Heure de fin</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={newEvent.endTime}
                  onChange={(e) => handleEventChange('endTime', e.target.value)}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="type">Type d'événement</Label>
              <Select
                value={newEvent.type}
                onValueChange={(value: 'meeting' | 'personal' | 'task' | 'reminder') => handleEventChange('type', value)}
              >
                <SelectTrigger id="type">
                  <SelectValue placeholder="Sélectionner" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="meeting">Réunion</SelectItem>
                  <SelectItem value="personal">Personnel</SelectItem>
                  <SelectItem value="task">Tâche</SelectItem>
                  <SelectItem value="reminder">Rappel</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreatingEvent(false)}>
              Annuler
            </Button>
            <Button onClick={handleSaveEvent}>
              <Save className="mr-2 h-4 w-4" />
              {editingEventId ? 'Mettre à jour' : 'Ajouter'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default PlanningPage;
