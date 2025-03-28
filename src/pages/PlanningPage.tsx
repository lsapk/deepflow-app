
import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Calendar } from '@/components/ui/calendar';
import { addDays, format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Calendar as CalendarIcon, Clock, Tag, Trash2, Edit } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { PlanningEvent, usePlanningEvents, formatEventTime } from '@/services/planningService';
import { useAuth } from '@/contexts/AuthContext';
import { useIndexedDB } from '@/hooks/use-indexed-db';

const eventCategories = [
  { label: 'Travail', value: 'work', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
  { label: 'Personnel', value: 'personal', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
  { label: 'Important', value: 'important', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' },
  { label: 'Loisir', value: 'leisure', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' },
  { label: 'Réunion', value: 'meeting', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' },
];

const getCategoryColor = (category: string) => {
  const found = eventCategories.find(cat => cat.value === category);
  return found ? found.color : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
};

const getCategoryLabel = (category: string) => {
  const found = eventCategories.find(cat => cat.value === category);
  return found ? found.label : category;
};

const PlanningPage = () => {
  const { currentUser } = useAuth();
  const [date, setDate] = useState<Date>(new Date());
  const [openEventDialog, setOpenEventDialog] = useState(false);
  const [editingEvent, setEditingEvent] = useState<PlanningEvent | null>(null);
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');

  // Load settings for clock format
  const { data: settingsData } = useIndexedDB<{
    id: string;
    clockFormat: string;
  }>({
    storeName: 'settings',
    initialData: [{
      id: 'user-settings',
      clockFormat: '24h',
    }]
  });
  
  const clockFormat = settingsData[0]?.clockFormat || '24h';

  // New form state
  const [formState, setFormState] = useState({
    title: '',
    description: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    time: format(new Date(), 'HH:mm'),
    allDay: false,
    category: 'work',
  });

  // Load events
  const { 
    data: events, 
    loading: eventsLoading, 
    addItem: addEvent,
    updateItem: updateEvent,
    deleteItem: deleteEvent
  } = usePlanningEvents();

  // Reset form when dialog opens/closes or when editing changes
  useEffect(() => {
    if (openEventDialog) {
      if (editingEvent) {
        setFormState({
          title: editingEvent.title,
          description: editingEvent.description || '',
          date: editingEvent.date,
          time: editingEvent.time || '00:00',
          allDay: editingEvent.allDay,
          category: editingEvent.category || 'work',
        });
      } else {
        setFormState({
          title: '',
          description: '',
          date: format(date, 'yyyy-MM-dd'),
          time: format(new Date(), 'HH:mm'),
          allDay: false,
          category: 'work',
        });
      }
    }
  }, [openEventDialog, editingEvent, date]);

  const handleDateChange = (newDate: Date | undefined) => {
    if (newDate) {
      setDate(newDate);
    }
  };

  const handleCreateEvent = () => {
    if (!formState.title.trim()) {
      toast.error("Le titre est requis");
      return;
    }

    if (editingEvent) {
      // Update existing event
      updateEvent(editingEvent.id, {
        title: formState.title,
        description: formState.description,
        date: formState.date,
        time: formState.allDay ? undefined : formState.time,
        allDay: formState.allDay,
        category: formState.category,
        user_id: currentUser?.uid || 'anonymous',
      });
      toast.success("Événement mis à jour");
    } else {
      // Create new event
      addEvent({
        title: formState.title,
        description: formState.description,
        date: formState.date,
        time: formState.allDay ? undefined : formState.time,
        allDay: formState.allDay,
        category: formState.category,
        user_id: currentUser?.uid || 'anonymous',
      });
      toast.success("Événement créé");
    }

    setOpenEventDialog(false);
    setEditingEvent(null);
  };

  const handleDeleteEvent = () => {
    if (editingEvent) {
      deleteEvent(editingEvent.id);
      toast.success("Événement supprimé");
      setOpenEventDialog(false);
      setEditingEvent(null);
    }
  };

  const handleEditEvent = (event: PlanningEvent) => {
    setEditingEvent(event);
    setOpenEventDialog(true);
  };

  // Filter events for the selected date
  const eventsOnSelectedDate = events.filter(event => 
    event.date === format(date, 'yyyy-MM-dd')
  );

  // Get upcoming events (next 7 days)
  const upcomingEvents = events
    .filter(event => {
      const eventDate = parseISO(event.date);
      return eventDate >= new Date() && eventDate <= addDays(new Date(), 7);
    })
    .sort((a, b) => {
      const dateA = parseISO(a.date);
      const dateB = parseISO(b.date);
      return dateA.getTime() - dateB.getTime();
    });

  // Highlighted dates for the calendar
  const highlightedDates = events.map(event => parseISO(event.date));

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-1">Planning</h1>
            <p className="text-gray-500 dark:text-gray-400">
              Gérez votre emploi du temps et vos événements
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button onClick={() => {
              setEditingEvent(null);
              setOpenEventDialog(true);
            }} variant="default">
              <Plus className="mr-2 h-4 w-4" />
              Ajouter un événement
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Calendrier</CardTitle>
                <CardDescription>
                  {format(date, 'MMMM yyyy', { locale: fr })}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={handleDateChange}
                  locale={fr}
                  className="rounded-md border"
                  highlightedDates={highlightedDates}
                />
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>
                    {format(date, 'dd MMMM yyyy', { locale: fr })}
                  </CardTitle>
                  <Select value={viewMode} onValueChange={(value: 'calendar' | 'list') => setViewMode(value)}>
                    <SelectTrigger className="w-[120px]">
                      <SelectValue placeholder="Vue" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="calendar">Calendrier</SelectItem>
                      <SelectItem value="list">Liste</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <CardDescription>
                  Événements du jour sélectionné
                </CardDescription>
              </CardHeader>
              <CardContent>
                {eventsLoading ? (
                  <div className="text-center p-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-2">Chargement des événements...</p>
                  </div>
                ) : eventsOnSelectedDate.length === 0 ? (
                  <div className="text-center p-4">
                    <p className="text-muted-foreground">Aucun événement pour cette journée</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-2"
                      onClick={() => {
                        setEditingEvent(null);
                        setOpenEventDialog(true);
                      }}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Ajouter
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {eventsOnSelectedDate.map((event) => (
                      <div 
                        key={event.id} 
                        className="p-3 rounded-lg border border-border hover:bg-accent cursor-pointer"
                        onClick={() => handleEditEvent(event)}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-medium">{event.title}</h3>
                            {event.description && (
                              <p className="text-sm text-muted-foreground mt-1">{event.description}</p>
                            )}
                          </div>
                          <Badge className={getCategoryColor(event.category || 'work')}>
                            {getCategoryLabel(event.category || 'work')}
                          </Badge>
                        </div>
                        <div className="flex items-center mt-3 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4 mr-1" />
                          <span>
                            {event.allDay 
                              ? 'Toute la journée' 
                              : formatEventTime(event.date, event.time, clockFormat)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Prochains événements</CardTitle>
                <CardDescription>
                  Les 7 prochains jours
                </CardDescription>
              </CardHeader>
              <CardContent>
                {upcomingEvents.length === 0 ? (
                  <p className="text-center text-muted-foreground">Aucun événement à venir</p>
                ) : (
                  <div className="space-y-3">
                    {upcomingEvents.map((event) => (
                      <div 
                        key={event.id} 
                        className="p-3 rounded-lg border border-border hover:bg-accent cursor-pointer"
                        onClick={() => handleEditEvent(event)}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-medium">{event.title}</h3>
                          </div>
                          <Badge className={getCategoryColor(event.category || 'work')}>
                            {getCategoryLabel(event.category || 'work')}
                          </Badge>
                        </div>
                        <div className="flex items-center mt-2 text-sm text-muted-foreground">
                          <CalendarIcon className="h-4 w-4 mr-1" />
                          <span>{format(parseISO(event.date), 'dd MMMM', { locale: fr })}</span>
                          <Clock className="h-4 w-4 ml-3 mr-1" />
                          <span>
                            {event.allDay 
                              ? 'Toute la journée' 
                              : formatEventTime(event.date, event.time, clockFormat)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Dialog for adding/editing events */}
        <Dialog open={openEventDialog} onOpenChange={setOpenEventDialog}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{editingEvent ? "Modifier l'événement" : "Nouvel événement"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Titre</Label>
                <Input 
                  id="title" 
                  value={formState.title}
                  onChange={(e) => setFormState({...formState, title: e.target.value})}
                  placeholder="Titre de l'événement"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description (optionnelle)</Label>
                <Textarea 
                  id="description" 
                  value={formState.description}
                  onChange={(e) => setFormState({...formState, description: e.target.value})}
                  placeholder="Description de l'événement"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input 
                    id="date" 
                    type="date" 
                    value={formState.date}
                    onChange={(e) => setFormState({...formState, date: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="time">Heure</Label>
                    <div className="flex items-center space-x-2">
                      <Label htmlFor="allDay" className="text-sm">Toute la journée</Label>
                      <Switch 
                        id="allDay" 
                        checked={formState.allDay}
                        onCheckedChange={(checked) => setFormState({...formState, allDay: checked})}
                      />
                    </div>
                  </div>
                  <Input 
                    id="time" 
                    type="time" 
                    value={formState.time}
                    onChange={(e) => setFormState({...formState, time: e.target.value})}
                    disabled={formState.allDay}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Catégorie</Label>
                <Select 
                  value={formState.category} 
                  onValueChange={(value) => setFormState({...formState, category: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une catégorie" />
                  </SelectTrigger>
                  <SelectContent>
                    {eventCategories.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        <div className="flex items-center">
                          <div className={`w-3 h-3 rounded-full mr-2 ${category.color.split(' ')[0]}`}></div>
                          {category.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter className="flex items-center justify-between">
              {editingEvent && (
                <Button variant="destructive" type="button" onClick={handleDeleteEvent}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Supprimer
                </Button>
              )}
              <div className="flex space-x-2">
                <Button variant="outline" onClick={() => {
                  setOpenEventDialog(false);
                  setEditingEvent(null);
                }}>
                  Annuler
                </Button>
                <Button type="button" onClick={handleCreateEvent}>
                  {editingEvent ? "Enregistrer" : "Créer"}
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
};

export default PlanningPage;
