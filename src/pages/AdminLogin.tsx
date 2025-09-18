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
    // Check for existing Supabase session
    const checkExistingSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        // Check if user has admin role
        try {
          const { data: isAdmin, error } = await supabase.rpc('is_admin_user');
          if (isAdmin && !error) {
            navigate("/admin");
          }
        } catch (e) {
          // Session invalid or no admin rights
        }
      }
    };
    checkExistingSession();
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      console.log('Attempting Supabase auth for:', email);
      
      // Echte Supabase Authentifizierung
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        throw new Error(error.message);
      }

      console.log('Supabase auth successful');
      
      // Prüfe Admin-Rechte
      const { data: isAdmin, error: adminError } = await supabase.rpc('is_admin_user');
      if (adminError || !isAdmin) {
        await supabase.auth.signOut();
        throw new Error('Kein Admin-Recht');
      }

      // Optional: für UI-Deko localStorage setzen
      localStorage.setItem('admin_email', email);
      console.log('Admin login successful');

      toast({ title: "Erfolgreich angemeldet" });
      
      setTimeout(() => {
        window.location.href = "/admin";
      }, 500);
      
    } catch (err: any) {
      console.error('Login error:', err);
      toast({ 
        title: "Login fehlgeschlagen", 
        description: err.message || "Anmeldung fehlgeschlagen", 
        variant: "destructive" 
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
            />
            <Input 
              type="password" 
              name="password"
              autoComplete="current-password"
              placeholder="Passwort" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
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
