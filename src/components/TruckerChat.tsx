import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Users, Flag, Trash2, AlertCircle, VolumeX, MapPin, ChevronDown, ChevronUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User } from "@supabase/supabase-js";
import { TruckerLocationMap } from "./TruckerLocationMap";

// B) Schimpfwort-/Sex-Content-Filter
const blockedWords = [
  "arsch",
  "hure",
  "wichser",
  "fick",
  "nazi",
  "hitler",
  "sex",
  "anal",
  "pimmel",
  "fotze"
];

interface ChatMessage {
  id: string;
  user_name: string;
  message: string;
  created_at: string;
}

interface NearbyDriver {
  user_id: string;
  user_name: string;
  updated_at?: string;
}

interface LocationCluster {
  lat: number;
  lng: number;
  count: number;
  drivers: { user_id: string; user_name: string; updated_at?: string; }[];
  place_name?: string;
}

export const TruckerChat = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [onlineCount, setOnlineCount] = useState(1);
  const [user, setUser] = useState<User | null>(null);
  const [userName, setUserName] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [signUpEmail, setSignUpEmail] = useState("");
  const [signUpPassword, setSignUpPassword] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [canSend, setCanSend] = useState(true);
  const [countdown, setCountdown] = useState(0);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [reportMessageId, setReportMessageId] = useState<string | null>(null);
  const [reportReason, setReportReason] = useState("");
  const [blockedUsers, setBlockedUsers] = useState<Set<string>>(new Set());
  const [nearbyDrivers, setNearbyDrivers] = useState<NearbyDriver[]>([]);
  const [sharingLocation, setSharingLocation] = useState(false);
  const [hasSharedLocation, setHasSharedLocation] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [clusters, setClusters] = useState<LocationCluster[]>([]);
  const [mapCenter, setMapCenter] = useState<[number, number]>([51.1657, 10.4515]); // Kassel region
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Debug-Panel State
  const [showDebug, setShowDebug] = useState(false);
  const [authState, setAuthState] = useState<string>("INITIALIZING");
  const [lastLoginResponse, setLastLoginResponse] = useState<string>("");
  const [hasSession, setHasSession] = useState(false);
  const [sessionUserId, setSessionUserId] = useState<string>("");

  // Debug-Panel sichtbar bei ?debug=1 oder für Admins
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('debug') === '1' || isAdmin) {
      setShowDebug(true);
    }
  }, [isAdmin]);

  // Auth-Status überwachen + Session-Handling
  useEffect(() => {
    // Aktuelle Session prüfen
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUser(session.user);
        setHasSession(true);
        setSessionUserId(session.user.id);
        console.log('[TruckerChat Debug] Initial session found:', session.user.id);
      } else {
        setUser(null);
        setHasSession(false);
        setSessionUserId("");
        console.log('[TruckerChat Debug] No initial session');
      }
    });

    // Auth-State-Changes abonnieren
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('[TruckerChat Debug] Auth state changed:', event);
      setAuthState(event);
      setUser(session?.user ?? null);
      setHasSession(!!session);
      setSessionUserId(session?.user?.id || "");
    });

    return () => subscription.unsubscribe();
  }, []);

  // A) Geblockte User aus localStorage laden
  useEffect(() => {
    const stored = localStorage.getItem("trucker_chat_blocked");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setBlockedUsers(new Set(parsed));
      } catch (e) {
        console.error("Error loading blocklist", e);
      }
    }
  }, []);

  // Lade Fahrer in der Nähe
  useEffect(() => {
    if (!user || !hasSharedLocation) return;

    const loadNearbyDrivers = async () => {
      // Hole eigenen Standort
      const { data: myLocation } = await supabase
        .from('trucker_locations')
        .select('cluster_lat, cluster_lng')
        .eq('user_id', user.id)
        .single();

      if (!myLocation) return;

      // Hole alle mit gleichem Cluster
      const { data: locations } = await supabase
        .from('trucker_locations')
        .select('user_id, updated_at')
        .eq('cluster_lat', myLocation.cluster_lat)
        .eq('cluster_lng', myLocation.cluster_lng)
        .neq('user_id', user.id);

      if (!locations || locations.length === 0) {
        setNearbyDrivers([]);
        return;
      }

      // 1) Aktivitäts-Filter: nur letzten 90 Minuten
      const activeWindowMs = 90 * 60 * 1000;
      const now = Date.now();
      const activeLocations = locations.filter(loc =>
        now - new Date(loc.updated_at).getTime() <= activeWindowMs
      );

      if (activeLocations.length === 0) {
        setNearbyDrivers([]);
        return;
      }

      // Hole Namen aus fahrer_profile
      const userIds = activeLocations.map(l => l.user_id);
      const { data: profiles } = await supabase
        .from('fahrer_profile')
        .select('id, vorname, nachname')
        .in('id', userIds);

      // Erstelle nearby-Liste mit Zeitstempel
      const nearby = (profiles || []).map(p => {
        const loc = activeLocations.find(l => l.user_id === p.id);
        return {
          user_id: p.id,
          user_name: `${p.vorname} ${p.nachname.charAt(0)}.`,
          updated_at: loc?.updated_at || new Date().toISOString()
        };
      });

      // Sortiere nach updated_at absteigend (neueste zuerst)
      nearby.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());

      setNearbyDrivers(nearby.slice(0, 5));
    };

    loadNearbyDrivers();

    // Realtime subscription für Standort-Updates
    const channel = supabase
      .channel('nearby-drivers')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'trucker_locations'
        },
        () => {
          loadNearbyDrivers();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, hasSharedLocation]);

  // Lade Cluster-Daten für Karte
  const loadClusters = async () => {
    const { data: locations } = await supabase
      .from('trucker_locations')
      .select('cluster_lat, cluster_lng, place_name, updated_at, user_id');

    if (!locations) {
      setClusters([]);
      return;
    }

    // 1) Aktivitäts-Filter: nur letzten 90 Minuten
    const activeWindowMs = 90 * 60 * 1000;
    const now = Date.now();
    const activeLocations = locations.filter(loc =>
      now - new Date(loc.updated_at).getTime() <= activeWindowMs
    );

    if (activeLocations.length === 0) {
      setClusters([]);
      return;
    }

    // Gruppiere nach cluster_lat + cluster_lng
    const clusterMap = new Map<string, LocationCluster>();
    
    for (const loc of activeLocations) {
      const key = `${loc.cluster_lat},${loc.cluster_lng}`;
      const existing = clusterMap.get(key);
      
      if (existing) {
        existing.count++;
        existing.drivers.push({ 
          user_id: loc.user_id, 
          user_name: "Fahrer",
          updated_at: loc.updated_at
        });
      } else {
        clusterMap.set(key, {
          lat: loc.cluster_lat,
          lng: loc.cluster_lng,
          count: 1,
          drivers: [{ 
            user_id: loc.user_id, 
            user_name: "Fahrer",
            updated_at: loc.updated_at
          }],
          place_name: loc.place_name
        });
      }
    }

    // Hole Namen aus fahrer_profile
    const allUserIds = activeLocations.map(l => l.user_id);
    const { data: profiles } = await supabase
      .from('fahrer_profile')
      .select('id, vorname, nachname')
      .in('id', allUserIds);

    // Namen in Cluster einfügen
    if (profiles) {
      clusterMap.forEach(cluster => {
        cluster.drivers = cluster.drivers.map(driver => {
          const profile = profiles.find(p => p.id === driver.user_id);
          return {
            ...driver,
            user_name: profile ? `${profile.vorname} ${profile.nachname.charAt(0)}.` : "Fahrer anonym"
          };
        });
      });
    }

    setClusters(Array.from(clusterMap.values()));
  };

  // Realtime-Updates für Karte
  useEffect(() => {
    if (!showMap) return;

    loadClusters();

    const channel = supabase
      .channel('trucker_locations_realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'trucker_locations'
        },
        () => {
          loadClusters();
        }
      )
      .subscribe();

    // 3) Auto-Refresh alle 60 Sekunden
    const refreshInterval = setInterval(() => {
      console.log('[TruckerChat] Auto-refresh: reloading clusters...');
      loadClusters();
    }, 60000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(refreshInterval);
    };
  }, [showMap]);

  // Setze Karten-Center wenn User Standort teilt
  useEffect(() => {
    if (!user || !hasSharedLocation) return;

    const setMapToUserLocation = async () => {
      const { data: myLocation } = await supabase
        .from('trucker_locations')
        .select('cluster_lat, cluster_lng')
        .eq('user_id', user.id)
        .single();

      if (myLocation) {
        setMapCenter([myLocation.cluster_lat, myLocation.cluster_lng]);
      }
    };

    setMapToUserLocation();
  }, [user, hasSharedLocation]);

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

    // B) Schimpfwort-Filter prüfen
    const lowerMessage = trimmedMessage.toLowerCase();
    const containsBlockedWord = blockedWords.some(word => lowerMessage.includes(word));
    
    if (containsBlockedWord) {
      toast({
        title: "Nachricht blockiert",
        description: "Diese Nachricht verstößt gegen die Chat-Regeln.",
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

  // A) User blockieren/stummschalten
  const handleBlockUser = async (blockedName: string) => {
    if (!user) return;

    // Zu localStorage hinzufügen
    const newBlocked = new Set(blockedUsers);
    newBlocked.add(blockedName);
    setBlockedUsers(newBlocked);
    localStorage.setItem("trucker_chat_blocked", JSON.stringify([...newBlocked]));

    // In Datenbank speichern
    await supabase
      .from('trucker_chat_blocklist')
      .insert({
        blocker_id: user.id,
        blocked_name: blockedName
      });

    toast({
      title: "Nutzer stummgeschaltet",
      description: `${blockedName} wurde stummgeschaltet. Du siehst deren Nachrichten nicht mehr.`
    });
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

  const handleShareLocation = async () => {
    if (!user) {
      toast({
        title: "Login erforderlich",
        description: "Bitte melde dich an, um deinen Standort zu teilen.",
        variant: "destructive"
      });
      return;
    }

    setSharingLocation(true);

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });

      const { latitude, longitude } = position.coords;

      // Standort runden (ca. 500m Radius)
      const clusterLat = Math.round(latitude * 200) / 200;
      const clusterLng = Math.round(longitude * 200) / 200;

      const { error } = await supabase
        .from('trucker_locations')
        .upsert({
          user_id: user.id,
          cluster_lat: clusterLat,
          cluster_lng: clusterLng,
          place_name: null,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      setHasSharedLocation(true);
      toast({
        title: "Standort geteilt",
        description: "Dein ungefährer Standort wurde geteilt."
      });
    } catch (error: any) {
      toast({
        title: "Fehler",
        description: error.message || "Standort konnte nicht geteilt werden.",
        variant: "destructive"
      });
    } finally {
      setSharingLocation(false);
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('de-DE', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);

    // Debug-Logging
    console.log('[TruckerChat Debug] Login attempt for:', loginEmail.trim().toLowerCase());

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginEmail.trim().toLowerCase(),
        password: loginPassword
      });

      // Debug-Logging
      console.log('[TruckerChat Debug] Login response:', {
        email: loginEmail.trim().toLowerCase(),
        error: error?.message,
        userId: data?.user?.id
      });

      if (error) {
        console.error("Chat login error", error);
        setLastLoginResponse(`Login Fehler: ${error.message}`);
        let errorMessage = "E-Mail oder Passwort falsch.";
        
        if (error.message.includes("Email not confirmed")) {
          errorMessage = "Bitte bestätige zuerst deine E-Mail-Adresse.";
        } else if (error.message.includes("Invalid login credentials")) {
          errorMessage = "E-Mail oder Passwort falsch.";
        }

        toast({
          title: "Login fehlgeschlagen",
          description: errorMessage,
          variant: "destructive"
        });
        return;
      }

      if (data?.user) {
        // C) Kein Router-Redirect, nur State + Toast
        setUser(data.user);
        setLastLoginResponse(`Login OK: User ${data.user.id}`);
        toast({
          title: "Erfolgreich angemeldet",
          description: "Du kannst jetzt im Chat schreiben."
        });
        setLoginEmail("");
        setLoginPassword("");
      }
    } catch (err) {
      console.error("Unerwarteter Chat-Login-Fehler", err);
      setLastLoginResponse(`Unerwarteter Fehler: ${err}`);
      toast({
        title: "Fehler",
        description: "Ein unerwarteter Fehler ist aufgetreten.",
        variant: "destructive"
      });
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'facebook') => {
    try {
      const redirectUrl = `${window.location.origin}${window.location.pathname}#chat-login`;
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: redirectUrl,
        },
      });

      if (error) {
        console.error(`${provider} login error:`, error);
        toast({
          title: "Login fehlgeschlagen",
          description: `Fehler bei ${provider === 'google' ? 'Google' : 'Facebook'} Login: ${error.message}`,
          variant: "destructive"
        });
      }
    } catch (err) {
      console.error(`Unexpected ${provider} login error:`, err);
      toast({
        title: "Fehler",
        description: "Ein unerwarteter Fehler ist aufgetreten.",
        variant: "destructive"
      });
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsRegistering(true);

    const email = signUpEmail.trim().toLowerCase();
    const password = signUpPassword;

    try {
      const redirectUrl = `${window.location.origin}${window.location.pathname}#chat-login`;

      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
        },
      });

      if (error) {
        console.error("Chat sign-up error", error);
        toast({
          title: "Registrierung fehlgeschlagen",
          description: error.message || "Bitte prüfe deine Eingaben.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Registrierung gestartet",
        description: "Bitte bestätige den Link in der E-Mail, dann kannst du dich im Chat einloggen.",
      });

      setSignUpEmail("");
      setSignUpPassword("");
    } catch (err: any) {
      console.error("Unerwarteter Chat-Sign-Up-Fehler", err);
      toast({
        title: "Fehler",
        description: err?.message || "Ein unerwarteter Fehler ist aufgetreten.",
        variant: "destructive",
      });
    } finally {
      setIsRegistering(false);
    }
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error("Chat logout error", error);
        toast({
          title: "Fehler beim Abmelden",
          description: error.message,
          variant: "destructive"
        });
        return;
      }

      // Lokalen State zurücksetzen
      setUser(null);
      setHasSharedLocation(false);
      setNearbyDrivers([]);
      
      toast({
        title: "Abgemeldet",
        description: "Du wurdest erfolgreich abgemeldet."
      });
    } catch (err) {
      console.error("Unerwarteter Chat-Logout-Fehler", err);
      toast({
        title: "Fehler",
        description: "Ein unerwarteter Fehler ist aufgetreten.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Debug-Panel */}
      {showDebug && (
        <Card className="border-yellow-500 bg-yellow-50/50">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-mono">🔧 Debug (nur Admin)</CardTitle>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setShowDebug(!showDebug)}
              >
                {showDebug ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-2 text-xs font-mono">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="font-semibold">Supabase URL:</span>
                <div className="text-muted-foreground break-all">
                  {import.meta.env.VITE_SUPABASE_URL?.slice(0, 30) || "https://hxnabnsoffzevqhruvar..."}
                </div>
              </div>
              <div>
                <span className="font-semibold">Anon-Key geladen:</span>
                <div className={import.meta.env.VITE_SUPABASE_ANON_KEY ? "text-green-600" : "text-red-600"}>
                  {import.meta.env.VITE_SUPABASE_ANON_KEY ? "✓ true" : "✗ false"}
                </div>
              </div>
              <div>
                <span className="font-semibold">Session vorhanden:</span>
                <div className={hasSession ? "text-green-600" : "text-red-600"}>
                  {hasSession ? `✓ ja (${sessionUserId.slice(0, 8)}...)` : "✗ nein"}
                </div>
              </div>
              <div>
                <span className="font-semibold">Auth State:</span>
                <div className="text-blue-600">{authState}</div>
              </div>
            </div>
            {lastLoginResponse && (
              <div className="mt-3 p-2 bg-white rounded border">
                <span className="font-semibold">Letzte Login-Response:</span>
                <div className={lastLoginResponse.includes("OK") ? "text-green-600" : "text-red-600"}>
                  {lastLoginResponse}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Login- und Registrierungsbereich für nicht angemeldete Benutzer */}
      {!user && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto mb-4">
          <Card id="chat-login">
            <CardHeader>
              <CardTitle>Login erforderlich</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="text-sm font-medium">E-Mail</label>
                  <Input
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="deine@email.de"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Passwort</label>
                  <Input
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                  />
                </div>
                <Button type="submit" disabled={isLoggingIn} className="w-full">
                  {isLoggingIn ? "Anmelden..." : "Anmelden"}
                </Button>
                
                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">Oder</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleSocialLogin('google')}
                    className="w-full"
                  >
                    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                      <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        fill="#4285F4"
                      />
                      <path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        fill="#34A853"
                      />
                      <path
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        fill="#FBBC05"
                      />
                      <path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        fill="#EA4335"
                      />
                    </svg>
                    Google
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleSocialLogin('facebook')}
                    className="w-full"
                  >
                    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="#1877F2">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                    Facebook
                  </Button>
                </div>

                <p className="text-sm text-muted-foreground text-center mt-4">
                  Noch kein Fahrer-Zugang?{" "}
                  <a
                    href="#chat-register"
                    className="text-primary hover:underline font-medium"
                  >
                    → jetzt kostenlos registrieren
                  </a>
                </p>
              </form>
            </CardContent>
          </Card>

          <Card id="chat-register">
            <CardHeader>
              <CardTitle>Neu im Fahrer-Community-Chat?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Registriere dich mit E-Mail und Passwort. Du erhältst einen Bestätigungslink per E-Mail.
              </p>
              <form onSubmit={handleSignUp} className="space-y-4">
                <div>
                  <label className="text-sm font-medium">E-Mail</label>
                  <Input
                    type="email"
                    value={signUpEmail}
                    onChange={(e) => setSignUpEmail(e.target.value)}
                    placeholder="deine@email.de"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Passwort festlegen</label>
                  <Input
                    type="password"
                    value={signUpPassword}
                    onChange={(e) => setSignUpPassword(e.target.value)}
                    placeholder="Mindestens 6 Zeichen"
                    required
                  />
                </div>
                <Button type="submit" disabled={isRegistering} className="w-full">
                  {isRegistering ? "Registriere..." : "Jetzt registrieren"}
                </Button>
                
                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">Oder</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleSocialLogin('google')}
                    className="w-full"
                  >
                    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                      <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        fill="#4285F4"
                      />
                      <path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        fill="#34A853"
                      />
                      <path
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        fill="#FBBC05"
                      />
                      <path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        fill="#EA4335"
                      />
                    </svg>
                    Google
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleSocialLogin('facebook')}
                    className="w-full"
                  >
                    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="#1877F2">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                    Facebook
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Fahrer-Community-Livechat
            </CardTitle>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
              {onlineCount} {onlineCount === 1 ? 'Person' : 'Personen'} online
            </div>
          </div>
          {user && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Eingeloggt als: <span className="font-medium">{userName}</span>
              </p>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                Abmelden
              </Button>
            </div>
          )}
        </CardHeader>
      
      <CardContent className="p-0">
        {/* Standort-Freigabe Banner */}
        {user && !hasSharedLocation && (
          <Alert className="m-4 border-yellow-500/20 bg-yellow-500/5">
            <MapPin className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-sm">
              <strong>Fahrer in deiner Nähe:</strong><br />
              Du kannst optional deinen ungefähren Standort teilen, um zu sehen, wer am gleichen Rastplatz oder in deiner Nähe ist.
              <Button
                variant="outline"
                size="sm"
                className="mt-2 w-full"
                onClick={handleShareLocation}
                disabled={sharingLocation}
              >
                {sharingLocation ? "Standort wird geteilt..." : "Standort freigeben"}
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* 2) "Jetzt in deiner Nähe"-Liste */}
        {user && hasSharedLocation && (
          <div className="m-4 p-3 border rounded-lg bg-muted/30">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="h-4 w-4 text-primary" />
              <span className="font-semibold text-sm">
                Jetzt in deiner Nähe {nearbyDrivers.length > 0 && `(${nearbyDrivers.length})`}
              </span>
            </div>
            {nearbyDrivers.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Gerade niemand in deiner Nähe – prüfe später nochmal.
              </p>
            ) : (
              <ul className="text-sm space-y-1">
                {nearbyDrivers.map((driver) => {
                  const minutesAgo = driver.updated_at 
                    ? Math.floor((Date.now() - new Date(driver.updated_at).getTime()) / 60000)
                    : 0;
                  const timeLabel = minutesAgo < 5 ? 'online' : `vor ${minutesAgo} Min.`;
                  
                  return (
                    <li key={driver.user_id} className="text-muted-foreground flex items-center gap-2">
                      <span className="font-medium">{driver.user_name}</span>
                      <span className="text-xs">– {timeLabel}</span>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        )}

        {/* Karte mit Fahrer-Clustern + Community-Regeln */}
        <div className="mx-4 mb-4 space-y-4">
          {/* Karte mit Fahrer-Clustern */}
          <div className="p-3 border rounded-lg bg-muted/30">
            <div className="flex items-center justify-between mb-2">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span className="font-semibold text-sm">Karte mit Fahrer-Clustern</span>
                </div>
                <p className="text-xs text-muted-foreground opacity-70">
                  Es werden nur ungefähre Cluster-Standorte (ca. 300–600 m Radius) angezeigt – keine exakte Ortung.
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowMap(!showMap)}
                className="shrink-0"
              >
                {showMap ? (
                  <>
                    <ChevronUp className="h-4 w-4 mr-1" />
                    Ausblenden
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4 mr-1" />
                    Anzeigen
                  </>
                )}
              </Button>
            </div>

            {showMap && (
              <TruckerLocationMap clusters={clusters} center={mapCenter} />
            )}
          </div>

          {/* Community-Regeln */}
          <Alert className="border-primary/20 bg-primary/5">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-sm">
              <strong>Regeln:</strong> Respektvoller Umgang. Keine Beleidigungen, keine sexuellen Inhalte, 
              keine Hetze, keine Werbung/Spam. Verstöße werden gelöscht und führen zur Sperre.
            </AlertDescription>
          </Alert>
        </div>

        {/* Nachrichten-Bereich */}
        <ScrollArea className="h-[500px] p-4">
          <div className="space-y-3">
            {messages.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                Noch keine Nachrichten. Sei der Erste!
              </div>
            ) : (
              messages
                .filter(msg => !blockedUsers.has(msg.user_name)) // A) Geblockte User ausfiltern
                .map((msg) => {
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
                      
                      {/* Melden, Stummschalten & Löschen Buttons */}
                      <div className="flex gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {user && !isOwnMessage && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 text-xs"
                              onClick={() => handleBlockUser(msg.user_name)}
                            >
                              <VolumeX className="h-3 w-3 mr-1" />
                              Stummschalten
                            </Button>
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
                          </>
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
        <div className="border-t p-4 bg-background">
          {!user ? (
            <Alert>
              <AlertDescription>
                Du musst <a href="#chat-login" className="underline font-medium">angemeldet</a> sein,
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
                  className="flex-1 h-12 text-base"
                  disabled={!canSend}
                />
                <Button type="submit" size="lg" disabled={!newMessage.trim() || !canSend}>
                  <Send className="h-5 w-5" />
                </Button>
              </form>
              <div className="flex justify-between items-center mt-3">
                <p className="text-xs text-muted-foreground">
                  {newMessage.length}/500 Zeichen
                </p>
                {!canSend && (
                  <p className="text-xs text-muted-foreground">
                    Bitte kurz warten... ({countdown}s)
                  </p>
                )}
              </div>
              {/* C) UI-Hinweis */}
              <p className="text-xs text-muted-foreground opacity-70 mt-2">
                Hinweis: Du kannst andere Nutzer stummschalten. Respektvoller Umgang erforderlich.
              </p>
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
    </div>
  );
};
