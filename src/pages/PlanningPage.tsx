import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TimePicker } from '@/components/ui/time-picker';
import { toast } from 'sonner';
import { fr } from 'date-fns/locale';
import { format, isToday, isAfter, isBefore, isSameDay, parseISO, startOfDay } from 'date-fns';
import { PlusCircle, Calendar as CalendarIcon, Clock, Edit, Trash2, Check, X } from 'lucide-react';
import { usePlanningEvents, PlanningEvent, formatEventTime, createPlanningEvent, updatePlanningEvent } from '@/services/planningService';

const PlanningPage = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isAddEventDialogOpen, setIsAddEventDialogOpen] = useState(false);
  const [view, setView] = useState<'day' | 'agenda'>('day');
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    time: '',
    allDay: true,
    category: 'personal',
    color: '#3b82f6'
  });
  
  const [editingEvent, setEditingEvent] = useState<string | null>(null);
  const { data: events, addItem, updateItem, deleteItem } = usePlanningEvents();
  
  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };
  
  const handleAddEventClick = () => {
    setNewEvent({
      ...newEvent,
      date: format(selectedDate, 'yyyy-MM-dd'),
      time: '',
    });
    setIsAddEventDialogOpen(true);
  };
  
  const handleCreateEvent = () => {
    if (!newEvent.title.trim()) {
      toast.error("Le titre de l'événement est requis");
      return;
    }
    
    const eventData = {
      title: newEvent.title,
      description: newEvent.description,
      date: newEvent.date,
      time: newEvent.allDay ? undefined : newEvent.time,
      allDay: newEvent.allDay,
      category: newEvent.category,
      color: newEvent.color,
      completed: false,
    };
    
    // Add created_at and updated_at timestamps
    const eventWithTimestamps = createPlanningEvent(eventData);
    
    addItem(eventWithTimestamps);
    
    toast.success("Événement créé avec succès");
    setIsAddEventDialogOpen(false);
    
    // Reset form
    setNewEvent({
      title: '',
      description: '',
      date: format(selectedDate, 'yyyy-MM-dd'),
      time: '',
      allDay: true,
      category: 'personal',
      color: '#3b82f6'
    });
  };
  
  const handleEditEvent = (event: PlanningEvent) => {
    // Only update the modified fields and keep the id
    const updatedEvent = updatePlanningEvent({
      id: event.id,
      title: newEvent.title || event.title,
      description: newEvent.description || event.description,
      date: newEvent.date || event.date,
      time: newEvent.allDay ? undefined : (newEvent.time || event.time),
      allDay: newEvent.allDay,
      category: newEvent.category || event.category,
      color: newEvent.color || event.color,
    });
    
    updateItem(event.id, updatedEvent);
    
    toast.success("Événement mis à jour avec succès");
    setIsAddEventDialogOpen(false);
    setEditingEvent(null);
    
    // Reset form
    setNewEvent({
      title: '',
      description: '',
      date: format(selectedDate, 'yyyy-MM-dd'),
      time: '',
      allDay: true,
      category: 'personal',
      color: '#3b82f6'
    });
  };
  
  const startEditEvent = (event: PlanningEvent) => {
    setNewEvent({
      title: event.title,
      description: event.description || '',
      date: event.date,
      time: event.time || '',
      allDay: event.allDay,
      category: event.category || 'personal',
      color: event.color || '#3b82f6',
    });
    setEditingEvent(event.id);
    setIsAddEventDialogOpen(true);
  };
  
  const handleDeleteEvent = (id: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cet événement ?")) {
      deleteItem(id);
      toast.success("Événement supprimé avec succès");
    }
  };
  
  const handleToggleEventCompletion = (id: string, completed: boolean) => {
    updateItem(id, { completed: !completed });
    toast.success(completed ? "Événement marqué comme non complété" : "Événement marqué comme complété");
  };
  
  const filteredEvents = events.filter(event => {
    if (view === 'day') {
      return isSameDay(parseISO(event.date), selectedDate);
    }
    return true;
  });
  
  // Sort events by date and time
  const sortedEvents = [...filteredEvents].sort((a, b) => {
    const dateA = parseISO(a.date);
    const dateB = parseISO(b.date);
    
    if (isSameDay(dateA, dateB)) {
      if (a.allDay) return -1;
      if (b.allDay) return 1;
      
      return a.time && b.time 
        ? a.time.localeCompare(b.time) 
        : 0;
    }
    
    return dateA.getTime() - dateB.getTime();
  });
  
  // Get days with events for the calendar
  const daysWithEvents = events.map(event => parseISO(event.date));
  
  // Group events by date for agenda view
  const eventsByDate = sortedEvents.reduce((acc, event) => {
    const date = event.date;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(event);
    return acc;
  }, {} as Record<string, PlanningEvent[]>);
  
  // Sort dates for agenda view
  const sortedDates = Object.keys(eventsByDate).sort((a, b) => {
    return parseISO(a).getTime() - parseISO(b).getTime();
  });

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
          <Button onClick={handleAddEventClick} className="flex items-center">
            <PlusCircle className="mr-2 h-4 w-4" />
            Ajouter un événement
          </Button>
        </div>
        
        <Tabs defaultValue="day" onValueChange={(value) => setView(value as 'day' | 'agenda')}>
          <TabsList className="grid grid-cols-2 w-[400px]">
            <TabsTrigger value="day" className="flex items-center justify-center">
              <CalendarIcon className="mr-2 h-4 w-4" />
              Vue journalière
            </TabsTrigger>
            <TabsTrigger value="agenda" className="flex items-center justify-center">
              <Clock className="mr-2 h-4 w-4" />
              Agenda
            </TabsTrigger>
          </TabsList>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            <div className="md:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Calendrier</CardTitle>
                  <CardDescription>
                    {format(selectedDate, 'MMMM yyyy', { locale: fr })}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => date && handleDateSelect(date)}
                    locale={fr}
                    className="rounded-md border"
                    modifiers={{
                      highlighted: daysWithEvents
                    }}
                    modifiersClassNames={{
                      highlighted: "bg-primary/10"
                    }}
                  />
                </CardContent>
              </Card>
            </div>
            
            <div className="md:col-span-2">
              <TabsContent value="day" className="mt-0">
                <Card>
                  <CardHeader>
                    <CardTitle>
                      {format(selectedDate, 'EEEE d MMMM yyyy', { locale: fr })}
                    </CardTitle>
                    <CardDescription>
                      {sortedEvents.length === 0 
                        ? "Aucun événement prévu pour cette journée" 
                        : sortedEvents.length === 1 
                          ? "1 événement prévu"
                          : `${sortedEvents.length} événements prévus`}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {sortedEvents.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-8 text-center">
                        <CalendarIcon className="h-12 w-12 text-gray-400 mb-4" />
                        <p className="text-muted-foreground">
                          Aucun événement pour cette journée
                        </p>
                        <Button 
                          variant="outline"
                          className="mt-4"
                          onClick={handleAddEventClick}
                        >
                          Ajouter un événement
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {sortedEvents.map(event => (
                          <div 
                            key={event.id}
                            className={`p-4 rounded-lg border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 ${
                              event.completed ? 'bg-gray-100 dark:bg-gray-800/50 opacity-60' : ''
                            }`}
                            style={{ borderLeftColor: event.color, borderLeftWidth: '4px' }}
                          >
                            <div className="flex-1">
                              <div className="flex items-center">
                                <h3 className={`font-medium ${event.completed ? 'line-through text-muted-foreground' : ''}`}>
                                  {event.title}
                                </h3>
                                <span className="ml-2 text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                                  {event.category}
                                </span>
                              </div>
                              {event.description && (
                                <p className="text-sm text-muted-foreground mt-1">
                                  {event.description}
                                </p>
                              )}
                              <div className="flex items-center mt-2 text-sm text-muted-foreground">
                                <Clock className="h-4 w-4 mr-1" />
                                {event.allDay ? 'Toute la journée' : formatEventTime(event.date, event.time)}
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Button 
                                variant="outline" 
                                size="icon"
                                onClick={() => handleToggleEventCompletion(event.id, !!event.completed)}
                              >
                                {event.completed ? <X className="h-4 w-4" /> : <Check className="h-4 w-4" />}
                              </Button>
                              <Button 
                                variant="outline" 
                                size="icon"
                                onClick={() => startEditEvent(event)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="outline" 
                                size="icon"
                                className="text-red-500"
                                onClick={() => handleDeleteEvent(event.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="agenda" className="mt-0">
                <Card>
                  <CardHeader>
                    <CardTitle>Agenda</CardTitle>
                    <CardDescription>
                      Vue d'ensemble de vos événements
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {sortedDates.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-8 text-center">
                        <CalendarIcon className="h-12 w-12 text-gray-400 mb-4" />
                        <p className="text-muted-foreground">
                          Aucun événement planifié
                        </p>
                        <Button 
                          variant="outline"
                          className="mt-4"
                          onClick={handleAddEventClick}
                        >
                          Ajouter un événement
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-8">
                        {sortedDates.map(date => {
                          const dateObj = parseISO(date);
                          const isDateToday = isToday(dateObj);
                          const isPastDate = isBefore(dateObj, startOfDay(new Date())) && !isDateToday;
                          const isFutureDate = isAfter(dateObj, startOfDay(new Date())) || isDateToday;
                          
                          return (
                            <div key={date} className="space-y-4">
                              <div className={`flex items-center ${isDateToday ? 'text-primary' : isPastDate ? 'text-muted-foreground' : ''}`}>
                                <h3 className="font-medium">
                                  {format(dateObj, 'EEEE d MMMM yyyy', { locale: fr })}
                                </h3>
                                {isDateToday && (
                                  <span className="ml-2 text-xs bg-primary text-primary-foreground px-2 py-1 rounded-full">
                                    Aujourd'hui
                                  </span>
                                )}
                              </div>
                              
                              <div className="space-y-3">
                                {eventsByDate[date].map(event => (
                                  <div 
                                    key={event.id}
                                    className={`p-3 rounded-lg border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 ${
                                      event.completed ? 'bg-gray-100 dark:bg-gray-800/50 opacity-60' : ''
                                    }`}
                                    style={{ borderLeftColor: event.color, borderLeftWidth: '4px' }}
                                  >
                                    <div className="flex-1">
                                      <div className="flex items-center">
                                        <h4 className={`font-medium ${event.completed ? 'line-through text-muted-foreground' : ''}`}>
                                          {event.title}
                                        </h4>
                                        <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                                          {event.category}
                                        </span>
                                      </div>
                                      {event.description && (
                                        <p className="text-sm text-muted-foreground mt-1">
                                          {event.description}
                                        </p>
                                      )}
                                      <div className="flex items-center mt-1 text-xs text-muted-foreground">
                                        <Clock className="h-3 w-3 mr-1" />
                                        {event.allDay ? 'Toute la journée' : formatEventTime(event.date, event.time)}
                                      </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <Button 
                                        variant="outline" 
                                        size="sm"
                                        onClick={() => handleToggleEventCompletion(event.id, !!event.completed)}
                                      >
                                        {event.completed ? <X className="h-3 w-3 mr-1" /> : <Check className="h-3 w-3 mr-1" />}
                                        {event.completed ? 'Annuler' : 'Terminer'}
                                      </Button>
                                      <Button 
                                        variant="outline" 
                                        size="icon"
                                        onClick={() => startEditEvent(event)}
                                      >
                                        <Edit className="h-4 w-4" />
                                      </Button>
                                      <Button 
                                        variant="outline" 
                                        size="icon"
                                        className="text-red-500"
                                        onClick={() => handleDeleteEvent(event.id)}
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </div>
          </div>
        </Tabs>
      </div>
      
      <Dialog open={isAddEventDialogOpen} onOpenChange={setIsAddEventDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingEvent ? "Modifier l'événement" : "Ajouter un événement"}
            </DialogTitle>
            <DialogDescription>
              {editingEvent 
                ? "Modifiez les détails de votre événement."
                : "Créez un nouvel événement dans votre planning."}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Titre</Label>
              <Input 
                id="title" 
                placeholder="Titre de l'événement" 
                value={newEvent.title}
                onChange={e => setNewEvent({...newEvent, title: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description (optionnelle)</Label>
              <Textarea 
                id="description" 
                placeholder="Description de l'événement"
                value={newEvent.description}
                onChange={e => setNewEvent({...newEvent, description: e.target.value})}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input 
                  id="date" 
                  type="date"
                  value={newEvent.date}
                  onChange={e => setNewEvent({...newEvent, date: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="time" className="flex items-center justify-between">
                  Heure
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="allDay" 
                      checked={newEvent.allDay}
                      onCheckedChange={(checked) => setNewEvent({...newEvent, allDay: !!checked})}
                    />
                    <Label htmlFor="allDay" className="text-sm font-normal cursor-pointer">Toute la journée</Label>
                  </div>
                </Label>
                
                <Input 
                  id="time" 
                  type="time"
                  disabled={newEvent.allDay}
                  value={newEvent.time}
                  onChange={e => setNewEvent({...newEvent, time: e.target.value})}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Catégorie</Label>
                <Select 
                  value={newEvent.category}
                  onValueChange={(value) => setNewEvent({...newEvent, category: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Catégorie" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="personal">Personnel</SelectItem>
                    <SelectItem value="work">Travail</SelectItem>
                    <SelectItem value="study">Études</SelectItem>
                    <SelectItem value="health">Santé</SelectItem>
                    <SelectItem value="leisure">Loisirs</SelectItem>
                    <SelectItem value="other">Autre</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="color">Couleur</Label>
                <div className="grid grid-cols-5 gap-2">
                  {['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'].map(color => (
                    <div 
                      key={color}
                      className={`h-9 rounded-md cursor-pointer border-2 ${
                        newEvent.color === color ? 'border-primary' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() => setNewEvent({...newEvent, color})}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsAddEventDialogOpen(false);
              setEditingEvent(null);
            }}>
              Annuler
            </Button>
            <Button 
              onClick={() => editingEvent ? handleEditEvent(events.find(e => e.id === editingEvent)!) : handleCreateEvent()}
            >
              {editingEvent ? "Mettre à jour" : "Créer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default PlanningPage;
