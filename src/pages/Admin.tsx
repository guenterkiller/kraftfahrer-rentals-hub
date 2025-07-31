import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Eye, Download, ChevronDown, ChevronRight, LogOut, FileText, Image } from "lucide-react";
import type { User } from "@supabase/supabase-js";

interface FahrerProfile {
  id: string;
  vorname: string;
  nachname: string;
  email: string;
  telefon: string;
  status: string;
  created_at: string;
  dokumente: any;
  fuehrerscheinklassen: string[] | null;
  spezialisierungen: string[] | null;
}

interface DocumentFile {
  id: string;
  filename: string;
  filepath: string;
  url: string;
  type: string;
  uploaded_at: string;
  fahrer_id: string;
}

const Admin = () => {
  const [user, setUser] = useState<User | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [fahrer, setFahrer] = useState<FahrerProfile[]>([]);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [documents, setDocuments] = useState<Record<string, DocumentFile[]>>({});
  const [previewDoc, setPreviewDoc] = useState<{ url: string; type: string; filename: string } | null>(null);
  const [inactivityTimer, setInactivityTimer] = useState<NodeJS.Timeout | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const ADMIN_EMAIL = "guenter.killer@t-online.de";

  useEffect(() => {
    checkAuth();
    setupInactivityTimer();
    
    return () => {
      if (inactivityTimer) {
        clearTimeout(inactivityTimer);
      }
    };
  }, []);

  // Auto-Logout bei Inaktivität
  const setupInactivityTimer = () => {
    const resetTimer = () => {
      if (inactivityTimer) {
        clearTimeout(inactivityTimer);
      }
      
      const timer = setTimeout(() => {
        handleAutoLogout();
      }, 15 * 60 * 1000); // 15 Minuten
      
      setInactivityTimer(timer);
    };

    // Activity Events
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    events.forEach(event => {
      document.addEventListener(event, resetTimer, true);
    });

    resetTimer(); // Initial timer start
    
    return () => {
      events.forEach(event => {
        document.removeEventListener(event, resetTimer, true);
      });
    };
  };

  const logAdminEvent = async (event: string, email?: string) => {
    try {
      await supabase.from('admin_log').insert({
        email: email || user?.email || 'unknown',
        event,
        timestamp: new Date().toISOString()
      });
      console.log(`📝 Admin-Log: ${event} für ${email || user?.email}`);
    } catch (error) {
      console.error('❌ Fehler beim Logging:', error);
    }
  };

  const handleAutoLogout = async () => {
    if (user) {
      await logAdminEvent('auto_logout', user.email);
      await supabase.auth.signOut();
      setUser(null);
      setFahrer([]);
      setDocuments({});
      
      toast({
        title: "Automatisch abgemeldet",
        description: "Sie wurden wegen Inaktivität abgemeldet",
        variant: "destructive"
      });
      
      navigate('/');
    }
  };

  const checkAuth = async () => {
    console.log("🔍 Admin: Prüfe Authentifizierung...");
    
    // Prüfe Session erst
    const { data: { session } } = await supabase.auth.getSession();
    console.log("🔐 Admin: Session Check:", session);
    
    if (session?.user && session.user.email === ADMIN_EMAIL) {
      console.log("✅ Admin: Session gefunden für:", session.user.email);
      setUser(session.user);
      loadFahrerData();
      return;
    }
    
    // Fallback: getUser() wenn keine Session
    const { data: { user }, error } = await supabase.auth.getUser();
    console.log("🔐 Admin: getUser() Result:", { user, error });
    console.log("🔐 Admin: User Email:", user?.email);
    console.log("🔐 Admin: Expected Email:", ADMIN_EMAIL);
    console.log("🔐 Admin: Email Match:", user?.email === ADMIN_EMAIL);
    
    if (user && user.email === ADMIN_EMAIL) {
      console.log("✅ Admin: User authentifiziert:", user.email);
      setUser(user);
      loadFahrerData();
    } else {
      console.log("❌ Admin: Keine gültige Authentifizierung");
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Prüfe zuerst über Edge Function
      const { data, error } = await supabase.functions.invoke('check-admin-login', {
        body: { email, password }
      });

      if (error) {
        throw error;
      }

      if (data?.success) {
        // Führe echte Supabase Auth-Anmeldung durch
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email: email,
          password: password
        });

        console.log("🔐 Admin: Supabase Auth Anmeldung:", { authData, authError });

        if (authError) {
          console.error("❌ Admin: Supabase Auth Fehler:", authError);
          // Fallback: Verwende simulierte Session
          const adminUser = {
            id: 'admin',
            email: data.user.email,
            aud: 'authenticated',
            role: 'authenticated',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          } as User;
          
          setUser(adminUser);
        } else {
          // Verwende echte Auth-Session
          setUser(authData.user);
          console.log("✅ Admin: Echte Auth-Session erstellt für:", authData.user.email);
        }

        // Log erfolgreiches Login
        await logAdminEvent('login', authData?.user?.email || email);
        
        loadFahrerData();
        toast({
          title: "Erfolgreich angemeldet",
          description: "Willkommen im Admin-Bereich"
        });
      } else {
        throw new Error("Login fehlgeschlagen");
      }
    } catch (error: any) {
      console.error('Login error:', error);
      toast({
        title: "Login fehlgeschlagen",
        description: error.message || "Ungültige Anmeldedaten",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    if (user) {
      await logAdminEvent('manual_logout', user.email);
    }
    
    await supabase.auth.signOut();
    setUser(null);
    setFahrer([]);
    setDocuments({});
    
    if (inactivityTimer) {
      clearTimeout(inactivityTimer);
    }
    
    toast({
      title: "Abgemeldet",
      description: "Sie wurden erfolgreich abgemeldet"
    });
  };

  const loadFahrerData = async () => {
    setIsLoadingData(true);
    console.log("🔍 Admin: Lade Fahrerdaten...");
    
    try {
      // Debug: Aktuellen Benutzer prüfen
      const { data: user, error: userError } = await supabase.auth.getUser();
      console.log("👤 Aktueller Benutzer:", user);
      console.log("❗ Auth-Fehler:", userError);
      console.log("🔑 User UID:", user?.user?.id);
      
      console.log("🔐 Admin: Auth Status:", { user: user?.user?.email, authError: userError });

      if (!user?.user || user.user.email !== ADMIN_EMAIL) {
        console.error("❌ Admin: Kein Zugriff - ungültiger Benutzer");
        toast({
          title: "Zugriff verweigert",
          description: "Keine Berechtigung für den Admin-Bereich",
          variant: "destructive"
        });
        return;
      }

      const { data, error } = await supabase
        .from("fahrer_profile")
        .select("*")
        .order('created_at', { ascending: false });

      console.log("📊 Admin: Supabase Antwort:", { data, error });
      console.log("📈 Admin: Anzahl Fahrer gefunden:", data?.length || 0);

      if (error) {
        console.error("❌ Admin: Fehler beim Laden der Fahrerdaten:", error);
        toast({
          title: "Fehler beim Laden",
          description: `Fahrerdaten konnten nicht geladen werden: ${error.message}`,
          variant: "destructive"
        });
        return;
      }

      console.log("✅ Admin: Fahrerdaten erfolgreich geladen:", data);
      setFahrer(data || []);
      
      // Clear existing documents when reloading
      setDocuments({});
      setExpandedRows(new Set());
      
      toast({
        title: "Daten aktualisiert",
        description: `${data?.length || 0} Fahrer geladen`
      });
    } catch (error) {
      console.error("❌ Admin: Unerwarteter Fehler:", error);
      toast({
        title: "Fehler",
        description: "Unerwarteter Fehler beim Laden der Daten",
        variant: "destructive"
      });
    } finally {
      setIsLoadingData(false);
    }
  };

  const loadDocuments = async (fahrerEmail: string, fahrerId: string) => {
    if (documents[fahrerId]) return; // Already loaded

    try {
      console.log("📄 Admin: Lade Dokumente für Fahrer:", fahrerEmail);
      
      // Lade Dokumente direkt aus Storage anhand des Pfads uploads/<email>/
      const { data: storageFiles, error } = await supabase.storage
        .from('driver-documents')
        .list(`uploads/${fahrerEmail}/`);

      if (error) {
        console.error("❌ Admin: Fehler beim Laden der Storage-Dokumente:", error);
        return;
      }

      console.log("✅ Admin: Storage-Dokumente geladen:", storageFiles);
      
      // Konvertiere Storage-Files zu DocumentFile Format
      const documentFiles: DocumentFile[] = storageFiles?.map(file => {
        const { data: publicUrl } = supabase.storage
          .from('driver-documents')
          .getPublicUrl(`uploads/${fahrerEmail}/${file.name}`);
        
        return {
          id: file.id || file.name,
          filename: file.name,
          filepath: `uploads/${fahrerEmail}/${file.name}`,
          url: publicUrl.publicUrl,
          type: file.name.toLowerCase().includes('.pdf') ? 'pdf' : 'image',
          uploaded_at: file.updated_at || file.created_at || new Date().toISOString(),
          fahrer_id: fahrerId
        };
      }) || [];

      setDocuments(prev => ({
        ...prev,
        [fahrerId]: documentFiles
      }));
    } catch (error) {
      console.error("❌ Admin: Fehler beim Laden der Dokumente:", error);
    }
  };

  const toggleRow = (fahrerId: string, fahrerEmail: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(fahrerId)) {
      newExpanded.delete(fahrerId);
    } else {
      newExpanded.add(fahrerId);
      loadDocuments(fahrerEmail, fahrerId);
    }
    setExpandedRows(newExpanded);
  };

  const handlePreview = (doc: DocumentFile) => {
    setPreviewDoc({
      url: doc.url,
      type: doc.type,
      filename: doc.filename
    });
  };

  const handleDownload = (doc: DocumentFile) => {
    window.open(doc.url, '_blank');
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      pending: "outline",
      approved: "default",
      rejected: "destructive"
    };
    
    const labels: Record<string, string> = {
      pending: "Wartend",
      approved: "Genehmigt",
      rejected: "Abgelehnt"
    };

    return (
      <Badge variant={variants[status] || "secondary"}>
        {labels[status] || status}
      </Badge>
    );
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Admin Login</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Input
                  type="email"
                  placeholder="E-Mail"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div>
                <Input
                  type="password"
                  placeholder="Passwort"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button 
                type="submit" 
                className="w-full" 
                disabled={loading}
              >
                {loading ? "Anmelden..." : "Anmelden"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-gray-600">Fahrerdokumente verwalten</p>
          </div>
          <Button onClick={handleLogout} variant="outline">
            <LogOut className="h-4 w-4 mr-2" />
            Abmelden
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Registrierte Fahrer ({fahrer.length})</CardTitle>
              <Button 
                onClick={loadFahrerData} 
                variant="outline" 
                size="sm"
                disabled={isLoadingData}
              >
                {isLoadingData ? "Lädt..." : "Aktualisieren"}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-8"></TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>E-Mail</TableHead>
                  <TableHead>Telefon</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Registriert</TableHead>
                  <TableHead>Führerschein</TableHead>
                  <TableHead>Dokumente</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fahrer.map((f) => (
                  <Collapsible key={f.id} open={expandedRows.has(f.id)}>
                    <CollapsibleTrigger asChild>
                      <TableRow 
                        className="cursor-pointer hover:bg-gray-50"
                        onClick={() => toggleRow(f.id, f.email)}
                      >
                        <TableCell>
                          {expandedRows.has(f.id) ? 
                            <ChevronDown className="h-4 w-4" /> : 
                            <ChevronRight className="h-4 w-4" />
                          }
                        </TableCell>
                        <TableCell className="font-medium">
                          {f.vorname} {f.nachname}
                        </TableCell>
                        <TableCell>{f.email}</TableCell>
                        <TableCell>{f.telefon}</TableCell>
                        <TableCell>{getStatusBadge(f.status)}</TableCell>
                        <TableCell>
                          {new Date(f.created_at).toLocaleDateString('de-DE')}
                        </TableCell>
                        <TableCell>
                          {f.fuehrerscheinklassen?.join(", ") || "-"}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {documents[f.id]?.length || 0} Dateien
                          </Badge>
                        </TableCell>
                      </TableRow>
                    </CollapsibleTrigger>
                    
                    <CollapsibleContent asChild>
                      <TableRow>
                        <TableCell colSpan={8} className="bg-gray-50">
                          <div className="py-4">
                            <h4 className="font-medium mb-3">Hochgeladene Dokumente:</h4>
                            {documents[f.id]?.length > 0 ? (
                              <div className="grid gap-2">
                                {documents[f.id].map((doc, index) => (
                                  <div 
                                    key={index}
                                    className="flex items-center justify-between p-3 bg-white rounded border"
                                  >
                                    <div className="flex items-center space-x-3">
                                      {doc.type === 'pdf' ? (
                                        <FileText className="h-5 w-5 text-red-500" />
                                      ) : (
                                        <Image className="h-5 w-5 text-blue-500" />
                                      )}
                                      <span className="font-medium">{doc.filename}</span>
                                    </div>
                                    <div className="flex space-x-2">
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handlePreview(doc)}
                                      >
                                        <Eye className="h-4 w-4 mr-1" />
                                        Vorschau
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleDownload(doc)}
                                      >
                                        <Download className="h-4 w-4 mr-1" />
                                        Download
                                      </Button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-gray-500 italic">Keine Dokumente hochgeladen</p>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    </CollapsibleContent>
                  </Collapsible>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Preview Dialog */}
      <Dialog open={!!previewDoc} onOpenChange={() => setPreviewDoc(null)}>
        <DialogContent className="max-w-4xl h-[80vh]">
          <DialogHeader>
            <DialogTitle>{previewDoc?.filename}</DialogTitle>
          </DialogHeader>
          {previewDoc && (
            <div className="flex-1 overflow-auto">
              {previewDoc.type === 'pdf' ? (
                <iframe
                  src={previewDoc.url}
                  className="w-full h-full border-0"
                  title={previewDoc.filename}
                />
              ) : (
                <img
                  src={previewDoc.url}
                  alt={previewDoc.filename}
                  className="max-w-full h-auto mx-auto"
                />
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Admin;