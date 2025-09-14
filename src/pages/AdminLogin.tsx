import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase, SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } from "@/integrations/supabase/client";
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

  const envOk = Boolean(SUPABASE_URL && SUPABASE_PUBLISHABLE_KEY);

  useEffect(() => {
    // Check for existing admin session
    const adminSession = localStorage.getItem('adminSession');
    if (adminSession) {
      try {
        const session = JSON.parse(adminSession);
        // Check if session is less than 24 hours old
        if (Date.now() - session.loginTime < 24 * 60 * 60 * 1000) {
          navigate("/admin");
        } else {
          localStorage.removeItem('adminSession');
        }
      } catch (e) {
        localStorage.removeItem('adminSession');
      }
    }
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      console.log('Attempting admin login for:', email);
      
      const { data, error } = await supabase.functions.invoke("check-admin-login", {
        body: { email, password },
      });
      
      console.log('Edge function response:', { data, error });
      
      if (error) {
        console.error('Edge function error:', error);
        throw new Error(error.message || "Verbindungsfehler zum Server");
      }
      
      if (!data?.success) {
        console.error('Login failed:', data?.error);
        throw new Error(data?.error || "Login fehlgeschlagen");
      }

      // Speichere Admin-Session im localStorage (da kein Supabase Auth User)
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
    <div className="min-h-screen flex flex-col bg-gray-50">
      <div className={`w-full text-xs md:text-sm border-b px-3 py-2 ${envOk ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
        {envOk ? '✅ Supabase ENV: konfiguriert' : '❌ Supabase Config fehlt'}
        <span className="ml-2">URL: {SUPABASE_URL ? 'gesetzt' : 'leer'} | ANON: {SUPABASE_PUBLISHABLE_KEY ? 'gesetzt' : 'leer'}</span>
      </div>

      <div className="flex-1 flex items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Admin Login</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <Input type="email" placeholder="E-Mail" value={email} onChange={(e) => setEmail(e.target.value)} required />
              <Input type="password" placeholder="Passwort" value={password} onChange={(e) => setPassword(e.target.value)} required />
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Anmelden..." : "Anmelden"}
              </Button>
              {!envOk && (
                <p className="text-xs text-red-600 mt-2">
                  Hinweis: In Lovable werden keine .env-Dateien genutzt. Die Supabase Publishable Keys dürfen im Frontend liegen. Stellen Sie sicher, dass die Auth-URLs im Supabase-Dashboard korrekt konfiguriert sind.
                </p>
              )}
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminLogin;
