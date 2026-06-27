import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useSEO } from "@/hooks/useSEO";

const AdminLogin = () => {
  useSEO({
    title: "Admin Login | Fahrerexpress",
    description: "Anmeldung für den geschützten Admin-Bereich.",
    noindex: true,
  });

  const navigate = useNavigate();
  const { toast, dismiss } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Clear stale admin-page loading errors after redirects to login.
    dismiss();

    // Check if already authenticated
    const checkAuth = async () => {
      let { data: { session } } = await supabase.auth.getSession();

      const expSec = (session as any)?.expires_at as number | undefined;
      if (session && expSec && expSec * 1000 < Date.now() + 60_000) {
        const { data } = await supabase.auth.refreshSession();
        session = data.session;
      }

      if (session) {
        // Verify admin role
        const { data: roles } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', session.user.id)
          .eq('role', 'admin')
          .single();
        
        if (roles) {
          navigate("/admin");
        }
      }
    };
    
    checkAuth();
  }, [dismiss, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log('[LOGIN 1] vor signInWithPassword');
      let authData: any = null;
      let authError: any = null;
      try {
        const res = await supabase.auth.signInWithPassword({
          email: email.trim().toLowerCase(),
          password: password,
        });
        authData = res.data;
        authError = res.error;
      } catch (err) {
        console.error('[LOGIN 2-CATCH] signInWithPassword throw:', err);
        authError = err;
      }
      console.log('[LOGIN 2] nach signInWithPassword', { hasUser: !!authData?.user, hasSession: !!authData?.session, authError });

      if (authError) {
        console.error('Auth error:', authError);
        toast({
          title: "Anmeldung fehlgeschlagen",
          description: authError?.message === "Invalid login credentials" 
            ? "Ungültige E-Mail oder Passwort" 
            : authError?.message ?? 'Unbekannter Fehler',
          variant: "destructive",
        });
        return;
      }

      if (!authData.session) {
        toast({
          title: "Anmeldung fehlgeschlagen",
          description: "Keine Session erstellt",
          variant: "destructive",
        });
        return;
      }

      console.log('[LOGIN 3] vor Rollenprüfung (user_roles select)');

      // Verify admin role - with self-healing for the known admin
      // Timeout-Schutz, damit der Button nicht dauerhaft auf "Anmelden..." hängt
      const roleQuery = supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', authData.user.id)
        .eq('role', 'admin')
        .maybeSingle();

      const timeoutPromise = new Promise<{ data: null; error: { message: string } }>((resolve) =>
        setTimeout(
          () => resolve({ data: null, error: { message: 'Zeitüberschreitung bei der Rollenprüfung' } }),
          10000
        )
      );

      let roleData: any = null;
      let roleError: any = null;
      try {
        const raceRes = (await Promise.race([roleQuery, timeoutPromise])) as any;
        roleData = raceRes?.data;
        roleError = raceRes?.error;
      } catch (err) {
        console.error('[LOGIN 4-CATCH] Rollenprüfung throw:', err);
        roleError = err;
      }
      console.log('[LOGIN 4] nach Rollenprüfung', { roleData, roleError });

      // Self-healing: If this is the known admin email but role is missing, create it
      const KNOWN_ADMIN_EMAIL = 'guenter.killer@t-online.de';
      if ((!roleData || roleError) && authData.user.email?.toLowerCase() === KNOWN_ADMIN_EMAIL) {
        console.log('[LOGIN 5] vor assign_admin_role RPC (self-healing)');
        let assignError: any = null;
        try {
          const res = await supabase.rpc('assign_admin_role', { _user_id: authData.user.id });
          assignError = res.error;
        } catch (err) {
          console.error('[LOGIN 6-CATCH] assign_admin_role throw:', err);
          assignError = err;
        }
        console.log('[LOGIN 6] nach assign_admin_role', { assignError });

        if (!assignError) {
          console.log('✅ Self-healing: Admin role assigned successfully');
          roleData = { role: 'admin' };
          roleError = null;
        } else {
          console.error('Self-healing failed:', assignError);
        }
      }

      if (roleError || !roleData) {
        console.error('Role verification failed:', roleError);
        // User is authenticated but not an admin
        console.log('[LOGIN 7] vor signOut (kein Admin)');
        try { await supabase.auth.signOut(); } catch (err) { console.error('[LOGIN 7-CATCH] signOut throw:', err); }
        console.log('[LOGIN 8] nach signOut');
        toast({
          title: "Zugriff verweigert",
          description: "Sie haben keine Admin-Berechtigung",
          variant: "destructive",
        });
        return;
      }

      console.log('[LOGIN 9] Admin verifiziert, navigate → /admin');

      // Log the admin session (fire-and-forget – darf Navigation nicht blockieren)
      void supabase
        .from('admin_sessions')
        .insert({
          user_id: authData.user.id,
          ip_address: null, // Could be captured from a server-side function
          user_agent: navigator.userAgent,
        })
        .then(({ error }) => {
          if (error) {
            console.warn('admin_sessions insert failed (non-blocking):', error.message);
          }
        });

      toast({
        title: "Erfolgreich angemeldet",
        description: "Willkommen im Admin-Bereich",
      });
      
      console.log('[LOGIN 10] navigate("/admin") aufgerufen');
      navigate("/admin");
    } catch (error) {
      console.error('[LOGIN OUTER-CATCH] Login error:', error);
      toast({
        title: "Fehler beim Anmelden",
        description: "Ein unerwarteter Fehler ist aufgetreten",
        variant: "destructive",
      });
    } finally {
      console.log('[LOGIN FINALLY] setLoading(false)');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gray-50">
      {/* Link zur Startseite */}
      <div className="absolute top-4 left-4">
        <Button variant="outline" asChild>
          <Link to="/">← Zur Startseite</Link>
        </Button>
      </div>
      
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">Admin Login</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <Input 
              type="email" 
              name="email"
              autoComplete="username"
              placeholder="E-Mail" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
              disabled={loading}
            />
            <Input 
              type="password" 
              name="password"
              autoComplete="current-password"
              placeholder="Passwort" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
              disabled={loading}
            />
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Anmelden..." : "Anmelden"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLogin;