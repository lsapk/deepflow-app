
import React, { useState, useRef, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { useIndexedDB } from '@/hooks/use-indexed-db';
import { useAuth } from '@/contexts/AuthContext';
import { transcribeAudio } from '@/utils/habitUtils';
import { analyzeNoteWithAI, sendMessageToAI } from '@/services/aiService';
import { Mic, MicOff, Play, Square, Send, File, FilePlus, FileText, Trash2, MessageSquare, RotateCcw, Bot } from 'lucide-react';

interface VoiceNote {
  id: string;
  title: string;
  content: string;
  transcription?: string;
  analysis?: string;
  audioUrl?: string;
  created_at: string;
  updated_at: string;
  userId: string;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

const VoiceNotesPage: React.FC = () => {
  const { currentUser } = useAuth();
  const { data: notes = [], addItem, updateItem, deleteItem } = useIndexedDB<VoiceNote>({
    storeName: 'voice_notes',
    initialData: []
  });

  // Recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [transcription, setTranscription] = useState("");
  const [analysis, setAnalysis] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedNote, setSelectedNote] = useState<VoiceNote | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [isSendingChat, setIsSendingChat] = useState(false);

  // Refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Timer for recording
  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRecording]);

  // Scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // Format time
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Start recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      chunksRef.current = [];
      mediaRecorder.ondataavailable = (e) => {
        chunksRef.current.push(e.data);
      };
      
      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);

        try {
          setIsProcessing(true);
          const text = await transcribeAudio(blob);
          setTranscription(text);
          setContent(text);
          toast.success("Transcription terminée avec succès !");
        } catch (error) {
          console.error("Erreur lors de la transcription :", error);
          toast.error("Erreur lors de la transcription audio");
        } finally {
          setIsProcessing(false);
        }
      };
      
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      toast.info("Enregistrement démarré");
    } catch (error) {
      console.error("Erreur lors de l'accès au microphone :", error);
      toast.error("Impossible d'accéder au microphone");
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      
      toast.info("Enregistrement terminé");
    }
  };

  // Analyze note with AI
  const analyzeNote = async () => {
    if (!content) {
      toast.error("Aucun contenu à analyser");
      return;
    }
    
    try {
      setIsProcessing(true);
      const analysisResult = await analyzeNoteWithAI(content);
      setAnalysis(analysisResult);
      
      // Initialize chat with context
      setChatMessages([
        {
          id: crypto.randomUUID(),
          role: 'system',
          content: `Voici une note et son analyse. Utilise ces informations pour répondre aux questions de l'utilisateur.\n\nNote: ${content}\n\nAnalyse: ${analysisResult}`,
          timestamp: new Date()
        },
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: "Bonjour ! J'ai analysé votre note. Posez-moi des questions à ce sujet ou demandez plus de détails sur certains points.",
          timestamp: new Date()
        }
      ]);
      
      toast.success("Analyse terminée !");
    } catch (error) {
      console.error("Erreur lors de l'analyse :", error);
      toast.error("Erreur lors de l'analyse avec l'IA");
    } finally {
      setIsProcessing(false);
    }
  };

  // Save note
  const saveNote = async () => {
    if (!currentUser) {
      toast.error("Vous devez être connecté pour enregistrer une note");
      return;
    }
    
    if (!title.trim()) {
      toast.error("Veuillez ajouter un titre à votre note");
      return;
    }
    
    if (!content.trim()) {
      toast.error("Aucun contenu à enregistrer");
      return;
    }
    
    try {
      const newNote: Omit<VoiceNote, 'id'> = {
        title: title.trim(),
        content: content.trim(),
        transcription: transcription || content.trim(),
        analysis: analysis || "",
        audioUrl: audioUrl || undefined,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        userId: currentUser.uid
      };
      
      await addItem(newNote);
      toast.success("Note enregistrée avec succès !");
      
      // Reset form
      resetForm();
    } catch (error) {
      console.error("Erreur lors de l'enregistrement de la note :", error);
      toast.error("Erreur lors de l'enregistrement de la note");
    }
  };

  // Reset form
  const resetForm = () => {
    setTitle("");
    setContent("");
    setTranscription("");
    setAnalysis("");
    setAudioUrl(null);
    setAudioBlob(null);
    setSelectedNote(null);
    setChatMessages([]);
    setChatInput("");
  };

  // Select note
  const selectNote = (note: VoiceNote) => {
    setSelectedNote(note);
    setTitle(note.title);
    setContent(note.content);
    setTranscription(note.transcription || note.content);
    setAnalysis(note.analysis || "");
    setAudioUrl(note.audioUrl || null);
    
    // Initialize chat with context
    if (note.analysis) {
      setChatMessages([
        {
          id: crypto.randomUUID(),
          role: 'system',
          content: `Voici une note et son analyse. Utilise ces informations pour répondre aux questions de l'utilisateur.\n\nNote: ${note.content}\n\nAnalyse: ${note.analysis}`,
          timestamp: new Date()
        },
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: "Bonjour ! J'ai analysé votre note. Posez-moi des questions à ce sujet ou demandez plus de détails sur certains points.",
          timestamp: new Date()
        }
      ]);
    } else {
      setChatMessages([]);
    }
  };

  // Delete note
  const deleteNote = async (id: string) => {
    try {
      await deleteItem(id);
      
      if (selectedNote && selectedNote.id === id) {
        resetForm();
      }
      
      toast.success("Note supprimée avec succès !");
    } catch (error) {
      console.error("Erreur lors de la suppression de la note :", error);
      toast.error("Erreur lors de la suppression de la note");
    }
  };

  // Send chat message
  const sendChatMessage = async () => {
    if (!chatInput.trim() || !selectedNote) return;
    
    const userMessage = {
      id: crypto.randomUUID(),
      role: 'user' as const,
      content: chatInput.trim(),
      timestamp: new Date()
    };
    
    setChatMessages(prev => [...prev, userMessage]);
    setChatInput("");
    setIsSendingChat(true);
    
    try {
      // Prepare context for AI
      const systemMessage = {
        role: 'system' as const,
        content: `Voici une note et son analyse. Utilise ces informations pour répondre aux questions de l'utilisateur.
Note: ${selectedNote.content}
Analyse: ${selectedNote.analysis || "Aucune analyse disponible."}`
      };
      
      // Convert chat messages to format expected by API
      const apiMessages = [
        systemMessage,
        ...chatMessages.map(msg => ({
          role: msg.role,
          content: msg.content
        })),
        {
          role: userMessage.role,
          content: userMessage.content
        }
      ];
      
      const response = await sendMessageToAI(apiMessages);
      
      const assistantMessage = {
        id: crypto.randomUUID(),
        role: 'assistant' as const,
        content: response,
        timestamp: new Date()
      };
      
      setChatMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Erreur lors de l'envoi du message :", error);
      toast.error("Erreur lors de la communication avec l'IA");
    } finally {
      setIsSendingChat(false);
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Notes Vocales</h1>
            <p className="text-gray-500 dark:text-gray-400">
              Enregistrez, transcrivez et analysez vos notes vocales
            </p>
          </div>
          
          <Button
            onClick={resetForm}
            variant="outline"
            className="sm:self-start"
          >
            <FilePlus className="mr-2 h-4 w-4" />
            Nouvelle note
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Liste des notes (sidebar) */}
          <Card className="md:col-span-3">
            <CardHeader>
              <CardTitle className="text-lg">Mes notes</CardTitle>
              <CardDescription>
                {notes.length} note{notes.length !== 1 ? 's' : ''}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px] pr-4">
                <div className="space-y-3">
                  {notes.length > 0 ? (
                    notes
                      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                      .map((note) => (
                        <Card 
                          key={note.id} 
                          className={`cursor-pointer hover:shadow-md transition-all ${selectedNote?.id === note.id ? 'border-primary' : ''}`}
                          onClick={() => selectNote(note)}
                        >
                          <CardHeader className="p-4 pb-2">
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-base truncate">{note.title}</CardTitle>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-gray-500 hover:text-red-500"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteNote(note.id);
                                }}
                              >
                                <Trash2 size={14} />
                              </Button>
                            </div>
                            <CardDescription className="text-xs">
                              {new Date(note.created_at).toLocaleDateString('fr-FR', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                              })}
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="p-4 pt-0">
                            <p className="text-sm line-clamp-2">{note.content}</p>
                          </CardContent>
                        </Card>
                      ))
                  ) : (
                    <div className="text-center py-8">
                      <FileText className="mx-auto h-10 w-10 text-gray-400 mb-2" />
                      <p className="text-gray-500">Aucune note</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Contenu principal */}
          <div className="md:col-span-9">
            <Tabs defaultValue="editor" className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="editor" className="flex items-center">
                  <FileText className="mr-2 h-4 w-4" />
                  Éditeur
                </TabsTrigger>
                <TabsTrigger value="recording" className="flex items-center">
                  <Mic className="mr-2 h-4 w-4" />
                  Enregistrement
                </TabsTrigger>
                <TabsTrigger value="analysis" className="flex items-center">
                  <Bot className="mr-2 h-4 w-4" />
                  Analyse AI
                </TabsTrigger>
                <TabsTrigger value="chat" className="flex items-center">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Chat
                </TabsTrigger>
              </TabsList>

              {/* Tab Éditeur */}
              <TabsContent value="editor" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Éditer la note</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label htmlFor="title" className="block text-sm font-medium mb-1">
                        Titre
                      </label>
                      <Input
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Titre de la note"
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label htmlFor="content" className="block text-sm font-medium mb-1">
                        Contenu
                      </label>
                      <Textarea
                        id="content"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Contenu de la note..."
                        className="w-full min-h-[200px]"
                      />
                    </div>
                  </CardContent>
                  <CardFooter className="justify-between">
                    <Button 
                      variant="outline" 
                      onClick={resetForm}
                    >
                      <RotateCcw className="mr-2 h-4 w-4" />
                      Réinitialiser
                    </Button>
                    <Button 
                      onClick={saveNote}
                      disabled={!title || !content}
                    >
                      <File className="mr-2 h-4 w-4" />
                      Enregistrer
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>

              {/* Tab Enregistrement */}
              <TabsContent value="recording">
                <Card>
                  <CardHeader>
                    <CardTitle>Enregistrement vocal</CardTitle>
                    <CardDescription>
                      Enregistrez votre voix pour créer une nouvelle note
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col items-center justify-center py-8 space-y-6">
                      <div className="recording-timer text-4xl font-mono">
                        {formatTime(recordingTime)}
                      </div>
                      
                      <div className="recording-controls flex space-x-4">
                        {!isRecording ? (
                          <Button
                            onClick={startRecording}
                            size="lg"
                            className="rounded-full w-16 h-16 flex items-center justify-center"
                          >
                            <Mic size={24} />
                          </Button>
                        ) : (
                          <Button
                            onClick={stopRecording}
                            variant="destructive"
                            size="lg"
                            className="rounded-full w-16 h-16 flex items-center justify-center"
                          >
                            <Square size={24} />
                          </Button>
                        )}
                      </div>
                      
                      {audioUrl && (
                        <div className="audio-player w-full max-w-md">
                          <audio
                            controls
                            src={audioUrl}
                            className="w-full"
                          />
                        </div>
                      )}
                      
                      {isProcessing && (
                        <div className="text-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                          <p>Transcription en cours...</p>
                        </div>
                      )}
                      
                      {transcription && (
                        <div className="transcription-result w-full">
                          <h3 className="text-lg font-medium mb-2">Transcription</h3>
                          <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-md">
                            <p className="whitespace-pre-wrap">{transcription}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="justify-end">
                    <Button
                      onClick={analyzeNote}
                      disabled={!content || isProcessing}
                    >
                      <Bot className="mr-2 h-4 w-4" />
                      Analyser avec IA
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>

              {/* Tab Analyse */}
              <TabsContent value="analysis">
                <Card>
                  <CardHeader>
                    <CardTitle>Analyse IA</CardTitle>
                    <CardDescription>
                      Analyse et résumé de votre note par l'intelligence artificielle
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isProcessing ? (
                      <div className="flex flex-col items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
                        <p>Analyse en cours...</p>
                      </div>
                    ) : analysis ? (
                      <div className="prose dark:prose-invert max-w-none">
                        <div className="bg-gray-50 dark:bg-gray-900 p-5 rounded-lg whitespace-pre-wrap">
                          {analysis}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <Bot className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium mb-2">Pas encore d'analyse</h3>
                        <p className="text-gray-500 mb-6">
                          Cliquez sur "Analyser avec IA" pour obtenir une analyse de votre note
                        </p>
                        <Button
                          onClick={analyzeNote}
                          disabled={!content || isProcessing}
                        >
                          <Bot className="mr-2 h-4 w-4" />
                          Analyser avec IA
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Tab Chat */}
              <TabsContent value="chat">
                <Card className="h-[600px] flex flex-col">
                  <CardHeader>
                    <CardTitle>Discussion avec l'IA</CardTitle>
                    <CardDescription>
                      Posez des questions sur votre note
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1 overflow-hidden flex flex-col">
                    <ScrollArea className="flex-1 pr-4">
                      <div className="space-y-4">
                        {chatMessages.length > 0 ? (
                          chatMessages
                            .filter(msg => msg.role !== 'system')
                            .map((message) => (
                              <div
                                key={message.id}
                                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                              >
                                <div
                                  className={`max-w-[80%] px-4 py-2 rounded-lg ${
                                    message.role === 'user'
                                      ? 'bg-primary text-primary-foreground'
                                      : 'bg-muted'
                                  }`}
                                >
                                  <p className="whitespace-pre-wrap">{message.content}</p>
                                </div>
                              </div>
                            ))
                        ) : (
                          <div className="flex flex-col items-center justify-center h-64">
                            <MessageSquare className="h-16 w-16 text-gray-400 mb-4" />
                            <h3 className="text-lg font-medium mb-2">Aucun message</h3>
                            <p className="text-gray-500 text-center max-w-md">
                              Analysez d'abord votre note pour discuter avec l'IA à son sujet
                            </p>
                          </div>
                        )}
                        <div ref={chatEndRef} />
                      </div>
                    </ScrollArea>
                  </CardContent>
                  
                  <Separator />
                  
                  <CardFooter className="pt-4">
                    <div className="flex w-full gap-2">
                      <Input
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        placeholder="Posez une question sur votre note..."
                        disabled={isSendingChat || chatMessages.length === 0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            sendChatMessage();
                          }
                        }}
                      />
                      <Button
                        onClick={sendChatMessage}
                        disabled={!chatInput.trim() || isSendingChat || chatMessages.length === 0}
                      >
                        {isSendingChat ? (
                          <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                        ) : (
                          <Send size={16} />
                        )}
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default VoiceNotesPage;
