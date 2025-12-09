import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase, SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Eye, Download, ChevronDown, ChevronRight, LogOut, FileText, Image, Users, Check, X, Mail, Edit, ChevronUp } from "lucide-react";
import { ContactDataDialog } from "@/components/ContactDataDialog";
import { NoShowDialog } from "@/components/NoShowDialog";
import { CreateJobDialog } from "@/components/CreateJobDialog";
import { AdminAssignmentDialog } from "@/components/AdminAssignmentDialog";
import { EmailLogView } from "@/components/EmailLogView";
import { DriverNewsletterDialog } from "@/components/DriverNewsletterDialog";
import { JobInvitesStatus } from "@/components/JobInvitesStatus";
import { AdminAnalyticsDashboard } from "@/components/AdminAnalyticsDashboard";
import PerformanceMonitor from "@/components/PerformanceMonitor";
import type { User } from "@supabase/supabase-js";
import { useSEO } from "@/hooks/useSEO";

interface FahrerProfile {
  id: string;
  vorname: string;
  nachname: string;
  email: string;
  telefon: string;
  status: string;
  is_blocked?: boolean;
  blocked_at?: string;
  blocked_reason?: string;
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
  const [authChecking, setAuthChecking] = useState(true);
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
  const [markingCompleted, setMarkingCompleted] = useState<string | null>(null);
  const [newsletterDialogOpen, setNewsletterDialogOpen] = useState(false);
  const [expandedJobRows, setExpandedJobRows] = useState<Set<string>>(new Set());
  
  
  
  const handleMarkJobOpen = async (jobId: string) => {
    setMarkingCompleted(jobId);
    
    try {
      const adminSession = localStorage.getItem('adminSession');
      if (!adminSession) {
        throw new Error('Admin session not found');
      }
      
      const session = JSON.parse(adminSession);
      
      const { data, error } = await supabase.functions.invoke('admin-mark-job-open', {
        body: { 
          email: session.email,
          jobId: jobId
        }
      });

      if (error) throw error;

      toast({
        title: "Auftrag wieder geöffnet",
        description: "Der Auftrag wurde als offen markiert."
      });

      await loadJobRequests();
      
    } catch (error: any) {
      console.error('Error marking job as open:', error);
      toast({
        title: "Fehler",
        description: error.message || "Fehler beim Öffnen des Auftrags",
        variant: "destructive"
      });
    } finally {
      setMarkingCompleted(null);
    }
  };
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleOpenContactDialog = (jobId: string) => {
    setSelectedContactJobId(jobId);
    setContactDataDialogOpen(true);
  };

  const handleCreateJob = () => {
    setCreateJobDialogOpen(true);
  };

  const handleMarkJobCompleted = async (jobId: string) => {
    setMarkingCompleted(jobId);
    
    try {
      // Get admin email from localStorage
      const adminSession = localStorage.getItem('adminSession');
      if (!adminSession) {
        throw new Error('Admin session not found');
      }
      
      const session = JSON.parse(adminSession);
      
      const { data, error } = await supabase.functions.invoke('admin-mark-job-completed', {
        body: { 
          email: session.email,
          jobId: jobId
        }
      });

      if (error) throw error;

      toast({
        title: "Auftrag als erledigt markiert",
        description: "Der Auftrag wurde erfolgreich als erledigt markiert. Alle Kundendaten bleiben erhalten."
      });

      // Reload job requests to show updated status
      await loadJobRequests();
      
    } catch (error: any) {
      console.error('Error marking job as completed:', error);
      toast({
        title: "Fehler",
        description: error.message || "Fehler beim Markieren des Auftrags als erledigt",
        variant: "destructive"
      });
    } finally {
      setMarkingCompleted(null);
    }
  };

  const handleCompleteOldJobs = async (daysOld: number = 30) => {
    setCompletingOldJobs(true);
    
    try {
      // Get admin email from current Supabase session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No active session');
      }
      
      const adminEmail = session.user.email;

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
      
      // Mark sessions as inactive
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        await supabase
          .from('admin_sessions')
          .update({ is_active: false })
          .eq('user_id', session.user.id);
      }
      
      await supabase.auth.signOut();
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

  const checkAuth = async () => {
    console.log("🔍 Admin: Prüfe Supabase Auth...");
    setAuthChecking(true);
    
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        console.log("❌ Admin: Keine gültige Session");
        setAuthChecking(false);
        navigate('/admin/login');
        return;
      }

      console.log("🔐 Admin: Session gefunden für:", session.user.email);
      console.log("🔐 Admin: Token vorhanden:", !!session.access_token);

      // Verify admin role
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', session.user.id)
        .eq('role', 'admin')
        .single();

      if (roleError || !roleData) {
        console.error("❌ Admin: Keine Admin-Rolle gefunden");
        await supabase.auth.signOut();
        setAuthChecking(false);
        navigate('/admin/login');
        return;
      }

      console.log("✅ Admin: Authentifizierung erfolgreich");
      setUser({ email: session.user.email } as User);
      
      // Persist simple admin session for edge function calls
      localStorage.setItem('adminSession', JSON.stringify({
        email: session.user.email,
        isAdmin: true,
        lastLogin: new Date().toISOString(),
      }));
      
      // Wait a tick to ensure the session is fully available to the Supabase client
      await new Promise(resolve => setTimeout(resolve, 100));
      
      console.log("🔄 Admin: Lade Daten...");
      await Promise.all([
        loadFahrerData(),
        loadJobRequests(),
        loadJobAssignments()
      ]);
      
      // Update session activity
      await supabase
        .from('admin_sessions')
        .update({ last_activity: new Date().toISOString() })
        .eq('user_id', session.user.id)
        .eq('is_active', true);
      
      setAuthChecking(false);
    } catch (e) {
      console.error("❌ Admin: Auth-Fehler:", e);
      setAuthChecking(false);
      navigate('/admin/login');
    }
  };

  const handleLogout = async () => {
    console.log("📤 Admin: Abmeldung...");
    
    if (user) {
      await logAdminEvent('manual_logout', user.email);
    }
    
    // Mark sessions as inactive
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      await supabase
        .from('admin_sessions')
        .update({ is_active: false })
        .eq('user_id', session.user.id);
    }
    
    // Sign out from Supabase
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

    navigate('/admin/login');
  };


  const [isLoadingJobs, setIsLoadingJobs] = useState(false);

  const loadJobRequests = async () => {
    setIsLoadingJobs(true);
    try {
      console.log("📋 Admin: Lade Jobanfragen...");
      
      // Use admin-data-fetch edge function
      const { data: response, error } = await supabase.functions.invoke('admin-data-fetch', {
        body: { dataType: 'jobs' }
      });

      if (error) {
        console.error("❌ Admin: Fehler beim Laden der Fahreranfragen:", error);
        toast({
          title: "Fehler beim Laden",
          description: `Jobanfragen konnten nicht geladen werden: ${error.message}`,
          variant: "destructive"
        });
        return;
      }

      if (!response?.success) {
        console.error("❌ Admin: API-Fehler:", response?.error);
        toast({
          title: "Fehler beim Laden",
          description: response?.error || "Unbekannter API-Fehler",
          variant: "destructive"
        });
        return;
      }

      console.log("✅ Admin: Fahreranfragen erfolgreich geladen:", response.data?.length || 0);
      setJobRequests(response.data || []);
      toast({
        title: "Aktualisiert",
        description: `${response.data?.length || 0} Fahreranfragen geladen`,
      });
    } catch (error) {
      console.error("❌ Admin: Unerwarteter Fehler beim Laden der Fahreranfragen:", error);
      toast({
        title: "Fehler",
        description: "Unerwarteter Fehler beim Laden der Daten",
        variant: "destructive"
      });
    } finally {
      setIsLoadingJobs(false);
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

  // Hilfsfunktion: Extrahiere Startdatum aus zeitraum-Feld
  const parseStartDate = (zeitraum: string): Date => {
    if (!zeitraum) return new Date(0); // Sehr altes Datum für leere Felder
    
    // Versuche verschiedene Formate zu parsen
    // Format: "Ab 29.9.2025 für X Tag(e)"
    let match = zeitraum.match(/Ab\s+(\d{1,2})\.(\d{1,2})\.(\d{4})/i);
    if (match) {
      const [_, day, month, year] = match;
      return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    }
    
    // Format: "15.09.2025 für ca. 10 Wochen"
    match = zeitraum.match(/(\d{1,2})\.(\d{1,2})\.(\d{4})/);
    if (match) {
      const [_, day, month, year] = match;
      return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    }
    
    // Format: "Ab 2025-07-28 für 2 Wochen"
    match = zeitraum.match(/(\d{4})-(\d{2})-(\d{2})/);
    if (match) {
      const [_, year, month, day] = match;
      return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    }
    
    // Fallback: Sehr altes Datum für nicht parsbare Einträge
    return new Date(0);
  };

  // Sortierte Job-Liste nach Eingangsdatum (created_at) - neueste zuerst
  const sortedJobRequests = React.useMemo(() => {
    const sorted = [...jobRequests].sort((a, b) => {
      const dateA = new Date(a.created_at);
      const dateB = new Date(b.created_at);
      // Neueste Anfragen zuerst (absteigende Sortierung)
      return dateB.getTime() - dateA.getTime();
    });
    
    return sorted;
  }, [jobRequests]);

  // Sortierte Fahrer-Liste nach Eingangsdatum (created_at)
  const sortedFahrer = React.useMemo(() => {
    return [...fahrer].sort((a, b) => {
      const dateA = new Date(a.created_at);
      const dateB = new Date(b.created_at);
      // Neueste Anfragen zuerst (absteigende Sortierung)
      return dateB.getTime() - dateA.getTime();
    });
  }, [fahrer]);

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

  const toggleBlockDriver = async (id: string, currentBlockStatus: boolean, driverName: string) => {
    try {
      const reason = currentBlockStatus 
        ? undefined 
        : prompt('Grund für die Sperre (optional):');
      
      if (!currentBlockStatus && reason === null) return; // User cancelled
      
      const { data, error } = await supabase.functions.invoke('toggle-driver-block', {
        body: { 
          driverId: id, 
          isBlocked: !currentBlockStatus,
          reason: reason 
        }
      });

      if (error) throw error;

      setFahrer(prev => 
        prev.map(f => f.id === id ? { 
          ...f, 
          is_blocked: !currentBlockStatus,
          blocked_at: !currentBlockStatus ? new Date().toISOString() : undefined,
          blocked_reason: !currentBlockStatus ? reason || undefined : undefined
        } : f)
      );

      toast({
        title: !currentBlockStatus ? "Fahrer gesperrt" : "Sperre aufgehoben",
        description: !currentBlockStatus 
          ? `${driverName} wurde gesperrt.${reason ? ` Grund: ${reason}` : ''}` 
          : `${driverName} wurde entsperrt.`,
      });
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Status konnte nicht aktualisiert werden.",
        variant: "destructive",
      });
    }
  };

  const handleSendJobToAllDrivers = async (jobId: string) => {
    console.log('📧 Sending job to all drivers:', jobId);
    setSendingJobToAll(jobId);
    
    try {
      const { data, error } = await supabase.functions.invoke('broadcast-job-to-drivers', {
        body: { jobRequestId: jobId }
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

  const loadFahrerData = async () => {
    setIsLoadingData(true);
    console.log("🔍 Admin: Lade Fahrerdaten...");
    
    try {
      // Use admin-data-fetch edge function - session token is automatically included by Supabase client
      const { data: response, error } = await supabase.functions.invoke('admin-data-fetch', {
        body: { dataType: 'fahrer' }
      });

      if (error) {
        console.error("❌ Admin: Fehler beim Laden der Fahrerdaten:", error);
        toast({
          title: "Fehler beim Laden",
          description: `Fahrerdaten konnten nicht geladen werden: ${error.message}`,
          variant: "destructive"
        });
        return;
      }

      if (!response?.success) {
        console.error("❌ Admin: API-Fehler:", response?.error);
        return;
      }

      const data = response.data;
      console.log("📊 Admin: Fahrerdaten erfolgreich geladen:", data?.length || 0);
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
      const fahrerIds = fahrerData.map(f => f.id);

      const { data: response, error } = await supabase.functions.invoke('admin-data-fetch', {
        body: { dataType: 'document-counts', fahrerIds }
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

      const { data: response, error } = await supabase.functions.invoke('admin-data-fetch', {
        body: { dataType: 'documents', fahrerId }
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

    // Grüne Badges für genehmigte Fahrer
    if (status === 'approved' || status === 'active') {
      return (
        <Badge className="bg-green-600 hover:bg-green-700 text-white">
          {labels[status] || status}
        </Badge>
      );
    }

    return (
      <Badge variant={variants[status] || "secondary"}>
        {labels[status] || status}
      </Badge>
    );
  };

  if (authChecking || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-sm text-gray-600">Prüfe Admin-Berechtigung...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className={`w-full text-xs md:text-sm border-b px-3 py-2 ${envOk ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
        {envOk ? '✅ Supabase ENV: konfiguriert' : '❌ Supabase Config fehlt'}
        <span className="ml-2 hidden md:inline">URL: {SUPABASE_URL ? 'gesetzt' : 'leer'} | ANON: {SUPABASE_PUBLISHABLE_KEY ? 'gesetzt' : 'leer'}</span>
      </div>
      <div className="container mx-auto py-4 md:py-8 px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 md:mb-8 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-sm md:text-base text-gray-600">Fahrerdokumente verwalten</p>
          </div>
          <Button onClick={handleLogout} variant="outline" size="sm" className="w-full md:w-auto">
            <LogOut className="h-4 w-4 mr-2" />
            Abmelden
          </Button>
        </div>

        {/* Analytics Dashboard - NUR für Admin sichtbar */}
        <div className="mb-8">
          <AdminAnalyticsDashboard />
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
              <CardTitle className="text-lg md:text-xl">Registrierte Fahrer ({fahrer.length})</CardTitle>
              <div className="flex gap-2 flex-wrap">
                <Button 
                  onClick={() => setNewsletterDialogOpen(true)}
                  variant="default"
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 flex-1 md:flex-none"
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Rundschreiben
                </Button>
                <Button 
                  onClick={loadFahrerData} 
                  variant="outline" 
                  size="sm"
                  disabled={isLoadingData}
                  className="flex-1 md:flex-none"
                >
                  {isLoadingData ? "Lädt..." : "Aktualisieren"}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4 md:p-6">
            {fahrer.length === 0 ? (
              <p className="text-gray-500 italic text-center py-4">Keine Fahrer registriert.</p>
            ) : (
              <>
                {/* Desktop Table View - only show on very large screens */}
                <div className="hidden xl:block overflow-x-auto">
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
                      {sortedFahrer.map((f) => (
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
                            <div className="flex items-center gap-2 flex-wrap">
                              {f.is_blocked && (
                                <Badge variant="destructive" className="bg-red-600">
                                  🚫 GESPERRT
                                </Badge>
                              )}
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
                               <Button
                                 size="sm"
                                 variant={f.is_blocked ? "outline" : "outline"}
                                 className={f.is_blocked 
                                   ? "text-xs h-7 border-green-600 text-green-600 hover:bg-green-50 hover:text-green-700" 
                                   : "text-xs h-7 border-red-600 text-red-600 hover:bg-red-50 hover:text-red-700"}
                                 onClick={() => toggleBlockDriver(f.id, f.is_blocked || false, `${f.vorname} ${f.nachname}`)}
                               >
                                 {f.is_blocked ? '🔓 Entsperren' : '🚫 Sperren'}
                               </Button>
                             </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Mobile & Tablet Card View - show on all screens except very large */}
                <div className="xl:hidden space-y-3">
                  {sortedFahrer.map((f) => (
                    <Card key={f.id} className="shadow-sm border-gray-200">
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <div className="flex justify-between items-start gap-3">
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-base truncate">{f.vorname} {f.nachname}</h3>
                              <a href={`tel:${f.telefon}`} className="text-sm text-blue-600 hover:underline">{f.telefon}</a>
                            </div>
                            <div className="flex-shrink-0 flex gap-1">
                              {f.is_blocked && (
                                <Badge variant="destructive" className="bg-red-600 text-xs">
                                  🚫
                                </Badge>
                              )}
                              {getStatusBadge(f.status, f.id, f.status === 'pending' ? () => handleApproveDriver(f.id) : undefined)}
                            </div>
                          </div>
                          
                          {f.is_blocked && f.blocked_reason && (
                            <div className="text-xs text-red-600 bg-red-50 dark:bg-red-950/20 p-2 rounded">
                              <strong>Sperrgrund:</strong> {f.blocked_reason}
                            </div>
                          )}
                          
                          <div className="text-sm space-y-1">
                            <p className="text-gray-700">
                              <span className="font-medium">Führerschein:</span> {f.fuehrerscheinklassen?.join(", ") || "-"}
                            </p>
                            {f.beschreibung && (
                              <p className="text-gray-600 bg-gray-50 p-2 rounded text-xs">
                                <span className="font-medium">Nachricht:</span> {f.beschreibung}
                              </p>
                            )}
                          </div>

                          <div className="flex gap-2 pt-1 flex-wrap">
                            {f.status === 'pending' && (
                              <Button
                                size="sm"
                                className="bg-green-600 hover:bg-green-700 text-white font-medium flex-1"
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
                                className="text-orange-600 border-orange-300 hover:bg-orange-50 flex-1"
                                onClick={() => handleResetDriverStatus(f.id, `${f.vorname} ${f.nachname}`)}
                              >
                                ↻ Zurücksetzen
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant={f.is_blocked ? "outline" : "outline"}
                              className={f.is_blocked 
                                ? "text-xs h-7 border-green-600 text-green-600 hover:bg-green-50 hover:text-green-700 flex-1" 
                                : "text-xs h-7 border-red-600 text-red-600 hover:bg-red-50 hover:text-red-700 flex-1"}
                              onClick={() => toggleBlockDriver(f.id, f.is_blocked || false, `${f.vorname} ${f.nachname}`)}
                            >
                              {f.is_blocked ? '🔓 Entsperren' : '🚫 Sperren'}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Job Requests Section */}
        <Card className="mt-6 md:mt-8">
          <CardHeader>
            <div className="flex flex-col gap-4">
              <CardTitle className="text-lg md:text-xl">Eingegangene Fahreranfragen ({jobRequests.length})</CardTitle>
              <div className="flex gap-2 flex-wrap">
                <Button 
                  onClick={handleCreateJob} 
                  variant="default" 
                  size="sm"
                  className="bg-green-600 hover:bg-green-700 flex-1 md:flex-none"
                >
                  + Neuer Auftrag
                </Button>
                <Button 
                  onClick={() => handleCompleteOldJobs(30)}
                  size="sm"
                  variant="outline"
                  disabled={completingOldJobs}
                  className="bg-green-50 hover:bg-green-100 text-green-700 border-green-300 hidden md:inline-flex"
                >
                  {completingOldJobs ? 'Wird abgeschlossen...' : 'Alte Aufträge abschließen (30 Tage)'}
                </Button>
                <Button 
                  onClick={handleResetJobsByEmail} 
                  variant="destructive" 
                  size="sm"
                  className="hidden md:inline-flex"
                >
                  Test zurücksetzen
                </Button>
                <Button 
                  onClick={loadJobRequests} 
                  variant="outline" 
                  size="sm"
                  disabled={isLoadingJobs}
                  className="flex-1 md:flex-none"
                >
                  {isLoadingJobs ? "Lädt..." : "Aktualisieren"}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-3 md:p-6">
            {jobRequests.length === 0 ? (
              <p className="text-gray-500 italic text-center py-4">Keine Anfragen vorhanden.</p>
            ) : (
              <>
                {/* Desktop Table View */}
                <div className="hidden lg:block overflow-x-auto">
                  <Table>
                  <TableHeader>
                    <TableRow>
                       <TableHead className="min-w-[50px]">Erledigt</TableHead>
                       <TableHead className="min-w-[200px]">Name & Details</TableHead>
                       <TableHead className="min-w-[150px]">Kontakt</TableHead>
                       <TableHead className="min-w-[120px]">Einsatz</TableHead>
                       <TableHead className="min-w-[100px]">Fahrzeugtyp</TableHead>
                       <TableHead className="min-w-[80px]">Status</TableHead>
                        <TableHead className="min-w-[150px]">Zuweisung & Aktionen</TableHead>
                    </TableRow>
                  </TableHeader>
                <TableBody>
                  {sortedJobRequests.map((req) => (
                    <React.Fragment key={req.id}>
                      <TableRow>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-2">
                            {(() => {
                              // Checkbox ist IMMER klickbar - Admin kann jeden Job als erledigt markieren
                              const isBeingProcessed = markingCompleted === req.id;
                              const hasActiveAssignment = req.status === 'assigned' || req.status === 'confirmed';
                              
                              return (
                                <Checkbox
                                  checked={req.status === 'completed'}
                                  onCheckedChange={async (checked) => {
                                    if (checked) {
                                      await handleMarkJobCompleted(req.id);
                                    } else {
                                      await handleMarkJobOpen(req.id);
                                    }
                                  }}
                                  disabled={isBeingProcessed}
                                />
                              );
                            })()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Collapsible
                            open={expandedJobRows.has(req.id)}
                            onOpenChange={() => {
                              const newExpanded = new Set(expandedJobRows);
                              if (newExpanded.has(req.id)) {
                                newExpanded.delete(req.id);
                              } else {
                                newExpanded.add(req.id);
                              }
                              setExpandedJobRows(newExpanded);
                            }}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="font-semibold">{req.customer_name}</div>
                                <div className="text-xs text-gray-500">{req.customer_company || '–'}</div>
                              </div>
                              <CollapsibleTrigger asChild>
                                <Button variant="ghost" size="sm" className="p-0 h-auto">
                                  {expandedJobRows.has(req.id) ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                </Button>
                              </CollapsibleTrigger>
                            </div>
                          </Collapsible>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div className="font-medium">{req.customer_email}</div>
                            <div className="text-gray-600">{req.customer_phone}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {req.zeitraum || '-'}
                          </div>
                        </TableCell>
                        <TableCell>{req.fahrzeugtyp || 'Nicht angegeben'}</TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <Badge 
                              variant={
                                req.status === 'completed' ? 'outline' :
                                req.status === 'confirmed' ? 'default' :
                                req.status === 'assigned' ? 'secondary' :
                                req.status === 'no_show' ? 'destructive' : 'outline'
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
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <Button 
                                      size="sm" 
                                      onClick={() => handleAssignDriver(req.id)}
                                      disabled={req.status === 'completed'}
                                      title={req.status === 'completed' ? 'Erledigte Aufträge können nicht zugewiesen werden' : 'Fahrer zuweisen'}
                                    >
                                      Zuweisen
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleSendJobToAllDrivers(req.id)}
                                      disabled={sendingJobToAll === req.id || req.status === 'completed'}
                                      title="Job an alle verfügbaren Fahrer senden"
                                    >
                                      <Mail className="h-3 w-3 mr-1" />
                                      {sendingJobToAll === req.id ? 'Sende...' : 'An alle senden'}
                                    </Button>
                                    {!req.customer_street && (
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleOpenContactDialog(req.id)}
                                        className="text-orange-600 border-orange-300 hover:bg-orange-50"
                                      >
                                        <Edit className="h-3 w-3 mr-1" />
                                        Adresse ergänzen
                                      </Button>
                                    )}
                                  </div>
                                );
                              }

                            return (
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-blue-800">
                                    {a.fahrer_profile.vorname} {a.fahrer_profile.nachname}
                                  </span>
                                  <div className="text-xs text-blue-600">
                                    {a.rate_value}€/{a.rate_type === 'hourly' ? 'Std' : 'Tag'}
                                  </div>
                                  {a.status === "confirmed" ? (
                                    <Badge variant="default">Bestätigt</Badge>
                                  ) : a.status === "completed" ? (
                                    <Badge variant="outline">Erledigt</Badge>
                                  ) : a.status === "no_show" ? (
                                    <Badge variant="destructive">No-Show</Badge>
                                  ) : a.status === "cancelled" ? (
                                    <Badge variant="outline">Storniert</Badge>
                                  ) : (
                                    <Badge variant="secondary">Zugewiesen</Badge>
                                  )}

                                </div>

                                <div className="flex items-center gap-2 flex-wrap">
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
                      </TableRow>
                      {/* Einladungsstatus Row */}
                      {expandedJobRows.has(req.id) && (
                        <TableRow>
                          <TableCell colSpan={7} className="bg-muted/50 p-4">
                            <JobInvitesStatus jobId={req.id} />
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
                  ))}
                </TableBody>
                </Table>
                </div>

                {/* Mobile Card View */}
                <div className="lg:hidden space-y-4">
                  {sortedJobRequests.map((req) => {
                    const a = activeByJob.get(req.id);
                    const isBeingProcessed = markingCompleted === req.id;
                    const isExpanded = expandedJobRows.has(req.id);
                    
                    return (
                      <Card key={req.id} className="shadow-sm border-gray-200">
                        <CardContent className="p-4 space-y-3">
                          {/* Header mit Checkbox und Status */}
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-start gap-3 flex-1 min-w-0">
                              <Checkbox
                                checked={req.status === 'completed'}
                                onCheckedChange={async (checked) => {
                                  if (checked) {
                                    await handleMarkJobCompleted(req.id);
                                  } else {
                                    await handleMarkJobOpen(req.id);
                                  }
                                }}
                                disabled={isBeingProcessed}
                                className="mt-1"
                              />
                              <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-base truncate">{req.customer_name}</h3>
                                {req.customer_company && (
                                  <p className="text-sm text-gray-600 truncate">{req.customer_company}</p>
                                )}
                              </div>
                            </div>
                            <div className="flex-shrink-0">
                              <Badge 
                                variant={
                                  req.status === 'completed' ? 'outline' :
                                  req.status === 'confirmed' ? 'default' :
                                  req.status === 'assigned' ? 'secondary' :
                                  req.status === 'no_show' ? 'destructive' : 'outline'
                                }
                                className="text-xs"
                              >
                                {req.status === 'confirmed' ? 'Bestätigt' : 
                                  req.status === 'assigned' ? 'Zugewiesen' : 
                                  req.status === 'no_show' ? 'No-Show' :
                                  req.status === 'completed' ? 'Erledigt' : 'Offen'}
                              </Badge>
                            </div>
                          </div>

                          {/* Adresswarnung */}
                          {(!req.customer_street || !req.customer_house_number || !req.customer_postal_code || !req.customer_city || !/^\d{5}$/.test(req.customer_postal_code || '')) && (
                            <Badge 
                              variant="outline" 
                              className="bg-orange-50 text-orange-700 border-orange-300 text-xs w-full justify-center"
                            >
                              ⚠️ Adresse unvollständig
                            </Badge>
                          )}

                          {/* Kontaktdaten */}
                          <div className="text-sm space-y-1 bg-gray-50 p-2 rounded">
                            <div className="flex items-center gap-2">
                              <Mail className="h-3 w-3 text-gray-500" />
                              <a href={`mailto:${req.customer_email}`} className="text-blue-600 hover:underline truncate">
                                {req.customer_email}
                              </a>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-gray-700">📞</span>
                              <a href={`tel:${req.customer_phone}`} className="text-blue-600 hover:underline">
                                {req.customer_phone}
                              </a>
                            </div>
                          </div>

                          {/* Einsatzdaten */}
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <span className="font-medium text-gray-700">Fahrzeugtyp:</span>
                              <p className="text-gray-900">{req.fahrzeugtyp || 'Nicht angegeben'}</p>
                            </div>
                            <div>
                              <span className="font-medium text-gray-700">Einsatz:</span>
                              <p className="text-gray-900">{req.zeitraum || '-'}</p>
                            </div>
                          </div>

                          {/* Zuweisung */}
                          {a ? (
                            <div className="bg-blue-50 p-3 rounded space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="font-medium text-blue-900">
                                  {a.fahrer_profile.vorname} {a.fahrer_profile.nachname}
                                </span>
                                <span className="text-sm text-blue-700">
                                  {a.rate_value}€/{a.rate_type === 'hourly' ? 'Std' : 'Tag'}
                                </span>
                              </div>
                              <div className="flex gap-2 flex-wrap">
                                <Button 
                                  size="sm" 
                                  onClick={() => resendDriverConfirmationNew(a.id)}
                                  className="flex-1 min-w-[140px]"
                                >
                                  E-Mail erneut senden
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  onClick={() => handleAssignDriver(req.id)}
                                  className="flex-1 min-w-[100px]"
                                >
                                  Ändern
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <Button 
                                size="sm" 
                                onClick={() => handleAssignDriver(req.id)}
                                disabled={req.status === 'completed'}
                                className="w-full h-11"
                              >
                                👤 Fahrer zuweisen
                              </Button>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleSendJobToAllDrivers(req.id)}
                                  disabled={sendingJobToAll === req.id || req.status === 'completed'}
                                  className="flex-1 h-11"
                                >
                                  <Mail className="h-4 w-4 mr-1" />
                                  {sendingJobToAll === req.id ? 'Sende...' : 'An alle senden'}
                                </Button>
                                {!req.customer_street && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleOpenContactDialog(req.id)}
                                    className="flex-1 text-orange-600 border-orange-300 hover:bg-orange-50 h-11"
                                  >
                                    <Edit className="h-4 w-4 mr-1" />
                                    Adresse
                                  </Button>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Einladungsstatus Toggle */}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const newExpanded = new Set(expandedJobRows);
                              if (newExpanded.has(req.id)) {
                                newExpanded.delete(req.id);
                              } else {
                                newExpanded.add(req.id);
                              }
                              setExpandedJobRows(newExpanded);
                            }}
                            className="w-full justify-between"
                          >
                            <span>Einladungsstatus anzeigen</span>
                            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                          </Button>

                          {/* Einladungsstatus */}
                          {isExpanded && (
                            <div className="bg-muted/50 p-3 rounded">
                              <JobInvitesStatus jobId={req.id} />
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </>
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
      <Card className="mt-6 md:mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
            <Users className="h-5 w-5" />
            Zuweisungen ({jobAssignments.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 md:p-6">
          {jobAssignments.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              Keine Zuweisungen vorhanden.
            </p>
          ) : (
            <div className="space-y-3 md:space-y-4">
              {jobAssignments.map((assignment) => (
                <div key={assignment.id} className="border rounded-lg p-3 md:p-4 space-y-3">
                  <div className="flex flex-col md:flex-row justify-between md:items-start gap-2">
                    <div className="flex-1">
                      <h4 className="font-semibold text-base">
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
                          className="text-xs"
                        >
                          {assignment.status === 'assigned' ? 'Zugewiesen' :
                           assignment.status === 'confirmed' ? 'Bestätigt' : 
                           assignment.status === 'no_show' ? `No-Show${assignment.no_show_fee_cents ? ` – ${(assignment.no_show_fee_cents / 100).toFixed(0)} €` : ''}` : 
                           assignment.status === 'completed' ? 'Erledigt' : 'Storniert'}
                        </Badge>
                      </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-4 text-sm">
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
                    <div className="text-sm bg-gray-50 p-2 rounded">
                      <span className="font-medium">Notiz:</span> {assignment.admin_note}
                    </div>
                  )}

                  {assignment.status === 'assigned' && (
                    <div className="flex gap-2 pt-2">
                       <Button
                         size="sm"
                         onClick={() => confirmAndSend(assignment.id)}
                         disabled={confirmingAssignment === assignment.id}
                         className="flex items-center gap-1 h-10 w-full md:w-auto"
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
                        className="flex items-center gap-1 h-10 w-full md:w-auto"
                      >
                        <X className="h-4 w-4" />
                        No-Show markieren
                      </Button>
                    </div>
                  )}

                  {assignment.status === 'no_show' && assignment.no_show_fee_cents && (
                    <div className="text-sm text-red-600 font-medium bg-red-50 p-2 rounded">
                      Schadensersatz: {(assignment.no_show_fee_cents / 100).toFixed(2)} € ({assignment.no_show_tier})
                    </div>
                  )}

                  {assignment.status === 'confirmed' && (
                    <div className="text-xs md:text-sm text-muted-foreground">
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

      {/* Driver Newsletter Dialog */}
      <DriverNewsletterDialog
        open={newsletterDialogOpen}
        onOpenChange={setNewsletterDialogOpen}
      />

      {/* Performance Monitor */}
      <PerformanceMonitor />
    </div>
  );
};

export default Admin;