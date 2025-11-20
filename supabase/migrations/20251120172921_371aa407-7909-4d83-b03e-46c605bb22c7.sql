-- Create page_views table for analytics (admin only)
CREATE TABLE IF NOT EXISTS public.page_views (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  route TEXT NOT NULL,
  user_agent TEXT,
  referrer TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;

-- Public can insert page views (for tracking)
CREATE POLICY "Anyone can log page views"
  ON public.page_views
  FOR INSERT
  WITH CHECK (true);

-- Only admins can read analytics
CREATE POLICY "Only admins can view page views"
  ON public.page_views
  FOR SELECT
  USING (is_admin_user());

-- Create indexes for better query performance
CREATE INDEX idx_page_views_route ON public.page_views(route);
CREATE INDEX idx_page_views_created_at ON public.page_views(created_at DESC);

-- Create web_vitals table for Core Web Vitals
CREATE TABLE IF NOT EXISTS public.web_vitals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  route TEXT NOT NULL,
  metric_name TEXT NOT NULL,
  metric_value NUMERIC NOT NULL,
  rating TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.web_vitals ENABLE ROW LEVEL SECURITY;

-- Public can insert vitals (for tracking)
CREATE POLICY "Anyone can log web vitals"
  ON public.web_vitals
  FOR INSERT
  WITH CHECK (true);

-- Only admins can read vitals
CREATE POLICY "Only admins can view web vitals"
  ON public.web_vitals
  FOR SELECT
  USING (is_admin_user());

-- Create indexes
CREATE INDEX idx_web_vitals_route ON public.web_vitals(route);
CREATE INDEX idx_web_vitals_metric ON public.web_vitals(metric_name);
CREATE INDEX idx_web_vitals_created_at ON public.web_vitals(created_at DESC);