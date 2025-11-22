import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Users, Flag, Trash2, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User } from "@supabase/supabase-js";

interface ChatMessage {
  id: string;
  user_name: string;
  message: string;
  created_at: string;
}

export const TruckerChat = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [onlineCount, setOnlineCount] = useState(1);
  const [user, setUser] = useState<User | null>(null);
  const [userName, setUserName] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [canSend, setCanSend] = useState(true);
  const [countdown, setCountdown] = useState(0);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [reportMessageId, setReportMessageId] = useState<string | null>(null);
  const [reportReason, setReportReason] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Auth-Status überwachen
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Benutzernamen aus fahrer_profile holen
  useEffect(() => {
    if (!user) return;

    const fetchUserName = async () => {
      const { data, error } = await supabase
        .from('fahrer_profile')
        .select('vorname, nachname')
        .eq('email', user.email)
        .single();

      if (error || !data) {
        setUserName("Fahrer");
        return;
      }

      setUserName(`${data.vorname} ${data.nachname.charAt(0)}.`);
    };

    fetchUserName();
  }, [user]);

  // Admin-Status prüfen
  useEffect(() => {
    if (!user) return;

    const checkAdminStatus = async () => {
      const { data } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .single();

      setIsAdmin(!!data);
    };

    checkAdminStatus();
  }, [user]);

  // Lade initiale Nachrichten
  useEffect(() => {
    loadMessages();
  }, []);

  // Realtime-Subscription
  useEffect(() => {
    const channel = supabase
      .channel('trucker-chat-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'trucker_chat_messages'
        },
        (payload) => {
          const newMsg = payload.new as ChatMessage;
          setMessages(prev => [...prev, newMsg]);
          
          setTimeout(() => {
            scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
          }, 100);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'trucker_chat_messages'
        },
        (payload) => {
          const deletedId = payload.old.id;
          setMessages(prev => prev.filter(msg => msg.id !== deletedId));
        }
      )
      .subscribe();

    // Presence tracking
    const presenceChannel = supabase.channel('trucker-presence', {
      config: {
        presence: {
          key: user?.id || 'anonymous',
        },
      },
    });

    presenceChannel
      .on('presence', { event: 'sync' }, () => {
        const state = presenceChannel.presenceState();
        setOnlineCount(Object.keys(state).length);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await presenceChannel.track({
            online_at: new Date().toISOString(),
          });
        }
      });

    return () => {
      supabase.removeChannel(channel);
      supabase.removeChannel(presenceChannel);
    };
  }, [user]);

  // Rate-Limit Countdown
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0 && !canSend) {
      setCanSend(true);
    }
  }, [countdown, canSend]);

  const loadMessages = async () => {
    const { data, error } = await supabase
      .from('trucker_chat_messages')
      .select('*')
      .order('created_at', { ascending: true })
      .limit(100);

    if (error) {
      console.error('Error loading messages:', error);
      return;
    }

    if (data) {
      setMessages(data);
      setTimeout(() => {
        scrollRef.current?.scrollIntoView({ behavior: 'auto' });
      }, 100);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Login erforderlich",
        description: "Bitte melde dich an, um Nachrichten zu schreiben.",
        variant: "destructive"
      });
      return;
    }

    const trimmedMessage = newMessage.trim();
    if (!trimmedMessage || trimmedMessage.length > 500) {
      toast({
        title: "Ungültige Nachricht",
        description: "Nachricht muss zwischen 1 und 500 Zeichen lang sein.",
        variant: "destructive"
      });
      return;
    }

    const { error } = await supabase
      .from('trucker_chat_messages')
      .insert({
        user_name: userName,
        message: trimmedMessage
      });

    if (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Fehler",
        description: "Nachricht konnte nicht gesendet werden.",
        variant: "destructive"
      });
      return;
    }

    setNewMessage("");
    
    // Rate-Limit aktivieren
    setCanSend(false);
    setCountdown(10);
  };

  const handleReport = async () => {
    if (!user || !reportMessageId) return;

    const { error } = await supabase
      .from('trucker_chat_reports')
      .insert({
        message_id: reportMessageId,
        reporter_id: user.id,
        reason: reportReason || "Keine Angabe"
      });

    if (error) {
      toast({
        title: "Fehler",
        description: "Meldung konnte nicht gesendet werden.",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Nachricht gemeldet",
      description: "Vielen Dank für deine Meldung. Wir werden sie prüfen."
    });

    setReportDialogOpen(false);
    setReportMessageId(null);
    setReportReason("");
  };

  const handleDelete = async (messageId: string) => {
    if (!isAdmin) return;

    const { error } = await supabase
      .from('trucker_chat_messages')
      .delete()
      .eq('id', messageId);

    if (error) {
      toast({
        title: "Fehler",
        description: "Nachricht konnte nicht gelöscht werden.",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Nachricht gelöscht",
      description: "Die Nachricht wurde entfernt."
    });
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('de-DE', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Trucker Ladies Live-Chat
          </CardTitle>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
            {onlineCount} {onlineCount === 1 ? 'Person' : 'Personen'} online
          </div>
        </div>
        {user && (
          <p className="text-sm text-muted-foreground">
            Eingeloggt als: <span className="font-medium">{userName}</span>
          </p>
        )}
      </CardHeader>
      
      <CardContent className="p-0">
        {/* Community-Regeln */}
        <Alert className="m-4 border-primary/20 bg-primary/5">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-sm">
            <strong>Regeln:</strong> Respektvoller Umgang. Keine Beleidigungen, keine sexuellen Inhalte, 
            keine Hetze, keine Werbung/Spam. Verstöße werden gelöscht und führen zur Sperre.
          </AlertDescription>
        </Alert>

        {/* Nachrichten-Bereich */}
        <ScrollArea className="h-[500px] p-4">
          <div className="space-y-3">
            {messages.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                Noch keine Nachrichten. Sei der Erste!
              </div>
            ) : (
              messages.map((msg) => {
                const isOwnMessage = user && msg.user_name === userName;
                return (
                  <div
                    key={msg.id}
                    className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} group`}
                  >
                    <div className="flex flex-col max-w-[70%]">
                      <div
                        className={`rounded-lg px-4 py-2 ${
                          isOwnMessage
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        }`}
                      >
                        {!isOwnMessage && (
                          <div className="text-xs font-semibold mb-1">
                            {msg.user_name}
                          </div>
                        )}
                        <div className="break-words">{msg.message}</div>
                        <div
                          className={`text-xs mt-1 ${
                            isOwnMessage
                              ? 'text-primary-foreground/70'
                              : 'text-muted-foreground'
                          }`}
                        >
                          {formatTime(msg.created_at)}
                        </div>
                      </div>
                      
                      {/* Melden & Löschen Buttons */}
                      <div className="flex gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {user && !isOwnMessage && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 text-xs"
                            onClick={() => {
                              setReportMessageId(msg.id);
                              setReportDialogOpen(true);
                            }}
                          >
                            <Flag className="h-3 w-3 mr-1" />
                            Melden
                          </Button>
                        )}
                        {isAdmin && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 text-xs text-destructive hover:text-destructive"
                            onClick={() => handleDelete(msg.id)}
                          >
                            <Trash2 className="h-3 w-3 mr-1" />
                            Löschen
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={scrollRef} />
          </div>
        </ScrollArea>

        {/* Eingabe-Bereich */}
        <div className="border-t p-4">
          {!user ? (
            <Alert>
              <AlertDescription>
                Du musst <a href="/fahrer-registrierung" className="underline font-medium">angemeldet</a> sein, 
                um Nachrichten zu schreiben. Lesen ist weiterhin möglich.
              </AlertDescription>
            </Alert>
          ) : (
            <>
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <Input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Schreibe eine Nachricht..."
                  maxLength={500}
                  className="flex-1"
                  disabled={!canSend}
                />
                <Button type="submit" size="icon" disabled={!newMessage.trim() || !canSend}>
                  <Send className="h-4 w-4" />
                </Button>
              </form>
              <div className="flex justify-between items-center mt-2">
                <p className="text-xs text-muted-foreground">
                  {newMessage.length}/500 Zeichen
                </p>
                {!canSend && (
                  <p className="text-xs text-muted-foreground">
                    Bitte kurz warten... ({countdown}s)
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      </CardContent>

      {/* Melde-Dialog */}
      <Dialog open={reportDialogOpen} onOpenChange={setReportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nachricht melden</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Bitte wähle einen Grund für die Meldung:
            </p>
            <Select value={reportReason} onValueChange={setReportReason}>
              <SelectTrigger>
                <SelectValue placeholder="Grund auswählen (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Beleidigung">Beleidigung</SelectItem>
                <SelectItem value="Spam">Spam</SelectItem>
                <SelectItem value="Sex-Content">Sex-Content</SelectItem>
                <SelectItem value="Sonstiges">Sonstiges</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReportDialogOpen(false)}>
              Abbrechen
            </Button>
            <Button onClick={handleReport}>
              Melden
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};
