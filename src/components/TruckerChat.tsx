import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ChatMessage {
  id: string;
  user_name: string;
  message: string;
  created_at: string;
}

export const TruckerChat = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [userName, setUserName] = useState("");
  const [isNameSet, setIsNameSet] = useState(false);
  const [onlineCount, setOnlineCount] = useState(1);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Lade gespeicherten Namen aus localStorage
  useEffect(() => {
    const savedName = localStorage.getItem("trucker_chat_name");
    if (savedName) {
      setUserName(savedName);
      setIsNameSet(true);
    }
  }, []);

  // Lade initiale Nachrichten
  useEffect(() => {
    loadMessages();
  }, []);

  // Realtime-Subscription für neue Nachrichten
  useEffect(() => {
    if (!isNameSet) return;

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
          
          // Auto-scroll zu neuer Nachricht
          setTimeout(() => {
            scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
          }, 100);
        }
      )
      .subscribe();

    // Presence tracking für Online-Nutzer
    const presenceChannel = supabase.channel('trucker-presence', {
      config: {
        presence: {
          key: userName,
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
            user: userName,
            online_at: new Date().toISOString(),
          });
        }
      });

    return () => {
      supabase.removeChannel(channel);
      supabase.removeChannel(presenceChannel);
    };
  }, [isNameSet, userName]);

  const loadMessages = async () => {
    const { data, error } = await supabase
      .from('trucker_chat_messages')
      .select('*')
      .order('created_at', { ascending: true })
      .limit(100);

    if (error) {
      console.error('Error loading messages:', error);
      toast({
        title: "Fehler",
        description: "Nachrichten konnten nicht geladen werden.",
        variant: "destructive"
      });
      return;
    }

    if (data) {
      setMessages(data);
      setTimeout(() => {
        scrollRef.current?.scrollIntoView({ behavior: 'auto' });
      }, 100);
    }
  };

  const handleSetName = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = userName.trim();
    
    if (trimmedName.length < 2 || trimmedName.length > 50) {
      toast({
        title: "Ungültiger Name",
        description: "Dein Name muss zwischen 2 und 50 Zeichen lang sein.",
        variant: "destructive"
      });
      return;
    }

    localStorage.setItem("trucker_chat_name", trimmedName);
    setIsNameSet(true);
    
    toast({
      title: "Willkommen im Chat!",
      description: `Hallo ${trimmedName}, viel Spaß beim Chatten!`
    });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
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
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('de-DE', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  // Name-Eingabe-Bildschirm
  if (!isNameSet) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Trucker Ladies Live-Chat
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSetName} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Gib deinen Namen ein, um dem Chat beizutreten:
              </label>
              <Input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Dein Name (z.B. Max M., Anna K.)"
                maxLength={50}
                required
              />
              <p className="text-xs text-muted-foreground mt-1">
                Dein Name ist nur in diesem Chat sichtbar
              </p>
            </div>
            <Button type="submit" className="w-full">
              Chat beitreten
            </Button>
          </form>
        </CardContent>
      </Card>
    );
  }

  // Chat-Bildschirm
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
        <p className="text-sm text-muted-foreground">
          Eingeloggt als: <span className="font-medium">{userName}</span>
        </p>
      </CardHeader>
      
      <CardContent className="p-0">
        {/* Nachrichten-Bereich */}
        <ScrollArea className="h-[500px] p-4">
          <div className="space-y-3">
            {messages.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                Noch keine Nachrichten. Sei der Erste!
              </div>
            ) : (
              messages.map((msg) => {
                const isOwnMessage = msg.user_name === userName;
                return (
                  <div
                    key={msg.id}
                    className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg px-4 py-2 ${
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
                  </div>
                );
              })
            )}
            <div ref={scrollRef} />
          </div>
        </ScrollArea>

        {/* Eingabe-Bereich */}
        <div className="border-t p-4">
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <Input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Schreibe eine Nachricht..."
              maxLength={500}
              className="flex-1"
            />
            <Button type="submit" size="icon" disabled={!newMessage.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
          <p className="text-xs text-muted-foreground mt-2">
            {newMessage.length}/500 Zeichen
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
