import React, { useState, useEffect, useRef } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Eye, Download, ChevronDown, ChevronRight, LogOut, FileText, Image, Users, Check, X, Mail, Edit, ChevronUp } from "lucide-react";
import { ContactDataDialog } from "@/components/ContactDataDialog";
import { NoShowDialog } from "@/components/NoShowDialog";
import { CreateJobDialog } from "@/components/CreateJobDialog";
import { JobAttachmentsList } from "@/components/JobAttachmentsList";
import { TestSendJobButton } from "@/components/TestSendJobButton";
import { AdminAssignmentDialog } from "@/components/AdminAssignmentDialog";
import { EmailLogView } from "@/components/EmailLogView";
import { DriverNewsletterDialog } from "@/components/DriverNewsletterDialog";
import { CustomerNewsletterDialog } from "@/components/CustomerNewsletterDialog";
// JobInvitesStatus ausgeblendet - Fahrer antworten jetzt per Telefon
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
  email_opt_out?: boolean;
  unsubscribed_at?: string | null;
  unsubscribed_reason?: string | null;
  is_inactive?: boolean;
  inactive_since?: string | null;
  inactive_reason?: string | null;
  inactive_reason_code?: string | null;
  inactive_notified_at?: string | null;
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
  const inactivityTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
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
  const [customerNewsletterDialogOpen, setCustomerNewsletterDialogOpen] = useState(false);
  const [expandedJobRows, setExpandedJobRows] = useState<Set<string>>(new Set());
  const [approvingJob, setApprovingJob] = useState<string | null>(null);
  const [rejectingJob, setRejectingJob] = useState<string | null>(null);

  // Vorübergehend deaktivieren (nicht aktiv)
  const [inactiveDialogOpen, setInactiveDialogOpen] = useState(false);
  const [inactiveDriver, setInactiveDriver] = useState<{ id: string; name: string; email: string } | null>(null);
  const [inactiveReasonCode, setInactiveReasonCode] = useState<string>("docs_missing");
  const [inactiveReasonText, setInactiveReasonText] = useState<string>("");
  const [inactiveNotify, setInactiveNotify] = useState<boolean>(true);
  const [inactiveSubmitting, setInactiveSubmitting] = useState<boolean>(false);
  const [reactivatingDriver, setReactivatingDriver] = useState<string | null>(null);

  const INACTIVE_REASONS: { code: string; label: string }[] = [
    { code: "docs_missing", label: "Unterlagen fehlen" },
    { code: "license_missing", label: "Führerschein / Fahrerkarte fehlt oder ungültig" },
    { code: "trade_cert_missing", label: "Gewerbenachweis fehlt" },
    { code: "no_response", label: "Fahrer reagiert nicht" },
    { code: "declines_jobs", label: "Fahrer nimmt keine Aufträge an" },
    { code: "other", label: "Sonstiger Grund" },
  ];

  const openInactiveDialog = (id: string, name: string, email: string) => {
    setInactiveDriver({ id, name, email });
    setInactiveReasonCode("docs_missing");
    setInactiveReasonText("");
    setInactiveNotify(true);
    setInactiveDialogOpen(true);
  };

  const submitDeactivate = async () => {
    if (!inactiveDriver) return;
    setInactiveSubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke("set-driver-inactive", {
        body: {
          driverId: inactiveDriver.id,
          action: "deactivate",
          reasonCode: inactiveReasonCode,
          reasonText: inactiveReasonText,
          notify: inactiveNotify,
        },
      });
      if (error) throw error;

      const nowIso = new Date().toISOString();
      const mailStatus = (data as any)?.mailStatus;
      setFahrer(prev => prev.map(f => f.id === inactiveDriver.id ? {
        ...f,
        is_inactive: true,
        inactive_since: nowIso,
        inactive_reason: inactiveReasonText || INACTIVE_REASONS.find(r => r.code === inactiveReasonCode)?.label || null,
        inactive_reason_code: inactiveReasonCode,
        inactive_notified_at: mailStatus === "sent" ? nowIso : (f.inactive_notified_at ?? null),
      } : f));

      toast({
        title: "Fahrer auf nicht aktiv gesetzt",
        description: `${inactiveDriver.name} ist vorübergehend deaktiviert${
          inactiveNotify ? (mailStatus === "sent" ? " · Mitteilung versendet" : " · Mitteilung NICHT versendet") : ""
        }.`,
      });
      setInactiveDialogOpen(false);
      setInactiveDriver(null);
    } catch (e: any) {
      toast({ title: "Fehler", description: e?.message ?? "Deaktivierung fehlgeschlagen", variant: "destructive" });
    } finally {
      setInactiveSubmitting(false);
    }
  };

  const reactivateDriver = async (id: string, driverName: string) => {
    if (!confirm(`Fahrer „${driverName}" wieder aktivieren?\n\nDer Status „Vorübergehend deaktiviert" wird entfernt.\nSperre und Mail-Abmeldung bleiben unverändert.`)) return;
    setReactivatingDriver(id);
    try {
      const { error } = await supabase.functions.invoke("set-driver-inactive", {
        body: { driverId: id, action: "reactivate" },
      });
      if (error) throw error;
      setFahrer(prev => prev.map(f => f.id === id ? {
        ...f,
        is_inactive: false,
        inactive_since: null,
        inactive_reason: null,
        inactive_reason_code: null,
        inactive_notified_at: null,
      } : f));
      toast({ title: "Fahrer wieder aktiv", description: `${driverName} wird wieder für Auftragsangebote berücksichtigt.` });
    } catch (e: any) {
      toast({ title: "Fehler", description: e?.message ?? "Reaktivierung fehlgeschlagen", variant: "destructive" });
    } finally {
      setReactivatingDriver(null);
    }
  };

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
    const cleanupInactivityTimer = setupInactivityTimer();

    return () => {
      cleanupInactivityTimer?.();
    };
  }, []);

  // Auto-Logout bei Inaktivität
  const setupInactivityTimer = () => {
    const resetTimer = () => {
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
      inactivityTimerRef.current = setTimeout(() => {
        handleAutoLogout();
      }, 60 * 60 * 1000); // 60 Minuten
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
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
        inactivityTimerRef.current = null;
      }
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
    console.log("🔍 Admin: Lese Session (Auth bereits durch AdminRoute geprüft)...");
    setAuthChecking(true);

    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError || !session) {
        // AdminRoute hat eigentlich bereits geprüft – sicherheitshalber zurück zum Login.
        console.log("❌ Admin: Keine Session vorhanden – zurück zum Login");
        setAuthChecking(false);
        navigate('/admin/login');
        return;
      }

      // Keine erneute Rollen-/Refresh-Prüfung: AdminRoute ist die Sicherheitsinstanz.
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
      
      // Update session activity (fire-and-forget)
      supabase
        .from('admin_sessions')
        .update({ last_activity: new Date().toISOString() })
        .eq('user_id', session.user.id)
        .eq('is_active', true)
        .then(() => {});
      
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
    
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
      inactivityTimerRef.current = null;
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
        const msg = (error as any)?.message || '';
        const ctxStatus = (error as any)?.context?.status;
        if (ctxStatus === 401 || /Auth session missing|Invalid token|JWT/i.test(msg)) {
          // Auth-Fehler – Redirect erfolgt bereits via loadFahrerData/checkAuth
          return;
        }
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
      // No need to pass email - JWT is sent automatically via Authorization header
      const { error } = await supabase.functions.invoke(
        "send-driver-confirmation",
        { body: { 
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

      // 2) E-Mail + PDF an Fahrer (BCC an Admin) - JWT sent automatically
      const { error: fnErr } = await supabase.functions.invoke(
        "send-driver-confirmation",
        { body: { assignment_id: assignmentId } }
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

  const cancelAssignment = async (assignmentId: string) => {
    const reason = window.prompt("Grund für die Auflösung der Zuweisung (Pflichtfeld):");
    if (reason === null) return;
    const trimmed = reason.trim();
    if (!trimmed) {
      toast({
        title: "Grund erforderlich",
        description: "Bitte einen kurzen Grund angeben.",
        variant: "destructive",
      });
      return;
    }
    try {
      const { error } = await supabase.rpc("admin_cancel_assignment", {
        _assignment_id: assignmentId,
        _reason: trimmed,
      });
      if (error) throw error;
      toast({
        title: "Zuweisung aufgelöst",
        description: "Die Zuweisung wurde storniert.",
      });
      await loadJobRequests();
      await loadJobAssignments();
    } catch (err: any) {
      console.error(err);
      toast({
        title: "Fehler",
        description: err?.message ?? "Auflösen fehlgeschlagen",
        variant: "destructive",
      });
    }
  };

  const resendDriverConfirmation = async (assignmentId: string) => {
    try {
      // JWT sent automatically via Authorization header
      const { error } = await supabase.functions.invoke(
        "send-driver-confirmation",
        { body: { assignment_id: assignmentId, resend: true } }
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
      // JWT sent automatically via Authorization header - no need for localStorage email
      const { data, error } = await supabase.functions.invoke('approve-driver-and-send-jobs', {
        body: { driverId }
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


  const handleResetDriverStatus = async (driverId: string, driverName: string) => {
    try {
      const { data: result, error: invokeError } = await supabase.functions.invoke('reset-driver-status', {
        body: { driverId, newStatus: 'pending' }
      });

      if (invokeError) throw invokeError;

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

  const reactivateDriverEmails = async (id: string, driverName: string) => {
    if (!confirm(`Auftragsmails für ${driverName} wieder aktivieren?\n\nDie Sperre (falls vorhanden) bleibt unverändert.`)) return;
    try {
      const { error } = await supabase
        .from('fahrer_profile')
        .update({
          email_opt_out: false,
          unsubscribed_at: null,
          unsubscribed_reason: null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);
      if (error) throw error;

      setFahrer(prev =>
        prev.map(f => f.id === id ? {
          ...f,
          email_opt_out: false,
          unsubscribed_at: null,
          unsubscribed_reason: null,
        } : f)
      );

      toast({
        title: "Auftragsmails reaktiviert",
        description: `${driverName} erhält wieder Auftragsmails.`,
      });
    } catch (error: any) {
      toast({
        title: "Fehler",
        description: error?.message ?? "Reaktivierung fehlgeschlagen",
        variant: "destructive",
      });
    }
  };

  const handleSendJobToAllDrivers = async (jobId: string) => {
    console.log('📧 Sending job to all drivers via admin-approve-job:', jobId);
    setSendingJobToAll(jobId);
    
    try {
      // Use admin-approve-job which has proper service role authentication
      const { data, error } = await supabase.functions.invoke('admin-approve-job', {
        body: { jobId, action: 'approve' }
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
        description: data?.broadcast?.sentToCount 
          ? `Job wurde an ${data.broadcast.sentToCount} aktive Fahrer gesendet.`
          : "Job wurde an alle aktiven Fahrer gesendet.",
      });

      // Refresh jobs list
      await loadJobRequests();

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

  // Handler für Admin-Freigabe von Buchungsanfragen
  const handleApproveJob = async (jobId: string) => {
    setApprovingJob(jobId);
    
    try {
      const { data, error } = await supabase.functions.invoke('admin-approve-job', {
        body: { jobId, action: 'approve' }
      });

      if (error) {
        console.error('❌ Error approving job:', error);
        toast({
          title: "Fehler beim Freigeben",
          description: `Fehler: ${error.message || 'Unbekannter Fehler'}`,
          variant: "destructive"
        });
        return;
      }

      console.log('✅ Job approved:', data);
      
      toast({
        title: "Anfrage freigegeben",
        description: data.message || `Job wurde an ${data.sentToCount || 0} Fahrer gesendet.`,
      });

      // Reload job requests to show updated status
      await loadJobRequests();
      
    } catch (error) {
      console.error('❌ Unexpected error in handleApproveJob:', error);
      toast({
        title: "Unerwarteter Fehler",
        description: `Ein Fehler ist aufgetreten: ${error instanceof Error ? error.message : 'Unbekannter Fehler'}`,
        variant: "destructive"
      });
    } finally {
      setApprovingJob(null);
    }
  };

  const handleRejectJob = async (jobId: string) => {
    setRejectingJob(jobId);
    
    try {
      const { data, error } = await supabase.functions.invoke('admin-approve-job', {
        body: { jobId, action: 'reject' }
      });

      if (error) {
        console.error('❌ Error rejecting job:', error);
        toast({
          title: "Fehler beim Ablehnen",
          description: `Fehler: ${error.message || 'Unbekannter Fehler'}`,
          variant: "destructive"
        });
        return;
      }

      console.log('✅ Job rejected:', data);
      
      toast({
        title: "Anfrage abgelehnt",
        description: "Die Anfrage wurde abgelehnt. Keine Fahrer-E-Mails wurden versendet.",
      });

      await loadJobRequests();
      
    } catch (error) {
      console.error('❌ Unexpected error in handleRejectJob:', error);
      toast({
        title: "Unerwarteter Fehler",
        description: `Ein Fehler ist aufgetreten: ${error instanceof Error ? error.message : 'Unbekannter Fehler'}`,
        variant: "destructive"
      });
    } finally {
      setRejectingJob(null);
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
        const msg = (error as any)?.message || '';
        const ctxStatus = (error as any)?.context?.status;
        if (ctxStatus === 401 || /Auth session missing|Invalid token|JWT/i.test(msg)) {
          await supabase.auth.signOut().catch(() => {});
          toast({
            title: "Sitzung abgelaufen",
            description: "Bitte melden Sie sich erneut an.",
            variant: "destructive",
          });
          navigate('/admin/login');
          return;
        }
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

  const DOC_TYPE_LABELS: Record<string, string> = {
    fuehrerschein: "Führerschein",
    fahrerkarte: "Fahrerkarte",
    gewerbeanmeldung: "Gewerbeanmeldung",
    zertifikate: "Zertifikat / Sonstiges",
    zertifikat: "Zertifikat / Sonstiges",
  };

  const renderDriverDocuments = (fahrerId: string) => {
    const docs = documents[fahrerId];
    if (!docs) {
      return <div className="text-sm text-muted-foreground py-2">Lade Dokumente…</div>;
    }
    if (docs.length === 0) {
      return <div className="text-sm text-muted-foreground py-2">Keine Dokumente in der Datenbank hinterlegt.</div>;
    }
    return (
      <div className="space-y-2 py-2">
        <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Hinterlegte Dokumente ({docs.length})
        </div>
        <div className="space-y-1.5">
          {docs.map((doc) => {
            const isImage = /\.(jpe?g|png|webp|gif)$/i.test(doc.filename);
            const Icon = isImage ? Image : FileText;
            const label = DOC_TYPE_LABELS[doc.type?.toLowerCase()] || doc.type || "Dokument";
            return (
              <div
                key={doc.id}
                className="flex flex-wrap items-center gap-2 p-2 bg-background border rounded-md"
              >
                <Icon className="h-4 w-4 text-blue-600 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">
                    {label} <span className="text-muted-foreground font-normal">· {doc.filename}</span>
                  </div>
                  <div className="text-xs text-muted-foreground truncate" title={doc.filepath}>
                    {doc.filepath} · hochgeladen am {new Date(doc.uploaded_at).toLocaleString('de-DE')}
                  </div>
                </div>
                <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => handlePreview(doc)}>
                  <Eye className="h-3 w-3 mr-1" /> Ansehen
                </Button>
                <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => handleDownload(doc)}>
                  <Download className="h-3 w-3 mr-1" /> Herunterladen
                </Button>
              </div>
            );
          })}
        </div>
      </div>
    );
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

    // Grüne Badges für genehmigte Fahrer (Status, kein Button)
    if (status === 'approved' || status === 'active') {
      return (
        <Badge className="bg-green-600 text-white text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 pointer-events-none">
          {labels[status] || status}
        </Badge>
      );
    }

    return (
      <Badge
        variant={variants[status] || "secondary"}
        className="text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 pointer-events-none"
      >
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
              <div>
                {/* Desktop Table View */}
                <div className="hidden lg:block overflow-x-auto">
                  <Table>
                  <TableHeader>
                    <TableRow>
                       <TableHead className="min-w-[50px]">Status</TableHead>
                       <TableHead className="min-w-[200px]">Name & Details</TableHead>
                       <TableHead className="min-w-[150px]">Kontakt</TableHead>
                       <TableHead className="min-w-[120px]">Einsatz</TableHead>
                       <TableHead className="min-w-[100px]">Fahrzeugtyp</TableHead>
                       <TableHead className="min-w-[80px]">Status</TableHead>
                        <TableHead className="min-w-[150px]">Zuweisung & Aktionen</TableHead>
                    </TableRow>
                  </TableHeader>
                <TableBody>
                      {sortedJobRequests.flatMap((req) => [
                      <TableRow key={req.id}>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center">
                            {(() => {
                              const isBeingProcessed = markingCompleted === req.id;
                              const isCompleted = req.status === 'completed';
                              
                              return (
                                <button
                                  onClick={async () => {
                                    if (isCompleted) {
                                      await handleMarkJobOpen(req.id);
                                    } else {
                                      await handleMarkJobCompleted(req.id);
                                    }
                                  }}
                                  disabled={isBeingProcessed}
                                  className="relative w-6 h-6 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
                                  style={{
                                    backgroundColor: isCompleted ? '#dc2626' : '#16a34a',
                                    boxShadow: isCompleted 
                                      ? '0 0 8px rgba(220, 38, 38, 0.5)' 
                                      : '0 0 8px rgba(22, 163, 74, 0.5)',
                                  }}
                                  title={isCompleted ? 'Klicken um wieder zu öffnen' : 'Klicken um als erledigt zu markieren'}
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
                                <div className="text-xs text-gray-500">{req.company || '–'}</div>
                                {req.einsatzort && <div className="text-xs text-gray-400">📍 {req.einsatzort}</div>}
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
                                req.status === 'sent' ? 'default' :
                                req.status === 'approved' ? 'secondary' :
                                req.status === 'rejected' ? 'destructive' :
                                req.status === 'pending' ? 'outline' :
                                req.status === 'no_show' ? 'destructive' : 'outline'
                              }
                              className={
                                req.status === 'pending' ? 'bg-yellow-100 text-yellow-800 border-yellow-300' :
                                req.status === 'sent' ? 'bg-green-100 text-green-800 border-green-300' : ''
                              }
                            >
                              {req.status === 'confirmed' ? 'Bestätigt' : 
                                req.status === 'assigned' ? 'Zugewiesen' : 
                                req.status === 'no_show' ? 'No-Show' :
                                req.status === 'completed' ? 'Erledigt' : 
                                req.status === 'pending' ? '⏳ Wartet auf Freigabe' :
                                req.status === 'approved' ? 'Freigegeben' :
                                req.status === 'sent' ? '✓ An Fahrer gesendet' :
                                req.status === 'rejected' ? 'Abgelehnt' : 'Offen'}
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
                            
                              // Pending-Status: Freigabe-Buttons anzeigen
                              if (req.status === 'pending') {
                                return (
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <Button 
                                      size="sm" 
                                      className="bg-green-600 hover:bg-green-700 text-white"
                                      onClick={() => handleApproveJob(req.id)}
                                      disabled={approvingJob === req.id}
                                    >
                                      {approvingJob === req.id ? '⏳ Freigabe...' : '✅ Freigeben & Senden'}
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="text-red-600 border-red-300 hover:bg-red-50 hover:text-red-700"
                                      onClick={() => handleRejectJob(req.id)}
                                      disabled={rejectingJob === req.id}
                                    >
                                      {rejectingJob === req.id ? '⏳...' : '❌ Ablehnen'}
                                    </Button>
                                    <TestSendJobButton jobId={req.id} />
                                  </div>
                                );
                              }

                              // Rejected-Status: Nur Info anzeigen
                              if (req.status === 'rejected') {
                                return (
                                  <div className="text-sm text-gray-500 italic">
                                    Abgelehnt – keine weitere Aktion möglich
                                  </div>
                                );
                              }

                              if (!a) {
                                return (
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <Button 
                                      size="sm" 
                                      onClick={() => handleAssignDriver(req.id)}
                                      disabled={req.status === 'completed' || req.status === 'pending'}
                                      title={req.status === 'completed' ? 'Erledigte Aufträge können nicht zugewiesen werden' : 
                                             req.status === 'pending' ? 'Erst freigeben, dann zuweisen' : 'Fahrer zuweisen'}
                                    >
                                      Zuweisen
                                    </Button>
                                    {req.status !== 'pending' && req.status !== 'completed' && (
                                      <Button
                                        size="sm"
                                        variant={req.sent_at ? "outline" : "default"}
                                        onClick={() => handleSendJobToAllDrivers(req.id)}
                                        disabled={sendingJobToAll === req.id}
                                        title={req.sent_at ? "Job erneut an alle verfügbaren Fahrer senden" : "Job prüfen und an alle Fahrer freigeben"}
                                        className={!req.sent_at ? "bg-green-600 hover:bg-green-700" : ""}
                                      >
                                        <Mail className="h-3 w-3 mr-1" />
                                        {sendingJobToAll === req.id ? 'Sende...' : (req.sent_at ? 'Erneut senden' : 'Freigeben & Senden')}
                                      </Button>
                                    )}
                                    {!req.customer_street && (
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleOpenContactDialog(req.id)}
                                        className="text-orange-600 border-orange-300 hover:bg-orange-50 hover:text-orange-700"
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
                      </TableRow>,
                      /* Erweiterte Details Row */
                      expandedJobRows.has(req.id) ? (
                        <TableRow key={`${req.id}-exp`}>
                          <TableCell colSpan={7} className="bg-muted/50 p-4 space-y-4">
                            {/* Nachricht und Besonderheiten */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {req.nachricht && (
                                <div className="bg-white p-3 rounded border">
                                  <span className="text-sm font-semibold text-gray-700 block mb-1">📝 Nachricht des Auftraggebers:</span>
                                  <p className="text-sm text-gray-900 whitespace-pre-wrap">{req.nachricht}</p>
                                </div>
                              )}
                              {req.besonderheiten && (
                                <div className="bg-white p-3 rounded border">
                                  <span className="text-sm font-semibold text-gray-700 block mb-1">⚠️ Besonderheiten:</span>
                                  <p className="text-sm text-gray-900 whitespace-pre-wrap">{req.besonderheiten}</p>
                                </div>
                              )}
                              {req.einsatzort && (
                                <div className="bg-white p-3 rounded border">
                                  <span className="text-sm font-semibold text-gray-700 block mb-1">📍 Einsatzort:</span>
                                  <p className="text-sm text-gray-900">{req.einsatzort}</p>
                                </div>
                              )}
                            </div>
                            {!req.nachricht && !req.besonderheiten && !req.einsatzort && (
                              <p className="text-sm text-gray-500 italic">Keine weiteren Details vorhanden.</p>
                            )}
                          </TableCell>
                        </TableRow>
                        ) : null,
                      ].filter(Boolean))}
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
                              <button
                                onClick={async () => {
                                  if (req.status === 'completed') {
                                    await handleMarkJobOpen(req.id);
                                  } else {
                                    await handleMarkJobCompleted(req.id);
                                  }
                                }}
                                disabled={isBeingProcessed}
                                className="relative w-5 h-5 rounded-full mt-1 transition-all duration-200 focus:outline-none disabled:opacity-50 flex-shrink-0"
                                style={{
                                  backgroundColor: req.status === 'completed' ? '#dc2626' : '#16a34a',
                                  boxShadow: req.status === 'completed' 
                                    ? '0 0 6px rgba(220, 38, 38, 0.5)' 
                                    : '0 0 6px rgba(22, 163, 74, 0.5)',
                                }}
                                title={req.status === 'completed' ? 'Klicken um wieder zu öffnen' : 'Klicken um als erledigt zu markieren'}
                              />
                              <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-base truncate">{req.customer_name}</h3>
                                {req.company && (
                                  <p className="text-sm text-gray-600 truncate">{req.company}</p>
                                )}
                                {req.einsatzort && (
                                  <p className="text-xs text-gray-400 truncate">📍 {req.einsatzort}</p>
                                )}
                              </div>
                            </div>
                            <div className="flex-shrink-0">
                              <Badge 
                                variant={
                                  req.status === 'completed' ? 'outline' :
                                  req.status === 'confirmed' ? 'default' :
                                  req.status === 'assigned' ? 'secondary' :
                                  req.status === 'sent' ? 'default' :
                                  req.status === 'approved' ? 'secondary' :
                                  req.status === 'rejected' ? 'destructive' :
                                  req.status === 'pending' ? 'outline' :
                                  req.status === 'no_show' ? 'destructive' : 'outline'
                                }
                                className={`text-xs ${
                                  req.status === 'pending' ? 'bg-yellow-100 text-yellow-800 border-yellow-300' :
                                  req.status === 'sent' ? 'bg-green-100 text-green-800 border-green-300' : ''
                                }`}
                              >
                                {req.status === 'confirmed' ? 'Bestätigt' : 
                                  req.status === 'assigned' ? 'Zugewiesen' : 
                                  req.status === 'no_show' ? 'No-Show' :
                                  req.status === 'completed' ? 'Erledigt' : 
                                  req.status === 'pending' ? '⏳ Wartet' :
                                  req.status === 'approved' ? 'Freigegeben' :
                                  req.status === 'sent' ? '✓ Gesendet' :
                                  req.status === 'rejected' ? 'Abgelehnt' : 'Offen'}
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

                          {/* Tarif (falls vorhanden) */}
                          {(req as any).tarif_label && (
                            <div className="text-xs bg-emerald-50 border border-emerald-200 rounded p-2">
                              <span className="font-medium text-emerald-800">Tarif:</span>{' '}
                              <span className="text-emerald-900">{(req as any).tarif_label}</span>
                            </div>
                          )}

                          {/* Anhänge */}
                          <JobAttachmentsList jobId={req.id} />

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
                          ) : req.status === 'pending' ? (
                            /* Pending: Freigabe-Buttons für Mobile */
                            <div className="space-y-2">
                              <Button 
                                size="sm" 
                                className="w-full h-11 bg-green-600 hover:bg-green-700 text-white"
                                onClick={() => handleApproveJob(req.id)}
                                disabled={approvingJob === req.id}
                              >
                                {approvingJob === req.id ? '⏳ Freigabe...' : '✅ Freigeben & an Fahrer senden'}
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="w-full h-11 text-red-600 border-red-300 hover:bg-red-50 hover:text-red-700"
                                onClick={() => handleRejectJob(req.id)}
                                disabled={rejectingJob === req.id}
                              >
                                {rejectingJob === req.id ? '⏳...' : '❌ Ablehnen'}
                              </Button>
                              <TestSendJobButton jobId={req.id} className="w-full h-11" />
                            </div>
                          ) : req.status === 'rejected' ? (
                            <div className="text-sm text-gray-500 italic text-center py-2">
                              Abgelehnt – keine weitere Aktion möglich
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <Button 
                                size="sm" 
                                onClick={() => handleAssignDriver(req.id)}
                                disabled={req.status === 'completed' || req.status === 'pending'}
                                className="w-full h-11"
                              >
                                👤 Fahrer zuweisen
                              </Button>
                              {req.status !== 'pending' && req.status !== 'completed' && (
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    variant={req.sent_at ? "outline" : "default"}
                                    onClick={() => handleSendJobToAllDrivers(req.id)}
                                    disabled={sendingJobToAll === req.id}
                                    className={`flex-1 h-11 ${!req.sent_at ? "bg-green-600 hover:bg-green-700" : ""}`}
                                  >
                                    <Mail className="h-4 w-4 mr-1" />
                                    {sendingJobToAll === req.id ? 'Sende...' : (req.sent_at ? 'Erneut senden' : 'Freigeben & Senden')}
                                  </Button>
                                  {!req.customer_street && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleOpenContactDialog(req.id)}
                                      className="flex-1 text-orange-600 border-orange-300 hover:bg-orange-50 hover:text-orange-700 h-11"
                                    >
                                      <Edit className="h-4 w-4 mr-1" />
                                      Adresse
                                    </Button>
                                  )}
                                </div>
                              )}
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
                            <span>Details anzeigen</span>
                            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                          </Button>

                          {/* Erweiterte Details */}
                          {isExpanded && (
                            <div className="space-y-3">
                              {/* Nachricht und Besonderheiten */}
                              {req.nachricht && (
                                <div className="bg-white p-3 rounded border">
                                  <span className="text-sm font-semibold text-gray-700 block mb-1">📝 Nachricht:</span>
                                  <p className="text-sm text-gray-900 whitespace-pre-wrap">{req.nachricht}</p>
                                </div>
                              )}
                              {req.besonderheiten && (
                                <div className="bg-white p-3 rounded border">
                                  <span className="text-sm font-semibold text-gray-700 block mb-1">⚠️ Besonderheiten:</span>
                                  <p className="text-sm text-gray-900 whitespace-pre-wrap">{req.besonderheiten}</p>
                                </div>
                              )}
                              {req.einsatzort && (
                                <div className="bg-white p-3 rounded border">
                                  <span className="text-sm font-semibold text-gray-700 block mb-1">📍 Einsatzort:</span>
                                  <p className="text-sm text-gray-900">{req.einsatzort}</p>
                                </div>
                              )}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Registrierte Fahrer Section - jetzt unter Fahreranfragen */}
        <Card className="mt-6 md:mt-8">
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
                  Fahrer-Rundschreiben
                </Button>
                <Button 
                  onClick={() => setCustomerNewsletterDialogOpen(true)}
                  variant="default"
                  size="sm"
                  className="bg-green-600 hover:bg-green-700 flex-1 md:flex-none"
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Kunden-CSV-Newsletter
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
              <div>
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
                      {sortedFahrer.flatMap((f) => [
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
                             <div className="flex flex-col gap-2">
                               {/* Status-Bereich: kleine, nicht-klickbare Labels */}
                               <div className="flex items-center gap-1.5 flex-wrap">
                                 <span className="text-[10px] uppercase tracking-wide text-muted-foreground mr-1">Status:</span>
                                 {f.is_blocked && (
                                   <Badge
                                     variant="destructive"
                                     className="bg-red-600 text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 pointer-events-none"
                                   >
                                     🚫 Gesperrt
                                   </Badge>
                                 )}
                                 {!f.is_blocked && f.is_inactive && (
                                   <Badge
                                     variant="outline"
                                     className="border-amber-500 text-amber-800 bg-amber-50 text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 pointer-events-none"
                                     title={f.inactive_reason ? `Grund: ${f.inactive_reason}` : "Vorübergehend deaktiviert"}
                                   >
                                     ⏸ Vorübergehend deaktiviert
                                   </Badge>
                                 )}
                                 {!f.is_blocked && !f.is_inactive && f.email_opt_out && (
                                   <Badge
                                     variant="outline"
                                     className="border-orange-500 text-orange-700 bg-orange-50 text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 pointer-events-none"
                                     title={f.unsubscribed_at ? `Abgemeldet am ${new Date(f.unsubscribed_at).toLocaleString('de-DE')}` : 'Abgemeldet'}
                                   >
                                     📭 Abgemeldet
                                   </Badge>
                                 )}
                                  {!f.is_blocked && !f.is_inactive && !f.email_opt_out && !f.unsubscribed_at &&
                                   getStatusBadge(f.status, f.id, f.status === 'pending' ? () => handleApproveDriver(f.id) : undefined)}
                               </div>

                               {/* Aktionen-Bereich: deutlich abgesetzte Buttons */}
                               <div className="flex items-center gap-2 flex-wrap pt-1.5 border-t border-dashed border-gray-200">
                                 <span className="text-[10px] uppercase tracking-wide text-muted-foreground mr-1">Aktionen:</span>
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
                                   className="text-orange-600 border-orange-300 hover:bg-orange-50 hover:text-orange-700"
                                   onClick={() => handleResetDriverStatus(f.id, `${f.vorname} ${f.nachname}`)}
                                 >
                                   ↻ Zurücksetzen
                                 </Button>
                               )}
                               <Button
                                 size="sm"
                                 variant={f.is_blocked ? "outline" : "outline"}
                                  className={f.is_blocked
                                    ? "text-xs h-8 border-2 border-green-600 text-green-700 hover:bg-green-50 hover:text-green-700 font-medium shadow-sm"
                                    : "text-xs h-8 border-2 border-red-600 text-red-700 hover:bg-red-50 hover:text-red-700 font-medium shadow-sm"}
                                 onClick={() => toggleBlockDriver(f.id, f.is_blocked || false, `${f.vorname} ${f.nachname}`)}
                               >
                                 {f.is_blocked ? '🔓 Entsperren' : '🚫 Sperren'}
                               </Button>
                                {f.is_inactive ? (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-xs h-8 border-2 border-amber-600 text-amber-800 hover:bg-amber-50 hover:text-amber-800 font-medium shadow-sm"
                                    onClick={() => reactivateDriver(f.id, `${f.vorname} ${f.nachname}`)}
                                    disabled={reactivatingDriver === f.id}
                                  >
                                    {reactivatingDriver === f.id ? "↻ Läuft..." : "▶ Wieder aktivieren"}
                                  </Button>
                                ) : (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-xs h-8 border-2 border-amber-500 text-amber-700 hover:bg-amber-50 hover:text-amber-800 font-medium shadow-sm"
                                    onClick={() => openInactiveDialog(f.id, `${f.vorname} ${f.nachname}`, f.email)}
                                    disabled={f.is_blocked}
                                    title={f.is_blocked ? "Fahrer ist gesperrt – Sperre zuerst aufheben" : "Vorübergehend deaktivieren"}
                                  >
                                    ⏸ Vorübergehend deaktivieren
                                  </Button>
                                )}
                               {f.email_opt_out && (
                                 <Button
                                   size="sm"
                                   variant="outline"
                                    className="text-xs h-8 border-2 border-orange-500 text-orange-700 hover:bg-orange-50 hover:text-orange-700 font-medium shadow-sm"
                                   onClick={() => reactivateDriverEmails(f.id, `${f.vorname} ${f.nachname}`)}
                                 >
                                   📬 Auftragsmails wieder aktivieren
                                 </Button>
                               )}
                                <Button
                                  size="sm"
                                  variant="outline"
                                   className="text-xs h-8 border-2 border-blue-600 text-blue-700 hover:bg-blue-50 hover:text-blue-700 font-medium shadow-sm"
                                  onClick={() => toggleRow(f.id, f.email)}
                                >
                                  {expandedRows.has(f.id) ? <ChevronUp className="h-3 w-3 mr-1" /> : <ChevronDown className="h-3 w-3 mr-1" />}
                                  📎 Dokumente{typeof documentCounts[f.id] === 'number' ? ` (${documentCounts[f.id]})` : ''}
                                </Button>
                               </div>
                             </div>
                          </TableCell>
                        </TableRow>,
                        expandedRows.has(f.id) ? (
                          <TableRow key={`${f.id}-docs`} className="bg-muted/30">
                            <TableCell colSpan={5}>
                              {renderDriverDocuments(f.id)}
                            </TableCell>
                          </TableRow>
                        ) : null,
                      ].filter(Boolean))}
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
                            <div className="flex-shrink-0 flex gap-1 flex-wrap justify-end">
                              {f.is_blocked && (
                                <Badge
                                  variant="destructive"
                                  className="bg-red-600 text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 pointer-events-none"
                                >
                                  🚫 Gesperrt
                                </Badge>
                              )}
                              {!f.is_blocked && f.is_inactive && (
                                <Badge
                                  variant="outline"
                                  className="border-amber-500 text-amber-800 bg-amber-50 text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 pointer-events-none"
                                  title={f.inactive_reason ? `Grund: ${f.inactive_reason}` : "Vorübergehend deaktiviert"}
                                >
                                  ⏸ Vorübergehend deaktiviert
                                </Badge>
                              )}
                              {!f.is_blocked && !f.is_inactive && f.email_opt_out && (
                                <Badge
                                  variant="outline"
                                  className="border-orange-500 text-orange-700 bg-orange-50 text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 pointer-events-none"
                                  title={f.unsubscribed_at ? `Abgemeldet am ${new Date(f.unsubscribed_at).toLocaleString('de-DE')}` : 'Abgemeldet'}
                                >
                                  📭 Abgemeldet
                                </Badge>
                              )}
                              {!f.is_blocked && !f.is_inactive && !f.email_opt_out && !f.unsubscribed_at &&
                                getStatusBadge(f.status, f.id, f.status === 'pending' ? () => handleApproveDriver(f.id) : undefined)}
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

                          <div className="flex gap-2 pt-2 mt-1 flex-wrap border-t border-dashed border-gray-200">
                            <span className="w-full text-[10px] uppercase tracking-wide text-muted-foreground">Aktionen</span>
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
                                className="text-orange-600 border-orange-300 hover:bg-orange-50 hover:text-orange-700 flex-1"
                                onClick={() => handleResetDriverStatus(f.id, `${f.vorname} ${f.nachname}`)}
                              >
                                ↻ Zurücksetzen
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant={f.is_blocked ? "outline" : "outline"}
                              className={f.is_blocked
                                ? "text-xs h-8 border-2 border-green-600 text-green-700 hover:bg-green-50 hover:text-green-700 font-medium shadow-sm flex-1"
                                : "text-xs h-8 border-2 border-red-600 text-red-700 hover:bg-red-50 hover:text-red-700 font-medium shadow-sm flex-1"}
                              onClick={() => toggleBlockDriver(f.id, f.is_blocked || false, `${f.vorname} ${f.nachname}`)}
                            >
                              {f.is_blocked ? '🔓 Entsperren' : '🚫 Sperren'}
                            </Button>
                            {f.is_inactive ? (
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-xs h-8 border-2 border-amber-600 text-amber-800 hover:bg-amber-50 hover:text-amber-800 font-medium shadow-sm flex-1"
                                onClick={() => reactivateDriver(f.id, `${f.vorname} ${f.nachname}`)}
                                disabled={reactivatingDriver === f.id}
                              >
                                {reactivatingDriver === f.id ? "↻ Läuft..." : "▶ Wieder aktivieren"}
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-xs h-8 border-2 border-amber-500 text-amber-700 hover:bg-amber-50 hover:text-amber-800 font-medium shadow-sm flex-1"
                                onClick={() => openInactiveDialog(f.id, `${f.vorname} ${f.nachname}`, f.email)}
                                disabled={f.is_blocked}
                              >
                                ⏸ Deaktivieren
                              </Button>
                            )}
                            {f.email_opt_out && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-xs h-8 border-2 border-orange-500 text-orange-700 hover:bg-orange-50 hover:text-orange-700 font-medium shadow-sm flex-1"
                                onClick={() => reactivateDriverEmails(f.id, `${f.vorname} ${f.nachname}`)}
                              >
                                📬 Mails reaktivieren
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-xs h-8 border-2 border-blue-600 text-blue-700 hover:bg-blue-50 hover:text-blue-700 font-medium shadow-sm flex-1"
                              onClick={() => toggleRow(f.id, f.email)}
                            >
                              {expandedRows.has(f.id) ? <ChevronUp className="h-3 w-3 mr-1" /> : <ChevronDown className="h-3 w-3 mr-1" />}
                              📎 Dokumente{typeof documentCounts[f.id] === 'number' ? ` (${documentCounts[f.id]})` : ''}
                            </Button>
                          </div>
                          {expandedRows.has(f.id) && (
                            <div className="mt-2 pt-2 border-t">
                              {renderDriverDocuments(f.id)}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Preview Dialog */}
      <Dialog open={!!previewDoc} onOpenChange={() => setPreviewDoc(null)}>
        <DialogContent className="max-w-[90vw] w-[90vw] h-[90vh] max-h-[90vh] flex flex-col p-0 overflow-hidden border-0 sm:rounded-lg">
          <DialogHeader className="px-6 pt-6 pb-2 shrink-0">
            <DialogTitle className="pr-8 break-all">{previewDoc?.filename}</DialogTitle>
          </DialogHeader>
          {previewDoc && (
            <div className="flex-1 overflow-hidden flex items-center justify-center min-h-0 px-6 pb-6">
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
                  className="max-w-full max-h-[calc(90vh-120px)] object-contain"
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
                       <Button
                         size="sm"
                         variant="outline"
                         onClick={() => cancelAssignment(assignment.id)}
                         className="flex items-center gap-1 h-10 w-full md:w-auto"
                       >
                         <X className="h-4 w-4" />
                         Zuweisung auflösen
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
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => cancelAssignment(assignment.id)}
                        className="flex items-center gap-1 h-10 w-full md:w-auto"
                      >
                        <X className="h-4 w-4" />
                        Zuweisung auflösen
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

      {/* Customer Newsletter Dialog (CSV Upload) */}
      <CustomerNewsletterDialog
        open={customerNewsletterDialogOpen}
        onOpenChange={setCustomerNewsletterDialogOpen}
      />

      {/* Performance Monitor */}
      <PerformanceMonitor />

      {/* Vorübergehend deaktivieren Dialog */}
      <Dialog open={inactiveDialogOpen} onOpenChange={(o) => { if (!inactiveSubmitting) setInactiveDialogOpen(o); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Fahrer vorübergehend deaktivieren</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {inactiveDriver && (
              <div className="text-sm bg-muted/40 rounded p-2">
                <div className="font-semibold">{inactiveDriver.name}</div>
                <div className="text-muted-foreground text-xs">{inactiveDriver.email}</div>
              </div>
            )}

            <div className="text-xs bg-amber-50 border border-amber-200 text-amber-900 rounded p-2">
              Der Fahrer wird vorübergehend auf nicht aktiv gesetzt. Das ist keine endgültige Sperre.
            </div>

            <div className="space-y-2">
              <Label>Grund (Pflichtfeld)</Label>
              <Select value={inactiveReasonCode} onValueChange={setInactiveReasonCode}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {INACTIVE_REASONS.map(r => (
                    <SelectItem key={r.code} value={r.code}>{r.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Begründung (optional, erscheint in der Mail)</Label>
              <Textarea
                value={inactiveReasonText}
                onChange={(e) => setInactiveReasonText(e.target.value)}
                rows={3}
                placeholder="Z. B. ‚Bitte aktualisierten Führerschein nachreichen.'"
              />
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="inactive-notify"
                checked={inactiveNotify}
                onCheckedChange={(v) => setInactiveNotify(v === true)}
              />
              <Label htmlFor="inactive-notify" className="text-sm font-normal cursor-pointer">
                Fahrer per E-Mail informieren (sachliche Mitteilung)
              </Label>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setInactiveDialogOpen(false)} disabled={inactiveSubmitting}>
                Abbrechen
              </Button>
              <Button
                className="bg-amber-600 hover:bg-amber-700 text-white"
                onClick={submitDeactivate}
                disabled={inactiveSubmitting}
              >
                {inactiveSubmitting ? "Wird gesetzt..." : "⏸ Vorübergehend deaktivieren"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Admin;