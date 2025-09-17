import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import Navigation from "@/components/Navigation";
import { CheckCircle, XCircle, Clock, MapPin, User, Car, Euro } from "lucide-react";
import { useSEO } from "@/hooks/useSEO";

interface JobAssignment {
  id: string;
  status: string;
  rate_value: number;
  rate_type: string;
  job_requests: {
    id: string;
    customer_name: string;
    fahrzeugtyp: string;
    einsatzort: string;
    zeitraum: string;
    fuehrerscheinklasse: string;
    besonderheiten?: string;
    status: string;
  };
  fahrer_profile: {
    vorname: string;
    nachname: string;
    email: string;
    telefon: string;
  };
}

const JobResponse = () => {
  const { assignmentId } = useParams();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const { toast } = useToast();

  const [assignment, setAssignment] = useState<JobAssignment | null>(null);
  const [loading, setLoading] = useState(true);
  const [responding, setResponding] = useState(false);

  useSEO({
    title: "Auftragsannahme | Fahrerexpress",
    description: "Annahme oder Ablehnung eines vermittelten Auftrags.",
    noindex: true
  });

  useEffect(() => {
    if (assignmentId) {
      fetchAssignment();
    }
  }, [assignmentId]);

  const fetchAssignment = async () => {
    try {
      const { data, error } = await supabase
        .from('job_assignments')
        .select(`
          *,
          job_requests!inner(*),
          fahrer_profile!inner(*)
        `)
        .eq('id', assignmentId)
        .eq('status', 'assigned')
        .single();

      if (error || !data) {
        throw new Error('Auftrag nicht gefunden oder bereits bearbeitet.');
      }

      setAssignment(data);
    } catch (error) {
      console.error('Error fetching assignment:', error);
      toast({
        title: "Fehler",
        description: error.message || "Auftrag konnte nicht geladen werden.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResponse = async (response: 'accepted' | 'declined') => {
    if (!assignment) return;

    setResponding(true);

    try {
      // Update assignment status
      const { error: updateError } = await supabase
        .from('job_assignments')
        .update({
          status: response,
          [response === 'accepted' ? 'accepted_at' : 'declined_at']: new Date().toISOString()
        })
        .eq('id', assignmentId);

      if (updateError) throw updateError;

      // If accepted, trigger order confirmation
      if (response === 'accepted') {
        console.log('🎯 Triggering order confirmation...');
        
        const { data: confirmationResult, error: confirmationError } = await supabase
          .functions
          .invoke('send-order-confirmation', {
            body: { assignmentId }
          });

        if (confirmationError) {
          console.error('❌ Order confirmation failed:', confirmationError);
          toast({
            title: "Auftrag angenommen",
            description: "Auftrag wurde angenommen, aber die Bestätigung konnte nicht versendet werden. Admin wurde benachrichtigt.",
            variant: "destructive",
          });
        } else {
          console.log('✅ Order confirmation sent:', confirmationResult);
          toast({
            title: "Auftrag angenommen",
            description: "Auftrag wurde erfolgreich angenommen und die Bestätigung an den Auftraggeber versendet.",
          });
        }
      } else {
        toast({
          title: "Auftrag abgelehnt",
          description: "Der Auftrag wurde abgelehnt. Der Admin wurde benachrichtigt.",
        });
      }

      // Update local state
      setAssignment(prev => prev ? { ...prev, status: response } : null);

    } catch (error) {
      console.error('Error updating assignment:', error);
      toast({
        title: "Fehler",
        description: "Antwort konnte nicht verarbeitet werden.",
        variant: "destructive",
      });
    } finally {
      setResponding(false);
    }
  };

  if (loading) {
    return (
      <div>
        <Navigation />
        <div className="min-h-screen bg-muted pt-20 flex items-center justify-center">
          <div className="text-center">Lade Auftragsdetails...</div>
        </div>
      </div>
    );
  }

  if (!assignment) {
    return (
      <div>
        <Navigation />
        <div className="min-h-screen bg-muted pt-20 flex items-center justify-center">
          <Card className="max-w-md">
            <CardContent className="pt-6 text-center">
              <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Auftrag nicht gefunden</h2>
              <p className="text-muted-foreground">
                Der angeforderte Auftrag wurde nicht gefunden oder ist bereits bearbeitet.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const job = assignment.job_requests;
  const driver = assignment.fahrer_profile;
  const isCompleted = assignment.status !== 'assigned';

  return (
    <div>
      <Navigation />
      <div className="min-h-screen bg-muted pt-20 pb-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Auftragsannahme</h1>
            <p className="text-muted-foreground">
              Prüfen Sie die Details und entscheiden Sie über die Annahme des Auftrags
            </p>
          </div>

          {isCompleted && (
            <Card className="mb-6">
              <CardContent className="pt-6 text-center">
                {assignment.status === 'accepted' ? (
                  <>
                    <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold mb-2 text-green-700">Auftrag angenommen</h2>
                    <p className="text-muted-foreground">
                      Sie haben diesen Auftrag bereits angenommen. Eine Bestätigung wurde an den Auftraggeber versendet.
                    </p>
                  </>
                ) : (
                  <>
                    <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold mb-2 text-red-700">Auftrag abgelehnt</h2>
                    <p className="text-muted-foreground">
                      Sie haben diesen Auftrag bereits abgelehnt.
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
          )}

          <div className="grid gap-6">
            {/* Job Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Car className="h-5 w-5" />
                  Auftragsdetails
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <div className="space-y-3">
                      <div>
                        <div className="text-sm font-medium text-muted-foreground">Auftraggeber</div>
                        <div className="font-medium">{job.customer_name}</div>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-muted-foreground">Fahrzeugtyp</div>
                        <div className="font-medium">{job.fahrzeugtyp}</div>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-muted-foreground">Führerscheinklasse</div>
                        <Badge variant="outline">{job.fuehrerscheinklasse}</Badge>
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="space-y-3">
                      <div>
                        <div className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          Einsatzort
                        </div>
                        <div className="font-medium">{job.einsatzort}</div>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          Zeitraum
                        </div>
                        <div className="font-medium">{job.zeitraum}</div>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                          <Euro className="h-4 w-4" />
                          Vergütung
                        </div>
                        <div className="font-medium text-primary">
                          {assignment.rate_value} €/{assignment.rate_type === 'hourly' ? 'Stunde' : assignment.rate_type === 'daily' ? 'Tag' : 'Woche'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {job.besonderheiten && (
                  <div className="mt-4 p-3 bg-muted rounded-lg">
                    <div className="text-sm font-medium text-muted-foreground mb-1">Besonderheiten</div>
                    <div>{job.besonderheiten}</div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Driver Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Ihre Kontaktdaten
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Name</div>
                    <div className="font-medium">{driver.vorname} {driver.nachname}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">E-Mail</div>
                    <div className="font-medium">{driver.email}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            {!isCompleted && (
              <Card>
                <CardHeader>
                  <CardTitle>Entscheidung</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-muted-foreground">
                      Möchten Sie diesen Auftrag annehmen? Bei Annahme wird automatisch eine 
                      Bestätigung an den Auftraggeber versendet.
                    </p>
                    
                    <div className="flex gap-4">
                      <Button
                        onClick={() => handleResponse('accepted')}
                        disabled={responding}
                        className="flex-1"
                        size="lg"
                      >
                        {responding ? 'Verarbeitung...' : 'Auftrag annehmen'}
                      </Button>
                      
                      <Button
                        variant="outline"
                        onClick={() => handleResponse('declined')}
                        disabled={responding}
                        className="flex-1"
                        size="lg"
                      >
                        {responding ? 'Verarbeitung...' : 'Auftrag ablehnen'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Terms */}
            <Card>
              <CardHeader>
                <CardTitle>Vermittlungs- und Provisionsbedingungen</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-3">
                <p className="font-medium">
                  Mit der Annahme bestätigen Sie die Kenntnisnahme folgender Bedingungen:
                </p>
                
                <div className="space-y-2">
                  <p><strong>1. Provisionspflicht:</strong> 15% des Nettohonorars an Fahrerexpress-Agentur</p>
                  <p><strong>2. Folgeaufträge:</strong> Provisionspflicht gilt auch für direkte Folgeaufträge</p>
                  <p><strong>3. Informationspflicht:</strong> Direktanfragen unverzüglich melden</p>
                  <p><strong>4. Vertragsstrafe:</strong> 2.500,00 € bei Verstoß gegen die Meldepflicht</p>
                </div>
                
                <p className="text-xs text-muted-foreground">
                  Vollständige Bedingungen siehe kraftfahrer-mieten.com/vermittlung
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobResponse;