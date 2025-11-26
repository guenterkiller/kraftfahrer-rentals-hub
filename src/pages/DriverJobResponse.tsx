import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import JobAcceptanceDialog from '@/components/JobAcceptanceDialog';
import { useSEO } from '@/hooks/useSEO';

const DriverJobResponse = () => {
  useSEO({
    title: "Auftrag beantworten | Fahrerexpress",
    description: "Bestätigen oder ablehnen Sie Ihren Fahrerauftrag",
    noindex: true
  });

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [job, setJob] = useState<any>(null);
  const [driver, setDriver] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  const jobId = searchParams.get('job');
  const driverId = searchParams.get('driver');
  const action = searchParams.get('action') as 'accept' | 'decline';
  const billingModel = searchParams.get('billing') as 'direct' | 'agency';

  useEffect(() => {
    if (!jobId || !driverId) {
      setResult({ type: 'error', message: 'Ungültige Parameter' });
      setLoading(false);
      return;
    }

    loadJobAndDriver();
  }, [jobId, driverId]);

  const loadJobAndDriver = async () => {
    try {
      // Load job details
      const { data: jobData, error: jobError } = await supabase
        .from('job_requests')
        .select('*')
        .eq('id', jobId)
        .single();

      if (jobError || !jobData) {
        setResult({ type: 'error', message: 'Auftrag nicht gefunden' });
        setLoading(false);
        return;
      }

      // Load driver details  
      const { data: driverData, error: driverError } = await supabase
        .from('fahrer_profile')
        .select('*')
        .eq('id', driverId)
        .single();

      if (driverError || !driverData) {
        setResult({ type: 'error', message: 'Fahrer nicht gefunden' });
        setLoading(false);
        return;
      }

      setJob(jobData);
      setDriver(driverData);

      // Auto-handle if action and billing model are provided (from email links)
      if (action && (action === 'decline' || billingModel)) {
        await handleAutoAction(jobData, driverData);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      setResult({ type: 'error', message: 'Fehler beim Laden der Daten' });
    } finally {
      setLoading(false);
    }
  };

  const handleAutoAction = async (jobData: any, driverData: any) => {
    setSubmitting(true);
    
    try {
      const response = await fetch(`https://hxnabnsoffzevqhruvar.supabase.co/functions/v1/driver-accept-job`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jobId: jobData.id,
          driverId: driverData.id,
          action: action,
          termsAccepted: true, // Email links imply consent
          ip: 'email-link',
          userAgent: navigator.userAgent
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setResult({
          type: 'success',
          message: action === 'accept' 
            ? 'Auftrag erfolgreich angenommen! (Agenturabrechnung)'
            : 'Auftrag erfolgreich abgelehnt!'
        });
      } else {
        setResult({
          type: 'error',
          message: data.error || 'Fehler bei der Verarbeitung'
        });
      }
    } catch (error) {
      console.error('Error processing action:', error);
      setResult({
        type: 'error',
        message: 'Netzwerkfehler bei der Verarbeitung'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleAccept = async (jobId: string, termsAccepted: boolean) => {
    setSubmitting(true);
    
    try {
      const response = await fetch(`https://hxnabnsoffzevqhruvar.supabase.co/functions/v1/driver-accept-job`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jobId,
          driverId: driver.id,
          action: 'accept',
          termsAccepted,
          ip: 'manual',
          userAgent: navigator.userAgent
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setResult({
          type: 'success',
          message: 'Auftrag erfolgreich angenommen! (Agenturabrechnung)'
        });
      } else {
        setResult({
          type: 'error',
          message: data.error || 'Fehler bei der Annahme'
        });
      }
    } catch (error) {
      console.error('Error accepting job:', error);
      setResult({
        type: 'error',
        message: 'Netzwerkfehler bei der Annahme'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDecline = async (jobId: string) => {
    setSubmitting(true);
    
    try {
      const response = await fetch(`https://hxnabnsoffzevqhruvar.supabase.co/functions/v1/driver-accept-job`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jobId,
          driverId: driver.id,
          action: 'decline',
          ip: 'manual',
          userAgent: navigator.userAgent
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setResult({
          type: 'success',
          message: 'Auftrag erfolgreich abgelehnt!'
        });
      } else {
        setResult({
          type: 'error',
          message: data.error || 'Fehler bei der Ablehnung'
        });
      }
    } catch (error) {
      console.error('Error declining job:', error);
      setResult({
        type: 'error',
        message: 'Netzwerkfehler bei der Ablehnung'
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Lade Auftragsdaten...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (submitting) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Verarbeitung läuft...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (result) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {result.type === 'success' ? (
                <CheckCircle className="h-6 w-6 text-green-600" />
              ) : (
                <XCircle className="h-6 w-6 text-red-600" />
              )}
              {result.type === 'success' ? 'Erfolgreich!' : 'Fehler'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Alert className={result.type === 'success' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
              <AlertDescription>
                {result.message}
              </AlertDescription>
            </Alert>
            
            <div className="mt-6 text-center">
              <Button onClick={() => navigate('/')} variant="outline">
                Zur Startseite
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!job || !driver) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p>Auftrag oder Fahrer nicht gefunden</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Fahrerauftrag beantworten
          </h1>
          <p className="text-gray-600">
            Hallo {driver.vorname} {driver.nachname}, bitte prüfen Sie den Auftrag und treffen Sie Ihre Entscheidung.
          </p>
        </div>

        <JobAcceptanceDialog
          job={job}
          driverId={driver.id}
          onAccept={handleAccept}
          onDecline={handleDecline}
        />
      </div>
    </div>
  );
};

export default DriverJobResponse;