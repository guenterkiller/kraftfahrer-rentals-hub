-- Fix RLS policies that were dropped when CASCADE was used
-- Recreate all essential RLS policies

-- Job requests policies
CREATE POLICY "Only admins can view job requests" ON public.job_requests
FOR SELECT USING (public.is_admin_user());

CREATE POLICY "Only admins can update job requests" ON public.job_requests  
FOR UPDATE USING (public.is_admin_user());

-- Job assignments policies
CREATE POLICY "Admins can manage job assignments" ON public.job_assignments
FOR ALL USING (public.is_admin_user()) WITH CHECK (public.is_admin_user());

-- Fahrer profile policies
CREATE POLICY "Admins can view all driver profiles" ON public.fahrer_profile
FOR SELECT USING (public.is_admin_user());

CREATE POLICY "Admins can update driver profiles and status" ON public.fahrer_profile
FOR UPDATE USING (public.is_admin_user()) WITH CHECK (public.is_admin_user());

CREATE POLICY "Admins can delete driver profiles" ON public.fahrer_profile
FOR DELETE USING (public.is_admin_user());

-- Email log policies
CREATE POLICY "Admins can view email logs" ON public.email_log
FOR SELECT USING (public.is_admin_user());

-- Admin actions policies
CREATE POLICY "admin_actions_admin_select" ON public.admin_actions
FOR SELECT USING (public.is_admin_user());

CREATE POLICY "admin_actions_admin_insert" ON public.admin_actions
FOR INSERT WITH CHECK (public.is_admin_user());

-- Admin settings policies
CREATE POLICY "admin_settings_admin_select" ON public.admin_settings
FOR SELECT USING (public.is_admin_user());

CREATE POLICY "admin_settings_admin_insert" ON public.admin_settings
FOR INSERT WITH CHECK (public.is_admin_user());

CREATE POLICY "admin_settings_admin_update" ON public.admin_settings
FOR UPDATE USING (public.is_admin_user()) WITH CHECK (public.is_admin_user());

CREATE POLICY "admin_settings_admin_delete" ON public.admin_settings
FOR DELETE USING (public.is_admin_user());

-- User roles policy
CREATE POLICY "user_roles_select" ON public.user_roles
FOR SELECT USING (public.is_admin_user());

-- Job alarm policies  
CREATE POLICY "Only admins can view job alert subscriptions" ON public.jobalarm_fahrer
FOR SELECT USING (public.is_admin_user());

CREATE POLICY "Only admins can delete job alert subscriptions" ON public.jobalarm_fahrer
FOR DELETE USING (public.is_admin_user());

CREATE POLICY "Only admins can view driver responses" ON public.jobalarm_antworten
FOR SELECT USING (public.is_admin_user());

-- Fahrer dokumente policy
CREATE POLICY "Only admins can view driver documents" ON public.fahrer_dokumente
FOR SELECT USING (public.is_admin_user());

-- Feature flags policies
CREATE POLICY "feature_flags_admin_select" ON public.feature_flags
FOR SELECT USING (public.is_admin_user());

CREATE POLICY "feature_flags_admin_insert" ON public.feature_flags
FOR INSERT WITH CHECK (public.is_admin_user());

CREATE POLICY "feature_flags_admin_update" ON public.feature_flags
FOR UPDATE USING (public.is_admin_user()) WITH CHECK (public.is_admin_user());

CREATE POLICY "feature_flags_admin_delete" ON public.feature_flags
FOR DELETE USING (public.is_admin_user());