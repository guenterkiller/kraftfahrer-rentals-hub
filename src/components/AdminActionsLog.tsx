import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { de } from 'date-fns/locale';
import { Mail, CheckCircle, XCircle } from 'lucide-react';

interface AdminAction {
  id: string;
  action: string;
  job_id: string | null;
  assignment_id: string | null;
  admin_email: string;
  note: string | null;
  created_at: string;
}

export function AdminActionsLog() {
  const [actions, setActions] = useState<AdminAction[]>([]);
  const [loading, setLoading] = useState(true);
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
                {actions.map((action) => (
                  <TableRow key={action.id}>
                    <TableCell>
                      {getActionBadge(action.action)}
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
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}