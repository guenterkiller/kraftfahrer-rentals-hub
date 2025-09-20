import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
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
  const { toast } = useToast();

  useEffect(() => {
    loadEmailLogs();
  }, []);

  const loadEmailLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('email_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      setEmailLogs(data || []);
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
        return <Badge variant="default" className="bg-green-500">Gesendet</Badge>;
      case 'failed':
        return <Badge variant="destructive">Fehlgeschlagen</Badge>;
      case 'pending':
        return <Badge variant="outline">Ausstehend</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getTemplateName = (template: string) => {
    switch (template) {
      case 'driver_confirmation':
        return 'Fahrer-Bestätigung';
      case 'job_alert':
        return 'Job-Alarm';
      case 'no_show_notice':
        return 'No-Show-Mitteilung';
      case 'fahrer_anfrage':
        return 'Fahrer-Anfrage';
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
      <CardHeader>
        <CardTitle>E-Mail-Logs (letzte 50)</CardTitle>
      </CardHeader>
      <CardContent>
        {emailLogs.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            Keine E-Mail-Logs gefunden.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Empfänger</TableHead>
                  <TableHead>Betreff</TableHead>
                  <TableHead>Template</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Erstellt</TableHead>
                  <TableHead>Gesendet</TableHead>
                  <TableHead>Fehler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {emailLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-mono text-sm">
                      {log.recipient}
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {log.subject}
                    </TableCell>
                    <TableCell>
                      {getTemplateName(log.template)}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(log.status)}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(log.created_at)}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {log.sent_at ? formatDate(log.sent_at) : '-'}
                    </TableCell>
                    <TableCell className="max-w-xs truncate text-sm text-red-600">
                      {log.error_message || '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}