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
        // Get current Supabase session
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError || !sessionData.session) {
          setIsAdmin(false);
          return;
        }

        // Verify admin status with server-side function
        const { data, error } = await supabase.functions.invoke("admin-auth-check", {
          headers: { 
            Authorization: `Bearer ${sessionData.session.access_token}` 
          },
        });

        if (error || !data?.success) {
          console.log('Admin check failed:', error?.message || data?.error);
          setIsAdmin(false);
          return;
        }

        setIsAdmin(true);
      } catch (error) {
        console.error('Admin access check error:', error);
        setIsAdmin(false);
      }
    };

    checkAdminAccess();
    
    // Set up auth state listener for real-time updates
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_OUT' || !session) {
          setIsAdmin(false);
        } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          checkAdminAccess();
        }
      }
    );
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  if (isAdmin === null) {
    // Loading state - you could add a spinner here
    return <div className="flex items-center justify-center min-h-screen">Laden...</div>;
  }

  return isAdmin ? children : <Navigate to="/admin/login" replace />;
}