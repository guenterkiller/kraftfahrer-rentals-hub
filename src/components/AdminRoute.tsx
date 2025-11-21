import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface AdminRouteProps {
  children: JSX.Element;
}

export default function AdminRoute({ children }: AdminRouteProps) {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const checkAdminAccess = async () => {
      if (!isMounted) return;
      
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (!isMounted) return;
        
        if (sessionError || !session) {
          setIsAdmin(false);
          setIsChecking(false);
          return;
        }

        const { data: roleData, error: roleError } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', session.user.id)
          .eq('role', 'admin')
          .single();

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