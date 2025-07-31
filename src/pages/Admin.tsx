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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  verfuegbare_regionen: string[] | null;
  ort: string | null;
  plz: string | null;
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
  const [documentCounts, setDocumentCounts] = useState<Record<string, number>>({});
  const [jobRequests, setJobRequests] = useState<any[]>([]);
  const [previewDoc, setPreviewDoc] = useState<{ url: string; type: string; filename: string } | null>(null);
  const [inactivityTimer, setInactivityTimer] = useState<NodeJS.Timeout | null>(null);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<string>("");
  const [selectedDriverEmail, setSelectedDriverEmail] = useState<string>("");
  const [assigningDriver, setAssigningDriver] = useState(false);
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
        loadJobRequests();
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

  const loadJobRequests = async () => {
    try {
      const { data, error } = await supabase
        .from("job_requests")
        .select("*")
        .order('created_at', { ascending: false });

      if (error) {
        console.error("❌ Admin: Fehler beim Laden der Fahreranfragen:", error);
        return;
      }

      console.log("✅ Admin: Fahreranfragen erfolgreich geladen:", data);
      setJobRequests(data || []);
    } catch (error) {
      console.error("❌ Admin: Unerwarteter Fehler beim Laden der Fahreranfragen:", error);
    }
  };

  const handleAcceptJob = async (jobId: string) => {
    try {
      const { error } = await supabase
        .from("job_requests")
        .update({ status: 'angenommen' })
        .eq('id', jobId);

      if (error) {
        toast({
          title: "Fehler",
          description: "Anfrage konnte nicht angenommen werden",
          variant: "destructive"
        });
        return;
      }

      // Update local state
      setJobRequests(prev => 
        prev.map(req => 
          req.id === jobId ? { ...req, status: 'angenommen' } : req
        )
      );

      toast({
        title: "Anfrage angenommen",
        description: "Die Fahreranfrage wurde erfolgreich angenommen"
      });

      // Optional: Send notification to all registered drivers
      await sendJobNotificationToDrivers(jobId);

    } catch (error) {
      console.error("❌ Admin: Fehler beim Annehmen der Anfrage:", error);
      toast({
        title: "Fehler",
        description: "Unerwarteter Fehler beim Annehmen der Anfrage",
        variant: "destructive"
      });
    }
  };

  const sendJobNotificationToDrivers = async (jobId: string) => {
    try {
      const { error } = await supabase.functions.invoke('send-job-alert-emails', {
        body: { jobId }
      });

      if (error) {
        console.error("❌ Admin: Fehler beim Senden der Benachrichtigungen:", error);
      } else {
        console.log("✅ Admin: Benachrichtigungen an Fahrer gesendet");
      }
    } catch (error) {
      console.error("❌ Admin: Fehler beim Senden der Benachrichtigungen:", error);
    }
  };

  const handleAssignDriver = (jobId: string) => {
    console.log("🎯 Opening assign dialog for job:", jobId);
    console.log("📋 Available drivers:", fahrer.length);
    console.log("✅ Approved drivers:", fahrer.filter(f => f.status === 'approved').length);
    console.log("👥 Driver list:", fahrer.map(f => ({ name: `${f.vorname} ${f.nachname}`, email: f.email, status: f.status })));
    
    setSelectedJobId(jobId);
    setAssignDialogOpen(true);
  };

  const assignDriverToJob = async () => {
    console.log("🚀 Starting driver assignment...");
    console.log("📋 Selected Job ID:", selectedJobId);
    console.log("👤 Selected Driver Email:", selectedDriverEmail);
    
    if (!selectedJobId || !selectedDriverEmail) {
      console.error("❌ Missing job ID or driver email");
      toast({
        title: "Fehler",
        description: "Bitte wählen Sie einen Fahrer aus",
        variant: "destructive"
      });
      return;
    }

    setAssigningDriver(true);
    
    try {
      const selectedDriver = fahrer.find(f => f.email === selectedDriverEmail);
      console.log("🔍 Found driver:", selectedDriver);
      
      if (!selectedDriver) {
        console.error("❌ Driver not found in fahrer list");
        toast({
          title: "Fehler",
          description: "Ausgewählter Fahrer nicht gefunden",
          variant: "destructive"
        });
        setAssigningDriver(false);
        return;
      }

      console.log("📧 Invoking edge function...");
      const { data, error } = await supabase.functions.invoke('assign-driver-to-job', {
        body: {
          jobId: selectedJobId,
          driverEmail: selectedDriverEmail,
          driverName: `${selectedDriver.vorname} ${selectedDriver.nachname}`
        }
      });

      console.log("📨 Function response:", { data, error });

      if (error) {
        console.error("❌ Edge function error:", error);
        toast({
          title: "Fehler beim E-Mail-Versand",
          description: `Fehler: ${error.message || 'Unbekannter Fehler'}`,
          variant: "destructive"
        });
        setAssigningDriver(false);
        return;
      }

      // Update job status to assigned
      console.log("📝 Updating job status...");
      const { error: updateError } = await supabase
        .from('job_requests')
        .update({ status: 'assigned' })
        .eq('id', selectedJobId);

      if (updateError) {
        console.error("❌ Job update error:", updateError);
        // Don't fail completely, just log the error
      }

      console.log("✅ Assignment successful!");
      toast({
        title: "Fahrer erfolgreich zugewiesen",
        description: `${selectedDriver.vorname} ${selectedDriver.nachname} wurde per E-Mail benachrichtigt`
      });

      // Close modal and reset states
      setAssignDialogOpen(false);
      setSelectedJobId("");
      setSelectedDriverEmail("");
      
      // Reload job requests to show updated status
      await loadJobRequests();

    } catch (error) {
      console.error("❌ Unexpected error in assignDriverToJob:", error);
      toast({
        title: "Unerwarteter Fehler",
        description: `Ein Fehler ist aufgetreten: ${error instanceof Error ? error.message : 'Unbekannter Fehler'}`,
        variant: "destructive"
      });
    } finally {
      setAssigningDriver(false);
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
      setDocumentCounts({});
      setExpandedRows(new Set());
      
      // Load document counts for all drivers
      if (data) {
        loadDocumentCounts(data);
      }
      
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

  const loadDocumentCounts = async (fahrerData: FahrerProfile[]) => {
    const counts: Record<string, number> = {};
    
    try {
      for (const fahrer of fahrerData) {
        const { data: storageFiles, error } = await supabase.storage
          .from('driver-documents')
          .list(`uploads/${fahrer.email}/`);

        if (!error && storageFiles) {
          counts[fahrer.id] = storageFiles.length;
        } else {
          counts[fahrer.id] = 0;
        }
      }
      
      setDocumentCounts(counts);
    } catch (error) {
      console.error("❌ Admin: Fehler beim Laden der Dokumentenzählung:", error);
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
                    <TableHead>Name</TableHead>
                    <TableHead>E-Mail</TableHead>
                    <TableHead>Telefon</TableHead>
                    <TableHead>Bundesland</TableHead>
                    <TableHead>Führerscheinklasse</TableHead>
                    <TableHead>Registriert am</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Dokumente</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fahrer.map((f) => (
                    <TableRow key={f.id}>
                      <TableCell className="font-medium">
                        {f.vorname} {f.nachname}
                      </TableCell>
                      <TableCell>{f.email}</TableCell>
                      <TableCell>{f.telefon}</TableCell>
                      <TableCell>
                        {f.verfuegbare_regionen?.length ? f.verfuegbare_regionen.join(", ") : 
                         f.ort ? f.ort : "Nicht angegeben"}
                      </TableCell>
                      <TableCell>
                        {f.fuehrerscheinklassen?.join(", ") || "-"}
                      </TableCell>
                      <TableCell>
                        {new Date(f.created_at).toLocaleDateString('de-DE')}
                      </TableCell>
                      <TableCell>{getStatusBadge(f.status)}</TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => toggleRow(f.id, f.email)}
                        >
                          {documentCounts[f.id] || 0} Dateien
                          {expandedRows.has(f.id) ? 
                            <ChevronDown className="h-4 w-4 ml-1" /> : 
                            <ChevronRight className="h-4 w-4 ml-1" />
                          }
                        </Button>
                        {expandedRows.has(f.id) && (
                          <div className="mt-4 p-4 bg-gray-50 rounded border">
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
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
          </CardContent>
        </Card>

        {/* Job Requests Section */}
        <Card className="mt-8">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Eingegangene Fahreranfragen ({jobRequests.length})</CardTitle>
              <Button 
                onClick={loadJobRequests} 
                variant="outline" 
                size="sm"
              >
                Aktualisieren
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {jobRequests.length === 0 ? (
              <p className="text-gray-500 italic">Keine Anfragen vorhanden.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>E-Mail</TableHead>
                    <TableHead>Telefon</TableHead>
                    <TableHead>Einsatzort</TableHead>
                    <TableHead>Zeitraum</TableHead>
                    <TableHead>Fahrzeugtyp</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Eingang</TableHead>
                    <TableHead>Aktionen</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {jobRequests.map((req) => (
                    <TableRow key={req.id}>
                      <TableCell className="font-medium">
                        <div>
                          <div>{req.customer_name}</div>
                          {req.nachricht && (
                            <div className="mt-1 text-sm text-gray-600 bg-gray-50 p-2 rounded">
                              <strong>Nachricht:</strong> {req.nachricht}
                            </div>
                          )}
                          {req.besonderheiten && (
                            <div className="mt-1 text-sm text-amber-700 bg-amber-50 p-2 rounded">
                              <strong>Besonderheiten:</strong> {req.besonderheiten}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{req.customer_email}</TableCell>
                      <TableCell>{req.customer_phone}</TableCell>
                      <TableCell>{req.einsatzort}</TableCell>
                      <TableCell>{req.zeitraum}</TableCell>
                      <TableCell>{req.fahrzeugtyp}</TableCell>
                      <TableCell>
                        <Badge 
                          variant={req.status === 'angenommen' ? 'default' : 'outline'}
                          className={
                            req.status === 'angenommen' 
                              ? 'bg-green-100 text-green-800 border-green-200' 
                              : 'bg-blue-100 text-blue-800 border-blue-200'
                          }
                        >
                          {req.status === 'angenommen' ? 'Angenommen' : 'Offen'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(req.created_at).toLocaleDateString('de-DE')}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {req.status === 'angenommen' ? (
                            <Button
                              size="sm"
                              variant="outline"
                              disabled
                              className="bg-gray-100 text-gray-500 cursor-not-allowed"
                            >
                              Angenommen
                            </Button>
                          ) : (
                            <>
                              <Button
                                size="sm"
                                onClick={() => handleAcceptJob(req.id)}
                              >
                                Annehmen
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleAssignDriver(req.id)}
                              >
                                Fahrer zuweisen
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
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

      {/* Assign Driver Dialog */}
      <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Fahrer zuweisen & benachrichtigen</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Fahrer auswählen ({fahrer.length} registriert, {fahrer.filter(f => f.status === 'approved').length} genehmigt):
              </label>
              <Select value={selectedDriverEmail} onValueChange={setSelectedDriverEmail}>
                <SelectTrigger className="bg-background border border-input">
                  <SelectValue placeholder="Fahrer wählen..." />
                </SelectTrigger>
                <SelectContent className="bg-background border border-input z-50">
                  {fahrer.length === 0 ? (
                    <SelectItem value="__no_drivers__" disabled>
                      Keine Fahrer gefunden
                    </SelectItem>
                  ) : fahrer.filter(f => f.status === 'approved').length === 0 ? (
                    <SelectItem value="__no_approved_drivers__" disabled>
                      Keine genehmigten Fahrer verfügbar
                    </SelectItem>
                  ) : (
                    fahrer
                      .filter(f => f.status === 'approved')
                      .map((f) => (
                        <SelectItem key={f.id} value={f.email}>
                          {f.vorname} {f.nachname} – {f.email}
                        </SelectItem>
                      ))
                  )}
                </SelectContent>
              </Select>
              
              {/* Debug Info */}
              <div className="text-xs text-gray-500 mt-2">
                Verfügbare Fahrer: {fahrer.map(f => `${f.vorname} ${f.nachname} (${f.status})`).join(', ') || 'Keine gefunden'}
              </div>
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setAssignDialogOpen(false)}
                disabled={assigningDriver}
              >
                Abbrechen
              </Button>
              <Button
                onClick={assignDriverToJob}
                disabled={!selectedDriverEmail || assigningDriver}
              >
                {assigningDriver ? "Wird zugewiesen..." : "Zuweisen & E-Mail senden"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Admin;