import React, { useState, useEffect } from "react";
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
import { Eye, Download, ChevronDown, ChevronRight, LogOut, FileText, Image, Users, Check, X, Mail, Edit } from "lucide-react";
import { ContactDataDialog } from "@/components/ContactDataDialog";
import { NoShowDialog } from "@/components/NoShowDialog";
import { CreateJobDialog } from "@/components/CreateJobDialog";
import { AdminAssignmentDialog } from "@/components/AdminAssignmentDialog";
import { EmailLogView } from "@/components/EmailLogView";
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
  const [jobAssignments, setJobAssignments] = useState<any[]>([]);
  const [previewDoc, setPreviewDoc] = useState<{ url: string; type: string; filename: string } | null>(null);
  const [inactivityTimer, setInactivityTimer] = useState<NodeJS.Timeout | null>(null);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<string>("");
  const [approvingDriver, setApprovingDriver] = useState<string | null>(null);
  const [sendingJobToAll, setSendingJobToAll] = useState<string | null>(null);
  const [confirmingAssignment, setConfirmingAssignment] = useState<string | null>(null);
  const [markingNoShow, setMarkingNoShow] = useState<string | null>(null);
  const [noShowDialogOpen, setNoShowDialogOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<any>(null);
  const [contactDataDialogOpen, setContactDataDialogOpen] = useState(false);
  const [selectedContactJobId, setSelectedContactJobId] = useState<string>("");
  const [createJobDialogOpen, setCreateJobDialogOpen] = useState(false);
  const [completingOldJobs, setCompletingOldJobs] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleOpenContactDialog = (jobId: string) => {
    setSelectedContactJobId(jobId);
    setContactDataDialogOpen(true);
  };

  const handleCreateJob = () => {
    setCreateJobDialogOpen(true);
  };

  const handleCompleteOldJobs = async (daysOld: number = 30) => {
    setCompletingOldJobs(true);
    
    try {
      // Get admin email from localStorage
      const adminSession = localStorage.getItem('adminSession');
      if (!adminSession) {
        throw new Error('Admin session not found');
      }
      
      const session = JSON.parse(adminSession);
      const adminEmail = session.email;

      const { data, error } = await supabase.functions.invoke('admin-complete-old-jobs', {
        body: { email: adminEmail, daysOld }
      });

      if (error) {
        console.error('❌ Error completing old jobs:', error);
        toast({
          title: "Fehler beim Abschließen",
          description: `Fehler: ${error.message || 'Unbekannter Fehler'}`,
          variant: "destructive"
        });
        return;
      }

      console.log('✅ Old jobs completed successfully:', data);
      
      // Refresh job requests to show updated status
      await loadJobRequests();

      toast({
        title: "Alte Aufträge abgeschlossen",
        description: data.message || `${data.data?.updated_count || 0} alte Aufträge wurden als erledigt markiert.`,
      });

    } catch (error) {
      console.error('❌ Unexpected error in handleCompleteOldJobs:', error);
      toast({
        title: "Unerwarteter Fehler",
        description: `Ein Fehler ist aufgetreten: ${error instanceof Error ? error.message : 'Unbekannter Fehler'}`,
        variant: "destructive"
      });
    } finally {
      setCompletingOldJobs(false);
    }
  };

  const handleJobCreated = (jobId: string) => {
    // Refresh job requests after creating
    loadJobRequests();
    // Immediately open assignment dialog for the new job
    setSelectedJobId(jobId);
    setAssignDialogOpen(true);
  };

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
      // Log in admin_actions (admin_log is now a view)
      await supabase.from('admin_actions').insert({
        job_id: null, // System event without job context
        action: event,
        admin_email: email || user?.email || 'unknown',
        note: `Admin event: ${event}`
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
          loadJobAssignments();
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

  const loadJobAssignments = async () => {
    try {
      console.log('🔄 Loading job assignments...');
      const { data: assignmentsData, error: assignmentsError } = await supabase
        .from('job_assignments')
        .select(`
          *,
          fahrer_profile:driver_id (
            vorname,
            nachname,
            email
          ),
          job_requests:job_id (
            customer_name,
            fahrzeugtyp
          )
        `)
        .order('assigned_at', { ascending: false });

      if (assignmentsError) {
        console.error('❌ Error loading assignments:', assignmentsError);
        throw assignmentsError;
      }

      console.log('✅ Assignments loaded:', assignmentsData?.length || 0);
      console.log('✅ Sample assignment:', assignmentsData?.[0]);
      setJobAssignments(assignmentsData || []);
    } catch (error) {
      console.error('Error loading assignments:', error);
      toast({
        title: "Fehler beim Laden der Zuweisungen",
        description: "Die Zuweisungen konnten nicht geladen werden.",
        variant: "destructive"
      });
    }
  };

  // Hilfsmap: aktives Assignment je Job (confirmed > assigned)
  const activeByJob = React.useMemo(() => {
    const map = new Map<string, any>();
    console.log('🔍 Creating activeByJob map with assignments:', jobAssignments.length);
    
    for (const a of jobAssignments) {
      console.log(`🔍 Processing assignment: job_id=${a.job_id}, status=${a.status}, driver=${a.fahrer_profile?.vorname}`);
      
      if (a.status === "confirmed") {
        map.set(a.job_id, a);
        console.log(`✅ Set confirmed assignment for job ${a.job_id}`);
        continue;
      }
      if (a.status === "assigned" && !map.has(a.job_id)) {
        map.set(a.job_id, a);
        console.log(`✅ Set assigned assignment for job ${a.job_id}`);
      }
    }
    
    console.log('🔍 Final activeByJob map:', Array.from(map.entries()));
    return map;
  }, [jobAssignments]);

  async function resendDriverConfirmationNew(assignmentId: string) {
    try {
      const { error } = await supabase.functions.invoke(
        "send-driver-confirmation",
        { body: { 
          email: "guenter.killer@t-online.de",
          assignment_id: assignmentId, 
          stage: "resend" 
        } }
      );
      if (error) throw error;
      toast({
        title: "E-Mail erneut gesendet",
        description: "Bestätigung wurde an den Fahrer gesendet."
      });
    } catch (e: any) {
      toast({
        title: "E-Mail-Versand fehlgeschlagen",
        description: e.message ?? e,
        variant: "destructive"
      });
    }
  }

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
    setSelectedJobId(jobId);
    setAssignDialogOpen(true);
  };

  const handleAssignmentComplete = async () => {
    console.log('🔄 Assignment completed, reloading data...');
    // Reload in parallel for better performance
    await Promise.all([
      loadJobRequests(),
      loadJobAssignments()
    ]);
    console.log('✅ Data reloaded after assignment');
  };

  const confirmAndSend = async (assignmentId: string) => {
    setConfirmingAssignment(assignmentId);
    
    try {
      // 1) DB-Status auf confirmed
      const { error: rpcErr } = await supabase.rpc("admin_confirm_assignment", {
        _assignment_id: assignmentId,
      });
      if (rpcErr) throw rpcErr;

      // 2) E-Mail + PDF an Fahrer (BCC an Admin)
      const { error: fnErr } = await supabase.functions.invoke(
        "send-driver-confirmation",
        { body: { 
          email: "guenter.killer@t-online.de",
          assignment_id: assignmentId 
        } }
      );
      if (fnErr) throw fnErr;

      toast({
        title: "Bestätigt & E-Mail versendet",
        description: "Bestätigung wurde an den Fahrer gesendet (Kopie an Admin)."
      });
      await loadJobRequests();
      await loadJobAssignments();
    } catch (err: any) {
      console.error(err);
      toast({
        title: "Fehler",
        description: err?.message ?? "Bestätigen/E-Mail fehlgeschlagen",
        variant: "destructive"
      });
    } finally {
      setConfirmingAssignment(null);
    }
  };

  const resendDriverConfirmation = async (assignmentId: string) => {
    try {
      const { error } = await supabase.functions.invoke(
        "send-driver-confirmation",
        { body: { 
          email: "guenter.killer@t-online.de",
          assignment_id: assignmentId, 
          resend: true 
        } }
      );
      if (error) throw error;
      toast({
        title: "E-Mail erneut gesendet",
        description: "Bestätigung wurde an den Fahrer gesendet."
      });
    } catch (err: any) {
      console.error(err);
      toast({
        title: "Fehler",
        description: err?.message ?? "Erneuter Versand fehlgeschlagen",
        variant: "destructive"
      });
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

  const handleResetJobsByEmail = async () => {
    try {
      // Get admin email from localStorage
      const adminSession = localStorage.getItem('adminSession');
      if (!adminSession) {
        throw new Error('Admin session not found');
      }
      
      const session = JSON.parse(adminSession);
      const adminEmail = session.email;

      const { data, error } = await supabase.functions.invoke('admin-reset-jobs', {
        body: { email: adminEmail }
      });

      if (error) {
        throw error;
      }

      if (!data.success) {
        throw new Error(data.error || 'Reset fehlgeschlagen');
      }

      toast({
        title: "Jobs zurückgesetzt",
        description: data.message,
      });

      // Reload data
      await Promise.all([
        loadJobRequests(),
        loadJobAssignments()
      ]);

    } catch (error) {
      console.error('❌ Error resetting jobs:', error);
      toast({
        title: "Fehler beim Zurücksetzen",
        description: `Fehler: ${error instanceof Error ? error.message : 'Unbekannter Fehler'}`,
        variant: "destructive"
      });
    }
  };

  const handleResetDriverStatus = async (driverId: string, driverName: string) => {
    try {
      const response = await fetch(`https://hxnabnsoffzevqhruvar.supabase.co/functions/v1/reset-driver-status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh4bmFibnNvZmZ6ZXZxaHJ1dmFyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI5MTI1OTMsImV4cCI6MjA2ODQ4ODU5M30.WI-nu1xYjcjz67ijVTyTGC6GPW77TOsFdy1cpPW4dzc`
        },
        body: JSON.stringify({
          driverId: driverId,
          newStatus: 'pending'
        })
      });

      const result = await response.json();
      
      if (result.success) {
        // Update local state
        setFahrer(prev => 
          prev.map(f => 
            f.id === driverId ? { ...f, status: 'pending' } : f
          )
        );

        toast({
          title: "Status zurückgesetzt",
          description: `${driverName} wurde auf "Wartend" zurückgesetzt.`,
        });
      } else {
        throw new Error(result.error || 'Unknown error');
      }
    } catch (error) {
      console.error('❌ Error resetting driver status:', error);
      toast({
        title: "Fehler",
        description: `Status konnte nicht zurückgesetzt werden: ${error instanceof Error ? error.message : 'Unbekannter Fehler'}`,
        variant: "destructive"
      });
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

  const handleMarkNoShow = (assignment: any) => {
    setSelectedAssignment(assignment);
    setNoShowDialogOpen(true);
  };

  const handleNoShowSuccess = () => {
    // Refresh data to show updated status
    loadJobRequests();
    loadJobAssignments();
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
      rejected: "destructive",
      no_show: "destructive"
    };
    
    const labels: Record<string, string> = {
      pending: "Wartend",
      approved: "Genehmigt",
      active: "Genehmigt",
      rejected: "Abgelehnt",
      no_show: "No-Show"
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
                           {f.status === 'active' && (
                             <Button
                               size="sm"
                               variant="outline"
                               className="text-orange-600 border-orange-300 hover:bg-orange-50"
                               onClick={() => handleResetDriverStatus(f.id, `${f.vorname} ${f.nachname}`)}
                             >
                               ↻ Zurücksetzen
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
              <div className="flex gap-2 flex-wrap">
                <Button 
                  onClick={handleCreateJob} 
                  variant="default" 
                  size="sm"
                  className="bg-green-600 hover:bg-green-700"
                >
                  + Neuen Auftrag anlegen
                </Button>
                <Button 
                  onClick={() => handleCompleteOldJobs(30)}
                  size="sm"
                  variant="outline"
                  disabled={completingOldJobs}
                  className="bg-green-50 hover:bg-green-100 text-green-700 border-green-300"
                >
                  {completingOldJobs ? 'Wird abgeschlossen...' : 'Alte Aufträge abschließen (30 Tage)'}
                </Button>
                <Button 
                  onClick={handleResetJobsByEmail} 
                  variant="destructive" 
                  size="sm"
                >
                  Test zurücksetzen
                </Button>
                <Button 
                  onClick={loadJobRequests} 
                  variant="outline" 
                  size="sm"
                >
                  Aktualisieren
                </Button>
              </div>
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
                      <TableHead className="min-w-[120px]">Einsatz</TableHead>
                      <TableHead className="min-w-[100px]">Fahrzeugtyp</TableHead>
                      <TableHead className="min-w-[80px]">Status</TableHead>
                       <TableHead className="min-w-[150px]">Zuweisung</TableHead>
                       <TableHead className="min-w-[150px]">Aktionen</TableHead>
                    </TableRow>
                  </TableHeader>
                <TableBody>
                  {jobRequests.map((req) => (
                    <TableRow key={req.id}>
                      <TableCell className="font-medium">
                        <div className="space-y-2">
                          <div className="font-semibold">{req.customer_name}</div>
                          <div className="text-sm text-gray-600">
                            <div><strong>Eingang:</strong> {new Date(req.created_at).toLocaleDateString('de-DE')}</div>
                          </div>
                          {req.nachricht && (
                            <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded max-w-xs">
                              <strong>Nachricht:</strong> {req.nachricht}
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
                        <div 
                          className="text-sm cursor-help"
                          title={`Ort: ${req.einsatzort}\nZeit: ${req.zeitraum}`}
                        >
                          <div className="font-medium truncate max-w-[100px]">{req.einsatzort}</div>
                          <div className="text-gray-600 truncate max-w-[100px]">{req.zeitraum}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <span className="text-sm font-medium">{req.fahrzeugtyp}</span>
                          <span className="text-xs text-gray-500">({req.fuehrerscheinklasse})</span>
                        </div>
                      </TableCell>
                       <TableCell>
                          <div className="space-y-1">
                            <Badge 
                               variant={
                                 req.status === 'confirmed' ? 'default' : 
                                 req.status === 'assigned' ? 'secondary' : 
                                 req.status === 'no_show' ? 'destructive' :
                                 req.status === 'completed' ? 'secondary' :
                                 'outline'
                               }
                               className={
                                 req.status === 'confirmed' 
                                   ? 'bg-green-100 text-green-800 border-green-200' 
                                   : req.status === 'assigned'
                                   ? 'bg-yellow-100 text-yellow-800 border-yellow-200'
                                   : req.status === 'no_show'
                                   ? 'bg-red-100 text-red-800 border-red-200'
                                   : req.status === 'completed'
                                   ? 'bg-gray-100 text-gray-700 border-gray-300'
                                   : 'bg-blue-100 text-blue-800 border-blue-200'
                               }
                            >
                              {req.status === 'confirmed' ? 'Bestätigt' : 
                                req.status === 'assigned' ? 'Zugewiesen' : 
                                req.status === 'no_show' ? 'No-Show' :
                                req.status === 'completed' ? 'Erledigt' : 'Offen'}
                            </Badge>
                            {(!req.customer_street || !req.customer_house_number || !req.customer_postal_code || !req.customer_city || !/^\d{5}$/.test(req.customer_postal_code || '')) && (
                              <Badge 
                                variant="outline" 
                                className="bg-orange-50 text-orange-700 border-orange-300 text-xs"
                                title="Adresse unvollständig - muss vor Zuweisung ergänzt werden"
                              >
                                Adresse fehlt
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {(() => {
                            const a = activeByJob.get(req.id);
                            console.log(`🔍 Job ${req.id}: Lookup result:`, a ? `Found assignment with driver ${a.fahrer_profile?.vorname}` : 'No assignment found');
                            
                            if (!a) {
                              return (
                                <Button size="sm" onClick={() => handleAssignDriver(req.id)}>
                                  Zuweisen
                                </Button>
                              );
                            }

                            return (
                              <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-blue-800">
                                    {a.fahrer_profile.vorname} {a.fahrer_profile.nachname}
                                  </span>
                                  <div className="text-xs text-blue-600">
                                    {a.rate_value}€/{a.rate_type === 'hourly' ? 'Std' : 'Tag'}
                                  </div>
                                  {a.status === "confirmed" ? (
                                    <Badge variant="default">Bestätigt</Badge>
                                  ) : (
                                    <Badge variant="secondary">Zugewiesen</Badge>
                                  )}
                                </div>

                                <div className="flex items-center gap-2">
                                  <Button size="sm" onClick={() => resendDriverConfirmationNew(a.id)}>
                                    E-Mail erneut senden
                                  </Button>
                                  <Button size="sm" variant="outline" onClick={() => handleAssignDriver(req.id)}>
                                    Ändern
                                  </Button>
                                </div>
                              </div>
                            );
                          })()}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {(() => {
                              const assignment = activeByJob.get(req.id);
                              if (assignment) {
                                return (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => resendDriverConfirmationNew(assignment.id)}
                                    className="text-blue-600 border-blue-300 hover:bg-blue-50"
                                  >
                                    <Mail className="h-3 w-3 mr-1" />
                                    Erneut senden
                                  </Button>
                                );
                              }
                              return null;
                            })()}
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

      {/* Admin Assignment Dialog */}
      <AdminAssignmentDialog
        open={assignDialogOpen}
        onClose={() => setAssignDialogOpen(false)}
        jobId={selectedJobId}
        onAssignmentComplete={handleAssignmentComplete}
      />

      {/* Job Assignments Section */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Zuweisungen ({jobAssignments.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {jobAssignments.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              Keine Zuweisungen vorhanden.
            </p>
          ) : (
            <div className="space-y-4">
              {jobAssignments.map((assignment) => (
                <div key={assignment.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold">
                        {assignment.fahrer_profile.vorname} {assignment.fahrer_profile.nachname}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {assignment.job_requests.customer_name} - {assignment.job_requests.fahrzeugtyp}
                      </p>
                    </div>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={
                            assignment.status === 'confirmed' ? 'default' :
                            assignment.status === 'assigned' ? 'secondary' : 
                            assignment.status === 'no_show' ? 'destructive' : 'destructive'
                          }
                        >
                          {assignment.status === 'assigned' ? 'Zugewiesen' :
                           assignment.status === 'confirmed' ? 'Bestätigt' : 
                           assignment.status === 'no_show' ? `No-Show${assignment.no_show_fee_cents ? ` – ${(assignment.no_show_fee_cents / 100).toFixed(0)} €` : ''}` : 'Storniert'}
                        </Badge>
                      </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Satz:</span> {assignment.rate_value}€ ({assignment.rate_type === 'hourly' ? 'Stunde' : 'Tag'})
                    </div>
                    {assignment.start_date && (
                      <div>
                        <span className="font-medium">Start:</span> {new Date(assignment.start_date).toLocaleDateString('de-DE')}
                      </div>
                    )}
                  </div>

                  {assignment.admin_note && (
                    <div className="text-sm">
                      <span className="font-medium">Notiz:</span> {assignment.admin_note}
                    </div>
                  )}

                  {assignment.status === 'assigned' && (
                    <div className="flex gap-2 pt-2">
                       <Button
                         size="sm"
                         onClick={() => confirmAndSend(assignment.id)}
                         disabled={confirmingAssignment === assignment.id}
                         className="flex items-center gap-1"
                       >
                         <Check className="h-4 w-4" />
                         {confirmingAssignment === assignment.id ? "Bestätige..." : "Bestätigen & E-Mail senden"}
                       </Button>
                    </div>
                  )}

                  {assignment.status === 'confirmed' && (
                    <div className="flex gap-2 pt-2">
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleMarkNoShow(assignment)}
                        className="flex items-center gap-1"
                      >
                        <X className="h-4 w-4" />
                        No-Show markieren
                      </Button>
                    </div>
                  )}

                  {assignment.status === 'no_show' && assignment.no_show_fee_cents && (
                    <div className="text-sm text-red-600 font-medium">
                      Schadensersatz: {(assignment.no_show_fee_cents / 100).toFixed(2)} € ({assignment.no_show_tier})
                    </div>
                  )}

                  {assignment.status === 'confirmed' && (
                    <div className="text-sm text-muted-foreground">
                      Bestätigt am: {new Date(assignment.confirmed_at).toLocaleString('de-DE')}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Email Log View */}
      <EmailLogView />

      {/* Create Job Dialog */}
      <CreateJobDialog
        open={createJobDialogOpen}
        onClose={() => setCreateJobDialogOpen(false)}
        onJobCreated={handleJobCreated}
      />

      {/* Contact Data Dialog */}
      <ContactDataDialog
        open={contactDataDialogOpen}
        onClose={() => setContactDataDialogOpen(false)}
        jobId={selectedContactJobId}
        onDataUpdated={() => loadJobRequests()}
      />

      {/* No-Show Dialog */}
      <NoShowDialog
        open={noShowDialogOpen}
        onOpenChange={setNoShowDialogOpen}
        assignment={selectedAssignment}
        onSuccess={handleNoShowSuccess}
      />
    </div>
  );
};

export default Admin;