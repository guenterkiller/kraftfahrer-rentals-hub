import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
      const { data, error } = await supabase.functions.invoke("check-admin-login", {
        body: { email, password }
      });
      
      if (error || !data?.success) {
        console.error('Admin login failed:', error || data?.error);
        throw new Error(data?.error || "Ungültige Anmeldedaten");
      }

      // Store admin session info
      localStorage.setItem('adminSession', JSON.stringify({
        email: email,
        isAdmin: true,
        loginTime: Date.now()
      }));

      toast({ title: "Erfolgreich angemeldet" });
      navigate("/admin");
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
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">Admin Login</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <Input 
              type="email" 
              placeholder="E-Mail" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
            />
            <Input 
              type="password" 
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
