import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { de } from 'date-fns/locale';
import { Mail, CheckCircle, XCircle, ChevronDown, ChevronRight } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface AdminAction {
  id: string;
  action: string;
  job_id: string | null;
  assignment_id: string | null;
  admin_email: string;
  note: string | null;
  created_at: string;
}

interface EmailRecipient {
  email: string;
  driver_snapshot: {
    vorname: string;
    nachname: string;
    email: string;
  };
  status: string;
}

export function AdminActionsLog() {
  const [actions, setActions] = useState<AdminAction[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [emailRecipients, setEmailRecipients] = useState<Record<string, EmailRecipient[]>>({});
  const { toast } = useToast();

  useEffect(() => {
    loadAdminActions();
  }, []);

  const loadAdminActions = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('admin_actions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setActions(data || []);
    } catch (error) {
      console.error('Error loading admin actions:', error);
      toast({
        title: "Fehler beim Laden der Admin-Aktivitäten",
        description: "Die Admin-Aktivitäten konnten nicht geladen werden.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadEmailRecipients = async (jobId: string) => {
    if (emailRecipients[jobId]) return; // Already loaded

    try {
      const adminSession = localStorage.getItem('adminSession');
      if (!adminSession) return;
      
      const session = JSON.parse(adminSession);
      
      const { data, error } = await supabase.functions.invoke('admin-data-fetch', {
        body: {
          email: session.email,
          dataType: 'emails'
        }
      });

      if (error) throw error;
      
      // Filter emails for this specific job
      const jobEmails = (data?.data || []).filter((log: any) => 
        log.job_id === jobId && log.template === 'job-broadcast'
      );
      
      // If no emails found in database (old broadcasts), show all approved drivers
      let recipients: EmailRecipient[] = [];
      
      if (jobEmails.length === 0) {
        // For old broadcasts without email logs, fetch approved drivers
        const { data: driversData } = await supabase.functions.invoke('admin-data-fetch', {
          body: {
            email: session.email,
            dataType: 'fahrer'
          }
        });
        
        const approvedDrivers = (driversData?.data || []).filter((d: any) => d.status === 'approved');
        recipients = approvedDrivers.map((driver: any) => ({
          email: driver.email,
          driver_snapshot: { 
            vorname: driver.vorname, 
            nachname: driver.nachname, 
            email: driver.email 
          },
          status: 'sent' // Assume sent for old broadcasts
        }));
      } else {
        // Use actual email log data
        recipients = jobEmails.map((log: any) => ({
          email: log.recipient,
          driver_snapshot: { 
            vorname: log.recipient.split('@')[0], 
            nachname: '', 
            email: log.recipient 
          },
          status: log.status
        }));
      }
      
      setEmailRecipients(prev => ({ ...prev, [jobId]: recipients }));
    } catch (error) {
      console.error('Error loading email recipients:', error);
    }
  };

  const toggleRow = async (actionId: string, jobId: string | null) => {
    const newExpanded = new Set(expandedRows);
    if (expandedRows.has(actionId)) {
      newExpanded.delete(actionId);
    } else {
      newExpanded.add(actionId);
      if (jobId) {
        await loadEmailRecipients(jobId);
      }
    }
    setExpandedRows(newExpanded);
  };

  const getActionBadge = (action: string) => {
    if (action.includes('broadcast')) {
      return <Badge variant="default" className="bg-blue-500"><Mail className="w-3 h-3 mr-1" /> Broadcast</Badge>;
    }
    if (action.includes('assign')) {
      return <Badge variant="default" className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" /> Zuweisung</Badge>;
    }
    if (action.includes('no_show')) {
      return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" /> No-Show</Badge>;
    }
    if (action.includes('confirm')) {
      return <Badge variant="default" className="bg-emerald-500"><CheckCircle className="w-3 h-3 mr-1" /> Bestätigung</Badge>;
    }
    return <Badge variant="secondary">{action}</Badge>;
  };

  const formatDate = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), { 
      addSuffix: true, 
      locale: de 
    });
  };

  const getActionDescription = (action: AdminAction) => {
    if (action.action === 'job_broadcast_completed' && action.note) {
      // Parse "Broadcast sent to 11 drivers, 0 failed"
      const match = action.note.match(/(\d+) drivers?, (\d+) failed/);
      if (match) {
        const sent = parseInt(match[1]);
        const failed = parseInt(match[2]);
        return (
          <div className="flex items-center gap-2">
            <span className="text-green-600 font-medium">{sent} gesendet</span>
            {failed > 0 && <span className="text-red-600 font-medium">{failed} fehlgeschlagen</span>}
          </div>
        );
      }
    }
    return action.note || '-';
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Admin-Aktivitäten</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">Lade Admin-Aktivitäten...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Admin-Aktivitäten (letzte 50)</CardTitle>
        <Button 
          variant="outline" 
          size="sm"
          onClick={loadAdminActions}
          disabled={loading}
        >
          {loading ? 'Lädt...' : 'Aktualisieren'}
        </Button>
      </CardHeader>
      <CardContent>
        {actions.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            Keine Admin-Aktivitäten gefunden.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Aktion</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead>Admin</TableHead>
                  <TableHead>Zeitpunkt</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {actions.map((action) => {
                  const isBroadcast = action.action === 'job_broadcast_completed';
                  const isExpanded = expandedRows.has(action.id);
                  const recipients = action.job_id ? emailRecipients[action.job_id] : [];

                  return (
                    <React.Fragment key={action.id}>
                      <TableRow className={isBroadcast ? 'cursor-pointer hover:bg-muted/50' : ''}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {isBroadcast && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0"
                                onClick={() => toggleRow(action.id, action.job_id)}
                              >
                                {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                              </Button>
                            )}
                            {getActionBadge(action.action)}
                          </div>
                        </TableCell>
                        <TableCell className="max-w-md">
                          {getActionDescription(action)}
                        </TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground">
                          {action.admin_email}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                          {formatDate(action.created_at)}
                        </TableCell>
                      </TableRow>
                      {isBroadcast && isExpanded && (
                        <TableRow>
                          <TableCell colSpan={4} className="bg-muted/30 p-4">
                            <div className="space-y-2">
                              <h4 className="font-semibold text-sm mb-3">Empfänger ({recipients.length}):</h4>
                              {recipients.length === 0 ? (
                                <p className="text-sm text-muted-foreground">Lade E-Mail-Adressen...</p>
                              ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                                  {recipients.map((recipient, idx) => (
                                    <div key={idx} className="flex items-center gap-2 text-sm p-2 bg-background rounded border">
                                      {recipient.status === 'sent' ? (
                                        <CheckCircle className="h-4 w-4 text-green-500" />
                                      ) : (
                                        <XCircle className="h-4 w-4 text-red-500" />
                                      )}
                                      <div className="flex-1 min-w-0">
                                        <div className="font-medium truncate">
                                          {recipient.driver_snapshot?.vorname} {recipient.driver_snapshot?.nachname}
                                        </div>
                                        <div className="text-xs text-muted-foreground truncate">
                                          {recipient.email}
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}