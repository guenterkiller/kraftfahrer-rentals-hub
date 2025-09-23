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
    // Check for existing admin session
    const checkExistingSession = async () => {
      const { data: session } = await supabase.auth.getSession();
      if (session.session) {
        // Check if user has admin role
        try {
          const { data, error } = await supabase.functions.invoke("admin-auth-check", {
            headers: { Authorization: `Bearer ${session.session.access_token}` },
          });
          if (data?.success && !error) {
            navigate("/admin");
          }
        } catch (e) {
          // Session invalid, stay on login page
        }
      }
    };
    checkExistingSession();
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      console.log('Attempting admin login for:', email);
      
      // Use the check-admin-login edge function
      const { data, error } = await supabase.functions.invoke('check-admin-login', {
        body: { email, password }
      });

      if (error || !data?.success) {
        throw new Error(data?.error || "Ungültige Anmeldedaten");
      }

      console.log('Login successful, storing session...');
      
      // Store admin session info
      const sessionData = {
        email: email,
        isAdmin: true,
        loginTime: Date.now()
      };
      
      localStorage.setItem('adminSession', JSON.stringify(sessionData));
      console.log('Session stored:', sessionData);

      toast({ title: "Erfolgreich angemeldet" });
      
      console.log('Navigating to /admin...');
      
      // Force reload after navigation to ensure components re-check localStorage
      setTimeout(() => {
        window.location.href = "/admin";
      }, 500);
      
    } catch (err: any) {
      console.error('Login error:', err);
      toast({ 
        title: "Login fehlgeschlagen", 
        description: err.message || "Ungültige Anmeldedaten", 
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
