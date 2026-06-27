import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface AdminRouteProps {
  children: JSX.Element;
}

export default function AdminRoute({ children }: AdminRouteProps) {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(true);

  const withTimeout = async <T,>(promise: PromiseLike<T>, ms: number, message: string): Promise<T> => {
    let timeoutId: ReturnType<typeof setTimeout>;
    const timeout = new Promise<never>((_, reject) => {
      timeoutId = setTimeout(() => reject(new Error(message)), ms);
    });

    try {
      return await Promise.race([Promise.resolve(promise), timeout]);
    } finally {
      clearTimeout(timeoutId!);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const checkAdminAccess = async () => {
      if (!isMounted) return;
      
      try {
        let { data: { session }, error: sessionError } = await withTimeout(
          supabase.auth.getSession(),
          10000,
          'Zeitüberschreitung bei der Session-Prüfung'
        );
        
        if (!isMounted) return;
        
        const expSec = (session as any)?.expires_at as number | undefined;
        if (session && expSec && expSec * 1000 < Date.now() + 60_000) {
          const { data: refreshed, error: refreshError } = await withTimeout(
            supabase.auth.refreshSession(),
            10000,
            'Zeitüberschreitung beim Session-Refresh'
          );
          if (refreshError || !refreshed?.session) {
            await supabase.auth.signOut().catch(() => {});
            session = null;
          } else {
            session = refreshed.session;
          }
        }

        if (sessionError || !session) {
          setIsAdmin(false);
          setIsChecking(false);
          return;
        }

        const { data: roleData, error: roleError } = await withTimeout(
          supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', session.user.id)
            .eq('role', 'admin')
            .single(),
          10000,
          'Zeitüberschreitung bei der Admin-Rollenprüfung'
        );

        if (!isMounted) return;

        if (roleError || !roleData) {
          setIsAdmin(false);
          setIsChecking(false);
          return;
        }

        // Update session activity (fire and forget)
        supabase
          .from('admin_sessions')
          .update({ last_activity: new Date().toISOString() })
          .eq('user_id', session.user.id)
          .eq('is_active', true)
          .then(() => {});

        setIsAdmin(true);
        setIsChecking(false);
      } catch (error) {
        console.error('Admin check error:', error);
        if (isMounted) {
          setIsAdmin(false);
          setIsChecking(false);
        }
      }
    };

    checkAdminAccess();
    
    return () => {
      isMounted = false;
    };
  }, []);

  if (isChecking) {
    return <div className="flex items-center justify-center min-h-screen">Laden...</div>;
  }

  return isAdmin ? children : <Navigate to="/admin/login" replace />;
}