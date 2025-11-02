import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";
import { de } from "date-fns/locale";

interface JobInvitesStatusProps {
  jobId: string;
}

interface InviteWithDriver {
  id: string;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  responded_at: string | null;
  token_expires_at: string;
  created_at: string;
  driver: {
    vorname: string;
    nachname: string;
    email: string;
    telefon: string;
  } | null;
}

export const JobInvitesStatus = ({ jobId }: JobInvitesStatusProps) => {
  const { data: invites, isLoading, error } = useQuery({
    queryKey: ['job-invites', jobId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('assignment_invites')
        .select(`
          id,
          status,
          responded_at,
          token_expires_at,
          created_at,
          driver:fahrer_profile(vorname, nachname, email, telefon)
        `)
        .eq('job_id', jobId)
        .order('responded_at', { ascending: false, nullsFirst: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as InviteWithDriver[];
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const getStatusBadge = (status: string, expiresAt: string) => {
    const isExpired = new Date(expiresAt) < new Date();
    
    if (status === 'accepted') {
      return <Badge className="bg-green-500 hover:bg-green-600">✅ Angenommen</Badge>;
    }
    if (status === 'declined') {
      return <Badge variant="destructive">❌ Abgelehnt</Badge>;
    }
    if (status === 'expired' || isExpired) {
      return <Badge variant="secondary">⏱️ Abgelaufen</Badge>;
    }
    return <Badge variant="outline">⏳ Ausstehend</Badge>;
  };

  const getTimeInfo = (invite: InviteWithDriver) => {
    if (invite.responded_at) {
      return `Beantwortet ${formatDistanceToNow(new Date(invite.responded_at), { 
        addSuffix: true, 
        locale: de 
      })}`;
    }
    
    const expiresAt = new Date(invite.token_expires_at);
    const now = new Date();
    
    if (expiresAt < now) {
      return `Abgelaufen ${formatDistanceToNow(expiresAt, { addSuffix: true, locale: de })}`;
    }
    
    return `Läuft ab ${formatDistanceToNow(expiresAt, { addSuffix: true, locale: de })}`;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Einladungsstatus</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Einladungsstatus</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-destructive">
            Fehler beim Laden der Einladungen: {error.message}
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!invites || invites.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Einladungsstatus</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Noch keine Einladungen verschickt.
          </p>
        </CardContent>
      </Card>
    );
  }

  const stats = {
    total: invites.length,
    accepted: invites.filter(i => i.status === 'accepted').length,
    declined: invites.filter(i => i.status === 'declined').length,
    pending: invites.filter(i => i.status === 'pending' && new Date(i.token_expires_at) > new Date()).length,
    expired: invites.filter(i => i.status === 'expired' || (i.status === 'pending' && new Date(i.token_expires_at) < new Date())).length,
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Einladungsstatus ({invites.length} Fahrer)</CardTitle>
        <div className="flex gap-4 mt-2 text-sm">
          <span className="text-green-600 font-medium">✅ {stats.accepted} Angenommen</span>
          <span className="text-red-600 font-medium">❌ {stats.declined} Abgelehnt</span>
          <span className="text-blue-600 font-medium">⏳ {stats.pending} Ausstehend</span>
          <span className="text-gray-600 font-medium">⏱️ {stats.expired} Abgelaufen</span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {invites.map((invite) => (
            <div 
              key={invite.id}
              className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <div>
                    <p className="font-medium">
                      {invite.driver ? 
                        `${invite.driver.vorname} ${invite.driver.nachname}` : 
                        'Fahrer gelöscht'
                      }
                    </p>
                    {invite.driver && (
                      <div className="text-sm text-muted-foreground">
                        <span>{invite.driver.email}</span>
                        <span className="mx-2">•</span>
                        <span>{invite.driver.telefon}</span>
                      </div>
                    )}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {getTimeInfo(invite)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {getStatusBadge(invite.status, invite.token_expires_at)}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
