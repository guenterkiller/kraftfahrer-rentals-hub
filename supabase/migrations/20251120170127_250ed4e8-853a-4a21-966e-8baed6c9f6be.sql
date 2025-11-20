-- Create page_views table for simple analytics
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

-- Create index for better query performance
CREATE INDEX idx_page_views_route ON public.page_views(route);
CREATE INDEX idx_page_views_created_at ON public.page_views(created_at DESC);