import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface AdminRouteProps {
  children: JSX.Element;
}

export default function AdminRoute({ children }: AdminRouteProps) {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAdminAccess = async () => {
      try {
        // Prüfe echte Supabase Session
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          setIsAdmin(false);
          return;
        }

        // Prüfe Admin-Rechte über RPC
        const { data: isAdminRPC, error } = await supabase.rpc('is_admin_user');
        console.log('AdminRoute check - Session:', !!session, 'isAdmin:', isAdminRPC, 'error:', error);
        
        if (error) {
          console.error('Admin RPC error:', error);
          setIsAdmin(false);
          return;
        }

        setIsAdmin(isAdminRPC === true);
        
      } catch (error) {
        console.error('Admin check error:', error);
        setIsAdmin(false);
      }
    };

    checkAdminAccess();
    
    // Regelmäßige Session-Überprüfung alle 5 Minuten
    const sessionCheckInterval = setInterval(checkAdminAccess, 5 * 60 * 1000);
    
    return () => {
      clearInterval(sessionCheckInterval);
    };
  }, []);

  if (isAdmin === null) {
    // Loading state - you could add a spinner here
    return <div className="flex items-center justify-center min-h-screen">Laden...</div>;
  }

  return isAdmin ? children : <Navigate to="/admin/login" replace />;
}