import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { de } from 'date-fns/locale';

interface EmailLog {
  id: string;
  recipient: string;
  subject: string;
  status: string;
  template: string;
  created_at: string;
  sent_at: string | null;
  error_message: string | null;
  message_id: string | null;
  job_id: string | null;
  assignment_id: string | null;
}

export function EmailLogView() {
  const [emailLogs, setEmailLogs] = useState<EmailLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const { toast } = useToast();

  useEffect(() => {
    loadEmailLogs();
  }, []);

  const loadEmailLogs = async () => {
    setLoading(true);
    try {
      const adminSession = localStorage.getItem('adminSession');
      if (!adminSession) {
        throw new Error('No admin session found');
      }
      
      const session = JSON.parse(adminSession);
      
      const { data, error } = await supabase.functions.invoke('admin-data-fetch', {
        body: {
          email: session.email,
          dataType: 'emails'
        }
      });

      if (error) throw error;

      // Nur die ersten 100 E-Mails anzeigen
      const allEmails = data?.data || [];
      setEmailLogs(allEmails.slice(0, 100));
      setCurrentPage(1); // Reset to first page on reload
    } catch (error) {
      console.error('Error loading email logs:', error);
      toast({
        title: "Fehler beim Laden der E-Mail-Logs",
        description: "Die E-Mail-Logs konnten nicht geladen werden.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'sent':
        return <Badge variant="default" className="bg-green-500 text-xs py-0">✓</Badge>;
      case 'failed':
        return <Badge variant="destructive" className="text-xs py-0">✗</Badge>;
      case 'pending':
        return <Badge variant="outline" className="text-xs py-0">...</Badge>;
      default:
        return <Badge variant="secondary" className="text-xs py-0">{status}</Badge>;
    }
  };

  const getTemplateName = (template: string) => {
    switch (template) {
      case 'driver_confirmation':
        return 'Fahrer-Bestätigung';
      case 'driver_approval_with_jobs':
        return 'Fahrer-Freischaltung';
      case 'job_alert':
        return 'Job-Alarm';
      case 'job-broadcast':
        return 'Job-Rundschreiben';
      case 'no_show_notice':
        return 'No-Show-Mitteilung';
      case 'fahrer_anfrage':
        return 'Fahrer-Anfrage';
      case 'newsletter':
        return 'Newsletter';
      default:
        return template;
    }
  };

  const formatDate = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), { 
      addSuffix: true, 
      locale: de 
    });
  };

  // Calculate pagination
  const totalPages = Math.ceil(emailLogs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentLogs = emailLogs.slice(startIndex, endIndex);

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>E-Mail-Logs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">Lade E-Mail-Logs...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between py-3">
        <CardTitle className="text-base">E-Mail-Logs ({emailLogs.length})</CardTitle>
        <Button 
          variant="outline" 
          size="sm"
          onClick={loadEmailLogs}
          disabled={loading}
        >
          {loading ? 'Lädt...' : 'Aktualisieren'}
        </Button>
      </CardHeader>
      <CardContent>
        {emailLogs.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            Keine E-Mail-Logs gefunden.
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="text-xs">
                    <TableHead className="py-2">Empfänger</TableHead>
                    <TableHead className="py-2">Template</TableHead>
                    <TableHead className="py-2">Status</TableHead>
                    <TableHead className="py-2">Gesendet</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentLogs.map((log) => (
                    <TableRow key={log.id} className="text-xs">
                      <TableCell className="font-mono text-xs py-2">
                        {log.recipient}
                      </TableCell>
                      <TableCell className="py-2">
                        <span className="text-xs">{getTemplateName(log.template)}</span>
                      </TableCell>
                      <TableCell className="py-2">
                        {getStatusBadge(log.status)}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground py-2">
                        {log.sent_at ? formatDate(log.sent_at) : formatDate(log.created_at)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            
            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4 px-2">
                <div className="text-xs text-muted-foreground">
                  Seite {currentPage} von {totalPages} ({startIndex + 1}-{Math.min(endIndex, emailLogs.length)} von {emailLogs.length})
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => goToPage(1)}
                    disabled={currentPage === 1}
                    className="h-8 px-2"
                  >
                    ««
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="h-8 px-3"
                  >
                    ‹
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="h-8 px-3"
                  >
                    ›
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => goToPage(totalPages)}
                    disabled={currentPage === totalPages}
                    className="h-8 px-2"
                  >
                    »»
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}