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
    // Bereits eingeloggt? -> Weiterleiten zum Dashboard
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user?.email) navigate("/admin");
    });
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("check-admin-login", {
        body: { email, password },
      });
      if (error || !data?.success) throw new Error(data?.message || error?.message || "Login fehlgeschlagen");

      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({ email, password });
      if (authError) throw authError;

      toast({ title: "Erfolgreich angemeldet" });
      navigate("/admin");
    } catch (err: any) {
      toast({ title: "Login fehlgeschlagen", description: err.message || "Ungültige Anmeldedaten", variant: "destructive" });
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
