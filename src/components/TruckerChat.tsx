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
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { divIcon } from "leaflet";
import "leaflet/dist/leaflet.css";

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
}

interface LocationCluster {
  lat: number;
  lng: number;
  count: number;
  drivers: { user_id: string; user_name: string; }[];
  place_name?: string;
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
  const [blockedUsers, setBlockedUsers] = useState<Set<string>>(new Set());
  const [nearbyDrivers, setNearbyDrivers] = useState<NearbyDriver[]>([]);
  const [sharingLocation, setSharingLocation] = useState(false);
  const [hasSharedLocation, setHasSharedLocation] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [clusters, setClusters] = useState<LocationCluster[]>([]);
  const [mapCenter, setMapCenter] = useState<[number, number]>([51.1657, 10.4515]); // Kassel region
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
        .select('user_id')
        .eq('cluster_lat', myLocation.cluster_lat)
        .eq('cluster_lng', myLocation.cluster_lng)
        .neq('user_id', user.id);

      if (!locations || locations.length === 0) {
        setNearbyDrivers([]);
        return;
      }

      // Hole Namen aus fahrer_profile
      const userIds = locations.map(l => l.user_id);
      const { data: profiles } = await supabase
        .from('fahrer_profile')
        .select('id, vorname, nachname')
        .in('id', userIds);

      const nearby = (profiles || []).slice(0, 5).map(p => ({
        user_id: p.id,
        user_name: `${p.vorname} ${p.nachname.charAt(0)}.`
      }));

      setNearbyDrivers(nearby);
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

    // Gruppiere nach cluster_lat + cluster_lng
    const clusterMap = new Map<string, LocationCluster>();
    
    for (const loc of locations) {
      const key = `${loc.cluster_lat},${loc.cluster_lng}`;
      const existing = clusterMap.get(key);
      
      if (existing) {
        existing.count++;
        existing.drivers.push({ user_id: loc.user_id, user_name: "Fahrer" });
      } else {
        clusterMap.set(key, {
          lat: loc.cluster_lat,
          lng: loc.cluster_lng,
          count: 1,
          drivers: [{ user_id: loc.user_id, user_name: "Fahrer" }],
          place_name: loc.place_name
        });
      }
    }

    // Hole Namen aus fahrer_profile
    const allUserIds = locations.map(l => l.user_id);
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

    return () => {
      supabase.removeChannel(channel);
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

        {/* Fahrer in der Nähe anzeigen */}
        {user && hasSharedLocation && (
          <div className="m-4 p-3 border rounded-lg bg-muted/30">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="h-4 w-4 text-primary" />
              <span className="font-semibold text-sm">Fahrer am gleichen Standort:</span>
            </div>
            {nearbyDrivers.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Noch keine Fahrer in deiner Nähe – vielleicht später!
              </p>
            ) : (
              <ul className="text-sm space-y-1">
                {nearbyDrivers.map((driver) => (
                  <li key={driver.user_id} className="text-muted-foreground">
                    {driver.user_name} – in deiner Nähe
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Karte mit Fahrer-Clustern */}
        <div className="m-4 border rounded-lg bg-muted/30">
          <div className="p-3">
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
              <div className="h-[400px] rounded-md overflow-hidden mt-3">
                <MapContainer
                  key={`${mapCenter[0]}-${mapCenter[1]}`}
                  center={mapCenter}
                  zoom={7}
                  style={{ height: "100%", width: "100%" }}
                  scrollWheelZoom={true}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  {clusters.map((cluster, idx) => {
                    const icon = divIcon({
                      className: 'custom-cluster-icon',
                      html: `<div style="
                        background: hsl(var(--primary));
                        color: hsl(var(--primary-foreground));
                        border-radius: 50%;
                        width: ${Math.min(30 + cluster.count * 5, 60)}px;
                        height: ${Math.min(30 + cluster.count * 5, 60)}px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-weight: bold;
                        font-size: ${Math.min(12 + cluster.count, 18)}px;
                        border: 2px solid white;
                        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                      ">${cluster.count}</div>`,
                      iconSize: [Math.min(30 + cluster.count * 5, 60), Math.min(30 + cluster.count * 5, 60)],
                      iconAnchor: [Math.min(15 + cluster.count * 2.5, 30), Math.min(15 + cluster.count * 2.5, 30)]
                    });

                    return (
                      <Marker
                        key={idx}
                        position={[cluster.lat, cluster.lng]}
                        icon={icon}
                      >
                        <Popup>
                          <div className="text-sm">
                            <p className="font-semibold mb-1">
                              {cluster.count} {cluster.count === 1 ? 'Fahrer' : 'Fahrer'} in dieser Nähe
                            </p>
                            {cluster.place_name && (
                              <p className="text-xs text-muted-foreground mb-2">
                                Autohof / Rastplatz in der Nähe
                              </p>
                            )}
                            <ul className="text-xs space-y-1 max-h-24 overflow-y-auto">
                              {cluster.drivers.slice(0, 5).map((driver, dIdx) => (
                                <li key={dIdx} className="text-muted-foreground">
                                  {driver.user_name}
                                </li>
                              ))}
                              {cluster.drivers.length > 5 && (
                                <li className="text-muted-foreground italic">
                                  ... und {cluster.drivers.length - 5} weitere
                                </li>
                              )}
                            </ul>
                          </div>
                        </Popup>
                      </Marker>
                    );
                  })}
                </MapContainer>
              </div>
            )}
          </div>
        </div>

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
  );
};
