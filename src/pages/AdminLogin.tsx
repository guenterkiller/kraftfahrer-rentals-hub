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
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if already authenticated
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
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
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log('Attempting secure admin login...');
      
      // Sign in with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password: password
      });

      if (authError) {
        console.error('Auth error:', authError);
        toast({
          title: "Anmeldung fehlgeschlagen",
          description: authError.message === "Invalid login credentials" 
            ? "Ungültige E-Mail oder Passwort" 
            : authError.message,
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

      console.log('Auth successful, verifying admin role...');

      // Verify admin role - with self-healing for the known admin
      let { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', authData.user.id)
        .eq('role', 'admin')
        .maybeSingle();

      // Self-healing: If this is the known admin email but role is missing, create it
      const KNOWN_ADMIN_EMAIL = 'guenter.killer@t-online.de';
      if ((!roleData || roleError) && authData.user.email?.toLowerCase() === KNOWN_ADMIN_EMAIL) {
        console.log('Admin role missing for known admin, attempting self-healing...');
        
        // Use the database function to assign admin role (bypasses RLS)
        const { error: assignError } = await supabase.rpc('assign_admin_role', {
          _user_id: authData.user.id
        });

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
        await supabase.auth.signOut();
        toast({
          title: "Zugriff verweigert",
          description: "Sie haben keine Admin-Berechtigung",
          variant: "destructive",
        });
        return;
      }

      console.log('Admin role verified, creating session log...');

      // Log the admin session
      await supabase.from('admin_sessions').insert({
        user_id: authData.user.id,
        ip_address: null, // Could be captured from a server-side function
        user_agent: navigator.userAgent
      });

      toast({
        title: "Erfolgreich angemeldet",
        description: "Willkommen im Admin-Bereich",
      });
      
      console.log('Login successful, navigating to admin...');
      navigate("/admin");
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Fehler beim Anmelden",
        description: "Ein unerwarteter Fehler ist aufgetreten",
        variant: "destructive",
      });
    } finally {
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