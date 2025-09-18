import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface AdminRouteProps {
  children: JSX.Element;
}

export default function AdminRoute({ children }: AdminRouteProps) {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAdminAccess = () => {
      try {
        // Check localStorage for admin session
        const adminSession = localStorage.getItem('adminSession');
        if (adminSession) {
          const session = JSON.parse(adminSession);
          const isValidSession = session.isAdmin && 
                               session.email === "guenter.killer@t-online.de" &&
                               (Date.now() - session.loginTime) < 7 * 24 * 60 * 60 * 1000; // 7 Tage statt 24 Stunden
          
          if (isValidSession) {
            // Session aktualisieren um automatische Verlängerung zu ermöglichen
            session.loginTime = Date.now();
            localStorage.setItem('adminSession', JSON.stringify(session));
          }
          
          setIsAdmin(isValidSession);
        } else {
          setIsAdmin(false);
        }
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