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
        // Get current session from Supabase
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError || !session) {
          setIsAdmin(false);
          return;
        }

        // Verify admin role from database
        const { data: roleData, error: roleError } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', session.user.id)
          .eq('role', 'admin')
          .single();

        if (roleError || !roleData) {
          // User is authenticated but not an admin
          setIsAdmin(false);
          return;
        }

        // Update session activity
        await supabase
          .from('admin_sessions')
          .update({ last_activity: new Date().toISOString() })
          .eq('user_id', session.user.id)
          .eq('is_active', true);

        setIsAdmin(true);
      } catch (error) {
        console.error('Admin check error:', error);
        setIsAdmin(false);
      }
    };

    checkAdminAccess();
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        setIsAdmin(false);
      } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        checkAdminAccess();
      }
    });

    // Periodic session check every 5 minutes
    const sessionCheckInterval = setInterval(checkAdminAccess, 5 * 60 * 1000);
    
    return () => {
      subscription.unsubscribe();
      clearInterval(sessionCheckInterval);
    };
  }, []);

  if (isAdmin === null) {
    return <div className="flex items-center justify-center min-h-screen">Laden...</div>;
  }

  return isAdmin ? children : <Navigate to="/admin/login" replace />;
}