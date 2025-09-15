import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase, SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } from "@/integrations/supabase/client";
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
import { useSEO } from "@/hooks/useSEO";

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
  beschreibung: string | null;
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
  useSEO({
    title: "Admin Bereich | Fahrerexpress",
    description: "Geschützter Admin-Bereich für die Verwaltung der Fahrerexpress-Agentur.",
    noindex: true
  });

  const [user, setUser] = useState<User | null>(null);
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
  const [approvingDriver, setApprovingDriver] = useState<string | null>(null);
  const [sendingJobToAll, setSendingJobToAll] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const envOk = Boolean(SUPABASE_URL && SUPABASE_PUBLISHABLE_KEY);

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
      }, 60 * 60 * 1000); // 60 Minuten statt 15 Minuten
      
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
      localStorage.removeItem('adminSession');
      setUser(null);
      setFahrer([]);
      setDocuments({});
      
      toast({
        title: "Automatisch abgemeldet",
        description: "Sie wurden wegen Inaktivität abgemeldet",
        variant: "destructive"
      });
      
      navigate('/admin/login');
    }
  };

  const checkAuth = () => {
    console.log("🔍 Admin: Prüfe localStorage Authentifizierung...");
    
    const adminSession = localStorage.getItem('adminSession');
    if (!adminSession) {
      console.log("❌ Admin: Keine Session gefunden");
      navigate('/admin/login');
      return;
    }

    try {
      const session = JSON.parse(adminSession);
      console.log("🔐 Admin: Session gefunden:", session);
      
      // Check if session is valid and not expired (24 hours)
      if (session.isAdmin && session.email === ADMIN_EMAIL) {
        if (Date.now() - session.loginTime < 24 * 60 * 60 * 1000) {
          console.log("✅ Admin: Session gültig für:", session.email);
          setUser({ email: session.email } as User);
          loadFahrerData();
          loadJobRequests();
          return;
        } else {
          console.log("⏰ Admin: Session abgelaufen");
          localStorage.removeItem('adminSession');
        }
      }
    } catch (e) {
      console.error("❌ Admin: Session parsing Fehler:", e);
      localStorage.removeItem('adminSession');
    }
    
    console.log("❌ Admin: Ungültige oder abgelaufene Session");
    navigate('/admin/login');
  };


  const loadJobRequests = async () => {
    try {
      // Get admin email from localStorage
      const adminSession = localStorage.getItem('adminSession');
      if (!adminSession) return;
      
      const session = JSON.parse(adminSession);
      const adminEmail = session.email;

      // Use admin-data-fetch edge function
      const { data: response, error } = await supabase.functions.invoke('admin-data-fetch', {
        body: { email: adminEmail, dataType: 'jobs' }
      });

      if (error || !response?.success) {
        console.error("❌ Admin: Fehler beim Laden der Fahreranfragen:", error || response?.error);
        return;
      }

      console.log("✅ Admin: Fahreranfragen erfolgreich geladen:", response.data);
      setJobRequests(response.data || []);
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

  const handleApproveDriver = async (driverId: string) => {
    console.log('🚀 Starting driver approval process for:', driverId);
    setApprovingDriver(driverId);
    
    try {
      // Get admin email from localStorage
      const adminSession = localStorage.getItem('adminSession');
      if (!adminSession) {
        throw new Error('Admin session not found');
      }
      
      const session = JSON.parse(adminSession);
      const adminEmail = session.email;
      
      const { data, error } = await supabase.functions.invoke('approve-driver-and-send-jobs', {
        body: { email: adminEmail, driverId }
      });

      if (error) {
        console.error('❌ Error approving driver:', error);
        toast({
          title: "Fehler beim Freischalten",
          description: `Fehler: ${error.message || 'Unbekannter Fehler'}`,
          variant: "destructive"
        });
        return;
      }

      console.log('✅ Driver approved successfully:', data);
      
      // Update local state
      setFahrer(prev => 
        prev.map(f => 
          f.id === driverId ? { ...f, status: 'active' } : f
        )
      );

      toast({
        title: "Fahrer erfolgreich freigeschaltet",
        description: `Fahrer wurde freigeschaltet und ${data.sentJobs || 0} aktuelle Jobs per E-Mail gesendet.`,
      });

    } catch (error) {
      console.error('❌ Unexpected error in handleApproveDriver:', error);
      toast({
        title: "Unerwarteter Fehler",
        description: `Ein Fehler ist aufgetreten: ${error instanceof Error ? error.message : 'Unbekannter Fehler'}`,
        variant: "destructive"
      });
    } finally {
      setApprovingDriver(null);
    }
  };

  const handleSendJobToAllDrivers = async (jobId: string) => {
    console.log('📧 Sending job to all drivers:', jobId);
    setSendingJobToAll(jobId);
    
    try {
      // Get admin email from localStorage
      const adminSession = localStorage.getItem('adminSession');
      if (!adminSession) {
        throw new Error('Admin session not found');
      }
      
      const session = JSON.parse(adminSession);
      const adminEmail = session.email;
      
      const { data, error } = await supabase.functions.invoke('broadcast-job-to-drivers', {
        body: { email: adminEmail, jobId }
      });

      if (error) {
        console.error('❌ Error sending job to drivers:', error);
        toast({
          title: "Fehler beim Versenden",
          description: `Fehler: ${error.message || 'Unbekannter Fehler'}`,
          variant: "destructive"
        });
        return;
      }

      console.log('✅ Job sent to all drivers successfully:', data);
      
      toast({
        title: "Job erfolgreich versendet",
        description: `Job wurde an ${data.sentToCount || 0} aktive Fahrer gesendet.`,
      });

    } catch (error) {
      console.error('❌ Unexpected error in handleSendJobToAllDrivers:', error);
      toast({
        title: "Unerwarteter Fehler",
        description: `Ein Fehler ist aufgetreten: ${error instanceof Error ? error.message : 'Unbekannter Fehler'}`,
        variant: "destructive"
      });
    } finally {
      setSendingJobToAll(null);
    }
  };

  const handleLogout = async () => {
    if (user) {
      await logAdminEvent('manual_logout', user.email);
    }
    
    // Remove localStorage session instead of Supabase auth
    localStorage.removeItem('adminSession');
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

    navigate('/admin/login');
  };

  const loadFahrerData = async () => {
    setIsLoadingData(true);
    console.log("🔍 Admin: Lade Fahrerdaten...");
    
    try {
      // Get admin email from localStorage
      const adminSession = localStorage.getItem('adminSession');
      if (!adminSession) {
        navigate('/admin/login');
        return;
      }
      
      const session = JSON.parse(adminSession);
      const adminEmail = session.email;

      // Use admin-data-fetch edge function with service role
      const { data: response, error } = await supabase.functions.invoke('admin-data-fetch', {
        body: { email: adminEmail, dataType: 'fahrer' }
      });

      if (error || !response?.success) {
        console.error("❌ Admin: Fehler beim Laden der Fahrerdaten:", error || response?.error);
        toast({
          title: "Fehler beim Laden",
          description: `Fahrerdaten konnten nicht geladen werden: ${error?.message || response?.error}`,
          variant: "destructive"
        });
        return;
      }

      const data = response.data;
      console.log("📊 Admin: Fahrerdaten erfolgreich geladen:", data?.length || 0);
      setFahrer(data || []);

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
    try {
      const adminSession = localStorage.getItem('adminSession');
      if (!adminSession) return;
      
      const session = JSON.parse(adminSession);
      const adminEmail = session.email;
      const fahrerIds = fahrerData.map(f => f.id);

      const { data: response, error } = await supabase.functions.invoke('admin-data-fetch', {
        body: { email: adminEmail, dataType: 'document-counts', fahrerIds }
      });

      if (error || !response?.success) {
        console.error("❌ Admin: Fehler beim Laden der Dokumentanzahl:", error);
        return;
      }

      setDocumentCounts(response.data);
    } catch (error) {
      console.error("❌ Admin: Fehler beim Laden der Dokumentanzahl:", error);
    }
  };

  const loadDocuments = async (fahrerEmail: string, fahrerId: string) => {
    if (documents[fahrerId]) return; // Already loaded

    try {
      console.log("📄 Admin: Lade Dokumente für Fahrer:", fahrerId);
      
      const adminSession = localStorage.getItem('adminSession');
      if (!adminSession) return;
      
      const session = JSON.parse(adminSession);
      const adminEmail = session.email;

      const { data: response, error } = await supabase.functions.invoke('admin-data-fetch', {
        body: { email: adminEmail, dataType: 'documents', fahrerId }
      });

      if (error || !response?.success) {
        console.error("❌ Admin: Fehler beim Laden der Dokumente:", error);
        return;
      }

      const fahrerDokumente = response.data;

      console.log("✅ Admin: Dokumente aus Tabelle geladen:", fahrerDokumente);
      
      // Convert to DocumentFile format
      const documentFiles: DocumentFile[] = fahrerDokumente?.map(doc => ({
        id: doc.id,
        filename: doc.filename,
        filepath: doc.filepath,
        url: doc.url, // This will be replaced with signed URL when needed
        type: doc.type,
        uploaded_at: doc.uploaded_at,
        fahrer_id: doc.fahrer_id
      })) || [];

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

  const handlePreview = async (doc: DocumentFile) => {
    try {
      console.log(`📁 Previewing document: ${doc.filename} at ${doc.filepath}`);
      
      const { data, error } = await supabase.functions.invoke('get-document-preview', {
        body: { filepath: doc.filepath, ttl: 600 }
      });
      
      if (error) {
        throw error;
      }
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to create signed URL');
      }
      
      const signedUrl = data.signedUrl;
      console.log(`✅ Signed URL created for ${doc.filename}`);
      
      const isImage = doc.filename.toLowerCase().match(/\.(jpg|jpeg|png)$/);
      
      setPreviewDoc({
        url: signedUrl,
        type: isImage ? 'image' : 'pdf',
        filename: doc.filename
      });
      
    } catch (error) {
      console.error('❌ Error creating signed URL:', error);
      toast({
        title: "Fehler",
        description: "Dokument konnte nicht geladen werden.",
        variant: "destructive",
      });
    }
  };

  const handleDownload = async (doc: DocumentFile) => {
    try {
      console.log(`📥 Downloading document: ${doc.filename} at ${doc.filepath}`);
      
      const { data, error } = await supabase.functions.invoke('get-document-preview', {
        body: { filepath: doc.filepath, ttl: 300 }
      });
      
      if (error) {
        throw error;
      }
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to create signed URL');
      }
      
      // Create download link
      const link = document.createElement('a');
      link.href = data.signedUrl;
      link.download = doc.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      console.log(`✅ Download started for ${doc.filename}`);
      
    } catch (error) {
      console.error('❌ Error downloading document:', error);
      toast({
        title: "Fehler",
        description: "Dokument konnte nicht heruntergeladen werden.",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string, fahrerId?: string, onToggle?: () => void) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      pending: "outline",
      approved: "default",
      active: "default",
      rejected: "destructive"
    };
    
    const labels: Record<string, string> = {
      pending: "Wartend",
      approved: "Genehmigt",
      active: "Genehmigt",
      rejected: "Abgelehnt"
    };

    if (status === 'pending' && onToggle) {
      return (
        <Button
          variant="outline"
          size="sm"
          className="h-6 px-2 text-xs cursor-pointer hover:bg-green-50 hover:border-green-300 transition-colors"
          onClick={onToggle}
        >
          {labels[status]} → Genehmigen
        </Button>
      );
    }

    return (
      <Badge variant={variants[status] || "secondary"}>
        {labels[status] || status}
      </Badge>
    );
  };

  if (!user) {
    // This should not happen as authentication is handled by AdminLogin page
    navigate('/admin/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className={`w-full text-xs md:text-sm border-b px-3 py-2 ${envOk ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
        {envOk ? '✅ Supabase ENV: konfiguriert' : '❌ Supabase Config fehlt'}
        <span className="ml-2">URL: {SUPABASE_URL ? 'gesetzt' : 'leer'} | ANON: {SUPABASE_PUBLISHABLE_KEY ? 'gesetzt' : 'leer'}</span>
      </div>
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
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[150px]">Name</TableHead>
                    <TableHead className="min-w-[130px]">Telefon</TableHead>
                    <TableHead className="min-w-[120px]">Führerschein</TableHead>
                    <TableHead className="min-w-[300px]">Nachricht</TableHead>
                    <TableHead className="min-w-[150px]">Aktionen</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fahrer.map((f) => (
                    <TableRow key={f.id}>
                      <TableCell className="font-medium">
                        {f.vorname} {f.nachname}
                      </TableCell>
                      <TableCell>
                        {f.telefon}
                      </TableCell>
                      <TableCell>
                        {f.fuehrerscheinklassen?.join(", ") || "-"}
                      </TableCell>
                      <TableCell className="max-w-[300px]">
                        <div className="text-sm">
                          {f.beschreibung || "Keine Nachricht"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(f.status, f.id, f.status === 'pending' ? () => handleApproveDriver(f.id) : undefined)}
                          {f.status === 'pending' && (
                            <Button
                              size="sm"
                              className="bg-green-600 hover:bg-green-700 text-white font-medium px-3 py-1 shadow-sm"
                              onClick={() => handleApproveDriver(f.id)}
                              disabled={approvingDriver === f.id}
                            >
                              {approvingDriver === f.id ? "✓ Läuft..." : "🚀 Genehmigen"}
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
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
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[200px]">Name & Details</TableHead>
                      <TableHead className="min-w-[150px]">Kontakt</TableHead>
                      <TableHead className="min-w-[100px]">Fahrzeugtyp</TableHead>
                      <TableHead className="min-w-[80px]">Status</TableHead>
                      <TableHead className="min-w-[200px]">Aktionen</TableHead>
                    </TableRow>
                  </TableHeader>
                <TableBody>
                  {jobRequests.map((req) => (
                    <TableRow key={req.id}>
                      <TableCell className="font-medium">
                        <div className="space-y-2">
                          <div className="font-semibold">{req.customer_name}</div>
                          <div className="text-sm text-gray-600">
                            <div><strong>Ort:</strong> {req.einsatzort}</div>
                            <div><strong>Zeit:</strong> {req.zeitraum}</div>
                            <div><strong>Eingang:</strong> {new Date(req.created_at).toLocaleDateString('de-DE')}</div>
                          </div>
                          {req.nachricht && (
                            <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded max-w-xs">
                              <strong>Nachricht:</strong> {req.nachricht.substring(0, 100)}...
                            </div>
                          )}
                          {req.besonderheiten && (
                            <div className="text-sm text-amber-700 bg-amber-50 p-2 rounded max-w-xs">
                              <strong>Besonderheiten:</strong> {req.besonderheiten}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="font-medium">{req.customer_email}</div>
                          <div className="text-gray-600">{req.customer_phone}</div>
                          {req.company && (
                            <div className="text-gray-500 text-xs">{req.company}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <span className="text-sm font-medium">{req.fahrzeugtyp}</span>
                          <span className="text-xs text-gray-500">({req.fuehrerscheinklasse})</span>
                        </div>
                      </TableCell>
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
                          <div className="flex flex-col gap-2 min-w-[200px]">
                            {req.status === 'angenommen' ? (
                              <Button
                                size="sm"
                                variant="outline"
                                disabled
                                className="bg-gray-100 text-gray-500 cursor-not-allowed w-full"
                              >
                                Angenommen
                              </Button>
                            ) : (
                              <>
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    onClick={() => handleAcceptJob(req.id)}
                                    className="flex-1"
                                  >
                                    Annehmen
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleAssignDriver(req.id)}
                                    className="flex-1"
                                  >
                                    Fahrer zuweisen
                                  </Button>
                                </div>
                                <Button
                                  size="sm"
                                  className="bg-blue-600 hover:bg-blue-700 text-white w-full"
                                  onClick={() => handleSendJobToAllDrivers(req.id)}
                                  disabled={sendingJobToAll === req.id}
                                >
                                  {sendingJobToAll === req.id ? "📤 Wird gesendet..." : "📧 An alle Fahrer senden"}
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                </Table>
              </div>
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
                Fahrer auswählen ({fahrer.length} registriert, {fahrer.filter(f => f.status === 'approved' || f.status === 'active').length} verfügbar):
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
                  ) : fahrer.filter(f => f.status === 'approved' || f.status === 'active').length === 0 ? (
                    <SelectItem value="__no_approved_drivers__" disabled>
                      Keine genehmigten Fahrer verfügbar
                    </SelectItem>
                  ) : (
                     fahrer
                      .filter(f => f.status === 'approved' || f.status === 'active')
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