import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

/**
 * Helper hook for admin authentication
 * Provides methods to get session token and handle auth errors
 */
export function useAdminAuth() {
  const navigate = useNavigate();
  const { toast } = useToast();

  /**
   * Get the current session with access token
   * Returns null and redirects to login if no valid session
   */
  const getSessionToken = async (): Promise<string | null> => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error || !session?.access_token) {
        console.error("❌ Admin: Keine gültige Session");
        await forceLogout("Session abgelaufen");
        return null;
      }
      
      return session.access_token;
    } catch (error) {
      console.error("❌ Admin: Session-Fehler:", error);
      await forceLogout("Session-Fehler");
      return null;
    }
  };

  /**
   * Invoke an admin edge function with explicit Authorization header
   */
  const invokeAdminFunction = async <T = any>(
    functionName: string, 
    body: Record<string, any>
  ): Promise<{ data: T | null; error: Error | null }> => {
    const token = await getSessionToken();
    if (!token) {
      return { data: null, error: new Error("Keine gültige Session") };
    }

    try {
      const { data, error } = await supabase.functions.invoke(functionName, {
        body,
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (error) {
        // Check for auth errors
        const errorMsg = error.message || "";
        if (
          errorMsg.includes("401") || 
          errorMsg.includes("Unauthorized") || 
          errorMsg.includes("Invalid token") ||
          errorMsg.includes("non-2xx")
        ) {
          console.error("❌ Admin: Auth-Fehler bei Edge Function:", errorMsg);
          await forceLogout("Session abgelaufen");
          return { data: null, error: new Error("Session abgelaufen") };
        }
        
        return { data: null, error };
      }

      // Check for auth errors in response body
      if (data?.error?.includes("token") || data?.error?.includes("Unauthorized")) {
        await forceLogout("Session abgelaufen");
        return { data: null, error: new Error("Session abgelaufen") };
      }

      return { data, error: null };
    } catch (error) {
      console.error("❌ Admin: Function invoke error:", error);
      return { data: null, error: error as Error };
    }
  };

  /**
   * Force logout - clears all state and redirects to login
   * This ALWAYS works, even with broken session
   */
  const forceLogout = async (reason?: string) => {
    console.log("🚪 Admin: Force logout:", reason);
    
    try {
      // Try to sign out from Supabase (might fail, that's ok)
      await supabase.auth.signOut();
    } catch (e) {
      console.warn("⚠️ Supabase signOut failed:", e);
    }
    
    // Always clear local storage
    try {
      localStorage.removeItem('adminSession');
      localStorage.removeItem('sb-hxnabnsoffzevqhruvar-auth-token');
    } catch (e) {
      console.warn("⚠️ localStorage clear failed:", e);
    }
    
    // Always clear session storage
    try {
      sessionStorage.clear();
    } catch (e) {
      console.warn("⚠️ sessionStorage clear failed:", e);
    }

    if (reason) {
      toast({
        title: "Abgemeldet",
        description: reason,
        variant: "destructive"
      });
    }

    // Always redirect
    navigate('/admin/login', { replace: true });
  };

  return {
    getSessionToken,
    invokeAdminFunction,
    forceLogout
  };
}
