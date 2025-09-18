import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useSEO } from "@/hooks/useSEO";
import { User } from "@supabase/supabase-js";
import { Badge } from "@/components/ui/badge";
import { AdminAssignmentDialog } from "@/components/AdminAssignmentDialog";
import { NoShowDialog } from "@/components/NoShowDialog";
import { ContactDataDialog } from "@/components/ContactDataDialog";

const ADMIN_EMAIL = "guenter.killer@t-online.de";

interface FahrerProfile {
  id: string;
  vorname: string;
  nachname: string;
  email: string;
  telefon: string;
  status: string;
}

interface JobRequest {
  id: string;
  customer_name: string;
  customer_email: string;
  nachricht: string;
  status: string;
  created_at: string;
}

interface JobAssignment {
  id: string;
  job_id: string;
  driver_id: string;
  status: string;
  rate_value: number;
  job_requests?: JobRequest;
  fahrer_profile?: FahrerProfile;
}

const AdminClean = () => {
  useSEO({
    title: "Admin Dashboard | Fahrerexpress",
    description: "Dashboard für die Administration von Fahreranfragen.",
    noindex: true,
  });

  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [fahrer, setFahrer] = useState<FahrerProfile[]>([]);
  const [jobRequests, setJobRequests] = useState<JobRequest[]>([]);
  const [jobAssignments, setJobAssignments] = useState<JobAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [assignmentDialogOpen, setAssignmentDialogOpen] = useState(false);
  const [noShowDialogOpen, setNoShowDialogOpen] = useState(false);
  const [contactDialogOpen, setContactDialogOpen] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/admin/login');
        return;
      }

      const { data: isAdmin, error } = await supabase.rpc('is_admin_user');
      if (!isAdmin || error) {
        await supabase.auth.signOut();
        navigate('/admin/login');
        return;
      }

      setUser(session.user);
      await loadAllData();
    } catch (error) {
      console.error('Auth check failed:', error);
      navigate('/admin/login');
    } finally {
      setLoading(false);
    }
  };

  const loadAllData = async () => {
    await Promise.all([
      loadFahrerData(),
      loadJobRequests(),
      loadJobAssignments()
    ]);
  };

  const loadFahrerData = async () => {
    try {
      const { data, error } = await supabase
        .from('fahrer_profile')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFahrer(data || []);
    } catch (error) {
      console.error('Error loading fahrer data:', error);
      toast({
        title: "Fehler beim Laden der Fahrer",
        description: "Bitte versuchen Sie es erneut.",
        variant: "destructive"
      });
    }
  };

  const loadJobRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('job_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setJobRequests(data || []);
    } catch (error) {
      console.error('Error loading job requests:', error);
      toast({
        title: "Fehler beim Laden der Aufträge",
        description: "Bitte versuchen Sie es erneut.",
        variant: "destructive"
      });
    }
  };

  const loadJobAssignments = async () => {
    try {
      const { data, error } = await supabase
        .from('job_assignments')
        .select(`
          *,
          job_requests(*),
          fahrer_profile(*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setJobAssignments(data || []);
    } catch (error) {
      console.error('Error loading job assignments:', error);
      toast({
        title: "Fehler beim Laden der Zuweisungen",
        description: "Bitte versuchen Sie es erneut.",
        variant: "destructive"
      });
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setFahrer([]);
      setJobRequests([]);
      setJobAssignments([]);
      toast({ title: "Erfolgreich abgemeldet" });
      navigate('/admin/login');
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        title: "Abmeldefehler",
        description: "Fehler beim Abmelden",
        variant: "destructive"
      });
    }
  };

  const handleJobAssign = (jobId: string) => {
    setSelectedJobId(jobId);
    setAssignmentDialogOpen(true);
  };

  const handleNoShow = (assignmentId: string) => {
    setSelectedAssignmentId(assignmentId);
    setNoShowDialogOpen(true);
  };

  const handleContactEdit = (jobId: string) => {
    setSelectedJobId(jobId);
    setContactDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4">Lade Admin-Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <Button onClick={handleLogout} variant="outline">
            Abmelden
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Fahrer Section */}
          <Card>
            <CardHeader>
              <CardTitle>Fahrer ({fahrer.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {fahrer.map((f) => (
                  <div key={f.id} className="flex justify-between items-center p-2 border rounded">
                    <div>
                      <p className="font-medium">{f.vorname} {f.nachname}</p>
                      <p className="text-sm text-gray-600">{f.email}</p>
                    </div>
                    <Badge variant={f.status === 'approved' ? 'default' : 'secondary'}>
                      {f.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Job Requests Section */}
          <Card>
            <CardHeader>
              <CardTitle>Aufträge ({jobRequests.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {jobRequests.map((job) => (
                  <div key={job.id} className="p-2 border rounded">
                    <div className="flex justify-between items-start mb-2">
                      <p className="font-medium">{job.customer_name}</p>
                      <Badge variant={job.status === 'open' ? 'default' : 'secondary'}>
                        {job.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{job.customer_email}</p>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleJobAssign(job.id)}
                        disabled={job.status !== 'open'}
                      >
                        Zuweisen
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleContactEdit(job.id)}
                      >
                        Bearbeiten
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Job Assignments Section */}
          <Card>
            <CardHeader>
              <CardTitle>Zuweisungen ({jobAssignments.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {jobAssignments.map((assignment) => (
                  <div key={assignment.id} className="p-2 border rounded">
                    <div className="flex justify-between items-start mb-2">
                      <p className="font-medium">
                        {assignment.fahrer_profile?.vorname} {assignment.fahrer_profile?.nachname}
                      </p>
                      <Badge variant={assignment.status === 'confirmed' ? 'default' : 'secondary'}>
                        {assignment.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">
                      {assignment.job_requests?.customer_name}
                    </p>
                    <p className="text-sm font-medium">{assignment.rate_value}€</p>
                    {assignment.status !== 'no_show' && (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleNoShow(assignment.id)}
                        className="mt-2"
                      >
                        No-Show
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Dialogs */}
      <AdminAssignmentDialog
        open={assignmentDialogOpen}
        onClose={() => {
          setAssignmentDialogOpen(false);
          setSelectedJobId(null);
        }}
        jobId={selectedJobId}
        onAssignmentComplete={loadAllData}
      />

      <ContactDataDialog
        open={contactDialogOpen}
        onClose={() => {
          setContactDialogOpen(false);
          setSelectedJobId(null);
        }}
        jobId={selectedJobId!}
        onDataUpdated={loadAllData}
      />
    </div>
  );
};

export default AdminClean;