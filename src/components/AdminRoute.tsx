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
        const { data: session } = await supabase.auth.getSession();
        const token = session.session?.access_token;
        
        if (!token) {
          setIsAdmin(false);
          return;
        }

        const { data, error } = await supabase.functions.invoke("admin-auth-check", {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        setIsAdmin(!!data?.success && !error);
      } catch (error) {
        console.error('Admin check error:', error);
        setIsAdmin(false);
      }
    };

    checkAdminAccess();
  }, []);

  if (isAdmin === null) {
    // Loading state - you could add a spinner here
    return <div className="flex items-center justify-center min-h-screen">Laden...</div>;
  }

  return isAdmin ? children : <Navigate to="/admin/login" replace />;
}